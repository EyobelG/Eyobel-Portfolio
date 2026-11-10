import { motion, useReducedMotion } from "motion/react";

/**
 * Real SCOOP wordmark, recreated from website-jade-eta-97.vercel.app (CO2 spelled
 * into the brand name: S-CO-O₂-P). The "2" is the CO2 molecule the whole
 * project exists to account for, so it's the one thing that moves — drifting
 * up and fading like a released bubble, looping.
 */
const FONT_SIZE = { xs: "11px", sm: "17px", lg: "28px" };

export default function ScoopWordmark({
  size = "sm",
  tone = "auto"
}: {
  size?: "xs" | "sm" | "lg";
  /** "auto" follows the page's charcoal token; "dark" is fixed for use on a light tile regardless of site theme. */
  tone?: "auto" | "dark";
}) {
  const reduce = useReducedMotion();

  return (
    <span
      role="img"
      aria-label="SCOOP"
      className="inline-flex items-baseline select-none"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize: FONT_SIZE[size],
        letterSpacing: "-0.02em",
        color: tone === "dark" ? "#0b1f16" : "var(--color-charcoal)"
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
