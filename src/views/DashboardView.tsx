import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import {
  FolderGit2,
  FileCheck,
  Split,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  GitGraph,
  Clock,
  Sparkles,
  Coins
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    cases,
    selectCase,
    extractions,
    matches,
    patterns
  } = useInvestigation();

  const pendingExtractions = extractions.filter((e) => e.reviewStatus === 'PENDING');
  const pendingMatches = matches.filter((m) => m.status === 'PENDING');

  const totalLoss = cases.reduce((acc, c) => acc + c.totalLossInr, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Officer welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0d162b] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-lg text-cyan-400 font-mono">
              IO
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentUser.badgeNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.station} • {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/cases/FIR-284-2024/investigation"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all"
          >
            <GitGraph className="w-4 h-4" />
            <span>Open Active Investigation Canvas</span>
          </Link>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">Active Cases</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{cases.length}</div>
            <span className="text-[10px] text-cyan-400 mt-1 block">Under Investigation</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">Pending Extractions</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingExtractions.length}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Require IO Verification</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">Cross-Case Matches</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{pendingMatches.length}</div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Multi-Jurisdiction Hits</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center">
            <Split className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">Total Siphoned Loss</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">₹{(totalLoss / 100000).toFixed(1)} Lakhs</div>
            <span className="text-[10px] text-rose-400/80 mt-1 block">Reported in System</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center">
            <Coins className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Main 2-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Assigned Cybercrime Investigations</span>
            </h2>
            <Link
              to="/cases"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                        {c.firNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        c.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {c.priority} PRIORITY
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                      {c.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
                    ₹{c.totalLossInr.toLocaleString('en-IN')} Loss
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Sections & stats */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {c.sections.map((sec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        selectCase(c.id);
                        navigate(`/cases/${c.id}/investigation`);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all"
                    >
                      <GitGraph className="w-3.5 h-3.5" />
                      <span>Investigation Canvas</span>
                    </button>
                    <Link
                      to={`/cases/${c.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Overview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High-Priority Pattern Leads & Action Required */}
        <div className="space-y-6">
          {/* Pattern Leads Box */}
          <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Critical Syndicate Patterns</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800">
                {patterns.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {patterns.slice(0, 3).map((pat) => (
                <div
                  key={pat.id}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">{pat.patternType}</span>
                    <span className="text-rose-400 font-semibold">{pat.severity}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1">
                    {pat.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {pat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tasks / Verification Required */}
          <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5 mb-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Pending Action Items</span>
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/cases/FIR-284-2024/extraction"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors block">
                    Review Extracted Entities
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {pendingExtractions.length} candidate extractions waiting for IO approval
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/cases/FIR-284-2024/matches"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors block">
                    Cross-Case Entity Matches
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {pendingMatches.length} cross-case identifier correlations to verify
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
