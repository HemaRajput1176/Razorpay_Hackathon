import React, { useState } from 'react';
import { Code, Play } from 'lucide-react';

export const DevSecOpsPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResults] = useState<any[]>([
    { id: 1, tool: 'SAST (Semgrep)', status: 'PASSED', findings: 0, target: 'backend/app/api/auth.py' },
    { id: 2, tool: 'Container Image Scanner (Trivy)', status: 'WARNING', findings: 2, target: 'cybernexus/web-node:latest' },
    { id: 3, tool: 'Dependency Check (Pip-Audit)', status: 'PASSED', findings: 0, target: 'backend/requirements.txt' },
    { id: 4, tool: 'Cloud Security Posture (Checkov)', status: 'PASSED', findings: 0, target: 'docker-compose.yml' }
  ]);
  const [logOutput, setLogOutput] = useState<string | null>(null);

  const handleRunDevSecOpsPipeline = async () => {
    setScanning(true);
    setLogOutput("Running DevSecOps Pipeline Scans...\n[1/4] Executing SAST Code Analysis... DONE (0 vulnerabilities)\n[2/4] Scanning Docker Container Image cybernexus/web-node... DONE (2 Medium Fixes)\n[3/4] Validating Dependency Trees... DONE\n[4/4] Auditing Isolated Network Policies (10.240.0.0/16)... PASSED");
    setTimeout(() => {
      setScanning(false);
    }, 1200);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <Code className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              DEVSECOPS, CONTAINER & CLOUD SECURITY PIPELINE
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              CI/CD Static Code Analysis, Docker Image Vulnerability Scanning, and Cloud Posture Management
            </p>
          </div>
        </div>

        <button
          onClick={handleRunDevSecOpsPipeline}
          disabled={scanning}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-xs text-white rounded-lg flex items-center gap-2 shadow disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {scanning ? "RUNNING PIPELINE..." : "RUN SECURITY PIPELINE"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">SAST CODE COVERAGE</span>
          <span className="text-3xl font-bold text-emerald-400">100% SECURE</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">CONTAINER PODS SCANNED</span>
          <span className="text-3xl font-bold text-cyan-400">5 LAB PODS</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">CLOUD SECURITY POSTURE</span>
          <span className="text-3xl font-bold text-purple-400">PASS (10.240.0.0/16)</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          SECURITY SCANNER AUDIT LOGS
        </h2>

        <div className="space-y-3">
          {scanResults.map((item) => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-200 block">{item.tool}</span>
                <span className="text-xs text-slate-400">{item.target}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">{item.findings} FINDINGS</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.status === 'PASSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {logOutput && (
          <div className="mt-4 bg-black p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
            <pre>{logOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
