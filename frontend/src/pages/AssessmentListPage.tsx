import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Play, Square, RefreshCw, Plus, 
  Activity, Lock, ExternalLink, ChevronRight
} from 'lucide-react';
import { assessmentService, type ListAssessmentsResponse } from '../services/assessmentService';
import { AssessmentScopeModal } from '../components/assessment/AssessmentScopeModal';
import type { AssessmentMode } from '../types';

interface AssessmentListPageProps {
  onSelectAssessment: (assessmentId: string) => void;
}

export const AssessmentListPage: React.FC<AssessmentListPageProps> = ({ onSelectAssessment }) => {
  const [data, setData] = useState<ListAssessmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | AssessmentMode>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      const res = await assessmentService.listAssessments();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    const interval = setInterval(fetchAssessments, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      await assessmentService.startAssessment(id);
      await fetchAssessments();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStop = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      await assessmentService.stopAssessment(id);
      await fetchAssessments();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAssessments = data?.assessments.filter(a => {
    if (activeFilter === 'ALL') return true;
    return a.mode === activeFilter;
  }) || [];

  const summary = data?.summary || {
    total_assessments: 0,
    running_assessments: 0,
    completed_assessments: 0,
    total_findings: 0,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 0,
    low_findings: 0,
    average_risk_score: 0
  };

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#00E5FF] tracking-widest font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MILESTONE 4 — AUTHORIZED WEB & API SECURITY ASSESSMENT ENGINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6F1F5]">
            SECURITY POSTURE & VULNERABILITY MANAGEMENT
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>NEW SECURITY ASSESSMENT</span>
        </button>
      </div>

      {/* Security Boundary Notice Banner */}
      <div className="p-4 bg-[#070B11] border border-[#00E5FF]/30 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#00E5FF] tracking-wide uppercase">AUTHORIZED ASSESSMENT BOUNDARY ENFORCED</h4>
            <p className="text-[#7F95A5] text-[11px] leading-relaxed mt-0.5">
              Internal Lab Mode targets CYBERNEXUS Docker Cyber Range. External Authorized Mode enforces strict SSRF protection (blocking RFC1918/loopback/cloud metadata), rate limiting, request budget caps, and cryptographic evidence redaction.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold">
            SSRF PROTECTION ACTIVE
          </span>
          <span className="px-2.5 py-1 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] font-bold">
            EVIDENCE REDACTION ENABLED
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">TOTAL ASSESSMENTS</span>
          <div className="text-xl font-bold text-[#E6F1F5]">{summary.total_assessments}</div>
          <span className="text-[10px] text-[#22C55E]">{summary.running_assessments} ACTIVE RUNNING</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">TOTAL VULNERABILITIES</span>
          <div className="text-xl font-bold text-[#F59E0B]">{summary.total_findings}</div>
          <span className="text-[10px] text-[#EF4444] font-bold">{summary.critical_findings} CRITICAL SEVERITY</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">HIGH / MED FINDINGS</span>
          <div className="text-xl font-bold text-[#00E5FF]">{summary.high_findings + summary.medium_findings}</div>
          <span className="text-[10px] text-[#7F95A5]">{summary.high_findings} HIGH | {summary.medium_findings} MED</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">AVERAGE RISK SCORE</span>
          <div className="text-xl font-bold text-[#EF4444]">{summary.average_risk_score} / 100</div>
          <span className="text-[10px] text-[#7F95A5]">MULTI-FACTOR ENGINE</span>
        </div>

        <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#7F95A5] font-bold block">COMPLETED AUDITS</span>
          <div className="text-xl font-bold text-[#22C55E]">{summary.completed_assessments}</div>
          <span className="text-[10px] text-[#22C55E]">EVIDENCE VERIFIED</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#17232E] pb-2">
        <div className="flex items-center gap-2">
          {(['ALL', 'INTERNAL_LAB', 'EXTERNAL_AUTHORIZED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                activeFilter === f
                  ? 'bg-[#0F1720] text-[#00E5FF] border border-[#00E5FF]/40'
                  : 'text-[#7F95A5] hover:text-[#E6F1F5] hover:bg-[#0B1118]'
              }`}
            >
              {f === 'ALL' ? 'ALL ASSESSMENTS' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAssessments}
          className="p-1.5 rounded bg-[#0B1118] border border-[#17232E] text-[#7F95A5] hover:text-[#00E5FF] transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#7F95A5] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00E5FF]" />
          <span>LOADING ASSESSMENT REGISTRY...</span>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="p-12 text-center bg-[#070B11] border border-[#17232E] rounded text-xs text-[#7F95A5]">
          NO SECURITY ASSESSMENTS FOUND IN CURRENT FILTER SCOPE.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssessments.map(asm => {
            const isRunning = asm.status === 'RUNNING';
            const isCompleted = asm.status === 'COMPLETED';
            const budgetPct = Math.min(100, Math.round((asm.requests_used / (asm.request_budget || 100)) * 100));

            return (
              <div
                key={asm.id}
                onClick={() => onSelectAssessment(asm.id)}
                className="p-5 bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF]/50 rounded-lg cursor-pointer transition space-y-4 group relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#00E5FF]">{asm.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        asm.mode === 'INTERNAL_LAB'
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30'
                      }`}>
                        {asm.mode.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#E6F1F5] group-hover:text-[#00E5FF] transition">
                      {asm.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 ${
                      isRunning
                        ? 'bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] animate-pulse'
                        : isCompleted
                        ? 'bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E]'
                        : 'bg-[#17232E] text-[#7F95A5]'
                    }`}>
                      <Activity className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                      {asm.status}
                    </span>
                  </div>
                </div>

                {/* Target URL */}
                <div className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded text-xs font-mono flex items-center justify-between text-[#00E5FF]">
                  <span className="truncate">{asm.target_url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7F95A5] shrink-0" />
                </div>

                {/* Request Budget Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#7F95A5]">
                    <span>REQUEST BUDGET EXHAUSTION</span>
                    <span className="font-bold text-[#E6F1F5]">{asm.requests_used} / {asm.request_budget} REQS ({budgetPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#17232E] rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        budgetPct >= 90 ? 'bg-[#EF4444]' : budgetPct >= 50 ? 'bg-[#F59E0B]' : 'bg-[#00E5FF]'
                      }`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#17232E] text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[9px] text-[#7F95A5] uppercase block">FINDINGS</span>
                      <span className="font-bold text-[#F59E0B]">{asm.findings_count || 0} DISCOVERED</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#7F95A5] uppercase block">RISK SCORE</span>
                      <span className={`font-bold ${asm.risk_score >= 70 ? 'text-[#EF4444]' : asm.risk_score > 0 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                        {asm.risk_score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {isRunning ? (
                      <button
                        onClick={e => handleStop(e, asm.id)}
                        disabled={actionLoadingId === asm.id}
                        className="px-3 py-1.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 hover:bg-[#EF4444]/30 text-[#EF4444] text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>STOP</span>
                      </button>
                    ) : (
                      <button
                        onClick={e => handleStart(e, asm.id)}
                        disabled={actionLoadingId === asm.id}
                        className="px-3 py-1.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>START SCAN</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectAssessment(asm.id)}
                      className="p-1.5 rounded bg-[#0B1118] border border-[#17232E] hover:border-[#00E5FF] text-[#7F95A5] hover:text-[#00E5FF] transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AssessmentScopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await assessmentService.createAssessment(payload);
          await fetchAssessments();
        }}
      />
    </div>
  );
};
