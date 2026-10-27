import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PHOTOS_DATA } from "../data";

const VISIBLE_ON_DESKTOP = 3;

export default function PhotoGallery() {
  const [index, setIndex] = useState(0);
  const total = PHOTOS_DATA.length;

  const go = (dir: 1 | -1) => {
    setIndex((prev) => (prev + dir + total) % total);
  };

  const visible = Array.from({ length: VISIBLE_ON_DESKTOP }, (_, i) => PHOTOS_DATA[(index + i) % total]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-cream-card-sub border-2 border-cream-border px-4 py-10 sm:px-8">
        <div className="hidden md:grid grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((photo, slot) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`relative rounded-2xl overflow-hidden shadow-lg border border-cream-border bg-cream-card ${
                  slot === 1 ? "md:scale-105 md:z-10" : "opacity-80"
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-semibold">{photo.caption}</p>
                  <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {photo.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile: single photo slide */}
        <div className="md:hidden relative rounded-2xl overflow-hidden shadow-lg border border-cream-border bg-cream-card">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={PHOTOS_DATA[index].id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={PHOTOS_DATA[index].src}
                alt={PHOTOS_DATA[index].caption}
                loading="lazy"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-semibold">{PHOTOS_DATA[index].caption}</p>
                <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {PHOTOS_DATA[index].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
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
