import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, ArrowRight } from 'lucide-react';
import { riskIntelService } from '../services/riskIntelService';
import type { 
  RiskIntelOverview, KnowledgeGraphData, ThreatFeedItem, 
  AttackPathIntelItem, PrioritizedActionItem, StrategicAdvisorRec 
} from '../services/riskIntelService';

export const RiskIntelPage: React.FC = () => {
  const [overview, setOverview] = useState<RiskIntelOverview | null>(null);
  const [graph, setGraph] = useState<KnowledgeGraphData | null>(null);
  const [threats, setThreats] = useState<ThreatFeedItem[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPathIntelItem[]>([]);
  const [actions, setActions] = useState<PrioritizedActionItem[]>([]);
  const [advisor, setAdvisor] = useState<StrategicAdvisorRec | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'graph' | 'threats' | 'paths' | 'prioritization' | 'advisor'>('graph');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, gr, th, ap, act, adv] = await Promise.all([
        riskIntelService.getOverview(),
        riskIntelService.getKnowledgeGraph(),
        riskIntelService.getThreatFeeds(),
        riskIntelService.getAttackPaths(),
        riskIntelService.getPrioritizedActions(),
        riskIntelService.getStrategicAdvisor()
      ]);
      setOverview(ov);
      setGraph(gr);
      setThreats(th);
      setAttackPaths(ap);
      setActions(act);
      setAdvisor(adv);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl shadow-lg">
            <Network className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              CONTINUOUS CYBER RISK INTELLIGENCE ENGINE
              <span className="text-xs px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded-full">
                MILESTONE 8
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Knowledge Graph • Threat Intelligence • Attack Path Exposure • Executive Risk Decision Engine
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Intelligence
        </button>
      </div>

      {/* Summary Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">GRAPH NODES</span>
          <span className="text-xl font-bold text-cyan-400">{overview?.summary.knowledge_graph_nodes || 8}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">GRAPH EDGES</span>
          <span className="text-xl font-bold text-purple-400">{overview?.summary.knowledge_graph_edges || 6}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">THREAT FEEDS</span>
          <span className="text-xl font-bold text-amber-400">{overview?.summary.active_threat_feeds || 2}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">ATTACK PATHS</span>
          <span className="text-xl font-bold text-red-400">{overview?.summary.discovered_attack_paths || 1}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">P0 CRITICAL ACTIONS</span>
          <span className="text-xl font-bold text-red-500">{overview?.summary.p0_critical_actions || 1}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block mb-1">P1 HIGH ACTIONS</span>
          <span className="text-xl font-bold text-amber-500">{overview?.summary.p1_high_actions || 1}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
            activeTab === 'graph' ? 'bg-slate-800/80 border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          KNOWLEDGE GRAPH
        </button>
        <button
          onClick={() => setActiveTab('threats')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
            activeTab === 'threats' ? 'bg-slate-800/80 border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          THREAT INTELLIGENCE ({threats.length})
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
            activeTab === 'paths' ? 'bg-slate-800/80 border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ATTACK PATH EXPOSURE ({attackPaths.length})
        </button>
        <button
          onClick={() => setActiveTab('prioritization')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
            activeTab === 'prioritization' ? 'bg-slate-800/80 border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          RISK PRIORITIZATION MATRIX ({actions.length})
        </button>
        <button
          onClick={() => setActiveTab('advisor')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
            activeTab === 'advisor' ? 'bg-slate-800/80 border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          NEXUS STRATEGIC ADVISOR
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'graph' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase">Cybersecurity Knowledge Graph Topology</h3>
            <span className="text-xs text-slate-400">{graph?.total_nodes} Nodes • {graph?.total_edges} Relationships</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nodes List */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs text-slate-400 font-bold block border-b border-slate-800 pb-2">GRAPH ENTITIES (NODES)</span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {graph?.nodes.map((node) => (
                  <div key={node.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{node.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.type === 'ASSET' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                      node.type === 'VULNERABILITY' ? 'bg-red-950 text-red-400 border border-red-800' :
                      node.type === 'THREAT_ACTOR' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}>
                      {node.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships List */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs text-slate-400 font-bold block border-b border-slate-800 pb-2">ENTITIES RELATIONSHIPS (EDGES)</span>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {graph?.edges.map((edge) => (
                  <div key={edge.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-cyan-400 font-bold">{edge.source.replace(/.*:/, '')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-purple-400 font-bold">{edge.target.replace(/.*:/, '')}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-amber-400 font-bold text-[10px] rounded">
                      {edge.relationship}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threats.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
                  {t.threat_code} • {t.threat_actor}
                </span>
                <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 text-xs rounded-full font-bold">
                  {t.severity}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{t.cve_id} — {t.malware_family}</h3>
              <p className="text-xs text-slate-400">{t.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'paths' && (
        <div className="space-y-4">
          {attackPaths.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-red-400 bg-red-950 px-2.5 py-1 rounded border border-red-800">
                  {p.path_code} • {p.title}
                </span>
                <span className="text-xs font-bold text-cyan-400">PATH RISK SCORE: {p.path_risk_score} / 100</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">ENTRY POINT:</span>
                  <span className="text-slate-200 font-bold">{p.entry_point}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TARGET ASSET:</span>
                  <span className="text-red-400 font-bold">{p.target_asset}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CRITICAL CHOKE POINT:</span>
                  <span className="text-emerald-400 font-bold">{p.choke_point_asset}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'prioritization' && (
        <div className="space-y-4">
          {actions.map((act) => (
            <div key={act.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                  act.priority === 'P0' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {act.priority} CRITICALITY • {act.action_code}
                </span>
                <span className="text-xs text-slate-400">ESTIMATED EFFORT: {act.effort_estimate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{act.title}</h3>
              <p className="text-xs text-slate-400">{act.description}</p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-1">BUSINESS RISK IMPACT:</span>
                <p className="text-emerald-300 font-bold">{act.business_impact}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'advisor' && advisor && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 font-bold">
              {advisor.recommendation_code} • NEXUS STRATEGIC ADVISOR
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-3">{advisor.executive_summary}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 block font-bold">BUSINESS RISK TRANSLATION</span>
              <p className="text-slate-300 leading-relaxed">{advisor.business_risk_translation}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 block font-bold">PROJECTED RISK REDUCTION</span>
              <span className="text-2xl font-bold text-emerald-400">{advisor.projected_risk_reduction}</span>
              <span className="text-slate-400 block mt-1">CONFIDENCE RATING: {advisor.confidence_rating}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
