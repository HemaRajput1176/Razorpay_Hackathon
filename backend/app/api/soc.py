from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.database.session import get_db
from app.soc.service import soc_service
from app.soc.purple.engine import purple_team_engine
from app.models.schemas import Alert, Incident, SecurityEvent, AnalystFeedback

router = APIRouter(prefix="/soc", tags=["SOC"])

@router.get("/overview", response_model=Dict[str, Any])
def get_soc_overview(db: Session = Depends(get_db)):
    """
    Get real SOC Overview Dashboard metrics derived directly from database telemetry.
    """
    return soc_service.get_soc_overview(db)

@router.get("/events", response_model=Dict[str, Any])
def list_events(
    event_type: Optional[str] = None,
    asset_id: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get paginated, indexed list of normalized security events.
    """
    query = db.query(SecurityEvent)
    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)
    if asset_id:
        query = query.filter(SecurityEvent.asset_id == asset_id)
    if severity:
        query = query.filter(SecurityEvent.severity == severity)

    events = query.order_by(SecurityEvent.timestamp.desc()).limit(limit).all()
    return {
        "count": len(events),
        "events": [{
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
    }

@router.get("/alerts", response_model=List[Dict[str, Any]])
def get_alerts(db: Session = Depends(get_db)):
    """
    Get list of real correlated SOC Alerts stored in DB.
    """
    alerts = db.query(Alert).order_by(Alert.first_seen.desc()).all()
    return [{
        "id": a.id,
        "code": a.code,
        "title": a.title,
        "description": a.description,
        "severity": a.severity,
        "source_ip": a.source_ip,
        "asset": a.asset_name or a.asset_id,
        "detection_rule": a.detection_rule,
        "mitre_technique": a.mitre_technique,
        "confidence": a.confidence,
        "status": a.status,
        "event_count": a.event_count,
        "first_seen": a.first_seen.isoformat() if a.first_seen else None,
        "incident_id": a.incident_id
    } for a in alerts]

@router.post("/alerts/{alert_id}/feedback")
def mark_alert_feedback(alert_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Mark alert feedback (TRUE_POSITIVE, FALSE_POSITIVE).
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    feedback_type = payload.get("feedback_type", "FALSE_POSITIVE")
    reason = payload.get("reason", "Analyst false positive feedback")

    if feedback_type == "FALSE_POSITIVE":
        alert.status = "FALSE_POSITIVE"

    fb = AnalystFeedback(
        alert_id=alert.id,
        feedback_type=feedback_type,
        reason=reason,
        analyst=payload.get("analyst", "analyst01")
    )
    db.add(fb)
    db.commit()

    return {"message": f"Alert {alert.code} updated with feedback {feedback_type}", "status": alert.status}

@router.get("/purple-team", response_model=Dict[str, Any])
def get_purple_team_status(db: Session = Depends(get_db)):
    """
    Get real MITRE ATT&CK detection coverage matrix and Purple Team exercise validation.
    """
    return purple_team_engine.evaluate_mitre_coverage(db)

@router.post("/demo-scenario", response_model=Dict[str, Any])
def trigger_soc_demo_scenario(db: Session = Depends(get_db)):
    """
    Triggers SOC-DEMO-001 controlled lab scenario:
    Generates real telemetry -> Correlation -> Detection -> Alert -> Incident -> MITRE mapping.
    """
    return soc_service.run_soc_demo_scenario(db)
