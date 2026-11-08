import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette } from "lucide-react";

const ACCENTS: { id: string; label: string; swatch: [string, string] }[] = [
  { id: "violet", label: "Violet / Gold", swatch: ["#8b5cf6", "#fbbf24"] },
  { id: "cyan", label: "Cyan / Magenta", swatch: ["#06b6d4", "#e879f9"] },
  { id: "emerald", label: "Emerald / Amber", swatch: ["#10b981", "#facc15"] },
  { id: "crimson", label: "Crimson / Orange", swatch: ["#e11d48", "#fb923c"] }
];

/** Small accent-color swatch picker; persists choice via [data-accent] on <html>. */
export default function AccentPicker() {
  const [accent, setAccent] = useState<string>(() => localStorage.getItem("eyobel_accent") || "violet");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accent === "violet") {
      document.documentElement.removeAttribute("data-accent");
    } else {
      document.documentElement.setAttribute("data-accent", accent);
    }
    localStorage.setItem("eyobel_accent", accent);
  }, [accent]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        id="btn-accent-picker"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.12, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        className="p-2.5 rounded-full bg-zinc-200/40 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/15 text-charcoal transition-colors border border-cream-border cursor-pointer flex items-center justify-center"
        title="Accent color"
      >
        <Palette className="w-4 h-4" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-cream-card border border-cream-border rounded-xl shadow-xl p-2 flex gap-2"
          >
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                id={`btn-accent-${a.id}`}
                onClick={() => {
                  setAccent(a.id);
                  setOpen(false);
                }}
                title={a.label}
                className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                  accent === a.id ? "border-charcoal scale-110" : "border-cream-border"
                }`}
                style={{ background: `linear-gradient(135deg, ${a.swatch[0]} 50%, ${a.swatch[1]} 50%)` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
