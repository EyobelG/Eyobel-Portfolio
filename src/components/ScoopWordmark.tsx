import { motion, useReducedMotion } from "motion/react";

/**
 * Real SCOOP wordmark, recreated from website-jade-eta-97.vercel.app (CO2 spelled
 * into the brand name: S-CO-O₂-P). The "2" is the CO2 molecule the whole
 * project exists to account for, so it's the one thing that moves — drifting
 * up and fading like a released bubble, looping.
 */
export default function ScoopWordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const reduce = useReducedMotion();
  const isLg = size === "lg";

  return (
    <span
      role="img"
      aria-label="SCOOP"
      className="inline-flex items-baseline select-none"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize: isLg ? "28px" : "17px",
        letterSpacing: "-0.02em",
        color: "var(--color-charcoal)"
      }}
    >
      S
      <span style={{ color: "#2a7a54" }}>CO</span>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "baseline" }}>
        O
        <motion.sub
          style={{ fontSize: "0.55em", marginLeft: "0.5px" }}
          animate={
            reduce
              ? undefined
              : { y: [0, -5, -5], opacity: [1, 0.15, 1] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 1] }
          }
        >
          2
        </motion.sub>
      </span>
      P
    </span>
  );
}
