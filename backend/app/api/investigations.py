from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.database.session import get_db
from app.models.schemas import Investigation, InvestigationEvent, SecurityEvent, Incident, Alert, IOCMatch

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("", response_model=List[Dict[str, Any]])
def list_investigations(db: Session = Depends(get_db)):
    """
    List all active and closed Investigation Workspaces.
    """
    investigations = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    res = []
    for inv in investigations:
        evt_count = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == inv.id).count()
        res.append({
            "id": inv.id,
            "investigation_code": inv.investigation_code,
            "title": inv.title,
            "description": inv.description,
            "status": inv.status,
            "priority": inv.priority,
            "assigned_to": inv.assigned_to,
            "event_count": evt_count,
            "incident_id": inv.incident_id,
            "created_at": inv.created_at.isoformat() if inv.created_at else None
        })
    return res

@router.get("/{investigation_id}", response_model=Dict[str, Any])
def get_investigation_detail(investigation_id: str, db: Session = Depends(get_db)):
    """
    Get detailed Investigation Workspace with events timeline, assets, IOC matches, and AI context.
    """
    inv = db.query(Investigation).filter(
        (Investigation.id == investigation_id) | (Investigation.investigation_code == investigation_id)
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation workspace not found")

    links = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == inv.id).all()
    event_ids = [l.event_id for l in links]

    events = db.query(SecurityEvent).filter(SecurityEvent.id.in_(event_ids)).order_by(SecurityEvent.timestamp.asc()).all()
    event_list = [{
        "id": e.id,
        "event_code": e.event_code,
        "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        "event_type": e.event_type,
        "source": e.source,
        "asset_id": e.asset_id,
        "source_ip": e.source_ip,
        "user": e.user,
        "action": e.action,
        "result": e.result,
        "severity": e.severity,
        "request_id": e.request_id
    } for e in events]

    assets = list(set([e.source for e in events if e.source]))
    users = list(set([e.user for e in events if e.user]))
    ips = list(set([e.source_ip for e in events if e.source_ip]))

    # AI Context Synthesis
    ai_summary = f"Investigation Case {inv.investigation_code} contains {len(events)} correlated events across {len(assets)} target assets. Key source IPs: {', '.join(ips[:3]) or 'N/A'}. Primary actor: {users[0] if users else 'Unknown'}. Evidence points to unauthorized authentication attempts followed by privileged resource access."

    return {
        "id": inv.id,
        "investigation_code": inv.investigation_code,
        "title": inv.title,
        "description": inv.description,
        "status": inv.status,
        "priority": inv.priority,
        "assigned_to": inv.assigned_to,
        "incident_id": inv.incident_id,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "affected_assets": assets,
        "affected_users": users,
        "source_ips": ips,
        "timeline_events": event_list,
        "ai_analysis": {
            "summary": ai_summary,
            "hypothesis": "Credential theft or valid account compromise followed by administrative key discovery.",
            "recommended_next_step": "Isolate lab target WEB-01 and revoke active session tokens for account 'admin'."
        }
    }
