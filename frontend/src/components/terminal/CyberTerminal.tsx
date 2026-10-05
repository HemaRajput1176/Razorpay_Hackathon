import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const CyberTerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ command?: string; lines: string[]; isError?: boolean }>>([
    {
      lines: [
        "CYBERNEXUS CONTROLLED TERMINAL v1.0 [AUTHORIZED SESSION]",
        "Type 'help' to list available security commands."
      ]
    },
    {
      command: "system.status",
      lines: [
        "API CORE        ONLINE",
        "DATABASE        ONLINE",
        "SOC ENGINE      ONLINE",
        "AI ENGINE       ONLINE",
        "TELEMETRY       ONLINE (CONNECTED)"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const cmd = input.trim();
    setInput('');
    setLoading(true);

    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.executeTerminalCommand(cmd);
      setHistory(prev => [
        ...prev,
        {
          command: cmd,
          lines: res.output,
          isError: res.status === 'ERROR'
        }
      ]);
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        {
          command: cmd,
          lines: [err.message || 'Error executing command'],
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#030609] border border-[#17232E] rounded-md overflow-hidden flex flex-col font-mono-tech h-72 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
      {/* Terminal Header Bar */}
      <div className="bg-[#070B11] border-b border-[#17232E] px-3 py-1.5 flex items-center justify-between text-xs text-[#7F95A5] select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="font-bold text-[11px] text-[#E6F1F5]">CYBERNEXUS TERMINAL</span>
          <span className="text-[10px] bg-[#22C55E]/15 text-[#22C55E] px-1.5 py-0.2 rounded border border-[#22C55E]/40">
            &gt; LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHistory([])}
            title="Clear Terminal"
            className="hover:text-[#00E5FF] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 p-3 overflow-y-auto text-xs space-y-3 bg-[#030609]">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <span className="text-[#22C55E] font-bold">cna@cybernexus-core:~$</span>
                <span className="text-[#E6F1F5] font-bold">{item.command}</span>
              </div>
            )}
            <div className={`space-y-0.5 ${item.isError ? 'text-[#FF3B30]' : 'text-[#7F95A5]'}`}>
              {item.lines.map((line, lIdx) => (
                <div key={lIdx} className="leading-relaxed font-mono-tech whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[#00E5FF] animate-pulse">
            <span>EXECUTING COMMAND...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Line */}
      <form onSubmit={handleCommand} className="bg-[#070B11] border-t border-[#17232E] px-3 py-2 flex items-center gap-2">
        <span className="text-[#22C55E] text-xs font-bold shrink-0">cna@cybernexus-core:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command (e.g. system.status, range.status, help)..."
          className="w-full bg-transparent border-none outline-none text-xs text-[#E6F1F5] font-mono-tech placeholder-[#465663]"
        />
      </form>
    </div>
  );
};
