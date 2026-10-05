export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  organization: string;
  mfa_enabled: boolean;
}

export interface KPI {
  security_posture: number;
  active_threats: number;
  critical_vulnerabilities: number;
  active_incidents: number;
  protected_assets: number;
  detection_coverage: number;
  attack_surface_nodes: number;
  ai_risk_score: number;
}

export interface ThreatDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface LiveActivity {
  id: string;
  time: string;
  source: string;
  event: string;
  asset: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  asset: string;
  timestamp: string;
  status: string;
  technique: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source_ip: string;
  asset: string;
  detection_rule: string;
  mitre_technique: string;
  status: string;
  confidence: string;
  timestamp: string;
  evidence: string[];
}

export interface SystemHealth {
  status: string;
  system: string;
  version: string;
  timestamp: string;
  services: {
    api_core: string;
    database: string;
    soc_engine: string;
    ai_engine: string;
    telemetry: string;
    cyber_range: string;
  };
}

// ============================================================
// MILESTONE 2: CYBER RANGE TYPES
// ============================================================

export type LabStatus = 'CREATED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'RESTARTING' | 'ERROR';

export interface LabService {
  id?: string;
  name: string;
  protocol: string;
  port: number;
  status: 'ONLINE' | 'STOPPED' | 'UNHEALTHY';
  version?: string;
}

export interface LabAsset {
  id: string;
  name: string;
  hostname: string;
  asset_type: 'WEB SERVER' | 'SERVER/API' | 'DATABASE' | 'HOST' | 'DOCKER POD';
  ip_address: string;
  os: string;
  role: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'RUNNING' | 'STARTING' | 'STOPPED' | 'ERROR';
  container_id?: string;
  services: LabService[];
}

export interface LabNetwork {
  name: string;
  subnet: string;
  gateway: string;
  status: 'ISOLATED' | 'OFFLINE';
}

export interface Lab {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: LabStatus;
  environment: string;
  created_by?: string;
  created_at: string;
  network?: LabNetwork;
  assets?: LabAsset[];
  docker_engine?: {
    available: boolean;
    status: string;
    engine_version: string;
    error: string | null;
  };
}

export interface LabEvent {
  id: string;
  event_type: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: string;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: string;
  status: string;
  ip: string;
  criticality?: string;
  services?: string[];
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

// ============================================================
// MILESTONE 4: ASSESSMENT ENGINE TYPES
// ============================================================

export type AssessmentMode = 'INTERNAL_LAB' | 'EXTERNAL_AUTHORIZED';
export type AssessmentStatus = 'READY' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';

export interface AssessmentScope {
  id?: string;
  authorization_granted: boolean;
  attestation_code: string;
  authorized_by: string;
  purpose: string;
  allowed_domains: string[];
  excluded_hosts: string[];
  expiration_date?: string;
}

export interface AssessmentAsset {
  id: string;
  asset_name: string;
  host_or_ip: string;
  port: number;
  asset_type: string;
  status: string;
  response_time_ms: number;
  tls_status: string;
  discovered_at?: string;
}

export interface AssessmentURL {
  id: string;
  url: string;
  status_code: number;
  content_type: string;
  response_time_ms: number;
  title: string;
  discovered_via: string;
}

export interface APIEndpoint {
  id: string;
  method: string;
  path: string;
  summary: string;
  auth_required: boolean;
  parameters: string[];
  response_codes: string[];
  discovered_at?: string;
}

export interface AssessmentEvidence {
  id: string;
  evidence_type: string;
  request_method: string;
  request_url: string;
  redacted_request_headers: Record<string, string> | string;
  redacted_request_body?: string;
  response_status: number;
  redacted_response_headers: Record<string, string> | string;
  redacted_response_body?: string;
  proof_of_concept?: string;
  sha256_hash: string;
  collected_at?: string;
}

export interface AssessmentFinding {
  id: string;
  finding_code: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  cvss_score: number;
  cvss_vector: string;
  cwe_id: string;
  risk_score: number;
  impact: string;
  description: string;
  recommendation: string;
  remediation_code?: string;
  status: 'OPEN' | 'REMEDIATED' | 'RETEST_PENDING' | 'VERIFIED_FIXED';
  created_at?: string;
  evidence?: AssessmentEvidence;
}

export interface RedactedLog {
  id: string;
  level: 'INFO' | 'CHECK' | 'FINDING' | 'REDACTED' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface Assessment {
  id: string;
  code: string;
  title: string;
  description?: string;
  mode: AssessmentMode;
  target_type: 'WEB' | 'API' | 'LAB_NODE';
  target_url: string;
  status: AssessmentStatus;
  risk_score: number;
  request_budget: number;
  requests_used: number;
  max_rate_limit: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  findings_count?: number;
  scope?: AssessmentScope;
  assets?: AssessmentAsset[];
  urls?: AssessmentURL[];
  endpoints?: APIEndpoint[];
  findings?: AssessmentFinding[];
  logs?: RedactedLog[];
}

export interface AssessmentSummary {
  total_assessments: number;
  running_assessments: number;
  completed_assessments: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  average_risk_score: number;
}

export interface SecurityEvent {
  id: string;
  event_code: string;
  timestamp: string;
  event_type: string;
  source: string;
  asset_id: string;
  source_ip: string;
  destination_ip?: string;
  user: string;
  action: string;
  result: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  request_id?: string;
  mitre_technique?: string;
}

export interface CorrelationRuleItem {
  id: string;
  rule_code: string;
  name: string;
  description: string;
  rule_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  enabled: boolean;
  window_seconds: number;
  threshold: number;
  technique_id: string;
  version: number;
}

export interface InvestigationItem {
  id: string;
  investigation_code: string;
  title: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assigned_to: string;
  event_count: number;
  incident_id?: string;
  created_at?: string;
  affected_assets?: string[];
  affected_users?: string[];
  source_ips?: string[];
  timeline_events?: SecurityEvent[];
  ai_analysis?: {
    summary: string;
    hypothesis: string;
    recommended_next_step: string;
  };
}

export interface SavedHuntItem {
  id: string;
  hunt_code: string;
  name: string;
  description: string;
  query: string | Record<string, any>;
  created_by?: string;
  created_at?: string;
}

export interface DetectionGapItem {
  id: string;
  technique_id: string;
  technique_name: string;
  exercise_code: string;
  expected_detection: string;
  actual_detection: string;
  reason: string;
  severity: string;
  recommendation: string;
  created_at?: string;
}

export interface MITREMatrixTactic {
  tactic_id: string;
  tactic_name: string;
  techniques: {
    technique_id: string;
    status: 'VALIDATED' | 'PARTIALLY_DETECTED' | 'NOT_COVERED';
    rule_count: number;
    alert_count: number;
    gap_count: number;
  }[];
}

export type ModuleId = 
  | 'command-center'
  | 'soc'
  | 'red-team'
  | 'blue-team'
  | 'purple-team'
  | 'assets'
  | 'attack-surface'
  | 'vulnerabilities'
  | 'assessments'
  | 'threat-hunting'
  | 'attack-graph'
  | 'threat-intel'
  | 'iocs'
  | 'threat-actors'
  | 'nexus-ai'
  | 'investigations'
  | 'evidence'
  | 'timeline'
  | 'labs'
  | 'exercises'
  | 'ctf-academy'
  | 'devsecops'
  | 'container-security'
  | 'cloud-security'
  | 'incidents'
  | 'playbooks'
  | 'response-actions'
  | 'reports'
  | 'audit-logs'
  | 'settings';


