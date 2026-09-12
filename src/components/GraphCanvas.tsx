import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraphNode,
  GraphEdge,
  EntityType
} from '../types';
import { useInvestigation } from '../context/InvestigationContext';
import {
  ShieldAlert,
  User,
  Phone,
  CreditCard,
  MapPin,
  Car,
  Building,
  Smartphone,
  Server,
  Coins,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  PlusCircle,
  Filter,
  Eye,
  Crosshair
} from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

export const GraphCanvas: React.FC = () => {
  const {
    graphNodes,
    graphEdges,
    selectedNode,
    selectedEdge,
    selectNode,
    selectEdge,
    expandNode,
    centerFocusOnNode,
    resetGraphToCase,
    expandedNodeIds,
    highlightedNodeIds,
    focusNodeId,
    graphFilters
  } = useInvestigation();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Computed layout positions
  const [nodePositions, setNodePositions] = useState<Record<string, Position>>({});

  // Resize listener
  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Filter nodes & edges based on graphFilters
  const filteredNodes = useMemo(() => {
    return graphNodes.filter((node) => {
      if (node.isRoot) return true; // always show case root
      if (!graphFilters.entityTypes.includes(node.type)) return false;
      if (node.confidence < graphFilters.minConfidence) return false;
      if (
        graphFilters.searchTerm &&
        !node.label.toLowerCase().includes(graphFilters.searchTerm.toLowerCase()) &&
        !node.type.toLowerCase().includes(graphFilters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [graphNodes, graphFilters]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphEdges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [graphEdges, visibleNodeIds]);

  // Compute STAR TOPOLOGY layout
  // Section 6: Selected node or Root node becomes the center, directly connected nodes radiate outward
  useEffect(() => {
    if (filteredNodes.length === 0) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Determine current center focus node
    const currentCenterId = focusNodeId || (filteredNodes.find(n => n.isRoot)?.id || filteredNodes[0].id);

    const newPositions: Record<string, Position> = {};
    newPositions[currentCenterId] = { x: centerX, y: centerY };

    // Get immediate 1-hop neighbors of center node
    const directNeighbors = new Set<string>();
    for (const edge of filteredEdges) {
      if (edge.source === currentCenterId) directNeighbors.add(edge.target);
      if (edge.target === currentCenterId) directNeighbors.add(edge.source);
    }

    const neighborList = filteredNodes.filter(n => directNeighbors.has(n.id) && n.id !== currentCenterId);
    const outerList = filteredNodes.filter(n => !directNeighbors.has(n.id) && n.id !== currentCenterId);

    // Radiate direct 1-hop neighbors in a primary star ring (radius 220px)
    const primaryRadius = Math.min(dimensions.width, dimensions.height) * 0.35;
    const neighborAngleStep = (2 * Math.PI) / (neighborList.length || 1);

    neighborList.forEach((node, idx) => {
      // Offset starting angle for balanced aesthetic
      const angle = idx * neighborAngleStep - Math.PI / 2;
      newPositions[node.id] = {
        x: centerX + Math.cos(angle) * primaryRadius,
        y: centerY + Math.sin(angle) * primaryRadius
      };
    });

    // 2-hop or outer nodes positioned around their parent nodes or in outer secondary ring
    const secondaryRadius = primaryRadius * 1.65;
    const outerAngleStep = (2 * Math.PI) / (outerList.length || 1);

    outerList.forEach((node, idx) => {
      // Find connecting neighbor
      const parentEdge = filteredEdges.find(e => 
        (e.source === node.id && directNeighbors.has(e.target)) ||
        (e.target === node.id && directNeighbors.has(e.source))
      );
      const parentId = parentEdge ? (parentEdge.source === node.id ? parentEdge.target : parentEdge.source) : null;
      
      if (parentId && newPositions[parentId]) {
        // Position relative to parent
        const parentPos = newPositions[parentId];
        const dirX = parentPos.x - centerX;
        const dirY = parentPos.y - centerY;
        const angle = Math.atan2(dirY, dirX) + (idx % 2 === 0 ? 0.4 : -0.4);
        newPositions[node.id] = {
          x: parentPos.x + Math.cos(angle) * 130,
          y: parentPos.y + Math.sin(angle) * 130
        };
      } else {
        const angle = idx * outerAngleStep;
        newPositions[node.id] = {
          x: centerX + Math.cos(angle) * secondaryRadius,
          y: centerY + Math.sin(angle) * secondaryRadius
        };
      }
    });

    setNodePositions(newPositions);
  }, [filteredNodes, filteredEdges, focusNodeId, dimensions]);

  // Pan & Zoom controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingNodeId) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      }));
    } else if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: { x: mouseX, y: mouseY }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? transform.scale * zoomFactor : transform.scale / zoomFactor;
    const clampedScale = Math.min(Math.max(newScale, 0.4), 3.0);
    setTransform(prev => ({ ...prev, scale: clampedScale }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setTransform(prev => {
      const newScale = direction === 'in' ? prev.scale * 1.2 : prev.scale / 1.2;
      return { ...prev, scale: Math.min(Math.max(newScale, 0.4), 3.0) };
    });
  };

  const handleFit = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Node styles and icons
  const getNodeVisuals = (node: GraphNode) => {
    switch (node.type) {
      case 'CASE':
        return {
          icon: ShieldAlert,
          bg: 'from-amber-600 to-amber-900',
          border: 'border-amber-400',
          textColor: 'text-amber-300',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'PERSON':
        return {
          icon: User,
          bg: node.subType === 'ACCUSED' ? 'from-rose-600 to-rose-950' : 'from-blue-600 to-blue-950',
          border: node.subType === 'ACCUSED' ? 'border-rose-400' : 'border-blue-400',
          textColor: node.subType === 'ACCUSED' ? 'text-rose-300' : 'text-blue-300',
          badgeColor: node.subType === 'ACCUSED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        };
      case 'PHONE':
        return {
          icon: Phone,
          bg: 'from-emerald-600 to-emerald-950',
          border: 'border-emerald-400',
          textColor: 'text-emerald-300',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'BANK_ACCOUNT':
        return {
          icon: CreditCard,
          bg: 'from-teal-600 to-teal-950',
          border: 'border-teal-400',
          textColor: 'text-teal-300',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
        };
      case 'LOCATION':
        return {
          icon: MapPin,
          bg: 'from-purple-600 to-purple-950',
          border: 'border-purple-400',
          textColor: 'text-purple-300',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      case 'VEHICLE':
        return {
          icon: Car,
          bg: 'from-cyan-600 to-cyan-950',
          border: 'border-cyan-400',
          textColor: 'text-cyan-300',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'ORGANIZATION':
        return {
          icon: Building,
          bg: 'from-orange-600 to-orange-950',
          border: 'border-orange-400',
          textColor: 'text-orange-300',
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        };
      case 'DEVICE_IMEI':
        return {
          icon: Smartphone,
          bg: 'from-pink-600 to-pink-950',
          border: 'border-pink-400',
          textColor: 'text-pink-300',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40'
        };
      case 'IP_ADDRESS':
        return {
          icon: Server,
          bg: 'from-indigo-600 to-indigo-950',
          border: 'border-indigo-400',
          textColor: 'text-indigo-300',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
      case 'CRYPTO_WALLET':
        return {
          icon: Coins,
          bg: 'from-yellow-600 to-yellow-950',
          border: 'border-yellow-400',
          textColor: 'text-yellow-300',
          badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
        };
      default:
        return {
          icon: User,
          bg: 'from-slate-600 to-slate-900',
          border: 'border-slate-400',
          textColor: 'text-slate-300',
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#070b14] overflow-hidden select-none cursor-grab active:cursor-grabbing border border-slate-800 rounded-lg shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background forensic grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
            linear-gradient(to right, rgba(51, 65, 85, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(51, 65, 85, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Floating Canvas Action Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl">
        <button
          onClick={() => handleZoom('in')}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-1" />
        <button
          onClick={resetGraphToCase}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 rounded border border-amber-600/40 transition-all"
          title="Reset to Case star topology"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Case</span>
        </button>
      </div>

      {/* Star topology legend badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-xl pointer-events-none">
        <div className="font-semibold text-slate-100 flex items-center space-x-1.5 mb-1.5">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Investigation Star Topology</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Case / FIR Root</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Accused / Suspect</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Phone / MSISDN</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Bank / Mule A/c</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Cell Tower</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Vehicle / CCTV</span>
          </span>
        </div>
        <div className="mt-2 text-[9px] text-cyan-400/80 border-t border-slate-800 pt-1">
          Tip: Click node to inspect & expand | Click edge for evidence
        </div>
      </div>

      {/* SVG Canvas for Edges and interactive elements */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="24"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="8"
            markerHeight="6"
            refX="24"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Render Edges */}
        {filteredEdges.map((edge) => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;

          const isEdgeSelected = selectedEdge?.id === edge.id;
          const isHighlighted =
            highlightedNodeIds.has(edge.source) && highlightedNodeIds.has(edge.target);

          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2;

          return (
            <g
              key={edge.id}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                selectEdge(edge.id);
              }}
            >
              {/* Invisible wider stroke for easy click hit target */}
              <line
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="transparent"
                strokeWidth="20"
              />

              {/* Visible Edge Line */}
              <line
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={
                  isEdgeSelected
                    ? '#38bdf8'
                    : isHighlighted
                    ? '#f59e0b'
                    : '#334155'
                }
                strokeWidth={isEdgeSelected || isHighlighted ? 3 : 1.75}
                strokeDasharray={edge.relationType === 'COMMUNICATED_WITH' ? '4 3' : undefined}
                className={isHighlighted ? 'edge-highlight' : 'transition-colors group-hover:stroke-slate-400'}
                markerEnd={isEdgeSelected || isHighlighted ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />

              {/* Edge Label Badge */}
              <foreignObject
                x={midX - 70}
                y={midY - 12}
                width="140"
                height="24"
                className="overflow-visible pointer-events-none"
              >
                <div className="flex justify-center items-center h-full">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight shadow-md transition-all ${
                      isEdgeSelected
                        ? 'bg-cyan-900/90 text-cyan-200 border border-cyan-400 ring-1 ring-cyan-500'
                        : isHighlighted
                        ? 'bg-amber-900/90 text-amber-200 border border-amber-400'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 group-hover:text-slate-200 group-hover:border-slate-500'
                    }`}
                  >
                    {edge.label}
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* HTML Node Layer for crisp rendering, icons, and interactions */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {filteredNodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;

          const visuals = getNodeVisuals(node);
          const Icon = visuals.icon;
          const isSelected = selectedNode?.id === node.id;
          const isFocused = focusNodeId === node.id;
          const isHighlighted = highlightedNodeIds.has(node.id);
          const isExpandable = (node.expandableCount ?? 0) > 0 && !expandedNodeIds.has(node.id);

          return (
            <div
              key={node.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute pointer-events-auto cursor-pointer select-none group"
              onClick={(e) => {
                e.stopPropagation();
                selectNode(node.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                centerFocusOnNode(node.id);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingNodeId(node.id);
              }}
            >
              {/* Pulsing ring for focused or root node */}
              {(isFocused || node.isRoot) && (
                <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/40 animate-ping pointer-events-none opacity-40" />
              )}

              {/* Node Card / Avatar */}
              <div
                className={`relative flex items-center space-x-2.5 px-3 py-2 rounded-xl border bg-gradient-to-br backdrop-blur-md shadow-2xl transition-all ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/60 scale-105 node-glow-selected'
                    : isHighlighted
                    ? 'border-amber-400 ring-2 ring-amber-500/50 scale-105'
                    : `${visuals.border} border-opacity-60 hover:scale-105 hover:border-opacity-100`
                } ${
                  node.isRoot ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-500/40 node-glow-case px-4 py-2.5' : 'bg-slate-900/90'
                }`}
              >
                {/* Icon box */}
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${visuals.bg} flex items-center justify-center shrink-0 shadow-md`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Node details */}
                <div className="flex flex-col min-w-[80px] max-w-[150px]">
                  <span className="font-semibold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                    {node.label}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${visuals.badgeColor}`}>
                      {node.subType || node.type}
                    </span>
                    {node.riskScore > 80 && (
                      <span className="text-[9px] font-mono text-rose-400 font-bold">
                        {node.riskScore}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progressive Expansion Trigger Button (Section 5) */}
                {isExpandable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      expandNode(node.id);
                    }}
                    className="ml-1 flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-[9px] font-mono font-bold shadow-lg shadow-cyan-900/50 transition-all hover:scale-110"
                    title={`Expand 1-hop connected entities (${node.expandableCount} available)`}
                  >
                    <PlusCircle className="w-3 h-3 text-cyan-200" />
                    <span>+{node.expandableCount}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
