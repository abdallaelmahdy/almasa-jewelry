from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.sql import and_, or_
from datetime import datetime
from decimal import Decimal

from app.api import deps
from app.models.sales import Sale, Refund
from app.models.inventory import InventoryItem, InventoryTransaction, TransactionType, ItemStatus
from app.schemas.reports import SalesSummaryReport, InventoryValuationReport

router = APIRouter()

@router.get("/sales-summary", response_model=SalesSummaryReport)
def get_sales_summary(
    *,
    db: Session = Depends(deps.get_db),
    date_from: datetime = Query(..., description="Inclusive start date (UTC)"),
    date_to: datetime = Query(..., description="Exclusive end date (UTC)"),
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Get sales and profit summary for a date range."""
    # Gross Sales
    gross_sales_result = db.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at >= date_from,
        Sale.created_at < date_to
    ).scalar()
    gross_sales = gross_sales_result or Decimal("0.00")
    
    # Refunds
    refunds_result = db.query(func.sum(Refund.amount)).filter(
        Refund.created_at >= date_from,
        Refund.created_at < date_to
    ).scalar()
    refunds = refunds_result or Decimal("0.00")
    
    net_sales = gross_sales - refunds
    
    # COGS
    cogs_sell_result = db.query(func.sum(InventoryTransaction.historical_cost_basis)).filter(
        InventoryTransaction.transaction_type == TransactionType.SELL,
        InventoryTransaction.reference_type == "SALE",
        InventoryTransaction.created_at >= date_from,
        InventoryTransaction.created_at < date_to
    ).scalar()
    cogs_sell = cogs_sell_result or Decimal("0.00")
    
    cogs_return_result = db.query(func.sum(InventoryTransaction.historical_cost_basis)).filter(
        InventoryTransaction.transaction_type == TransactionType.RETURN,
        InventoryTransaction.reference_type == "REFUND",
        InventoryTransaction.created_at >= date_from,
        InventoryTransaction.created_at < date_to
    ).scalar()
    cogs_return = cogs_return_result or Decimal("0.00")
    
    cogs = cogs_sell - cogs_return
    gross_profit = net_sales - cogs
    
    return SalesSummaryReport(
        gross_sales=gross_sales,
        refunds=refunds,
        net_sales=net_sales,
        cogs=cogs,
        gross_profit=gross_profit
    )

@router.get("/inventory-valuation", response_model=InventoryValuationReport)
def get_inventory_valuation(
    *,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Get total inventory valuation (cost basis) and weight for AVAILABLE or LOCKED items."""
    result = db.query(
        func.sum(InventoryItem.cost_basis).label("total_cost_basis"),
        func.sum(InventoryItem.weight).label("total_weight")
    ).filter(
        InventoryItem.status == ItemStatus.AVAILABLE
    ).first()
    
    total_cost_basis = result.total_cost_basis or Decimal("0.00")
    total_weight = result.total_weight or Decimal("0.000")
    
    return InventoryValuationReport(
        total_cost_basis=total_cost_basis,
        total_weight=total_weight
    )
