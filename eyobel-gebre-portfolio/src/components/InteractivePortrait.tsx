import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Cpu, Database, Sparkles, Layers, ShieldCheck, Zap } from "lucide-react";

export default function InteractivePortrait() {
  // Modes: 'classical' | 'systems' | 'math'
  const [visualMode, setVisualMode] = useState<"classical" | "systems" | "math">("systems");
  
  // Hover & Parallax position
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Math simulation state: small chip-firing graph on top of head
  const [graphNodes, setGraphNodes] = useState([
    { id: 1, cx: 40, cy: 30, chips: 2, label: "v1" },
    { id: 2, cx: 160, cy: 30, chips: 1, label: "v2" },
    { id: 3, cx: 100, cy: 110, chips: 0, label: "v3" },
    { id: 4, cx: 100, cy: 180, chips: 3, label: "v4" },
  ]);
  const [firingCount, setFiringCount] = useState(0);

  // Systems diagnostic state: scrolling register log lines
  const [sysRegisters, setSysRegisters] = useState({
    PC: "0x00A4",
    R1: "0x0048",
    R2: "0x0065",
    R3: "0x006C",
    SP: "0x7FFF"
  });
  const [sysLogs, setSysLogs] = useState<string[]>([
    "SYS_INIT: Booting core portrait model...",
    "VALGRIND: 0 leaks detected in visual thread",
    "COMPILER_OP: -O3 level optimization applied"
  ]);

  // Handle 3D Parallax Rotation on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse relative coordinates from card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    // Calculate tilt: max 12 degrees
    setRotateX(-mouseY * 24);
    setRotateY(mouseX * 24);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Systems Mode Simulation updates
  useEffect(() => {
    if (visualMode !== "systems") return;
    const interval = setInterval(() => {
      // Rotate PC and registers
      setSysRegisters(prev => {
        const nextPC = (parseInt(prev.PC, 16) + 4) % 1024;
        const nextR1 = Math.floor(Math.random() * 256);
        return {
          ...prev,
          PC: "0x" + nextPC.toString(16).toUpperCase().padStart(4, "0"),
          R1: "0x" + nextR1.toString(16).toUpperCase().padStart(4, "0"),
        };
      });

      // Append code blocks
      const list = [
        "JMP 0x00A4 // Entering optimization vector",
        "LOAD R2, [SP+8] // Memory pointer bound",
        "ADDU R1, R2, R3 // Bitwise assembly logic",
        "PUSH R1 // Preserving frame state",
        "COMPILER_OP: Inlining leaf functions... SUCCESS"
      ];
      setSysLogs(prev => {
        const updated = [...prev, list[Math.floor(Math.random() * list.length)]];
        if (updated.length > 5) updated.shift();
        return updated;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [visualMode]);

  // Math Mode: Fire a chip
  const handleFireNode = (nodeId: number) => {
    setGraphNodes(prev => {
      const node = prev.find(n => n.id === nodeId);
      if (!node || node.chips < 2) return prev; // Needs at least 2 chips to fire (degree of vertex is 2-3)
      
      setFiringCount(f => f + 1);

      // Define adjacencies
      // Node 1 is connected to 2 and 3
      // Node 2 is connected to 1 and 3
      // Node 3 is connected to 1, 2, 4
      // Node 4 is connected to 3
      return prev.map(n => {
        let diff = 0;
        if (n.id === nodeId) {
          // Decrement fired chips based on degrees
          const neighbors = nodeId === 3 ? 3 : nodeId === 4 ? 1 : 2;
          diff = -neighbors;
        } else {
          // Increment chips on neighbors
          if (nodeId === 1 && (n.id === 2 || n.id === 3)) diff = 1;
          if (nodeId === 2 && (n.id === 1 || n.id === 3)) diff = 1;
          if (nodeId === 3 && (n.id === 1 || n.id === 2 || n.id === 4)) diff = 1;
          if (nodeId === 4 && n.id === 3) diff = 1;
        }
        return { ...n, chips: Math.max(0, n.chips + diff) };
      });
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-[360px]">
      
      {/* Mode Switcher Buttons */}
      <div className="flex items-center space-x-1 bg-black/60 border border-white/10 p-1.5 rounded-2xl w-full text-[10px] font-mono">
        <button
          onClick={() => setVisualMode("systems")}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 font-semibold ${
            visualMode === "systems"
              ? "bg-williams-purple text-williams-gold shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Systems
        </button>
        <button
          onClick={() => setVisualMode("math")}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 font-semibold ${
            visualMode === "math"
              ? "bg-williams-purple text-williams-gold shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Math Lab
        </button>
        <button
          onClick={() => setVisualMode("classical")}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 font-semibold ${
            visualMode === "classical"
              ? "bg-williams-purple text-williams-gold shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Classical
        </button>
      </div>

      {/* 3D PARALLAX CARD WRAPPER */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        className="relative w-full aspect-[4/5] rounded-[32px] cursor-pointer overflow-hidden shadow-2xl transition-all duration-300 bg-black/40 border-2 border-white/10"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(96, 34, 134, 0.45)" 
            : "0 10px 30px -15px rgba(0,0,0,0.7)"
        }}
      >
        {/* Dynamic Background Gradients */}
        <div className="absolute inset-0 transition-opacity duration-700 bg-gradient-to-tr from-black via-[#0d0a14] to-[#12141f]" />

        {/* Ambient mode-dependent glows */}
        <AnimatePresence mode="wait">
          {visualMode === "systems" && (
            <motion.div
              key="sys-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#00e5a3,transparent_45%)]"
            />
          )}
          {visualMode === "math" && (
            <motion.div
              key="math-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,#ffaa00,transparent_50%)]"
            />
          )}
          {visualMode === "classical" && (
            <motion.div
              key="class-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#3c1053,transparent_60%)]"
            />
          )}
        </AnimatePresence>

        {/* 1. LAYER: TECHNICAL ACCENTS (MATRIX & GRID) */}
        <div 
          className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
          style={{ transform: "translateZ(-40px)" }}
        />

        {/* Binary stream in Systems Mode */}
        {visualMode === "systems" && (
          <div className="absolute left-4 top-14 space-y-1 font-mono text-[8px] text-[#00e5a3]/45 pointer-events-none leading-none">
            <p>01001101 01010011</p>
            <p>01010100 01010101</p>
            <p>01000110 01010100</p>
            <p>R0=0x00A4 R1=0xFFFF</p>
          </div>
        )}

        {/* 2. LAYER: MAIN PORTRAIT SVG (Vector representation of Eyobel) */}
        <div 
          className="absolute inset-0 flex items-end justify-center select-none pointer-events-none"
          style={{ transform: "translateZ(20px)" }}
        >
          <svg
            viewBox="0 0 200 240"
            className="w-[90%] h-[90%] object-contain"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Halo for Headshot */}
            <circle cx="100" cy="110" r="75" className="fill-white/5 stroke-white/5" strokeWidth="1" />
            <circle cx="100" cy="110" r="55" className="fill-white/5" />

            {/* SUIT JACKET (Navy Blue) */}
            <path
              d="M35 240 C35 200, 60 185, 80 180 L120 180 C140 185, 165 200, 165 240 Z"
              fill="#1e293b"
            />
            {/* Suit Lapels */}
            <path d="M55 240 L80 185 L90 205 L65 240 Z" fill="#0f172a" />
            <path d="M145 240 L120 185 L110 205 L135 240 Z" fill="#0f172a" />

            {/* WHITE SHIRT */}
            <path d="M80 180 L120 180 L100 220 Z" fill="#ffffff" />
            <path d="M80 180 L90 195 L100 180 Z" fill="#e2e8f0" />
            <path d="M120 180 L110 195 L100 180 Z" fill="#e2e8f0" />

            {/* STRIPED TIE (Williams Purple and Gold) */}
            <g id="striped-tie">
              <path d="M96 182 L104 182 L108 240 L92 240 Z" fill="#3c1053" />
              {/* Gold Stripes */}
              <path d="M96 190 L104 195 L104 200 L95 195 Z" fill="#eab308" />
              <path d="M95 205 L105 212 L106 217 L94 210 Z" fill="#eab308" />
              <path d="M93 222 L107 231 L108 236 L92 227 Z" fill="#eab308" />
            </g>

            {/* NECK */}
            <path d="M85 145 C85 145, 85 185, 100 185 C115 185, 115 145, 115 145 Z" fill="#a16244" />
            <path d="M85 170 C92 182, 108 182, 115 170 Z" fill="#78350f" opacity="0.3" /> {/* Neck Shadow */}

            {/* HEAD & FACE (Brown complexion, warm tone) */}
            <path
              d="M68 115 C68 80, 80 75, 100 75 C120 75, 132 80, 132 115 C132 150, 120 155, 100 155 C80 155, 68 150, 68 115 Z"
              fill="#b45309"
            />

            {/* CURLY HAIR (Rich, detailed, stylized dark brown curly shapes) */}
            <g id="curly-hair">
              {/* Base hair */}
              <path d="M64 110 C62 90, 70 65, 100 65 C130 65, 138 90, 136 110 C128 105, 115 95, 100 95 C85 95, 72 105, 64 110 Z" fill="#17110d" />
              {/* Overlapping small curly locks around the crown */}
              <circle cx="70" cy="95" r="10" fill="#110c0a" />
              <circle cx="82" cy="80" r="12" fill="#17110d" />
              <circle cx="100" cy="73" r="13" fill="#1c1512" />
              <circle cx="118" cy="80" r="12" fill="#17110d" />
              <circle cx="130" cy="95" r="10" fill="#110c0a" />
              
              <circle cx="78" cy="100" r="8" fill="#17110d" />
              <circle cx="90" cy="85" r="10" fill="#1c1512" />
              <circle cx="110" cy="85" r="10" fill="#17110d" />
              <circle cx="122" cy="100" r="8" fill="#1c1512" />
            </g>

            {/* EARS */}
            <circle cx="67" cy="118" r="6" fill="#b45309" />
            <circle cx="133" cy="118" r="6" fill="#b45309" />

            {/* EYES & BROWS */}
            <g id="eyebrows">
              <path d="M78 105 C83 102, 88 103, 91 106" stroke="#17110d" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M122 105 C117 102, 112 103, 109 106" stroke="#17110d" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g id="eyes">
              {/* Left Eye */}
              <ellipse cx="85" cy="111" rx="4.5" ry="3" fill="#ffffff" />
              <circle cx="85" cy="111" r="2" fill="#451a03" />
              {/* Right Eye */}
              <ellipse cx="115" cy="111" rx="4.5" ry="3" fill="#ffffff" />
              <circle cx="115" cy="111" r="2" fill="#451a03" />
            </g>

            {/* NOSE */}
            <path d="M100 110 L97 125 L103 125 Z" fill="#92400e" opacity="0.4" />
            <path d="M96 125 C98 127, 102 127, 104 125" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />

            {/* MUSTACHE, BEARD & GOATEE (Curated curly style) */}
            <g id="beard-goatee">
              {/* Mustache */}
              <path d="M88 131 C94 128, 106 128, 112 131 C109 133, 91 133, 88 131 Z" fill="#17110d" />
              {/* Beard curve on jaws */}
              <path d="M68 122 C68 145, 80 157, 100 157 C120 157, 132 145, 132 122 C132 122, 127 150, 100 150 C73 150, 68 122, 68 122 Z" fill="#110c0a" opacity="0.8" />
              {/* Central Goatee connection */}
              <rect x="96" y="138" width="8" height="18" rx="2" fill="#17110d" />
              <circle cx="100" cy="151" r="9" fill="#110c0a" />
            </g>

            {/* WARM FRIENDLY SMILE */}
            <path d="M88 134 C92 141, 108 141, 112 134" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <path d="M88 134 C92 141, 108 141, 112 134 Z" fill="#ffffff" />
            <path d="M86 134 C91 131, 109 131, 114 134" stroke="#78350f" strokeWidth="1" />

            {/* Glowing Scanline HUD Overlay in Systems mode */}
            {visualMode === "systems" && (
              <g id="laser-hud" className="opacity-75">
                {/* Glowing laser sweeps */}
                <line x1="15" y1="110" x2="185" y2="110" stroke="#00e5a3" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3 3" />
                {/* Overlay diagnostic boxes */}
                <rect x="63" y="70" width="74" height="90" rx="6" stroke="#00e5a3" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                <text x="140" y="80" fill="#00e5a3" fontSize="6" fontFamily="monospace">TARGET_LOCK</text>
                <text x="140" y="88" fill="#00e5a3" fontSize="5" fontFamily="monospace">X: 200 • Y: 110</text>
              </g>
            )}
          </svg>
        </div>

        {/* 3. LAYER: MATH INTERACTIVE CHIP-FIRING GRAPH (Overlaid in Math Mode) */}
        {visualMode === "math" && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 pointer-events-auto">
            <div className="bg-black/80 border border-amber-500/20 rounded-xl p-2 text-[9px] font-mono text-amber-300">
              <span className="font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Divisor Theory Simulator
              </span>
              <p className="text-zinc-400 mt-0.5">Click vertices with &gt;=2 chips to fire!</p>
              <p className="text-amber-500 font-bold mt-1">Total Fired: {firingCount}</p>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative w-full h-[190px] mt-4">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Edges */}
                <line x1="40" y1="30" x2="160" y2="30" stroke="#ffcc00" strokeWidth="1.5" strokeDasharray="2 3" />
                <line x1="40" y1="30" x2="100" y2="110" stroke="#ffcc00" strokeWidth="1.5" strokeDasharray="2 3" />
                <line x1="160" y1="30" x2="100" y2="110" stroke="#ffcc00" strokeWidth="1.5" strokeDasharray="2 3" />
                <line x1="100" y1="110" x2="100" y2="180" stroke="#ffcc00" strokeWidth="2" />

                {/* Nodes */}
                {graphNodes.map((node) => {
                  const canFire = node.chips >= (node.id === 3 ? 3 : node.id === 4 ? 1 : 2);
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => handleFireNode(node.id)}
                    >
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={16}
                        className={`transition-colors duration-250 ${
                          canFire 
                            ? "fill-amber-500/30 stroke-amber-400 hover:fill-amber-500/50" 
                            : "fill-black/90 stroke-zinc-700 hover:stroke-zinc-500"
                        }`}
                        strokeWidth="2"
                      />
                      {/* Node index */}
                      <text
                        x={node.cx}
                        y={node.cy - 3}
                        textAnchor="middle"
                        fill="#a1a1aa"
                        fontSize="7"
                        fontFamily="monospace"
                        className="font-semibold pointer-events-none"
                      >
                        {node.label}
                      </text>
                      {/* Chips counter */}
                      <text
                        x={node.cx}
                        y={node.cy + 7}
                        textAnchor="middle"
                        fill={canFire ? "#fbbf24" : "#ffffff"}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="pointer-events-none"
                      >
                        {node.chips} ●
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setGraphNodes([
                  { id: 1, cx: 40, cy: 30, chips: 2, label: "v1" },
                  { id: 2, cx: 160, cy: 30, chips: 1, label: "v2" },
                  { id: 3, cx: 100, cy: 110, chips: 0, label: "v3" },
                  { id: 4, cx: 100, cy: 180, chips: 3, label: "v4" },
                ]);
                setFiringCount(0);
              }}
              className="py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[9px] font-mono text-amber-400 font-bold tracking-wider uppercase transition-all mt-1"
            >
              Reset Chips
            </button>
          </div>
        )}

        {/* 4. LAYER: SYSTEMS MODE INSTRUCTION STREAM HUD */}
        {visualMode === "systems" && (
          <div className="absolute inset-x-4 bottom-14 z-20 pointer-events-none" style={{ transform: "translateZ(30px)" }}>
            <div className="bg-black/85 border border-[#00e5a3]/20 rounded-2xl p-3 font-mono text-[9px] text-[#00e5a3] space-y-1">
              <div className="flex justify-between border-b border-[#00e5a3]/20 pb-1 mb-1">
                <span className="font-bold flex items-center gap-1 text-[10px]">
                  <Database className="w-3.5 h-3.5 text-[#00e5a3]" />
                  REG_MONITOR
                </span>
                <span className="opacity-65">CLK: OK</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-400">
                <div>PC: <span className="text-white font-bold">{sysRegisters.PC}</span></div>
                <div>SP: <span className="text-white">{sysRegisters.SP}</span></div>
                <div>R1: <span className="text-white">{sysRegisters.R1}</span></div>
                <div>R2: <span className="text-white">{sysRegisters.R2}</span></div>
              </div>
              <div className="border-t border-[#00e5a3]/10 pt-1 mt-1 text-[8px] text-emerald-500 opacity-80 leading-tight space-y-0.5">
                {sysLogs.map((log, idx) => (
                  <p key={idx} className="truncate">{log}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. LAYER: FLOATING TAGS (INTERACTIVE TEXTS ON HOVER) */}
        <div
          className="absolute bottom-4 inset-x-4 flex justify-between items-center bg-black/75 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md z-30 transition-all duration-300 hover:border-williams-gold/30"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="flex items-center space-x-2">
            <span className={`w-1.5 h-1.5 rounded-full ${visualMode === 'systems' ? 'bg-[#00e5a3] animate-ping' : visualMode === 'math' ? 'bg-amber-400' : 'bg-williams-gold'}`} />
            <span className="font-mono text-[9px] font-bold text-white uppercase tracking-wider">
              {visualMode === "systems" ? "VM-Thread Loaded" : visualMode === "math" ? "Divisor Divac-G" : "Prismatic Profile"}
            </span>
          </div>
          <span className="font-mono text-[8px] text-williams-gold bg-williams-purple/40 border border-williams-gold/20 px-2 py-0.5 rounded uppercase">
            {visualMode === "systems" ? "ASM // C" : visualMode === "math" ? "REU Graph" : "Classic"}
          </span>
        </div>

      </div>
    </div>
  );
}
