from pydantic import BaseModel, ConfigDict, Field, field_validator
from decimal import Decimal
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from app.models.inventory import ItemStatus, TransactionType
from app.schemas.catalog import ProductOut

class InventoryItemBase(BaseModel):
    product_id: int
    weight: Decimal = Field(..., gt=0)
    karat: int = Field(..., description="18, 21, 22, 24")
    manufacturing_fee: Decimal = Field(default=Decimal('0.00'), ge=0)
    cost_basis: Decimal = Field(..., ge=0)

    @field_validator('karat')
    @classmethod
    def validate_karat(cls, v: int) -> int:
        if v not in (18, 21, 22, 24):
            raise ValueError('Supported karats are 18, 21, 22, 24')
        return v

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryAdjustmentRequest(BaseModel):
    weight: Optional[Decimal] = Field(None, gt=0)
    karat: Optional[int] = Field(None, description="18, 21, 22, 24")
    manufacturing_fee: Optional[Decimal] = Field(None, ge=0)
    cost_basis: Optional[Decimal] = Field(None, ge=0)
    reason: str = Field(..., min_length=1)

    @field_validator('karat')
    @classmethod
    def validate_karat(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v not in (18, 21, 22, 24):
            raise ValueError('Supported karats are 18, 21, 22, 24')
        return v

class InventoryTransitionRequest(BaseModel):
    reason: str = Field(..., min_length=1)
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    session_id: Optional[str] = None

class InventoryItemInDBBase(InventoryItemBase):
    id: UUID
    sku: str
    status: ItemStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class InventoryItemOut(InventoryItemInDBBase):
    weight: str
    manufacturing_fee: str
    cost_basis: str
    product: ProductOut

    @field_validator('weight', 'manufacturing_fee', 'cost_basis', mode='before')
    @classmethod
    def serialize_decimal(cls, v):
        if isinstance(v, Decimal):
            return str(v)
        return str(v)

class PublicInventoryItemOut(BaseModel):
    id: UUID
    sku: str
    status: ItemStatus
    weight: str
    karat: int
    product: ProductOut
    model_config = ConfigDict(from_attributes=True)

    @field_validator('weight', mode='before')
    @classmethod
    def serialize_decimal(cls, v):
        if isinstance(v, Decimal):
            return str(v)
        return str(v)

class InventoryTransactionBase(BaseModel):
    transaction_type: TransactionType
    previous_status: Optional[ItemStatus]
    new_status: ItemStatus
    historical_weight: Decimal
    historical_karat: int
    historical_cost_basis: Decimal
    historical_manufacturing_fee: Decimal
    reference_type: Optional[str]
    reference_id: Optional[str]

class InventoryTransactionInDBBase(InventoryTransactionBase):
    id: int
    inventory_item_id: UUID
    created_at: datetime
    created_by_id: int
    model_config = ConfigDict(from_attributes=True)

class InventoryTransactionOut(InventoryTransactionInDBBase):
    historical_weight: str
    historical_cost_basis: str
    historical_manufacturing_fee: str

    @field_validator('historical_weight', 'historical_cost_basis', 'historical_manufacturing_fee', mode='before')
    @classmethod
    def serialize_decimal(cls, v):
        if isinstance(v, Decimal):
            return str(v)
        return str(v)
