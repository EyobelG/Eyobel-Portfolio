import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface CertificateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  issuer?: string;
}

export default function CertificateViewer({ isOpen, onClose, pdfUrl, title, issuer }: CertificateViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setZoom(100);
    setRotation(0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl h-[85vh] bg-cream-card border-2 border-cream-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header Toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-cream-border bg-cream-card-sub/60 flex-wrap">
              <div className="min-w-0">
                <h4 className="font-serif text-sm sm:text-base font-bold text-charcoal truncate">{title}</h4>
                {issuer && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-light">{issuer}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="p-2 rounded-lg hover:bg-cream-card text-charcoal-light hover:text-charcoal border border-transparent hover:border-cream-border transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[10px] text-charcoal-light w-10 text-center select-none">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(200, z + 25))}
                  className="p-2 rounded-lg hover:bg-cream-card text-charcoal-light hover:text-charcoal border border-transparent hover:border-cream-border transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-lg hover:bg-cream-card text-charcoal-light hover:text-charcoal border border-transparent hover:border-cream-border transition-all"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={pdfUrl}
                  download
                  className="p-2 rounded-lg hover:bg-cream-card text-charcoal-light hover:text-charcoal border border-transparent hover:border-cream-border transition-all"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-cream-card text-charcoal-light hover:text-charcoal border border-transparent hover:border-cream-border transition-all"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-charcoal-light hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PDF Canvas */}
            <div className="flex-1 overflow-auto bg-zinc-900/90 flex items-start justify-center p-4 sm:p-6">
              <div
                className="transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden bg-white"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                  width: "min(100%, 800px)",
                  aspectRatio: "1.294",
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title={title}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
