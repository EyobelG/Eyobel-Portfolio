import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { PHOTOS_DATA } from "../data";
import type { Photo } from "../types";

const FLIP_MS = 650;

function Page({ photo, className = "" }: { photo: Photo; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-[1.25rem] ${className}`}>
      {photo.type === "video" ? (
        <video src={photo.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
      ) : (
        <img src={photo.src} alt={photo.caption} loading="lazy" draggable={false} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 pt-10">
        <p className="text-white text-sm font-serif font-semibold drop-shadow">{photo.caption}</p>
        <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider mt-0.5">{photo.location}</p>
      </div>
    </div>
  );
}

/** Page-turn book carousel: the outgoing photo flips away on a CSS 3D hinge (like a real page turn) to reveal the next one already sitting underneath. */
export default function PhotoGallery() {
  const total = PHOTOS_DATA.length;
  const [index, setIndex] = useState(0);
  const [flipLeaf, setFlipLeaf] = useState<{ photo: Photo; dir: 1 | -1; key: number } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const flipCounter = useRef(0);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flipLeaf) return;
      const oldPhoto = PHOTOS_DATA[index];
      const newIndex = (index + dir + total) % total;
      flipCounter.current += 1;
      setFlipLeaf({ photo: oldPhoto, dir: dir === 1 ? -1 : 1, key: flipCounter.current });
      setIndex(newIndex);
    },
    [flipLeaf, index, total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = PHOTOS_DATA[index];
  const under1 = PHOTOS_DATA[(index + 1) % total];
  const under2 = PHOTOS_DATA[(index + 2) % total];

  return (
    <div className="space-y-6">
      <div
        className="relative rounded-3xl bg-gradient-to-br from-cream-card-sub to-cream-card border-2 border-cream-border p-6 sm:p-10"
        style={{ perspective: "1800px" }}
      >
        {/* Faux page stack peeking out behind the book, for depth */}
        <div className="absolute inset-6 sm:inset-10 rounded-[1.25rem] bg-cream-card-sub border border-cream-border-strong rotate-[2deg] translate-x-2 translate-y-1 opacity-60 pointer-events-none" />
        <div className="absolute inset-6 sm:inset-10 rounded-[1.25rem] bg-cream-card-sub border border-cream-border-strong rotate-[-1.5deg] -translate-x-1 translate-y-2 opacity-40 pointer-events-none" />

        <div className="relative h-72 sm:h-96 rounded-[1.25rem] overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
          {/* Base layer: the two photos "underneath", always static */}
          <Page photo={under2} className="shadow-lg" />
          <Page photo={under1} className="shadow-xl" />
          <button
            type="button"
            onClick={() => !flipLeaf && setLightboxOpen(true)}
            aria-label={`View ${current.caption} full screen`}
            className="absolute inset-0 group"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Page photo={current} className="shadow-2xl border border-cream-border" />
            <span className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <Maximize2 className="w-4 h-4" />
            </span>
          </button>

          {/* The flipping leaf: the outgoing photo, hinged at the edge it's turning toward */}
          <AnimatePresence>
            {flipLeaf && (
              <Fragment key={flipLeaf.key}>
              <motion.div
                className="absolute inset-0"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: flipLeaf.dir === 1 ? "right center" : "left center"
                }}
                initial={{ rotateY: 0, scaleX: 1 }}
                animate={{ rotateY: flipLeaf.dir === 1 ? -180 : 180, scaleX: [1, 0.84, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: FLIP_MS / 1000, ease: [0.6, 0.02, 0.4, 1], scaleX: { duration: FLIP_MS / 1000, times: [0, 0.5, 1] } }}
                onAnimationComplete={() => setFlipLeaf(null)}
              >
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <Page photo={flipLeaf.photo} className="shadow-2xl" />
                </div>
                <div
                  className="absolute inset-0 rounded-[1.25rem] bg-cream-card-sub border border-cream-border-strong"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div
                    className="absolute inset-y-0 w-10 opacity-40"
                    style={{
                      [flipLeaf.dir === 1 ? "right" : "left"]: 0,
                      background: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)"
                    }}
                  />
                </div>
                {/* Light/shadow sweep near the fold, to sell the paper curl */}
                <motion.div
                  className="absolute inset-0 rounded-[1.25rem] pointer-events-none"
                  style={{
                    backfaceVisibility: "hidden",
                    background:
                      flipLeaf.dir === 1
                        ? "linear-gradient(to left, rgba(0,0,0,0.6), rgba(255,255,255,0.2) 25%, transparent 65%)"
                        : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(255,255,255,0.2) 25%, transparent 65%)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: FLIP_MS / 1000, times: [0, 0.5, 1] }}
                />
              </motion.div>
              {/* Shadow the lifting leaf casts onto the page underneath, near the hinge */}
              <motion.div
                key={`${flipLeaf.key}-cast`}
                className="absolute inset-y-0 w-1/3 rounded-[1.25rem] pointer-events-none"
                style={{
                  [flipLeaf.dir === 1 ? "left" : "right"]: 0,
                  background:
                    flipLeaf.dir === 1
                      ? "linear-gradient(to right, rgba(0,0,0,0.35), transparent)"
                      : "linear-gradient(to left, rgba(0,0,0,0.35), transparent)"
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: FLIP_MS / 1000, times: [0, 0.45, 1] }}
              />
              </Fragment>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Previous photo"
          disabled={!!flipLeaf}
          className="w-10 h-10 rounded-full border-2 border-cream-border bg-cream-card flex items-center justify-center text-charcoal hover:border-tufts-blue hover:text-tufts-blue transition-colors disabled:opacity-40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-charcoal-light tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => go(1)}
          aria-label="Next photo"
          disabled={!!flipLeaf}
          className="w-10 h-10 rounded-full border-2 border-cream-border bg-cream-card flex items-center justify-center text-charcoal hover:border-tufts-blue hover:text-tufts-blue transition-colors disabled:opacity-40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photo={current}
            caption={`${index + 1} / ${total}`}
            onClose={() => setLightboxOpen(false)}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({
  photo,
  caption,
  onClose,
  onPrev,
  onNext
}: {
  photo: Photo;
  caption: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const resetZoom = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  const zoomBy = (delta: number) => setScale((s) => Math.min(4, Math.max(1, +(s + delta).toFixed(2))));

  const onWheel = (e: React.WheelEvent) => {
    if (photo.type === "video") return;
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.25 : -0.25);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {photo.type !== "video" && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 rounded-full px-2 py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => zoomBy(-0.25)}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="p-1.5 rounded-full text-white hover:bg-white/15 disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white text-xs font-mono w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => zoomBy(0.25)}
            disabled={scale >= 4}
            aria-label="Zoom in"
            className="p-1.5 rounded-full text-white hover:bg-white/15 disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          resetZoom();
          onPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          resetZoom();
          onNext();
        }}
        aria-label="Next photo"
        className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-[88vw] max-h-[78vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onDoubleClick={() => (scale > 1 ? resetZoom() : setScale(2.5))}
      >
        {photo.type === "video" ? (
          <video src={photo.src} controls autoPlay playsInline className="max-w-[88vw] max-h-[78vh] rounded-lg" />
        ) : (
          <motion.img
            src={photo.src}
            alt={photo.caption}
            drag={scale > 1}
            dragConstraints={{ left: -400, right: 400, top: -400, bottom: 400 }}
            dragElastic={0.1}
            style={{ x, y, scale, cursor: scale > 1 ? "grab" : "zoom-in" }}
            animate={{ scale }}
            transition={{ duration: 0.25 }}
            onClick={() => scale === 1 && setScale(2.5)}
            className="max-w-[88vw] max-h-[78vh] rounded-lg select-none"
            draggable={false}
          />
        )}
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center px-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-white font-serif text-sm sm:text-base">{photo.caption}</p>
        <p className="text-white/60 text-[10px] font-mono uppercase tracking-wider mt-1">
          {photo.location} · {caption}
        </p>
      </div>
    </motion.div>
  );
}
