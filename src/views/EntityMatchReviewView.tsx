import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import { EntityMatchCandidate } from '../types';
import {
  Split,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  GitMerge,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EntityMatchReviewView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    selectedCase,
    matches,
    handleMatchDecision,
    currentUser
  } = useInvestigation();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'DECIDED'>('PENDING');

  const pendingMatches = matches.filter((m) => m.status === 'PENDING');
  const decidedMatches = matches.filter((m) => m.status !== 'PENDING');

  const displayedMatches = activeTab === 'PENDING' ? pendingMatches : decidedMatches;

  const onConfirmMatch = async (matchId: string) => {
    // Confetti effect for exciting confirmation feedback!
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    await handleMatchDecision(matchId, 'CONFIRM');
  };

  const onRejectMatch = async (matchId: string) => {
    await handleMatchDecision(matchId, 'REJECT');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span>{selectedCase?.firNumber || 'FIR No. 284/2024'}</span>
              <span>•</span>
              <span>Cross-Case Entity Resolution Station</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Split className="w-5 h-5 text-emerald-400" />
              <span>Cross-Case Entity Match Review & Resolution</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Resolve automated entity linkage candidates across inter-state cyber police station databases.
            </p>
          </div>

          <Link
            to={`/cases/${selectedCase?.id || 'FIR-284-2024'}/investigation`}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all self-start md:self-auto"
          >
            <span>Open Graph Canvas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section 8 Notice: Display confidence as a suggestion, not a proof */}
        <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-start space-x-3 text-cyan-300">
          <Fingerprint className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="uppercase font-bold tracking-wider block text-cyan-300">
              Corroboration Standard (Section 8 Specification):
            </strong>
            Match confidence scores represent algorithmic phonetic, biometric, and identifier heuristics. They are <strong>suggestions, not conclusive legal proofs</strong>. Confirming establishes a persistent cross-case bridge in the graph.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'PENDING'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Pending Verification ({pendingMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('DECIDED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'DECIDED'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Decided Candidates ({decidedMatches.length})
          </button>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-6">
        {displayedMatches.length === 0 ? (
          <div className="bg-slate-900/50 p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
            No matches found under this review queue.
          </div>
        ) : (
          displayedMatches.map((match) => {
            const isConfirmed = match.status === 'CONFIRMED';
            const isRejected = match.status === 'REJECTED';
            const isPending = match.status === 'PENDING';

            return (
              <div
                key={match.id}
                className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5"
              >
                {/* Card Top: Match Score & Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {match.sourceEntity.type} CROSS-MATCH
                    </span>
                    <span className="text-xs text-slate-400">
                      Linking {match.sourceEntity.caseId} ↔ {match.candidateEntity.caseFir}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Confidence Suggestion Badge (Section 8: Suggestion, not a proof) */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Heuristic Suggestion</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {(match.confidence * 100).toFixed(0)}% Similarity
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison (Section 8: Show source entity and candidate entity side by side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {/* Source Entity (Current Case) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mb-1">
                        Source Entity (Current Case: {selectedCase?.firNumber})
                      </span>
                      <h3 className="text-sm font-bold text-white mb-3">
                        {match.sourceEntity.label}
                      </h3>
                      <div className="space-y-1.5 text-xs font-mono text-slate-300">
                        {Object.entries(match.sourceEntity.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-500">{k}:</span>
                            <span className="text-slate-200 font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Entity (External Case) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-1">
                        Cross-Case Hit ({match.candidateEntity.caseFir})
                      </span>
                      <h3 className="text-sm font-bold text-white mb-3">
                        {match.candidateEntity.label}
                      </h3>
                      <div className="space-y-1.5 text-xs font-mono text-slate-300">
                        {Object.entries(match.candidateEntity.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-500">{k}:</span>
                            <span className="text-amber-300 font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shared Identifiers & Similarity Reasons (Section 8) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs">
                  {/* Shared Identifiers */}
                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Shared Corroborated Identifiers</span>
                    </h4>
                    <div className="space-y-1.5">
                      {match.sharedIdentifiers.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] flex items-center justify-between"
                        >
                          <span className="text-slate-400">{item.identifierType}:</span>
                          <span className="text-emerald-400 font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similarity Reasons */}
                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider mb-2 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Algorithmic Similarity Reasoning</span>
                    </h4>
                    <ul className="space-y-1 text-slate-300 list-disc pl-4 text-[11px] leading-relaxed">
                      {match.similarityReasons.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Decision Actions (Section 8: Confirm Match / Reject Match, refresh graph) */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-500">
                    {match.decidedBy ? (
                      <span>Decided by {match.decidedBy} at {match.decidedAt}</span>
                    ) : (
                      <span>Awaiting Investigating Officer Verification</span>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onRejectMatch(match.id)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 text-xs font-semibold border border-slate-700 hover:border-rose-800 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject (Distinct Entity)</span>
                      </button>

                      <button
                        onClick={() => onConfirmMatch(match.id)}
                        className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all"
                      >
                        <GitMerge className="w-4 h-4" />
                        <span>Confirm Match & Link in Graph</span>
                      </button>
                    </div>
                  )}

                  {isConfirmed && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cross-case bridge established on Canvas</span>
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-xs text-rose-400 font-mono">
                      Rejected by IO as distinct entities
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
