# API Architecture

## Overview
The API is built using **FastAPI (Python)**, providing a highly performant RESTful architecture with automatic OpenAPI (Swagger) documentation generation.

## Standards & Best Practices
- **JSON Format**: All requests and responses use JSON.
- **Naming Conventions**: Endpoints use kebab-case routing (e.g., `/api/v1/gold-prices`).
- **Statelessness**: RESTful APIs are strictly stateless. Authentication is handled via JWT tokens in the `Authorization` header.
- **Pagination**: All list endpoints (e.g., sales history, inventory ledger) return paginated responses to ensure performance.
- **Data Serialization**: Pydantic models are used for request validation and response serialization, ensuring strict type safety.

## Centralized Pricing Engine
The backend serves as the authoritative single source of truth for all financial calculations. 
The frontend (Gold Calculator, POS Cart) relies on the backend for:
- Fetching the current gold prices per Karat.
- Validating the final price calculation `(Gold Price * Weight) + Manufacturing Fee - Discount`.
- The frontend must NOT contain duplicated pricing business logic to prevent drift or tampering.

## Error Handling
Standardized error responses using standard HTTP status codes:
- `400 Bad Request`: Validation errors, business logic violations (e.g., insufficient stock).
- `401 Unauthorized`: Invalid or missing credentials.
- `403 Forbidden`: Insufficient permissions based on RBAC.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Concurrency issues, resource state conflicts (e.g., trying to sell an item already in another checkout).
- `500 Internal Server Error`: Unhandled exceptions.

Standardized Error Payload Structure:
```json
{
  "error_code": "INSUFFICIENT_STOCK",
  "message": "Product XYZ is currently out of stock or locked by another transaction.",
  "details": {
    "product_id": "XYZ"
  }
}
```
