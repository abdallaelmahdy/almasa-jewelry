# Architecture Decision Records (ADRs)

## ADR 1: Financial Precision using Decimal / NUMERIC
**Date**: 2026-08-13
**Status**: Accepted

**Context**: Gold pricing and financial calculations require extreme precision. Floating-point arithmetic introduces rounding errors that are unacceptable in a financial/jewelry management system, resulting in incorrect totals and profit calculation drift.

**Decision**: Use PostgreSQL `NUMERIC` for database storage and Python `Decimal` for all backend calculations. The exact precision scales are mandated as:
- **Currency/Prices**: `NUMERIC(15, 2)`
- **Gold Weight**: `NUMERIC(10, 3)` (to support milligram accuracy)
- **Percentages/Taxes**: `NUMERIC(5, 2)`
The frontend will receive financial amounts as strings or strictly typed structures to prevent JavaScript floating-point truncation.

## ADR 2: Immutable Inventory Ledger
**Date**: 2026-08-13
**Status**: Accepted

**Context**: Inventory in a jewelry store is highly valuable and heavily audited. Hard-deleting records or simply overwriting a quantity integer removes historical context and traceability.

**Decision**: Implement an Immutable Inventory Ledger. All stock movements (ADD, SELL, RETURN, ADJUST, REMOVE) are recorded as transactions. Historical inventory items are never hard-deleted.

## ADR 3: Append-Only Gold Price History
**Date**: 2026-08-13
**Status**: Accepted

**Context**: Past sales must reference the exact gold price at the time of the transaction. If gold prices in the database are simply overwritten when the market changes, historical data integrity is lost.

**Decision**: Gold prices are append-only. A new price update creates a new row with an `effective_from` timestamp. Invoices will explicitly copy the precise price at the time of the transaction into the `InvoiceItem` record, locking it permanently.

## ADR 4: Modular Monolith Architecture
**Date**: 2026-08-13
**Status**: Accepted

**Context**: The application requires complex atomic transactions (e.g., processing a Sale + Payment + Inventory deduction simultaneously). Introducing microservices would require distributed transaction complexity (Sagas, Two-Phase Commits), which is overkill for this scope.

**Decision**: Adopt a Modular Monolith architecture using FastAPI and PostgreSQL. This ensures simple, atomic database transactions, high performance, and easier deployment handoff while maintaining clean code boundaries.

## ADR 5: Individual SKU Tracking for All Inventory
**Date**: 2026-08-13
**Status**: Accepted

**Context**: A jewelry store carries unique pieces alongside identical mass-produced items (like generic chains). Tracking identical pieces via bulk quantities (`quantity: 5`) introduces edge cases in the transaction ledger when partial sales, returns, or adjustments occur. Additionally, calculating accurate profit requires knowing the precise `cost_basis` of each piece sold.

**Decision**: Every physical jewelry piece MUST be individually tracked as a distinct `InventoryItem` with a unique `sku` (or barcode) and an explicit `cost_basis`. Identical pieces will simply have multiple unique `InventoryItem` records. This drastically simplifies the ledger logic, guarantees exact profit calculation per item, and provides a unified lifecycle state machine (`AVAILABLE`, `LOCKED`, `SOLD`, `RETURNED`) for the entire store.

## ADR 6: Native RTL and Intl Localization
**Date**: 2026-08-13
**Status**: Accepted

**Context**: The application must be Arabic-first and RTL-first. Treating RTL as merely a CSS stylesheet afterthought often leads to layout breaks, inconsistent numeral rendering, and poor UX.

**Decision**: RTL must be enforced architecturally. 
- Next.js root layout must enforce `<html dir="rtl" lang="ar">`.
- All formatting of numbers, currency, weights, and dates must utilize standard JavaScript `Intl` APIs (e.g., `Intl.NumberFormat`) to ensure correct and consistent localization.
- Code-level identifiers remain in English for maintainability.
