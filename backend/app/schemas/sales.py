from pydantic import BaseModel, Field, constr
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class PaymentInput(BaseModel):
    method: constr(min_length=1) # e.g. "CASH", "CARD", "TRANSFER"
    amount: Decimal = Field(..., ge=0, description="Amount paid via this method")

class CheckoutRequest(BaseModel):
    inventory_item_ids: List[UUID] = Field(..., min_length=1, description="List of inventory items to purchase")
    customer_id: Optional[int] = None
    payments: List[PaymentInput] = Field(..., min_length=1, description="List of payments for the sale")
    idempotency_key: str = Field(..., min_length=1)

class RefundRequest(BaseModel):
    reason: str = Field(..., min_length=1)

class PaymentOut(BaseModel):
    id: int
    amount: Decimal
    method: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceItemOut(BaseModel):
    id: int
    inventory_item_id: UUID
    historical_weight: Decimal
    historical_karat: int
    historical_gold_price_per_gram: Decimal
    historical_manufacturing_fee: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    pdf_url: Optional[str]
    created_at: datetime
    items: List[InvoiceItemOut]

    class Config:
        from_attributes = True

class SaleOut(BaseModel):
    id: int
    customer_id: Optional[int]
    user_id: int
    idempotency_key: str
    status: str
    total_amount: Decimal
    created_at: datetime
    
    payments: List[PaymentOut]
    invoice: Optional[InvoiceOut]

    class Config:
        from_attributes = True

class RefundOutBase(BaseModel):
    id: int
    payment_id: int
    amount: Decimal
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RefundResponse(BaseModel):
    sale: SaleOut
    refunds: List[RefundOutBase]
