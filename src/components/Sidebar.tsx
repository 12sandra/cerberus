import React from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import { EntityType } from '../types';
import {
  Filter,
  Search,
  Sliders,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  GitGraph,
  Clock,
  Flame,
  BarChart3,
  Crosshair,
  User,
  Phone,
  CreditCard,
  MapPin,
  Car,
  Building,
  Smartphone,
  Server,
  Coins
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    graphNodes,
    graphEdges,
    graphFilters,
    setGraphFilters,
    resetGraphToCase,
    activeContextTab,
    setActiveContextTab,
    patterns
  } = useInvestigation();

  const entityTypeOptions: { type: EntityType; label: string; icon: any; color: string }[] = [
    { type: 'PERSON', label: 'Persons / Accused', icon: User, color: 'text-blue-400' },
    { type: 'PHONE', label: 'Phone / MSISDN', icon: Phone, color: 'text-emerald-400' },
    { type: 'BANK_ACCOUNT', label: 'Bank / Mule A/c', icon: CreditCard, color: 'text-teal-400' },
    { type: 'LOCATION', label: 'Tower / Location', icon: MapPin, color: 'text-purple-400' },
    { type: 'VEHICLE', label: 'Vehicles / CCTV', icon: Car, color: 'text-cyan-400' },
    { type: 'ORGANIZATION', label: 'Shell / Enterprise', icon: Building, color: 'text-orange-400' },
    { type: 'DEVICE_IMEI', label: 'Hardware IMEI', icon: Smartphone, color: 'text-pink-400' },
    { type: 'IP_ADDRESS', label: 'IP / VPN Node', icon: Server, color: 'text-indigo-400' },
    { type: 'CRYPTO_WALLET', label: 'Crypto Wallets', icon: Coins, color: 'text-yellow-400' }
  ];

  const toggleEntityType = (type: EntityType) => {
    setGraphFilters((prev) => {
      const exists = prev.entityTypes.includes(type);
      const updated = exists
        ? prev.entityTypes.filter((t) => t !== type)
        : [...prev.entityTypes, type];
      return { ...prev, entityTypes: updated };
    });
  };

  const selectAllTypes = () => {
    setGraphFilters((prev) => ({
      ...prev,
      entityTypes: entityTypeOptions.map((o) => o.type)
    }));
  };

  const clearAllTypes = () => {
    setGraphFilters((prev) => ({
      ...prev,
      entityTypes: []
    }));
  };

  return (
    <aside className="w-72 bg-[#090e1a] border-r border-slate-800 flex flex-col h-full text-slate-200 shrink-0 select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search canvas entities..."
            value={graphFilters.searchTerm}
            onChange={(e) =>
              setGraphFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 font-mono"
          />
        </div>
      </div>

      {/* Quick Switch Context Tabs */}
      <div className="p-3 border-b border-slate-800 space-y-1">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
          Investigative Views
        </span>

        <button
          onClick={() => setActiveContextTab('INSPECTOR')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeContextTab === 'INSPECTOR'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Entity & Edge Inspector</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{graphNodes.length} nodes</span>
        </button>

        <button
          onClick={() => setActiveContextTab('AI_ASSISTANT')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeContextTab === 'AI_ASSISTANT'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Grounded AI Assistant</span>
          </div>
          <span className="text-[9px] font-mono bg-yellow-500/20 text-yellow-300 px-1.5 rounded">Grounded</span>
        </button>

        <button
          onClick={() => setActiveContextTab('TIMELINE')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeContextTab === 'TIMELINE'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Timeline Events</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">7 logged</span>
        </button>

        <button
          onClick={() => setActiveContextTab('PATTERNS')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeContextTab === 'PATTERNS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Pattern Leads</span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 rounded">{patterns.length} alerts</span>
        </button>

        <button
          onClick={() => setActiveContextTab('ANALYTICS')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeContextTab === 'ANALYTICS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Network Centrality</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Rankings</span>
        </button>
      </div>

      {/* Graph Filters (Section 5: Filter by entity type, confidence) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Confidence Threshold Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>Min Confidence</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold text-xs">
              {Math.round(graphFilters.minConfidence * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={graphFilters.minConfidence}
            onChange={(e) =>
              setGraphFilters((prev) => ({
                ...prev,
                minConfidence: parseFloat(e.target.value)
              }))
            }
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Entity Type Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider flex items-center space-x-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Entity Type Filters</span>
            </span>
            <div className="space-x-2 text-[10px] font-mono">
              <button
                onClick={selectAllTypes}
                className="text-cyan-400 hover:underline"
              >
                All
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={clearAllTypes}
                className="text-slate-400 hover:underline"
              >
                None
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {entityTypeOptions.map((opt) => {
              const Icon = opt.icon;
              const isChecked = graphFilters.entityTypes.includes(opt.type);

              return (
                <div
                  key={opt.type}
                  onClick={() => toggleEntityType(opt.type)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-slate-900/90 text-slate-200'
                      : 'text-slate-500 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-3.5 h-3.5 ${isChecked ? opt.color : 'text-slate-600'}`} />
                    <span className="text-xs">{opt.label}</span>
                  </div>
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset to Case Footer button */}
      <div className="p-3 border-t border-slate-800 bg-[#070b14]">
        <button
          onClick={resetGraphToCase}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 hover:border-amber-400 transition-all shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Case Star Topology</span>
        </button>
      </div>
    </aside>
  );
};
