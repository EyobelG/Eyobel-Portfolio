import React, { useRef, useState } from "react";
import { Project } from "../types";
import { PROJECTS_DATA } from "../data";
import { ExternalLink, Cpu, Database, ChevronRight, X, ArrowRight, Layers, BrainCircuit } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import ProjectSimulator from "./ProjectSimulator";
import ScoopWordmark from "./ScoopWordmark";
import { type ProjectSceneVariant } from "./three/ProjectScene3D";

const ProjectScene3D = React.lazy(() => import("./three/ProjectScene3D"));

/** Each project gets a small bespoke WebGL badge standing in for a generic category icon. */
const PROJECT_SCENE_VARIANT: Record<string, ProjectSceneVariant> = {
  "proj-quantfolio": "orbitRings",
  "proj-scoop-site": "nodeGraph",
  "proj-ml-reading-level": "chipGrid",
  "proj-1": "wireframeCore",
  "proj-2": "chipGrid",
  "proj-3": "cubeGrid",
  "proj-4": "orbitRings",
  "proj-5": "documentScan",
  "proj-6": "cubeGrid",
  "proj-7": "stackBlocks",
  "proj-8": "nodeGraph",
  "proj-9": "wireframeCore",
  "proj-10": "stackBlocks",
  "proj-11": "orbitRings",
  "proj-12": "nodeGraph",
  "proj-13": "documentScan",
  "proj-14": "nodeGraph",
  "proj-16": "citationBeacon",
  "proj-17": "toolRing",
  "proj-18": "gaugeDial",
  "proj-19": "signalShield",
};

/**
 * Spatial Bento card controller:
 * - Cursor-tracked 3D tilt strictly capped at ±8deg (rotateX / rotateY)
 * - Mouse-following radial Liquid Gold border spotlight + subtle glass wash (zero re-renders)
 * - Smooth Z-axis elevation on hover
 */
