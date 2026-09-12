import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, UserCheck, Lock, ChevronRight, Server } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isMockMode, toggleMockMode } = useInvestigation();
  const [badgeId, setBadgeId] = useState(currentUser.badgeNumber);
  const [password, setPassword] = useState('••••••••••••');
  const [station, setStation] = useState(currentUser.station);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.25)_0%,transparent_60%)]" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-xl shadow-cyan-900/40 mb-3">
            <div className="w-full h-full bg-[#0b1120] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CYBERSAARTHI</h1>
          <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-wider">
            Law Enforcement Investigation Gateway
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Cyber Crime Reporting Portal (NCRP) Linked</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Officer Badge Number / Service ID
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 text-xs font-mono text-white rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Police Station / Commissionerate
            </label>
            <input
              type="text"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Secure Key / Security Token
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 text-xs font-mono text-white rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-cyan-950/60 flex items-center justify-center space-x-2 transition-all group"
          >
            <span>Access Investigation Workspace</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Mode:</span>
          <button
            type="button"
            onClick={() => toggleMockMode(!isMockMode)}
            className="text-cyan-400 hover:text-cyan-300 font-mono underline flex items-center space-x-1"
          >
            <Server className="w-3 h-3" />
            <span>{isMockMode ? 'Mock Offline Dataset' : 'Live REST API'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
