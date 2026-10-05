from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.database.session import get_db
from app.soc.hunting.engine import threat_hunting_engine
from app.models.schemas import SavedHunt

router = APIRouter(prefix="/threat-hunts", tags=["Threat Hunting"])

@router.get("", response_model=List[Dict[str, Any]])
def list_saved_hunts(db: Session = Depends(get_db)):
    """
    List all saved Threat Hunt queries.
    """
    hunts = db.query(SavedHunt).order_by(SavedHunt.created_at.desc()).all()
    return [{
        "id": h.id,
        "hunt_code": h.hunt_code,
        "name": h.name,
        "description": h.description,
        "query": h.query_json,
        "created_by": h.created_by,
        "created_at": h.created_at.isoformat() if h.created_at else None
    } for h in hunts]

@router.post("/run", response_model=Dict[str, Any])
def run_threat_hunt(filters: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Executes a structured Threat Hunt query across normalized events safely.
    """
    return threat_hunting_engine.execute_hunt_query(db, filters)

@router.post("", response_model=Dict[str, Any])
def create_saved_hunt(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Saves a reusable Threat Hunt query.
    """
    name = payload.get("name", "Failed Auth Burst Hunt")
    description = payload.get("description", "Searches for authentication failure bursts")
    query_dict = payload.get("query", {})

    hunt = threat_hunting_engine.save_hunt(db, name, description, query_dict)
    return {
        "id": hunt.id,
        "hunt_code": hunt.hunt_code,
        "name": hunt.name,
        "description": hunt.description
    }

@router.post("/investigate", response_model=Dict[str, Any])
def convert_hunt_to_investigation(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Converts Threat Hunt query results into an Investigation Case.
    """
    title = payload.get("title", "Threat Hunt Investigation Case")
    description = payload.get("description", "Investigation initialized from Threat Hunting results.")
    event_ids = payload.get("event_ids", [])

    inv = threat_hunting_engine.convert_hunt_to_investigation(db, title, description, event_ids)
    return {
        "id": inv.id,
        "investigation_code": inv.investigation_code,
        "title": inv.title,
        "status": inv.status
    }
