import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lock, Globe, Server, X } from 'lucide-react';
import type { AssessmentMode } from '../../types';

interface AssessmentScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

export const AssessmentScopeModal: React.FC<AssessmentScopeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState<AssessmentMode>('INTERNAL_LAB');
  const [targetType, setTargetType] = useState<'WEB' | 'API'>('WEB');
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState(mode === 'INTERNAL_LAB' ? 'http://10.240.0.10' : '');
  const [allowedDomainsStr, setAllowedDomainsStr] = useState('');
  const [excludedHostsStr, setExcludedHostsStr] = useState('');
  const [requestBudget, setRequestBudget] = useState(100);
  const [maxRateLimit, setMaxRateLimit] = useState(5);
  const [authorizedBy, setAuthorizedBy] = useState('Chief Security Officer');
  const [attestationGranted, setAttestationGranted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModeChange = (newMode: AssessmentMode) => {
    setMode(newMode);
    setErrorMsg(null);
    if (newMode === 'INTERNAL_LAB') {
      setTargetUrl('http://10.240.0.10');
      setAllowedDomainsStr('10.240.0.10, nexora.lab');
    } else {
      setTargetUrl('https://api.example.com');
      setAllowedDomainsStr('api.example.com, example.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!attestationGranted) {
      setErrorMsg('Mandatory authorization attestation check is required before launching assessment.');
      return;
    }

    if (!targetUrl) {
      setErrorMsg('Target URL cannot be empty.');
      return;
    }

    const allowedDomains = allowedDomainsStr.split(',').map(s => s.trim()).filter(Boolean);
    const excludedHosts = excludedHostsStr.split(',').map(s => s.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      await onSubmit({
        title: title || (mode === 'INTERNAL_LAB' ? 'NEXORA LAB SECURITY ASSESSMENT' : 'EXTERNAL AUTHORIZED AUDIT'),
        mode,
        target_type: targetType,
        target_url: targetUrl,
        allowed_domains: allowedDomains,
        excluded_hosts: excludedHosts,
        request_budget: Number(requestBudget),
        max_rate_limit: Number(maxRateLimit),
        authorized_by: authorizedBy,
        attestation_code: `AUTH-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err.message || 'Failed to create assessment scope');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0B1118] border border-[#17232E] rounded-lg w-full max-w-2xl text-[#E6F1F5] font-mono-tech shadow-[0_0_30px_rgba(0,229,255,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#070B11] border-b border-[#17232E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E6F1F5] tracking-wider uppercase">
                NEW AUTHORIZED SECURITY ASSESSMENT
              </h2>
              <p className="text-[10px] text-[#7F95A5]">Scope Attestation & SSRF Boundary Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#7F95A5] hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/40 rounded text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-2">
              ASSESSMENT TARGET MODE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('INTERNAL_LAB')}
                className={`p-3 rounded border text-left transition flex flex-col gap-1 ${
                  mode === 'INTERNAL_LAB'
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
                    : 'bg-[#070B11] border-[#17232E] text-[#7F95A5] hover:bg-[#0F1720]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">INTERNAL LAB MODE</span>
                  <Server className="w-4 h-4" />
                </div>
                <span className="text-[10px] opacity-80">
                  Target: Isolated Docker Cyber Range (WEB-01, 10.240.0.0/16)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('EXTERNAL_AUTHORIZED')}
                className={`p-3 rounded border text-left transition flex flex-col gap-1 ${
                  mode === 'EXTERNAL_AUTHORIZED'
                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6]'
                    : 'bg-[#070B11] border-[#17232E] text-[#7F95A5] hover:bg-[#0F1720]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">EXTERNAL AUTHORIZED</span>
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] opacity-80">
                  Requires ownership attestation & SSRF guard verification
                </span>
              </button>
            </div>
          </div>

          {/* Title & Target Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-1">
                ASSESSMENT TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={mode === 'INTERNAL_LAB' ? 'NEXORA WEB-01 LAB ASSESSMENT' : 'PRODUCTION API SECURITY AUDIT'}
                className="w-full bg-[#070B11] border border-[#17232E] rounded px-3 py-2 text-xs text-[#E6F1F5] focus:border-[#00E5FF] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-1">
                TARGET TYPE
              </label>
              <select
                value={targetType}
                onChange={e => setTargetType(e.target.value as any)}
                className="w-full bg-[#070B11] border border-[#17232E] rounded px-3 py-2 text-xs text-[#E6F1F5] focus:border-[#00E5FF] outline-none"
              >
                <option value="WEB">WEB APPLICATION</option>
                <option value="API">REST / GRAPHQL API</option>
              </select>
            </div>
          </div>

          {/* Target URL */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-1">
              TARGET URL / ENDPOINT
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="http://10.240.0.10 or https://api.company.com"
              className="w-full bg-[#070B11] border border-[#17232E] rounded px-3 py-2 text-xs text-[#00E5FF] font-bold focus:border-[#00E5FF] outline-none"
            />
          </div>

          {/* Scope Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-1">
                ALLOWED DOMAINS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={allowedDomainsStr}
                onChange={e => setAllowedDomainsStr(e.target.value)}
                placeholder="company.com, api.company.com"
                className="w-full bg-[#070B11] border border-[#17232E] rounded px-3 py-2 text-xs text-[#E6F1F5] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block mb-1">
                EXCLUDED HOSTS
              </label>
              <input
                type="text"
                value={excludedHostsStr}
                onChange={e => setExcludedHostsStr(e.target.value)}
                placeholder="prod-db.company.com"
                className="w-full bg-[#070B11] border border-[#17232E] rounded px-3 py-2 text-xs text-[#E6F1F5] outline-none"
              />
            </div>
          </div>

          {/* Request Budget & Rate Limit */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#070B11] border border-[#17232E] rounded">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold">
                  REQUEST BUDGET CAP
                </label>
                <span className="text-xs font-bold text-[#00E5FF]">{requestBudget} REQS</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={requestBudget}
                onChange={e => setRequestBudget(Number(e.target.value))}
                className="w-full accent-[#00E5FF]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold">
                  MAX RATE LIMIT
                </label>
                <span className="text-xs font-bold text-[#22C55E]">{maxRateLimit} REQ/SEC</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={maxRateLimit}
                onChange={e => setMaxRateLimit(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
            </div>
          </div>

          {/* Authorization Attestation Checkbox */}
          <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="attestCheck"
                checked={attestationGranted}
                onChange={e => setAttestationGranted(e.target.checked)}
                className="mt-0.5 accent-[#00E5FF] cursor-pointer"
              />
              <label htmlFor="attestCheck" className="text-xs text-[#E6F1F5] leading-relaxed cursor-pointer">
                <strong className="text-[#00E5FF]">SCOPE ATTESTATION DECLARATION:</strong> I explicitly declare that I own or hold explicit written authorization to conduct security assessment against this target.
              </label>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#7F95A5] pl-6 pt-1 border-t border-[#17232E]/60">
              <div className="flex items-center gap-1.5">
                <span>Authorized By:</span>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={e => setAuthorizedBy(e.target.value)}
                  className="bg-transparent border-b border-[#17232E] text-[#00E5FF] font-bold focus:border-[#00E5FF] outline-none text-[10px]"
                />
              </div>
              <span className="flex items-center gap-1 text-[#22C55E]"><Lock className="w-3 h-3" /> Non-Destructive Checks Enforced</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#17232E] hover:bg-[#202E3D] text-xs font-semibold text-[#7F95A5] transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting || !attestationGranted}
              className={`px-5 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
                submitting || !attestationGranted
                  ? 'bg-[#17232E] text-[#465663] cursor-not-allowed'
                  : 'bg-[#00E5FF] hover:bg-[#00B4D8] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
              }`}
            >
              {submitting ? 'VALIDATING SCOPE...' : 'CREATE ASSESSMENT SCOPE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
