from pydantic import BaseModel
from decimal import Decimal

class SalesSummaryReport(BaseModel):
    gross_sales: Decimal
    refunds: Decimal
    net_sales: Decimal
    cogs: Decimal
    gross_profit: Decimal

class InventoryValuationReport(BaseModel):
    total_cost_basis: Decimal
    total_weight: Decimal
