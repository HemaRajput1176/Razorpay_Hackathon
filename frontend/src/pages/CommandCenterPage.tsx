import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Activity, Server, Cpu, 
  Network, ArrowUpRight, Zap, ChevronRight 
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { CyberCard } from '../components/common/CyberCard';
import { Badge } from '../components/common/Badge';
import { CyberTerminal } from '../components/terminal/CyberTerminal';
import { api } from '../services/api';
import type { ModuleId } from '../types';

interface CommandCenterPageProps {
  onNavigate: (module: ModuleId) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await api.getDashboardSummary();
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[#00E5FF] animate-pulse">
        [+] LOADING COMMAND CENTER TELEMETRY...
      </div>
    );
  }

  const { kpis, threat_distribution, live_activity, active_incidents } = data;

  return (
    <div className="space-y-4 font-mono-tech select-none">
      {/* Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#17232E] pb-3">
        <div>
          <h1 className="text-xl font-black text-[#E6F1F5] tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00E5FF]" /> COMMAND CENTER
          </h1>
          <p className="text-xs text-[#7F95A5] mt-0.5">
            Real-time security posture and operational visibility
          </p>
        </div>

        {/* Top Operational Status Badges */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="bg-[#0B1118] border border-[#22C55E]/40 px-2.5 py-1 rounded text-[#22C55E] flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            SYSTEM: ONLINE
          </div>
          <div className="bg-[#0B1118] border border-[#00E5FF]/40 px-2.5 py-1 rounded text-[#00E5FF] flex items-center gap-1.5 font-bold">
            <Activity className="w-3 h-3 text-[#00E5FF]" />
            TELEMETRY: LIVE
          </div>
          <div className="bg-[#0B1118] border border-[#8B5CF6]/40 px-2.5 py-1 rounded text-[#8B5CF6] flex items-center gap-1.5 font-bold">
            <Cpu className="w-3 h-3 text-[#8B5CF6]" />
            AI: ONLINE
          </div>
          <div className="bg-[#0B1118] border border-[#238BFF]/40 px-2.5 py-1 rounded text-[#238BFF] flex items-center gap-1.5 font-bold">
            <Server className="w-3 h-3 text-[#238BFF]" />
            LAB: CONNECTED
          </div>
        </div>
      </div>

      {/* KPI Cards Row (8 Primary Operational Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          title="SECURITY POSTURE"
          value={`${kpis.security_posture}/100`}
          trend="+4.2%"
          icon={ShieldCheck}
          statusColor="green"
          subtext="STRONG POSTURE"
        />
        <MetricCard
          title="ACTIVE THREATS"
          value={kpis.active_threats}
          icon={ShieldAlert}
          statusColor="red"
          subtext="ELEVATED RISK"
        />
        <MetricCard
          title="CRITICAL VULNS"
          value={`0${kpis.critical_vulnerabilities}`}
          icon={AlertTriangle}
          statusColor="red"
          subtext="ACTION REQUIRED"
        />
        <MetricCard
          title="ACTIVE INCIDENTS"
          value={`0${kpis.active_incidents}`}
          icon={Activity}
          statusColor="amber"
          subtext="4 UNDER TRIAGE"
        />
        <MetricCard
          title="PROTECTED ASSETS"
          value={kpis.protected_assets}
          icon={Server}
          statusColor="cyan"
          subtext="100% COVERED"
        />
        <MetricCard
          title="DETECTION COVERAGE"
          value={`${kpis.detection_coverage}%`}
          icon={Zap}
          statusColor="green"
          subtext="MITRE ATT&CK"
        />
        <MetricCard
          title="ATTACK SURFACE"
          value={kpis.attack_surface_nodes}
          icon={Network}
          statusColor="purple"
          subtext="EXPOSED NODES"
        />
        <MetricCard
          title="AI RISK SCORE"
          value={kpis.ai_risk_score}
          icon={Cpu}
          statusColor="amber"
          subtext="MODERATE RISK"
        />
      </div>

      {/* 3-Column Main Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Threat Severity Distribution */}
        <div className="lg:col-span-3">
          <CyberCard title="THREAT DISTRIBUTION" subtitle="Current active findings by severity">
            <div className="py-4 flex flex-col items-center justify-center">
              {/* Doughnut distribution representation */}
              <div className="relative w-36 h-36 rounded-full border-4 border-[#17232E] flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div className="text-center">
                  <span className="text-2xl font-black text-[#E6F1F5] block font-mono-tech">
                    {threat_distribution.total}
                  </span>
                  <span className="text-[10px] text-[#7F95A5] uppercase tracking-wider block">
                    TOTAL THREATS
                  </span>
                </div>
              </div>

              {/* Severity Legend */}
              <div className="w-full mt-6 space-y-2 text-xs">
                <div className="flex items-center justify-between p-1.5 bg-[#070B11] rounded border border-[#FF3B30]/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
                    <span className="text-[#E6F1F5] font-bold">CRITICAL</span>
                  </div>
                  <span className="text-[#FF3B30] font-bold font-mono-tech">{threat_distribution.critical} (5.8%)</span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-[#070B11] rounded border border-[#F59E0B]/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-[#E6F1F5] font-bold">HIGH</span>
                  </div>
                  <span className="text-[#F59E0B] font-bold font-mono-tech">{threat_distribution.high} (17.3%)</span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-[#070B11] rounded border border-[#00E5FF]/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                    <span className="text-[#E6F1F5] font-bold">MEDIUM</span>
                  </div>
                  <span className="text-[#00E5FF] font-bold font-mono-tech">{threat_distribution.medium} (34.6%)</span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-[#070B11] rounded border border-[#238BFF]/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#238BFF]" />
                    <span className="text-[#E6F1F5] font-bold">LOW</span>
                  </div>
                  <span className="text-[#238BFF] font-bold font-mono-tech">{threat_distribution.low} (42.3%)</span>
                </div>
              </div>
            </div>
          </CyberCard>
        </div>

        {/* CENTER COLUMN: Live Security Activity Stream */}
        <div className="lg:col-span-6">
          <CyberCard 
            title="LIVE SECURITY ACTIVITY" 
            subtitle="Real-time telemetry event stream"
            action={
              <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE STREAM
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#17232E] text-[10px] text-[#7F95A5] uppercase">
                    <th className="py-2 px-2">TIME</th>
                    <th className="py-2 px-2">SOURCE</th>
                    <th className="py-2 px-2">EVENT</th>
                    <th className="py-2 px-2">ASSET</th>
                    <th className="py-2 px-2">SEVERITY</th>
                    <th className="py-2 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17232E]/40">
                  {live_activity.map((act: any) => (
                    <tr key={act.id} className="hover:bg-[#0F1720]/60 transition">
                      <td className="py-2 px-2 text-[#7F95A5] font-mono-tech">{act.time}</td>
                      <td className="py-2 px-2 text-[#00E5FF] font-mono-tech">{act.source}</td>
                      <td className="py-2 px-2 text-[#E6F1F5] font-semibold">{act.event}</td>
                      <td className="py-2 px-2 text-[#7F95A5] font-bold">{act.asset}</td>
                      <td className="py-2 px-2">
                        <Badge variant={act.severity}>{act.severity}</Badge>
                      </td>
                      <td className="py-2 px-2 text-[#7F95A5]">{act.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CyberCard>

          {/* Authentic Cyber Terminal Component embedded in Command Center */}
          <div className="mt-4">
            <CyberTerminal />
          </div>
        </div>

        {/* RIGHT COLUMN: Active Incidents & AI Insights Widget */}
        <div className="lg:col-span-3 space-y-4">
          <CyberCard 
            title="ACTIVE INCIDENTS" 
            subtitle="Prioritized response queue"
            action={
              <button 
                onClick={() => onNavigate('soc')}
                className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-0.5"
              >
                VIEW ALL <ChevronRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-2">
              {active_incidents.map((inc: any) => (
                <div 
                  key={inc.id}
                  onClick={() => onNavigate('soc')}
                  className="p-2.5 bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF]/50 rounded cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#00E5FF] group-hover:underline">
                      {inc.id}
                    </span>
                    <Badge variant={inc.severity}>{inc.severity}</Badge>
                  </div>
                  <h4 className="text-xs text-[#E6F1F5] font-semibold line-clamp-1">
                    {inc.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-[#7F95A5]">
                    <span>Asset: <strong className="text-[#E6F1F5]">{inc.asset}</strong></span>
                    <span>{inc.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CyberCard>

          {/* NEXUS AI Security Brain Widget */}
          <CyberCard 
            title="NEXUS AI — SECURITY BRAIN" 
            subtitle="Autonomous neural threat reasoning"
            glow="purple"
          >
            <div className="space-y-3">
              <div className="p-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#8B5CF6] font-bold uppercase tracking-wider">
                    LATEST AI INSIGHT
                  </span>
                  <span className="text-[10px] text-[#22C55E] font-bold">CONFIDENCE: 94.7%</span>
                </div>
                <p className="text-xs text-[#E6F1F5] leading-relaxed">
                  3 correlated events indicate a possible credential compromise on <strong>API-01</strong>.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="HIGH">RISK: HIGH</Badge>
                  <button 
                    onClick={() => onNavigate('nexus-ai')}
                    className="text-[10px] text-[#8B5CF6] hover:underline font-bold flex items-center gap-1"
                  >
                    INVESTIGATE <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
};
