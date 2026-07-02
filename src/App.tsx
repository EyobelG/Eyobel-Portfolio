import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  Cpu,
  Layers,
  GraduationCap,
  Wrench,
  Mail,
  Linkedin,
  Github,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Menu,
  X,
  FileText,
  Sparkles,
  Award,
  BookMarked,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import MathLab from "./components/MathLab";
import ProjectGrid from "./components/ProjectGrid";
import PublicationsSection from "./components/PublicationsSection";
import ExperienceTimeline from "./components/ExperienceTimeline";
import SkillsGrid from "./components/SkillsGrid";
import InteractivePortrait from "./components/InteractivePortrait";
import PersonalChatbot from "./components/PersonalChatbot";

function BrandLogo({ size = "large" }: { size?: "small" | "large" }) {
  const containerClasses = size === "large" 
    ? "w-14 h-14 rounded-2xl bg-zinc-200/40 dark:bg-white/10 border border-zinc-400/30 dark:border-white/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.06)] flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-serif font-bold text-2xl backdrop-blur-md shrink-0"
    : "w-9 h-9 rounded-xl bg-zinc-200/40 dark:bg-white/10 border border-zinc-400/30 dark:border-white/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.06)] flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-serif font-bold text-base backdrop-blur-md shrink-0";
  return (
    <div className={containerClasses}>
      EG
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("eyobel_theme") !== "light";
  });
  const [activeSection, setActiveSection] = useState<string>("about");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("eyobel_theme", "dark");
    } else {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("eyobel_theme", "light");
    }
  }, [isDarkMode]);

  const sections = [
    { id: "about", label: "Prologue", icon: User },
    { id: "mathlab", label: "Math Lab (Chip-Firing)", icon: Sparkles },
    { id: "publications", label: "Publications", icon: BookOpen },
    { id: "projects", label: "CS Artifacts", icon: Cpu },
    { id: "timeline", label: "Teaching & Experience", icon: GraduationCap },
    { id: "skills", label: "Skills & Certifications", icon: Wrench },
    { id: "contact", label: "Connect", icon: Mail }
  ];

  // Active section tracker on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col lg:flex-row relative">
      {/* MOBILE MENU HEADER */}
      <header className="lg:hidden sticky top-0 z-40 bg-zinc-100/70 dark:bg-zinc-950/75 backdrop-blur-xl text-charcoal px-5 py-4 flex items-center justify-between border-b border-cream-border shadow-md">
        <div className="flex items-center space-x-2.5">
          <BrandLogo size="small" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base font-bold tracking-tight text-charcoal">Eyobel Gebre</h1>
              <a
                href="https://github.com/EyobelG"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider font-semibold">Tufts CS • Williams Math</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-mobile-theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all text-charcoal border border-cream-border/60"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-zinc-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-all text-charcoal"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-[69px] left-0 right-0 bg-zinc-100/95 dark:bg-zinc-950/95 backdrop-blur-xl text-charcoal z-35 border-b border-cream-border shadow-xl"
          >
            <nav className="p-4 space-y-1">
              {sections.map((sect) => {
                const Icon = sect.icon;
                const isActive = activeSection === sect.id;
                return (
                  <button
                    key={sect.id}
                    id={`mobile-nav-${sect.id}`}
                    onClick={() => scrollToSection(sect.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-mono transition-all ${
                      isActive
                        ? "bg-zinc-200/80 dark:bg-white/10 text-zinc-900 dark:text-white font-bold border border-zinc-300/40 dark:border-white/10 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{sect.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT STATIC SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-80 xl:w-96 bg-zinc-100/50 dark:bg-zinc-950/65 backdrop-blur-2xl text-charcoal flex-col justify-between p-8 xl:p-10 sticky top-0 h-screen border-r border-cream-border shadow-2xl shrink-0 z-10 overflow-y-auto">
        <div className="space-y-8">
          {/* Brand/Identity */}
          <div className="flex items-center space-x-4">
            <BrandLogo size="large" />
            <div>
              <h1 className="font-serif text-xl xl:text-2xl font-bold tracking-tight text-charcoal leading-tight">
                Eyobel Gebre
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest font-semibold mt-0.5">
                Tufts CS • Williams Math
              </p>
              <div className="flex items-center space-x-2 mt-1.5">
                <a
                  href="https://github.com/EyobelG"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-tufts-blue-light transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span className="underline decoration-dotted">EyobelG</span>
                </a>
                <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>
                <a
                  href="https://www.linkedin.com/in/eyobelgebre"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-tufts-blue-light transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span className="underline decoration-dotted">eyobelgebre</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Bios Card */}
          <div className="bg-zinc-200/40 dark:bg-zinc-900/45 rounded-2xl p-5 border border-zinc-300/30 dark:border-white/5 space-y-3.5 shadow-sm">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              Former boarding school math teacher, currently a <strong>Computer Science Post-Bac/MS</strong> candidate at <strong>Tufts University</strong>.
            </p>
            <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-tufts-blue-light" />
                <span>Medford, MA, USA</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>CS GPA: 4.0</span>
              </div>
            </div>
          </div>

          {/* TABLE OF CONTENTS NAVIGATION */}
          <nav className="space-y-1 pt-2">
            {sections.map((sect) => {
              const Icon = sect.icon;
              const isActive = activeSection === sect.id;
              return (
                <button
                  key={sect.id}
                  id={`side-nav-${sect.id}`}
                  onClick={() => scrollToSection(sect.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-mono transition-all ${
                    isActive
                      ? "bg-zinc-200/80 dark:bg-white/10 text-zinc-900 dark:text-white font-bold border border-zinc-300/40 dark:border-white/15 shadow-sm transform translate-x-2"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{sect.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-90 text-zinc-900 dark:text-white" : "opacity-30"}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer with Social Links */}
        <div className="space-y-4 pt-6 border-t border-cream-border">
          <div className="flex items-center justify-center space-x-3">
            <button
              id="btn-desktop-theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full bg-zinc-200/40 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/15 text-charcoal transition-all border border-cream-border cursor-pointer flex items-center justify-center"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                window.location.href = "mailto:" + "eyobelassefa" + "@" + "gmail.com";
              }}
              className="p-2.5 rounded-full bg-zinc-200/40 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/15 text-charcoal transition-all border border-cream-border cursor-pointer"
              title="Mail"
            >
              <Mail className="w-4 h-4" />
            </button>
            <a
              href="https://www.linkedin.com/in/eyobelgebre"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-zinc-200/40 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/15 text-charcoal transition-all border border-cream-border flex items-center justify-center"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/EyobelG"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-zinc-200/40 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/15 text-charcoal transition-all border border-cream-border flex items-center justify-center"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
          <div className="text-center text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            Eyobel Gebre • © 2026
          </div>
        </div>
      </aside>

      {/* RIGHT EDITORIAL CANVAS */}
      <main className="flex-1 overflow-x-hidden">
        {/* Banner Highlight Container */}
        <div className="relative bg-gradient-to-r from-zinc-200/50 via-zinc-100/30 to-zinc-50/25 dark:from-zinc-900/30 dark:via-zinc-950/20 dark:to-zinc-950/10 border-b border-cream-border py-12 px-6 lg:px-12 xl:px-16 overflow-hidden">
          {/* Micro Geometric Accents */}
          <div className="absolute top-10 right-20 w-32 h-32 rounded-full border border-zinc-300/15 dark:border-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full border border-zinc-300/15 dark:border-white/5 pointer-events-none" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center space-x-2 px-3.5 py-1 bg-williams-purple/10 dark:bg-williams-purple/25 text-williams-purple dark:text-williams-gold font-mono text-[10px] font-bold rounded-full uppercase tracking-widest border border-williams-purple/20 dark:border-williams-gold/30 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-williams-purple dark:text-williams-gold animate-spin-slow" />
                <span>Seeking Summer 2026 Internships & Full-Time Roles</span>
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-bold tracking-tight leading-tight">
                Bridging Rigorous Mathematics <br className="hidden sm:inline" />
                with High-Performance Systems
              </h2>
              <p className="text-sm sm:text-base text-charcoal-light max-w-xl leading-relaxed">
                Hi, I'm Eyobel. I design virtual machines, optimize low-level systems, and build full-stack solutions driven by advanced combinatorial graphs. Let's explore my artifacts below.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  id="btn-hero-connect"
                  onClick={() => scrollToSection("contact")}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-mono text-xs font-semibold rounded-lg shadow-sm border border-zinc-700/50 dark:border-white/15 transition-all"
                >
                  Contact Me
                </button>
                <button
                  id="btn-hero-mathlab"
                  onClick={() => scrollToSection("mathlab")}
                  className="px-5 py-2.5 border border-cream-border bg-cream-card hover:bg-cream-card-sub text-charcoal font-mono text-xs transition-all rounded-lg flex items-center space-x-1"
                >
                  <span>Play Chip-Firing Lab</span>
                  <span className="text-zinc-400 font-bold">★</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Portrait Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <InteractivePortrait />
            </div>
          </div>
        </div>

        {/* SECTIONS WRAPPER */}
        <div className="max-w-5xl mx-auto px-6 lg:px-12 xl:px-16 py-12 space-y-24">
          
          {/* SECTION 1: PROLOGUE */}
          <section id="about" className="scroll-mt-24 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-tufts-blue-light font-bold">Section 01</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Academic & Professional Prologue
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Detailed Narrative */}
              <div className="md:col-span-8 space-y-4 text-sm text-charcoal-light leading-relaxed">
                <p>
                  As a former boarding school math teacher at elite institutions such as EF Academy Pasadena and Northfield Mount Hermon, I spent years transforming abstract, challenging theories like <strong>Linear Algebra</strong> and <strong>Multivariable Calculus</strong> into engaging, intuitive systems for students.
                </p>
                <p>
                  Today, I am applying that same systems-level clarity and mathematical precision to low-level computer science. As a <strong>CS Master's candidate at Tufts University</strong> (maintaining a perfect <strong>4.0 GPA</strong>), I specialize in systems programming, virtual architectures, and compiler-level optimization.
                </p>
                <p>
                  In the summer of 2021, I was selected to join the prestigious <strong>SMALL REU</strong> at Williams College, where I worked with Prof. Ralph Morrison to co-author <strong>four research papers</strong> on divisor theory, circulant graphs, and higher graph gonality, published in journals such as the <i>Australasian Journal of Combinatorics</i>.
                </p>
                <p>
                  I am currently seeking <strong>Software Engineering, Product Management, or Quantitative Research intern roles for Summer 2026</strong>. I possess full employment authorization (EAD via TPS Ethiopia) and am fully prepared to relocate anywhere in the United States.
                </p>
              </div>

              {/* Core metrics / Stats column */}
              <div className="md:col-span-4 bg-cream-card rounded-3xl p-6 border-2 border-white/10 space-y-4 shadow-xl">
                <h5 className="font-mono text-[10px] font-bold uppercase text-charcoal-light tracking-wider">Fast Profiling Details</h5>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-charcoal-light font-mono block">CUMULATIVE CS GPA</span>
                    <span className="text-2xl font-serif font-bold text-zinc-700 dark:text-zinc-200">4.0 / 4.0</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-light font-mono block">CO-AUTHORED PUBLICATIONS</span>
                    <span className="text-2xl font-serif font-bold text-tufts-blue-light">4 Peer Papers</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-light font-mono block">ALMA MATER HERITAGE</span>
                    <span className="text-sm font-sans font-semibold text-charcoal">Williams College BA • Tufts MS</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-light font-mono block">COMPILER PROJECTS</span>
                    <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/50 px-2 py-0.5 rounded-lg">32-bit Virtual Machine</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: INTERACTIVE MATH LAB */}
          <section id="mathlab" className="scroll-mt-24 border-t border-cream-border/60 pt-16 space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <Sparkles className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">Section 02</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Math Sandbox: Graph Chip-Firing Game
                </h3>
              </div>
            </div>
            
            <MathLab />
          </section>

          {/* SECTION 3: PUBLICATIONS */}
          <section id="publications" className="scroll-mt-24 border-t border-cream-border/60 pt-16">
            <PublicationsSection />
          </section>

          {/* SECTION 4: PROJECTS */}
          <section id="projects" className="scroll-mt-24 border-t border-cream-border/60 pt-16 space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-tufts-blue-light font-bold">Section 04</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Computer Science & Systems Artifacts
                </h3>
              </div>
            </div>
            
            <ProjectGrid />
          </section>

          {/* SECTION 5: TIMELINE */}
          <section id="timeline" className="scroll-mt-24 border-t border-cream-border/60 pt-16 space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-tufts-blue/5 border border-tufts-blue/10 flex items-center justify-center text-tufts-blue">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">Section 05</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Chronological Journey & Pedagogy
                </h3>
              </div>
            </div>

            <ExperienceTimeline />
          </section>

          {/* SECTION 6: SKILLS */}
          <section id="skills" className="scroll-mt-24 border-t border-cream-border/60 pt-16 space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-tufts-blue-light font-bold">Section 06</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Skill Set & Professional Accreditations
                </h3>
              </div>
            </div>

            <SkillsGrid />
          </section>

          {/* SECTION 7: CONNECT */}
          <section id="contact" className="scroll-mt-24 border-t border-cream-border/60 pt-16 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-500/5 border border-zinc-500/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-tufts-blue-light font-bold">Section 07</span>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal tracking-tight leading-tight">
                  Contact Me
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left explanation info */}
              <div className="md:col-span-5 space-y-4">
                <p className="text-sm text-charcoal-light leading-relaxed">
                  I am highly responsive to industry proposals, research inquiries, and computational discussions. 
                  Reach out using any of the direct coordinates on the right or click to copy.
                </p>

                <div className="p-4 bg-cream-card rounded-2xl border-2 border-cream-border space-y-2 shadow-lg">
                  <span className="font-mono text-[10px] uppercase text-charcoal-light font-bold block">Current Location</span>
                  <p className="text-sm text-charcoal font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-tufts-blue" />
                    Medford, Massachusetts • US (Relocation OK)
                  </p>
                </div>
              </div>

              {/* Right coordinates grid */}
              <div className="md:col-span-7 space-y-3">
                {/* Email item */}
                <div className="flex items-center justify-between p-4 bg-cream-card border-2 border-cream-border rounded-2xl shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-zinc-200/50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-white/10 rounded-xl">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-charcoal-light block">Primary Email</span>
                      <button
                        onClick={() => {
                          window.location.href = "mailto:" + "eyobelassefa" + "@" + "gmail.com";
                        }}
                        className="text-sm font-sans font-semibold text-charcoal hover:text-zinc-500 dark:hover:text-zinc-400 transition-all text-left flex items-center gap-1 cursor-pointer"
                      >
                        eyobelassefa <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">[at]</span> gmail <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">[dot]</span> com
                      </button>
                    </div>
                  </div>
                  <button
                    id="btn-copy-email"
                    onClick={() => copyToClipboard("eyobelassefa@gmail.com")}
                    className="p-1.5 rounded-lg hover:bg-cream-card-sub text-charcoal-light hover:text-charcoal transition-all cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Tufts Email item */}
                <div className="flex items-center justify-between p-4 bg-cream-card border-2 border-cream-border rounded-2xl shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-tufts-blue/20 text-tufts-blue border border-tufts-blue/30 rounded-xl">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-charcoal-light block">Academic Email</span>
                      <button
                        onClick={() => {
                          window.location.href = "mailto:" + "egebre02" + "@" + "tufts.edu";
                        }}
                        className="text-sm font-sans font-semibold text-charcoal hover:text-tufts-blue transition-all text-left flex items-center gap-1 cursor-pointer"
                      >
                        egebre02 <span className="text-tufts-blue font-mono text-xs">[at]</span> tufts <span className="text-tufts-blue font-mono text-xs">[dot]</span> edu
                      </button>
                    </div>
                  </div>
                  <button
                    id="btn-copy-tufts"
                    onClick={() => copyToClipboard("egebre02@tufts.edu")}
                    className="p-1.5 rounded-lg hover:bg-cream-card-sub text-charcoal-light hover:text-charcoal transition-all cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* LinkedIn item */}
                <div className="flex items-center justify-between p-4 bg-cream-card border-2 border-cream-border rounded-2xl shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-tufts-blue/20 text-tufts-blue border border-tufts-blue/30 rounded-xl">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-charcoal-light block">LinkedIn Network</span>
                      <a
                        href="https://www.linkedin.com/in/eyobelgebre"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-sans font-semibold text-charcoal hover:text-tufts-blue transition-all flex items-center gap-1"
                      >
                        linkedin.com/in/eyobelgebre
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* GitHub item */}
                <div className="flex items-center justify-between p-4 bg-cream-card border-2 border-cream-border rounded-2xl shadow-lg hover:border-zinc-400/30 dark:hover:border-white/20 hover:bg-cream-card-sub transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-zinc-200/50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-white/10 rounded-xl">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-charcoal-light block">GitHub Profile</span>
                      <a
                        href="https://github.com/EyobelG"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-sans font-semibold text-charcoal hover:text-zinc-500 dark:hover:text-zinc-400 transition-all flex items-center gap-1"
                      >
                        github.com/EyobelG
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
      <PersonalChatbot />
    </div>
  );
}
