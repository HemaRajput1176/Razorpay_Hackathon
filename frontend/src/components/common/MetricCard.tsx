import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CyberCard } from './CyberCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  statusColor?: 'cyan' | 'green' | 'red' | 'amber' | 'purple';
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  statusColor = 'cyan',
  subtext
}) => {
  const colorMap = {
    cyan: 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/10',
    green: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10',
    red: 'text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/10',
    amber: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10',
    purple: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10'
  };

  return (
    <CyberCard className="hover:border-[#00E5FF]/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#7F95A5] block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono-tech text-[#E6F1F5] tracking-tight">
              {value}
            </span>
            {trend && (
              <span className="text-[10px] font-mono-tech text-[#22C55E] font-semibold">
                {trend}
              </span>
            )}
          </div>
          {subtext && (
            <span className="text-[10px] text-[#465663] block font-mono-tech">
              {subtext}
            </span>
          )}
        </div>
        <div className={`p-2 rounded border ${colorMap[statusColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CyberCard>
  );
};
