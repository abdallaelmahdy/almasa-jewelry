import os
import sys
import logging

# Ensure backend directory is in sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.core.config import settings
from app.services.gold_price_service import sync_gold_prices

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting GoldAPI synchronization script...")
    api_key = settings.GOLD_API_KEY

    if not api_key:
        logger.error("GOLD_API_KEY is not set in environment or configuration.")
        sys.exit(1)

    db = SessionLocal()
    try:
        success = sync_gold_prices(db, api_key)
        if success:
            logger.info("Synchronization completed successfully.")
        else:
            logger.error("Synchronization encountered errors or failed.")
            sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
