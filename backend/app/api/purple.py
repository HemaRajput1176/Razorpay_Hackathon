from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.database.session import get_db
from app.models.schemas import (
    PurpleTeamExercise, PurpleExerciseRun, SecurityControl,
    RetestRun, DetectionGapRecord, SecurityPostureSnapshot, User
)
from app.purple.engine import purple_engine

router = APIRouter(prefix="/api/purple", tags=["Purple Team Continuous Validation Engine"])

def get_current_user_helper(db: Session) -> User:
    user = db.query(User).filter(User.username == "analyst01").first()
    if not user:
        user = User(
            username="analyst01",
            email="analyst@cybernexus.com",
            hashed_password="default_hash",
            full_name="Analyst 01",
            role="CHIEF SECURITY ANALYST",
            organization="NEXORA ENTERPRISE LAB"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

class CreateExerciseRequest(BaseModel):
    name: str
    description: str
    objective: str
    asset_ids: List[str]
    technique_ids: List[str]
    authorization_scope: str = "10.240.0.0/16"

@router.get("/exercises", response_model=Dict[str, Any])
def list_exercises(db: Session = Depends(get_db)):
    purple_engine.seed_initial_purple_data(db)
    exs = db.query(PurpleTeamExercise).order_by(PurpleTeamExercise.created_at.desc()).all()
    res = []
    for e in exs:
        res.append({
            "id": e.id,
            "exercise_code": e.exercise_code,
            "name": e.name,
            "objective": e.objective,
            "environment": e.environment,
            "risk_level": e.risk_level,
            "authorization_scope": e.authorization_scope,
            "status": e.status,
            "created_at": e.created_at
        })
    return {"exercises": res, "total": len(res)}

@router.post("/exercises", response_model=Dict[str, Any])
def create_exercise(req: CreateExerciseRequest, db: Session = Depends(get_db)):
    import json
    count = db.query(PurpleTeamExercise).count()
    code = f"PT-EX-2026-{(count + 1):03d}"

    ex = PurpleTeamExercise(
        exercise_code=code,
        name=req.name,
        description=req.description,
        objective=req.objective,
        environment="CYBERNEXUS_LAB",
        asset_ids_json=json.dumps(req.asset_ids),
        technique_ids_json=json.dumps(req.technique_ids),
        authorization_scope=req.authorization_scope,
        status="READY"
    )
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return {"status": "SUCCESS", "exercise_code": ex.exercise_code, "id": ex.id}

@router.get("/exercises/{exercise_id}", response_model=Dict[str, Any])
def get_exercise_detail(exercise_id: str, db: Session = Depends(get_db)):
    import json
    ex = db.query(PurpleTeamExercise).filter(
        (PurpleTeamExercise.id == exercise_id) | (PurpleTeamExercise.exercise_code == exercise_id)
    ).first()

    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    runs = db.query(PurpleExerciseRun).filter(PurpleExerciseRun.exercise_id == ex.id).all()
    runs_res = [{
        "id": r.id,
        "run_code": r.run_code,
        "started_at": r.started_at,
        "status": r.status,
        "risk_before": r.risk_before,
        "risk_after": r.risk_after,
        "coverage_result": r.coverage_result,
        "purple_score": r.purple_score
    } for r in runs]

    return {
        "id": ex.id,
        "exercise_code": ex.exercise_code,
        "name": ex.name,
        "description": ex.description,
        "objective": ex.objective,
        "environment": ex.environment,
        "asset_ids": json.loads(ex.asset_ids_json or '[]'),
        "technique_ids": json.loads(ex.technique_ids_json or '[]'),
        "expected_events": json.loads(ex.expected_events_json or '[]'),
        "expected_detection_rules": json.loads(ex.expected_detection_rules_json or '[]'),
        "risk_level": ex.risk_level,
        "authorization_scope": ex.authorization_scope,
        "status": ex.status,
        "runs": runs_res
    }

@router.post("/exercises/{exercise_id}/run", response_model=Dict[str, Any])
def run_purple_exercise(exercise_id: str, db: Session = Depends(get_db)):
    user = get_current_user_helper(db)
    try:
        run = purple_engine.run_exercise(db, exercise_id, user.username)
        return {"status": "SUCCESS", "run_code": run.run_code, "purple_score": run.purple_score, "coverage_result": run.coverage_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard", response_model=Dict[str, Any])
def get_purple_dashboard(db: Session = Depends(get_db)):
    purple_engine.seed_initial_purple_data(db)
    posture = purple_engine.calculate_posture_score(db)
    runs = db.query(PurpleExerciseRun).all()
    controls = db.query(SecurityControl).all()
    retests = db.query(RetestRun).all()

    return {
        "posture": posture,
        "total_exercises_run": len(runs),
        "total_controls": len(controls),
        "total_retests": len(retests),
        "pass_count": sum(1 for r in runs if r.coverage_result == 'PASS'),
        "gap_count": sum(1 for r in runs if r.coverage_result == 'GAP'),
        "recent_runs": [{
            "id": r.id,
            "run_code": r.run_code,
            "coverage_result": r.coverage_result,
            "purple_score": r.purple_score,
            "started_at": r.started_at
        } for r in runs[:5]]
    }

@router.post("/retests", response_model=Dict[str, Any])
def execute_retest_endpoint(exercise_id: str, db: Session = Depends(get_db)):
    try:
        retest = purple_engine.execute_retest(db, exercise_id)
        return {
            "status": "SUCCESS",
            "retest_code": retest.retest_code,
            "risk_before": retest.risk_before,
            "risk_after": retest.risk_after,
            "risk_reduction": f"{retest.risk_reduction_percentage}%",
            "detection_before": retest.detection_before,
            "detection_after": retest.detection_after,
            "final_status": retest.final_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
