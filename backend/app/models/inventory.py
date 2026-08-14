from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint, Enum
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

class ItemStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    LOCKED = "LOCKED"
    SOLD = "SOLD"
    RETURNED = "RETURNED"

class TransactionType(str, enum.Enum):
    STOCK_IN = "STOCK_IN"
    LOCK = "LOCK"
    UNLOCK = "UNLOCK"
    ADJUST = "ADJUST"
    SELL = "SELL"
    RETURN = "RETURN"

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    weight = Column(Numeric(10, 3), nullable=False)
    karat = Column(Integer, nullable=False)
    manufacturing_fee = Column(Numeric(15, 2), nullable=False, default=0.0)
    cost_basis = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(ItemStatus), default=ItemStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())
    
    product = relationship("Product")

    __table_args__ = (
        CheckConstraint('weight > 0', name='check_weight_positive'),
        CheckConstraint('manufacturing_fee >= 0', name='check_manufacturing_fee_non_negative'),
        CheckConstraint('cost_basis >= 0', name='check_cost_basis_non_negative'),
        CheckConstraint('karat IN (18, 21, 22, 24)', name='check_inventory_supported_karat'),
    )

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    
    previous_status = Column(Enum(ItemStatus), nullable=True)
    new_status = Column(Enum(ItemStatus), nullable=False)
    
    historical_weight = Column(Numeric(10, 3), nullable=False)
    historical_karat = Column(Integer, nullable=False)
    historical_cost_basis = Column(Numeric(15, 2), nullable=False)
    historical_manufacturing_fee = Column(Numeric(15, 2), nullable=False)
    
    reference_type = Column(String, nullable=True)
    reference_id = Column(String, nullable=True) # e.g. sale id, return id
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    inventory_item = relationship("InventoryItem")
