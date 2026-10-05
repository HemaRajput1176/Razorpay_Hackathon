import React from 'react';
import { Server, Database, Shield, Globe, Cpu, Box, HardDrive } from 'lucide-react';
import type { TopologyNode, TopologyEdge } from '../../types';

interface LabTopologyProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onSelectNode?: (nodeId: string) => void;
}

export const LabTopology: React.FC<LabTopologyProps> = ({ nodes, onSelectNode }) => {
  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'GATEWAY':
        return Globe;
      case 'WEB SERVER':
      case 'WEB APP':
        return Server;
      case 'SERVER/API':
        return Cpu;
      case 'DATABASE':
        return Database;
      case 'HOST':
        return HardDrive;
      case 'DOCKER POD':
      case 'CONTAINER':
        return Box;
      default:
        return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RUNNING':
      case 'ONLINE':
        return 'text-[#22C55E] border-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]';
      case 'STARTING':
      case 'WARNING':
        return 'text-[#F59E0B] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.4)]';
      case 'ERROR':
      case 'COMPROMISED':
        return 'text-[#FF3B30] border-[#FF3B30] shadow-[0_0_12px_rgba(255,59,48,0.4)]';
      default:
        return 'text-[#7F95A5] border-[#17232E]';
    }
  };

  return (
    <div className="relative w-full h-80 bg-[#030609] border border-[#17232E] rounded-md p-4 overflow-hidden select-none font-mono-tech flex flex-col justify-between">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Security Boundary Label */}
      <div className="flex items-center justify-between text-[10px] text-[#7F95A5] z-10 border-b border-[#17232E] pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="font-bold text-[#E6F1F5] uppercase tracking-wider">
            ISOLATED LAB TOPOLOGY — DOCKER BRIDGE SUBNET (10.240.0.0/16)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> RUNNING</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> STARTING</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7F95A5]" /> STOPPED</span>
        </div>
      </div>

      {/* Visual Network Topology Canvas */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        {/* Network Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Main Highway Line */}
          <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="#17232E" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="#00E5FF" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="#00E5FF" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" />
        </svg>

        {/* Topology Node Layout */}
        <div className="relative z-10 w-full h-full flex items-center justify-around px-6">
          {nodes.map((node) => {
            const IconComponent = getNodeIcon(node.type);
            const statusClass = getStatusColor(node.status);
            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.label)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#0B1118]/90 border transition-all cursor-pointer hover:scale-105 group ${statusClass}`}
              >
                <div className="p-2.5 rounded bg-[#030609] border border-current">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#E6F1F5] block font-mono-tech group-hover:text-[#00E5FF]">
                    {node.label}
                  </span>
                  <span className="text-[10px] text-[#7F95A5] font-mono-tech block">
                    {node.ip}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-[#00E5FF] mt-0.5 block">
                    {node.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Network Security Boundary Banner */}
      <div className="z-10 bg-[#070B11] border-t border-[#17232E] px-3 py-1.5 flex items-center justify-between text-[10px] text-[#7F95A5]">
        <span>BRIDGE: <strong className="text-[#00E5FF]">cybernexus_lab_net</strong></span>
        <span>GATEWAY: <strong className="text-[#E6F1F5]">10.240.0.1</strong></span>
        <span>SECURITY BOUNDARY: <strong className="text-[#22C55E]">NO HOST DIRECT BRIDGE</strong></span>
      </div>
    </div>
  );
};
