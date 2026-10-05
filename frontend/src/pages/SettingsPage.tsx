import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <SettingsIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              PLATFORM SETTINGS & RBAC SECURITY CONTROLS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Role-Based Access Control, MFA Enforcement, and Cyber Range Environment Configuration
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            ACTIVE SECURITY OPERATOR PROFILE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">USERNAME:</span>
              <span className="text-slate-200 font-bold">analyst01</span>
            </div>
            <div>
              <span className="text-slate-500 block">ROLE:</span>
              <span className="text-cyan-400 font-bold">CHIEF SECURITY ANALYST</span>
            </div>
            <div>
              <span className="text-slate-500 block">ORGANIZATION:</span>
              <span className="text-slate-200 font-bold">NEXORA ENTERPRISE LAB</span>
            </div>
            <div>
              <span className="text-slate-500 block">MFA STATUS:</span>
              <span className="text-emerald-400 font-bold">ENFORCED (Hardware Token)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            AUTHORIZED CYBER RANGE SUBNETS
          </h2>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <p className="text-emerald-400 font-bold">Subnet 10.240.0.0/16 (ISOLATED DOCKER BRIDGE)</p>
            <p className="text-slate-400 mt-1">Autonomous response actions outside this boundary are strictly blocked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
