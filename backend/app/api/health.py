from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
import time

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def check_health(db: Session = Depends(get_db)):
    db_status = "ONLINE"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    return {
        "status": "ONLINE",
        "system": "CYBERNEXUS CORE",
        "version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "services": {
            "api_core": "ONLINE",
            "database": db_status,
            "soc_engine": "ONLINE",
            "ai_engine": "ONLINE",
            "telemetry": "CONNECTED",
            "cyber_range": "LAB_CONNECTED"
        }
    }
