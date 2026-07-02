import React, { useState, useRef } from "react";
import { EXPERIENCE_DATA, EDUCATION_DATA } from "../data";
import { Briefcase, GraduationCap, MapPin, Calendar, BookOpen, Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";

const getInstitutionLogo = (institution: string) => {
  switch (institution) {
    case "Tufts University":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tufts Blue Crest */}
          <rect width="100" height="100" rx="20" fill="#1b5ca0" />
          <path d="M25 30 C 25 15, 75 15, 75 30 C 75 60, 50 85, 50 85 C 50 85, 25 60, 25 30 Z" fill="#3e8ede" stroke="#ffffff" strokeWidth="4" />
          <path d="M35 45 H 65 V 55 H 35 Z" fill="#ffffff" />
          <path d="M50 45 V 55" stroke="#1b5ca0" strokeWidth="2" />
          <circle cx="50" cy="35" r="5" fill="#ffcc00" />
        </svg>
      );
    case "CodePath":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* CodePath logo: modern charcoal background & glowing emerald terminal slash */}
          <rect width="100" height="100" rx="20" fill="#050505" />
          <path d="M25 35 L12 50 L25 65" stroke="#00e5a3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 35 L88 50 L75 65" stroke="#00e5a3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M62 25 L38 75" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );
    case "University of Pennsylvania":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* UPenn Red & Blue shield */}
          <rect width="100" height="100" rx="20" fill="#011F5B" />
          <path d="M25 25 H 75 V 55 C 75 70, 50 85, 50 85 C 50 85, 25 70, 25 55 Z" fill="#990000" stroke="#ffcc00" strokeWidth="3" />
          <path d="M40 40 H 60 M40 50 H 60 M40 60 H 60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 35 V 65" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "Williams College":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Williams Purple and Gold shield */}
          <rect width="100" height="100" rx="20" fill="#3c1053" />
          <path d="M25 25 C 25 25, 50 15, 50 15 C 50 15, 75 25, 75 25 V 55 C 75 70, 50 85, 50 85 C 50 85, 25 70, 25 55 Z" fill="#210730" stroke="#f2a900" strokeWidth="4" />
          <path d="M35 35 L43 65 L50 48 L57 65 L65 35" stroke="#f2a900" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "Lideta Catholic Cathedral School":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ethiopian style blue/yellow cathedral school crest */}
          <rect width="100" height="100" rx="20" fill="#1e3a8a" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#eab308" strokeWidth="4" />
          <path d="M50 28 V 72 M28 50 H 72" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
          <polygon points="50,38 53,47 62,47 55,53 57,62 50,56 43,62 45,53 38,47 47,47" fill="#ffffff" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#222" />
          <path d="M30 30 H 70 V 70 H 30 Z" stroke="#888" strokeWidth="4" />
        </svg>
      );
  }
};

