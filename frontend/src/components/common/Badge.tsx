import React from 'react';

interface BadgeProps {
  variant: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ONLINE' | 'WARNING' | 'COMPROMISED' | 'INVESTIGATING' | 'OPEN' | 'CONTAINED' | 'MONITORING';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, size = 'sm', children }) => {
  const getStyles = () => {
    switch (variant) {
      case 'CRITICAL':
      case 'COMPROMISED':
        return 'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/40 shadow-[0_0_10px_rgba(255,59,48,0.2)]';
      case 'HIGH':
      case 'WARNING':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40';
      case 'MEDIUM':
      case 'INVESTIGATING':
        return 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40';
      case 'LOW':
      case 'MONITORING':
        return 'bg-[#238BFF]/15 text-[#238BFF] border-[#238BFF]/40';
      case 'ONLINE':
      case 'CONTAINED':
        return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]';
      default:
        return 'bg-[#17232E] text-[#7F95A5] border-[#17232E]';
    }
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-mono-tech font-bold uppercase rounded border tracking-wider ${px} ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children || variant}
    </span>
  );
};
