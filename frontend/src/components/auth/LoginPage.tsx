import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, Key, Server, Cpu, Activity, AlertCircle } from 'lucide-react';
import { CyberLogo } from '../common/CyberLogo';
import { api } from '../../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('analyst01');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('849201');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(username, password, mfaCode);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#030609] cyber-grid flex items-center justify-center p-4 font-mono-tech select-none">
      <div className="w-full max-w-4xl bg-[#070B11]/95 border border-[#17232E] rounded-xl shadow-[0_0_60px_rgba(0,229,255,0.1)] overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Branding & Operational Status */}
        <div className="bg-[#0B1118] p-8 border-b md:border-b-0 md:border-r border-[#17232E] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#238BFF] to-[#8B5CF6]" />
          
          <div>
            <CyberLogo size="lg" showText={true} showTagline={true} className="mb-6" />
            
            <div className="mt-8 space-y-2">
              <h2 className="text-xl font-black text-[#E6F1F5] tracking-widest leading-relaxed">
                ATTACK.<br />
                DETECT.<br />
                INVESTIGATE.<br />
                RESPOND.<br />
                VALIDATE.
              </h2>
              <p className="text-xs text-[#7F95A5] pt-2">
                Autonomous Cyber Defense & Security Validation System
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-[#17232E]/60 text-xs">
            <span className="text-[10px] text-[#465663] uppercase tracking-widest font-bold block mb-2">
              LIVE SYSTEM STATUS
            </span>

            <div className="flex items-center justify-between">
              <span className="text-[#7F95A5] flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#00E5FF]" /> SYSTEM STATUS
              </span>
              <span className="text-[#22C55E] font-bold">ONLINE</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#7F95A5] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" /> SECURITY CORE
              </span>
              <span className="text-[#22C55E] font-bold">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#7F95A5] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00E5FF]" /> TELEMETRY
              </span>
              <span className="text-[#00E5FF] font-bold">CONNECTED</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#7F95A5] flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" /> AI ENGINE
              </span>
              <span className="text-[#8B5CF6] font-bold">READY</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Controls */}
        <div className="p-8 flex flex-col justify-between bg-[#070B11]">
          <div>
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#E6F1F5] uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00E5FF]" /> AUTHENTICATION
              </h3>
              <p className="text-xs text-[#7F95A5] mt-1">
                Secure Access to CYBERNEXUS Command Center
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/40 rounded text-xs text-[#FF3B30] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] text-[#7F95A5] uppercase tracking-wider block mb-1">
                  Email / Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7F95A5] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-[#030609] border border-[#17232E] rounded px-3 py-2 pl-9 text-xs text-[#E6F1F5] focus:outline-none focus:border-[#00E5FF]"
                    placeholder="analyst@cybernexus.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#7F95A5] uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#7F95A5] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#030609] border border-[#17232E] rounded px-3 py-2 pl-9 text-xs text-[#E6F1F5] focus:outline-none focus:border-[#00E5FF]"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#7F95A5] uppercase tracking-wider block mb-1">
                  MFA Verification (6-Digit Code)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-[#030609] border border-[#17232E] rounded px-3 py-2 text-center tracking-[0.5em] text-sm text-[#00E5FF] font-bold focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030609] font-bold py-2.5 rounded text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 mt-2"
              >
                {loading ? 'AUTHENTICATING...' : '[ AUTHENTICATE ]'}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-[#17232E] text-center text-[10px] text-[#465663] uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> SECURE CONNECTION &bull; ENCRYPTED SESSION
          </div>
        </div>
      </div>
    </div>
  );
};
