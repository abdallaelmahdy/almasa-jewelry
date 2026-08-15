# ALMASA JEWELRY - DEPLOYMENT RUNBOOK

This runbook documents the deployment, configuration, and operational procedures for the Almasa Jewelry Enterprise POS and ERP system.

> [!WARNING]
> This runbook explicitly distinguishes between **CURRENTLY IMPLEMENTED** features (code and scripts that exist in the repository) and **RECOMMENDED FOR PRODUCTION** infrastructure (external tools and setups you must provide on your hosting environment).

---

## 1. System Prerequisites

### Required (Currently Implemented logic depends on these):
- **OS**: Linux (Ubuntu 22.04 LTS recommended) or Windows Server
- **Python**: 3.11+
- **Node.js**: 20.x+ (LTS recommended)
- **Database**: PostgreSQL 14+

### Recommended for Production (Not included in repo):
- **Process Managers**: `pm2` (for Node.js) and `systemd` / `supervisor` (for FastAPI/Uvicorn)
- **Reverse Proxy**: Nginx or Caddy
- **SSL/TLS**: Let's Encrypt (Certbot)
- **Containerization**: Docker / Docker Compose (The repository currently runs natively; you may containerize it if desired).

---

## 2. Repository Setup

1. Clone the repository to the production server:
   ```bash
   git clone <repository_url> almasa-jewelry
   cd almasa-jewelry
   ```

2. Setup Backend Environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Setup Frontend Environment:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 3. Environment Variables

You must create `.env` files in both the frontend and backend directories. Do NOT commit these to version control.

### Backend (`backend/.env`)
```ini
# REQUIRED
DATABASE_URL="postgresql://username:secure_password@localhost:5432/almasa_jewelry"
SECRET_KEY="generate_a_secure_random_string_here_do_not_use_default"
ENVIRONMENT="production"
PORT=8000
```

### Frontend (`frontend/.env.local`)
```ini
# REQUIRED
NEXT_PUBLIC_API_URL="https://yourdomain.com/api/v1" # Or http://localhost:8000/api/v1 for local testing
```

---

## 4. Database Creation

Connect to PostgreSQL as a superuser and create the production database:

```sql
CREATE DATABASE almasa_jewelry;
CREATE USER almasa WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE almasa_jewelry TO almasa;
-- For PostgreSQL 15+:
\c almasa_jewelry
GRANT ALL ON SCHEMA public TO almasa;
```

---

## 5. Alembic Migrations

Run database migrations to initialize the schema. **(Currently Implemented)**

```bash
cd backend
source venv/bin/activate
export DATABASE_URL="postgresql://username:secure_password@localhost:5432/almasa_jewelry"
python -m alembic upgrade head
```

---

## 6. Initial Admin Bootstrap

Provide initial access to the system without modifying source code or manually editing the database. **(Currently Implemented)**

```bash
cd backend
source venv/bin/activate
export DATABASE_URL="postgresql://username:secure_password@localhost:5432/almasa_jewelry"
python scripts/create_super_admin.py
```
*Follow the interactive prompts to safely generate a hashed super admin account.*

---

## 7. Backend Startup

### Local / Testing (Currently Implemented)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Recommended for Production
Run FastAPI behind Gunicorn with Uvicorn workers, managed by `systemd`.
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
```

---

## 8. Frontend Build & Startup

### Build Step (Required)
```bash
cd frontend
npm run build
```

### Start Step
```bash
# Local/Testing
npm run start -p 3000

# Recommended for Production (using PM2)
pm2 start npm --name "almasa-frontend" -- run start -- -p 3000
```

---

## 9. Reverse Proxy Expectations (Recommended for Production)

Configure Nginx to route traffic to the frontend and backend securely.

```nginx
server {
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 10. HTTPS Expectations (Recommended for Production)

Do not run this system in production without HTTPS. Use Certbot to secure your Nginx configuration automatically:

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 11. Health Checks

- **Backend Health Check:** `GET /api/v1/health`
  - Ensure this returns `{"status": "healthy"}`.
- **Frontend Health Check:** Verify `GET /` returns HTTP 200.

---

## 12. Logging (Recommended for Production)

The backend natively outputs to `stdout`. For production:
- Route `stdout` to `/var/log/almasa/backend.log` using your process manager (`systemd`).
- Configure log rotation (`logrotate`) to prevent disk exhaustion.

---

## 13. Backup Recommendations (Recommended for Production)

Schedule daily automated backups using a cron job.

```bash
# Example backup script using pg_dump
pg_dump -U almasa -h localhost -F c -f /backups/almasa_$(date +%Y%m%d).dump almasa_jewelry
```
*Store these backups securely off-site.*

---

## 14. Restore Procedure

To restore the system from a `.dump` file in the event of catastrophic failure:

```bash
# Drop existing DB and recreate
dropdb -U postgres almasa_jewelry
createdb -U postgres almasa_jewelry

# Restore schema and data
pg_restore -U almasa -h localhost -d almasa_jewelry -1 /backups/almasa_YYYYMMDD.dump
```

---

## 15. Rollback Procedure

If a new deployment causes critical failures:
1. Stop backend and frontend services.
2. `git checkout <previous_stable_tag>`
3. Run backend `alembic downgrade -1` (if the update included a schema change that caused the issue).
4. Rebuild frontend: `npm run build`.
5. Restart services.

---

## 16. Security Checklist

- [ ] `SECRET_KEY` is completely random and secure.
- [ ] Database credentials are secure and not default.
- [ ] PostgreSQL is NOT exposed to the public internet (bind to `localhost` or internal VPC).
- [ ] HTTPS is active and HTTP traffic forces a 301 redirect to HTTPS.
- [ ] No `.env` files are checked into version control.
- [ ] The `create_super_admin.py` script was used securely and default credentials were avoided.

---

## 17. Operational Troubleshooting

- **502 Bad Gateway**: Nginx is running, but Next.js or Uvicorn is down. Check `pm2 status` or `systemctl status`.
- **Database Locks**: If a transaction hangs, locate and terminate using:
  `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'almasa_jewelry' AND pid <> pg_backend_pid();`
- **Login Failing after deployment**: Verify `NEXT_PUBLIC_API_URL` exactly matches the backend origin (including `https://`) to avoid CORS failures.
