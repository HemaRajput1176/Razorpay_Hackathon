from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.exercises.service import exercise_service
from app.exercises.validators import preflight_validator
from app.models.schemas import ExerciseRun, ExerciseStep, TelemetryEvent

router = APIRouter(prefix="/exercises", tags=["Security Exercises"])

@router.get("")
def list_exercises(db: Session = Depends(get_db)):
    exercises = exercise_service.get_exercises(db)
    return [
        {
            "id": e.id,
            "code": e.code,
            "name": e.name,
            "slug": e.slug,
            "description": e.description,
            "category": e.category,
            "difficulty": e.difficulty,
            "primary_target": e.primary_target,
            "supporting_targets": e.supporting_targets,
            "status": e.status
        }
        for e in exercises
    ]

@router.get("/{exercise_id}")
def get_exercise_detail(exercise_id: str, db: Session = Depends(get_db)):
    ex = exercise_service.get_exercise(db, exercise_id)
    return {
        "id": ex.id,
        "code": ex.code,
        "name": ex.name,
        "slug": ex.slug,
        "description": ex.description,
        "category": ex.category,
        "difficulty": ex.difficulty,
        "primary_target": ex.primary_target,
        "supporting_targets": ex.supporting_targets,
        "status": ex.status,
        "scope": {
            "authorized_lab": "NEXORA ENTERPRISE LAB",
            "primary_asset": "WEB-01 (10.240.0.10)",
            "supporting_assets": ["API-01 (10.240.0.11)", "DB-01 (10.240.0.12)"],
            "environment": "LOCAL ISOLATED CYBER RANGE",
            "external_targets": "NONE"
        }
    }

@router.post("/{exercise_id}/preflight")
def run_preflight(exercise_id: str, db: Session = Depends(get_db)):
    ex = exercise_service.get_exercise(db, exercise_id)
    return preflight_validator.validate_preflight(db, ex.code)

@router.post("/{exercise_id}/start")
def start_exercise(exercise_id: str, db: Session = Depends(get_db)):
    ex = exercise_service.get_exercise(db, exercise_id)
    return exercise_service.execute_exercise(db, ex.code)

@router.post("/{exercise_id}/cancel")
def cancel_exercise(exercise_id: str, db: Session = Depends(get_db)):
    ex = exercise_service.get_exercise(db, exercise_id)
    ex.status = "READY"
    db.commit()
    return {"status": "CANCELLED", "message": "Exercise execution sequence cancelled."}

@router.get("/{exercise_id}/runs")
def list_exercise_runs(exercise_id: str, db: Session = Depends(get_db)):
    ex = exercise_service.get_exercise(db, exercise_id)
    runs = db.query(ExerciseRun).filter(ExerciseRun.exercise_id == ex.id).order_by(ExerciseRun.started_at.desc()).all()
    return [
        {
            "id": r.id,
            "run_code": r.run_code,
            "started_by": r.started_by,
            "started_at": r.started_at.strftime("%Y-%m-%d %H:%M:%S"),
            "status": r.status,
            "result": r.result,
            "score": r.score
        }
        for r in runs
    ]

@router.get("/runs/{run_id}/timeline")
def get_run_timeline(run_id: str, db: Session = Depends(get_db)):
    steps = db.query(ExerciseStep).filter(ExerciseStep.exercise_run_id == run_id).order_by(ExerciseStep.step_number.asc()).all()
    telemetry = db.query(TelemetryEvent).filter(TelemetryEvent.exercise_run_id == run_id).order_by(TelemetryEvent.timestamp.asc()).all()

    return {
        "run_id": run_id,
        "steps": [
            {
                "step_number": s.step_number,
                "name": s.name,
                "description": s.description,
                "status": s.status,
                "timestamp": s.completed_at.strftime("%H:%M:%S")
            }
            for s in steps
        ],
        "telemetry": [
            {
                "id": t.id,
                "request_id": t.request_id,
                "source": t.source,
                "event_type": t.event_type,
                "action": t.action,
                "severity": t.severity,
                "timestamp": t.timestamp.strftime("%H:%M:%S")
            }
            for t in telemetry
        ]
    }
