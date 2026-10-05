import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Play, CheckCircle2 } from 'lucide-react';
import { socService } from '../services/socService';
import type { CorrelationRuleItem } from '../types';

export const DetectionRulesPage: React.FC = () => {
  const [rules, setRules] = useState<CorrelationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fetchRules = async () => {
    try {
      const data = await socService.getDetectionRules();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await socService.toggleRuleState(ruleId, !currentEnabled);
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTest = async (ruleId: string) => {
    try {
      const res = await socService.testRule(ruleId);
      setTestResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7F95A5] flex flex-col items-center gap-3 font-mono-tech">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00E5FF]" />
        <span>LOADING DETECTION & CORRELATION RULES REGISTRY...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#00E5FF] tracking-widest font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>CORRELATION RULES ENGINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6F1F5]">
            THREAT DETECTION & CORRELATION RULES MANAGER
          </h1>
        </div>

        <button
          onClick={fetchRules}
          className="p-2 rounded bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] text-[#7F95A5] hover:text-[#00E5FF] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {testResult && (
        <div className="p-3.5 bg-[#22C55E]/10 border border-[#22C55E]/40 rounded-lg text-xs text-[#22C55E] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{testResult.message}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-[10px] underline">DISMISS</button>
        </div>
      )}

      {/* Rules Table */}
      <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg space-y-3">
        <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider">
          REGISTERED DETECTION RULES ({rules.length})
        </h3>

        <div className="space-y-2">
          {rules.map(r => (
            <div key={r.id} className="p-3.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs space-y-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#00E5FF]">{r.rule_code}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    r.severity === 'CRITICAL' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}>
                    {r.severity}
                  </span>
                  <span className="text-[10px] text-[#7F95A5]">Type: {r.rule_type}</span>
                  <span className="text-[10px] text-[#22C55E]">MITRE: {r.technique_id}</span>
                </div>
                <h4 className="font-bold text-[#E6F1F5]">{r.name}</h4>
                <p className="text-[11px] text-[#7F95A5]">{r.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleTest(r.id)}
                  className="px-3 py-1.5 rounded bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] text-[10px] font-bold text-[#00E5FF] flex items-center gap-1 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>TEST RULE</span>
                </button>

                <button
                  onClick={() => handleToggle(r.id, r.enabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition ${
                    r.enabled
                      ? 'bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E]'
                      : 'bg-[#17232E] text-[#7F95A5]'
                  }`}
                >
                  {r.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
