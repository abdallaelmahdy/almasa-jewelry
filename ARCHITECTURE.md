# System Architecture

## Overview
ALMASA JEWELRY is a professional, production-ready, financial-grade web-based Gold & Jewelry Shop Management System. It follows a Modular Monolith architecture to reduce complexity while ensuring robust data consistency and maintainability.

## Technology Stack
- **Frontend**: Next.js (App Router), React & TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Hook Form & Zod, TanStack Query, Recharts.
- **Backend**: FastAPI (Python 3.12+), SQLAlchemy, Pydantic, Alembic.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker & Docker Compose.

## Repository Structure
The repository will be structured as a monorepo containing both frontend and backend to streamline development and deployment:
```text
/
├── frontend/         # Next.js App Router application
├── backend/          # FastAPI application
├── docs/             # ADRs and technical documentation
├── docker-compose.yml
└── README.md
```

## Arabic RTL UX Architecture
The application is **Arabic-first and RTL-first**, deeply integrated at the architectural level, not merely treated as a CSS detail.
- **Root Layout**: The Next.js root layout must enforce RTL natively using `<html dir="rtl" lang="ar">`.
- **Localization Formatting**: All numbers, currency, weights, and dates MUST be standardized using JavaScript `Intl` APIs (e.g., `Intl.NumberFormat('ar-SA')`, `Intl.DateTimeFormat('ar-SA')`). This guarantees consistent rendering of Eastern/Western Arabic numerals across the system.
- **Styling**: Native RTL support using Tailwind CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).
- **Content Policy**: All user-facing UI elements, dashboards, invoices, and messaging are exclusively in Arabic, adhering to the Dark Luxury theme (deep black backgrounds, gold accents).
- **Code Policy**: All code-level identifiers (variables, functions, database tables, API routes) remain entirely in English.

## Testing Strategy
- **Backend**: `pytest` for unit and integration testing. Focus on financial calculation correctness, centralized pricing engine validation, and atomic transaction safety.
- **Frontend**: React Testing Library and Vitest/Jest for unit testing UI components, specifically the Gold Calculator state management.
- **E2E**: Playwright or Cypress for testing critical business flows (e.g., Auth -> Calculator -> POS Sale -> Invoice generation -> Inventory Update).

## Important Architectural Risks
1. **Financial Precision Loss**: Mitigated by strictly using `Decimal` (Python) and `NUMERIC` (PostgreSQL) everywhere. Floating-point variables are strictly forbidden for financial and weight data.
2. **Concurrency/Race Conditions during Sales**: Mitigated by strict database transactions and row-level locking (e.g., `SELECT FOR UPDATE` on inventory records during POS checkout).
3. **Auditability Gaps**: Mitigated by immutable ledger patterns (append-only price history, inventory transaction ledger, and comprehensive audit logs).
