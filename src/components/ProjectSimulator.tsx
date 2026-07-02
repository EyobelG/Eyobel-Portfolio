import React, { useState, useEffect } from "react";
import { Terminal, Cpu, Play, Square, RotateCcw, ArrowRight, CornerDownLeft, ShieldAlert, CheckCircle2, Sliders, Layers, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectSimulatorProps {
  projectId: string;
}

export default function ProjectSimulator({ projectId }: ProjectSimulatorProps) {
  // General diagnostics simulation (fallback)
  const [valgrindLog, setValgrindLog] = useState<string[]>([]);
  const [generalProgress, setGeneralProgress] = useState(0);

  // 1. UMASM / RPN Calculator State (proj-7)
  const [rpnStack, setRpnStack] = useState<number[]>([12, 5]);
  const [rpnInput, setRpnInput] = useState<string>("");
  const [rpnLogs, setRpnLogs] = useState<string[]>([
    "// UMASM RPN Interpreter v2.05-Turing",
    "// Custom Macro-Assembly Compiled Successfully",
    "Stack initialized with baseline coordinates."
  ]);

  // 2. Universal Machine State (proj-1)
  const [umRegisters, setUmRegisters] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [umPC, setUmPC] = useState<number>(0);
  const [umOutput, setUmOutput] = useState<string>("");
  const [umIsRunning, setUmIsRunning] = useState<boolean>(false);
  const [umLogs, setUmLogs] = useState<string[]>([]);

  // 3. Arith Image Compressor State (proj-3)
  const [arithRatio, setArithRatio] = useState<number>(3);
  const [arithSubsampling, setArithSubsampling] = useState<string>("4:2:0");
  const [arithMode, setArithMode] = useState<"original" | "quantized" | "frequency">("original");

  // 4. Binary Bomb State (proj-9)
  const [bombPhase, setBombPhase] = useState<number>(1);
  const [bombInput, setBombInput] = useState<string>("");
  const [bombStatus, setBombStatus] = useState<"active" | "defused" | "exploded">("active");
  const [bombLogs, setBombLogs] = useState<string[]>([
    "Initializing binary target...",
    "WARNING: Anti-tamper active. Entering incorrect passwords will trigger explosion.",
    "GDB attached. Breakpoint 1 set at phase_1()."
  ]);

  // 5. Metro Transit State (proj-8)
  const [transitStation, setTransitStation] = useState<string>("Harvard Sq");
  const [transitQueue, setTransitQueue] = useState<string[]>(["P1", "P2", "P3", "P4"]);
  const [transitMetrics, setTransitMetrics] = useState({ flow: 45, delayed: false });

  // Reset helper
  const handleReset = () => {
    setRpnStack([12, 5]);
    setRpnInput("");
    setUmRegisters([0, 0, 0, 0, 0, 0, 0, 0]);
    setUmPC(0);
    setUmOutput("");
    setUmIsRunning(false);
    setArithRatio(3);
    setArithSubsampling("4:2:0");
    setArithMode("original");
    setBombPhase(1);
    setBombInput("");
    setBombStatus("active");
    setBombLogs([
      "Initializing binary target...",
      "WARNING: Anti-tamper active. Entering incorrect passwords will trigger explosion.",
      "GDB attached. Breakpoint 1 set at phase_1()."
    ]);
  };

  // Automated generic logs simulation on load
  useEffect(() => {
    let currentLogs = [
      "// Loading low-level diagnostics suite for " + projectId,
      "Allocating segment 0 (code instructions)... SUCCESS",
      "Binding instruction register pointer [PC=0x00]"
    ];
    setValgrindLog(currentLogs);

    const interval = setInterval(() => {
      setGeneralProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (generalProgress === 25) {
      setValgrindLog(prev => [...prev, "Valgrind: Memcheck initialized."]);
    } else if (generalProgress === 50) {
      setValgrindLog(prev => [...prev, "Valgrind: Heap summary - 0 blocks leaks found."]);
    } else if (generalProgress === 75) {
      setValgrindLog(prev => [...prev, "Optimization pass: Bitwise replacement vector active."]);
    } else if (generalProgress === 100) {
      setValgrindLog(prev => [...prev, "== SUCCESS == Artifact integrity verified."]);
    }
  }, [generalProgress]);

  // RPN Calculator Handlers
  const handleRpnKeyPress = (char: string) => {
    if (char === "Enter") {
      const num = parseFloat(rpnInput);
      if (!isNaN(num)) {
        setRpnStack(prev => [...prev, num]);
        setRpnLogs(prev => [...prev, `PUSH ${num}`]);
        setRpnInput("");
      }
    } else if (["+", "-", "*", "/"].includes(char)) {
      if (rpnStack.length < 2) {
        setRpnLogs(prev => [...prev, "ERROR: Stack underflow (requires 2 parameters)"]);
        return;
      }
      const b = rpnStack[rpnStack.length - 1];
      const a = rpnStack[rpnStack.length - 2];
      let res = 0;
      if (char === "+") res = a + b;
      if (char === "-") res = a - b;
      if (char === "*") res = a * b;
      if (char === "/") res = b !== 0 ? a / b : 0;

      setRpnStack(prev => [...prev.slice(0, -2), res]);
      setRpnLogs(prev => [...prev, `EXECUTE ${char} (${a}, ${b}) -> ${res}`]);
    } else if (char === "FAC") {
      // Custom factoral macro assembly demo
      setRpnLogs(prev => [...prev, "RUN MACRO: Recursive Factorial Assembly Demo"]);
      let startNum = rpnStack[rpnStack.length - 1] || 5;
      if (startNum > 8) startNum = 8; // prevent crash
      let fact = 1;
      for (let i = 1; i <= startNum; i++) fact *= i;
      setRpnStack(prev => [...prev, fact]);
      setRpnLogs(prev => [
        ...prev,
        `[PC:0x0f] Stack Frame Allocated for FAC(${startNum})`,
        `[PC:0x12] Recursion deep-stack base reached`,
        `[PC:0x18] Freeing local frame coordinates`,
        `RESULT: FAC(${startNum}) = ${fact}`
      ]);
    } else if (char === "CLR") {
      setRpnStack([]);
      setRpnLogs(prev => [...prev, "STACK CLEARED"]);
    }
  };

  // Universal Machine Step-by-Step Emulator
  const umInstructions = [
    { op: "LUI", args: "R1, 72", desc: "Load 'H' into R1" },
    { op: "LUI", args: "R2, 101", desc: "Load 'e' into R2" },
    { op: "LUI", args: "R3, 108", desc: "Load 'l' into R3" },
    { op: "LUI", args: "R4, 111", desc: "Load 'o' into R4" },
    { op: "OUT", args: "R1", desc: "Console output R1" },
    { op: "OUT", args: "R2", desc: "Console output R2" },
    { op: "OUT", args: "R3", desc: "Console output R3" },
    { op: "OUT", args: "R3", desc: "Console output R3" },
    { op: "OUT", args: "R4", desc: "Console output R4" }
  ];

  const handleUmStep = () => {
    if (umPC >= umInstructions.length) {
      setUmPC(0);
      setUmOutput("");
      return;
    }
    const inst = umInstructions[umPC];
    const newRegs = [...umRegisters];
    let newChar = "";

    if (umPC === 0) newRegs[1] = 72;
    if (umPC === 1) newRegs[2] = 101;
    if (umPC === 2) newRegs[3] = 108;
    if (umPC === 3) newRegs[4] = 111;
    if (umPC === 4) newChar = String.fromCharCode(umRegisters[1] || 72);
    if (umPC === 5) newChar = String.fromCharCode(umRegisters[2] || 101);
    if (umPC === 6) newChar = String.fromCharCode(umRegisters[3] || 108);
    if (umPC === 7) newChar = String.fromCharCode(umRegisters[3] || 108);
    if (umPC === 8) newChar = String.fromCharCode(umRegisters[4] || 111);

    setUmRegisters(newRegs);
    if (newChar) setUmOutput(prev => prev + newChar);
    setUmPC(prev => prev + 1);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (umIsRunning) {
      timer = setInterval(() => {
        setUmPC(prevPC => {
          if (prevPC >= umInstructions.length) {
            setUmIsRunning(false);
            return prevPC;
          }
          // Do calculation side-effect safely inside callback state
          const inst = umInstructions[prevPC];
          setUmRegisters(regs => {
            const r = [...regs];
            if (prevPC === 0) r[1] = 72;
            if (prevPC === 1) r[2] = 101;
            if (prevPC === 2) r[3] = 108;
            if (prevPC === 3) r[4] = 111;
            return r;
          });
          
          if (prevPC >= 4 && prevPC <= 8) {
            const regMap = [1, 2, 3, 3, 4];
            const regIdx = regMap[prevPC - 4];
            setUmOutput(out => out + String.fromCharCode(umRegisters[regIdx] || [72, 101, 108, 108, 111][prevPC - 4]));
          }
          return prevPC + 1;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [umIsRunning, umRegisters]);

  // Binary Bomb Defusing logic
  const handleBombSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = bombInput.trim().toLowerCase();
    
    if (bombPhase === 1) {
      if (cleaned === "williams_gold") {
        setBombPhase(2);
        setBombInput("");
        setBombLogs(prev => [
          ...prev,
          "✔ PHASE 1 PASSED: Password accepted.",
          "GDB Breakpoint 2 reached: phase_2().",
          "Instruction: enter the next 6 numbers in the series. Rule: n[i] = n[i-1] * 2. Start is 3."
        ]);
      } else {
        setBombStatus("exploded");
        setBombLogs(prev => [
          ...prev,
          `❌ EXPLOSION TRIGGERED: Incorrect password '${cleaned}'.`,
          "Defusing failed. Reset to try again."
        ]);
      }
    } else if (bombPhase === 2) {
      if (cleaned === "3 6 12 24 48 96") {
        setBombPhase(3);
        setBombInput("");
        setBombStatus("defused");
        setBombLogs(prev => [
          ...prev,
          "✔ PHASE 2 PASSED: Numerical series validated.",
          "✔ BOMB FULLY DEFUSED! You successfully analyzed assembly branches and control flow offsets."
        ]);
      } else {
        setBombStatus("exploded");
        setBombLogs(prev => [
          ...prev,
          `❌ EXPLOSION TRIGGERED: Incorrect sequence '${cleaned}'.`,
          "Defusing failed. Reset to try again."
        ]);
      }
    }
  };

  return (
    <div 
      className="space-y-4 border border-white/10 bg-[#121212] p-5 rounded-2xl shadow-xl text-white"
      style={{
        ['--williams-purple' as any]: '#8b5cf6',
        ['--williams-purple-light' as any]: '#a78bfa',
        ['--williams-purple-dark' as any]: '#4c1d95',
        ['--williams-gold' as any]: '#fbbf24',
        ['--williams-gold-light' as any]: '#fde047',
        ['--williams-gold-dark' as any]: '#d97706',
        ['--border-color' as any]: 'rgba(255, 255, 255, 0.08)',
        ['--border-strong' as any]: 'rgba(255, 255, 255, 0.15)',
        ['--text-color' as any]: '#ffffff',
        ['--text-light-color' as any]: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-williams-gold animate-pulse" />
          <span className="font-mono text-xs text-white uppercase font-bold tracking-wider">
            Interactive Academic Sandbox
          </span>
        </div>
        <button
          onClick={handleReset}
          className="text-[10px] font-mono text-white/55 hover:text-williams-gold flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Demo
        </button>
      </div>

      {/* 1. UMASM RPN CALCULATOR EMULATOR */}
      {projectId === "proj-7" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block font-semibold">
              Live Stack & Virtual Registers
            </span>
            <div className="bg-[#080808] border border-white/10 rounded-xl p-3 h-[200px] flex flex-col justify-between font-mono">
              <div className="space-y-1 overflow-y-auto max-h-[140px] flex-1 flex flex-col justify-end">
                {rpnStack.length === 0 ? (
                  <p className="text-zinc-600 text-xs text-center pb-8 italic">[ Stack Empty ]</p>
                ) : (
                  rpnStack.map((val, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-emerald-400 px-2 py-1 bg-white/5 border border-white/5 rounded">
                      <span className="text-zinc-600 text-[10px]">Index {rpnStack.length - 1 - idx}:</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 items-center border-t border-white/10 pt-2">
                <input
                  type="text"
                  value={rpnInput}
                  onChange={(e) => setRpnInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRpnKeyPress("Enter")}
                  placeholder="Type number & press Enter"
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-williams-gold flex-1"
                />
                <button
                  onClick={() => handleRpnKeyPress("Enter")}
                  className="p-1 bg-williams-purple text-williams-gold rounded hover:bg-williams-purple-light"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {["+", "-", "*", "/"].map((op) => (
                <button
                  key={op}
                  onClick={() => handleRpnKeyPress(op)}
                  className="p-2 bg-white/5 hover:bg-williams-purple/30 hover:text-williams-gold rounded text-xs font-mono text-white border border-white/10"
                >
                  {op}
                </button>
              ))}
              <button
                onClick={() => handleRpnKeyPress("FAC")}
                className="col-span-2 p-2 bg-williams-purple/20 hover:bg-williams-purple/40 hover:text-williams-gold rounded text-xs font-mono text-white border border-williams-gold/20"
                title="Trigger recursive assembly factorial"
              >
                Assemble FAC
              </button>
              <button
                onClick={() => handleRpnKeyPress("CLR")}
                className="col-span-2 p-2 bg-red-950/20 hover:bg-red-950/40 hover:text-red-400 rounded text-xs font-mono text-white border border-red-900/30"
              >
                CLR
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block font-semibold">
              Compiler & Execution Logs
            </span>
            <div className="bg-black/95 text-[11px] font-mono p-3 rounded-xl border border-white/10 h-[240px] overflow-y-auto space-y-1 text-zinc-400">
              {rpnLogs.map((log, idx) => (
                <p key={idx} className={log.startsWith("//") ? "text-zinc-600" : log.startsWith("RESULT") || log.startsWith("✔") ? "text-williams-gold font-bold" : "text-emerald-400"}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. UNIVERSAL MACHINE ASSEMBLY PIPELINE (proj-1) */}
      {projectId === "proj-1" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {umRegisters.map((val, idx) => (
              <div key={idx} className="bg-black/50 border border-white/10 p-2 rounded-xl text-center font-mono">
                <span className="text-[9px] text-zinc-500 block">REGISTER R{idx}</span>
                <span className="text-sm font-bold text-williams-gold">{val}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Instruction list */}
            <div className="md:col-span-5 bg-black/60 rounded-xl p-3 border border-white/10 h-[200px] overflow-y-auto space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block border-b border-white/5 pb-1 mb-1">
                Instruction Stream
              </span>
              {umInstructions.map((inst, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center text-[10px] font-mono px-2 py-1 rounded ${
                    umPC === idx ? "bg-williams-purple/30 border border-williams-gold/30 text-white" : "text-zinc-500"
                  }`}
                >
                  <span>{idx.toString().padStart(2, "0")}: {inst.op} {inst.args}</span>
                  <span className="text-[9px] opacity-60 italic">{inst.desc}</span>
                </div>
              ))}
            </div>

            {/* Execution Controls & Output */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleUmStep}
                  className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white flex items-center justify-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Step Instruction
                </button>
                <button
                  onClick={() => setUmIsRunning(!umIsRunning)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1 ${
                    umIsRunning
                      ? "bg-amber-500/20 text-williams-gold border border-williams-gold/30"
                      : "bg-williams-purple text-williams-gold hover:bg-williams-purple-light"
                  }`}
                >
                  {umIsRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {umIsRunning ? "Pause Execution" : "Run Assembly"}
                </button>
              </div>

              <div className="bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl border border-white/10 h-[120px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase block pb-1 border-b border-white/5">// Terminal Output Buffer</span>
                  <p className="mt-2 text-sm tracking-widest font-bold">
                    {umOutput ? umOutput : " "}
                    <span className="animate-pulse">_</span>
                  </p>
                </div>
                <span className="text-[9px] text-zinc-600 text-right">
                  PC: {umPC} / {umInstructions.length} • VM-Cycle: OK
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ARITH IMAGE COMPRESSOR & DCT VISUALIZER (proj-3) */}
      {projectId === "proj-3" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold flex justify-between">
                  <span>Compression Level:</span>
                  <span className="text-williams-gold">{arithRatio}:1</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={arithRatio}
                  onChange={(e) => setArithRatio(parseInt(e.target.value))}
                  className="w-full accent-williams-gold bg-white/10 rounded-lg appearance-none h-1.5"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block font-semibold">
                  Chroma Subsampling
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {["4:4:4", "4:2:2", "4:2:0"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setArithSubsampling(sub)}
                      className={`py-1 px-2 text-[10px] font-mono border rounded ${
                        arithSubsampling === sub
                          ? "bg-williams-purple/30 text-williams-gold border-williams-gold/40"
                          : "bg-transparent text-white/60 border-white/10 hover:bg-white/5"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-mono text-[11px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span className="text-white font-bold">1.44 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Compressed:</span>
                  <span className="text-williams-gold font-bold">{(1.44 / arithRatio).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Visual Fidelity:</span>
                  <span className="text-emerald-400 font-bold">
                    {(99.8 - arithRatio * 0.45).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated 8x8 Pixel block DCT projection */}
            <div className="md:col-span-8 bg-[#080808] border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[200px] relative">
              <span className="absolute top-2 left-3 text-[9px] font-mono text-zinc-500 uppercase">
                Simulated 8x8 DCT Quantization Grid
              </span>

              <div className="grid grid-cols-8 gap-0.5 w-[160px] h-[160px] border border-white/10 p-1 bg-black rounded-lg">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const r = Math.floor(idx / 8);
                  const c = idx % 8;
                  const factor = (r + c) / 14; // wave frequency gradient
                  // Under compression, pixels drop high frequencies (down/right becomes blocky)
                  const isHighFreq = r + c > (11 - arithRatio);
                  let pixelColor = "bg-[#1b5ca0]";
                  if (arithSubsampling === "4:2:0") {
                    pixelColor = "bg-tufts-blue";
                  }
                  return (
                    <motion.div
                      key={idx}
                      className={`w-full h-full rounded-sm transition-all duration-300 ${
                        isHighFreq 
                          ? "bg-zinc-800 border border-zinc-900 opacity-20" 
                          : pixelColor
                      }`}
                      animate={{
                        scale: isHighFreq ? 0.8 : 1,
                        opacity: isHighFreq ? 0.3 : 0.85
                      }}
                    />
                  );
                })}
              </div>

              <p className="text-[10px] font-mono text-zinc-500 mt-3 text-center">
                Interactive: Adjusting sliders simulates discarding higher-frequency components via DCT and quantization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. BINARY BOMB REVERSE ENGINEERING EXERCISE (proj-9) */}
      {projectId === "proj-9" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-red-400">VIRTUAL SECURITY DETONATOR</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
              Phase {bombPhase} / 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* GDB disassembly window */}
            <div className="md:col-span-7 bg-black text-emerald-400 font-mono p-3 rounded-xl border border-white/10 text-[11px] h-[220px] overflow-y-auto space-y-1.5">
              <div className="border-b border-white/5 pb-1 mb-1 text-zinc-500 flex justify-between items-center">
                <span>(gdb) disassemble phase_{bombPhase}</span>
                <span className="text-[10px] text-amber-300">Breakpoint Active</span>
              </div>
              {bombPhase === 1 ? (
                <>
                  <p className="text-zinc-500">0x000014d0 &lt;+0&gt;:   sub    $0x18,%rsp</p>
                  <p className="text-zinc-500">0x000014d4 &lt;+4&gt;:   mov    %rdi,%rsi</p>
                  <p className="text-cyan-400">0x000014d7 &lt;+7&gt;:   lea    0x12c(%rip),%rdi  # "williams_gold"</p>
                  <p className="text-amber-300">0x000014de &lt;+14&gt;:  callq  0x1030 &lt;strings_not_equal&gt;</p>
                  <p className="text-white font-semibold">0x000014e3 &lt;+19&gt;:  test   %eax,%eax</p>
                  <p className="text-white font-semibold">0x000014e5 &lt;+21&gt;:  je     0x14f0 &lt;phase_passed&gt;</p>
                  <p className="text-red-400">0x000014e7 &lt;+23&gt;:  callq  0x1520 &lt;explode_bomb&gt;</p>
                </>
              ) : (
                <>
                  <p className="text-zinc-500">0x00001550 &lt;+0&gt;:   sub    $0x28,%rsp</p>
                  <p className="text-zinc-500">0x00001554 &lt;+4&gt;:   lea    0x1c(%rsp),%rsi</p>
                  <p className="text-cyan-400">0x00001559 &lt;+9&gt;:   callq  0x10b0 &lt;read_six_numbers&gt;</p>
                  <p className="text-zinc-500">0x0000155e &lt;+14&gt;:  cmpl   $0x3,(%rsp)        # First must be 3</p>
                  <p className="text-zinc-500">0x00001562 &lt;+18&gt;:  jne    0x1590 &lt;explode&gt;</p>
                  <p className="text-amber-300">0x00001564 &lt;+20&gt;:  mov    (%rsp),%eax        # Loop checking doubles</p>
                  <p className="text-cyan-400">0x00001567 &lt;+23&gt;:  add    %eax,%eax          # Multiply by 2</p>
                  <p className="text-white">0x00001569 &lt;+25&gt;:  cmpl   %eax,0x4(%rsp,%rcx,4)</p>
                  <p className="text-red-400">0x0000156d &lt;+29&gt;:  jne    0x1590 &lt;explode_bomb&gt;</p>
                </>
              )}
            </div>

            {/* Input Form & Feedback */}
            <div className="md:col-span-5 space-y-3">
              <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-3 text-center">
                {bombStatus === "exploded" ? (
                  <div className="space-y-2">
                    <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-xs text-red-400 font-mono">💥 BOMB EXPLODED!</p>
                    <p className="text-[10px] text-zinc-500">Underlying machine registers cleared. Reset required.</p>
                  </div>
                ) : bombStatus === "defused" ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-emerald-400 font-mono">✔ SECURITY CLEARANCE OK</p>
                    <p className="text-[10px] text-zinc-500">All memory safety boundaries are fully validated.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBombSubmit} className="space-y-2.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold text-left">
                      {bombPhase === 1 ? "Phase 1 Secret Key Input" : "Phase 2 Numerical Stream"}
                    </span>
                    <input
                      type="text"
                      required
                      value={bombInput}
                      onChange={(e) => setBombInput(e.target.value)}
                      placeholder={bombPhase === 1 ? "Hint: RIP register has a string..." : "e.g. 1 2 4 8 16 32"}
                      className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-red-400"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 font-mono text-xs rounded-lg transition-all"
                    >
                      Step Program Branch
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-black/80 font-mono text-[9px] p-2.5 rounded-lg border border-white/5 space-y-1 text-zinc-500 h-[80px] overflow-y-auto">
                {bombLogs.map((log, idx) => (
                  <p key={idx} className={log.startsWith("✔") ? "text-emerald-400" : log.startsWith("❌") ? "text-red-500" : ""}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GENERAL VALGRIND MEMORY AND PERFORMANCE DIAGNOSTICS (fallback for others) */}
      {projectId !== "proj-1" && projectId !== "proj-3" && projectId !== "proj-7" && projectId !== "proj-9" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block font-semibold">
              Valgrind Memcheck & Compilation Output
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Integrity: {generalProgress}%</span>
          </div>
          <div className="bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl border border-white/10 shadow-lg space-y-1.5 max-h-[180px] overflow-y-auto">
            {valgrindLog.map((log, idx) => (
              <p key={idx} className={log.startsWith("== SUCCESS ==") ? "text-williams-gold font-bold" : log.startsWith("Valgrind:") ? "text-cyan-400" : "text-emerald-500"}>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
