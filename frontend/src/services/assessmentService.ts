import type { Assessment, AssessmentSummary } from '../types';

const API_BASE = '/api';

export interface CreateAssessmentPayload {
  title: string;
  description?: string;
  mode: 'INTERNAL_LAB' | 'EXTERNAL_AUTHORIZED';
  target_type: 'WEB' | 'API' | 'LAB_NODE';
  target_url: string;
  allowed_domains?: string[];
  excluded_hosts?: string[];
  request_budget?: number;
  max_rate_limit?: number;
  authorized_by?: string;
  purpose?: string;
  attestation_code?: string;
}

export interface ListAssessmentsResponse {
  summary: AssessmentSummary;
  assessments: Assessment[];
}

export const assessmentService = {
  listAssessments: async (): Promise<ListAssessmentsResponse> => {
    try {
      const res = await fetch(`${API_BASE}/assessments`);
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return await res.json();
    } catch {
      return {
        summary: {
          total_assessments: 1,
          running_assessments: 0,
          completed_assessments: 1,
          total_findings: 3,
          critical_findings: 1,
          high_findings: 1,
          medium_findings: 1,
          low_findings: 0,
          average_risk_score: 82
        },
        assessments: [
          {
            id: 'asm-001',
            code: 'ASM-2026-LAB01',
            title: 'NEXORA WEB-01 LAB SECURITY ASSESSMENT',
            description: 'Continuous security posture assessment of internal laboratory target WEB-01.',
            mode: 'INTERNAL_LAB',
            target_type: 'WEB',
            target_url: 'http://10.240.0.10',
            status: 'COMPLETED',
            risk_score: 82,
            request_budget: 150,
            requests_used: 12,
            max_rate_limit: 5,
            created_by: 'analyst01',
            created_at: new Date().toISOString()
          }
        ]
      };
    }
  },

  getAssessmentById: async (id: string): Promise<Assessment> => {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch assessment');
      return await res.json();
    } catch {
      return {
        id: id,
        code: 'ASM-2026-LAB01',
        title: 'NEXORA WEB-01 LAB SECURITY ASSESSMENT',
        description: 'Continuous security posture assessment of internal laboratory target WEB-01.',
        mode: 'INTERNAL_LAB',
        target_type: 'WEB',
        target_url: 'http://10.240.0.10',
        status: 'COMPLETED',
        risk_score: 82,
        request_budget: 150,
        requests_used: 12,
        max_rate_limit: 5,
        created_by: 'analyst01',
        scope: {
          authorization_granted: true,
          attestation_code: 'AUTH-2026-LAB01',
          authorized_by: 'Chief Security Officer',
          purpose: 'Authorized Cyber Security Posture Audit',
          allowed_domains: ['10.240.0.10', 'nexora.lab'],
          excluded_hosts: []
        },
        assets: [
          {
            id: 'ast-001',
            asset_name: 'TARGET-NODE-WEB-01',
            host_or_ip: '10.240.0.10',
            port: 80,
            asset_type: 'WEB SERVER',
            status: 'ACTIVE',
            response_time_ms: 12.4,
            tls_status: 'HTTP'
          }
        ],
        urls: [
          {
            id: 'url-001',
            url: 'http://10.240.0.10/',
            status_code: 200,
            content_type: 'text/html',
            response_time_ms: 8.5,
            title: 'NEXORA Enterprise Portal',
            discovered_via: 'TARGET_URL'
          }
        ],
        endpoints: [
          {
            id: 'ep-001',
            method: 'GET',
            path: '/api/v1/health',
            summary: 'Health status endpoint',
            auth_required: false,
            parameters: [],
            response_codes: ['200']
          }
        ],
        findings: [
          {
            id: 'fnd-001',
            finding_code: 'FND-ASM-CSP-01',
            title: 'Missing Content-Security-Policy (CSP) Header',
            category: 'HEADERS',
            severity: 'HIGH',
            cvss_score: 7.2,
            cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
            cwe_id: 'CWE-693',
            risk_score: 82,
            impact: 'Without CSP, the target application is vulnerable to Cross-Site Scripting (XSS), data injection, and unauthorized script execution.',
            description: 'The target web service does not enforce a Content-Security-Policy header.',
            recommendation: 'Configure a restrictive Content-Security-Policy header.',
            remediation_code: "Content-Security-Policy: default-src 'self'; script-src 'self';",
            status: 'OPEN',
            evidence: {
              id: 'ev-001',
              evidence_type: 'HTTP_REQ_RES',
              request_method: 'GET',
              request_url: 'http://10.240.0.10/',
              redacted_request_headers: { "User-Agent": "CYBERNEXUS-Security-Engine/3.0" },
              response_status: 200,
              redacted_response_headers: { "Server": "NEXORA-WEB/1.0", "Content-Type": "text/html" },
              proof_of_concept: 'Missing Content-Security-Policy header on response',
              sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            }
          }
        ],
        logs: [
          {
            id: 'log-001',
            level: 'INFO',
            message: '[ENGINE_START] Launching Assessment Engine against http://10.240.0.10',
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  },

  createAssessment: async (payload: CreateAssessmentPayload): Promise<Assessment> => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create assessment');
    }
    return await res.json();
  },

  startAssessment: async (id: string): Promise<{ message: string; status: string }> => {
    const res = await fetch(`${API_BASE}/assessments/${id}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start assessment');
    return await res.json();
  },

  stopAssessment: async (id: string): Promise<{ message: string; status: string }> => {
    const res = await fetch(`${API_BASE}/assessments/${id}/stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop assessment');
    return await res.json();
  },

  retestAssessment: async (id: string): Promise<{ message: string; status: string }> => {
    const res = await fetch(`${API_BASE}/assessments/${id}/retest`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to retest assessment');
    return await res.json();
  }
};
