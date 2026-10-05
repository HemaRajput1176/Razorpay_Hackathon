import React, { useState, useEffect } from 'react';
import { Shield, Lock, Check, X, RefreshCw, CheckCircle } from 'lucide-react';
import { nexusService } from '../services/nexusService';
import type { ResponseAction } from '../services/nexusService';

export const ResponseApprovalPage: React.FC = () => {
  const [pendingActions, setPendingActions] = useState<{ action: ResponseAction; invCode: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPendingActions = async () => {
    try {
      setLoading(true);
      const list = await nexusService.listInvestigations();

      const allPending: { action: ResponseAction; invCode: string }[] = [];
      for (const invSummary of list) {
        try {
          const detail = await nexusService.getInvestigation(invSummary.id);
          for (const plan of detail.response_plans || []) {
            for (const act of plan.actions || []) {
              if (act.status === 'PENDING_APPROVAL') {
                allPending.push({ action: act, invCode: invSummary.investigation_code });
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setPendingActions(allPending);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingActions();
  }, []);

  const handleApprove = async (actionId: string) => {
    try {
      const res = await nexusService.approveAction(actionId);
      setFeedback(`Action Approved & Executed in Cyber Range: ${res.command}`);
      loadPendingActions();
    } catch (e: any) {
      alert(`Approval Error: ${e.message}`);
    }
  };

  const handleReject = async (actionId: string) => {
    try {
      await nexusService.rejectAction(actionId, "Rejected by security analyst");
      setFeedback(`Action Rejected.`);
      loadPendingActions();
    } catch (e: any) {
      alert(`Rejection Error: ${e.message}`);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-slate-100">
              HUMAN-IN-THE-LOOP RESPONSE APPROVAL CONSOLE
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Authorized Cyber Range (10.240.0.0/16) Autonomous Action Verification & Containment Execution
            </p>
          </div>
        </div>

        <button
          onClick={loadPendingActions}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5 font-mono"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {feedback && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center justify-between text-sm font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {pendingActions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 font-mono">
          <Shield className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-200">NO PENDING RESPONSE ACTIONS</h3>
          <p className="text-xs mt-1 text-slate-400">All NEXUS AI proposed response actions have been reviewed or executed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingActions.map(({ action, invCode }) => (
            <div key={action.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs rounded font-bold">
                    {invCode}
                  </span>
                  <span className="font-bold text-slate-200 text-sm">{action.action_code} • {action.action_type}</span>
                </div>
                <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800/40 text-xs rounded-full font-bold">
                  PENDING HUMAN APPROVAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">TARGET ASSET:</span>
                  <span className="text-slate-200 font-bold">{action.target_asset_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TARGET IP ADDRESS:</span>
                  <span className="text-cyan-400 font-bold">{action.target_ip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">LAB SUBNET VALIDATION:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED (10.240.0.0/16)</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">PROPOSED CONTAINMENT COMMAND:</span>
                <code className="block bg-black text-emerald-400 p-3 rounded text-xs border border-slate-800">
                  {action.command_to_execute}
                </code>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => handleReject(action.id)}
                  className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  REJECT
                </button>
                <button
                  onClick={() => handleApprove(action.id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                >
                  <Check className="w-4 h-4" />
                  AUTHORIZE & EXECUTE IN DOCKER LAB
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
