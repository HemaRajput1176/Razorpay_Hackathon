import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, AlertTriangle, Play, Square, RefreshCw, 
  Lock, Server, Code, Copy, Terminal
} from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import type { Assessment, AssessmentFinding } from '../types';

interface AssessmentDetailPageProps {
  assessmentId: string;
  onBack: () => void;
}

export const AssessmentDetailPage: React.FC<AssessmentDetailPageProps> = ({ assessmentId, onBack }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'ATTACK_SURFACE' | 'API_MAP' | 'LOGS'>('FINDINGS');
  const [selectedFinding, setSelectedFinding] = useState<AssessmentFinding | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await assessmentService.getAssessmentById(assessmentId);
      setAssessment(data);
      if (data.findings && data.findings.length > 0 && !selectedFinding) {
        setSelectedFinding(data.findings[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 3000);
    return () => clearInterval(interval);
  }, [assessmentId]);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await assessmentService.startAssessment(assessmentId);
      await fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      await assessmentService.stopAssessment(assessmentId);
      await fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetest = async () => {
    setActionLoading(true);
    try {
      await assessmentService.retestAssessment(assessmentId);
      await fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading && !assessment) {
    return (
      <div className="p-12 text-center text-xs text-[#7F95A5] flex flex-col items-center gap-3 font-mono-tech">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00E5FF]" />
        <span>LOADING SECURITY ASSESSMENT CONSOLE...</span>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-12 text-center text-xs text-red-400 font-mono-tech">
        ASSESSMENT NOT FOUND.
        <button onClick={onBack} className="block mx-auto mt-4 px-3 py-1.5 bg-[#17232E] rounded text-[#E6F1F5]">
          RETURN TO ASSESSMENTS
        </button>
      </div>
    );
  }

  const isRunning = assessment.status === 'RUNNING';
  const isCompleted = assessment.status === 'COMPLETED';

  const filteredFindings = (assessment.findings || []).filter(f => {
    if (severityFilter === 'ALL') return true;
    return f.severity === severityFilter;
  });

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] text-[#7F95A5] hover:text-[#00E5FF] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-[#00E5FF]">{assessment.code}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                assessment.mode === 'INTERNAL_LAB'
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                  : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30'
              }`}>
                {assessment.mode.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                isRunning
                  ? 'bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] animate-pulse'
                  : isCompleted
                  ? 'bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E]'
                  : 'bg-[#17232E] text-[#7F95A5]'
              }`}>
                {assessment.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#E6F1F5]">{assessment.title}</h1>
            <p className="text-xs text-[#00E5FF] font-mono mt-0.5">{assessment.target_url}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleStop}
              disabled={actionLoading}
              className="px-4 py-2 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 hover:bg-[#EF4444]/30 text-[#EF4444] text-xs font-bold flex items-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>STOP ASSESSMENT</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="px-4 py-2 rounded bg-[#00E5FF] hover:bg-[#00B4D8] text-black text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isCompleted ? 'RE-RUN SCAN' : 'START ASSESSMENT'}</span>
            </button>
          )}

          <button
            onClick={handleRetest}
            disabled={actionLoading || isRunning}
            className="px-3.5 py-2 rounded bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] text-xs font-bold text-[#E6F1F5] flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>RE-TEST</span>
          </button>
        </div>
      </div>

      {/* Scope Attestation & Risk Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">COMPOSITE RISK SCORE</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${assessment.risk_score >= 70 ? 'text-[#EF4444]' : assessment.risk_score > 0 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
              {assessment.risk_score}
            </span>
            <span className="text-xs text-[#7F95A5]">/ 100</span>
          </div>
          <span className="text-[10px] text-[#7F95A5]">CVSS + Criticality Multiplier</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">REQUEST BUDGET CONSUMPTION</span>
          <div className="text-sm font-bold text-[#00E5FF]">
            {assessment.requests_used} / {assessment.request_budget} REQS
          </div>
          <div className="w-full h-1.5 bg-[#17232E] rounded overflow-hidden mt-1">
            <div
              className="h-full bg-[#00E5FF] transition-all"
              style={{ width: `${Math.min(100, (assessment.requests_used / (assessment.request_budget || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">SCOPE ATTESTATION CODE</span>
          <div className="text-xs font-bold text-[#22C55E] truncate">
            {assessment.scope?.attestation_code || 'AUTH-2026-VERIFIED'}
          </div>
          <span className="text-[10px] text-[#7F95A5] block truncate">By: {assessment.scope?.authorized_by || 'Chief Security Officer'}</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">RATE LIMIT THROTTLE</span>
          <div className="text-sm font-bold text-[#E6F1F5]">
            {assessment.max_rate_limit} REQ/SEC MAX
          </div>
          <span className="text-[10px] text-[#22C55E] flex items-center gap-1">
            <Lock className="w-3 h-3" /> Safe Non-Destructive
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#17232E] pb-2">
        {[
          { id: 'FINDINGS', label: `FINDINGS (${assessment.findings?.length || 0})`, icon: AlertTriangle },
          { id: 'ATTACK_SURFACE', label: `ATTACK SURFACE & ASSETS (${assessment.assets?.length || 0})`, icon: Server },
          { id: 'API_MAP', label: `API ENDPOINTS (${assessment.endpoints?.length || 0})`, icon: Code },
          { id: 'LOGS', label: `EXECUTION TELEMETRY LOGS (${assessment.logs?.length || 0})`, icon: Terminal }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition ${
                isActive
                  ? 'bg-[#0F1720] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                  : 'text-[#7F95A5] hover:text-[#E6F1F5] hover:bg-[#0B1118]'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-[#7F95A5]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: FINDINGS & VULNERABILITIES */}
      {activeTab === 'FINDINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Findings Table */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold">
                DISCOVERED VULNERABILITY FINDINGS
              </span>
              <div className="flex items-center gap-1">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                      severityFilter === s
                        ? 'bg-[#00E5FF] text-black'
                        : 'bg-[#0B1118] border border-[#17232E] text-[#7F95A5] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-[#070B11] border border-[#17232E] rounded text-xs text-[#7F95A5]">
                NO VULNERABILITIES MATCH CURRENT SEVERITY FILTER.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFindings.map(f => {
                  const isSelected = selectedFinding?.id === f.id;
                  const sevColor = 
                    f.severity === 'CRITICAL' ? 'text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/10' :
                    f.severity === 'HIGH' ? 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10' :
                    f.severity === 'MEDIUM' ? 'text-[#00E5FF] border-[#00E5FF]/40 bg-[#00E5FF]/10' :
                    'text-[#7F95A5] border-[#17232E] bg-[#070B11]';

                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFinding(f)}
                      className={`p-3.5 bg-[#070B11] border rounded-lg cursor-pointer transition space-y-2 ${
                        isSelected
                          ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] bg-[#0F1720]'
                          : 'border-[#17232E] hover:border-[#7F95A5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${sevColor}`}>
                            {f.severity}
                          </span>
                          <span className="text-[10px] text-[#7F95A5] font-mono">{f.finding_code}</span>
                          <span className="text-[10px] text-[#00E5FF] font-mono">{f.cwe_id}</span>
                        </div>
                        <span className="text-xs font-bold text-[#EF4444]">RISK: {f.risk_score}/100</span>
                      </div>

                      <h4 className="text-xs font-bold text-[#E6F1F5] leading-snug">{f.title}</h4>
                      <p className="text-[11px] text-[#7F95A5] line-clamp-2">{f.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Finding Detail & Redacted Evidence Drawer */}
          <div className="lg:col-span-6 bg-[#070B11] border border-[#17232E] rounded-lg p-5 space-y-5">
            {selectedFinding ? (
              <>
                <div className="border-b border-[#17232E] pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#00E5FF] font-bold">{selectedFinding.finding_code}</span>
                    <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold">
                      STATUS: {selectedFinding.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#E6F1F5]">{selectedFinding.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7F95A5]">
                    <span>CVSS v3.1: <strong className="text-[#F59E0B]">{selectedFinding.cvss_score}</strong></span>
                    <span>CWE: <strong className="text-[#00E5FF]">{selectedFinding.cwe_id}</strong></span>
                    <span>CVSS Vector: <code className="text-[10px] text-[#7F95A5]">{selectedFinding.cvss_vector}</code></span>
                  </div>
                </div>

                {/* Impact & Description */}
                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold mb-1">IMPACT ANALYSIS</h5>
                    <p className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded text-[#E6F1F5] leading-relaxed">
                      {selectedFinding.impact}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold mb-1">TECHNICAL DESCRIPTION</h5>
                    <p className="text-[#7F95A5] leading-relaxed">
                      {selectedFinding.description}
                    </p>
                  </div>
                </div>

                {/* Redacted Evidence Section */}
                {selectedFinding.evidence && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> REDACTED HTTP EVIDENCE (SHA-256: {selectedFinding.evidence.sha256_hash.substring(0, 10)}...)
                      </h5>
                      <span className="text-[9px] text-[#22C55E] font-bold uppercase">SENSITIVE DATA STRIPPED</span>
                    </div>

                    <div className="p-3 bg-[#0B1118] border border-[#17232E] rounded font-mono text-[11px] space-y-2 overflow-x-auto max-h-60 overflow-y-auto">
                      <div className="text-[#00E5FF] font-bold">
                        {selectedFinding.evidence.request_method} {selectedFinding.evidence.request_url}
                      </div>
                      <div className="text-[#7F95A5] whitespace-pre-wrap">
                        {typeof selectedFinding.evidence.redacted_request_headers === 'string'
                          ? selectedFinding.evidence.redacted_request_headers
                          : JSON.stringify(selectedFinding.evidence.redacted_request_headers, null, 2)}
                      </div>
                      <div className="pt-2 border-t border-[#17232E] text-[#22C55E] font-bold">
                        HTTP RESPONSE STATUS: {selectedFinding.evidence.response_status}
                      </div>
                      {selectedFinding.evidence.proof_of_concept && (
                        <div className="p-2 bg-[#070B11] border border-[#17232E] rounded text-[#F59E0B]">
                          PoC: {selectedFinding.evidence.proof_of_concept}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remediation Code */}
                {selectedFinding.remediation_code && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] uppercase tracking-widest text-[#22C55E] font-bold">RECOMMENDED FIX CODE</h5>
                      <button
                        onClick={() => copyToClipboard(selectedFinding.remediation_code || '')}
                        className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> {copiedCode ? 'COPIED!' : 'COPY CODE'}
                      </button>
                    </div>
                    <pre className="p-3 bg-[#0B1118] border border-[#22C55E]/30 rounded text-[11px] text-[#22C55E] font-mono overflow-x-auto">
                      <code>{selectedFinding.remediation_code}</code>
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-xs text-[#7F95A5]">
                SELECT A FINDING FROM THE LEFT PANEL TO INSPECT REDACTED EVIDENCE AND REMEDIATION GUIDANCE.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: ATTACK SURFACE & ASSETS */}
      {activeTab === 'ATTACK_SURFACE' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg">
            <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider mb-3">DISCOVERED TARGET ASSETS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(assessment.assets || []).map(ast => (
                <div key={ast.id} className="p-3.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#E6F1F5]">{ast.asset_name}</h4>
                      <p className="text-[10px] text-[#7F95A5]">{ast.host_or_ip}:{ast.port} ({ast.asset_type})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold block">
                      {ast.status}
                    </span>
                    <span className="text-[10px] text-[#7F95A5] mt-1 block">TLS: {ast.tls_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: API ENDPOINTS */}
      {activeTab === 'API_MAP' && (
        <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg space-y-3">
          <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider">DISCOVERED API ENDPOINTS SCHEMA</h3>
          {(assessment.endpoints || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7F95A5]">NO OPENAPI ENDPOINTS DISCOVERED ON TARGET.</div>
          ) : (
            <div className="space-y-2">
              {(assessment.endpoints || []).map(ep => (
                <div key={ep.id} className="p-3 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'GET' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#3B82F6]/20 text-[#3B82F6]'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-bold text-[#E6F1F5]">{ep.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#7F95A5]">
                    <span>{ep.summary}</span>
                    <span className={ep.auth_required ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                      {ep.auth_required ? 'AUTH REQUIRED' : 'UNAUTHENTICATED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: LOGS */}
      {activeTab === 'LOGS' && (
        <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#17232E] text-[10px] text-[#7F95A5]">
            <span>EXECUTION TELEMETRY LOGS</span>
            <span className="text-[#00E5FF]">STREAM ACTIVE</span>
          </div>
          {(assessment.logs || []).map(log => (
            <div key={log.id} className="flex items-start gap-3 py-1 border-b border-[#17232E]/40 text-[11px]">
              <span className="text-[#7F95A5] shrink-0">{log.timestamp?.substring(11, 19)}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                log.level === 'FINDING' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                log.level === 'CHECK' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                log.level === 'WARN' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#17232E] text-[#7F95A5]'
              }`}>
                {log.level}
              </span>
              <span className="text-[#E6F1F5]">{log.message}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