function useSpatialBentoCard(reduceMotion: boolean | null) {
  const ref = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);
  const spotlightOpacity = useMotionValue(0);

  // Strictly capped at ±8deg with tactile spring damping
  const rotateX = useSpring(useTransform(normY, [0, 1], [8, -8]), {
    stiffness: 260,
    damping: 26,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(normX, [0, 1], [-8, 8]), {
    stiffness: 260,
    damping: 26,
    mass: 0.6,
  });
  const zElevation = useSpring(0, { stiffness: 300, damping: 26 });

  const borderSpotlight = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.95), rgba(124, 58, 237, 0.45) 52%, transparent 80%)`;
  const innerGlassGlow = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.11), rgba(124, 58, 237, 0.04) 45%, transparent 72%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mouseX.set(px);
    mouseY.set(py);
    spotlightOpacity.set(1);

    if (!reduceMotion) {
      normX.set(Math.min(1, Math.max(0, px / rect.width)));
      normY.set(Math.min(1, Math.max(0, py / rect.height)));
    }
  };

  const onMouseEnter = () => {
    spotlightOpacity.set(1);
    if (!reduceMotion) {
      zElevation.set(22);
    }
  };

  const onMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    spotlightOpacity.set(0);
    zElevation.set(0);
  };

  return {
    ref,
    rotateX,
    rotateY,
    zElevation,
    spotlightOpacity,
    borderSpotlight,
    innerGlassGlow,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}

function BentoProjectCard({
  project,
  variants,
  spanClass,
  featured,
  onOpen,
}: {
  key?: string;
  project: Project;
  variants: Variants;
  spanClass: string;
  featured: boolean;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const {
    ref,
    rotateX,
    rotateY,
    zElevation,
    spotlightOpacity,
    borderSpotlight,
    innerGlassGlow,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  } = useSpatialBentoCard(reduceMotion);

  return (
    <div
      className={`${spanClass} h-full`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={ref}
        id={`card-${project.id}`}
        variants={variants}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          z: reduceMotion ? 0 : zElevation,
          transformStyle: "preserve-3d",
        }}
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -6,
                boxShadow:
                  "0 28px 56px -22px rgba(0, 0, 0, 0.78), 0 0 36px -14px rgba(245, 158, 11, 0.28)",
              }
        }
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="group relative h-full cursor-pointer rounded-2xl p-[1px] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-williams-gold"
      >
        {/* Static subtle Obsidian frosted glass perimeter */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 [.light-theme_&]:border-black/10"
        />

        {/* Mouse-following Radial Liquid Gold Border Spotlight */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: borderSpotlight,
            opacity: spotlightOpacity,
          }}
        />

        {/* Inner Frosted Dark-Glass Bento Card Body */}
        <div
          className="relative h-full rounded-[15px] backdrop-blur-xl bg-[#10101A]/80 [.light-theme_&]:bg-white/90 p-6 flex flex-col justify-between overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
          }}
        >
          {/* 1px Top Specular Highlight Rim (catches ambient light + warms to Liquid Gold on hover) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-4 h-px opacity-85 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.34) 30%, rgba(245,158,11,0.55) 50%, rgba(124,58,237,0.4) 70%, transparent 100%)",
            }}
          />

          {/* Mouse-following subtle interior gold specular wash */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[15px] transition-opacity duration-300"
            style={{
              background: innerGlassGlow,
              opacity: spotlightOpacity,
            }}
          />

          {/* Optional Project Screenshot Header */}
          {project.image && (
            <div className={`-mx-6 -mt-6 mb-5 ${featured ? "h-44" : "h-36"} overflow-hidden rounded-t-[15px] border-b border-white/10 [.light-theme_&]:border-black/10 relative`}>
              <img
                src={project.image}
                alt={`${project.title} screenshot`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10101A]/75 via-transparent to-transparent [.light-theme_&]:from-black/20" />
            </div>
          )}

          <div className="relative z-10" style={{ transform: "translateZ(10px)" }}>
            <div className="flex items-center justify-between mb-4">
              {PROJECT_SCENE_VARIANT[project.id] ? (
                <div className="w-12 h-12 -ml-1 rounded-xl border border-williams-purple/25 bg-[#0A0A0F]/70 [.light-theme_&]:bg-williams-purple/5 group-hover:border-williams-gold/50 transition-colors overflow-hidden shadow-inner">
                  <React.Suspense fallback={null}>
                    <ProjectScene3D variant={PROJECT_SCENE_VARIANT[project.id]} size={48} />
                  </React.Suspense>
                </div>
              ) : project.category === "Systems" ? (
                <div className="p-2.5 bg-williams-purple/15 text-williams-purple dark:text-williams-gold rounded-xl border border-williams-purple/30">
                  <Cpu className="w-5 h-5" />
                </div>
              ) : project.category === "Theory/Math" ? (
                <div className="p-2.5 bg-tufts-blue/15 text-tufts-blue rounded-xl border border-tufts-blue/30">
                  <Layers className="w-5 h-5" />
                </div>
              ) : project.category === "Machine Learning" ? (
                <div className="p-2.5 bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-600/30">
                  <BrainCircuit className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2.5 bg-amber-500/10 text-amber-700 dark:text-williams-gold rounded-xl border border-williams-gold/30">
                  <Database className="w-5 h-5" />
                </div>
              )}

              <span className="font-mono text-[10px] tracking-widest text-charcoal-light uppercase font-semibold">
                {project.category}
              </span>
            </div>

            <h4 className={`font-serif ${featured ? "text-2xl" : "text-xl"} text-charcoal font-semibold group-hover:text-williams-purple dark:group-hover:text-williams-gold transition-colors mb-2 leading-snug`}>
              {project.title}
            </h4>
            {project.id === "proj-scoop-site" && (
              <div className="mb-2 -mt-1">
                <ScoopWordmark size="sm" />
              </div>
            )}
            <p className={`text-sm text-charcoal-light leading-relaxed ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
              {project.description}
            </p>
          </div>

          <div
            className="relative z-10 mt-6 pt-4 border-t border-white/10 [.light-theme_&]:border-black/10"
            style={{ transform: "translateZ(6px)" }}
          >
            {/* Clean unboxed typographic metadata stack */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 text-[11px] font-mono text-charcoal-light">
              {project.tech.slice(0, featured ? 4 : 3).map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <span aria-hidden="true" className="opacity-40">·</span>}
                  <span>{t}</span>
                </React.Fragment>
              ))}
              {project.tech.length > (featured ? 4 : 3) && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="text-williams-gold/90">
                    +{project.tech.length - (featured ? 4 : 3)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-mono font-semibold text-williams-purple dark:text-williams-gold group-hover:text-tufts-blue dark:group-hover:text-williams-gold-light transition-colors">
                <span>Inspect Artifact</span>
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
              {project.liveUrl && (
                <span className="font-mono text-[10px] text-charcoal-light/70">Live</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Compute balanced 6-column Bento span per index so every filter category
 * fills desktop rows cleanly with flagship 2-up showcase cards on top.
 */
function getBentoSpan(index: number, total: number): { spanClass: string; featured: boolean } {
  if (total === 1) {
    return { spanClass: "md:col-span-2 lg:col-span-6", featured: true };
  }
  if (total === 2) {
    return { spanClass: "md:col-span-1 lg:col-span-3", featured: true };
  }
  // 23, 11, 5 all satisfy total % 3 === 2 -> Top 2 flagship cards span 3 cols each, remaining divide cleanly into 3-up rows!
  if (total % 3 === 2 && index < 2) {
    return { spanClass: "md:col-span-1 lg:col-span-3", featured: true };
  }
  if (total % 3 === 1 && index === 0) {
    return { spanClass: "md:col-span-2 lg:col-span-6", featured: true };
  }
  return { spanClass: "md:col-span-1 lg:col-span-2", featured: false };
}

export default function ProjectGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const categories = ["All", "Systems", "Theory/Math", "Web Apps", "Machine Learning"];

  const filteredProjects =
    selectedCategory === "All"
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
  };

  return (
    <div className="space-y-8" id="projects-component-container">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-cream-border">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`tab-project-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-mono rounded-lg tracking-wider uppercase transition-all duration-200 whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? "bg-williams-purple text-white dark:text-williams-gold font-semibold border border-williams-gold/50 shadow-[0_0_20px_-6px_rgba(124,58,237,0.75)]"
                : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub bg-transparent border border-transparent"
            }`}
          >
            {cat === "All" ? "All Artifacts" : cat === "Systems" ? "Systems (C/C++)" : cat}
          </button>
        ))}
      </div>

      {/* 2026 Spatial Bento Projects Grid */}
      <motion.div
        key={selectedCategory}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 auto-rows-fr"
      >
        {filteredProjects.map((project, idx) => {
          const { spanClass, featured } = getBentoSpan(idx, filteredProjects.length);
          return (
            <BentoProjectCard
              key={project.id}
              project={project}
              variants={cardVariants}
              spanClass={spanClass}
              featured={featured}
              onOpen={() => setActiveProject(project)}
            />
          );
        })}
      </motion.div>

      {/* Expanded Project Modal Drawer */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden" id="project-detail-drawer">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-cream-bg border-l border-cream-border shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 lg:p-8 border-b border-cream-border bg-cream-card flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-tufts-blue-light font-bold">
                    {activeProject.category} / Technical Artifact
                  </span>
                  <h3 className="font-serif text-2xl lg:text-3xl text-charcoal font-bold tracking-tight mt-1">
                    {activeProject.title}
                  </h3>
                  {activeProject.id === "proj-scoop-site" && (
                    <div className="mt-2">
                      <ScoopWordmark size="lg" />
                    </div>
                  )}
                </div>
                <button
                  id="btn-close-drawer"
                  onClick={() => setActiveProject(null)}
                  className="p-2 rounded-full border border-cream-border hover:bg-cream-card-sub text-charcoal transition-all"
                  aria-label="Close project details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 lg:p-8 flex-1 space-y-8 overflow-y-auto">
                {activeProject.image && (
                  <div className="rounded-xl overflow-hidden border border-cream-border shadow-md">
                    <img
                      src={activeProject.image}
                      alt={`${activeProject.title} screenshot`}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Scope Summary</h5>
                  <p className="text-base text-charcoal leading-relaxed">{activeProject.description}</p>
                </div>

                {/* Tech Stack */}
                <div className="space-y-3">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Engineered With</h5>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-williams-gold">
                    {activeProject.tech.map((t, i) => (
                      <React.Fragment key={t}>
                        {i > 0 && <span aria-hidden="true" className="text-charcoal-light/40">·</span>}
                        <span>{t}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Bullets & Implementation Details */}
                <div className="space-y-4">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Engineering Highlights</h5>
                  <ul className="space-y-3">
                    {activeProject.details.map((detail, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start text-sm leading-relaxed text-charcoal-light"
                      >
                        <ChevronRight className="w-4 h-4 text-williams-gold mr-2 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Impact Statement */}
                {activeProject.impact && (
                  <div className="p-5 bg-williams-purple/10 border border-williams-purple/25 rounded-xl space-y-1">
                    <h6 className="font-serif text-sm font-semibold text-williams-gold">Impact & Performance Outcomes</h6>
                    <p className="text-sm text-charcoal-light leading-relaxed">{activeProject.impact}</p>
                  </div>
                )}

                {/* Custom System Simulation Render inside Detail */}
                <ProjectSimulator projectId={activeProject.id} />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-cream-border bg-cream-card flex items-center justify-between gap-3">
                {activeProject.github || activeProject.marketplace || activeProject.liveUrl ? (
                  <div className="flex items-center gap-4">
                    {activeProject.liveUrl && (
                      <a
                        href={activeProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-tufts-blue-light hover:text-williams-gold font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Launch Live App
                      </a>
                    )}
                    {activeProject.marketplace && (
                      <a
                        href={activeProject.marketplace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-tufts-blue-light hover:text-williams-gold font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View on Marketplace
                      </a>
                    )}
                    {activeProject.github && (
                      <a
                        href={activeProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-tufts-blue-light hover:text-williams-gold font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Source
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-charcoal-light font-mono">Medford, MA • Tufts University</span>
                )}
                <button
                  id="btn-back-grid"
                  onClick={() => setActiveProject(null)}
                  className="px-5 py-2.5 bg-williams-purple hover:bg-williams-purple-light text-white font-mono text-xs font-semibold rounded-lg shadow-sm border border-williams-gold/30 transition-all"
                >
                  Return to Grid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
