import React from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import { PatternAlert } from '../types';
import {
  AlertTriangle,
  Flame,
  GitMerge,
  MapPin,
  PhoneCall,
  Activity,
  Layers,
  Crosshair,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const PatternsPanel: React.FC = () => {
  const { patterns, setHighlightedNodes, centerFocusOnNode } = useInvestigation();

  const getPatternVisuals = (type: PatternAlert['patternType']) => {
    switch (type) {
      case 'CROSS_CASE_REUSE':
        return { icon: GitMerge, label: 'Cross-Case Reuse', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'TRANSACTION_BURST':
        return { icon: Flame, label: 'Transaction Burst', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'FREQUENT_LOCATION':
        return { icon: MapPin, label: 'Frequent Location', color: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'POTENTIAL_CONNECTOR':
        return { icon: Layers, label: 'Potential Connector', color: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'DENSE_COMMUNICATION_CLUSTER':
        return { icon: PhoneCall, label: 'Dense Comm Cluster', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'SHARED_IDENTIFIER':
        return { icon: AlertTriangle, label: 'Shared Identifier', color: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      default:
        return { icon: Activity, label: 'Pattern Lead', color: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const handleHighlight = (nodeIds: string[]) => {
    setHighlightedNodes(nodeIds);
    if (nodeIds.length > 0) {
      centerFocusOnNode(nodeIds[0]);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200">
      {/* Header */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Syndicate Pattern Leads ({patterns.length})
            </h3>
          </div>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60 font-semibold">
            Requires IO Corroboration
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Heuristic algorithms detecting structural fraud rings, cross-jurisdiction hardware reuse, and transaction bursts.
        </p>
      </div>

      {/* Pattern Alerts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {patterns.map((alert) => {
          const visuals = getPatternVisuals(alert.patternType);
          const Icon = visuals.icon;

          return (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <Icon className={`w-4 h-4 ${visuals.color}`} />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${visuals.badge}`}>
                    {visuals.label}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${
                  alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {alert.severity} SEVERITY
                </span>
              </div>

              <h4 className="text-xs font-bold text-white mt-2.5 leading-snug">
                {alert.title}
              </h4>

              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {alert.description}
              </p>

              {/* Suggested Investigative Action */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                  Recommended Investigative Action
                </span>
                <p className="text-slate-300">
                  {alert.suggestedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400">
                  {(alert.detectionConfidence * 100).toFixed(0)}% Algorithmic Confidence
                </span>

                <button
                  onClick={() => handleHighlight(alert.affectedNodeIds)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Highlight on Graph</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
