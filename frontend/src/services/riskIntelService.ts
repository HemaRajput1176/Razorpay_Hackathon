const API_BASE = '/api/v1/risk-intel';

export interface RiskIntelOverview {
  summary: {
    knowledge_graph_nodes: number;
    knowledge_graph_edges: number;
    active_threat_feeds: number;
    discovered_attack_paths: number;
    prioritized_actions_count: number;
    p0_critical_actions: number;
    p1_high_actions: number;
  };
  strategic_advisor_summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk_weight: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
  evidence: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface ThreatFeedItem {
  id: string;
  threat_code: string;
  threat_actor: string;
  malware_family: string;
  cve_id: string;
  description: string;
  mitre_technique: string;
  severity: string;
  published_at: string;
}

export interface AttackPathIntelItem {
  id: string;
  path_code: string;
  title: string;
  entry_point: string;
  target_asset: string;
  choke_point_asset: string;
  total_hops: number;
  path_risk_score: number;
  exploitability_rating: string;
  mitigating_control_code: string;
}

export interface PrioritizedActionItem {
  id: string;
  action_code: string;
  priority: string;
  title: string;
  description: string;
  affected_asset: string;
  cve_or_technique: string;
  business_impact: string;
  effort_estimate: string;
  status: string;
}

export interface StrategicAdvisorRec {
  id: string;
  recommendation_code: string;
  executive_summary: string;
  business_risk_translation: string;
  recommended_control: string;
  projected_risk_reduction: string;
  confidence_rating: string;
  evidence_citations: string[];
}

export const riskIntelService = {
  getOverview: async (): Promise<RiskIntelOverview> => {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch risk intel overview');
    return await res.json();
  },

  getKnowledgeGraph: async (): Promise<KnowledgeGraphData> => {
    const res = await fetch(`${API_BASE}/knowledge-graph`);
    if (!res.ok) throw new Error('Failed to fetch Knowledge Graph');
    return await res.json();
  },

  getThreatFeeds: async (): Promise<ThreatFeedItem[]> => {
    const res = await fetch(`${API_BASE}/threat-intel`);
    if (!res.ok) throw new Error('Failed to fetch threat intel feeds');
    const data = await res.json();
    return data.threat_feeds || [];
  },

  getAttackPaths: async (): Promise<AttackPathIntelItem[]> => {
    const res = await fetch(`${API_BASE}/attack-paths`);
    if (!res.ok) throw new Error('Failed to fetch attack paths');
    const data = await res.json();
    return data.attack_paths || [];
  },

  getPrioritizedActions: async (): Promise<PrioritizedActionItem[]> => {
    const res = await fetch(`${API_BASE}/prioritized-actions`);
    if (!res.ok) throw new Error('Failed to fetch prioritized actions');
    const data = await res.json();
    return data.actions || [];
  },

  getStrategicAdvisor: async (): Promise<StrategicAdvisorRec | null> => {
    const res = await fetch(`${API_BASE}/strategic-advisor`);
    if (!res.ok) throw new Error('Failed to fetch Strategic Advisor');
    return await res.json();
  }
};
