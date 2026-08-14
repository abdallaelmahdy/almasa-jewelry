from pydantic import BaseModel, Field, field_validator
from decimal import Decimal

class PricingCalculateRequestItem(BaseModel):
    karat: int = Field(..., description="18, 21, 22, 24")
    weight: Decimal = Field(..., ge=0)
    manufacturing_fee: Decimal = Field(..., ge=0)
    discount_amount: Decimal = Field(default=Decimal('0.00'), ge=0)

    @field_validator('karat')
    @classmethod
    def validate_karat(cls, v: int) -> int:
        if v not in (18, 21, 22, 24):
            raise ValueError('Supported karats are 18, 21, 22, 24')
        return v

class PricingCalculateResponseItem(BaseModel):
    karat: int
    gold_price_per_gram: str
    weight: str
    manufacturing_fee: str
    discount_amount: str
    subtotal: str
    total: str

    @field_validator('gold_price_per_gram', 'manufacturing_fee', 'discount_amount', 'subtotal', 'total', mode='before')
    @classmethod
    def serialize_currency(cls, v):
        if isinstance(v, Decimal):
            return str(v.quantize(Decimal('0.01')))
        return str(v)

    @field_validator('weight', mode='before')
    @classmethod
    def serialize_weight(cls, v):
        if isinstance(v, Decimal):
            return str(v.quantize(Decimal('0.001')))
        return str(v)
