# Development & Deployment Architecture

## Local Development Environment
The project relies on **Docker & Docker Compose** for a seamless, reproducible local development experience.

### Architecture Services
- `db`: PostgreSQL 16+ database container with persistent local volume.
- `backend`: FastAPI server running with hot-reload via Uvicorn.
- `frontend`: Next.js development server running with hot-reload.

Developers can start the entire stack using a single command (e.g., `docker compose up -d`), ensuring environment parity across the team.

## Testing Strategy
- **Unit & Integration Tests**: Executed in the backend via `pytest`. Focuses heavily on the Pricing Engine, Inventory Ledger integrity, and Atomic Transactions.
- **Database Migrations**: Alembic scripts are used to track and apply database changes securely.

## Deployment Handoff Strategy
The developer is responsible for delivering a deployment-ready application. The repository is designed to be easily handed off to a DevOps or deployment engineer without requiring core architectural modifications.

### Artifacts Provided for Handoff
1. **Production Dockerfiles**: Multi-stage, optimized builds for both Next.js (Standalone mode) and FastAPI to minimize image sizes and attack surfaces.
2. **Environment Configuration**: A comprehensive `.env.example` documenting all required variables (Database URL, JWT Secret, CORS origins, Node environments).
3. **Database Migrations**: Alembic scripts to automatically upgrade the production database schema.
4. **Health Checks**: `/api/v1/health` endpoint for load balancers and container orchestrators.
5. **DEPLOYMENT_HANDOFF.md**: A dedicated guide containing runtime requirements, configuration instructions, build/start commands, and a post-deployment verification checklist.
