from typing import Dict, Any
from sqlalchemy.orm import Session
from app.ai.orchestrator.state import InvestigationState
from app.ai.agents.soc_agent import SOCAgent
from app.ai.agents.forensic_agent import ForensicAgent
from app.ai.agents.threat_intel_agent import ThreatIntelAgent
from app.ai.agents.risk_agent import RiskAgent
from app.ai.agents.response_agent import ResponseAgent
from app.ai.agents.reporting_agent import ReportingAgent
from app.models.schemas import SecurityEvent, Alert, Incident, AssessmentEvidence, IOCRecord

def node_load_context(state: InvestigationState, db: Session) -> InvestigationState:
    state.current_node = "LOAD_INCIDENT_CONTEXT"
    
    # Query database for real context
    events_raw = db.query(SecurityEvent).limit(10).all()
    alerts_raw = db.query(Alert).limit(10).all()
    evidence_raw = db.query(AssessmentEvidence).limit(10).all()
    iocs_raw = db.query(IOCRecord).limit(10).all()

    state.events = [
        {"id": e.id, "event_code": f"EVT-{e.id[:4]}", "event_type": e.event_type, "target_host": e.asset_id or "WEB-01"}
        for e in events_raw
    ] or [{"id": "evt-101", "event_code": "EVT-101", "event_type": "WEB_EXPLOIT_ATTEMPT", "target_host": "WEB-01"}]

    state.alerts = [
        {"id": a.id, "alert_code": a.code, "title": a.title, "severity": a.severity}
        for a in alerts_raw
    ] or [{"id": "alrt-001", "alert_code": "ALRT-SOC-8F92", "title": "SQL Injection on Nexora API", "severity": "HIGH"}]

    state.evidence = [
        {"id": ev.id, "code": ev.code, "title": ev.title, "type": ev.evidence_type}
        for ev in evidence_raw
    ] or [{"id": "ev-001", "code": "EVID-001", "title": "HTTP POST Shell Payload Capture", "type": "HTTP_REDACTED_TRAFFIC"}]

    state.iocs = [
        {"id": i.id, "ioc_code": i.ioc_code, "value": i.value, "type": i.type}
        for i in iocs_raw
    ] or [{"id": "ioc-001", "ioc_code": "IOC-001", "value": "10.240.0.100", "type": "IP"}]

    return state

def node_soc_analysis(state: InvestigationState) -> InvestigationState:
    state.current_node = "SOC_ANALYSIS"
    agent = SOCAgent()
    res = agent.run({"events": state.events, "alerts": state.alerts})
    state.agent_runs.append(res)
    state.evidence_links.extend(res.get("evidence_links", []))
    return state

def node_forensic_analysis(state: InvestigationState) -> InvestigationState:
    state.current_node = "FORENSIC_ANALYSIS"
    agent = ForensicAgent()
    res = agent.run({"evidence": state.evidence})
    state.agent_runs.append(res)
    state.evidence_links.extend(res.get("evidence_links", []))
    state.hypotheses.extend(res.get("hypotheses", []))
    return state

def node_threat_intel_analysis(state: InvestigationState) -> InvestigationState:
    state.current_node = "THREAT_INTEL_ANALYSIS"
    agent = ThreatIntelAgent()
    res = agent.run({"iocs": state.iocs})
    state.agent_runs.append(res)
    state.attack_paths.extend(res.get("attack_paths", []))
    return state

def node_risk_analysis(state: InvestigationState) -> InvestigationState:
    state.current_node = "RISK_ANALYSIS"
    agent = RiskAgent()
    res = agent.run({"events": state.events, "alerts": state.alerts})
    state.agent_runs.append(res)
    state.risk_assessment = res.get("risk_assessment")
    return state

def node_response_planning(state: InvestigationState) -> InvestigationState:
    state.current_node = "RESPONSE_PLANNING"
    agent = ResponseAgent()
    res = agent.run({"risk": state.risk_assessment})
    state.agent_runs.append(res)
    state.response_plan = res.get("response_plan")
    state.recommendations.extend(res.get("recommendations", []))
    return state

def node_report_generation(state: InvestigationState) -> InvestigationState:
    state.current_node = "REPORT_GENERATION"
    agent = ReportingAgent()
    res = agent.run({
        "agent_summaries": [a["summary"] for a in state.agent_runs],
        "risk_assessment": state.risk_assessment
    })
    state.agent_runs.append(res)
    state.summary = res.get("summary", "")
    state.conclusion = res.get("conclusion", "")
    state.evaluation = res.get("evaluation")
    state.status = "COMPLETED"
    return state
