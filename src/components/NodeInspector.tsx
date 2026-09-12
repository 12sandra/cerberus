import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraphNode,
  GraphEdge
} from '../types';
import { useInvestigation } from '../context/InvestigationContext';
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Car,
  Building,
  Smartphone,
  Server,
  Coins,
  ShieldAlert,
  ExternalLink,
  PlusCircle,
  Crosshair,
  Calendar,
  AlertTriangle,
  FolderGit2,
  FileText
} from 'lucide-react';

export const NodeInspector: React.FC = () => {
  const {
    selectedNode,
    graphEdges,
    selectEdge,
    expandNode,
    centerFocusOnNode,
    expandedNodeIds
  } = useInvestigation();

  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
        <Crosshair className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
        <p className="text-sm font-medium">Select an entity or edge on the graph canvas to inspect investigative intelligence.</p>
      </div>
    );
  }

  // Find all direct edges connected to this node
  const connectedEdges = graphEdges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id
  );

  const isExpanded = expandedNodeIds.has(selectedNode.id);
  const canExpand = (selectedNode.expandableCount ?? 0) > 0 && !isExpanded;

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1 text-slate-200">
      {/* Header Profile */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {selectedNode.type}
              </span>
              {selectedNode.subType && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedNode.subType}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
              {selectedNode.label}
            </h3>
          </div>

          <Link
            to={`/entities/${selectedNode.id}`}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
            title="Open Deep Entity Dossier"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Confidence & Risk Score row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Extraction Confidence</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${selectedNode.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {(selectedNode.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Threat & Centrality</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedNode.riskScore > 80 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${selectedNode.riskScore}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-bold ${
                selectedNode.riskScore > 80 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {selectedNode.riskScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Expand 1-Hop & Center Focus */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => centerFocusOnNode(selectedNode.id)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center Focus</span>
          </button>

          {canExpand && (
            <button
              onClick={() => expandNode(selectedNode.id)}
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-950/50 border border-cyan-400/40 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-100" />
              <span>Expand 1-Hop ({selectedNode.expandableCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata Attributes */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm mb-4">
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Extracted Forensic Identifiers</span>
        </h4>
        <div className="space-y-2 text-xs">
          {selectedNode.metadata.phoneNumber && (
            <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">MSISDN:</span>
              <span className="text-emerald-400 font-semibold">{selectedNode.metadata.phoneNumber}</span>
            </div>
          )}
          {selectedNode.metadata.imei && (
            <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">IMEI:</span>
              <span className="text-pink-400 font-semibold">{selectedNode.metadata.imei}</span>
            </div>
          )}
          {selectedNode.metadata.accountNumber && (
            <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Account:</span>
              <span className="text-teal-400 font-semibold">{selectedNode.metadata.accountNumber}</span>
            </div>
          )}
          {selectedNode.metadata.address && (
            <div className="flex flex-col py-1 border-b border-slate-800/60">
              <span className="text-slate-400 mb-0.5">Physical / Tower Location:</span>
              <span className="text-purple-300 font-mono">{selectedNode.metadata.address}</span>
            </div>
          )}
          {selectedNode.metadata.vehiclePlate && (
            <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Vehicle Reg:</span>
              <span className="text-cyan-400 font-semibold">{selectedNode.metadata.vehiclePlate}</span>
            </div>
          )}
          {selectedNode.metadata.role && (
            <div className="flex flex-col py-1 border-b border-slate-800/60">
              <span className="text-slate-400 mb-0.5">Suspected Role:</span>
              <span className="text-amber-300 font-medium">{selectedNode.metadata.role}</span>
            </div>
          )}
          {selectedNode.metadata.notes && (
            <div className="flex flex-col py-1">
              <span className="text-slate-400 mb-0.5">Investigator Notes:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800">
                {selectedNode.metadata.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Linked Cases (Section 5: show entity profile and linked cases) */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm mb-4">
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center space-x-1.5">
          <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Cross-Case Mentions</span>
        </h4>
        <div className="space-y-1.5">
          {(selectedNode.metadata.linkedCases || ['FIR No. 284/2024']).map((fir, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono"
            >
              <span className="text-amber-400 font-semibold">{fir}</span>
              <span className="text-[10px] text-slate-500">Cross Corroborated</span>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Graph Relationships */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 shadow-sm">
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
          <span>Direct Relationships ({connectedEdges.length})</span>
          <span className="text-[10px] text-cyan-400 font-normal">Click edge to view evidence</span>
        </h4>
        <div className="space-y-2">
          {connectedEdges.map((edge) => (
            <div
              key={edge.id}
              onClick={() => selectEdge(edge.id)}
              className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/70 hover:border-cyan-500/50 cursor-pointer transition-all text-xs"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-cyan-400 font-semibold">{edge.label}</span>
                <span className="text-slate-400">{Math.round(edge.confidence * 100)}% Conf</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                "{edge.evidenceSnippet}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
