import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  FolderGit2,
  GitGraph,
  FileCheck,
  Split,
  UploadCloud,
  Layers,
  UserCheck,
  Server,
  ChevronDown,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    cases,
    selectedCase,
    selectCase,
    isMockMode,
    toggleMockMode,
    extractions,
    matches
  } = useInvestigation();

  const currentCaseId = selectedCase ? selectedCase.id : 'FIR-284-2024';

  const pendingExtCount = extractions.filter(e => e.reviewStatus === 'PENDING').length;
  const pendingMatchCount = matches.filter(m => m.status === 'PENDING').length;

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cases', path: '/cases', icon: FolderGit2 },
    { label: 'Investigation Graph', path: `/cases/${currentCaseId}/investigation`, icon: GitGraph },
    {
      label: 'Extraction Review',
      path: `/cases/${currentCaseId}/extraction`,
      icon: FileCheck,
      badge: pendingExtCount > 0 ? pendingExtCount : undefined
    },
    {
      label: 'Entity Matches',
      path: `/cases/${currentCaseId}/matches`,
      icon: Split,
      badge: pendingMatchCount > 0 ? pendingMatchCount : undefined
    },
    { label: 'Upload Documents', path: `/cases/${currentCaseId}/upload`, icon: UploadCloud }
  ];

  return (
    <header className="bg-[#0b1120] border-b border-slate-800 text-slate-200 sticky top-0 z-50 select-none">
      {/* Top micro-bar for officer status & Mock/Live API toggle */}
      <div className="bg-[#070d19] px-4 py-1 flex items-center justify-between text-xs border-b border-slate-900">
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center text-cyan-400 font-semibold tracking-wider uppercase text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1.5 animate-pulse"></span>
            CyberSaarthi // National Cyber Investigation System
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Module 2: Investigation Workspace, Graph & Grounded AI</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mock / Live API Switch */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <Server className={`w-3.5 h-3.5 ${isMockMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-[11px] text-slate-400">Data Source:</span>
            <span className={`text-[11px] font-mono font-medium ${isMockMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isMockMode ? 'Mock Mode (Offline)' : 'Live Module 1 Backend (Port 8000)'}
            </span>
            <button
              onClick={() => toggleMockMode(!isMockMode)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono ml-1.5 px-1 py-0.5 rounded hover:bg-cyan-950/40"
              title="Toggle between Live FastAPI Backend and Offline Mock dataset"
            >
              [{isMockMode ? 'Switch to Live API' : 'Switch to Mock'}]
            </button>
          </div>


          {/* Officer badge */}
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="bg-cyan-950 text-cyan-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-800/60">
              {currentUser.badgeNumber}
            </span>
            <span className="font-medium text-[11px]">{currentUser.name}</span>
            <span className="text-slate-500 text-[10px]">({currentUser.rank})</span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Case Selector */}
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 p-0.5 shadow-lg shadow-cyan-900/40 group-hover:shadow-cyan-500/20 transition-all">
              <div className="w-full h-full bg-[#0b1120] rounded-[7px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="font-bold tracking-tight text-white flex items-center space-x-1.5 text-base">
                <span>CYBERSAARTHI</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.2 rounded border border-cyan-500/30">
                  MOD-2
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wide">
                Investigation Canvas & Intelligence
              </div>
            </div>
          </Link>

          {/* Active Case Selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-700/70 rounded-md px-3 py-1.5 hover:border-slate-600 transition-colors">
            <Layers className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Active Investigation</span>
              <select
                value={selectedCase ? selectedCase.id : ''}
                onChange={(e) => {
                  selectCase(e.target.value);
                  if (location.pathname.includes('/cases/')) {
                    navigate(`/cases/${e.target.value}/investigation`);
                  }
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4 font-mono"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.firNumber} — {c.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.includes('/investigation') && location.pathname.includes('/investigation'));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Launch Grounded AI button */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/cases/${currentCaseId}/investigation`}
            onClick={() => {
              // Direct switch to AI tab in workspace
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-md shadow-cyan-950/40 border border-cyan-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
