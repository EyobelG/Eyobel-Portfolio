import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { useThemeColors } from "./three/useThemeColors";

/** Animated node-network backdrop for one section only — kept subtle, low opacity. */
export default function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);
  const colors = useThemeColors();
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const createNet =
      typeof NET === "function"
        ? NET
        : typeof (NET as { default?: unknown })?.default === "function"
        ? (NET as { default: (opts: Record<string, unknown>) => { destroy: () => void } }).default
        : null;

    if (!createNet) return;

    try {
      const threeCompat = { ...THREE, VertexColors: true };
      effectRef.current = createNet({
        el: containerRef.current,
        THREE: threeCompat,
        color: parseInt(colors.blue.replace("#", "0x"), 16),
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        points: 8,
        maxDistance: 20,
        spacing: 18,
        showDots: false,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
      });
    } catch {
      effectRef.current = null;
    }

    return () => {
      try {
        effectRef.current?.destroy();
      } catch {
        // Ignore cleanup errors if WebGL context was already released
      }
      effectRef.current = null;
    };
    // Re-create only when the accent color actually changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.blue, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-35"
    />
  );
}
