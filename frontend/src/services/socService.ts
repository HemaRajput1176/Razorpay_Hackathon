import type { SecurityEvent, CorrelationRuleItem, InvestigationItem, SavedHuntItem, MITREMatrixTactic, DetectionGapItem } from '../types';

const API_BASE = '/api';

export interface SOCOverviewResponse {
  system_status: {
    collectors: string;
    detection_engine: string;
    correlation: string;
    incident_engine: string;
  };
  summary: {
    total_events: number;
    events_per_minute: number;
    active_incidents: number;
    open_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    assets_monitored: number;
    mttd: string;
    mttr: string;
  };
  recent_events: SecurityEvent[];
  top_alerts: any[];
}

export const socService = {
  getSOCOverview: async (): Promise<SOCOverviewResponse> => {
    const res = await fetch(`${API_BASE}/soc/overview`);
    if (!res.ok) throw new Error('Failed to fetch SOC overview');
    return await res.json();
  },

  getEvents: async (filters?: Record<string, any>): Promise<{ count: number; events: SecurityEvent[] }> => {
    const queryStr = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE}/soc/events?${queryStr}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return await res.json();
  },

  getAlerts: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/soc/alerts`);
    if (!res.ok) throw new Error('Failed to fetch SOC alerts');
    return await res.json();
  },

  markAlertFeedback: async (alertId: string, feedbackType: string, reason: string) => {
    const res = await fetch(`${API_BASE}/soc/alerts/${alertId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_type: feedbackType, reason })
    });
    return await res.json();
  },

  triggerSOCDemoScenario: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/soc/demo-scenario`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger SOC demo scenario');
    return await res.json();
  },

  getPurpleTeamStatus: async (): Promise<{ summary: any; mitre_matrix: MITREMatrixTactic[]; detection_gaps: DetectionGapItem[] }> => {
    const res = await fetch(`${API_BASE}/soc/purple-team`);
    if (!res.ok) throw new Error('Failed to fetch purple team status');
    return await res.json();
  },

  // Threat Hunting APIs
  getSavedHunts: async (): Promise<SavedHuntItem[]> => {
    const res = await fetch(`${API_BASE}/threat-hunts`);
    if (!res.ok) throw new Error('Failed to fetch saved hunts');
    return await res.json();
  },

  runHuntQuery: async (filters: Record<string, any>): Promise<{ summary: any; events: SecurityEvent[] }> => {
    const res = await fetch(`${API_BASE}/threat-hunts/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error('Failed to run hunt query');
    return await res.json();
  },

  saveHunt: async (name: string, description: string, query: Record<string, any>): Promise<SavedHuntItem> => {
    const res = await fetch(`${API_BASE}/threat-hunts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, query })
    });
    return await res.json();
  },

  convertHuntToInvestigation: async (title: string, description: string, eventIds: string[]): Promise<any> => {
    const res = await fetch(`${API_BASE}/threat-hunts/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, event_ids: eventIds })
    });
    return await res.json();
  },

  // Investigation APIs
  getInvestigations: async (): Promise<InvestigationItem[]> => {
    const res = await fetch(`${API_BASE}/investigations`);
    if (!res.ok) throw new Error('Failed to fetch investigations');
    return await res.json();
  },

  getInvestigationDetail: async (id: string): Promise<InvestigationItem> => {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch investigation detail');
    return await res.json();
  },

  // Detection Rules APIs
  getDetectionRules: async (): Promise<CorrelationRuleItem[]> => {
    const res = await fetch(`${API_BASE}/detection-rules`);
    if (!res.ok) throw new Error('Failed to fetch detection rules');
    return await res.json();
  },

  toggleRuleState: async (id: string, enable: boolean): Promise<any> => {
    const endpoint = enable ? 'enable' : 'disable';
    const res = await fetch(`${API_BASE}/detection-rules/${id}/${endpoint}`, { method: 'POST' });
    return await res.json();
  },

  testRule: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/detection-rules/${id}/test`, { method: 'POST' });
    return await res.json();
  }
};
