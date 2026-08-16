import httpx
import logging
from decimal import Decimal
from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.catalog import GoldPrice
from app.models.user import User
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

GOLD_API_URL = "https://www.goldapi.io/api/XAU/EGP"
SUPPORTED_KARATS = [24, 22, 21, 18]

def get_or_create_system_user(db: Session) -> User:
    """
    Ensures an idempotent, dedicated SYSTEM identity exists for background synchronizations.
    This prevents relying on arbitrary user IDs or normal admin accounts.
    """
    system_email = "system@almasa.local"
    user = db.query(User).filter(User.email == system_email).first()
    if not user:
        user = User(
            username="system_sync",
            email=system_email,
            hashed_password=get_password_hash("NO_LOGIN_POSSIBLE_" + "some_random_entropy"),
            role="admin",
            is_active=False  # System user cannot actively log in
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def sync_gold_prices(db: Session, api_key: str) -> bool:
    """
    Fetches live gold prices from GoldAPI.io and updates the local GoldPrice ledger
    if prices have changed.
    """
    if not api_key:
        logger.error("GOLD_API_KEY is missing. Synchronization aborted.")
        return False

    try:
        response = httpx.get(
            GOLD_API_URL,
            headers={"x-access-token": api_key},
            timeout=10.0
        )
        response.raise_for_status()
        data = response.json()
    except httpx.RequestError as e:
        logger.error(f"Failed to communicate with GoldAPI: {e}")
        return False
    except httpx.HTTPStatusError as e:
        logger.error(f"GoldAPI returned an error response: {e.response.status_code} - {e.response.text}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during GoldAPI sync: {e}")
        return False

    system_user = get_or_create_system_user(db)
    new_records = []

    for karat in SUPPORTED_KARATS:
        key = f"price_gram_{karat}k"
        raw_price = data.get(key)
        
        if raw_price is None or raw_price <= 0:
            logger.warning(f"Invalid or missing price for {karat}K in GoldAPI response.")
            continue
            
        new_price_val = Decimal(str(raw_price)).quantize(Decimal('0.01'))

        # Check if the price has meaningfully changed
        current_price_record = (
            db.query(GoldPrice)
            .filter(GoldPrice.karat == karat)
            .order_by(desc(GoldPrice.effective_from), desc(GoldPrice.id))
            .first()
        )

        if current_price_record and current_price_record.price_per_gram == new_price_val:
            # Price hasn't changed, skip to avoid DB bloat
            logger.debug(f"Price for {karat}K is unchanged ({new_price_val} EGP). Skipping.")
            continue
            
        new_price = GoldPrice(
            karat=karat,
            price_per_gram=new_price_val,
            created_by_id=system_user.id
        )
        new_records.append(new_price)
        logger.info(f"New price for {karat}K: {new_price_val} EGP/gram.")

    if new_records:
        db.add_all(new_records)
        db.commit()
        logger.info(f"Successfully synchronized {len(new_records)} new gold price(s).")
    else:
        logger.info("Gold prices synchronization complete. No new updates required.")
        
    return True
