import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import { TimelineEvent } from '../types';
import {
  Clock,
  Filter,
  ExternalLink,
  Coins,
  PhoneCall,
  Navigation,
  FileCheck2,
  Radio,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const TimelineDrawer: React.FC = () => {
  const {
    timelineEvents,
    timelineFilters,
    setTimelineFilters,
    selectTimelineEvent,
    highlightedNodeIds
  } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredEvents = timelineEvents.filter((ev) => {
    if (activeCategory !== 'ALL' && ev.eventType !== activeCategory) return false;
    if (
      searchTerm &&
      !ev.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ev.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ev.evidenceSnippet.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getEventVisuals = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'FINANCIAL':
        return { icon: Coins, color: 'text-teal-400', badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'COMMUNICATION':
        return { icon: PhoneCall, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'MOVEMENT':
        return { icon: Navigation, color: 'text-cyan-400', badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'LEGAL':
        return { icon: FileCheck2, color: 'text-amber-400', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'DIGITAL_TRACE':
        return { icon: Radio, color: 'text-purple-400', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { icon: Clock, color: 'text-slate-400', badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200">
      {/* Timeline Controls & Filters */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Chronological Investigation Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {filteredEvents.length} Events Logged
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search events, IMPS reference, tower logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]">
          {['ALL', 'FINANCIAL', 'COMMUNICATION', 'DIGITAL_TRACE', 'MOVEMENT', 'LEGAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-full font-mono transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No events match the current filter criteria.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const visuals = getEventVisuals(event.eventType);
            const Icon = visuals.icon;
            const isEventActive = event.relatedNodeIds.some((id) => highlightedNodeIds.has(id));

            return (
              <div
                key={event.id}
                onClick={() => selectTimelineEvent(event)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isEventActive
                    ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Event header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded bg-slate-800 text-slate-300">
                      <Icon className={`w-3.5 h-3.5 ${visuals.color}`} />
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${visuals.badgeBg}`}>
                      {event.eventType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{event.timestamp}</span>
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                  {event.title}
                </h4>

                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {event.description}
                </p>

                {/* Evidence snippet pill */}
                <div className="mt-2.5 p-2 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span className="truncate max-w-[180px] text-cyan-400">
                      Doc: {event.evidenceDocumentName}
                    </span>
                    <Link
                      to={`/evidence/${event.evidenceId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5"
                    >
                      <span>Evidence</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-[10px] text-slate-400 italic line-clamp-2">
                    "{event.evidenceSnippet}"
                  </p>
                </div>

                {/* Related Nodes */}
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    Highlights {event.relatedNodeIds.length} graph nodes
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {Math.round(event.confidence * 100)}% Conf
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
