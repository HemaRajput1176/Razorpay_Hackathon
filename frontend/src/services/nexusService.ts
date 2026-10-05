const API_BASE = '/api/v1/nexus';

export interface AIInvestigationSummary {
  id: string;
  investigation_code: string;
  title: string;
  incident_id?: string;
  status: string;
  trigger_type: string;
  confidence_score: number;
  created_by: string;
  created_at: string;
}

export interface AgentRun {
  id: string;
  agent_name: string;
  status: string;
  input_summary?: string;
  output_summary?: string;
  tokens_used: number;
  created_at: string;
  completed_at: string;
}

export interface EvidenceLink {
  id: string;
  evidence_type: string;
  evidence_id: string;
  evidence_code: string;
  relevance_score: number;
  citation_text: string;
}

export interface AIHypothesis {
  id: string;
  hypothesis_code: string;
  title: string;
  description: string;
  confidence_level: string;
  mitre_technique: string;
  supporting_evidence_codes: string[];
  status: string;
}

export interface AIRecommendation {
  id: string;
  recommendation_code: string;
  title: string;
  description: string;
  action_type: string;
  priority: string;
  risk_impact?: string;
  evidence_citations: string[];
}

export interface AttackPathEdge {
  id: string;
  step_number: number;
  source_asset_name: string;
  target_asset_name: string;
  action_taken: string;
  technique_id: string;
  technique_name: string;
  evidence_code: string;
  confidence: number;
}

export interface AttackPath {
  id: string;
  path_code: string;
  title: string;
  description?: string;
  start_node: string;
  target_node: string;
  total_steps: number;
  risk_score: number;
  edges: AttackPathEdge[];
}

export interface AIRiskAssessment {
  id: string;
  cvss_score: number;
  business_impact_score: number;
  overall_risk_score: number;
  severity: string;
  exposure_vector: string;
  affected_assets: string[];
  explaining_factors: string[];
  created_at: string;
}

export interface ResponseAction {
  id: string;
  action_code: string;
  target_asset_name: string;
  target_ip: string;
  action_type: string;
  command_to_execute: string;
  risk_level: string;
  is_lab_contained: boolean;
  status: string;
  execution_result?: any;
  created_at: string;
  approval?: {
    id: string;
    approver_username: string;
    approval_status: string;
    rejection_reason?: string;
    decided_at: string;
  };
}

export interface ResponsePlan {
  id: string;
  plan_code: string;
  title: string;
  status: string;
  created_at: string;
  actions: ResponseAction[];
}

export interface AIEvaluation {
  id: string;
  groundedness_score: number;
  hallucination_rate: number;
  citation_precision: number;
  is_passed: boolean;
  notes: string;
}

export interface AIInvestigationDetail {
  id: string;
  investigation_code: string;
  title: string;
  description?: string;
  incident_id?: string;
  status: string;
  trigger_type: string;
  model_used: string;
  summary?: string;
  conclusion?: string;
  confidence_score: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  agent_runs: AgentRun[];
  evidence_links: EvidenceLink[];
  hypotheses: AIHypothesis[];
  recommendations: AIRecommendation[];
  attack_paths: AttackPath[];
  risk_assessments: AIRiskAssessment[];
  response_plans: ResponsePlan[];
  evaluations: AIEvaluation[];
}

export const nexusService = {
  triggerInvestigation: async (data: { incident_id?: string; title?: string; trigger_type?: string }): Promise<AIInvestigationDetail> => {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to trigger NEXUS AI Investigation');
    const body = await res.json();
    return body.investigation;
  },

  listInvestigations: async (): Promise<AIInvestigationSummary[]> => {
    const res = await fetch(`${API_BASE}/investigations`);
    if (!res.ok) throw new Error('Failed to fetch AI investigations list');
    const data = await res.json();
    return data.investigations || [];
  },

  getInvestigation: async (id: string): Promise<AIInvestigationDetail> => {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch AI investigation ${id}`);
    return await res.json();
  },

  getAttackGraph: async (id: string): Promise<{ nodes: any[]; edges: any[]; path_code: string; risk_score: number }> => {
    const res = await fetch(`${API_BASE}/investigations/${id}/attack-graph`);
    if (!res.ok) throw new Error(`Failed to fetch attack graph for ${id}`);
    return await res.json();
  },

  approveAction: async (actionId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/response-actions/${actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to approve response action');
    }
    return await res.json();
  },

  rejectAction: async (actionId: string, reason?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/response-actions/${actionId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to reject response action');
    }
    return await res.json();
  }
};
