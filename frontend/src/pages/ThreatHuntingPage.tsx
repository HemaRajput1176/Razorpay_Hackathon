import React, { useState } from 'react';
import { Search, Filter, Play, Bookmark, FolderPlus, RefreshCw } from 'lucide-react';
import { socService } from '../services/socService';
import type { SecurityEvent } from '../types';

export const ThreatHuntingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('15M');
  const [eventType, setEventType] = useState('');
  const [assetId, setAssetId] = useState('');
  const [user, setUser] = useState('');
  const [sourceIp, setSourceIp] = useState('');
  const [actionKw, setActionKw] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ summary: any; events: SecurityEvent[] } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleRunHunt = async () => {
    setLoading(true);
    setSaveSuccessMsg(null);
    try {
      const filters: Record<string, any> = { time_range: timeRange };
      if (eventType) filters.event_type = eventType;
      if (assetId) filters.asset_id = assetId;
      if (user) filters.user = user;
      if (sourceIp) filters.source_ip = sourceIp;
      if (actionKw) filters.action = actionKw;

      const res = await socService.runHuntQuery(filters);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHunt = async () => {
    try {
      const queryObj = { timeRange, eventType, assetId, user, sourceIp, actionKw };
      const saved = await socService.saveHunt(`Hunt: ${eventType || 'All'} on ${assetId || 'Any'}`, 'Saved Threat Hunt Query', queryObj);
      setSaveSuccessMsg(`Hunt saved with code ${saved.hunt_code}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvestigation = async () => {
    if (!results || results.events.length === 0) return;
    try {
      const eventIds = results.events.map(e => e.id);
      const inv = await socService.convertHuntToInvestigation(
        `Investigation: ${eventType || 'Threat'} Anomaly on ${assetId || 'Cyber Range'}`,
        'Created from Threat Hunting Query results.',
        eventIds
      );
      setSaveSuccessMsg(`Investigation ${inv.investigation_code} created successfully with ${eventIds.length} linked events!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 text-[#E6F1F5] font-mono-tech select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#17232E] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#00E5FF] tracking-widest font-bold uppercase mb-1">
            <Search className="w-4 h-4" />
            <span>STRUCTURED THREAT HUNTING ENGINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#E6F1F5]">
            SECURITY EVENT THREAT HUNTING & ANALYTICS
          </h1>
        </div>
      </div>

      {/* Visual Query Builder Form */}
      <div className="p-5 bg-[#070B11] border border-[#17232E] rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#17232E] pb-2 text-xs">
          <span className="font-bold text-[#00E5FF] uppercase flex items-center gap-2">
            <Filter className="w-4 h-4" /> VISUAL STRUCTURED HUNT QUERY BUILDER
          </span>
          <span className="text-[10px] text-[#22C55E]">SAFE STRUCTURED FILTERS (NO RAW SQL)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">TIME RANGE</label>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#E6F1F5] outline-none"
            >
              <option value="15M">LAST 15 MIN</option>
              <option value="1H">LAST 1 HOUR</option>
              <option value="24H">LAST 24 HOURS</option>
              <option value="7D">LAST 7 DAYS</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">EVENT TYPE</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#E6F1F5] outline-none"
            >
              <option value="">ANY EVENT TYPE</option>
              <option value="AUTH_FAILURE">AUTH_FAILURE</option>
              <option value="AUTHENTICATION">AUTHENTICATION</option>
              <option value="AUTH_SUCCESS">AUTH_SUCCESS</option>
              <option value="AUTHORIZATION">AUTHORIZATION</option>
              <option value="HTTP">HTTP</option>
              <option value="API">API</option>
              <option value="NETWORK">NETWORK</option>
              <option value="IOC_MATCH">IOC_MATCH</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">ASSET</label>
            <input
              type="text"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              placeholder="WEB-01, API-01"
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#00E5FF] outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">USER / ACTOR</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="admin, analyst"
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#E6F1F5] outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">SOURCE IP</label>
            <input
              type="text"
              value={sourceIp}
              onChange={e => setSourceIp(e.target.value)}
              placeholder="192.168.1.45"
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#E6F1F5] outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] text-[#7F95A5] uppercase font-bold block mb-1">ACTION KEYWORD</label>
            <input
              type="text"
              value={actionKw}
              onChange={e => setActionKw(e.target.value)}
              placeholder="LOGIN, PRIVILEGED"
              className="w-full bg-[#0B1118] border border-[#17232E] rounded px-2.5 py-1.5 text-[#E6F1F5] outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#17232E]">
          {saveSuccessMsg ? (
            <span className="text-xs text-[#22C55E] font-bold">{saveSuccessMsg}</span>
          ) : (
            <span className="text-xs text-[#7F95A5]">Execute hunt against indexed lab event store</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveHunt}
              className="px-3.5 py-2 rounded bg-[#0B1118] border border-[#17232E] hover:border-[#00E5FF] text-xs font-bold text-[#E6F1F5] flex items-center gap-1.5 transition"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>SAVE QUERY</span>
            </button>

            {results && results.events.length > 0 && (
              <button
                onClick={handleCreateInvestigation}
                className="px-3.5 py-2 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>CREATE INVESTIGATION</span>
              </button>
            )}

            <button
              onClick={handleRunHunt}
              disabled={loading}
              className="px-5 py-2 rounded bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>RUN HUNT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hunt Results Display */}
      {results && (
        <div className="space-y-4">
          
          {/* Metrics summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-1">
              <span className="text-[9px] text-[#7F95A5] uppercase font-bold block">EVENTS FOUND</span>
              <div className="text-xl font-bold text-[#00E5FF]">{results.summary.events_found}</div>
            </div>

            <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-1">
              <span className="text-[9px] text-[#7F95A5] uppercase font-bold block">TARGET ASSETS</span>
              <div className="text-xs font-bold text-[#E6F1F5] truncate">{results.summary.unique_assets.join(', ') || 'N/A'}</div>
            </div>

            <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-1">
              <span className="text-[9px] text-[#7F95A5] uppercase font-bold block">AFFECTED USERS</span>
              <div className="text-xs font-bold text-[#E6F1F5] truncate">{results.summary.unique_users.join(', ') || 'N/A'}</div>
            </div>

            <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-1">
              <span className="text-[9px] text-[#7F95A5] uppercase font-bold block">SOURCE IPS</span>
              <div className="text-xs font-bold text-[#22C55E] truncate">{results.summary.unique_source_ips.join(', ') || 'N/A'}</div>
            </div>

            <div className="p-3 bg-[#070B11] border border-[#17232E] rounded space-y-1">
              <span className="text-[9px] text-[#7F95A5] uppercase font-bold block">CORRELATED ALERTS</span>
              <div className="text-xl font-bold text-[#F59E0B]">{results.summary.related_alerts}</div>
            </div>
          </div>

          {/* Results Events Table */}
          <div className="p-4 bg-[#070B11] border border-[#17232E] rounded-lg space-y-2">
            <h3 className="text-xs font-bold text-[#E6F1F5] uppercase tracking-wider mb-2">
              MATCHED SECURITY EVENTS ({results.events.length})
            </h3>
            {results.events.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7F95A5]">NO EVENTS MATCHED THE HUNT CRITERIA.</div>
            ) : (
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {results.events.map(e => (
                  <div key={e.id} className="p-3 bg-[#0B1118] border border-[#17232E] rounded flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#7F95A5] font-mono">{e.timestamp?.substring(11, 19)}</span>
                      <span className="px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] font-bold text-[10px]">
                        {e.event_type}
                      </span>
                      <span className="font-bold text-[#E6F1F5]">{e.source}</span>
                      <span className="text-[#7F95A5]">{e.action}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-[#22C55E]">{e.source_ip}</span>
                      <span className="text-[#F59E0B]">{e.mitre_technique || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
