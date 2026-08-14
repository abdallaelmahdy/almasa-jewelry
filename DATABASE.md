# Database Architecture and Domain Model

## Domain Model
The domain model consists of the following bounded contexts:
- **Identity & Access**: `User`, `Role`, `Permission`.
- **Catalog & Pricing**: `Category`, `Product`, `GoldPrice` (append-only history).
- **Inventory**: `InventoryItem`, `InventoryTransaction` (ledger).
- **Sales & Financials**: `Customer`, `Sale`, `Invoice`, `InvoiceItem`, `Payment`, `Refund`.
- **Audit**: `AuditLog`.

## Financial Precision & Constraints
To ensure absolute financial correctness, the database employs strict precision rules and constraints:
- **Currency/Prices**: `NUMERIC(15, 2)`
- **Gold Weight**: `NUMERIC(10, 3)`
- **Percentages/Discounts**: `NUMERIC(5, 2)`
- **CHECK Constraints**: Explicit database-level constraints are mandated for data integrity:
  - `CHECK (weight > 0)`
  - `CHECK (price >= 0)`
  - `CHECK (manufacturing_fee >= 0)`
  - `CHECK (cost_basis >= 0)`

## Inventory Modeling Decision
**Decision**: Immutable Ledger with Individually Tracked Items.
**Identification**: Every physical jewelry piece is represented by a unique `InventoryItem` record identified by an internal UUID and a unique human-readable `sku` (or `barcode_id`).
**Attributes**: An `InventoryItem` holds exact item-level attributes:
- `weight`: The exact physical weight (`NUMERIC(10, 3)`).
- `karat`: The gold purity (e.g., 18, 21, 24).
- `manufacturing_fee`: The specific labor fee applied to this item.
- `cost_basis`: The explicit cost to acquire/manufacture this item, required to accurately calculate business profit upon sale.
**Identical Items**: Products with multiple identical pieces (e.g., generic gold chains) are still individually tracked as distinct `InventoryItem` records with unique SKUs. This prevents ledger complexity and guarantees an auditable transaction history for every physical piece of metal.

## InventoryItem State/Lifecycle Model
An item transitions through a strict state machine:
- `AVAILABLE`: Ready for sale.
- `LOCKED`: Temporarily reserved during an active POS checkout.
- `SOLD`: Permanently transferred to a customer (triggers an immutable Invoice).
- `RETURNED`: Customer returned the item (requires an explicit return transaction before it can become `AVAILABLE` again).
Transitions are heavily guarded by database transactions.

## Gold Pricing Model
- **Append-Only History**: `GoldPrice` records are never updated or deleted. A new price update creates a new row with an `effective_from` timestamp and the `created_by` user.
- **Current Price Resolution**: The latest record per Karat where `effective_from <= NOW()`.
- **Pricing Engine**: Centralized in the backend. Calculates `(Weight * Price_per_gram) + Manufacturing_fee - Discount`. The frontend strictly relies on the backend for final calculations.

## Sales and Payment Model
- **Sale**: Represents the business transaction. Contains `status` (e.g., PENDING, COMPLETED, CANCELLED).
- **Invoice**: Immutable snapshot of the sale containing generated PDF references and metadata.
- **InvoiceItem**: Stores historical values (weight, karat, exact gold price at the time, applied fees, line total) to ensure past invoices never change if current prices change.
- **Payment**: Explicitly models payments (Cash, Card, Bank Transfer). A sale can have multiple payment records.

## Refund and Cancellation Model
- Never physically delete financial or invoice records. 
- Cancellation is a controlled business operation that updates the `Sale` status to `CANCELLED`, records a reason, triggers a reversal `InventoryTransaction` (stock in), and issues a `Refund` record linked to the original `Payment`.

## Transaction/Concurrency Strategy
- **Atomic Transactions**: A complete sale executes in ONE database transaction. 
  1. Validate user permissions and verify item status is `AVAILABLE`.
  2. Lock inventory records (`SELECT ... FOR UPDATE`).
  3. Calculate prices using the centralized engine.
  4. Insert Sale, Invoice, InvoiceItems, InventoryTransactions, Payments, and Audit events.
  5. Commit (or Rollback entirely if any step fails).
