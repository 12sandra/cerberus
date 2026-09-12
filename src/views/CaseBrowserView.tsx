import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import {
  FolderGit2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  GitGraph,
  FileCheck,
  Split,
  Calendar,
  Shield,
  Layers
} from 'lucide-react';

export const CaseBrowserView: React.FC = () => {
  const navigate = useNavigate();
  const { cases, selectCase } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredCases = cases.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (
      searchTerm &&
      !c.firNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.policeStation.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            <span>Case Repository & Cyber Crime Dockets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and manage registered cybercrime FIRs and investigation files across stations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-800">
            {filteredCases.length} Cases Active
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search FIR number, station, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-white rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Crime Categories</option>
            <option value="FINANCIAL_FRAUD">Financial Fraud</option>
            <option value="CRYPTO_CRIME">Crypto Syndicate</option>
            <option value="MALWARE_SYNDICATE">Malware & Extortion</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="OPEN">Open</option>
            <option value="CHARGE_SHEETED">Charge Sheeted</option>
          </select>
        </div>
      </div>

      {/* Cases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="flex flex-col justify-between bg-slate-900/80 rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md group"
          >
            <div>
              {/* Card top */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 block w-fit">
                    {c.firNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {c.policeStation}
                  </span>
                </div>

                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  c.priority === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {c.priority}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors leading-snug">
                {c.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {c.description}
              </p>

              {/* Loss and stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Reported Loss</span>
                  <span className="text-emerald-400 font-bold text-xs">
                    ₹{c.totalLossInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Entities / Matches</span>
                  <span className="text-cyan-400 font-bold text-xs">
                    {c.extractedEntityCount} / {c.pendingMatchCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                to={`/cases/${c.id}`}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                View Details
              </Link>

              <button
                onClick={() => {
                  selectCase(c.id);
                  navigate(`/cases/${c.id}/investigation`);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition-all"
              >
                <GitGraph className="w-3.5 h-3.5" />
                <span>Open Canvas</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
