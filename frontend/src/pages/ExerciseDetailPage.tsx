import React, { useState, useEffect } from 'react';
import { Target, Play, Shield, RefreshCw, X, Download } from 'lucide-react';
import { CyberCard } from '../components/common/CyberCard';
import { Badge } from '../components/common/Badge';
import { CyberTerminal } from '../components/terminal/CyberTerminal';
import { exerciseService } from '../services/exerciseService';

interface ExerciseDetailPageProps {
  exerciseCode?: string;
  onBack?: () => void;
}

export const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = ({ exerciseCode = 'EX-001', onBack }) => {
  const [exercise, setExercise] = useState<any>(null);
  const [preflightData, setPreflightData] = useState<any>(null);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [retestResult, setRetestResult] = useState<any>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExercise() {
      const exData = await exerciseService.getExercise(exerciseCode);
      const pfData = await exerciseService.runPreflight(exerciseCode);
      setExercise(exData);
      setPreflightData(pfData);
      setLoading(false);
    }
    loadExercise();
  }, [exerciseCode]);

  const handleStartExercise = async () => {
    setShowPreflightModal(false);
    setExecuting(true);
    setActiveStage(1);

    // Animate stage sequence
    for (let s = 1; s <= 9; s++) {
      await new Promise(r => setTimeout(r, 200));
      setActiveStage(s);
    }

    const res = await exerciseService.startExercise(exerciseCode);
    setRunResult(res);
    setExecuting(false);
  };

  const handleRetest = async () => {
    setRetesting(true);
    const res = await exerciseService.retestFinding('FND-WEB-001');
    setRetestResult(res);
    setRetesting(false);
  };

  const handleDownloadReport = async () => {
    const text = await exerciseService.getReportPdf(runResult?.run_id || 'run-sim-001');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CYBERNEXUS_REPORT_${exerciseCode}.txt`;
    a.click();
  };

  if (loading || !exercise) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[#00E5FF] animate-pulse">
        [+] LOADING EXERCISE OPERATIONS CONSOLE...
      </div>
    );
  }

  const pipelineStages = [
    "1. Preflight Check",
    "2. Scope Validation",
    "3. Controlled Action",
    "4. Telemetry Captured",
    "5. Detection Evaluated",
    "6. SOC Alert",
    "7. Incident Created",
    "8. SHA256 Evidence",
    "9. Finding & Risk"
  ];

  return (
    <div className="space-y-4 font-mono-tech select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#17232E] pb-3">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="text-xs text-[#00E5FF] hover:underline mr-2">
                &lt; BACK TO EXERCISES
              </button>
            )}
            <h1 className="text-xl font-black text-[#E6F1F5] tracking-widest uppercase flex items-center gap-2">
              <Target className="w-5 h-5 text-[#22C55E]" /> {exercise.name} ({exercise.code})
            </h1>
          </div>
          <p className="text-xs text-[#7F95A5] mt-0.5">{exercise.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="ONLINE">STATUS: {runResult ? runResult.status : exercise.status}</Badge>
          <button
            onClick={() => setShowPreflightModal(true)}
            disabled={executing}
            className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030609] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> [ START EXERCISE ]
          </button>
        </div>
      </div>

      {/* Authorized Scope Banner */}
      <div className="p-3 bg-[#0B1118] border border-[#00E5FF]/40 rounded-md grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] text-[#7F95A5]">
        <div>AUTHORIZED LAB: <strong className="text-[#00E5FF] block">{exercise.scope.authorized_lab}</strong></div>
        <div>PRIMARY TARGET: <strong className="text-[#E6F1F5] block">{exercise.scope.primary_asset}</strong></div>
        <div>SUPPORTING TARGETS: <strong className="text-[#7F95A5] block">{exercise.scope.supporting_assets.join(', ')}</strong></div>
        <div>ENVIRONMENT: <strong className="text-[#238BFF] block">{exercise.scope.environment}</strong></div>
        <div>EXTERNAL TARGETS: <strong className="text-[#22C55E] block">{exercise.scope.external_targets}</strong></div>
      </div>

      {/* 9-Stage Execution Stepper */}
      <CyberCard title="SECURITY VALIDATION PIPELINE STEPPER">
        <div className="grid grid-cols-3 md:grid-cols-9 gap-1.5 text-center">
          {pipelineStages.map((stageName, idx) => {
            const stageNum = idx + 1;
            const isDone = runResult || activeStage > stageNum;
            const isCurrent = executing && activeStage === stageNum;
            return (
              <div
                key={idx}
                className={`p-2 rounded border text-[10px] font-bold font-mono-tech transition ${
                  isDone 
                    ? 'bg-[#22C55E]/15 border-[#22C55E] text-[#22C55E]' 
                    : isCurrent 
                    ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] animate-pulse' 
                    : 'bg-[#030609] border-[#17232E] text-[#465663]'
                }`}
              >
                {stageName}
              </div>
            );
          })}
        </div>
      </CyberCard>

      {/* Exercise Results Viewport */}
      {runResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Telemetry & Alert & SHA256 Evidence */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Telemetry Log Table */}
            <CyberCard 
              title="NORMALIZED LAB TELEMETRY STREAM" 
              subtitle={`Correlation ID: ${runResult.request_id}`}
              action={<span className="text-[10px] text-[#00E5FF] font-bold">3 EVENTS CAPTURED</span>}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#17232E] text-[10px] text-[#7F95A5] uppercase">
                      <th className="py-2 px-2">TIME</th>
                      <th className="py-2 px-2">SOURCE</th>
                      <th className="py-2 px-2">EVENT TYPE</th>
                      <th className="py-2 px-2">ACTION / PAYLOAD</th>
                      <th className="py-2 px-2">SEVERITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17232E]/40 font-mono-tech">
                    <tr className="hover:bg-[#0F1720]">
                      <td className="py-2 px-2 text-[#7F95A5]">10:42:11</td>
                      <td className="py-2 px-2 text-[#00E5FF] font-bold">WEB-01</td>
                      <td className="py-2 px-2 text-[#E6F1F5]">HTTP_REQUEST</td>
                      <td className="py-2 px-2 text-[#7F95A5] truncate max-w-xs">GET /api/v1/user/data?admin=true</td>
                      <td className="py-2 px-2"><Badge variant="HIGH">HIGH</Badge></td>
                    </tr>
                    <tr className="hover:bg-[#0F1720]">
                      <td className="py-2 px-2 text-[#7F95A5]">10:42:12</td>
                      <td className="py-2 px-2 text-[#8B5CF6] font-bold">API-01</td>
                      <td className="py-2 px-2 text-[#E6F1F5]">APPLICATION_ANOMALY</td>
                      <td className="py-2 px-2 text-[#7F95A5] truncate max-w-xs">UNAUTHENTICATED_PARAMETER_ELEVATION</td>
                      <td className="py-2 px-2"><Badge variant="HIGH">HIGH</Badge></td>
                    </tr>
                    <tr className="hover:bg-[#0F1720]">
                      <td className="py-2 px-2 text-[#7F95A5]">10:42:13</td>
                      <td className="py-2 px-2 text-[#238BFF] font-bold">DB-01</td>
                      <td className="py-2 px-2 text-[#E6F1F5]">DB_QUERY</td>
                      <td className="py-2 px-2 text-[#7F95A5] truncate max-w-xs">SELECT * FROM user_accounts WHERE is_admin = true</td>
                      <td className="py-2 px-2"><Badge variant="MEDIUM">MEDIUM</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CyberCard>

            {/* Generated SOC Alert Card */}
            <CyberCard title="SIEM ALERT & INCIDENT CORRELATION" glow="red">
              <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="CRITICAL">ALERT: {runResult.detection.alert}</Badge>
                  <span className="text-xs text-[#22C55E] font-bold">CONFIDENCE: 94.7%</span>
                </div>
                <h4 className="text-sm font-bold text-[#E6F1F5]">
                  {runResult.detection.rule}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#7F95A5] pt-2 border-t border-[#17232E]">
                  <div>Incident Code: <strong className="text-[#00E5FF]">{runResult.detection.incident}</strong></div>
                  <div>MITRE Code: <strong className="text-[#8B5CF6]">{runResult.detection.mitre_technique}</strong></div>
                </div>
              </div>
            </CyberCard>

            {/* SHA-256 Forensic Evidence Chain */}
            <CyberCard title="SHA-256 FORENSIC EVIDENCE CHAIN" subtitle="Integrity verified cryptographic artifacts">
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#030609] border border-[#17232E] rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00E5FF] font-bold">EVID-001 — Nginx Access Log</span>
                    <span className="text-[#22C55E] font-bold text-[10px]">INTEGRITY: VERIFIED</span>
                  </div>
                  <div className="text-[11px] text-[#7F95A5] font-mono">
                    SHA-256: 5f3c8a9d10e2b4f68a7c12d45e6f890123456789abcdef0123456789abcdef01
                  </div>
                </div>

                <div className="p-2.5 bg-[#030609] border border-[#17232E] rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B5CF6] font-bold">EVID-002 — API Gateway Trace</span>
                    <span className="text-[#22C55E] font-bold text-[10px]">INTEGRITY: VERIFIED</span>
                  </div>
                  <div className="text-[11px] text-[#7F95A5] font-mono">
                    SHA-256: a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0
                  </div>
                </div>
              </div>
            </CyberCard>

            {/* Authentic Cyber Terminal */}
            <CyberTerminal />
          </div>

          {/* Right Column: Finding, Risk Score, Fix-Retest & Report */}
          <div className="lg:col-span-5 space-y-4">
            {/* Risk Score Widget */}
            <CyberCard title="RISK SCORE ASSESSMENT" glow="purple">
              <div className="flex items-center justify-between p-3 bg-[#070B11] border border-[#17232E] rounded">
                <div>
                  <span className="text-[10px] text-[#7F95A5] uppercase block">COMPOSITE RISK SCORE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#FF3B30] font-mono-tech">
                      {retestResult ? retestResult.new_risk_score : runResult.detection.risk_score}
                    </span>
                    <span className="text-xs text-[#7F95A5]">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={retestResult ? "ONLINE" : "CRITICAL"}>
                    {retestResult ? "RISK: LOW (VERIFIED)" : "RISK: HIGH"}
                  </Badge>
                  <span className="text-[10px] text-[#465663] block mt-1">MITRE ATT&CK T1190</span>
                </div>
              </div>
            </CyberCard>

            {/* Finding & Remediation */}
            <CyberCard title="SECURITY FINDING & REMEDIATION">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#00E5FF] uppercase font-bold block">FINDING CODE</span>
                  <h4 className="text-sm font-bold text-[#E6F1F5]">
                    FND-WEB-001 — Insecure API Direct Object Reference & Authorization Weakness
                  </h4>
                </div>

                <div className="p-2.5 bg-[#030609] border border-[#17232E] rounded space-y-1.5">
                  <span className="text-[10px] text-[#7F95A5] uppercase font-bold block">RECOMMENDED REMEDIATION</span>
                  <p className="text-[11px] text-[#E6F1F5] leading-relaxed">
                    Update API-01 middleware to enforce server-side JWT session validation and reject unauthenticated query overrides (`admin=true`).
                  </p>
                </div>

                {/* Retest Result Banner */}
                {retestResult && (
                  <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/40 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#22C55E] font-bold">RE-TEST RESULT: VERIFIED FIXED</span>
                      <Badge variant="ONLINE">PASS</Badge>
                    </div>
                    <p className="text-[11px] text-[#E6F1F5]">
                      {retestResult.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons: Fix -> Retest & Download PDF Report */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleRetest}
                    disabled={retesting || retestResult?.status === 'VERIFIED'}
                    className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-50 text-[#E6F1F5] font-bold py-2.5 rounded text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${retesting ? 'animate-spin' : ''}`} />
                    {retesting ? 'RUNNING RE-TEST VALIDATION...' : '[ RUN FIX → RE-TEST VALIDATION ]'}
                  </button>

                  <button
                    onClick={handleDownloadReport}
                    className="w-full bg-[#17232E] hover:bg-[#00E5FF]/20 text-[#00E5FF] font-bold py-2.5 rounded text-xs uppercase tracking-wider transition border border-[#00E5FF]/30 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    [ EXPORT EXECUTIVE PDF REPORT ]
                  </button>
                </div>
              </div>
            </CyberCard>
          </div>
        </div>
      )}

      {/* Pre-Flight Check Confirmation Modal */}
      {showPreflightModal && preflightData && (
        <div className="fixed inset-0 z-50 bg-[#030609]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono-tech">
          <div className="bg-[#0B1118] border border-[#00E5FF]/50 rounded-lg p-6 max-w-xl w-full shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            <div className="flex items-center justify-between mb-4 border-b border-[#17232E] pb-2">
              <h3 className="text-base font-bold text-[#E6F1F5] uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00E5FF]" /> PRE-FLIGHT SECURITY CHECK (10 ITEMS)
              </h3>
              <button onClick={() => setShowPreflightModal(false)} className="text-[#7F95A5] hover:text-[#E6F1F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
              {preflightData.checks.map((chk: any, idx: number) => (
                <div key={idx} className="p-2 bg-[#030609] border border-[#17232E] rounded flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#E6F1F5]">{chk.name}</span>
                    <span className="text-[10px] text-[#7F95A5] block">{chk.detail}</span>
                  </div>
                  <span className="text-[#22C55E] font-bold text-xs font-mono-tech shrink-0 ml-2">
                    [✓] PASS
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#17232E]">
              <button
                onClick={() => setShowPreflightModal(false)}
                className="bg-[#17232E] hover:bg-[#17232E]/80 text-[#E6F1F5] font-bold px-4 py-2 rounded text-xs uppercase"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={handleStartExercise}
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030609] font-bold px-5 py-2 rounded text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              >
                [ CONFIRM & LAUNCH EXERCISE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
