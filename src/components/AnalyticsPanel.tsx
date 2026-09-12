import React from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import {
  Network,
  BarChart3,
  Cpu,
  Share2,
  Crosshair,
  ShieldCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const { analytics, selectNode, centerFocusOnNode } = useInvestigation();

  if (!analytics) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1 text-slate-200">
      {/* Header with Neutrality Disclaimer (Section 11) */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md mb-4">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Network Topology & Structural Analytics
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Structural graph metrics calculated using network topology algorithms.
        </p>
        <div className="mt-2.5 p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-[10px] text-cyan-300 font-mono">
          <strong>LEGAL & ANALYTIC INTEGRITY NOTICE:</strong> High centrality scores measure structural network position only and do not establish criminal culpability.
        </div>
      </div>

      {/* Network Overview Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Nodes</span>
          <span className="text-base font-bold font-mono text-white mt-0.5 block">{analytics.totalNodes}</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Active Edges</span>
          <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">{analytics.totalEdges}</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Network Density</span>
          <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">{analytics.densityScore}</span>
        </div>
      </div>

      {/* High Connectivity Entities List (Section 11) */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider flex items-center space-x-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Structural Centrality Rankings</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-400">By Degree & Betweenness</span>
        </div>

        <div className="space-y-3">
          {analytics.highConnectivityEntities.map((entity, idx) => (
            <div
              key={entity.nodeId}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {entity.label}
                    </span>
                  </div>
                  {/* Neutral investigative label (Section 11: High Connectivity or Potential Connector) */}
                  <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded mt-1 bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                    {entity.investigativeLabel}
                  </span>
                </div>

                <button
                  onClick={() => {
                    selectNode(entity.nodeId);
                    centerFocusOnNode(entity.nodeId);
                  }}
                  className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                  title="Focus on Graph"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono bg-slate-900/80 p-2 rounded border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[9px] block">Degree Centrality</span>
                  <span className="text-emerald-400 font-bold">{entity.degreeCentrality.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Betweenness Centrality</span>
                  <span className="text-purple-400 font-bold">{entity.betweennessCentrality.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Case Participation</span>
                  <span className="text-amber-400 font-bold">{entity.caseParticipationCount} FIRs</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Connected Identifiers</span>
                  <span className="text-cyan-400 font-bold">{entity.connectedIdentifiersCount} nodes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
