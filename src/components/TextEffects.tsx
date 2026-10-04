import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/* ------------------------------------------------------------------ *
 * Typewriter
 * Types an array of lines sequentially, keeping the final line count
 * mounted at all times so the block never reflows while typing.
 * ------------------------------------------------------------------ */
export function Typewriter({
  lines,
  speed = 42,
  startDelay = 300,
  lineDelay = 260,
  caret = true,
  caretClassName = "",
  onDone,
  className = ""
}: {
  lines: string[];
  speed?: number;
  startDelay?: number;
  lineDelay?: number;
  caret?: boolean;
  caretClassName?: string;
  onDone?: () => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  // Identity of the lines, so a fresh array literal from the parent does not
  // restart the animation on every re-render.
  const key = lines.join("\u0000");
  const total = useMemo(() => lines.reduce((n, l) => n + l.length, 0), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const [count, setCount] = useState(reduced ? total : 0);
  const [done, setDone] = useState(Boolean(reduced));
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduced) {
      doneRef.current?.();
      return;
    }
    let typed = 0;
    let timer: number | undefined;

    const step = () => {
      typed += 1;
      setCount(typed);
      if (typed >= total) {
        setDone(true);
        doneRef.current?.();
        return;
      }
      // Pause a beat at each line break for a natural cadence.
      let consumed = 0;
      let atBreak = false;
      for (const line of linesRef.current) {
        consumed += line.length;
        if (typed === consumed) {
          atBreak = true;
          break;
        }
      }
      timer = window.setTimeout(step, atBreak ? lineDelay : speed);
    };

    timer = window.setTimeout(step, startDelay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, total, speed, startDelay, lineDelay, reduced]);

  // Slice the global character budget across the lines.
  let remaining = count;
  const sliced = lines.map((line) => {
    const take = Math.max(0, Math.min(line.length, remaining));
    remaining -= take;
    return { text: line.slice(0, take), full: line, complete: take >= line.length };
  });
  const activeIndex = sliced.findIndex((l) => !l.complete);

  return (
    <span className={className} data-typing={done ? "done" : "typing"}>
      {sliced.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {/* Invisible full line reserves the final width: no layout jitter. */}
          <span className="relative inline-block align-top">
            <span aria-hidden className="invisible">
              {line.full}
            </span>
            <span className="absolute inset-0 whitespace-pre-wrap text-left">
              {line.text}
              {caret && (activeIndex === i || (activeIndex === -1 && i === lines.length - 1)) && (
                <Caret className={caretClassName} />
              )}
            </span>
          </span>
        </React.Fragment>
      ))}
      <span className="sr-only">{lines.join(" ")}</span>
    </span>
  );
}

export function Caret({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`eg-caret inline-block w-[0.06em] min-w-[2px] translate-y-[0.08em] self-center bg-current align-baseline ${className}`}
      style={{ height: "0.95em" }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * ScrambleText
 * Characters land left-to-right while the un-landed tail keeps
 * shuffling. Triggers on scroll-into-view, or on hover when asked.
 * ------------------------------------------------------------------ */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#%$&";

const shuffle = (text: string, from = 0) => {
  let out = text.slice(0, from);
  for (let i = from; i < text.length; i++) {
    out += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
};

export function ScrambleText({
  text,
  speed = 28,
  revealEvery = 2,
  trigger = "inView",
  delay = 0,
  className = ""
}: {
  text: string;
  /** ms per shuffle frame */
  speed?: number;
  /** frames to wait before locking each character */
  revealEvery?: number;
  trigger?: "inView" | "hover" | "mount";
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [out, setOut] = useState(() => (reduced || trigger === "hover" ? text : shuffle(text)));
  const frame = useRef<number | undefined>(undefined);

  const run = React.useCallback(() => {
    if (reduced) return;
    window.clearInterval(frame.current);
    let f = 0;
    frame.current = window.setInterval(() => {
      const landed = Math.floor(f / revealEvery);
      if (landed >= text.length) {
        window.clearInterval(frame.current);
        setOut(text);
        return;
      }
      setOut(shuffle(text, landed));
      f += 1;
    }, speed);
  }, [text, speed, revealEvery, reduced]);

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (trigger === "hover") return;
    if (trigger === "inView" && !inView) return;
    const t = window.setTimeout(() => runRef.current(), delay);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(frame.current);
    };
  }, [trigger, inView, delay]);

  useEffect(() => () => window.clearInterval(frame.current), []);

  return (
    <span
      ref={ref}
      className={className}
      onMouseEnter={trigger === "hover" ? run : undefined}
      aria-label={text}
    >
      <span aria-hidden>{out}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * BlurWords
 * Word-by-word blur + rise reveal on scroll-into-view.
 * ------------------------------------------------------------------ */
export function BlurWords({
  text,
  delay = 0,
  stagger = 0.035,
  as: Tag = "span",
  trigger = "inView",
  className = ""
}: {
  text: string;
  delay?: number;
  stagger?: number;
  as?: React.ElementType;
  trigger?: "inView" | "mount";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const show = reduced || trigger === "mount" || inView;
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={reduced ? undefined : { opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * ShinyText — a slow specular sweep across the text.
 * ------------------------------------------------------------------ */
export function ShinyText({
  children,
  className = "",
  duration = 4
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <span className={`eg-shine ${className}`} style={{ animationDuration: `${duration}s` }}>
      {children}
    </span>
  );
}
