import json
import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schemas import (
    AIInvestigation, AIAgentRun, AIEvidenceLink, AIHypothesis,
    AIRecommendation, AIAttackPath, AIAttackPathEdge, AIRiskAssessment,
    AIResponsePlan, AIResponseAction, AIResponseApproval, AIEvaluation,
    AuditLog
)
from app.ai.schemas.nexus_schemas import TriggerInvestigationRequest
from app.ai.orchestrator.graph import NEXUSOrchestrator
from app.ai.security.tool_policy import validate_response_action
from app.ai.rag.ingestion import ingest_rag_document
from app.ai.rag.retriever import search_rag_chunks

def create_ai_investigation(db: Session, req: TriggerInvestigationRequest, username: str = "analyst01") -> AIInvestigation:
    count = db.query(AIInvestigation).count()
    inv_code = f"NEXUS-INV-2026-{(count + 1):03d}"

    inv = AIInvestigation(
        investigation_code=inv_code,
        title=req.title or f"NEXUS AI Investigation ({inv_code})",
        description=req.description,
        incident_id=req.incident_id,
        status="RUNNING",
        trigger_type=req.trigger_type,
        model_used=req.model_name or "CYBERNEXUS-Security-LLM-v1",
        created_by=username
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    # Log Audit
    audit = AuditLog(
        username=username,
        role="SECURITY_ANALYST",
        action="TRIGGER_NEXUS_AI_INVESTIGATION",
        target=inv_code,
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()

    # Launch multi-agent pipeline
    orchestrator = NEXUSOrchestrator(db)
    orchestrator.run_investigation(
        investigation_id=inv.id,
        investigation_code=inv.investigation_code,
        incident_id=req.incident_id,
        trigger_type=req.trigger_type
    )

    db.refresh(inv)
    return inv

def get_ai_investigation_detail(db: Session, investigation_id: str) -> Optional[Dict[str, Any]]:
    inv = db.query(AIInvestigation).filter(
        (AIInvestigation.id == investigation_id) | (AIInvestigation.investigation_code == investigation_id)
    ).first()

    if not inv:
        return None

    # Format detail dict
    agent_runs = [
        {
            "id": r.id,
            "agent_name": r.agent_name,
            "status": r.status,
            "input_summary": r.input_summary,
            "output_summary": r.output_summary,
            "tokens_used": r.tokens_used,
            "created_at": r.created_at,
            "completed_at": r.completed_at
        } for r in inv.agent_runs
    ]

    evidence_links = [
        {
            "id": e.id,
            "evidence_type": e.evidence_type,
            "evidence_id": e.evidence_id,
            "evidence_code": e.evidence_code,
            "relevance_score": e.relevance_score,
            "citation_text": e.citation_text
        } for e in inv.evidence_links
    ]

    hypotheses = [
        {
            "id": h.id,
            "hypothesis_code": h.hypothesis_code,
            "title": h.title,
            "description": h.description,
            "confidence_level": h.confidence_level,
            "mitre_technique": h.mitre_technique,
            "supporting_evidence_codes": json.loads(h.supporting_evidence_codes_json or '[]'),
            "status": h.status
        } for h in inv.hypotheses
    ]

    recommendations = [
        {
            "id": r.id,
            "recommendation_code": r.recommendation_code,
            "title": r.title,
            "description": r.description,
            "action_type": r.action_type,
            "priority": r.priority,
            "risk_impact": r.risk_impact,
            "evidence_citations": json.loads(r.evidence_citations_json or '[]')
        } for r in inv.recommendations
    ]

    attack_paths = []
    for ap in inv.attack_paths:
        edges = [
            {
                "id": ed.id,
                "step_number": ed.step_number,
                "source_asset_name": ed.source_asset_name,
                "target_asset_name": ed.target_asset_name,
                "action_taken": ed.action_taken,
                "technique_id": ed.technique_id,
                "technique_name": ed.technique_name,
                "evidence_code": ed.evidence_code,
                "confidence": ed.confidence
            } for ed in ap.edges
        ]
        attack_paths.append({
            "id": ap.id,
            "path_code": ap.path_code,
            "title": ap.title,
            "description": ap.description,
            "start_node": ap.start_node,
            "target_node": ap.target_node,
            "total_steps": ap.total_steps,
            "risk_score": ap.risk_score,
            "edges": sorted(edges, key=lambda x: x["step_number"])
        })

    risk_assessments = [
        {
            "id": ra.id,
            "cvss_score": ra.cvss_score,
            "business_impact_score": ra.business_impact_score,
            "overall_risk_score": ra.overall_risk_score,
            "severity": ra.severity,
            "exposure_vector": ra.exposure_vector,
            "affected_assets": json.loads(ra.affected_assets_json or '[]'),
            "explaining_factors": json.loads(ra.explaining_factors_json or '[]'),
            "created_at": ra.created_at
        } for ra in inv.risk_assessments
    ]

    response_plans = []
    for rp in inv.response_plans:
        actions = []
        for act in rp.actions:
            app_dict = None
            if act.approval:
                app_dict = {
                    "id": act.approval.id,
                    "approver_username": act.approval.approver_username,
                    "approval_status": act.approval.approval_status,
                    "rejection_reason": act.approval.rejection_reason,
                    "decided_at": act.approval.decided_at
                }
            actions.append({
                "id": act.id,
                "action_code": act.action_code,
                "target_asset_name": act.target_asset_name,
                "target_ip": act.target_ip,
                "action_type": act.action_type,
                "command_to_execute": act.command_to_execute,
                "risk_level": act.risk_level,
                "is_lab_contained": act.is_lab_contained,
                "status": act.status,
                "execution_result": json.loads(act.execution_result_json or '{}') if act.execution_result_json else None,
                "created_at": act.created_at,
                "approval": app_dict
            })
        response_plans.append({
            "id": rp.id,
            "plan_code": rp.plan_code,
            "title": rp.title,
            "status": rp.status,
            "created_at": rp.created_at,
            "actions": actions
        })

    evaluations = [
        {
            "id": ev.id,
            "groundedness_score": ev.groundedness_score,
            "hallucination_rate": ev.hallucination_rate,
            "citation_precision": ev.citation_precision,
            "is_passed": ev.is_passed,
            "notes": ev.notes
        } for ev in inv.evaluations
    ]

    return {
        "id": inv.id,
        "investigation_code": inv.investigation_code,
        "title": inv.title,
        "description": inv.description,
        "incident_id": inv.incident_id,
        "status": inv.status,
        "trigger_type": inv.trigger_type,
        "model_used": inv.model_used,
        "summary": inv.summary,
        "conclusion": inv.conclusion,
        "confidence_score": inv.confidence_score,
        "created_by": inv.created_by,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
        "agent_runs": agent_runs,
        "evidence_links": evidence_links,
        "hypotheses": hypotheses,
        "recommendations": recommendations,
        "attack_paths": attack_paths,
        "risk_assessments": risk_assessments,
        "response_plans": response_plans,
        "evaluations": evaluations
    }

def approve_action(db: Session, action_id: str, approver_username: str = "analyst01") -> Dict[str, Any]:
    act = db.query(AIResponseAction).filter(AIResponseAction.id == action_id).first()
    if not act:
        raise ValueError(f"Action '{action_id}' not found.")

    # Enforce tool security policy
    validate_response_action(act.action_type, act.target_ip, act.target_asset_name)

    act.status = "APPROVED"

    approval = AIResponseApproval(
        action_id=act.id,
        approver_username=approver_username,
        approval_status="APPROVED",
        decided_at=datetime.datetime.utcnow()
    )
    db.add(approval)

    # Simulated execution inside Docker lab environment
    act.status = "EXECUTED"
    act.execution_result_json = json.dumps({
        "result": "SUCCESS",
        "output": f"Executed '{act.command_to_execute}' on isolated lab asset {act.target_asset_name} ({act.target_ip}). Pod network state updated.",
        "executed_at": str(datetime.datetime.utcnow())
    })

    db.commit()

    # Log Audit
    audit = AuditLog(
        username=approver_username,
        role="SECURITY_ANALYST",
        action="APPROVE_NEXUS_RESPONSE_ACTION",
        target=act.action_code,
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "APPROVED_AND_EXECUTED",
        "action_code": act.action_code,
        "target_asset": act.target_asset_name,
        "command": act.command_to_execute,
        "execution_result": json.loads(act.execution_result_json)
    }

def reject_action(db: Session, action_id: str, approver_username: str = "analyst01", reason: str = "Analyst rejected action") -> Dict[str, Any]:
    act = db.query(AIResponseAction).filter(AIResponseAction.id == action_id).first()
    if not act:
        raise ValueError(f"Action '{action_id}' not found.")

    act.status = "REJECTED"

    approval = AIResponseApproval(
        action_id=act.id,
        approver_username=approver_username,
        approval_status="REJECTED",
        rejection_reason=reason,
        decided_at=datetime.datetime.utcnow()
    )
    db.add(approval)
    db.commit()

    # Log Audit
    audit = AuditLog(
        username=approver_username,
        role="SECURITY_ANALYST",
        action="REJECT_NEXUS_RESPONSE_ACTION",
        target=act.action_code,
        result="REJECTED"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "REJECTED",
        "action_code": act.action_code,
        "reason": reason
    }
