from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.schemas import User, AIInvestigation
from app.ai.schemas.nexus_schemas import (
    TriggerInvestigationRequest,
    ApproveActionRequest,
    RAGIngestRequest,
    RAGSearchRequest
)
from app.ai.service import (
    create_ai_investigation,
    get_ai_investigation_detail,
    approve_action,
    reject_action
)
from app.ai.rag.ingestion import ingest_rag_document
from app.ai.rag.retriever import search_rag_chunks

router = APIRouter(prefix="/api/v1/nexus", tags=["NEXUS AI Security Brain"])

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

@router.post("/investigations", response_model=Dict[str, Any])
def trigger_investigation(
    req: TriggerInvestigationRequest,
    db: Session = Depends(get_db)
):
    current_user = get_current_user_helper(db)
    try:
        inv = create_ai_investigation(db, req, current_user.username)
        detail = get_ai_investigation_detail(db, inv.id)
        return {"status": "SUCCESS", "investigation": detail}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute NEXUS AI investigation: {str(e)}"
        )

@router.get("/investigations", response_model=Dict[str, Any])
def list_investigations(
    db: Session = Depends(get_db)
):
    investigations = db.query(AIInvestigation).order_by(AIInvestigation.created_at.desc()).all()
    res = []
    for inv in investigations:
        res.append({
            "id": inv.id,
            "investigation_code": inv.investigation_code,
            "title": inv.title,
            "incident_id": inv.incident_id,
            "status": inv.status,
            "trigger_type": inv.trigger_type,
            "confidence_score": inv.confidence_score,
            "created_by": inv.created_by,
            "created_at": inv.created_at
        })
    return {"investigations": res, "total": len(res)}

@router.get("/investigations/{investigation_id}", response_model=Dict[str, Any])
def get_investigation(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    detail = get_ai_investigation_detail(db, investigation_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"AI Investigation '{investigation_id}' not found."
        )
    return detail

@router.get("/investigations/{investigation_id}/attack-graph", response_model=Dict[str, Any])
def get_attack_graph(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    detail = get_ai_investigation_detail(db, investigation_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    paths = detail.get("attack_paths", [])
    if not paths:
        return {"nodes": [], "edges": []}

    path = paths[0]
    nodes = []
    edges = []

    seen_nodes = set()
    for edge in path.get("edges", []):
        src = edge["source_asset_name"]
        tgt = edge["target_asset_name"]
        if src not in seen_nodes:
            seen_nodes.add(src)
            nodes.append({"id": src, "label": src, "type": "SOURCE" if "ATTACKER" in src else "ASSET"})
        if tgt not in seen_nodes:
            seen_nodes.add(tgt)
            nodes.append({"id": tgt, "label": tgt, "type": "TARGET"})

        edges.append({
            "id": edge["id"],
            "source": src,
            "target": tgt,
            "action": edge["action_taken"],
            "technique": f"{edge['technique_id']} ({edge['technique_name']})",
            "evidence": edge["evidence_code"],
            "confidence": edge["confidence"]
        })

    return {"nodes": nodes, "edges": edges, "path_code": path["path_code"], "risk_score": path["risk_score"]}

@router.post("/response-actions/{action_id}/approve", response_model=Dict[str, Any])
def approve_response_action_endpoint(
    action_id: str,
    db: Session = Depends(get_db)
):
    current_user = get_current_user_helper(db)
    try:
        res = approve_action(db, action_id, current_user.username)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve response action: {str(e)}")

@router.post("/response-actions/{action_id}/reject", response_model=Dict[str, Any])
def reject_response_action_endpoint(
    action_id: str,
    req: ApproveActionRequest,
    db: Session = Depends(get_db)
):
    current_user = get_current_user_helper(db)
    try:
        res = reject_action(db, action_id, current_user.username, req.rejection_reason or "Analyst rejected")
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reject response action: {str(e)}")

@router.post("/rag/ingest", response_model=Dict[str, Any])
def ingest_rag_endpoint(
    req: RAGIngestRequest,
    db: Session = Depends(get_db)
):
    try:
        doc = ingest_rag_document(db, req.document_code, req.title, req.doc_type, req.content)
        return {"status": "SUCCESS", "document_id": doc.id, "document_code": doc.document_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG ingestion failed: {str(e)}")

@router.post("/rag/search", response_model=Dict[str, Any])
def search_rag_endpoint(
    req: RAGSearchRequest,
    db: Session = Depends(get_db)
):
    results = search_rag_chunks(db, req.query, req.top_k)
    return {"results": results, "total": len(results)}
