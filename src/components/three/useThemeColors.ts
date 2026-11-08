import { useEffect, useState } from "react";

export interface ThemeColors {
  purple: string;
  purpleLight: string;
  gold: string;
  goldLight: string;
  blue: string;
}

function readColors(): ThemeColors {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    purple: get("--williams-purple", "#8b5cf6"),
    purpleLight: get("--williams-purple-light", "#a78bfa"),
    gold: get("--williams-gold", "#fbbf24"),
    goldLight: get("--williams-gold-light", "#fde047"),
    blue: "#3e8ede"
  };
}

/** Tracks the live accent/theme CSS variables so WebGL scenes recolor with the picker. */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(() =>
    typeof document !== "undefined" ? readColors() : { purple: "#8b5cf6", purpleLight: "#a78bfa", gold: "#fbbf24", goldLight: "#fde047", blue: "#3e8ede" }
  );

  useEffect(() => {
    const update = () => setColors(readColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-accent"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
