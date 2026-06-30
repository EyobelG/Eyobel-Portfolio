import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, HelpCircle, ChevronRight, Hash, Sparkles, Plus, Minus, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  source: number;
  target: number;
}

interface GraphTemplate {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  defaultChips: number[];
}

const TEMPLATES: GraphTemplate[] = [
  {
    name: "Cycle Graph (C₅)",
    description: "A symmetric ring of 5 vertices. Excellent for seeing circular flow.",
    nodes: [
      { id: 0, label: "v₁", x: 200, y: 55 },
      { id: 1, label: "v₂", x: 310, y: 135 },
      { id: 2, label: "v₃", x: 270, y: 265 },
      { id: 3, label: "v₄", x: 130, y: 265 },
      { id: 4, label: "v₅", x: 90, y: 135 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 0 },
    ],
    defaultChips: [4, 1, 0, 0, 1],
  },
  {
    name: "Star Graph (S₅)",
    description: "A central hub connected to 4 leaf nodes. Firing here sends chips outwards.",
    nodes: [
      { id: 0, label: "Hub", x: 200, y: 165 },
      { id: 1, label: "Leaf A", x: 200, y: 55 },
      { id: 2, label: "Leaf B", x: 310, y: 165 },
      { id: 3, label: "Leaf C", x: 200, y: 275 },
      { id: 4, label: "Leaf D", x: 90, y: 165 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 0, target: 3 },
      { source: 0, target: 4 },
    ],
    defaultChips: [5, 0, 0, 0, 0],
  },
  {
    name: "House Graph",
    description: "A classical 5-vertex graph combining a triangle roof and square base.",
    nodes: [
      { id: 0, label: "v₁ (Apex)", x: 200, y: 55 },
      { id: 1, label: "v₂ (R-Roof)", x: 290, y: 135 },
      { id: 2, label: "v₃ (R-Base)", x: 290, y: 255 },
      { id: 3, label: "v₄ (L-Base)", x: 110, y: 255 },
      { id: 4, label: "v₅ (L-Roof)", x: 110, y: 135 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 0, target: 4 },
      { source: 1, target: 4 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
    ],
    defaultChips: [2, 3, 1, 0, 2],
  },
  {
    name: "Complete Graph (K₄)",
    description: "Four vertices where every single node is connected to every other node.",
    nodes: [
      { id: 0, label: "v₁", x: 120, y: 80 },
      { id: 1, label: "v₂", x: 280, y: 80 },
      { id: 2, label: "v₃", x: 280, y: 240 },
      { id: 3, label: "v₄", x: 120, y: 240 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 0 },
      { source: 0, target: 2 },
      { source: 1, target: 3 },
    ],
    defaultChips: [3, 0, 4, 1],
  },
];

interface Particle {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function MathLab() {
  const [templateIdx, setTemplateIdx] = useState(0);
  const currentTemplate = TEMPLATES[templateIdx];

  const [chips, setChips] = useState<number[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fireCount, setFireCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chips
  useEffect(() => {
    setChips([...currentTemplate.defaultChips]);
    setSelectedNode(null);
    setFireCount(0);
    setParticles([]);
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [templateIdx, currentTemplate]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Compute degree of each node for the current template
  const getDegree = (nodeId: number): number => {
    return currentTemplate.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    ).length;
  };

  // Get neighbors of a node
  const getNeighbors = (nodeId: number): number[] => {
    const neighbors: number[] = [];
    currentTemplate.edges.forEach((e) => {
      if (e.source === nodeId) neighbors.push(e.target);
      else if (e.target === nodeId) neighbors.push(e.source);
    });
    return neighbors;
  };

  // Check if a node is unstable (chips >= degree)
  const isUnstable = (nodeId: number): boolean => {
    const deg = getDegree(nodeId);
    return chips[nodeId] >= deg && deg > 0;
  };

  // Check if the graph as a whole is stable (no unstable nodes)
  const isGraphStable = (): boolean => {
    for (let i = 0; i < currentTemplate.nodes.length; i++) {
      if (isUnstable(i)) return false;
    }
    return true;
  };

  // Fire a single node
  const fireNode = (nodeId: number) => {
    const deg = getDegree(nodeId);
    if (chips[nodeId] < deg || deg === 0) return;

    const neighbors = getNeighbors(nodeId);
    const sourceNode = currentTemplate.nodes.find((n) => n.id === nodeId)!;

    // Trigger visual particles traveling
    const newParticles: Particle[] = neighbors.map((nId, idx) => {
      const targetNode = currentTemplate.nodes.find((n) => n.id === nId)!;
      return {
        id: `p-${nodeId}-${nId}-${Date.now()}-${idx}`,
        fromX: sourceNode.x,
        fromY: sourceNode.y,
        toX: targetNode.x,
        toY: targetNode.y,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Update chips state
    setChips((prev) => {
      const updated = [...prev];
      updated[nodeId] -= deg;
      neighbors.forEach((nId) => {
        updated[nId] += 1;
      });
      return updated;
    });

    setFireCount((prev) => prev + 1);

    // Clean up particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 700);
  };

  // Automatic stabilizer execution
  useEffect(() => {
    if (isPlaying) {
      if (isGraphStable()) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setInterval(() => {
        // Find first unstable node
        const unstableId = currentTemplate.nodes.findIndex((n) =>
          isUnstable(n.id)
        );

        if (unstableId !== -1) {
          fireNode(unstableId);
        } else {
          setIsPlaying(false);
        }
      }, 800);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, chips, currentTemplate]);

  // Handle manual add/subtract
  const adjustChips = (nodeId: number, amount: number) => {
    setChips((prev) => {
      const updated = [...prev];
      updated[nodeId] = Math.max(0, updated[nodeId] + amount);
      return updated;
    });
  };

  const addRandomChips = () => {
    setChips((prev) => {
      const updated = [...prev];
      for (let i = 0; i < 6; i++) {
        const randId = Math.floor(Math.random() * updated.length);
        updated[randId] += 1;
      }
      return updated;
    });
  };

  const clearChips = () => {
    setChips(new Array(currentTemplate.nodes.length).fill(0));
    setFireCount(0);
    setIsPlaying(false);
  };

  const resetTemplate = () => {
    setChips([...currentTemplate.defaultChips]);
    setFireCount(0);
    setIsPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="math-lab-container">
      {/* Left controls column */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-williams-gold mb-2">
            <Sparkles className="w-5 h-5 text-williams-gold" />
            <span className="font-mono text-xs font-semibold tracking-wider uppercase">Eyobel's Research Playground</span>
          </div>
          <h3 className="font-serif text-2xl lg:text-3xl text-white font-semibold tracking-tight leading-tight">
            Abelian Chip-Firing Game
          </h3>
          <p className="text-sm text-charcoal-light mt-3 leading-relaxed">
            This simulator models the exact mathematical object Eyobel studied and published papers on at Williams College. 
            Add chips to vertices. When a vertex has as many chips as its <strong>degree (connections)</strong>, it becomes unstable and can <strong>fire</strong>, sending 1 chip to each neighbor.
          </p>

          {/* Template Selectors */}
          <div className="mt-6 space-y-2">
            <span className="block font-mono text-xs text-charcoal-light font-medium uppercase tracking-wider">Select Network Topology:</span>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t, idx) => (
                <button
                  key={t.name}
                  id={`btn-template-${idx}`}
                  onClick={() => setTemplateIdx(idx)}
                  className={`px-3 py-2 text-left rounded-xl text-xs transition-all border-2 ${
                    templateIdx === idx
                      ? "bg-williams-purple text-williams-gold border-williams-gold shadow-md"
                      : "bg-[#141414] text-white border-white/5 hover:border-white/15 hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className="font-semibold block">{t.name}</span>
                  <span className="text-[10px] opacity-60 block truncate mt-0.5">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="bg-[#141414] rounded-3xl p-5 border-2 border-white/10 space-y-4 shadow-xl">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light">Stable Status:</span>
            {isGraphStable() ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ● Graph Stable
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ▲ Cascades Ready
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light font-medium">Total Fires Executed:</span>
            <span className="font-bold text-williams-gold bg-williams-purple/30 border border-williams-purple-light/30 px-2.5 py-1 rounded-lg">
              {fireCount}
            </span>
          </div>

          {selectedNode !== null ? (
            <div className="p-3.5 bg-[#1a1a1a] rounded-2xl border border-white/10 flex justify-between items-center shadow-inner">
              <div>
                <span className="font-mono text-xs font-bold text-williams-gold">
                  Node {currentTemplate.nodes[selectedNode].label}
                </span>
                <span className="block text-[10px] text-charcoal-light">
                  Degree: {getDegree(selectedNode)} | Chips: {chips[selectedNode]}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  id="btn-subtract-chip"
                  onClick={() => adjustChips(selectedNode, -1)}
                  className="p-1 rounded bg-[#2a2a2a] border border-white/10 hover:bg-[#3a3a3a]"
                >
                  <Minus className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="font-mono text-sm font-semibold w-6 text-center text-white">{chips[selectedNode]}</span>
                <button
                  id="btn-add-chip"
                  onClick={() => adjustChips(selectedNode, 1)}
                  className="p-1 rounded bg-[#2a2a2a] border border-white/10 hover:bg-[#3a3a3a]"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#1a1a1a]/40 rounded-2xl border border-dashed border-white/10 text-center text-xs text-charcoal-light">
              Click any node in the graph to adjust its chips manually
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              id="btn-cascade"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isGraphStable() && !isPlaying}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-mono text-xs font-semibold shadow-md transition-all ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-700 text-white border border-amber-500"
                  : isGraphStable()
                  ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                  : "bg-williams-purple hover:bg-williams-purple-light text-white border border-williams-gold/40"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlaying ? "Pause Cascade" : "Auto-Stabilize"}</span>
            </button>

            <button
              id="btn-add-random"
              onClick={addRandomChips}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl bg-tufts-blue hover:bg-tufts-blue-light text-white font-mono text-xs font-semibold border border-white/10 shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-williams-gold" />
              <span>Scatter +6 Chips</span>
            </button>

            <button
              id="btn-reset"
              onClick={resetTemplate}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl border border-white/10 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-mono text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-charcoal-light" />
              <span>Reset State</span>
            </button>

            <button
              id="btn-clear"
              onClick={clearChips}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-mono text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-90 opacity-60" />
              <span>Clear to 0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Canvas Column */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#141414] border-2 border-white/10 rounded-3xl p-6 relative min-h-[350px] shadow-2xl">
        {/* Graph Render */}
        <div className="relative w-full max-w-[400px] aspect-square">
          <svg viewBox="0 0 400 350" className="w-full h-full select-none overflow-visible">
            {/* Draw Links */}
            <g>
              {currentTemplate.edges.map((e, idx) => {
                const sNode = currentTemplate.nodes.find((n) => n.id === e.source)!;
                const tNode = currentTemplate.nodes.find((n) => n.id === e.target)!;
                return (
                  <line
                    key={`edge-${idx}`}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Fired Particles Animation */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.circle
                  key={p.id}
                  cx={p.fromX}
                  cy={p.fromY}
                  r="6"
                  fill="#ffcc00"
                  className="shadow-md"
                  animate={{ cx: p.toX, cy: p.toY }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>

            {/* Draw Nodes */}
            <g>
              {currentTemplate.nodes.map((node) => {
                const numChips = chips[node.id] || 0;
                const deg = getDegree(node.id);
                const unstable = numChips >= deg && deg > 0;
                const isSelected = selectedNode === node.id;

                return (
                  <g
                    key={`node-group-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node.id)}
                  >
                    {/* Ring Outer Effect for unstable/selected */}
                    {unstable && (
                      <circle
                        r="32"
                        fill="none"
                        stroke="#ffcc00"
                        strokeWidth="2"
                        className="animate-ping opacity-25"
                      />
                    )}
                    
                    {/* Outer border for selection */}
                    <circle
                      r="25"
                      fill={isSelected ? "rgba(255,255,255,0.05)" : "transparent"}
                      stroke={isSelected ? "#ffcc00" : "transparent"}
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />

                    {/* Core node body */}
                    <circle
                      r="21"
                      fill={unstable ? "#ffcc00" : isSelected ? "#330066" : "#241e35"}
                      className="transition-all duration-300 hover:scale-115 active:scale-95"
                      style={{
                        filter: unstable ? "drop-shadow(0 0 6px rgba(255,204,0,0.6))" : "none"
                      }}
                    />

                    {/* Chip count badge */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      className="font-mono text-sm font-bold select-none transition-colors"
                      fill={unstable ? "#050505" : "#ffffff"}
                    >
                      {numChips}
                    </text>

                    {/* Node Label underneath */}
                    <text
                      textAnchor="middle"
                      y="36"
                      className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                      fill={isSelected ? "#3e8ede" : "rgba(255,255,255,0.5)"}
                    >
                      {node.label} ({deg > 0 ? `d=${deg}` : "isolated"})
                    </text>

                    {/* Fast Firing Trigger Icon overlay if unstable */}
                    {unstable && (
                      <g
                        transform="translate(14, -14)"
                        onClick={(e) => {
                          e.stopPropagation();
                          fireNode(node.id);
                        }}
                        className="cursor-pointer hover:scale-125 transition-transform"
                      >
                        <circle r="9" fill="#3e8ede" stroke="#ffffff" strokeWidth="1.5" />
                        <polygon points="-2.5,-3 4,0 -2.5,3" fill="#ffffff" transform="translate(0.5, 0) scale(0.9)" />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Small prompt overlay info */}
        <div className="absolute bottom-3 left-4 right-4 bg-[#1c1c1c] border border-white/10 p-2.5 rounded-2xl text-[10px] text-charcoal-light flex items-start space-x-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-tufts-blue flex-shrink-0 mt-0.5" />
          <span>
            <strong>Interactive:</strong> Click any vertex inside the canvas to adjust its chips or see details. 
            Click the <span className="bg-tufts-blue text-white px-1 rounded font-bold">▶</span> button on any golden pulsing node to manually fire it!
          </span>
        </div>
      </div>
    </div>
  );
}
