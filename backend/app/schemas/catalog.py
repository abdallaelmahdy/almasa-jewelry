from pydantic import BaseModel, ConfigDict, Field, field_validator
from decimal import Decimal
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None

class CategoryInDBBase(CategoryBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class CategoryOut(CategoryInDBBase):
    pass


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    category_id: Optional[int] = None

class ProductInDBBase(ProductBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductOut(ProductInDBBase):
    category: CategoryOut


class GoldPriceBase(BaseModel):
    karat: int = Field(..., description="18, 21, 22, 24")
    price_per_gram: Decimal = Field(..., ge=0)

    @field_validator('karat')
    @classmethod
    def validate_karat(cls, v: int) -> int:
        if v not in (18, 21, 22, 24):
            raise ValueError('Supported karats are 18, 21, 22, 24')
        return v

class GoldPriceCreate(GoldPriceBase):
    pass

class GoldPriceInDBBase(GoldPriceBase):
    id: int
    effective_from: datetime
    created_by_id: int
    model_config = ConfigDict(from_attributes=True)

class GoldPriceOut(GoldPriceInDBBase):
    # Enforce string serialization for decimals
    price_per_gram: str

    @field_validator('price_per_gram', mode='before')
    @classmethod
    def serialize_decimal(cls, v):
        if isinstance(v, Decimal):
            return str(v.quantize(Decimal('0.01')))
        return str(v)
