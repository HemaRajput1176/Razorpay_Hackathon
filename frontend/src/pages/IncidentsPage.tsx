import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              INCIDENT RESPONSE & AUTOMATED PLAYBOOKS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Incident Containment, Forensic Triage, and Response Workflow Orchestration
            </p>
          </div>
        </div>

        <button
          onClick={fetchIncidents}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Incidents
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">TOTAL INCIDENTS</span>
          <span className="text-3xl font-bold text-cyan-400">{incidents.length || 1}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">CONTAINED / RESOLVED</span>
          <span className="text-3xl font-bold text-emerald-400">1</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">AUTOMATED PLAYBOOKS</span>
          <span className="text-3xl font-bold text-purple-400">4 ACTIVE</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          INCIDENT QUEUE & RESPONSE ORCHESTRATION
        </h2>

        <div className="space-y-3">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-red-400 bg-red-950 px-2.5 py-1 rounded border border-red-800">
                INC-2026-001 • CRITICAL SEVERITY
              </span>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs rounded-full font-bold">
                CONTAINED IN LAB (10.240.0.0/16)
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-200">Unauthenticated SQL Injection & Container Privilege Escalation Attempt</h3>
            <p className="text-xs text-slate-400">Target Asset: API-01 (10.240.0.11) & CONTAINER-01 (10.240.0.30)</p>
            
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block font-bold">PLAYBOOK EXECUTED:</span>
              <p className="text-cyan-400">PLAYBOOK-001: Automatic Pod Isolation & Session Revocation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
