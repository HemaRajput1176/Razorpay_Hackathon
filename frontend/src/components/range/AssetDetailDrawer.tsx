import React from 'react';
import { X, Server } from 'lucide-react';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import type { LabAsset } from '../../types';

interface AssetDetailDrawerProps {
  asset: LabAsset | null;
  onClose: () => void;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#070B11] border-l border-[#00E5FF]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-50 p-4 font-mono-tech overflow-y-auto select-none">
      <CyberCard
        title={`ASSET TELEMETRY — ${asset.name}`}
        subtitle="Cyber Range isolated lab node details"
        glow="cyan"
        action={
          <button onClick={onClose} className="text-[#7F95A5] hover:text-[#E6F1F5] p-1">
            <X className="w-5 h-5" />
          </button>
        }
      >
        <div className="space-y-4 text-xs mt-2">
          {/* Header Badge */}
          <div className="p-3 bg-[#030609] border border-[#17232E] rounded space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={asset.status === 'RUNNING' ? 'ONLINE' : 'CRITICAL'}>
                {asset.status}
              </Badge>
              <Badge variant={asset.criticality as any}>CRITICALITY: {asset.criticality}</Badge>
            </div>
            <h3 className="text-base font-bold text-[#E6F1F5] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00E5FF]" /> {asset.name}
            </h3>
            <p className="text-xs text-[#7F95A5]">{asset.role}</p>
          </div>

          {/* System Specs */}
          <div className="p-3 bg-[#0B1118] border border-[#17232E] rounded space-y-2 text-[11px] text-[#7F95A5]">
            <div className="flex justify-between">
              <span>HOSTNAME:</span>
              <strong className="text-[#E6F1F5]">{asset.hostname}</strong>
            </div>
            <div className="flex justify-between">
              <span>IP ADDRESS:</span>
              <strong className="text-[#00E5FF]">{asset.ip_address}</strong>
            </div>
            <div className="flex justify-between">
              <span>CONTAINER ID:</span>
              <strong className="text-[#8B5CF6] font-mono">{asset.container_id || `cybernexus-lab-${asset.name.toLowerCase()}`}</strong>
            </div>
            <div className="flex justify-between">
              <span>OPERATING SYSTEM:</span>
              <strong className="text-[#E6F1F5]">{asset.os}</strong>
            </div>
            <div className="flex justify-between">
              <span>ASSET TYPE:</span>
              <strong className="text-[#238BFF]">{asset.asset_type}</strong>
            </div>
          </div>

          {/* Microservices */}
          <div>
            <span className="text-[10px] text-[#7F95A5] uppercase tracking-wider block mb-1 font-bold">
              CONFIGURED LAB MICROSERVICES
            </span>
            <div className="bg-[#030609] border border-[#17232E] rounded overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#17232E] text-[9px] text-[#7F95A5] uppercase bg-[#070B11]">
                    <th className="py-2 px-2.5">SERVICE</th>
                    <th className="py-2 px-2.5">PORT</th>
                    <th className="py-2 px-2.5">VERSION</th>
                    <th className="py-2 px-2.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17232E]/40">
                  {asset.services?.map((svc, idx) => (
                    <tr key={idx} className="hover:bg-[#0F1720]">
                      <td className="py-2 px-2.5 font-bold text-[#E6F1F5]">{svc.name}</td>
                      <td className="py-2 px-2.5 text-[#00E5FF]">{svc.port}/{svc.protocol}</td>
                      <td className="py-2 px-2.5 text-[#7F95A5]">{svc.version || 'v1.0'}</td>
                      <td className="py-2 px-2.5">
                        <span className="text-[9px] text-[#22C55E] font-bold">● {svc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Network Boundary */}
          <div>
            <span className="text-[10px] text-[#7F95A5] uppercase tracking-wider block mb-1 font-bold">
              NETWORK ISOLATION BOUNDARY
            </span>
            <div className="p-2.5 bg-[#030609] border border-[#17232E] rounded text-[11px] space-y-1 text-[#7F95A5]">
              <div className="flex justify-between">
                <span>Docker Network:</span>
                <span className="text-[#00E5FF] font-bold">cybernexus_lab_net</span>
              </div>
              <div className="flex justify-between">
                <span>Subnet:</span>
                <span className="text-[#E6F1F5]">10.240.0.0/16</span>
              </div>
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span className="text-[#E6F1F5]">10.240.0.1</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-[#17232E] flex items-center justify-end">
            <button
              onClick={onClose}
              className="bg-[#17232E] hover:bg-[#17232E]/80 text-[#E6F1F5] font-bold py-2 px-4 rounded text-[11px] uppercase tracking-wider transition"
            >
              CLOSE DRAWER
            </button>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};
