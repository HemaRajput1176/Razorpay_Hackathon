from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database.session import get_db
from app.models.schemas import (
    KnowledgeGraphNode, KnowledgeGraphEdge, ThreatIntelFeedItem,
    AttackPathIntelligence, RiskPrioritizationItem, StrategicAdvisorRecommendation
)
from app.risk_intel.engine import risk_intel_engine

router = APIRouter(prefix="/api/v1/risk-intel", tags=["Continuous Cyber Risk Intelligence Engine"])

@router.get("/overview", response_model=Dict[str, Any])
def get_risk_intel_overview(db: Session = Depends(get_db)):
    risk_intel_engine.seed_initial_knowledge_graph(db)

    nodes_count = db.query(KnowledgeGraphNode).count()
    edges_count = db.query(KnowledgeGraphEdge).count()
    threats_count = db.query(ThreatIntelFeedItem).count()
    paths_count = db.query(AttackPathIntelligence).count()
    actions_count = db.query(RiskPrioritizationItem).count()

    p0_count = db.query(RiskPrioritizationItem).filter(RiskPrioritizationItem.priority == "P0").count()
    p1_count = db.query(RiskPrioritizationItem).filter(RiskPrioritizationItem.priority == "P1").count()

    advisor_rec = db.query(StrategicAdvisorRecommendation).first()

    return {
        "summary": {
            "knowledge_graph_nodes": nodes_count,
            "knowledge_graph_edges": edges_count,
            "active_threat_feeds": threats_count,
            "discovered_attack_paths": paths_count,
            "prioritized_actions_count": actions_count,
            "p0_critical_actions": p0_count,
            "p1_high_actions": p1_count
        },
        "strategic_advisor_summary": advisor_rec.executive_summary if advisor_rec else "NEXUS Strategic Risk Advisor ready."
    }

@router.get("/knowledge-graph", response_model=Dict[str, Any])
def get_knowledge_graph_endpoint(db: Session = Depends(get_db)):
    return risk_intel_engine.get_knowledge_graph(db)

@router.get("/threat-intel", response_model=Dict[str, Any])
def get_threat_intel_feeds(db: Session = Depends(get_db)):
    feeds = db.query(ThreatIntelFeedItem).order_by(ThreatIntelFeedItem.published_at.desc()).all()
    res = [{
        "id": f.id,
        "threat_code": f.threat_code,
        "threat_actor": f.threat_actor,
        "malware_family": f.malware_family,
        "cve_id": f.cve_id,
        "description": f.description,
        "mitre_technique": f.mitre_technique,
        "severity": f.severity,
        "published_at": f.published_at
    } for f in feeds]
    return {"threat_feeds": res, "total": len(res)}

@router.get("/attack-paths", response_model=Dict[str, Any])
def get_attack_paths_endpoint(db: Session = Depends(get_db)):
    paths = db.query(AttackPathIntelligence).all()
    res = [{
        "id": p.id,
        "path_code": p.path_code,
        "title": p.title,
        "entry_point": p.entry_point,
        "target_asset": p.target_asset,
        "choke_point_asset": p.choke_point_asset,
        "total_hops": p.total_hops,
        "path_risk_score": p.path_risk_score,
        "exploitability_rating": p.exploitability_rating,
        "mitigating_control_code": p.mitigating_control_code
    } for p in paths]
    return {"attack_paths": res, "total": len(res)}

@router.get("/prioritized-actions", response_model=Dict[str, Any])
def get_prioritized_actions(db: Session = Depends(get_db)):
    items = db.query(RiskPrioritizationItem).order_by(RiskPrioritizationItem.priority.asc()).all()
    res = [{
        "id": i.id,
        "action_code": i.action_code,
        "priority": i.priority,
        "title": i.title,
        "description": i.description,
        "affected_asset": i.affected_asset,
        "cve_or_technique": i.cve_or_technique,
        "business_impact": i.business_impact,
        "effort_estimate": i.effort_estimate,
        "status": i.status
    } for i in items]
    return {"actions": res, "total": len(res)}

@router.get("/strategic-advisor", response_model=Dict[str, Any])
def get_strategic_advisor_endpoint(db: Session = Depends(get_db)):
    rec = db.query(StrategicAdvisorRecommendation).first()
    if not rec:
        return {"recommendation": None}

    import json
    return {
        "id": rec.id,
        "recommendation_code": rec.recommendation_code,
        "executive_summary": rec.executive_summary,
        "business_risk_translation": rec.business_risk_translation,
        "recommended_control": rec.recommended_control,
        "projected_risk_reduction": f"{rec.projected_risk_reduction}%",
        "confidence_rating": f"{rec.confidence_rating}%",
        "evidence_citations": json.loads(rec.evidence_citations_json or '[]')
    }