export default function ExperienceTimeline() {
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
  const [expandedCourseName, setExpandedCourseName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="space-y-8" id="timeline-container">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-cream-card p-1 rounded-full border-2 border-cream-border flex items-center space-x-1 shadow-md">
          <button
            id="btn-timeline-exp"
            onClick={() => setActiveTab("experience")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
              activeTab === "experience"
                ? "bg-williams-purple text-white dark:text-williams-gold font-bold border border-williams-gold/40 shadow-md"
                : "text-charcoal-light hover:text-charcoal bg-transparent"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Industrial & Teaching</span>
          </button>
          <button
            id="btn-timeline-edu"
            onClick={() => setActiveTab("education")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
              activeTab === "education"
                ? "bg-williams-purple text-white dark:text-williams-gold font-bold border border-williams-gold/40 shadow-md"
                : "text-charcoal-light hover:text-charcoal bg-transparent"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Background</span>
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div ref={containerRef} className="relative max-w-4xl mx-auto pl-6 sm:pl-8 py-2">
        {/* Continuous Line Base */}
        <div className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-0.5 bg-cream-border/60" />
        
        {/* Scroll-activated Glowing Progress Line */}
        <motion.div
          className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-williams-purple via-tufts-blue to-emerald-500 origin-top shadow-[0_0_8px_rgba(139,92,246,0.4)] z-10"
          style={{ scaleY }}
        />

        <AnimatePresence mode="wait">
          {activeTab === "experience" ? (
            <motion.div
              key="experience-timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {EXPERIENCE_DATA.map((exp, idx) => (
                <div key={exp.id} id={`exp-timeline-item-${idx}`} className="relative group">
                   {/* Timeline Dot */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-4 h-4 rounded-full bg-cream-bg border-[3px] border-williams-purple group-hover:border-williams-gold transition-colors z-10" />

                  {/* Experience Card */}
                  <div className="bg-cream-card border-2 border-cream-border rounded-2xl p-5 sm:p-6 shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-tufts-blue-light bg-tufts-blue/15 px-2 py-0.5 rounded border border-tufts-blue/30">
                          {exp.type}
                        </span>
                        <h4 className="font-serif text-lg sm:text-xl text-charcoal font-semibold mt-1">
                          {exp.role}
                        </h4>
                        <p className="text-sm font-semibold text-williams-purple dark:text-williams-gold mt-0.5">
                          {exp.organization}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end text-xs font-mono text-charcoal-light space-y-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 opacity-60 text-williams-purple dark:text-williams-gold" />
                          {exp.period}
                        </span>
                        <span className="flex items-center gap-1 sm:justify-end">
                          <MapPin className="w-3.5 h-3.5 opacity-60 text-tufts-blue-light" />
                          {exp.location}
                        </span>
                      </div>
                    </div>

                    {/* Bullets */}
                    <ul className="mt-4 space-y-2.5">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-sm text-charcoal-light leading-relaxed flex items-start">
                          <span className="text-williams-purple dark:text-williams-gold mr-3 flex-shrink-0 mt-1">⬩</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Expandable Syllabus Accordion Drawers */}
                    {exp.courses && exp.courses.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-cream-border/80 space-y-3">
                        <div className="flex items-center space-x-2 text-williams-purple dark:text-williams-gold">
                          <BookOpen className="w-4 h-4" />
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Courses Taught & Curriculum Syllabi</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {exp.courses.map((course) => {
                            const isCourseExpanded = expandedCourseName === `${exp.id}-${course.name}`;
                            return (
                              <div
                                key={course.name}
                                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                                  isCourseExpanded
                                    ? "bg-cream-bg border-williams-purple/30 dark:border-williams-gold/30 shadow-md"
                                    : "bg-cream-card-sub border-cream-border hover:border-zinc-300 dark:hover:border-zinc-700"
                                }`}
                              >
                                <button
                                  type="button"
                                  id={`btn-course-${exp.id}-${course.name.replace(/\s+/g, "-")}`}
                                  onClick={() => setExpandedCourseName(isCourseExpanded ? null : `${exp.id}-${course.name}`)}
                                  className="w-full text-left p-3.5 flex items-center justify-between font-sans focus:outline-none cursor-pointer"
                                >
                                  <div>
                                    <h5 className="text-sm font-semibold text-charcoal">{course.name}</h5>
                                    <p className="text-[10px] text-charcoal-light mt-0.5 truncate max-w-[160px] sm:max-w-[140px] italic">
                                      {course.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-williams-purple dark:text-williams-gold">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline">
                                      {isCourseExpanded ? "Hide" : "Syllabus"}
                                    </span>
                                    {isCourseExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                  {isCourseExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: "easeInOut" }}
                                    >
                                      <div className="px-4 pb-4 pt-1 border-t border-cream-border space-y-3.5 text-xs">
                                        <p className="text-charcoal-light leading-relaxed italic bg-white dark:bg-zinc-950/20 p-2.5 rounded-lg border border-cream-border">
                                          "{course.description}"
                                        </p>
                                        
                                        <div className="space-y-1.5">
                                          <span className="font-mono text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">
                                            Syllabus Milestones:
                                          </span>
                                          <ul className="grid grid-cols-1 gap-1 pl-1">
                                            {course.syllabus.map((topic, tIdx) => (
                                              <li key={tIdx} className="flex items-start text-charcoal">
                                                <span className="text-tufts-blue mr-2 font-bold">•</span>
                                                <span>{topic}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        {course.evaluations && course.evaluations.length > 0 && (
                                          <div className="pt-2.5 border-t border-cream-border/50">
                                            <span className="font-mono text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">
                                              Evaluations & Metrics:
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                              {course.evaluations.map((evalItem, eIdx) => (
                                                <div
                                                  key={eIdx}
                                                  className="bg-white dark:bg-zinc-900 border border-cream-border px-2.5 py-1 rounded-lg flex flex-col min-w-[100px] shadow-sm"
                                                >
                                                  <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-tight">
                                                    {evalItem.metric}
                                                  </span>
                                                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    {evalItem.score}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Skill Tags */}
                    <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-cream-border">
                      {exp.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 bg-cream-card-sub text-[10px] font-mono text-charcoal-light rounded border border-cream-border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="education-timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {EDUCATION_DATA.map((edu, idx) => (
                <div key={idx} id={`edu-timeline-item-${idx}`} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-4 h-4 rounded-full bg-cream-bg border-[3px] border-tufts-blue group-hover:border-williams-gold transition-colors z-10" />

                  {/* Education Card */}
                  <div className="bg-cream-card border-2 border-cream-border rounded-2xl p-5 sm:p-6 shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Institution Logo */}
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-cream-card-sub border border-cream-border p-1 overflow-hidden shadow-inner mt-1">
                          {getInstitutionLogo(edu.institution)}
                        </div>
                        <div>
                          {edu.gpa && (
                            <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              GPA: {edu.gpa}
                            </span>
                          )}
                          <h4 className="font-serif text-lg sm:text-xl text-charcoal font-semibold mt-1">
                            {edu.institution}
                          </h4>
                          <p className="text-sm font-semibold text-williams-purple dark:text-williams-gold mt-0.5">
                            {edu.degree}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end text-xs font-mono text-charcoal-light space-y-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 opacity-60 text-tufts-blue-light" />
                          {edu.period}
                        </span>
                        <span className="flex items-center gap-1 sm:justify-end">
                          <MapPin className="w-3.5 h-3.5 opacity-60 text-williams-purple dark:text-williams-purple-light" />
                          {edu.location}
                        </span>
                      </div>
                    </div>

                    {/* Details list */}
                    {edu.details && edu.details.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {edu.details.map((d, dIdx) => (
                          <li key={dIdx} className="text-sm text-charcoal-light leading-relaxed flex items-start">
                            <span className="text-tufts-blue mr-3 flex-shrink-0 mt-1">✦</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
