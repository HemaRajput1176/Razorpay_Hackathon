import React from 'react';
import { Shield, Zap, AlertTriangle, ArrowRight, Database, Server, Cpu } from 'lucide-react';
import type { AttackPath } from '../../services/nexusService';

interface AttackGraphViewProps {
  attackPath?: AttackPath;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ attackPath }) => {
  if (!attackPath || !attackPath.edges || attackPath.edges.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
        <Shield className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="font-mono text-sm">No Attack Graph Data Generated Yet</p>
      </div>
    );
  }

  const edges = attackPath.edges;

  return (
    <div className="bg-slate-950 border border-cyan-900/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="font-mono font-bold text-slate-100 text-lg">ATTACK PATH GRAPH — {attackPath.path_code}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{attackPath.title}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-red-950/80 border border-red-500/40 text-red-400 font-mono text-xs rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            RISK SCORE: {attackPath.risk_score} / 100
          </span>
          <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono text-xs rounded-full">
            {attackPath.total_steps} EXPLOIT STEPS
          </span>
        </div>
      </div>

      {/* SVG Attack Path Topology Diagram */}
      <div className="relative py-8 px-4 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between relative">
          
          {/* Node 1: Attacker */}
          <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 rounded-full bg-red-950/90 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-950/50">
              <Zap className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
            <span className="font-mono text-xs font-bold text-red-400 mt-2">ATTACKER</span>
            <span className="font-mono text-[10px] text-slate-500">{edges[0]?.source_asset_name || 'EXTERNAL'}</span>
          </div>

          {/* Stepped Edges */}
          {edges.map((edge, idx) => (
            <React.Fragment key={edge.id || idx}>
              {/* Connector line */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                <div className="w-full h-0.5 bg-gradient-to-r from-red-500/80 via-amber-500/80 to-cyan-500/80 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded shadow">
                    STEP {edge.step_number}: {edge.technique_id}
                  </div>
                </div>
                <div className="text-center mt-3 max-w-[160px]">
                  <p className="font-mono text-[11px] text-slate-300 font-medium">{edge.action_taken}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
                    [{edge.evidence_code}]
                  </span>
                </div>
              </div>

              {/* Target Node */}
              <div className="flex flex-col items-center z-10">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-950/50">
                  {edge.target_asset_name.includes('DB') ? (
                    <Database className="w-8 h-8 text-cyan-400" />
                  ) : edge.target_asset_name.includes('CONTAINER') ? (
                    <Cpu className="w-8 h-8 text-purple-400" />
                  ) : (
                    <Server className="w-8 h-8 text-cyan-400" />
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-cyan-300 mt-2">{edge.target_asset_name}</span>
                <span className="font-mono text-[10px] text-slate-500">Target Asset</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Exploit Details Matrix */}
      <div className="mt-6 border-t border-slate-800/80 pt-4">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-3">Attack Vector Timeline & Evidence Mapping</h4>
        <div className="space-y-2">
          {edges.map((edge) => (
            <div key={edge.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 font-mono text-xs font-bold text-cyan-400 flex items-center justify-center">
                  {edge.step_number}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-200 text-xs">{edge.source_asset_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono font-bold text-cyan-400 text-xs">{edge.target_asset_name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{edge.action_taken}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
                  {edge.technique_id} ({edge.technique_name})
                </span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  EVIDENCE: {edge.evidence_code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
