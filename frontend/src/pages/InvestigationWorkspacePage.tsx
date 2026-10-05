import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Cpu } from 'lucide-react';
import { socService } from '../services/socService';
import type { InvestigationItem } from '../types';

export const InvestigationWorkspacePage: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvestigations = async () => {
    try {
      const list = await socService.getInvestigations();
      setInvestigations(list);
      if (list.length > 0 && !selectedInv) {
        const detail = await socService.getInvestigationDetail(list[0].id);
        setSelectedInv(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleSelect = async (inv: InvestigationItem) => {
    try {
      const detail = await socService.getInvestigationDetail(inv.id);
      setSelectedInv(detail);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7F95A5] flex flex-col items-center gap-3 font-mono-tech">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00E5FF]" />
        <span>LOADING INVESTIGATION WORKSPACE...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#00E5FF] tracking-widest font-bold uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>CASE INVESTIGATION WORKSPACE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6F1F5]">
            SECURITY INCIDENT & THREAT INVESTIGATIONS
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cases List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#7F95A5] font-bold block">
            INVESTIGATION CASES ({investigations.length})
          </span>
          {investigations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7F95A5] bg-[#070B11] border border-[#17232E] rounded">
              NO ACTIVE INVESTIGATIONS.
            </div>
          ) : (
            <div className="space-y-2">
              {investigations.map(inv => {
                const isSelected = selectedInv?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => handleSelect(inv)}
                    className={`p-3 bg-[#070B11] border rounded-lg cursor-pointer transition space-y-1.5 ${
                      isSelected ? 'border-[#00E5FF] bg-[#0F1720]' : 'border-[#17232E] hover:border-[#7F95A5]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#00E5FF]">{inv.investigation_code}</span>
                      <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-bold">
                        {inv.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#E6F1F5] leading-snug">{inv.title}</h4>
                    <span className="text-[10px] text-[#7F95A5] block">Events Linked: {inv.event_count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Investigation View & AI Brain Panel */}
        <div className="lg:col-span-8 space-y-4">
          {selectedInv ? (
            <>
              {/* Case Summary */}
              <div className="p-5 bg-[#070B11] border border-[#17232E] rounded-lg space-y-4">
                <div className="flex items-start justify-between border-b border-[#17232E] pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#00E5FF]">{selectedInv.investigation_code}</span>
                    <h3 className="text-base font-bold text-[#E6F1F5] mt-0.5">{selectedInv.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-bold">
                    PRIORITY: {selectedInv.priority}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] text-[#7F95A5] block uppercase font-bold">AFFECTED ASSETS</span>
                    <span className="font-bold text-[#00E5FF]">{selectedInv.affected_assets?.join(', ') || 'WEB-01'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#7F95A5] block uppercase font-bold">PRIMARY ACTOR</span>
                    <span className="font-bold text-[#E6F1F5]">{selectedInv.affected_users?.join(', ') || 'admin'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#7F95A5] block uppercase font-bold">SOURCE IPS</span>
                    <span className="font-bold text-[#22C55E]">{selectedInv.source_ips?.join(', ') || '192.168.1.45'}</span>
                  </div>
                </div>
              </div>

              {/* NEXUS AI Neural Analysis Panel */}
              {selectedInv.ai_analysis && (
                <div className="p-4 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase">
                    <Cpu className="w-4 h-4" />
                    <span>NEXUS AI — AUTONOMOUS INVESTIGATION SYNTHESIS</span>
                  </div>
                  <p className="text-xs text-[#E6F1F5] leading-relaxed">
                    {selectedInv.ai_analysis.summary}
                  </p>
                  <div className="p-2.5 bg-[#070B11] border border-[#8B5CF6]/20 rounded text-xs space-y-1">
                    <span className="text-[10px] text-[#7F95A5] font-bold uppercase block">HYPOTHESIS</span>
                    <p className="text-[#F59E0B]">{selectedInv.ai_analysis.hypothesis}</p>
                  </div>
                </div>
              )}

              {/* Events Timeline */}
              <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg space-y-2">
                <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider mb-2">
                  LINKED SECURITY EVENTS TIMELINE
                </h3>
                {(selectedInv.timeline_events || []).map(evt => (
                  <div key={evt.id} className="p-3 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[#00E5FF]">{evt.event_code}</span>
                      <span className="font-bold text-[#E6F1F5]">{evt.source}</span>
                      <span className="text-[#7F95A5]">{evt.action}</span>
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-bold">{evt.severity}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-[#7F95A5]">
              SELECT AN INVESTIGATION CASE FROM THE LEFT PANEL.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
