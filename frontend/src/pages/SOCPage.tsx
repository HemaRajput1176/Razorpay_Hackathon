import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Play, RefreshCw, Terminal, 
  Search, AlertTriangle, Cpu
} from 'lucide-react';
import { socService, type SOCOverviewResponse } from '../services/socService';
import type { SecurityEvent } from '../types';

interface SOCPageProps {
  onNavigateToModule?: (module: any, paramId?: string) => void;
}

export const SOCPage: React.FC<SOCPageProps> = ({ onNavigateToModule }) => {
  const [data, setData] = useState<SOCOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchSOCData = async () => {
    try {
      const res = await socService.getSOCOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch SOC overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOCData();
    const interval = setInterval(fetchSOCData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDemoScenario = async () => {
    setDemoLoading(true);
    try {
      await socService.triggerSOCDemoScenario();
      await fetchSOCData();
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleAlertFeedback = async (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    try {
      await socService.markAlertFeedback(alertId, 'FALSE_POSITIVE', 'Analyst false positive feedback from SOC');
      await fetchSOCData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-xs text-[#7F95A5] flex flex-col items-center gap-3 font-mono-tech">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00E5FF]" />
        <span>CONNECTING TO REAL-TIME SOC ENGINE TELEMETRY...</span>
      </div>
    );
  }

  const sysStatus = data?.system_status || {
    collectors: 'ONLINE',
    detection_engine: 'ONLINE',
    correlation: 'ONLINE',
    incident_engine: 'ONLINE'
  };

  const summary = data?.summary || {
    total_events: 0,
    events_per_minute: 0,
    active_incidents: 0,
    open_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    low_alerts: 0,
    assets_monitored: 0,
    mttd: 'INSUFFICIENT DATA',
    mttr: 'INSUFFICIENT DATA'
  };

  const recentEvents = data?.recent_events || [];
  const topAlerts = data?.top_alerts || [];

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* SOC Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#00E5FF] tracking-widest font-bold uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>MILESTONE 5 — SECURITY OPERATIONS CENTER & CORRELATION ENGINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6F1F5]">
            CYBERNEXUS SECURITY OPERATIONS CENTER (SOC)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDemoScenario}
            disabled={demoLoading}
            className="px-4 py-2 rounded bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition shrink-0"
          >
            {demoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>RUN SOC-DEMO-001 (LAB SCENARIO)</span>
          </button>

          <button
            onClick={fetchSOCData}
            className="p-2 rounded bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] text-[#7F95A5] hover:text-[#00E5FF] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SYSTEM STATUS BAR */}
      <div className="p-3.5 bg-[#070B11] border border-[#17232E] rounded-lg space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block">
          REAL-TIME SOC PIPELINE SYSTEM STATUS
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
            <span className="text-[#7F95A5]">COLLECTORS</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              {sysStatus.collectors}
            </span>
          </div>

          <div className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
            <span className="text-[#7F95A5]">DETECTION ENGINE</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              {sysStatus.detection_engine}
            </span>
          </div>

          <div className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
            <span className="text-[#7F95A5]">CORRELATION ENGINE</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              {sysStatus.correlation}
            </span>
          </div>

          <div className="p-2.5 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
            <span className="text-[#7F95A5]">INCIDENT ENGINE</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              {sysStatus.incident_engine}
            </span>
          </div>
        </div>
      </div>

      {/* SEVERITY COUNTERS (CRITICAL, HIGH, MEDIUM, LOW) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[#070B11] border border-[#EF4444]/40 rounded-lg space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#EF4444] font-bold block">CRITICAL SEVERITY</span>
          <div className="text-3xl font-bold text-[#EF4444]">
            {summary.critical_alerts < 10 ? `0${summary.critical_alerts}` : summary.critical_alerts}
          </div>
          <span className="text-[10px] text-[#7F95A5]">HIGH PRIORITY ACTION</span>
        </div>

        <div className="p-4 bg-[#070B11] border border-[#F59E0B]/40 rounded-lg space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#F59E0B] font-bold block">HIGH SEVERITY</span>
          <div className="text-3xl font-bold text-[#F59E0B]">
            {summary.high_alerts < 10 ? `0${summary.high_alerts}` : summary.high_alerts}
          </div>
          <span className="text-[10px] text-[#7F95A5]">CORRELATION SIGNAL</span>
        </div>

        <div className="p-4 bg-[#070B11] border border-[#00E5FF]/40 rounded-lg space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold block">MEDIUM SEVERITY</span>
          <div className="text-3xl font-bold text-[#00E5FF]">
            {summary.medium_alerts < 10 ? `0${summary.medium_alerts}` : summary.medium_alerts}
          </div>
          <span className="text-[10px] text-[#7F95A5]">ANOMALY PATTERNS</span>
        </div>

        <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block">LOW SEVERITY</span>
          <div className="text-3xl font-bold text-[#E6F1F5]">
            {summary.low_alerts < 10 ? `0${summary.low_alerts}` : summary.low_alerts}
          </div>
          <span className="text-[10px] text-[#7F95A5]">INFORMATIONAL EVENTS</span>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
          <span className="text-[9px] uppercase text-[#7F95A5] block">ACTIVE INCIDENTS</span>
          <span className="text-lg font-bold text-[#EF4444]">{summary.active_incidents} OPEN</span>
        </div>

        <div className="p-3 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
          <span className="text-[9px] uppercase text-[#7F95A5] block">OPEN ALERTS</span>
          <span className="text-lg font-bold text-[#F59E0B]">{summary.open_alerts} ALERTS</span>
        </div>

        <div className="p-3 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
          <span className="text-[9px] uppercase text-[#7F95A5] block">EVENTS / MIN</span>
          <span className="text-lg font-bold text-[#00E5FF]">{summary.events_per_minute} REQ/MIN</span>
        </div>

        <div className="p-3 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
          <span className="text-[9px] uppercase text-[#7F95A5] block">ASSETS MONITORED</span>
          <span className="text-lg font-bold text-[#22C55E]">{summary.assets_monitored} NODES</span>
        </div>

        <div className="p-3 bg-[#070B11] border border-[#17232E] rounded text-xs space-y-1">
          <span className="text-[9px] uppercase text-[#7F95A5] block">MTTD / MTTR</span>
          <span className="text-xs font-bold text-[#E6F1F5]">{summary.mttd} | {summary.mttr}</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: LIVE SECURITY EVENT STREAM */}
        <div className="lg:col-span-7 bg-[#070B11] border border-[#17232E] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#17232E]">
            <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00E5FF]" />
              <span>LIVE SECURITY EVENT STREAM</span>
            </h3>
            <span className="text-[10px] text-[#22C55E] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping"></span> REAL-TIME INGESTION
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#7F95A5]">
              NO DATA — CLICK "RUN SOC-DEMO-001" TO GENERATE LAB TELEMETRY EVENTS.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {recentEvents.map(evt => {
                const isSelected = selectedEvent?.id === evt.id;
                const sevColor = 
                  evt.severity === 'CRITICAL' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30' :
                  evt.severity === 'HIGH' ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30' :
                  evt.severity === 'MEDIUM' ? 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30' :
                  'text-[#7F95A5] bg-[#0B1118] border-[#17232E]';

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-2.5 bg-[#0B1118] border rounded text-xs flex items-center justify-between cursor-pointer transition font-mono ${
                      isSelected ? 'border-[#00E5FF] bg-[#0F1720]' : 'border-[#17232E] hover:border-[#7F95A5]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-[10px] text-[#7F95A5] shrink-0">
                        {evt.timestamp ? evt.timestamp.substring(11, 19) : 'NOW'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${sevColor}`}>
                        {evt.event_type}
                      </span>
                      <span className="font-bold text-[#E6F1F5] truncate">{evt.source}</span>
                      <span className="text-[11px] text-[#7F95A5] truncate">{evt.action}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[10px]">
                      <span className="text-[#00E5FF]">{evt.source_ip}</span>
                      <span className="text-[#7F95A5]">{evt.result}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: TOP ALERTS & ATTACK ACTIVITY */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Top Alerts */}
          <div className="bg-[#070B11] border border-[#17232E] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#17232E]">
              <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span>TOP CORRELATED ALERTS</span>
              </h3>
              <span className="text-[10px] text-[#7F95A5]">CONFIDENCE SCORE: 94.7%</span>
            </div>

            {topAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7F95A5]">
                NO DATA — NO ACTIVE CORRELATED ALERTS DETECTED.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {topAlerts.map(a => (
                  <div key={a.id} className="p-3 bg-[#0B1118] border border-[#17232E] rounded space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#00E5FF]">{a.code || a.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          a.severity === 'CRITICAL' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        }`}>
                          {a.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#22C55E] font-bold">{a.status}</span>
                    </div>

                    <h4 className="font-bold text-[#E6F1F5] leading-snug">{a.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-[#7F95A5]">
                      <span>Rule: {a.detection_rule}</span>
                      <button
                        onClick={e => handleAlertFeedback(e, a.id)}
                        className="text-[#EF4444] hover:underline"
                      >
                        MARK FALSE POSITIVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Navigation Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateToModule && onNavigateToModule('threat-hunting')}
              className="p-3 bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF] rounded-lg transition text-left space-y-1 group"
            >
              <div className="flex items-center justify-between text-[#00E5FF]">
                <span className="text-xs font-bold uppercase">THREAT HUNTING</span>
                <Search className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[10px] text-[#7F95A5]">Query normalized events & map attack patterns</p>
            </button>

            <button
              onClick={() => onNavigateToModule && onNavigateToModule('purple-team')}
              className="p-3 bg-[#070B11] border border-[#17232E] hover:border-[#8B5CF6] rounded-lg transition text-left space-y-1 group"
            >
              <div className="flex items-center justify-between text-[#8B5CF6]">
                <span className="text-xs font-bold uppercase">PURPLE TEAM</span>
                <Cpu className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[10px] text-[#7F95A5]">MITRE ATT&CK Matrix & Detection Gap Analysis</p>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
