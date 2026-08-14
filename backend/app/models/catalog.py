from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint, Boolean
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.orm import relationship

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    category = relationship("Category")

class GoldPrice(Base):
    __tablename__ = "gold_prices"
    id = Column(Integer, primary_key=True, index=True)
    karat = Column(Integer, nullable=False)
    price_per_gram = Column(Numeric(15, 2), nullable=False)
    effective_from = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_by = relationship("User")

    __table_args__ = (
        CheckConstraint('price_per_gram >= 0', name='check_gold_price_per_gram_non_negative'),
        CheckConstraint('karat IN (18, 21, 22, 24)', name='check_supported_karat'),
    )
