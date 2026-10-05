from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import Incident, Evidence

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("")
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "code": i.code,
            "title": i.title,
            "severity": i.severity,
            "status": i.status,
            "source": i.source,
            "primary_asset": i.primary_asset,
            "technique": i.technique,
            "assigned_to": i.assigned_to,
            "detected_at": i.detected_at.strftime("%H:%M:%S")
        }
        for i in incidents
    ]

@router.get("/{incident_id}")
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter((Incident.id == incident_id) | (Incident.code == incident_id)).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    evidences = db.query(Evidence).filter(Evidence.incident_id == inc.id).all()

    return {
        "id": inc.id,
        "code": inc.code,
        "title": inc.title,
        "severity": inc.severity,
        "status": inc.status,
        "source": inc.source,
        "primary_asset": inc.primary_asset,
        "technique": inc.technique,
        "description": inc.description,
        "assigned_to": inc.assigned_to,
        "detected_at": inc.detected_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "evidence": [
            {
                "id": e.id,
                "source": e.source,
                "type": e.evidence_type,
                "description": e.description,
                "content": e.content,
                "sha256": e.sha256,
                "integrity": e.integrity_status,
                "collected_at": e.collected_at.strftime("%H:%M:%S")
            }
            for e in evidences
        ]
    }

@router.get("/{incident_id}/evidence")
def get_incident_evidence(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter((Incident.id == incident_id) | (Incident.code == incident_id)).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    evidences = db.query(Evidence).filter(Evidence.incident_id == inc.id).all()
    return [
        {
            "id": e.id,
            "source": e.source,
            "evidence_type": e.evidence_type,
            "description": e.description,
            "content": e.content,
            "sha256": e.sha256,
            "integrity_status": e.integrity_status,
            "collected_at": e.collected_at.strftime("%H:%M:%S")
        }
        for e in evidences
    ]
