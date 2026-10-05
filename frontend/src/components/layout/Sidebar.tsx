import React from 'react';
import { 
  Activity, ShieldAlert, Target, Lock, Cpu, Server, Network, ShieldCheck, 
  Search, FileText, Terminal, Code, Box, Cloud, AlertTriangle, BookOpen, 
  Settings as SettingsIcon, Layers
} from 'lucide-react';
import type { ModuleId } from '../../types';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const sections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'command-center', label: 'Dashboard', icon: Activity }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'soc', label: 'SOC', icon: ShieldAlert },
        { id: 'threat-hunting', label: 'Threat Hunting', icon: Search },
        { id: 'red-team', label: 'Red Team', icon: Target },
        { id: 'blue-team', label: 'Detection Rules', icon: Lock },
        { id: 'purple-team', label: 'Purple Team', icon: Cpu }
      ]
    },
    {
      title: 'ATTACK SURFACE',
      items: [
        { id: 'assets', label: 'Assets', icon: Server },
        { id: 'attack-surface', label: 'Attack Surface', icon: Search },
        { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldCheck },
        { id: 'assessments', label: 'Assessments Engine', icon: ShieldCheck },
        { id: 'attack-graph', label: 'Attack Graph', icon: Network }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'threat-intel', label: 'Threat Intelligence', icon: Search },
        { id: 'iocs', label: 'IOCs', icon: Layers },
        { id: 'threat-actors', label: 'Threat Actors', icon: AlertTriangle },
        { id: 'nexus-ai', label: 'NEXUS AI', icon: Cpu }
      ]
    },
    {
      title: 'FORENSICS',
      items: [
        { id: 'investigations', label: 'Investigations', icon: FileText },
        { id: 'evidence', label: 'Evidence', icon: Lock },
        { id: 'timeline', label: 'Timeline', icon: Activity }
      ]
    },
    {
      title: 'CYBER RANGE',
      items: [
        { id: 'labs', label: 'Labs', icon: Terminal },
        { id: 'exercises', label: 'Exercises', icon: Target },
        { id: 'ctf-academy', label: 'CTF Academy', icon: BookOpen }
      ]
    },
    {
      title: 'SECURITY ENGINEERING',
      items: [
        { id: 'devsecops', label: 'DevSecOps', icon: Code },
        { id: 'container-security', label: 'Container Security', icon: Box },
        { id: 'cloud-security', label: 'Cloud Security', icon: Cloud }
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
        { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
        { id: 'response-actions', label: 'Response Actions', icon: Lock }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'reports', label: 'Security Reports', icon: FileText },
        { id: 'audit-logs', label: 'Audit Logs', icon: FileText }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-[#070B11] border-r border-[#17232E] flex flex-col font-mono-tech select-none shrink-0 overflow-y-auto">
      <div className="p-3 space-y-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#465663] font-bold px-2 block">
              {sec.title}
            </span>
            <div className="space-y-0.5">
              {sec.items.map(item => {
                const IconComp = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id as ModuleId)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition font-semibold ${
                      isActive 
                        ? 'bg-[#0F1720] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]' 
                        : 'text-[#7F95A5] hover:text-[#E6F1F5] hover:bg-[#0B1118]'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#00E5FF]' : 'text-[#7F95A5]'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-[#17232E]">
          <button
            onClick={() => onSelectModule('settings')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition font-semibold ${
              activeModule === 'settings'
                ? 'bg-[#0F1720] text-[#00E5FF] border border-[#00E5FF]/40'
                : 'text-[#7F95A5] hover:text-[#E6F1F5] hover:bg-[#0B1118]'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
