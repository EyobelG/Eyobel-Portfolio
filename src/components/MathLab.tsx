import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, Network, Shuffle, Plus, Minus, Info, Zap, Sigma } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

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
  nodeId: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface Impact {
  id: string;
  x: number;
  y: number;
}

// Animated digit — slides/blurs in on change instead of popping (Jakub materialize recipe).
function StatNumber({ value, className }: { value: number | string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -6, filter: "blur(3px)" }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function MathLab() {
  const reduceMotion = useReducedMotion();
  const [templateIdx, setTemplateIdx] = useState(0);
  const currentTemplate = TEMPLATES[templateIdx];

  const [chips, setChips] = useState<number[]>([]);
  const [fireVector, setFireVector] = useState<number[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [fireCount, setFireCount] = useState(0);
  const [justFired, setJustFired] = useState<{ id: number; key: number } | null>(null);
  const fireKeyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize chips / firing vector for the selected topology
  useEffect(() => {
    setChips([...currentTemplate.defaultChips]);
    setFireVector(new Array(currentTemplate.nodes.length).fill(0));
    setSelectedNode(null);
    setFireCount(0);
    setParticles([]);
    setImpacts([]);
    if (isPlaying) {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIdx, currentTemplate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getDegree = (nodeId: number): number => {
    return currentTemplate.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    ).length;
  };

  const getNeighbors = (nodeId: number): number[] => {
    const neighbors: number[] = [];
    currentTemplate.edges.forEach((e) => {
      if (e.source === nodeId) neighbors.push(e.target);
      else if (e.target === nodeId) neighbors.push(e.source);
    });
    return neighbors;
  };

  const isUnstable = (nodeId: number): boolean => {
    const deg = getDegree(nodeId);
    return chips[nodeId] >= deg && deg > 0;
  };

  const isGraphStable = (): boolean => {
    for (let i = 0; i < currentTemplate.nodes.length; i++) {
      if (isUnstable(i)) return false;
    }
    return true;
  };

  const totalChips = useMemo(() => chips.reduce((a, b) => a + b, 0), [chips]);
  const maxFire = useMemo(() => Math.max(1, ...fireVector), [fireVector]);

  const fireNode = (nodeId: number) => {
    const deg = getDegree(nodeId);
    if (chips[nodeId] < deg || deg === 0) return;

    const neighbors = getNeighbors(nodeId);
    const sourceNode = currentTemplate.nodes.find((n) => n.id === nodeId)!;
    const stamp = Date.now();

    const newParticles: Particle[] = neighbors.map((nId, idx) => {
      const targetNode = currentTemplate.nodes.find((n) => n.id === nId)!;
      return {
        id: `p-${nodeId}-${nId}-${stamp}-${idx}`,
        nodeId: nId,
        fromX: sourceNode.x,
        fromY: sourceNode.y,
        toX: targetNode.x,
        toY: targetNode.y,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    fireKeyRef.current += 1;
    setJustFired({ id: nodeId, key: fireKeyRef.current });

    setChips((prev) => {
      const updated = [...prev];
      updated[nodeId] -= deg;
      neighbors.forEach((nId) => {
        updated[nId] += 1;
      });
      return updated;
    });

    setFireVector((prev) => {
      const updated = [...prev];
      updated[nodeId] += 1;
      return updated;
    });

    setFireCount((prev) => prev + 1);

    const travelMs = reduceMotion ? 0 : 550;

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      setImpacts((prev) => [
        ...prev,
        ...newParticles.map((p) => ({ id: `impact-${p.id}`, x: p.toX, y: p.toY })),
      ]);
      setTimeout(() => {
        setImpacts((prev) =>
          prev.filter((im) => !newParticles.some((np) => `impact-${np.id}` === im.id))
        );
      }, 380);
    }, travelMs);
  };

  // Automatic stabilizer execution
  useEffect(() => {
    if (isPlaying) {
      if (isGraphStable()) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setInterval(() => {
        const unstableId = currentTemplate.nodes.findIndex((n) => isUnstable(n.id));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, chips, currentTemplate]);

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
    setFireVector(new Array(currentTemplate.nodes.length).fill(0));
    setFireCount(0);
    setIsPlaying(false);
  };

  const resetTemplate = () => {
    setChips([...currentTemplate.defaultChips]);
    setFireVector(new Array(currentTemplate.nodes.length).fill(0));
    setFireCount(0);
    setIsPlaying(false);
  };

  const stable = isGraphStable();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="math-lab-container">
      {/* Left controls column */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-williams-gold mb-2">
            <Network className="w-5 h-5 text-williams-gold" />
            <span className="font-mono text-xs font-semibold tracking-wider uppercase">Eyobel's Research Playground</span>
          </div>
          <h3 className="font-serif text-2xl lg:text-3xl text-charcoal font-semibold tracking-tight leading-tight">
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
              {TEMPLATES.map((t, idx) => {
                const active = templateIdx === idx;
                return (
                  <button
                    key={t.name}
                    id={`btn-template-${idx}`}
                    onClick={() => setTemplateIdx(idx)}
                    className="relative px-3 py-2 text-left rounded-xl text-xs transition-colors duration-200 border overflow-hidden"
                    style={{
                      borderColor: active ? "var(--williams-gold)" : "var(--color-cream-border)",
                      color: active ? "#ffffff" : "var(--color-charcoal)",
                      background: active ? "var(--williams-purple)" : "var(--color-cream-card)",
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="template-active-glow"
                        className="absolute inset-0 -z-0"
                        style={{
                          boxShadow: "0 0 0 1px var(--williams-gold), 0 8px 20px -8px var(--williams-gold)",
                          borderRadius: "0.75rem",
                        }}
                        transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.15 }}
                      />
                    )}
                    <span className="relative font-semibold block">{t.name}</span>
                    <span className="relative text-[10px] opacity-70 block truncate mt-0.5">{t.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div
          className="rounded-3xl p-5 border space-y-4"
          style={{
            background: "var(--color-glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderColor: "var(--color-cream-border)",
            boxShadow: "0 0 0 1px var(--color-cream-border), 0 12px 32px -16px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light">Stable Status:</span>
            <AnimatePresence mode="wait" initial={false}>
              {stable ? (
                <motion.span
                  key="stable"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                  Graph Stable
                </motion.span>
              ) : (
                <motion.span
                  key="unstable"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
                  style={{ background: "rgba(251,191,36,0.12)", color: "var(--williams-gold)", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  <Zap className="w-3 h-3" />
                  Cascade Ready
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light font-medium">Total Fires Executed:</span>
            <span className="font-bold text-williams-gold bg-williams-purple/30 border border-williams-gold/20 px-2.5 py-1 rounded-lg min-w-[2.25rem] text-center">
              <StatNumber value={fireCount} />
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light font-medium flex items-center gap-1">
              <Sigma className="w-3 h-3" />
              Total Chips (Conserved):
            </span>
            <span className="font-bold text-tufts-blue bg-tufts-blue/10 border border-tufts-blue/20 px-2.5 py-1 rounded-lg min-w-[2.25rem] text-center">
              <StatNumber value={totalChips} />
            </span>
          </div>

          {selectedNode !== null ? (
            <div className="p-3.5 rounded-2xl border flex justify-between items-center" style={{ background: "var(--color-cream-card-sub)", borderColor: "var(--color-cream-border)" }}>
              <div>
                <span className="font-mono text-xs font-bold text-williams-gold">
                  Node {currentTemplate.nodes[selectedNode].label}
                </span>
                <span className="block text-[10px] text-charcoal-light">
                  Degree: {getDegree(selectedNode)} | Chips: {chips[selectedNode]} | Fired: {fireVector[selectedNode] ?? 0}×
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  id="btn-subtract-chip"
                  onClick={() => adjustChips(selectedNode, -1)}
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                  className="p-1 rounded border"
                  style={{ background: "var(--color-cream-card)", borderColor: "var(--color-cream-border)" }}
                >
                  <Minus className="w-3.5 h-3.5 text-charcoal" />
                </motion.button>
                <span className="font-mono text-sm font-semibold w-6 text-center text-charcoal">
                  <StatNumber value={chips[selectedNode]} />
                </span>
                <motion.button
                  id="btn-add-chip"
                  onClick={() => adjustChips(selectedNode, 1)}
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                  className="p-1 rounded border"
                  style={{ background: "var(--color-cream-card)", borderColor: "var(--color-cream-border)" }}
                >
                  <Plus className="w-3.5 h-3.5 text-charcoal" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-dashed text-center text-xs text-charcoal-light" style={{ borderColor: "var(--color-cream-border)" }}>
              Click any node in the graph to adjust its chips manually
            </div>
          )}

          {/* Firing Vector — the σ(v) count of how many times each vertex has fired */}
          {fireCount > 0 && (
            <div className="pt-1">
              <span className="block font-mono text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-2">
                Firing Vector σ (per-vertex fire count)
              </span>
              <div className="space-y-1.5">
                {currentTemplate.nodes.map((n) => {
                  const count = fireVector[n.id] ?? 0;
                  const ratio = count / maxFire;
                  return (
                    <div key={`fv-${n.id}`} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-10 text-charcoal-light truncate">{n.label}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-cream-card-sub)" }}>
                        <motion.div
                          className="h-full rounded-full origin-left"
                          style={{ background: "linear-gradient(90deg, var(--williams-gold-dark), var(--williams-gold))", width: "100%" }}
                          initial={false}
                          animate={{ scaleX: ratio }}
                          transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0 }}
                        />
                      </div>
                      <span className="w-4 text-right text-charcoal font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <motion.button
              id="btn-cascade"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={stable && !isPlaying}
              whileTap={reduceMotion || (stable && !isPlaying) ? undefined : { scale: 0.97 }}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-mono text-xs font-semibold transition-colors duration-200"
              style={
                isPlaying
                  ? { background: "#b45309", color: "#fff", border: "1px solid rgba(251,191,36,0.4)" }
                  : stable
                  ? { background: "var(--color-cream-border)", color: "var(--color-charcoal)", opacity: 0.35, border: "1px solid var(--color-cream-border)", cursor: "not-allowed" }
                  : { background: "var(--williams-purple)", color: "#fff", border: "1px solid rgba(251,191,36,0.4)" }
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {isPlaying ? (
                  <motion.span
                    key="pause"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center space-x-2"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Cascade</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="play"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Auto-Stabilize</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              id="btn-add-random"
              onClick={addRandomChips}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl text-white font-mono text-xs font-semibold border"
              style={{ background: "var(--color-tufts-blue)", borderColor: "var(--color-cream-border)" }}
            >
              <Shuffle className="w-3.5 h-3.5 text-williams-gold" />
              <span>Scatter +6 Chips</span>
            </motion.button>

            <motion.button
              id="btn-reset"
              onClick={resetTemplate}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl border font-mono text-xs"
              style={{ borderColor: "var(--color-cream-border)", background: "var(--color-cream-card-sub)", color: "var(--color-charcoal)" }}
            >
              <RotateCcw className="w-3.5 h-3.5 text-charcoal-light" />
              <span>Reset State</span>
            </motion.button>

            <motion.button
              id="btn-clear"
              onClick={clearChips}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl border font-mono text-xs"
              style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", color: "#f87171" }}
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-90 opacity-60" />
              <span>Clear to 0</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Canvas Column */}
      <div
        className="lg:col-span-7 flex flex-col items-center justify-center rounded-3xl p-6 relative min-h-[350px] border overflow-hidden"
        style={{
          background: "var(--color-cream-card)",
          borderColor: "var(--color-cream-border)",
          boxShadow: "0 0 0 1px var(--color-cream-border), 0 24px 48px -24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Ambient dot-grid backdrop for depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(var(--color-cream-border-strong) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Graph Render */}
        <div className="relative w-full max-w-[400px] aspect-square">
          <svg viewBox="0 0 400 350" className="w-full h-full select-none overflow-visible">
            <defs>
              <radialGradient id="nodeUnstable" cx="35%" cy="30%" r="75%">
                <stop offset="0%" style={{ stopColor: "var(--williams-gold-light)" }} />
                <stop offset="100%" style={{ stopColor: "var(--williams-gold)" }} />
              </radialGradient>
              <radialGradient id="nodeIdle" cx="35%" cy="30%" r="75%">
                <stop offset="0%" style={{ stopColor: "var(--color-cream-card-sub)" }} />
                <stop offset="100%" style={{ stopColor: "var(--williams-purple-dark)", stopOpacity: 0.5 }} />
              </radialGradient>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="particleGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Draw Links */}
            <g>
              {currentTemplate.edges.map((e, idx) => {
                const sNode = currentTemplate.nodes.find((n) => n.id === e.source)!;
                const tNode = currentTemplate.nodes.find((n) => n.id === e.target)!;
                const isActive = particles.some(
                  (p) =>
                    (p.fromX === sNode.x && p.fromY === sNode.y && p.toX === tNode.x && p.toY === tNode.y) ||
                    (p.fromX === tNode.x && p.fromY === tNode.y && p.toX === sNode.x && p.toY === sNode.y)
                );
                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke="var(--color-cream-border-strong)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {isActive && (
                      <motion.line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke="var(--williams-gold)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.55 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </g>
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
                  fill="var(--williams-gold-light)"
                  filter="url(#particleGlow)"
                  initial={reduceMotion ? { cx: p.toX, cy: p.toY } : { cx: p.fromX, cy: p.fromY, opacity: 0.4, scale: 0.6 }}
                  animate={{ cx: p.toX, cy: p.toY, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.32, 0, 0.2, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Impact ripples where a chip just landed */}
            <AnimatePresence>
              {impacts.map((im) => (
                <motion.circle
                  key={im.id}
                  cx={im.x}
                  cy={im.y}
                  fill="none"
                  stroke="var(--williams-gold)"
                  strokeWidth="2"
                  initial={{ r: 10, opacity: 0.6 }}
                  animate={{ r: 26, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
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
                const fired = justFired?.id === node.id;

                return (
                  <g
                    key={`node-group-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node.id)}
                  >
                    {/* One-shot fire flash ring (not a continuous loop) */}
                    <AnimatePresence>
                      {fired && (
                        <motion.circle
                          key={justFired?.key}
                          r="21"
                          fill="none"
                          stroke="var(--williams-gold)"
                          strokeWidth="2.5"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                          onAnimationComplete={() => setJustFired((prev) => (prev?.key === justFired?.key ? null : prev))}
                        />
                      )}
                    </AnimatePresence>

                    {/* Outer border for selection */}
                    <circle
                      r="25"
                      fill={isSelected ? "var(--color-glass-bg)" : "transparent"}
                      stroke={isSelected ? "var(--williams-gold)" : "transparent"}
                      strokeWidth="2.5"
                      style={{ transition: "stroke 0.2s ease" }}
                    />

                    {/* Core node body */}
                    <motion.circle
                      r="21"
                      fill={unstable ? "url(#nodeUnstable)" : "url(#nodeIdle)"}
                      stroke={unstable ? "var(--williams-gold)" : "var(--color-cream-border-strong)"}
                      strokeWidth={unstable ? 1.5 : 1}
                      filter={unstable ? "url(#glow)" : undefined}
                      animate={fired && !reduceMotion ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Chip count badge */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      className="font-mono text-sm font-bold select-none"
                      fill={unstable ? "#1a1400" : "var(--color-charcoal)"}
                    >
                      {numChips}
                    </text>

                    {/* Node Label underneath */}
                    <text
                      textAnchor="middle"
                      y="36"
                      className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                      fill={isSelected ? "var(--color-tufts-blue)" : "var(--color-charcoal-light)"}
                    >
                      {node.label} ({deg > 0 ? `d=${deg}` : "isolated"})
                    </text>

                    {/* Fast Firing Trigger overlay if unstable */}
                    {unstable && (
                      <g
                        transform="translate(14, -14)"
                        onClick={(e) => {
                          e.stopPropagation();
                          fireNode(node.id);
                        }}
                        className="cursor-pointer"
                      >
                        <circle r="9" fill="var(--color-tufts-blue)" stroke="var(--color-cream-card)" strokeWidth="1.5" />
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
        <div
          className="relative mt-2 w-full bg-cream-card-sub border p-2.5 rounded-2xl text-[10px] text-charcoal-light flex items-start space-x-2"
          style={{ borderColor: "var(--color-cream-border)" }}
        >
          <Info className="w-3.5 h-3.5 text-tufts-blue flex-shrink-0 mt-0.5" />
          <span>
            <strong>Interactive:</strong> Click any vertex to adjust its chips or see details.
            Click the <span className="bg-tufts-blue text-white px-1 rounded font-bold">▶</span> button on any golden node to manually fire it.
          </span>
        </div>
      </div>
    </div>
  );
}
