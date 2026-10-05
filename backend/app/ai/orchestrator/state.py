from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class InvestigationState:
    investigation_id: str
    investigation_code: str
    incident_id: Optional[str] = None
    trigger_type: str = "MANUAL_ANALYST"
    current_node: str = "INIT"
    events: List[Dict[str, Any]] = field(default_factory=list)
    alerts: List[Dict[str, Any]] = field(default_factory=list)
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    iocs: List[Dict[str, Any]] = field(default_factory=list)
    agent_runs: List[Dict[str, Any]] = field(default_factory=list)
    evidence_links: List[Dict[str, Any]] = field(default_factory=list)
    hypotheses: List[Dict[str, Any]] = field(default_factory=list)
    attack_paths: List[Dict[str, Any]] = field(default_factory=list)
    risk_assessment: Optional[Dict[str, Any]] = None
    response_plan: Optional[Dict[str, Any]] = None
    recommendations: List[Dict[str, Any]] = field(default_factory=list)
    summary: str = ""
    conclusion: str = ""
    evaluation: Optional[Dict[str, Any]] = None
    status: str = "RUNNING"
