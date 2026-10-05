from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import Finding, Retest
from app.exercises.service import exercise_service

router = APIRouter(prefix="/findings", tags=["Findings & Retesting"])

@router.get("")
def list_findings(db: Session = Depends(get_db)):
    findings = db.query(Finding).order_by(Finding.created_at.desc()).all()
    return [
        {
            "id": f.id,
            "finding_code": f.finding_code,
            "title": f.title,
            "asset_id": f.asset_id,
            "severity": f.severity,
            "risk_score": f.risk_score,
            "status": f.status,
            "created_at": f.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        for f in findings
    ]

@router.get("/{finding_id}")
def get_finding_detail(finding_id: str, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter((Finding.id == finding_id) | (Finding.finding_code == finding_id)).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    retests = db.query(Retest).filter(Retest.finding_id == finding.id).order_by(Retest.started_at.desc()).all()

    return {
        "id": finding.id,
        "finding_code": finding.finding_code,
        "asset_id": finding.asset_id,
        "title": finding.title,
        "description": finding.description,
        "severity": finding.severity,
        "risk_score": finding.risk_score,
        "impact": finding.impact,
        "evidence_summary": finding.evidence_summary,
        "recommendation": finding.recommendation,
        "verification_steps": finding.verification_steps,
        "status": finding.status,
        "created_at": finding.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "retests": [
            {
                "id": r.id,
                "result": r.result,
                "evidence_summary": r.evidence_summary,
                "verified_by": r.verified_by,
                "completed_at": r.completed_at.strftime("%H:%M:%S")
            }
            for r in retests
        ]
    }

@router.post("/{finding_id}/retest")
def retest_finding(finding_id: str, db: Session = Depends(get_db)):
    return exercise_service.retest_finding(db, finding_id)
