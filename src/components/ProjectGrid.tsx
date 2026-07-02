import React, { useState } from "react";
import { Project } from "../types";
import { PROJECTS_DATA } from "../data";
import { ExternalLink, Terminal, Cpu, Database, ChevronRight, X, ArrowRight, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProjectSimulator from "./ProjectSimulator";

export default function ProjectGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const categories = ["All", "Systems", "Theory/Math", "Web Apps"];

  const filteredProjects = selectedCategory === "All"
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="space-y-8" id="projects-component-container">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-cream-border">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`tab-project-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-mono rounded-full tracking-wider uppercase transition-all duration-300 ${
              selectedCategory === cat
                ? "bg-williams-purple text-white dark:text-williams-gold font-semibold border-2 border-williams-gold/40 shadow-md"
                : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub bg-transparent"
            }`}
          >
            {cat === "All" ? "All Artifacts" : cat === "Systems" ? "Systems (C/C++)" : cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            id={`card-${project.id}`}
            variants={cardVariants}
            whileHover={{ y: -6, boxShadow: "0 10px 30px -15px rgba(255,204,0,0.15)" }}
            onClick={() => setActiveProject(project)}
            className="group cursor-pointer bg-cream-card border-2 border-cream-border rounded-2xl p-6 transition-all flex flex-col justify-between hover:border-williams-gold/40 hover:bg-cream-card-sub relative overflow-hidden shadow-lg"
          >
            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cream-card-sub to-transparent opacity-40 group-hover:from-williams-gold/10 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                {project.category === "Systems" ? (
                  <div className="p-2 bg-williams-purple/20 text-williams-purple dark:text-williams-gold rounded-lg border border-williams-purple-light/30">
                    <Cpu className="w-5 h-5" />
                  </div>
                ) : project.category === "Theory/Math" ? (
                  <div className="p-2 bg-tufts-blue/20 text-tufts-blue rounded-lg border border-tufts-blue-dark/30">
                    <Layers className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-williams-gold rounded-lg border border-williams-gold-dark/30">
                    <Database className="w-5 h-5" />
                  </div>
                )}
                <span className="font-mono text-[10px] tracking-widest text-charcoal-light uppercase font-semibold">
                  {project.category}
                </span>
              </div>

              <h4 className="font-serif text-xl text-charcoal font-semibold group-hover:text-williams-purple dark:group-hover:text-williams-gold transition-colors mb-2">
                {project.title}
              </h4>
              <p className="text-sm text-charcoal-light leading-relaxed line-clamp-3">
                {project.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-border">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-cream-card-sub border border-cream-border text-[10px] font-mono text-charcoal-light rounded"
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 3 && (
                  <span className="px-2 py-0.5 bg-cream-card-sub border border-cream-border text-[10px] font-mono text-charcoal-light rounded">
                    +{project.tech.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs font-mono font-semibold text-williams-purple dark:text-williams-gold group-hover:text-tufts-blue dark:group-hover:text-tufts-blue-light transition-colors">
                <span>Inspect Artifact</span>
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Expanded Project Modal Drawer */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden" id="project-detail-drawer">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="absolute inset-0 bg-black/55"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-cream-bg shadow-2xl flex flex-col justify-between overflow-y-auto"
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
                </div>
                <button
                  id="btn-close-drawer"
                  onClick={() => setActiveProject(null)}
                  className="p-2 rounded-full border border-cream-border hover:bg-cream-card-sub text-charcoal transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 lg:p-8 flex-1 space-y-8 overflow-y-auto">
                {/* Description */}
                <div className="space-y-2">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Scope Summary</h5>
                  <p className="text-base text-charcoal leading-relaxed">{activeProject.description}</p>
                </div>

                {/* Tech Badges */}
                <div className="space-y-3">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Engineered With</h5>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-williams-purple/30 text-williams-gold border border-williams-purple-light/30 rounded-full text-xs font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bullets & Implementation Details */}
                <div className="space-y-4">
                  <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold">Engineering Highlights</h5>
                  <ul className="space-y-3">
                    {activeProject.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start text-sm leading-relaxed text-charcoal-light">
                        <span className="text-williams-gold mr-3 flex-shrink-0 mt-1">✦</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Statement */}
                {activeProject.impact && (
                  <div className="p-5 bg-tufts-blue/10 border-l-4 border-tufts-blue rounded-r-xl space-y-1">
                    <h6 className="font-serif text-sm font-semibold text-tufts-blue-light">Impact & Performance Outcomes</h6>
                    <p className="text-sm text-charcoal-light leading-relaxed">{activeProject.impact}</p>
                  </div>
                )}

                {/* Custom System Simulation Render inside Detail */}
                <ProjectSimulator projectId={activeProject.id} />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-cream-border bg-cream-card flex items-center justify-between">
                <span className="text-xs text-charcoal-light font-mono">Medford, MA • Tufts University</span>
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
