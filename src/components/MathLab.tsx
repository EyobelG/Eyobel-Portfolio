import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, Network, Shuffle, Plus, Minus, Info, Zap, Sigma } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

const BOARD_W = 400;
const BOARD_H = 350;
const MAX_VISIBLE_CHIPS = 9;
const CHIP_Z_STEP = 5.5;

const TEMPLATES: GraphTemplate[] = [
  {
    name: "Cycle Graph (C₅)",
    description: "A symmetric ring of 5 vertices. Excellent for seeing circular flow.",
    nodes: [
      { id: 0, label: "v₁", x: 200, y: 65 },
      { id: 1, label: "v₂", x: 312, y: 145 },
      { id: 2, label: "v₃", x: 270, y: 268 },
      { id: 3, label: "v₄", x: 130, y: 268 },
      { id: 4, label: "v₅", x: 88, y: 145 },
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
      { id: 0, label: "Hub", x: 200, y: 170 },
      { id: 1, label: "Leaf A", x: 200, y: 62 },
      { id: 2, label: "Leaf B", x: 312, y: 170 },
      { id: 3, label: "Leaf C", x: 200, y: 278 },
      { id: 4, label: "Leaf D", x: 88, y: 170 },
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
      { id: 0, label: "v₁ (Apex)", x: 200, y: 62 },
      { id: 1, label: "v₂ (R-Roof)", x: 292, y: 142 },
      { id: 2, label: "v₃ (R-Base)", x: 292, y: 262 },
      { id: 3, label: "v₄ (L-Base)", x: 108, y: 262 },
      { id: 4, label: "v₅ (L-Roof)", x: 108, y: 142 },
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
      { id: 0, label: "v₁", x: 120, y: 86 },
      { id: 1, label: "v₂", x: 280, y: 86 },
      { id: 2, label: "v₃", x: 280, y: 248 },
      { id: 3, label: "v₄", x: 120, y: 248 },
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

interface EnergyPacket {
  id: string;
  sourceId: number;
  targetId: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  launchZ: number;
}

interface Impact {
  id: string;
  x: number;
  y: number;
}

// Animated digit - slides/blurs in on change instead of popping (Jakub materialize recipe).
function StatNumber({ value, className }: { value: number | string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-grid overflow-hidden tabular-nums">
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

/** Single 3D-styled metallic Liquid Gold poker chip token rising along the Z-axis. */
function GoldPokerChip({
  index,
  isTop,
  totalCount,
  unstable,
  reduceMotion,
}: {
  index: number;
  isTop: boolean;
  totalCount: number;
  unstable: boolean;
  reduceMotion: boolean | null;
}) {
  const zHeight = 5 + index * CHIP_Z_STEP;

  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 0, scale: 0.65, z: zHeight + 26 }
      }
      animate={{
        opacity: 1,
        scale: 1,
        z: zHeight,
      }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.72, z: zHeight + 18 }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 24, mass: 0.65 }
      }
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
      }}
      className="pointer-events-none flex items-center justify-center"
    >
      {/* Physical metallic poker-style chip disc */}
      <div
        className="w-10 h-10 rounded-full relative flex items-center justify-center"
        style={{
          background: isTop
            ? unstable
              ? "radial-gradient(circle at 32% 28%, #FEF9C3 0%, #FBBF24 38%, #F59E0B 72%, #B45309 100%)"
              : "radial-gradient(circle at 32% 28%, #FDE68A 0%, #F59E0B 52%, #B45309 88%, #78350F 100%)"
            : "linear-gradient(180deg, #F59E0B 0%, #B45309 65%, #78350F 100%)",
          boxShadow: isTop
            ? unstable
              ? "inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -2px 3px rgba(120,53,15,0.7), 0 2px 0 #92400E, 0 3.5px 0 #78350F, 0 6px 14px rgba(245,158,11,0.45)"
              : "inset 0 1.5px 2px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(120,53,15,0.75), 0 2px 0 #92400E, 0 3.5px 0 #78350F, 0 5px 10px rgba(0,0,0,0.65)"
            : "0 2px 0 #92400E, 0 3.5px 0 #451A03, 0 4px 7px rgba(0,0,0,0.5)",
          border: "1.5px solid rgba(254, 243, 199, 0.55)",
        }}
      >
        {/* Classic notched poker-chip inner milled inlay ring */}
        <div
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
          style={{
            border: "1.5px dashed rgba(120, 53, 15, 0.55)",
            background: isTop
              ? "radial-gradient(circle at 38% 35%, rgba(255,251,235,0.45), rgba(217,119,6,0.18) 70%)"
              : "transparent",
          }}
        >
          {isTop && (
            <span
              className="font-mono text-[13px] font-extrabold leading-none tabular-nums select-none"
              style={{
                color: "#1C1003",
                textShadow: "0 1px 0 rgba(254, 243, 199, 0.65)",
              }}
            >
              {totalCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
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
  const [packets, setPackets] = useState<EnergyPacket[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [fireCount, setFireCount] = useState(0);
  const [justFired, setJustFired] = useState<{ id: number; key: number } | null>(null);
  const fireKeyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subtle interactive 2.5D board tilt on pointer move (keeps perspective(1000px) alive & tactile)
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const boardTiltX = useSpring(useTransform(pointerY, [0, 1], [31, 21]), { stiffness: 200, damping: 26 });
  const boardTiltY = useSpring(useTransform(pointerX, [0, 1], [-5, 5]), { stiffness: 200, damping: 26 });

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = boardContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  };

  const handleBoardMouseLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  // Initialize chips / firing vector for the selected topology
  useEffect(() => {
    setChips([...currentTemplate.defaultChips]);
    setFireVector(new Array(currentTemplate.nodes.length).fill(0));
    setSelectedNode(null);
    setFireCount(0);
    setPackets([]);
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
    const launchStackHeight = Math.min(chips[nodeId], MAX_VISIBLE_CHIPS) * CHIP_Z_STEP + 10;

    const newPackets: EnergyPacket[] = neighbors.map((nId, idx) => {
      const targetNode = currentTemplate.nodes.find((n) => n.id === nId)!;
      return {
        id: `p-${nodeId}-${nId}-${stamp}-${idx}`,
        sourceId: nodeId,
        targetId: nId,
        fromX: sourceNode.x,
        fromY: sourceNode.y,
        toX: targetNode.x,
        toY: targetNode.y,
        launchZ: launchStackHeight,
      };
    });

    setPackets((prev) => [...prev, ...newPackets]);
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

    const travelMs = reduceMotion ? 0 : 540;

    setTimeout(() => {
      setPackets((prev) => prev.filter((p) => !newPackets.some((np) => np.id === p.id)));
      setImpacts((prev) => [
        ...prev,
        ...newPackets.map((p) => ({ id: `impact-${p.id}`, x: p.toX, y: p.toY })),
      ]);
      setTimeout(() => {
        setImpacts((prev) =>
          prev.filter((im) => !newPackets.some((np) => `impact-${np.id}` === im.id))
        );
      }, 480);
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
      }, 820);
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
                  style={{ background: "rgba(245,158,11,0.14)", color: "var(--williams-gold)", border: "1px solid rgba(245,158,11,0.35)" }}
                >
                  <Zap className="w-3 h-3" />
                  Cascade Ready
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-charcoal-light font-medium">Total Fires Executed:</span>
            <span className="font-bold text-williams-gold bg-williams-purple/30 border border-williams-gold/25 px-2.5 py-1 rounded-lg min-w-[2.25rem] text-center">
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
                <span className="block text-[10px] text-charcoal-light tabular-nums">
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

          {/* Firing Vector - the σ(v) count of how many times each vertex has fired */}
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
                      <span className="w-4 text-right text-charcoal font-semibold tabular-nums">{count}</span>
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
                  ? { background: "#b45309", color: "#fff", border: "1px solid rgba(245,158,11,0.45)" }
                  : stable
                  ? { background: "var(--color-cream-border)", color: "var(--color-charcoal)", opacity: 0.35, border: "1px solid var(--color-cream-border)", cursor: "not-allowed" }
                  : { background: "var(--williams-purple)", color: "#fff", border: "1px solid rgba(245,158,11,0.45)" }
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

      {/* Right 2.5D Spatial Graph Board Column */}
      <div
        ref={boardContainerRef}
        onMouseMove={handleBoardMouseMove}
        onMouseLeave={handleBoardMouseLeave}
        className="lg:col-span-7 flex flex-col items-center justify-between rounded-3xl p-6 relative min-h-[430px] border overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(124, 58, 237, 0.14) 0%, var(--color-cream-card) 62%)",
          borderColor: "var(--color-cream-border)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px var(--color-cream-border), 0 28px 56px -24px rgba(0,0,0,0.65)",
        }}
      >
        {/* Top 1px specular glass edge */}
        <div
          className="pointer-events-none absolute top-0 inset-x-12 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.45), rgba(124, 58, 237, 0.5), transparent)",
          }}
        />

        {/* Ambient dot-grid backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: "radial-gradient(var(--color-cream-border-strong) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* 2.5D Perspective Stage (CSS perspective(1000px)) */}
        <div
          className="relative w-full flex-1 flex items-center justify-center py-4"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            style={{
              rotateX: reduceMotion ? 24 : boardTiltX,
              rotateY: reduceMotion ? 0 : boardTiltY,
              transformStyle: "preserve-3d",
            }}
            className="relative w-full max-w-[430px] aspect-[400/350] rounded-2xl"
          >
            {/* Physical beveled 2.5D Obsidian game board slab */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(155deg, rgba(22, 20, 38, 0.92) 0%, rgba(10, 10, 15, 0.96) 100%)",
                border: "1px solid rgba(124, 58, 237, 0.32)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 0 rgba(18, 15, 32, 0.95), 0 12px 0 rgba(124, 58, 237, 0.28), 0 32px 48px -12px rgba(0,0,0,0.85)",
                transform: "translateZ(-4px)",
              }}
            >
              {/* Engraved geometric board grid */}
              <div
                className="absolute inset-3 rounded-xl opacity-25"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(167, 139, 250, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(167, 139, 250, 0.25) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
            </div>

            {/* Layer 1: Flush SVG Graph Edges on the 2.5D Board Plane */}
            <svg
              viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
              className="absolute inset-0 w-full h-full select-none overflow-visible pointer-events-none"
              style={{ transform: "translateZ(1px)" }}
            >
              <defs>
                <linearGradient id="edgeSurgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
                <filter id="edgeGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {currentTemplate.edges.map((e, idx) => {
                const sNode = currentTemplate.nodes.find((n) => n.id === e.source)!;
                const tNode = currentTemplate.nodes.find((n) => n.id === e.target)!;
                const isActive = packets.some(
                  (p) =>
                    (p.sourceId === e.source && p.targetId === e.target) ||
                    (p.sourceId === e.target && p.targetId === e.source)
                );
                return (
                  <g key={`edge-${idx}`}>
                    {/* Recessed dark conduit track */}
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke="rgba(124, 58, 237, 0.38)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Crisp inner Electric Violet wire */}
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke="rgba(167, 139, 250, 0.55)"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    {/* Illuminated Liquid Gold energy conduit while packets travel */}
                    {isActive && (
                      <motion.line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke="url(#edgeSurgeGrad)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        filter="url(#edgeGlow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.95 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Layer 2: Spring-Physics Landing Ripples on the 2.5D Plane */}
            <AnimatePresence>
              {impacts.map((im) => (
                <motion.div
                  key={im.id}
                  style={{
                    position: "absolute",
                    left: `${(im.x / BOARD_W) * 100}%`,
                    top: `${(im.y / BOARD_H) * 100}%`,
                    transformStyle: "preserve-3d",
                    z: 4,
                  }}
                  initial={reduceMotion ? { opacity: 0 } : { x: "-50%", y: "-50%", scale: 0.55, opacity: 0.95 }}
                  animate={{ x: "-50%", y: "-50%", scale: 2.35, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
                  className="pointer-events-none w-12 h-12 rounded-full border-2 border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.7)]"
                />
              ))}
            </AnimatePresence>

            {/* Layer 3: Glowing Energy Packets Traveling Along Edges with Framer Motion Spring Physics */}
            <AnimatePresence>
              {packets.map((p) => (
                <motion.div
                  key={p.id}
                  initial={
                    reduceMotion
                      ? {
                          left: `${(p.toX / BOARD_W) * 100}%`,
                          top: `${(p.toY / BOARD_H) * 100}%`,
                          z: 18,
                          opacity: 1,
                          scale: 1,
                        }
                      : {
                          left: `${(p.fromX / BOARD_W) * 100}%`,
                          top: `${(p.fromY / BOARD_H) * 100}%`,
                          z: p.launchZ,
                          opacity: 0.4,
                          scale: 0.65,
                        }
                  }
                  animate={{
                    left: `${(p.toX / BOARD_W) * 100}%`,
                    top: `${(p.toY / BOARD_H) * 100}%`,
                    z: 22,
                    opacity: 1,
                    scale: 1.15,
                  }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 165,
                          damping: 18,
                          mass: 0.8,
                        }
                  }
                  style={{
                    position: "absolute",
                    x: "-50%",
                    y: "-50%",
                    transformStyle: "preserve-3d",
                  }}
                  className="pointer-events-none z-30"
                >
                  {/* Outer Electric Violet / Liquid Gold aura */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(circle, #FEF3C7 0%, #F59E0B 45%, rgba(124,58,237,0.75) 75%, transparent 100%)",
                      boxShadow:
                        "0 0 14px 3px rgba(245, 158, 11, 0.85), 0 0 24px 6px rgba(124, 58, 237, 0.55)",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Layer 4: Interactive 3D Vertices with Rising Metallic Gold Stacked Poker Chips */}
            {currentTemplate.nodes.map((node) => {
              const numChips = chips[node.id] || 0;
              const deg = getDegree(node.id);
              const unstable = numChips >= deg && deg > 0;
              const isSelected = selectedNode === node.id;
              const fired = justFired?.id === node.id;
              const visibleChips = Math.min(numChips, MAX_VISIBLE_CHIPS);
              const stackTopZ = visibleChips > 0 ? 5 + (visibleChips - 1) * CHIP_Z_STEP : 5;

              return (
                <div
                  key={`node-3d-${node.id}`}
                  onClick={() => setSelectedNode(node.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedNode(node.id);
                    }
                  }}
                  aria-label={`Vertex ${node.label}, degree ${deg}, ${numChips} chips`}
                  style={{
                    position: "absolute",
                    left: `${(node.x / BOARD_W) * 100}%`,
                    top: `${(node.y / BOARD_H) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    transformStyle: "preserve-3d",
                  }}
                  className="w-12 h-12 cursor-pointer group focus:outline-none"
                >
                  {/* One-shot spring shockwave ring on fire */}
                  <AnimatePresence>
                    {fired && (
                      <motion.div
                        key={justFired?.key}
                        initial={{ scale: 0.9, opacity: 0.95 }}
                        animate={{ scale: 2.15, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 140, damping: 18 }}
                        onAnimationComplete={() =>
                          setJustFired((prev) => (prev?.key === justFired?.key ? null : prev))
                        }
                        style={{ transform: "translateZ(3px)" }}
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.8)]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Recessed Vertex Socket Pedestal on the 2.5D board */}
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-200 flex items-center justify-center"
                    style={{
                      transform: "translateZ(2px)",
                      background: unstable
                        ? "radial-gradient(circle, rgba(245,158,11,0.32) 0%, rgba(124,58,237,0.28) 65%, rgba(10,10,15,0.92) 100%)"
                        : "radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(15,15,26,0.94) 72%)",
                      border: isSelected
                        ? "2px solid #F59E0B"
                        : unstable
                        ? "1.5px solid rgba(245,158,11,0.85)"
                        : "1.5px solid rgba(167,139,250,0.45)",
                      boxShadow: isSelected
                        ? "0 0 0 4px rgba(245,158,11,0.22), 0 0 20px rgba(245,158,11,0.45)"
                        : unstable
                        ? "0 0 18px rgba(245,158,11,0.38)"
                        : "inset 0 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    {/* Show 0 count directly in socket when vertex has no chips */}
                    {numChips === 0 && (
                      <span className="font-mono text-xs font-bold text-slate-300/80 select-none tabular-nums">
                        0
                      </span>
                    )}
                  </div>

                  {/* Physical 3D-Styled Metallic Gold Stacked Poker Chips Rising Along +Z */}
                  <div
                    className="absolute inset-1 pointer-events-none"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <AnimatePresence initial={false}>
                      {Array.from({ length: visibleChips }).map((_, chipIdx) => (
                        <GoldPokerChip
                          key={`chip-${node.id}-${chipIdx}`}
                          index={chipIdx}
                          isTop={chipIdx === visibleChips - 1}
                          totalCount={numChips}
                          unstable={unstable}
                          reduceMotion={reduceMotion}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Floating Fire ▶ Trigger Button on Unstable Vertices (elevated with the stack!) */}
                  {unstable && (
                    <motion.button
                      type="button"
                      id={`btn-fire-node-${node.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        fireNode(node.id);
                      }}
                      whileHover={reduceMotion ? undefined : { scale: 1.16 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 450, damping: 20 }}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        transform: `translateZ(${stackTopZ + 12}px)`,
                        background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                        border: "1.5px solid #F59E0B",
                        boxShadow: "0 4px 14px rgba(124,58,237,0.65), 0 0 10px rgba(245,158,11,0.5)",
                      }}
                      className="no-3d w-6 h-6 rounded-full flex items-center justify-center text-white cursor-pointer z-20"
                      title={`Fire ${node.label} (sends 1 chip to each neighbor)`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5 text-[#FDE68A]" />
                    </motion.button>
                  )}

                  {/* Crisp Vertex Label Underneath Pedestal */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "calc(100% + 6px)",
                      transform: "translateX(-50%) translateZ(4px)",
                    }}
                    className="pointer-events-none whitespace-nowrap text-center"
                  >
                    <span
                      className="font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0A0A0F]/80 border border-white/10"
                      style={{
                        color: isSelected
                          ? "#FCD34D"
                          : unstable
                          ? "#F59E0B"
                          : "rgba(226, 232, 240, 0.85)",
                      }}
                    >
                      {node.label} ({deg > 0 ? `d=${deg}` : "isolated"})
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Small prompt overlay info */}
        <div
          className="relative mt-2 w-full bg-cream-card-sub border p-2.5 rounded-2xl text-[10px] text-charcoal-light flex items-start space-x-2"
          style={{ borderColor: "var(--color-cream-border)" }}
        >
          <Info className="w-3.5 h-3.5 text-tufts-blue flex-shrink-0 mt-0.5" />
          <span>
            <strong>Interactive:</strong> Click any vertex to adjust its chips or see details.
            Click the <span className="bg-williams-purple text-[#FDE68A] border border-williams-gold/40 px-1 rounded font-bold">▶</span> button on any golden node to manually fire it.
          </span>
        </div>
      </div>
    </div>
  );
}
