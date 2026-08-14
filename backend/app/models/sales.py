from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import UUID

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False, default="COMPLETED") # COMPLETED, REFUNDED
    total_amount = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer")
    user = relationship("User")

    __table_args__ = (
        CheckConstraint('total_amount >= 0', name='check_sale_total_amount_non_negative'),
    )

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), unique=True, nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sale = relationship("Sale", backref=backref("invoice", uselist=False))

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    historical_weight = Column(Numeric(10, 3), nullable=False)
    historical_karat = Column(Integer, nullable=False)
    historical_gold_price_per_gram = Column(Numeric(15, 2), nullable=False)
    historical_manufacturing_fee = Column(Numeric(15, 2), nullable=False)
    line_total = Column(Numeric(15, 2), nullable=False)
    
    invoice = relationship("Invoice", backref="items")
    inventory_item = relationship("InventoryItem")

    __table_args__ = (
        CheckConstraint('historical_weight > 0', name='check_historical_weight_positive'),
        CheckConstraint('historical_gold_price_per_gram >= 0', name='check_historical_gold_price_non_negative'),
        CheckConstraint('historical_manufacturing_fee >= 0', name='check_historical_manufacturing_fee_non_negative'),
        CheckConstraint('line_total >= 0', name='check_line_total_non_negative'),
    )

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    method = Column(String, nullable=False) # CASH, CARD, TRANSFER
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sale = relationship("Sale", backref="payments")

    __table_args__ = (
        CheckConstraint('amount >= 0', name='check_payment_amount_non_negative'),
    )

class Refund(Base):
    __tablename__ = "refunds"
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    payment = relationship("Payment", backref="refunds")

    __table_args__ = (
        CheckConstraint('amount >= 0', name='check_refund_amount_non_negative'),
    )
