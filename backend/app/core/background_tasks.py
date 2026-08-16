import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.inventory import Reservation

logger = logging.getLogger(__name__)

def sweep_expired_reservations_sync():
    """Synchronous DB function to delete expired reservations"""
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.query(Reservation).filter(Reservation.expires_at <= now).all()
        if expired:
            for res in expired:
                db.delete(res)
            db.commit()
            logger.info(f"Swept {len(expired)} expired reservations.")
    except Exception as e:
        logger.error(f"Error sweeping reservations: {e}")
        db.rollback()
    finally:
        db.close()

async def sweep_reservations_loop():
    """Async loop to run the synchronous sweeper periodically"""
    while True:
        try:
            await asyncio.to_thread(sweep_expired_reservations_sync)
        except Exception as e:
            logger.error(f"Background task failed: {e}")
            
        # Run every 60 seconds
        await asyncio.sleep(60)
