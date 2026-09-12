import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import { Sidebar } from '../components/Sidebar';
import { GraphCanvas } from '../components/GraphCanvas';
import { NodeInspector } from '../components/NodeInspector';
import { EdgeInspector } from '../components/EdgeInspector';
import { TimelineDrawer } from '../components/TimelineDrawer';
import { PatternsPanel } from '../components/PatternsPanel';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { GroundedAIAssistant } from '../components/GroundedAIAssistant';
import {
  Crosshair,
  Clock,
  Flame,
  BarChart3,
  Sparkles,
  GitGraph,
  Info,
  Maximize2,
  FileCheck
} from 'lucide-react';

export const InvestigationWorkspaceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    selectedCase,
    selectCase,
    selectedNode,
    selectedEdge,
    activeContextTab,
    setActiveContextTab,
    patterns,
    extractions
  } = useInvestigation();

  useEffect(() => {
    if (id && (!selectedCase || selectedCase.id !== id)) {
      selectCase(id);
    }
  }, [id, selectCase, selectedCase]);

  const pendingExtCount = extractions.filter((e) => e.reviewStatus === 'PENDING').length;

  return (
    <div className="flex h-[calc(100vh-85px)] w-full overflow-hidden bg-[#060913] select-none">
      {/* 1. Left Sidebar Area (Section 4) */}
      <Sidebar />

      {/* 2. Central Graph Canvas Area (Section 4, 5, 6) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top canvas bar */}
        <div className="h-10 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between px-4 text-xs shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-cyan-400 font-bold">
              {selectedCase?.firNumber || 'FIR No. 284/2024'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 truncate max-w-md">
              {selectedCase?.title}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
            {pendingExtCount > 0 && (
              <span className="text-amber-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{pendingExtCount} unapproved extractions</span>
              </span>
            )}
            <span className="text-slate-600">•</span>
            <span>Star Topology Active</span>
          </div>
        </div>

        {/* The Graph Canvas */}
        <div className="flex-1 w-full h-full relative p-2 bg-[#060913]">
          <GraphCanvas />
        </div>
      </main>

      {/* 3. Contextual Right Panel (Section 4 & 5) */}
      <aside className="w-96 bg-[#090e1a] border-l border-slate-800 flex flex-col h-full text-slate-200 shrink-0 shadow-2xl">
        {/* Right Panel Tab Bar */}
        <div className="flex items-center border-b border-slate-800 bg-[#070d19] p-1 text-xs shrink-0">
          <button
            onClick={() => setActiveContextTab('INSPECTOR')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md font-semibold transition-all ${
              activeContextTab === 'INSPECTOR'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Entity & Relationship Inspector"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[11px]">Inspector</span>
          </button>

          <button
            onClick={() => setActiveContextTab('AI_ASSISTANT')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md font-semibold transition-all ${
              activeContextTab === 'AI_ASSISTANT'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Grounded AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-[11px]">Grounded AI</span>
          </button>

          <button
            onClick={() => setActiveContextTab('TIMELINE')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md font-semibold transition-all ${
              activeContextTab === 'TIMELINE'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Chronological Timeline"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px]">Timeline</span>
          </button>

          <button
            onClick={() => setActiveContextTab('PATTERNS')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md font-semibold transition-all relative ${
              activeContextTab === 'PATTERNS'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Syndicate Pattern Detection"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Patterns</span>
            {patterns.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveContextTab('ANALYTICS')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md font-semibold transition-all ${
              activeContextTab === 'ANALYTICS'
                ? 'bg-slate-800 text-purple-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Network Analytics & Centrality"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Analytics</span>
          </button>
        </div>

        {/* Dynamic Context Panel Body */}
        <div className="flex-1 overflow-hidden p-3">
          {activeContextTab === 'INSPECTOR' && (
            selectedEdge ? <EdgeInspector /> : <NodeInspector />
          )}
          {activeContextTab === 'AI_ASSISTANT' && <GroundedAIAssistant />}
          {activeContextTab === 'TIMELINE' && <TimelineDrawer />}
          {activeContextTab === 'PATTERNS' && <PatternsPanel />}
          {activeContextTab === 'ANALYTICS' && <AnalyticsPanel />}
        </div>
      </aside>
    </div>
  );
};
