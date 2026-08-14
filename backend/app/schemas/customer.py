from pydantic import BaseModel, constr
from typing import Optional

class CustomerBase(BaseModel):
    name: constr(min_length=1)
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int

    class Config:
        from_attributes = True
