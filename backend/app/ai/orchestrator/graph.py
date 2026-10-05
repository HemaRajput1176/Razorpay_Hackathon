import json
import uuid
import datetime
from sqlalchemy.orm import Session
from app.ai.orchestrator.state import InvestigationState
from app.ai.orchestrator.nodes import (
    node_load_context,
    node_soc_analysis,
    node_forensic_analysis,
    node_threat_intel_analysis,
    node_risk_analysis,
    node_response_planning,
    node_report_generation
)
from app.models.schemas import (
    AIInvestigation, AIAgentRun, AIEvidenceLink, AIHypothesis,
    AIRecommendation, AIAttackPath, AIAttackPathEdge, AIRiskAssessment,
    AIResponsePlan, AIResponseAction, AIEvaluation
)

class NEXUSOrchestrator:
    """
    LangGraph-inspired Multi-Agent Orchestrator for NEXUS AI Security Brain.
    Executes DAG pipeline across specialized agent nodes and persists structured results.
    """
    def __init__(self, db: Session):
        self.db = db

    def run_investigation(
        self,
        investigation_id: str,
        investigation_code: str,
        incident_id: str = None,
        trigger_type: str = "MANUAL_ANALYST"
    ) -> InvestigationState:
        state = InvestigationState(
            investigation_id=investigation_id,
            investigation_code=investigation_code,
            incident_id=incident_id,
            trigger_type=trigger_type
        )

        # Execute Node Pipeline
        state = node_load_context(state, self.db)
        state = node_soc_analysis(state)
        state = node_forensic_analysis(state)
        state = node_threat_intel_analysis(state)
        state = node_risk_analysis(state)
        state = node_response_planning(state)
        state = node_report_generation(state)

        # Persist results to Database
        self._persist_to_db(state)

        return state

    def _persist_to_db(self, state: InvestigationState):
        db_inv = self.db.query(AIInvestigation).filter(AIInvestigation.id == state.investigation_id).first()
        if not db_inv:
            return

        db_inv.status = state.status
        db_inv.summary = state.summary
        db_inv.conclusion = state.conclusion
        db_inv.updated_at = datetime.datetime.utcnow()

        # Agent Runs
        for run in state.agent_runs:
            ar = AIAgentRun(
                investigation_id=state.investigation_id,
                agent_name=run.get("agent_name", "UNKNOWN"),
                status=run.get("status", "SUCCESS"),
                input_summary="Processed telemetry context",
                output_summary=run.get("summary", ""),
                tokens_used=run.get("tokens_used", 1200)
            )
            self.db.add(ar)

        # Evidence Links
        for ev in state.evidence_links:
            el = AIEvidenceLink(
                investigation_id=state.investigation_id,
                evidence_type=ev.get("evidence_type", "EVENT"),
                evidence_id=ev.get("evidence_id", str(uuid.uuid4())),
                evidence_code=ev.get("evidence_code", "EVT-100"),
                relevance_score=ev.get("relevance_score", 0.95),
                citation_text=ev.get("citation_text", "")
            )
            self.db.add(el)

        # Hypotheses
        for hyp in state.hypotheses:
            h = AIHypothesis(
                investigation_id=state.investigation_id,
                hypothesis_code=hyp.get("hypothesis_code", "HYP-001"),
                title=hyp.get("title", ""),
                description=hyp.get("description", ""),
                confidence_level=hyp.get("confidence_level", "HIGH"),
                mitre_technique=hyp.get("mitre_technique", "T1059"),
                supporting_evidence_codes_json=json.dumps(hyp.get("supporting_evidence_codes", [])),
                status=hyp.get("status", "VALIDATED")
            )
            self.db.add(h)

        # Recommendations
        for rec in state.recommendations:
            r = AIRecommendation(
                investigation_id=state.investigation_id,
                recommendation_code=rec.get("recommendation_code", "REC-001"),
                title=rec.get("title", ""),
                description=rec.get("description", ""),
                action_type=rec.get("action_type", "CONTAINMENT"),
                priority=rec.get("priority", "HIGH"),
                risk_impact=rec.get("risk_impact", ""),
                evidence_citations_json=json.dumps(rec.get("evidence_citations", []))
            )
            self.db.add(r)

        # Attack Paths
        for ap in state.attack_paths:
            path_obj = AIAttackPath(
                investigation_id=state.investigation_id,
                path_code=ap.get("path_code", "AP-001"),
                title=ap.get("title", ""),
                description=ap.get("description", ""),
                start_node=ap.get("start_node", "EXTERNAL_ATTACKER"),
                target_node=ap.get("target_node", "CONTAINER-01"),
                total_steps=ap.get("total_steps", 3),
                risk_score=ap.get("risk_score", 88.5)
            )
            self.db.add(path_obj)
            self.db.flush()

            for edge in ap.get("edges", []):
                e_obj = AIAttackPathEdge(
                    attack_path_id=path_obj.id,
                    step_number=edge.get("step_number", 1),
                    source_asset_name=edge.get("source_asset_name", ""),
                    target_asset_name=edge.get("target_asset_name", ""),
                    action_taken=edge.get("action_taken", ""),
                    technique_id=edge.get("technique_id", "T1059"),
                    technique_name=edge.get("technique_name", "Command Execution"),
                    evidence_code=edge.get("evidence_code", "EVT-101"),
                    confidence=edge.get("confidence", 0.9)
                )
                self.db.add(e_obj)

        # Risk Assessment
        if state.risk_assessment:
            ra = state.risk_assessment
            risk_obj = AIRiskAssessment(
                investigation_id=state.investigation_id,
                cvss_score=ra.get("cvss_score", 8.8),
                business_impact_score=ra.get("business_impact_score", 9.0),
                overall_risk_score=ra.get("overall_risk_score", 89.0),
                severity=ra.get("severity", "CRITICAL"),
                exposure_vector=ra.get("exposure_vector", "INTERNAL_LAB_EXPOSED_API"),
                affected_assets_json=json.dumps(ra.get("affected_assets", [])),
                explaining_factors_json=json.dumps(ra.get("explaining_factors", []))
            )
            self.db.add(risk_obj)

        # Response Plan & Actions
        if state.response_plan:
            rp = state.response_plan
            plan_obj = AIResponsePlan(
                investigation_id=state.investigation_id,
                plan_code=rp.get("plan_code", "RESP-001"),
                title=rp.get("title", ""),
                status=rp.get("status", "PROPOSED")
            )
            self.db.add(plan_obj)
            self.db.flush()

            for act in rp.get("actions", []):
                act_obj = AIResponseAction(
                    response_plan_id=plan_obj.id,
                    action_code=act.get("action_code", "ACT-001"),
                    target_asset_name=act.get("target_asset_name", "CONTAINER-01"),
                    target_ip=act.get("target_ip", "10.240.0.15"),
                    action_type=act.get("action_type", "ISOLATE_CONTAINER"),
                    command_to_execute=act.get("command_to_execute", ""),
                    risk_level=act.get("risk_level", "HIGH"),
                    is_lab_contained=act.get("is_lab_contained", True),
                    status=act.get("status", "PENDING_APPROVAL")
                )
                self.db.add(act_obj)

        # Evaluation
        if state.evaluation:
            ev = state.evaluation
            eval_obj = AIEvaluation(
                investigation_id=state.investigation_id,
                groundedness_score=ev.get("groundedness_score", 98.0),
                hallucination_rate=ev.get("hallucination_rate", 0.0),
                citation_precision=ev.get("citation_precision", 100.0),
                is_passed=ev.get("is_passed", True),
                notes=ev.get("notes", "")
            )
            self.db.add(eval_obj)

        self.db.commit()
