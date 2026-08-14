from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        # Check DB connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
