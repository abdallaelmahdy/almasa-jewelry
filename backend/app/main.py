from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import health, auth, users, categories, products, gold_prices, pricing, inventory
from app.core.config import settings
from app.core.rate_limit import limiter

app = FastAPI(title="Almasa Jewelry API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Routers
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(gold_prices.router, prefix=f"{settings.API_V1_STR}/gold-prices", tags=["gold_prices"])
app.include_router(pricing.router, prefix="/api/v1/pricing", tags=["Pricing"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])

@app.get("/")
def root():
    return {"message": "Welcome to Almasa Jewelry API"}
