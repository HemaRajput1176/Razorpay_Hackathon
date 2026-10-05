import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Terminal, Cpu, Activity, Target, Network, FileText, Lock, X } from 'lucide-react';
import type { ModuleId } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ModuleId) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: 'command-center', label: 'Go to Command Center', category: 'Operations', icon: Activity },
    { id: 'soc', label: 'Go to Security Operations Center (SOC)', category: 'Operations', icon: ShieldAlert },
    { id: 'red-team', label: 'Go to Red Team Security Exercises', category: 'Operations', icon: Target },
    { id: 'blue-team', label: 'Go to Blue Team Defense', category: 'Operations', icon: Lock },
    { id: 'purple-team', label: 'Go to Purple Team Validation', category: 'Operations', icon: Cpu },
    { id: 'vulnerabilities', label: 'View Vulnerability Management', category: 'Attack Surface', icon: ShieldAlert },
    { id: 'attack-graph', label: 'View Attack Graph', category: 'Attack Surface', icon: Network },
    { id: 'nexus-ai', label: 'Launch NEXUS AI Security Brain', category: 'Intelligence', icon: Cpu },
    { id: 'investigations', label: 'View Forensics & Evidence', category: 'Forensics', icon: FileText },
    { id: 'labs', label: 'Launch Cyber Range Lab', category: 'Cyber Range', icon: Terminal },
    { id: 'reports', label: 'Generate Security Reports', category: 'Reports', icon: FileText }
  ];

  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#030609]/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-[#0B1118] border border-[#00E5FF]/40 rounded-lg w-full max-w-2xl shadow-[0_0_30px_rgba(0,229,255,0.2)] overflow-hidden font-mono-tech">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#17232E] gap-3">
          <Search className="w-5 h-5 text-[#00E5FF]" />
          <input
            type="text"
            placeholder="Type a command or search modules... (Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="bg-transparent border-none outline-none text-[#E6F1F5] w-full text-sm placeholder-[#465663]"
          />
          <button onClick={onClose} className="text-[#7F95A5] hover:text-[#E6F1F5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#17232E]/30">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7F95A5]">
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id as ModuleId);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-[#0F1720] hover:border hover:border-[#00E5FF]/40 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-[#00E5FF] group-hover:scale-110 transition" />
                    <span className="text-xs text-[#E6F1F5] font-semibold">{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase text-[#7F95A5] bg-[#070B11] px-2 py-0.5 rounded border border-[#17232E]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="bg-[#070B11] px-4 py-2 border-t border-[#17232E] flex items-center justify-between text-[10px] text-[#7F95A5]">
          <span>CYBERNEXUS COMMAND PALETTE</span>
          <span>Press <kbd className="bg-[#17232E] px-1 rounded text-[#00E5FF]">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
