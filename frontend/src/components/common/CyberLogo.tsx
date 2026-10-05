import React from 'react';

interface CyberLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const CyberLogo: React.FC<CyberLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        {/* Outer glowing hexagon SVG shield framing C+N */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          {/* Hexagon Shield */}
          <polygon 
            points="50,5 92,27 92,73 50,95 8,73 8,27" 
            fill="#0B1118" 
            stroke="#00E5FF" 
            strokeWidth="4" 
          />
          {/* Inner Cyan/Blue Geometric 'C+N' Cyber Emblem */}
          <path 
            d="M 32 30 L 68 30 L 68 40 L 44 40 L 44 60 L 68 60 L 68 70 L 32 70 Z" 
            fill="#00E5FF" 
          />
          <path 
            d="M 54 30 L 68 30 L 68 70 L 54 70 Z" 
            fill="#238BFF" 
            opacity="0.8" 
          />
          {/* Center Neural AI Node */}
          <circle cx="50" cy="50" r="5" fill="#8B5CF6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-widest font-mono-tech text-[#E6F1F5] ${textSizes[size]}`}>
            CYBER<span className="text-[#00E5FF]">NEXUS</span>
          </span>
          {showTagline && (
            <span className="text-[10px] tracking-widest text-[#7F95A5] uppercase font-mono-tech">
              AI-POWERED AUTONOMOUS SECURITY
            </span>
          )}
        </div>
      )}
    </div>
  );
};
