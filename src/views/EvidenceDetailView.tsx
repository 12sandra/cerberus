import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import { apiService } from '../services/api';
import { EvidenceChunk } from '../types';
import {
  FileSearch,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronLeft,
  ExternalLink,
  Lock,
  GitGraph,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const EvidenceDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCase, setHighlightedNodes, centerFocusOnNode } = useInvestigation();

  const [evidence, setEvidence] = useState<EvidenceChunk | null>(null);

  useEffect(() => {
    if (id) {
      apiService.getEvidenceById(id).then((ev) => setEvidence(ev || null));
    }
  }, [id]);

  if (!evidence) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">
        Loading evidence record...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 text-slate-200">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Investigation</span>
      </button>

      {/* Main Evidence Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {evidence.documentType}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Forensically Verified</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-2">
              {evidence.documentTitle}
            </h1>
            <span className="text-xs text-slate-400 font-mono">
              Evidence Ref ID: {evidence.id} • Extracted from Page {evidence.pageNumber}
            </span>
          </div>

          <button
            onClick={() => {
              setHighlightedNodes(evidence.associatedNodeIds);
              if (evidence.associatedNodeIds.length > 0) {
                centerFocusOnNode(evidence.associatedNodeIds[0]);
              }
              navigate(`/cases/${selectedCase?.id || 'FIR-284-2024'}/investigation`);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition-all self-start md:self-auto"
          >
            <GitGraph className="w-4 h-4" />
            <span>Highlight Related Nodes on Canvas</span>
          </button>
        </div>

        {/* Chain of Custody Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Chain of Custody & Judicial Admissibility</span>
          </div>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            {evidence.chainOfCustody}
          </p>
          <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500 pt-1">
            <span>Ingested: {evidence.ingestionDate}</span>
            <span>•</span>
            <span>Indian Evidence Act Sec 65B Certified</span>
          </div>
        </div>

        {/* Raw Text Chunk Snippet */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Evidentiary Text Extract</span>
          </h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed select-text">
            "{evidence.chunkSnippet}"
          </div>
        </div>

        {/* Tags */}
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">Forensic Tags:</span>
          {evidence.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
