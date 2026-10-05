import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import type { ModuleId } from '../../types';

interface AppShellProps {
  user: any;
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  activeModule,
  onSelectModule,
  children
}) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#030609] flex flex-col overflow-hidden select-none font-mono-tech">
      {/* Top Command Bar */}
      <Topbar 
        user={user} 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
      />

      {/* Main Body Area: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeModule={activeModule} 
          onSelectModule={onSelectModule} 
        />

        <main className="flex-1 bg-[#030609] overflow-y-auto p-4 cyber-grid relative">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelectModule={onSelectModule} 
      />
    </div>
  );
};
