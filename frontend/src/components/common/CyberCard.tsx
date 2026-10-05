import React from 'react';

interface CyberCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  glow?: 'none' | 'cyan' | 'green' | 'red' | 'purple';
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  glow = 'none'
}) => {
  const glowClasses = {
    none: 'border-[#17232E]',
    cyan: 'glow-cyan',
    green: 'glow-green',
    red: 'glow-red',
    purple: 'glow-purple'
  };

  return (
    <div className={`relative bg-[#0B1118]/90 backdrop-blur border rounded-md p-4 transition-all duration-200 ${glowClasses[glow]} ${className}`}>
      {/* Subtle corner technical brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00E5FF]/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00E5FF]/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00E5FF]/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00E5FF]/40" />

      {(title || action) && (
        <div className="flex items-center justify-between mb-3 border-b border-[#17232E] pb-2">
          <div>
            {title && (
              <h3 className="font-mono-tech text-xs font-bold uppercase tracking-widest text-[#E6F1F5]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-[#7F95A5] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
