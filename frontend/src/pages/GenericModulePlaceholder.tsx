import React from 'react';
import { Server } from 'lucide-react';
import { CyberCard } from '../components/common/CyberCard';

interface GenericModulePlaceholderProps {
  title: string;
  category: string;
  description: string;
  statusLabel?: string;
}

export const GenericModulePlaceholder: React.FC<GenericModulePlaceholderProps> = ({
  title,
  category,
  description,
  statusLabel = "MODULE NOT CONNECTED — RESERVED FOR UPCOMING MILESTONE"
}) => {
  return (
    <div className="space-y-4 font-mono-tech select-none">
      {/* Header */}
      <div className="border-b border-[#17232E] pb-3">
        <span className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest block mb-1">
          {category}
        </span>
        <h1 className="text-xl font-black text-[#E6F1F5] tracking-widest uppercase">
          {title}
        </h1>
        <p className="text-xs text-[#7F95A5] mt-0.5">{description}</p>
      </div>

      <CyberCard className="py-16 text-center">
        <div className="max-w-md mx-auto space-y-4 flex flex-col items-center">
          <div className="p-4 bg-[#17232E]/40 border border-[#00E5FF]/30 rounded-full text-[#00E5FF]">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded border border-[#F59E0B]/40 uppercase tracking-widest block w-fit mx-auto mb-2">
              {statusLabel}
            </span>
            <h3 className="text-sm font-bold text-[#E6F1F5] uppercase tracking-wider">
              {title} BACKEND SERVICE STANDBY
            </h3>
            <p className="text-xs text-[#7F95A5] mt-2 leading-relaxed">
              This cyber security module architecture is defined and connected to the CYBERNEXUS event bus. Real backend engine integration will be activated in upcoming development milestones.
            </p>
          </div>

          <div className="pt-4 border-t border-[#17232E] w-full text-left text-[11px] space-y-1.5 text-[#7F95A5]">
            <div className="flex items-center justify-between">
              <span>MODULE ID:</span>
              <span className="text-[#00E5FF] font-bold">{title.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SECURITY MODEL:</span>
              <span className="text-[#22C55E] font-bold">AUTHORIZED SCOPE ONLY</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BACKEND AGENT:</span>
              <span className="text-[#8B5CF6] font-bold">CYBERNEXUS AGENT READY</span>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};
