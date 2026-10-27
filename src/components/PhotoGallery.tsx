import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { PHOTOS_DATA } from "../data";

const SPREAD = [-2, -1, 0, 1, 2] as const;

function cardStyle(offset: number) {
  const abs = Math.abs(offset);
  return {
    transform: `translateX(${offset * 58}%) translateZ(${-abs * 160}px) rotateY(${offset * -32}deg) scale(${1 - abs * 0.18})`,
    zIndex: 10 - abs,
    opacity: abs > 2 ? 0 : 1 - abs * 0.22
  };
}

export default function PhotoGallery() {
  const [index, setIndex] = useState(0);
  const total = PHOTOS_DATA.length;

  const go = (dir: 1 | -1) => {
    setIndex((prev) => (prev + dir + total) % total);
  };

  const photoAt = (offset: number) => PHOTOS_DATA[(index + offset + total * 2) % total];

  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-3xl bg-cream-card-sub border-2 border-cream-border py-12 px-4"
        style={{ perspective: "1400px" }}
      >
        <div className="relative h-72 sm:h-80" style={{ transformStyle: "preserve-3d" }}>
          {SPREAD.map((offset) => {
            const photo = photoAt(offset);
            const style = cardStyle(offset);
            return (
              <motion.div
                key={`${index}-${offset}`}
                className="absolute left-1/2 top-0 -ml-[38%] sm:-ml-[26%] w-[76%] sm:w-[52%] h-full rounded-[2rem] overflow-hidden shadow-2xl border border-cream-border bg-cream-card"
                animate={style}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="w-10 h-10 rounded-full border-2 border-cream-border bg-cream-card flex items-center justify-center text-charcoal hover:border-tufts-blue hover:text-tufts-blue transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-charcoal-light">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => go(1)}
          aria-label="Next photo"
          className="w-10 h-10 rounded-full border-2 border-cream-border bg-cream-card flex items-center justify-center text-charcoal hover:border-tufts-blue hover:text-tufts-blue transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
