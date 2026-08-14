# Security Architecture

## Authentication & RBAC Strategy
- **Authentication**: Secure JWT-based stateless authentication. Tokens are signed and possess appropriate expiration times.
- **Role-Based Access Control (RBAC)**:
  - `Admin`: Full access. Can change gold prices, manage users and permissions, access sensitive profit reports, and perform inventory overrides.
  - `Employee/Cashier`: Restricted operational access. Can process sales and view inventory, but CANNOT change core gold prices, manage permissions, or view sensitive financial/profit metrics.
- Authorization is strictly enforced **server-side** on every FastAPI endpoint using dependency injection.

## Audit Logging Strategy
- **Immutable Audit Log**: The `AuditLog` table records all sensitive business operations to ensure complete traceability.
- **Triggers on**: Gold price changes, Sale processing, Sale cancellations/refunds, Inventory adjustments, Permission changes, and Product archival.
- **Log Entry Structure**: Entries contain the Timestamp, User ID, Action Type, Resource ID, Old Values (if applicable), New Values, and IP/User-Agent metadata.

## Security Hardening
- **SQL Injection Prevention**: Exclusive use of SQLAlchemy ORM and parameterized queries. No raw SQL execution for dynamic inputs.
- **XSS & CSRF**: Next.js automatically escapes React variables, preventing Cross-Site Scripting.
- **Input Validation**: Pydantic validates all incoming API payloads on the backend. Zod validates forms on the frontend. Both layers enforce strict constraints (e.g., rejecting negative weights or non-decimal numbers).
- **Rate Limiting**: Applied to sensitive authentication endpoints (login, password reset) to prevent brute force attacks.
- **Secrets Management**: No secrets (JWT keys, database passwords) are committed to the repository. Handled strictly via `.env` files and environment variables.
