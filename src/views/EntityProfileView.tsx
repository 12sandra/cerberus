import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import { apiService } from '../services/api';
import { GraphNode, GraphEdge, EvidenceChunk } from '../types';
import {
  User,
  ExternalLink,
  ShieldAlert,
  GitGraph,
  Phone,
  CreditCard,
  MapPin,
  Car,
  FileText,
  Clock,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export const EntityProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCase, selectNode, centerFocusOnNode } = useInvestigation();

  const [entityData, setEntityData] = useState<{
    node?: GraphNode;
    linkedEdges: GraphEdge[];
    relatedEvidence: EvidenceChunk[];
  } | null>(null);

  useEffect(() => {
    if (id) {
      apiService.getEntityById(id).then(setEntityData);
    }
  }, [id]);

  if (!entityData || !entityData.node) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">
        Loading entity dossier...
      </div>
    );
  }

  const { node, linkedEdges, relatedEvidence } = entityData;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 text-slate-200">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Investigation Canvas</span>
      </button>

      {/* Main Dossier Header */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0b1120] rounded-[14px] flex items-center justify-center font-bold text-cyan-400 text-lg">
              {node.type.slice(0, 3)}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {node.type}
              </span>
              {node.subType && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {node.subType}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              {node.label}
            </h1>
            <span className="text-xs text-slate-400">
              Internal Entity Identifier: <span className="font-mono text-cyan-400">{node.id}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            selectNode(node.id);
            centerFocusOnNode(node.id);
            navigate(`/cases/${selectedCase?.id || 'FIR-284-2024'}/investigation`);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <GitGraph className="w-4 h-4" />
          <span>Locate in Investigation Canvas</span>
        </button>
      </div>

      {/* Forensic Identifiers & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Known Metadata & Attributes
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {Object.entries(node.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{k}:</span>
                <span className="text-white font-semibold">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Algorithmic Threat & Confidence Scores
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Entity Extraction Confidence</span>
                <span className="text-emerald-400 font-bold">{(node.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${node.confidence * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Syndicate Threat / Centrality Index</span>
                <span className="text-rose-400 font-bold">{node.riskScore}/100</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${node.riskScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Graph Edges */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
          Direct Relationships in Active Investigation ({linkedEdges.length})
        </h3>
        <div className="space-y-2">
          {linkedEdges.map((edge) => (
            <div
              key={edge.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-cyan-400 font-bold font-mono block">{edge.label}</span>
                <span className="text-[11px] text-slate-400 italic">"{edge.evidenceSnippet}"</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {(edge.confidence * 100).toFixed(0)}% Conf
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
