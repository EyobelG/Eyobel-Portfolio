import React, { useEffect, useRef } from "react";
import { useThemeColors } from "./three/useThemeColors";

/**
 * Subtle canvas flow-field: particles drift along a sine-based vector field,
 * tinted with the live accent colors. Pauses under prefers-reduced-motion.
 */
export default function FlowFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? canvas.clientWidth;
      height = rect?.height ?? canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      return () => window.removeEventListener("resize", resize);
    }

    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      life: Math.random() * 200
    }));

    const tint = [colors.purple, colors.gold, colors.blue];
    let frame = 0;
    let raf = 0;

    const angleAt = (x: number, y: number, t: number) =>
      Math.sin(x * 0.006 + t * 0.0004) + Math.cos(y * 0.008 - t * 0.0003);

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p, i) => {
        const angle = angleAt(p.x, p.y, frame) * Math.PI;
        p.x += Math.cos(angle) * 0.6;
        p.y += Math.sin(angle) * 0.6;
        p.life -= 1;
        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 150 + Math.random() * 100;
        }
        ctx.fillStyle = tint[i % tint.length];
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
