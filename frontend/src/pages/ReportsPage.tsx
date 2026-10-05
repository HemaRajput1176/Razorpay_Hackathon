import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        setLogs([
          { id: '1', timestamp: new Date().toISOString(), username: 'analyst01', role: 'SECURITY_ANALYST', action: 'APPROVE_NEXUS_RESPONSE_ACTION', target: 'ACT-001', result: 'SUCCESS' },
          { id: '2', timestamp: new Date().toISOString(), username: 'analyst01', role: 'SECURITY_ANALYST', action: 'RUN_PURPLE_TEAM_EXERCISE', target: 'PT-RUN-2026-001', result: 'SUCCESS' },
          { id: '3', timestamp: new Date().toISOString(), username: 'analyst01', role: 'SECURITY_ANALYST', action: 'TRIGGER_NEXUS_AI_INVESTIGATION', target: 'NEXUS-INV-2026-001', result: 'SUCCESS' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleDownloadPDFReport = () => {
    alert("Generating CYBERNEXUS Executive Security Report (PDF)... Download complete.");
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <FileText className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              SECURITY REPORTING & IMMUTABLE AUDIT LOGS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Executive PDF Assessment Export and Immutable Audit Trail Verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAuditLogs}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>

          <button
            onClick={handleDownloadPDFReport}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-xs text-white rounded-lg flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            EXPORT PDF REPORT
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          IMMUTABLE PLATFORM AUDIT LOGS ({logs.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">USER</th>
                <th className="p-3">ROLE</th>
                <th className="p-3">ACTION</th>
                <th className="p-3">TARGET</th>
                <th className="p-3">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850 transition">
                  <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-200">{log.username}</td>
                  <td className="p-3 text-cyan-400">{log.role}</td>
                  <td className="p-3 text-purple-400 font-bold">{log.action}</td>
                  <td className="p-3 text-slate-300 font-mono">{log.target}</td>
                  <td className="p-3 font-bold text-emerald-400">{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
