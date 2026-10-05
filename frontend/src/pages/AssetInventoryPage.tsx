import React, { useState } from 'react';
import { Server, RefreshCw, Cpu, Database } from 'lucide-react';

interface AssetItem {
  id: string;
  name: string;
  type: string;
  ip_address: string;
  hostname: string;
  status: string;
  environment: string;
  criticality: string;
}

export const AssetInventoryPage: React.FC = () => {
  const [assets] = useState<AssetItem[]>([
    { id: '1', name: 'API-01', type: 'SERVER/API', ip_address: '10.240.0.11', hostname: 'api-01.nexora.internal', status: 'WARNING', environment: 'PRODUCTION', criticality: 'CRITICAL' },
    { id: '2', name: 'WEB-01', type: 'WEB APP', ip_address: '10.240.0.10', hostname: 'web-01.nexora.internal', status: 'ONLINE', environment: 'PRODUCTION', criticality: 'HIGH' },
    { id: '3', name: 'DB-01', type: 'DATABASE', ip_address: '10.240.0.12', hostname: 'db-01.nexora.internal', status: 'ONLINE', environment: 'PRODUCTION', criticality: 'CRITICAL' },
    { id: '4', name: 'LINUX-01', type: 'HOST', ip_address: '10.240.0.23', hostname: 'linux-01.nexora.internal', status: 'COMPROMISED', environment: 'STAGING', criticality: 'HIGH' },
    { id: '5', name: 'CONTAINER-01', type: 'DOCKER POD', ip_address: '10.240.0.30', hostname: 'container-01.nexora.internal', status: 'ONLINE', environment: 'PRODUCTION', criticality: 'MEDIUM' }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/kpis');
      if (res.ok) {
        // Fetch real asset data if available
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <Server className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              ENTERPRISE ASSET INVENTORY & ATTACK SURFACE
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time monitoring of protected lab nodes, servers, databases, and Docker container pods
            </p>
          </div>
        </div>

        <button
          onClick={fetchAssets}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Assets
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">TOTAL ASSETS</span>
          <span className="text-3xl font-bold text-cyan-400">{assets.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">ONLINE / HEALTHY</span>
          <span className="text-3xl font-bold text-emerald-400">
            {assets.filter(a => a.status === 'ONLINE').length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">WARNING / DEGRADED</span>
          <span className="text-3xl font-bold text-amber-400">
            {assets.filter(a => a.status === 'WARNING').length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">COMPROMISED / CRITICAL</span>
          <span className="text-3xl font-bold text-red-400">
            {assets.filter(a => a.status === 'COMPROMISED').length}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          DISCOVERED LAB ASSET MATRIX
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="p-3">ASSET NAME</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">IP ADDRESS</th>
                <th className="p-3">ENVIRONMENT</th>
                <th className="p-3">CRITICALITY</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-850 transition">
                  <td className="p-3 font-bold text-slate-200 flex items-center space-x-2">
                    {asset.type.includes('DB') ? (
                      <Database className="w-4 h-4 text-cyan-400" />
                    ) : asset.type.includes('DOCKER') ? (
                      <Cpu className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Server className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{asset.name}</span>
                  </td>
                  <td className="p-3 text-slate-400">{asset.type}</td>
                  <td className="p-3 font-mono text-cyan-400">{asset.ip_address}</td>
                  <td className="p-3 text-slate-300">{asset.environment}</td>
                  <td className="p-3 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      asset.criticality === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      asset.criticality === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {asset.criticality}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] ${
                      asset.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      asset.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
