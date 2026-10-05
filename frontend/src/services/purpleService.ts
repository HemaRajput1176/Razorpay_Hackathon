const API_BASE = '/api/purple';

export interface PurpleExerciseSummary {
  id: string;
  exercise_code: string;
  name: string;
  objective: string;
  environment: string;
  risk_level: string;
  authorization_scope: string;
  status: string;
  created_at: string;
}

export interface PurpleExerciseDetail {
  id: string;
  exercise_code: string;
  name: string;
  description: string;
  objective: string;
  environment: string;
  asset_ids: string[];
  technique_ids: string[];
  expected_events: string[];
  expected_detection_rules: string[];
  risk_level: string;
  authorization_scope: string;
  status: string;
  runs: {
    id: string;
    run_code: string;
    started_at: string;
    status: string;
    risk_before: number;
    risk_after: number;
    coverage_result: string;
    purple_score: number;
  }[];
}

export interface PurpleDashboardData {
  posture: {
    overall_score?: number;
    asset_security?: number;
    vulnerability?: number;
    detection?: number;
    response?: number;
    threat_exposure?: number;
    control_validation?: number;
    purple_team_score?: number;
    status: string;
  };
  total_exercises_run: number;
  total_controls: number;
  total_retests: number;
  pass_count: number;
  gap_count: number;
  recent_runs: any[];
}

export const purpleService = {
  getDashboard: async (): Promise<PurpleDashboardData> => {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch Purple Team Dashboard');
    return await res.json();
  },

  listExercises: async (): Promise<PurpleExerciseSummary[]> => {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) throw new Error('Failed to fetch exercises');
    const data = await res.json();
    return data.exercises || [];
  },

  getExercise: async (id: string): Promise<PurpleExerciseDetail> => {
    const res = await fetch(`${API_BASE}/exercises/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch exercise ${id}`);
    return await res.json();
  },

  runExercise: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/exercises/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to execute purple team exercise');
    return await res.json();
  },

  executeRetest: async (exerciseId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/retests?exercise_id=${exerciseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to execute retest');
    return await res.json();
  }
};
