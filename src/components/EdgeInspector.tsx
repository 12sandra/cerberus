import React from 'react';
import { Link } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileSearch,
  ExternalLink,
  Coins,
  PhoneCall,
  Lock,
  Layers
} from 'lucide-react';

export const EdgeInspector: React.FC = () => {
  const { selectedEdge, graphNodes, selectNode } = useInvestigation();

  if (!selectedEdge) return null;

  const sourceNode = graphNodes.find((n) => n.id === selectedEdge.source);
  const targetNode = graphNodes.find((n) => n.id === selectedEdge.target);

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1 text-slate-200">
      {/* Header: Edge Path */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          Relationship Evidence Analysis
        </span>
        <h3 className="text-base font-bold text-white mt-1">
          {selectedEdge.label}
        </h3>

        {/* Source -> Target Nodes */}
        <div className="flex items-center space-x-2 my-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => sourceNode && selectNode(sourceNode.id)}
            className="flex-1 text-left p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <span className="text-[9px] uppercase font-mono text-slate-400 block">From</span>
            <span className="text-xs font-semibold text-cyan-300 truncate block">
              {sourceNode ? sourceNode.label : selectedEdge.source}
            </span>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

          <button
            onClick={() => targetNode && selectNode(targetNode.id)}
            className="flex-1 text-left p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <span className="text-[9px] uppercase font-mono text-slate-400 block">To</span>
            <span className="text-xs font-semibold text-cyan-300 truncate block">
              {targetNode ? targetNode.label : selectedEdge.target}
            </span>
          </button>
        </div>

        {/* Confidence & Type */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Relationship Type</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {selectedEdge.relationType}
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Forensic Confidence</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {(selectedEdge.confidence * 100).toFixed(0)}% Corroborated
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Data: Amount / Duration */}
      {(selectedEdge.amount !== undefined || selectedEdge.callDurationSeconds !== undefined) && (
        <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm mb-4">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center space-x-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Transaction / Telemetry Metrics</span>
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {selectedEdge.amount !== undefined && (
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Transferred:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ₹{selectedEdge.amount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {selectedEdge.transactionCount !== undefined && (
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Transaction Count:</span>
                <span className="text-slate-200 font-semibold">{selectedEdge.transactionCount} Inward IMPS</span>
              </div>
            )}
            {selectedEdge.callDurationSeconds !== undefined && (
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Call Time:</span>
                <span className="text-cyan-400 font-semibold">{selectedEdge.callDurationSeconds} seconds</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Range (Section 5: show dates) */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm mb-4">
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>Observed Forensic Window</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[9px] text-slate-500 block">First Detected</span>
            <span className="text-slate-300 font-semibold">{selectedEdge.dateRange.firstSeen}</span>
          </div>
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[9px] text-slate-500 block">Last Active</span>
            <span className="text-slate-300 font-semibold">{selectedEdge.dateRange.lastSeen}</span>
          </div>
        </div>
      </div>

      {/* Attached Evidence Snippet (Section 5: show evidence) */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1.5">
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evidentiary Substantiation</span>
          </h4>
          <Link
            to={`/evidence/${selectedEdge.evidenceId}`}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
          >
            <span>Open Evidence Record</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
          "{selectedEdge.evidenceSnippet}"
        </div>

        <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Chain of Custody Preserved (Sec 65B Certified)</span>
        </div>
      </div>
    </div>
  );
};
