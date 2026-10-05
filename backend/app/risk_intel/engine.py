import json
import uuid
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.schemas import (
    KnowledgeGraphNode, KnowledgeGraphEdge, ThreatIntelFeedItem,
    AttackPathIntelligence, RiskPrioritizationItem, StrategicAdvisorRecommendation
)

class RiskIntelEngine:
    def seed_initial_knowledge_graph(self, db: Session):
        if db.query(KnowledgeGraphNode).count() == 0:
            nodes = [
                KnowledgeGraphNode(node_key="ASSET:WEB-01", label="WEB-01 (Nginx Web Gateway)", node_type="ASSET", risk_weight=8.0),
                KnowledgeGraphNode(node_key="ASSET:API-01", label="API-01 (Nexora Auth API)", node_type="ASSET", risk_weight=9.5),
                KnowledgeGraphNode(node_key="ASSET:DB-01", label="DB-01 (PostgreSQL Master DB)", node_type="ASSET", risk_weight=9.8),
                KnowledgeGraphNode(node_key="ASSET:CONTAINER-01", label="CONTAINER-01 (Worker Pod)", node_type="ASSET", risk_weight=7.5),
                KnowledgeGraphNode(node_key="VULN:CVE-2026-8812", label="CVE-2026-8812 (Unparametrized SQLi)", node_type="VULNERABILITY", risk_weight=9.0),
                KnowledgeGraphNode(node_key="THREAT:APT29", label="APT29 (Cozy Bear Threat Group)", node_type="THREAT_ACTOR", risk_weight=8.5),
                KnowledgeGraphNode(node_key="CONTROL:CTRL-AUTH-001", label="CTRL-AUTH-001 (Rate Limit)", node_type="CONTROL", risk_weight=9.2),
                KnowledgeGraphNode(node_key="TECHNIQUE:T1190", label="T1190 (Exploit Public-Facing App)", node_type="TECHNIQUE", risk_weight=8.8)
            ]
            db.add_all(nodes)
            db.commit()

            edges = [
                KnowledgeGraphEdge(source_node_key="ASSET:WEB-01", target_node_key="ASSET:API-01", relationship_type="EXPOSES", weight=1.0, evidence_citation="EVT-101"),
                KnowledgeGraphEdge(source_node_key="ASSET:API-01", target_node_key="VULN:CVE-2026-8812", relationship_type="HAS_VULNERABILITY", weight=1.0, evidence_citation="FND-001"),
                KnowledgeGraphEdge(source_node_key="ASSET:API-01", target_node_key="ASSET:DB-01", relationship_type="EXPOSES", weight=1.0, evidence_citation="EVT-102"),
                KnowledgeGraphEdge(source_node_key="THREAT:APT29", target_node_key="TECHNIQUE:T1190", relationship_type="EXPLOITS", weight=1.0, evidence_citation="IOC-001"),
                KnowledgeGraphEdge(source_node_key="TECHNIQUE:T1190", target_node_key="VULN:CVE-2026-8812", relationship_type="TARGETS", weight=1.0, evidence_citation="EVT-102"),
                KnowledgeGraphEdge(source_node_key="CONTROL:CTRL-AUTH-001", target_node_key="ASSET:API-01", relationship_type="PROTECTS", weight=1.0, evidence_citation="ALRT-SOC-8F92")
            ]
            db.add_all(edges)
            db.commit()

        if db.query(ThreatIntelFeedItem).count() == 0:
            feeds = [
                ThreatIntelFeedItem(
                    threat_code="TI-2026-001",
                    threat_actor="APT29 / ShadowWeb",
                    malware_family="NexoraSQLInjector",
                    cve_id="CVE-2026-8812",
                    description="Active exploitation campaign targeting unauthenticated REST endpoints to extract DB tokens.",
                    mitre_technique="T1190",
                    severity="CRITICAL"
                ),
                ThreatIntelFeedItem(
                    threat_code="TI-2026-002",
                    threat_actor="Lazarus Group",
                    malware_family="ContainerEscapeKit",
                    cve_id="CVE-2026-9921",
                    description="Targeted container breakout vector leveraging privileged Docker socket mounts.",
                    mitre_technique="T1611",
                    severity="HIGH"
                )
            ]
            db.add_all(feeds)
            db.commit()

        if db.query(AttackPathIntelligence).count() == 0:
            paths = [
                AttackPathIntelligence(
                    path_code="PATH-2026-001",
                    title="External Web Gateway to Production DB via API-01 SQLi",
                    entry_point="WEB-01 (External Web Application)",
                    target_asset="DB-01 (Production Database)",
                    choke_point_asset="API-01 (Gateway)",
                    total_hops=3,
                    path_risk_score=91.4,
                    exploitability_rating="HIGH",
                    mitigating_control_code="CTRL-AUTH-001"
                )
            ]
            db.add_all(paths)
            db.commit()

        if db.query(RiskPrioritizationItem).count() == 0:
            items = [
                RiskPrioritizationItem(
                    action_code="ACT-P0-001",
                    priority="P0",
                    title="Remediate SQL Injection in Nexora Auth Controller (API-01)",
                    description="Parametrize SQL queries in authentication handler to neutralize CVE-2026-8812.",
                    affected_asset="API-01",
                    cve_or_technique="CVE-2026-8812 / T1190",
                    business_impact="Prevents unauthorized extraction of transaction and user database records.",
                    effort_estimate="LOW (1-2 HOURS)"
                ),
                RiskPrioritizationItem(
                    action_code="ACT-P1-002",
                    priority="P1",
                    title="Enforce Docker Pod Isolation for CONTAINER-01",
                    description="Disconnect worker pod from host bridge network to restrict lateral movement.",
                    affected_asset="CONTAINER-01",
                    cve_or_technique="T1611",
                    business_impact="Mitigates container escape risk to host environment.",
                    effort_estimate="MEDIUM (3-4 HOURS)"
                )
            ]
            db.add_all(items)
            db.commit()

        if db.query(StrategicAdvisorRecommendation).count() == 0:
            rec = StrategicAdvisorRecommendation(
                recommendation_code="SAR-2026-001",
                executive_summary="Immediate remediation of API-01 SQL injection (CVE-2026-8812) will reduce organizational risk posture by 45.2%.",
                business_risk_translation="Protects Customer Transaction Processing & Financial Data Storage from unauthorized access.",
                recommended_control="Enforce Prepared Statements + Apply Container Pod Isolation",
                projected_risk_reduction=45.2,
                confidence_rating=95.0
            )
            db.add(rec)
            db.commit()

    def get_knowledge_graph(self, db: Session) -> Dict[str, Any]:
        self.seed_initial_knowledge_graph(db)
        nodes = db.query(KnowledgeGraphNode).all()
        edges = db.query(KnowledgeGraphEdge).all()

        nodes_res = [{
            "id": n.node_key,
            "label": n.label,
            "type": n.node_type,
            "risk_weight": n.risk_weight
        } for n in nodes]

        edges_res = [{
            "id": e.id,
            "source": e.source_node_key,
            "target": e.target_node_key,
            "relationship": e.relationship_type,
            "weight": e.weight,
            "evidence": e.evidence_citation
        } for e in edges]

        return {"nodes": nodes_res, "edges": edges_res, "total_nodes": len(nodes_res), "total_edges": len(edges_res)}

risk_intel_engine = RiskIntelEngine()
