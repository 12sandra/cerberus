import React, { useState, useRef, useEffect } from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import {
  Sparkles,
  Send,
  AlertOctagon,
  FileText,
  ExternalLink,
  Crosshair,
  ShieldCheck,
  HelpCircle,
  Clock,
  Compass,
  CornerDownRight,
  Info
} from 'lucide-react';

export const GroundedAIAssistant: React.FC = () => {
  const {
    assistantMessages,
    isAiResponding,
    askAssistant,
    executeAiAction
  } = useInvestigation();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [assistantMessages, isAiResponding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAiResponding) return;
    askAssistant(inputQuery);
    setInputQuery('');
  };

  const samplePrompts = [
    'How is Vikram Sharma connected to HDFC A/c 5010049281726?',
    'What is the total loss amount mentioned in the FIR?',
    'Where was Tower JMT-042 located during the SIM swap?',
    'Did suspect Vikram Sharma flee to Dubai?' // triggers strict insufficient evidence fallback!
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200">
      {/* Header with Strict Grounding Notice (Section 12) */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Grounded Investigation Assistant
            </h3>
          </div>
          <span className="flex items-center space-x-1 text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/70">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Zero-Hallucination Safe</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Bounded strictly to verified Module 1 case repositories. Refuses unsupported speculation.
        </p>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {assistantMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800 shadow-sm'
                }`}
              >
                {/* Assistant header & Query Classification */}
                {!isUser && msg.queryClassification && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center space-x-1 text-cyan-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Bounded Reasoning: {msg.queryClassification}</span>
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Insufficient Evidence Alert Banner (Section 12: say so instead of inventing) */}
                {msg.insufficientEvidence && (
                  <div className="mb-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-800/70 flex items-start space-x-2 text-amber-300">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-[10px] tracking-wide uppercase block">
                        Strict Evidence Boundary Enforced
                      </span>
                      <span className="text-[11px] text-amber-200/90">
                        Information not found in ingested evidentiary records.
                      </span>
                    </div>
                  </div>
                )}

                {/* Message text with basic markdown styling */}
                <div className="whitespace-pre-wrap space-y-1.5">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* Citations / References (Section 12: Show source case/document/evidence references) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                      Evidentiary Citations ({msg.citations.length})
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                      >
                        <div className="flex items-center justify-between text-cyan-400 font-semibold mb-0.5">
                          <span className="truncate max-w-[200px] flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{cite.documentTitle} [P. {cite.page}]</span>
                          </span>
                          <button
                            onClick={() => executeAiAction({ type: 'VIEW_EVIDENCE', payload: cite.evidenceId })}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-slate-400 italic line-clamp-2">
                          "{cite.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Action Chips (Section 12: Provide Show Relationship / Show Evidence actions) */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => executeAiAction(act)}
                        className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-medium border border-slate-700 hover:border-cyan-400/60 transition-all shadow-sm"
                      >
                        <Crosshair className="w-3 h-3 text-cyan-400" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isAiResponding && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800 max-w-[200px]">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
            <span>Evaluating case evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-850 shrink-0">
        <span className="text-[9px] uppercase font-mono text-slate-500 block mb-1">
          Investigative Suggested Queries:
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => askAssistant(p)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap text-[10px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Ask relation, trail, CDR ping, or evidence citation..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isAiResponding}
          className="flex-1 bg-slate-950 text-xs text-white px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isAiResponding}
          className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950/50 disabled:opacity-40 transition-all flex items-center space-x-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
