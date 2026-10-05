import React from 'react';
import { Search, Bell, User as UserIcon, Activity, Cpu, Layers } from 'lucide-react';
import { CyberLogo } from '../common/CyberLogo';

interface TopbarProps {
  user: any;
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onOpenCommandPalette }) => {
  return (
    <header className="h-14 bg-[#070B11] border-b border-[#17232E] px-4 flex items-center justify-between font-mono-tech select-none shrink-0">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-4">
        <CyberLogo size="sm" showText={true} />
      </div>

      {/* Center: Search / Command Palette Bar */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full bg-[#030609] border border-[#17232E] hover:border-[#00E5FF]/50 rounded px-3 py-1.5 flex items-center justify-between text-xs text-[#7F95A5] transition group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[11px]">Search assets, incidents, commands...</span>
          </div>
          <kbd className="bg-[#0F1720] border border-[#17232E] px-1.5 py-0.5 text-[10px] text-[#00E5FF] rounded group-hover:border-[#00E5FF]/40">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Live Telemetry & Profile */}
      <div className="flex items-center gap-4 text-xs">
        {/* Live System Indicators */}
        <div className="hidden lg:flex items-center gap-3 bg-[#030609] border border-[#17232E] px-3 py-1 rounded text-[10px]">
          <div className="flex items-center gap-1.5 text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <span className="text-[#17232E]">|</span>
          <div className="flex items-center gap-1.5 text-[#00E5FF]">
            <Activity className="w-3 h-3 text-[#00E5FF]" />
            <span>Telemetry Live</span>
          </div>
          <span className="text-[#17232E]">|</span>
          <div className="flex items-center gap-1.5 text-[#8B5CF6]">
            <Cpu className="w-3 h-3 text-[#8B5CF6]" />
            <span>AI Online</span>
          </div>
          <span className="text-[#17232E]">|</span>
          <div className="flex items-center gap-1.5 text-[#238BFF]">
            <Layers className="w-3 h-3 text-[#238BFF]" />
            <span>Lab Connected</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#7F95A5] hover:text-[#00E5FF] transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B30]" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#17232E]">
          <div className="w-7 h-7 rounded bg-[#0F1720] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-bold text-[#E6F1F5]">
              {user?.username || 'analyst01'}
            </span>
            <span className="text-[9px] text-[#7F95A5] uppercase">
              {user?.role || 'Security Analyst'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
