import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.database.session import get_db
from app.assessment.service import assessment_service, ACTIVE_ASSESSMENT_TASKS

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("", response_model=Dict[str, Any])
def list_assessments(db: Session = Depends(get_db)):
    """
    List all security assessments with summary metrics.
    """
    return assessment_service.list_assessments(db)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_assessment(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Create a new security assessment with mandatory scope attestation & SSRF validation.
    """
    try:
        return assessment_service.create_assessment(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create assessment: {str(e)}")

@router.get("/{assessment_id}", response_model=Dict[str, Any])
def get_assessment_detail(assessment_id: str, db: Session = Depends(get_db)):
    """
    Get detailed assessment object with scope, assets, URLs, endpoints, findings, and evidence.
    """
    asm = assessment_service.get_assessment(db, assessment_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return asm

@router.post("/{assessment_id}/start")
def start_assessment(assessment_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Launch background assessment execution engine.
    """
    asm = assessment_service.get_assessment(db, assessment_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if asm["status"] == "RUNNING":
        return {"message": "Assessment is already running", "status": "RUNNING"}

    # Schedule background task
    task = asyncio.create_task(assessment_service.execute_assessment_pipeline(asm["id"]))
    ACTIVE_ASSESSMENT_TASKS[asm["id"]] = task

    return {
        "message": f"Security Assessment {asm['code']} launched successfully.",
        "status": "RUNNING",
        "assessment_id": asm["id"]
    }

@router.post("/{assessment_id}/stop")
def stop_assessment(assessment_id: str, db: Session = Depends(get_db)):
    """
    Stop a running security assessment.
    """
    asm = assessment_service.get_assessment(db, assessment_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if assessment_id in ACTIVE_ASSESSMENT_TASKS:
        ACTIVE_ASSESSMENT_TASKS[assessment_id].cancel()
        del ACTIVE_ASSESSMENT_TASKS[assessment_id]

    # Update state in DB
    from app.models.schemas import Assessment, RedactedLog
    assessment = db.query(Assessment).filter(Assessment.id == asm["id"]).first()
    if assessment:
        assessment.status = "STOPPED"
        stop_log = RedactedLog(
            assessment_id=assessment.id,
            level="WARN",
            message="[USER_ACTION] Security Assessment manually stopped by security operator."
        )
        db.add(stop_log)
        db.commit()

    return {"message": "Assessment stopped successfully", "status": "STOPPED"}

@router.post("/{assessment_id}/retest")
def retest_assessment(assessment_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Re-test security assessment findings to validate fixes.
    """
    asm = assessment_service.get_assessment(db, assessment_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")

    task = asyncio.create_task(assessment_service.execute_assessment_pipeline(asm["id"]))
    ACTIVE_ASSESSMENT_TASKS[asm["id"]] = task

    return {"message": "Re-test assessment pipeline launched", "status": "RUNNING"}
