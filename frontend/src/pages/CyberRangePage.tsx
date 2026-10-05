import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, RefreshCw, Shield, Server, AlertCircle } from 'lucide-react';
import { CyberCard } from '../components/common/CyberCard';
import { Badge } from '../components/common/Badge';
import { LabTopology } from '../components/range/LabTopology';
import { AssetDetailDrawer } from '../components/range/AssetDetailDrawer';
import { CyberTerminal } from '../components/terminal/CyberTerminal';
import { labService } from '../services/labService';
import type { Lab, LabAsset, LabEvent, TopologyNode, TopologyEdge } from '../types';

export const CyberRangePage: React.FC = () => {
  const [lab, setLab] = useState<Lab | null>(null);
  const [topology, setTopology] = useState<{ nodes: TopologyNode[]; edges: TopologyEdge[] }>({ nodes: [], edges: [] });
  const [events, setEvents] = useState<LabEvent[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<LabAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'START' | 'STOP' | 'RESTART' | null>(null);

  async function loadLabData() {
    const labData = await labService.getLab('nexora-enterprise');
    const topoData = await labService.getLabTopology('nexora-enterprise');
    const evtData = await labService.getLabEvents('nexora-enterprise');
    setLab(labData);
    setTopology({ nodes: topoData.nodes, edges: topoData.edges });
    setEvents(evtData);
    setLoading(false);
  }

  useEffect(() => {
    loadLabData();
  }, []);

  // WebSocket for Live Telemetry Updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws/labs/nexora-enterprise`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event_type && data.event_type !== 'PONG') {
            setEvents(prev => [
              {
                id: `evt-${Date.now()}`,
                event_type: data.event_type,
                message: data.message || 'Lab telemetry event received',
                severity: 'INFO',
                timestamp: new Date().toLocaleTimeString()
              },
              ...prev
            ]);
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleLabAction = async (action: 'START' | 'STOP' | 'RESTART') => {
    setConfirmModal(null);
    setActionLoading(true);

    if (action === 'START') {
      await labService.startLab('nexora-enterprise');
    } else if (action === 'STOP') {
      await labService.stopLab('nexora-enterprise');
    } else if (action === 'RESTART') {
      await labService.restartLab('nexora-enterprise');
    }

    await loadLabData();
    setActionLoading(false);
  };

  if (loading || !lab) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[#00E5FF] animate-pulse">
        [+] LOADING CYBER RANGE LAB INFRASTRUCTURE...
      </div>
    );
  }

  const isDockerAvailable = lab.docker_engine?.available;

  return (
    <div className="space-y-4 font-mono-tech select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#17232E] pb-3">
        <div>
          <h1 className="text-xl font-black text-[#E6F1F5] tracking-widest uppercase flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-[#00E5FF]" /> CYBER RANGE
          </h1>
          <p className="text-xs text-[#7F95A5] mt-0.5">
            Isolated Docker security laboratory environment
          </p>
        </div>

        {/* Top Operational Status Badges */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="bg-[#0B1118] border border-[#22C55E]/40 px-2.5 py-1 rounded text-[#22C55E] font-bold">
            LAB ENGINE: ONLINE
          </div>
          <div className={`bg-[#0B1118] border px-2.5 py-1 rounded font-bold ${
            isDockerAvailable 
              ? 'border-[#00E5FF]/40 text-[#00E5FF]' 
              : 'border-[#F59E0B]/40 text-[#F59E0B]'
          }`}>
            {isDockerAvailable ? 'DOCKER: CONNECTED' : 'DOCKER: DIAGNOSTIC MODE'}
          </div>
          <div className="bg-[#0B1118] border border-[#8B5CF6]/40 px-2.5 py-1 rounded text-[#8B5CF6] font-bold">
            NETWORK: ISOLATED
          </div>
          <div className="bg-[#0B1118] border border-[#238BFF]/40 px-2.5 py-1 rounded text-[#238BFF] font-bold">
            TELEMETRY: READY
          </div>
        </div>
      </div>

      {/* Docker Engine Offline Warning Banner if Docker is unavailable on host */}
      {!isDockerAvailable && (
        <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded text-xs text-[#F59E0B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B]" />
            <span>
              <strong>DOCKER ENGINE DIAGNOSTIC NOTE:</strong> Docker Desktop is not currently running on host. Lab architecture & telemetry logic are active in diagnostic simulation mode.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold bg-[#F59E0B]/20 px-2 py-0.5 rounded border border-[#F59E0B]/40">
            DOCKER VERIFICATION BLOCKED
          </span>
        </div>
      )}

      {/* Lab Header Control Card */}
      <CyberCard glow="cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-[#E6F1F5] tracking-widest">
                {lab.name}
              </h2>
              <Badge variant={lab.status === 'RUNNING' ? 'ONLINE' : 'CRITICAL'}>
                {lab.status}
              </Badge>
            </div>
            <p className="text-xs text-[#7F95A5]">{lab.description}</p>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmModal('START')}
              disabled={actionLoading || lab.status === 'RUNNING'}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 disabled:opacity-40 text-[#030609] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> [ START LAB ]
            </button>
            <button
              onClick={() => setConfirmModal('STOP')}
              disabled={actionLoading || lab.status === 'STOPPED'}
              className="bg-[#17232E] hover:bg-[#FF3B30]/20 hover:border-[#FF3B30] text-[#E6F1F5] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition border border-[#17232E] flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current text-[#FF3B30]" /> [ STOP LAB ]
            </button>
            <button
              onClick={() => setConfirmModal('RESTART')}
              disabled={actionLoading}
              className="bg-[#0F1720] hover:bg-[#00E5FF]/20 text-[#00E5FF] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition border border-[#00E5FF]/30 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} /> [ RESTART ]
            </button>
          </div>
        </div>
      </CyberCard>

      {/* Main Content Layout: Asset Cards Grid + Topology + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: 5 Asset Cards Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-widest mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00E5FF]" /> LAB TARGET ASSETS (5 NODES)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {lab.assets?.map((ast) => (
                <div
                  key={ast.id}
                  className="bg-[#0B1118] border border-[#17232E] hover:border-[#00E5FF]/60 rounded-md p-3 transition flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-[#E6F1F5] font-mono-tech group-hover:text-[#00E5FF]">
                        {ast.name}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        ast.status === 'RUNNING' ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FF3B30]'
                      }`} />
                    </div>
                    <span className="text-[10px] text-[#00E5FF] uppercase font-bold block">
                      {ast.asset_type}
                    </span>
                    <span className="text-[11px] font-mono-tech text-[#7F95A5] block mt-1">
                      {ast.ip_address}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#17232E]/60">
                    <div className="text-[10px] text-[#7F95A5] mb-2">
                      Services: <strong className="text-[#E6F1F5]">{ast.services?.length || 1} Active</strong>
                    </div>
                    <button
                      onClick={() => setSelectedAsset(ast)}
                      className="w-full bg-[#0F1720] hover:bg-[#00E5FF] hover:text-[#030609] text-[#00E5FF] font-bold py-1 px-2 rounded text-[10px] uppercase tracking-wider border border-[#00E5FF]/30 transition"
                    >
                      [ VIEW ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Topology Visualizer */}
          <LabTopology
            nodes={topology.nodes}
            edges={topology.edges}
            onSelectNode={(nodeName) => {
              const found = lab.assets?.find(a => a.name === nodeName);
              if (found) setSelectedAsset(found);
            }}
          />

          {/* Authentic Cyber Terminal */}
          <CyberTerminal />
        </div>

        {/* RIGHT: Live Event Stream Panel */}
        <div className="lg:col-span-4">
          <CyberCard 
            title="LIVE LAB EVENT STREAM" 
            subtitle="Chronological Docker & network events"
            action={
              <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> WEBSOCKET STREAM
              </span>
            }
          >
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-2 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#00E5FF]">{evt.event_type}</span>
                    <span className="text-[#7F95A5] font-mono-tech">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#E6F1F5] leading-relaxed font-mono-tech">
                    {evt.message}
                  </p>
                </div>
              ))}
            </div>
          </CyberCard>
        </div>
      </div>

      {/* Asset Detail Drawer Modal */}
      <AssetDetailDrawer
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-[#030609]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono-tech">
          <div className="bg-[#0B1118] border border-[#00E5FF]/50 rounded-lg p-6 max-w-md w-full shadow-[0_0_40px_rgba(0,229,255,0.2)]">
            <h3 className="text-base font-bold text-[#E6F1F5] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00E5FF]" /> CONFIRM LAB {confirmModal} SEQUENCE
            </h3>
            <p className="text-xs text-[#7F95A5] mb-4 leading-relaxed">
              You are about to initiate <strong>{confirmModal}</strong> on <strong>NEXORA ENTERPRISE LAB</strong>. 5 isolated Docker container nodes will be affected.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#17232E]">
              <button
                onClick={() => setConfirmModal(null)}
                className="bg-[#17232E] hover:bg-[#17232E]/80 text-[#E6F1F5] font-bold px-4 py-2 rounded text-xs uppercase"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => handleLabAction(confirmModal)}
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030609] font-bold px-4 py-2 rounded text-xs uppercase"
              >
                [ CONFIRM {confirmModal} ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
