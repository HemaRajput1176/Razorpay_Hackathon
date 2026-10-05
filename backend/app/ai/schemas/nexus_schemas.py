from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TriggerInvestigationRequest(BaseModel):
    incident_id: Optional[str] = None
    trigger_type: str = "MANUAL_ANALYST" # AUTOMATIC_SOC, MANUAL_ANALYST, THREAT_HUNT
    title: Optional[str] = "NEXUS AI Security Investigation"
    description: Optional[str] = "Automated multi-agent security reasoning and investigation"
    model_name: Optional[str] = "CYBERNEXUS-Security-LLM-v1"

class EvidenceLinkSchema(BaseModel):
    id: str
    evidence_type: str
    evidence_id: str
    evidence_code: str
    relevance_score: float
    citation_text: str

class HypothesisSchema(BaseModel):
    id: str
    hypothesis_code: str
    title: str
    description: str
    confidence_level: str
    mitre_technique: str
    supporting_evidence_codes: List[str]
    status: str

class RecommendationSchema(BaseModel):
    id: str
    recommendation_code: str
    title: str
    description: str
    action_type: str
    priority: str
    risk_impact: Optional[str]
    evidence_citations: List[str]

class AttackPathEdgeSchema(BaseModel):
    id: str
    step_number: int
    source_asset_name: str
    target_asset_name: str
    action_taken: str
    technique_id: str
    technique_name: str
    evidence_code: str
    confidence: float

class AttackPathSchema(BaseModel):
    id: str
    path_code: str
    title: str
    description: Optional[str]
    start_node: str
    target_node: str
    total_steps: int
    risk_score: float
    edges: List[AttackPathEdgeSchema] = []

class RiskAssessmentSchema(BaseModel):
    id: str
    cvss_score: float
    business_impact_score: float
    overall_risk_score: float
    severity: str
    exposure_vector: str
    affected_assets: List[str]
    explaining_factors: List[str]
    created_at: datetime

class ResponseApprovalSchema(BaseModel):
    id: str
    approver_username: str
    approval_status: str
    rejection_reason: Optional[str] = None
    decided_at: datetime

class ResponseActionSchema(BaseModel):
    id: str
    action_code: str
    target_asset_name: str
    target_ip: str
    action_type: str
    command_to_execute: str
    risk_level: str
    is_lab_contained: bool
    status: str
    execution_result: Optional[Dict[str, Any]] = None
    created_at: datetime
    approval: Optional[ResponseApprovalSchema] = None

class ResponsePlanSchema(BaseModel):
    id: str
    plan_code: str
    title: str
    status: str
    created_at: datetime
    actions: List[ResponseActionSchema] = []

class AgentRunSchema(BaseModel):
    id: str
    agent_name: str
    status: str
    input_summary: Optional[str]
    output_summary: Optional[str]
    tokens_used: int
    created_at: datetime
    completed_at: datetime

class EvaluationSchema(BaseModel):
    id: str
    groundedness_score: float
    hallucination_rate: float
    citation_precision: float
    is_passed: bool
    notes: str

class AIInvestigationDetailResponse(BaseModel):
    id: str
    investigation_code: str
    title: str
    description: Optional[str]
    incident_id: Optional[str]
    status: str
    trigger_type: str
    model_used: str
    summary: Optional[str]
    conclusion: Optional[str]
    confidence_score: float
    created_by: str
    created_at: datetime
    updated_at: datetime
    agent_runs: List[AgentRunSchema] = []
    evidence_links: List[EvidenceLinkSchema] = []
    hypotheses: List[HypothesisSchema] = []
    recommendations: List[RecommendationSchema] = []
    attack_paths: List[AttackPathSchema] = []
    risk_assessments: List[RiskAssessmentSchema] = []
    response_plans: List[ResponsePlanSchema] = []
    evaluations: List[EvaluationSchema] = []

class ApproveActionRequest(BaseModel):
    rejection_reason: Optional[str] = None

class RAGIngestRequest(BaseModel):
    document_code: str
    title: str
    doc_type: str # THREAT_INTEL, MITRE_KB, INCIDENT_PLAYBOOK, SECURITY_POLICY
    content: str

class RAGSearchRequest(BaseModel):
    query: str
    top_k: int = 5
