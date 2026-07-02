import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, Globe, Award, Terminal, Code, Braces, Coffee, Database, 
  GitBranch, Zap, Server, Shield, Layers, HelpCircle, FileCode, CheckCircle, Flame,
  ExternalLink
} from "lucide-react";
import { SKILLS_DATA, CERTIFICATIONS } from "../data";

const renderProviderLogo = (provider: string | undefined) => {
  const p = (provider || "").toLowerCase();
  
  if (p.includes("openai")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:border-zinc-400 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038-.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      </div>
    );
  }
  
  if (p.includes("anthropic")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#D09A75] border border-[#D09A75]/30 flex items-center justify-center shadow-[0_2px_8px_rgba(208,154,117,0.15)] group-hover:border-[#D09A75]/60 group-hover:shadow-[0_4px_12px_rgba(208,154,117,0.3)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#191919] transition-transform duration-300 group-hover:scale-110">
          <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
        </svg>
      </div>
    );
  }

  if (p.includes("codecademy")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0a102f] border border-[#30c6b5]/20 flex items-center justify-center shadow-[0_0_10px_rgba(48,198,181,0.03)] group-hover:border-[#30c6b5]/50 group-hover:shadow-[0_0_15px_rgba(48,198,181,0.15)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 110 32" className="w-8 h-auto text-white transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="46" height="29" rx="3" stroke="currentColor" strokeWidth="3" fill="none" />
          <text x="24.5" y="21" fill="currentColor" fontSize="16" fontFamily='"Inter", "Space Grotesk", sans-serif' fontWeight="800" textAnchor="middle" letterSpacing="-0.5">code</text>
          <text x="51" y="21" fill="currentColor" fontSize="16" fontFamily='"Inter", "Space Grotesk", sans-serif' fontWeight="800" letterSpacing="-0.5">cademy</text>
          <line x1="51" y1="26" x2="61" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (p.includes("microsoft")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-black/80 border border-[#00a4ef]/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,164,239,0.03)] group-hover:border-[#00a4ef]/50 group-hover:shadow-[0_0_15px_rgba(0,164,239,0.15)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
          <g>
            <rect x="2" y="2" width="9" height="9" fill="#f25022" />
            <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
            <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
            <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
          </g>
        </svg>
      </div>
    );
  }

  if (p.includes("linkedin")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-black/80 border border-[#0077b5]/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,119,181,0.03)] group-hover:border-[#0077b5]/50 group-hover:shadow-[0_0_15px_rgba(0,119,181,0.15)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#0077b5] transition-transform duration-300 group-hover:scale-110">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      </div>
    );
  }

  if (p.includes("citi")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-black/80 border border-[#d4af37]/20 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.03)] group-hover:border-[#d4af37]/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all duration-300 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#d4af37] transition-transform duration-300 group-hover:scale-110">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-black/80 border border-[#30c6b5]/20 flex items-center justify-center shadow-[0_0_10px_rgba(48,198,181,0.03)] group-hover:border-[#30c6b5]/50 group-hover:shadow-[0_0_15px_rgba(48,198,181,0.15)] transition-all duration-300 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-5 h-5 text-[#30c6b5] transition-transform duration-300 group-hover:scale-110">
        <rect x="10" y="15" width="80" height="70" rx="12" stroke="currentColor" strokeWidth="7" fill="none" />
        <text x="24" y="58" fill="currentColor" fontSize="32" fontFamily="monospace" fontWeight="bold">&gt;_</text>
      </svg>
    </div>
  );
};

const getProviderBadgeClass = (provider: string | undefined) => {
  const p = (provider || "").toLowerCase();
  if (p.includes("openai")) return "text-[#10a37f]";
  if (p.includes("anthropic")) return "text-[#cc9a06]";
  if (p.includes("microsoft")) return "text-[#00a4ef]";
  if (p.includes("linkedin")) return "text-[#0077b5]";
  if (p.includes("citi")) return "text-[#d4af37]";
  return "text-[#30c6b5]";
};

const getProviderCardHoverClass = (provider: string | undefined) => {
  const p = (provider || "").toLowerCase();
  if (p.includes("openai")) return "hover:border-[#10a37f]/30 hover:shadow-[#10a37f]/5";
  if (p.includes("anthropic")) return "hover:border-[#cc9a06]/30 hover:shadow-[#cc9a06]/5";
  if (p.includes("microsoft")) return "hover:border-[#00a4ef]/30 hover:shadow-[#00a4ef]/5";
  if (p.includes("linkedin")) return "hover:border-[#0077b5]/30 hover:shadow-[#0077b5]/5";
  if (p.includes("citi")) return "hover:border-[#d4af37]/30 hover:shadow-[#d4af37]/5";
  return "hover:border-[#30c6b5]/30 hover:shadow-[#30c6b5]/5";
};

const getProviderArrowHoverClass = (provider: string | undefined) => {
  const p = (provider || "").toLowerCase();
  if (p.includes("openai")) return "group-hover:text-[#10a37f] group-hover:border-[#10a37f]/20 group-hover:bg-[#10a37f]/10";
  if (p.includes("anthropic")) return "group-hover:text-[#cc9a06] group-hover:border-[#cc9a06]/20 group-hover:bg-[#cc9a06]/10";
  if (p.includes("microsoft")) return "group-hover:text-[#00a4ef] group-hover:border-[#00a4ef]/20 group-hover:bg-[#00a4ef]/10";
  if (p.includes("linkedin")) return "group-hover:text-[#0077b5] group-hover:border-[#0077b5]/20 group-hover:bg-[#0077b5]/10";
  if (p.includes("citi")) return "group-hover:text-[#d4af37] group-hover:border-[#d4af37]/20 group-hover:bg-[#d4af37]/10";
  return "group-hover:text-[#30c6b5] group-hover:border-[#30c6b5]/20 group-hover:bg-[#30c6b5]/10";
};

// Detailed tech stack with brand colors, descriptions and icons
interface TechSkill {
  name: string;
  category: "languages" | "web" | "systems" | "tools";
  icon: React.ComponentType<any>;
  color: string; // Tailwind color or hex for custom glows
  accentClass: string; // Tailwind text color
  bgGlowClass: string; // Tailwind glow border color
  level: string;
  years: string;
  description: string;
}

const TECH_STACK: TechSkill[] = [
  {
    name: "C / C++",
    category: "languages",
    icon: Code,
    color: "#00599C",
    accentClass: "text-[#00599c]",
    bgGlowClass: "hover:border-[#00599c]/50 hover:shadow-[#00599c]/20",
    level: "Advanced",
    years: "3+ Years",
    description: "Systems programming, custom 32-bit VM instruction set, and Valgrind optimization.",
  },
  {
    name: "Python",
    category: "languages",
    icon: FileCode,
    color: "#3776AB",
    accentClass: "text-[#3776ab]",
    bgGlowClass: "hover:border-[#3776ab]/50 hover:shadow-[#3776ab]/20",
    level: "Advanced",
    years: "4+ Years",
    description: "Numerical models, algorithmic complexity modeling, and Scikit-Learn data science.",
  },
  {
    name: "Java",
    category: "languages",
    icon: Coffee,
    color: "#ED8B00",
    accentClass: "text-[#ed8b00]",
    bgGlowClass: "hover:border-[#ed8b00]/50 hover:shadow-[#ed8b00]/20",
    level: "Advanced",
    years: "3+ Years",
    description: "Object-oriented software architectures and advanced data structures.",
  },
  {
    name: "JavaScript / TS",
    category: "languages",
    icon: Braces,
    color: "#3178C6",
    accentClass: "text-[#3178c6]",
    bgGlowClass: "hover:border-[#3178c6]/50 hover:shadow-[#3178c6]/20",
    level: "Advanced",
    years: "3+ Years",
    description: "Modern asynchronous workflows, full-stack architecture, and type-safe interfaces.",
  },
  {
    name: "React.js",
    category: "web",
    icon: Globe,
    color: "#61DAFB",
    accentClass: "text-[#61dafb]",
    bgGlowClass: "hover:border-[#61dafb]/50 hover:shadow-[#61dafb]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Dynamic visualizers, interactive math sandboxes, and highly responsive UI components.",
  },
  {
    name: "Node.js",
    category: "web",
    icon: Server,
    color: "#339933",
    accentClass: "text-[#339933]",
    bgGlowClass: "hover:border-[#339933]/50 hover:shadow-[#339933]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Robust asynchronous API servers, router middleware, and JWT authentication.",
  },
  {
    name: "Express.js",
    category: "web",
    icon: Layers,
    color: "#828282",
    accentClass: "text-[#f3f4f6]",
    bgGlowClass: "hover:border-white/30 hover:shadow-white/10",
    level: "Advanced",
    years: "2+ Years",
    description: "API design, endpoint optimization, and full-stack Vite development integration.",
  },
  {
    name: "Assembly (UM)",
    category: "systems",
    icon: Cpu,
    color: "#00E5A3",
    accentClass: "text-[#00e5a3]",
    bgGlowClass: "hover:border-[#00e5a3]/50 hover:shadow-[#00e5a3]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Macro assemblers, low-level binary analysis, recursion frames, and binary bomb disassembly.",
  },
  {
    name: "SQL & Relational",
    category: "systems",
    icon: Database,
    color: "#4479A1",
    accentClass: "text-[#4479a1]",
    bgGlowClass: "hover:border-[#4479a1]/50 hover:shadow-[#4479a1]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Relational queries, schema normalization, and persistent database tracking.",
  },
  {
    name: "Git & Versioning",
    category: "tools",
    icon: GitBranch,
    color: "#F05032",
    accentClass: "text-[#f05032]",
    bgGlowClass: "hover:border-[#f05032]/50 hover:shadow-[#f05032]/20",
    level: "Advanced",
    years: "4+ Years",
    description: "Version controls, branch rebasing, and professional team repository structures.",
  },
  {
    name: "Vite",
    category: "tools",
    icon: Zap,
    color: "#646CFF",
    accentClass: "text-[#646cff]",
    bgGlowClass: "hover:border-[#646cff]/50 hover:shadow-[#646cff]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Fast-bundling local developer servers and static web deployments.",
  },
  {
    name: "Firebase",
    category: "web",
    icon: Flame,
    color: "#FFCA28",
    accentClass: "text-[#ffca28]",
    bgGlowClass: "hover:border-[#ffca28]/50 hover:shadow-[#ffca28]/20",
    level: "Intermediate",
    years: "1+ Years",
    description: "Real-time key-value Firestore databases and user auth profiles.",
  },
  {
    name: "Tailwind CSS",
    category: "web",
    icon: Shield,
    color: "#38BDF8",
    accentClass: "text-[#38bdf8]",
    bgGlowClass: "hover:border-[#38bdf8]/50 hover:shadow-[#38bdf8]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Fluid utility alignments, clean modern displays, and eye-safe color palettes.",
  },
  {
    name: "MongoDB",
    category: "web",
    icon: Database,
    color: "#47A248",
    accentClass: "text-[#47A248]",
    bgGlowClass: "hover:border-[#47A248]/50 hover:shadow-[#47A248]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Document-based databases, flexible schemas, aggregation pipelines, and Mongoose integration.",
  },
  {
    name: "MySQL",
    category: "systems",
    icon: Database,
    color: "#4479A1",
    accentClass: "text-[#4479a1]",
    bgGlowClass: "hover:border-[#4479a1]/50 hover:shadow-[#4479a1]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Relational queries, index optimization, transactional safety, and schema designs.",
  },
  {
    name: "FastAPI",
    category: "web",
    icon: Zap,
    color: "#009688",
    accentClass: "text-[#009688]",
    bgGlowClass: "hover:border-[#009688]/50 hover:shadow-[#009688]/20",
    level: "Advanced",
    years: "1+ Years",
    description: "High-performance Python web APIs, asynchronous endpoints, and Pydantic validation.",
  },
  {
    name: "MATLAB",
    category: "languages",
    icon: Code,
    color: "#E16719",
    accentClass: "text-[#e16719]",
    bgGlowClass: "hover:border-[#e16719]/50 hover:shadow-[#e16719]/20",
    level: "Advanced",
    years: "2+ Years",
    description: "Numerical analysis, spatial modeling of biological ecosystems, and differential equation simulations.",
  },
  {
    name: "R",
    category: "languages",
    icon: Code,
    color: "#276FBF",
    accentClass: "text-[#276fbf]",
    bgGlowClass: "hover:border-[#276fbf]/50 hover:shadow-[#276fbf]/20",
    level: "Intermediate",
    years: "1+ Years",
    description: "Statistical computing, exploratory data analysis, and mathematical modeling.",
  }
];

// High contrast official/branded inline vector SVGs for tech stack
const renderBrandLogo = (name: string, isHovered: boolean) => {
  const hoverClass = isHovered ? "scale-110 rotate-[6deg]" : "";
  const baseClass = `w-7 h-7 sm:w-8 sm:h-8 transition-all duration-500 ${hoverClass}`;

  switch (name) {
    case "C / C++":
      return (
        <div className={`flex items-center space-x-1.5 transition-all duration-500 ${hoverClass}`}>
          <img 
            src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/c/c_128x128.png" 
            alt="C Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            referrerPolicy="no-referrer"
          />
          <img 
            src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/cpp/cpp_128x128.png" 
            alt="C++ Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    case "Python":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/python/python_128x128.png" 
          alt="Python Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "Java":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/java/java_128x128.png" 
          alt="Java Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "JavaScript / TS":
      return (
        <div className={`flex items-center space-x-1.5 transition-all duration-500 ${hoverClass}`}>
          <img 
            src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/javascript/javascript_128x128.png" 
            alt="JS Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            referrerPolicy="no-referrer"
          />
          <img 
            src="https://cdn.jsdelivr.net/gh/abranhe/programming-languages-logos@master/src/typescript/typescript_128x128.png" 
            alt="TS Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    case "React.js":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <circle cx="50" cy="50" r="9" fill="#61DAFB" />
          <ellipse cx="50" cy="50" rx="44" ry="16" stroke="#61DAFB" strokeWidth="4" fill="none" transform="rotate(0 50 50)" />
          <ellipse cx="50" cy="50" rx="44" ry="16" stroke="#61DAFB" strokeWidth="4" fill="none" transform="rotate(60 50 50)" />
          <ellipse cx="50" cy="50" rx="44" ry="16" stroke="#61DAFB" strokeWidth="4" fill="none" transform="rotate(120 50 50)" />
        </svg>
      );
    case "Node.js":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg"
          alt="Node.js Logo"
          className={`${baseClass} object-contain`}
          referrerPolicy="no-referrer"
        />
      );
    case "Express.js":
      return (
        <img 
          src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg"
          alt="Express.js Logo"
          className={`${baseClass} dark:brightness-0 dark:invert`}
          referrerPolicy="no-referrer"
        />
      );
    case "Assembly (UM)":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect x="20" y="20" width="60" height="60" rx="12" fill="var(--color-cream-card)" stroke="#00E5A3" strokeWidth="4" />
          <rect x="35" y="35" width="30" height="30" rx="6" fill="#00E5A3" opacity="0.3" />
          <line x1="8" y1="35" x2="20" y2="35" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="50" x2="20" y2="50" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="65" x2="20" y2="65" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="35" x2="92" y2="35" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="50" x2="92" y2="50" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="65" x2="92" y2="65" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="35" y1="8" x2="35" y2="20" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="8" x2="50" y2="20" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="65" y1="8" x2="65" y2="20" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="35" y1="80" x2="35" y2="92" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="80" x2="50" y2="92" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="65" y1="80" x2="65" y2="92" stroke="#00E5A3" strokeWidth="3" strokeLinecap="round" />
          <text x="50" y="57" fill="#00E5A3" fontSize="20" fontFamily="monospace" fontWeight="bold" textAnchor="middle">UM</text>
        </svg>
      );
    case "SQL & Relational":
      return (
        <svg viewBox="0 0 100 100" className={baseClass} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sqlBlueGrad_cyl" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1C74C9" />
              <stop offset="50%" stopColor="#1C74C9" />
              <stop offset="50%" stopColor="#145EA4" />
              <stop offset="100%" stopColor="#145EA4" />
            </linearGradient>
            <linearGradient id="sqlGreenGrad_cyl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3E635" />
              <stop offset="100%" stopColor="#80B324" />
            </linearGradient>
          </defs>
          {/* Cylinder Body */}
          <path d="M 15,25 L 15,75 C 15,87 85,87 85,75 L 85,25 Z" fill="url(#sqlBlueGrad_cyl)" />
          {/* Cylinder Top Ellipse */}
          <ellipse cx="50" cy="25" rx="35" ry="12" fill="url(#sqlGreenGrad_cyl)" />
          {/* Text SQL */}
          <text 
            x="50" 
            y="58" 
            fill="#FFFFFF" 
            fontSize="19" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="900" 
            textAnchor="middle"
          >
            SQL
          </text>
        </svg>
      );
    case "Git & Versioning":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
          alt="Git & Versioning Logo"
          className={`${baseClass} object-contain`}
          referrerPolicy="no-referrer"
        />
      );
    case "Vite":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <path d="M10 20 L50 5 L90 20 L50 95 Z" fill="#1e1b4b" stroke="#646CFF" strokeWidth="4" />
          <polygon points="55,12 25,52 48,52 38,88 75,42 50,42" fill="#FFD600" stroke="#FFAB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Firebase":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <path d="M15 78 L50 15 L62 36 Z" fill="#FF9100" />
          <path d="M15 78 L50 15 L82 72 Z" fill="#FFA000" />
          <path d="M48 40 L30 74 L85 74 Z" fill="#FFC400" />
          <path d="M15 78 L85 74 L50 88 Z" fill="#F57C00" />
        </svg>
      );
    case "Tailwind CSS":
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 0.913 0.228 1.565 0.89 2.288 1.624C13.666 10.618 14.754 11.7 17.001 11.7c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-0.913-0.228-1.565-0.89-2.288-1.624C15.337 5.882 14.249 4.8 12.001 4.8zm-6 6.9c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 0.913 0.228 1.565 0.89 2.288 1.624 1.177 1.194 2.265 2.3 4.512 2.3 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-0.913-0.228-1.565-0.89-2.288-1.624-1.177-1.194-2.265-2.3-4.512-2.3z" fill="#06B6D4"/>
        </svg>
      );
    case "MongoDB":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" 
          alt="MongoDB Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "MySQL":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" 
          alt="MySQL Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "FastAPI":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" 
          alt="FastAPI Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "MATLAB":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/matlab/matlab-original.svg" 
          alt="MATLAB Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    case "R":
      return (
        <img 
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg" 
          alt="R Logo" 
          className={baseClass}
          referrerPolicy="no-referrer"
        />
      );
    default:
      return null;
  }
};

export default function SkillsGrid() {
  const [activeTab, setActiveTab] = useState<"all" | "languages" | "web" | "systems" | "tools" | "math_certs">("all");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Filter skills based on tab
  const filteredSkills = TECH_STACK.filter(
    (skill) => activeTab === "all" || skill.category === activeTab
  );

  return (
    <div className="space-y-8" id="skills-grid-wrapper">
      
      {/* Interactive Tabs Menu */}
      <div className="flex flex-wrap items-center gap-2 bg-cream-card border border-cream-border p-2 rounded-2xl max-w-3xl shadow-md">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          All Stack
        </button>
        <button
          onClick={() => setActiveTab("languages")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "languages"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          Languages
        </button>
        <button
          onClick={() => setActiveTab("web")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "web"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          Frontend & Web
        </button>
        <button
          onClick={() => setActiveTab("systems")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "systems"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          Systems & Assembly
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "tools"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          Dev Tools & Versioning
        </button>
        <button
          onClick={() => setActiveTab("math_certs")}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "math_certs"
              ? "bg-williams-purple text-white dark:text-williams-gold shadow-md border border-williams-gold/30"
              : "text-charcoal-light hover:text-charcoal hover:bg-cream-card-sub"
          }`}
        >
          Discrete Math & Certs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab !== "math_certs" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
          >
            {filteredSkills.map((skill) => {
              const Icon = skill.icon;
              const isHovered = hoveredSkill === skill.name;

              return (
                <div
                  key={skill.name}
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className={`relative aspect-square bg-cream-card border-2 border-cream-border rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden transition-all duration-300 shadow-lg ${skill.bgGlowClass}`}
                  style={{
                    boxShadow: isHovered 
                      ? `0 15px 30px -10px ${skill.color}50` 
                      : "none"
                  }}
                >
                  {/* Subtle Background Glow Accent */}
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      opacity: isHovered ? 0.08 : 0,
                      background: `radial-gradient(circle, ${skill.color} 0%, transparent 70%)`
                    }}
                  />

                  <div className="flex flex-col items-center justify-center space-y-3 z-10 w-full h-full">
                    {/* Icon framed inside a subtle colored outline */}
                    <div 
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                        isHovered 
                          ? "bg-cream-card-sub scale-110" 
                          : "bg-cream-card-sub/20"
                      }`}
                      style={{
                        borderColor: isHovered ? skill.color : "var(--color-cream-border)",
                        boxShadow: isHovered ? `inset 0 0 10px ${skill.color}30` : "none"
                      }}
                    >
                      {renderBrandLogo(skill.name, isHovered) || (
                        <Icon 
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 ${skill.accentClass} ${
                            isHovered ? "rotate-[12deg] scale-110" : ""
                          }`} 
                          style={{ color: skill.color }}
                        />
                      )}
                    </div>

                    {/* Skill Label */}
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-charcoal tracking-tight block">
                        {skill.name}
                      </span>
                      <span className="font-mono text-[9px] text-charcoal-light uppercase tracking-wider block">
                        {skill.category === "languages" ? "Language" : skill.category === "web" ? "Web Stack" : skill.category === "systems" ? "Assembly" : "Tooling"}
                      </span>
                    </div>
                  </div>

                  {/* Expandable descriptive overlay */}
                  <div 
                    className={`absolute inset-0 bg-cream-card p-4 flex flex-col justify-between text-left transition-all duration-300 select-none z-20 ${
                      isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-charcoal block truncate">{skill.name}</span>
                      <p className="text-[10px] text-charcoal-light leading-normal line-clamp-4">
                        {skill.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-cream-border pt-2 text-[9px] font-mono">
                      <span className="text-charcoal-light uppercase">Class: <span className="text-williams-purple dark:text-williams-gold font-bold">{skill.level}</span></span>
                      <span className="text-charcoal-light">{skill.years}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="math-certs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Discrete Math & Science */}
            <div className="lg:col-span-7 bg-cream-card border-2 border-cream-border rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-williams-purple dark:text-williams-gold mb-4">
                  <Terminal className="w-5 h-5 text-williams-purple dark:text-williams-gold" />
                  <h4 className="font-serif text-lg font-bold text-charcoal">Advanced Mathematics & Algorithmic Foundations</h4>
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed mb-6">
                  Synthesizing deep theoretical mathematical modeling with runtime data science algorithms, optimized to execute complex graph networks.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {SKILLS_DATA.mathScience.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-zinc-200/50 dark:bg-williams-purple/30 text-zinc-800 dark:text-williams-gold border border-zinc-300 dark:border-williams-gold/20 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 hover:border-zinc-400 dark:hover:border-williams-gold/50 transition-all cursor-default"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-williams-purple dark:bg-williams-gold animate-pulse" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Multilingual Info */}
              <div className="mt-8 pt-6 border-t border-cream-border">
                <span className="block font-mono text-[10px] uppercase text-charcoal-light font-bold tracking-wider mb-3">Multilingual Capabilities</span>
                <div className="grid grid-cols-3 gap-3">
                  {SKILLS_DATA.languages.map((l) => (
                    <div key={l.name} className="bg-cream-card-sub border border-cream-border p-3 rounded-xl hover:border-williams-purple/30 dark:hover:border-williams-gold/20 transition-all">
                      <span className="font-sans text-xs font-bold block text-charcoal">{l.name}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications Block */}
            <div className="lg:col-span-5 bg-cream-card border-2 border-cream-border rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-williams-purple dark:text-williams-gold mb-4">
                  <Award className="w-5 h-5 text-williams-purple dark:text-williams-gold" />
                  <h4 className="font-serif text-lg font-bold text-charcoal">Certifications & Accreditations</h4>
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed mb-6">
                  Dedicated to keeping pace with leading-edge architectures and generative workflows.
                </p>

                <div className="space-y-3">
                  {CERTIFICATIONS.map((cert, idx) => (
                    <a 
                      key={idx} 
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                      className={`group flex items-center justify-between p-3.5 bg-cream-card-sub hover:bg-zinc-200/50 dark:bg-black/40 dark:hover:bg-[#1a1a1a] rounded-2xl border border-cream-border transition-all duration-300 shadow-md cursor-pointer block ${getProviderCardHoverClass(cert.provider)}`}
                    >
                      <div className="flex items-center space-x-3.5">
                        {renderProviderLogo(cert.provider)}
                        
                        <div className="space-y-1">
                          <span className="text-xs sm:text-[13px] font-sans text-charcoal font-semibold leading-snug block transition-all">
                            {cert.name}
                          </span>
                          <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                            <span className={`font-bold uppercase ${getProviderBadgeClass(cert.provider)}`}>{cert.provider}</span>
                            <span>•</span>
                            <span>{cert.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-1.5 rounded-lg bg-cream-card border border-cream-border text-zinc-500 transition-all duration-300 flex-shrink-0 ml-2 ${getProviderArrowHoverClass(cert.provider)}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-cream-border text-center text-[10px] text-charcoal-light font-mono">
                Academic Accreditations completed 2025–2026
              </div>
            </div>

            {/* CodePath Advanced Technical Interview Prep Block */}
            <div className="lg:col-span-12 bg-cream-card border-2 border-cream-border rounded-3xl p-6 shadow-lg hover:border-williams-purple/30 dark:hover:border-williams-gold/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center bg-[#1b2a32]">
                  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="120" rx="20" fill="#1b2a32" />
                    <g transform="translate(10, 5)">
                      <text x="50" y="34" fill="#FFFFFF" fontSize="19" fontWeight="800" fontFamily='"Inter", "Space Grotesk", sans-serif' textAnchor="middle" letterSpacing="0.5">CODE</text>
                      <text x="50" y="59" fill="#FFFFFF" fontSize="19" fontWeight="800" fontFamily='"Inter", "Space Grotesk", sans-serif' textAnchor="middle" letterSpacing="0.5">PATH</text>
                      <g transform="translate(14, 68)">
                        {/* Spark/Asterisk path */}
                        <g transform="translate(6, 8)" stroke="#00e5a3" strokeWidth="3.5" strokeLinecap="round">
                          <line x1="0" y1="-8" x2="0" y2="8" />
                          <line x1="-7" y1="-4" x2="7" y2="4" />
                          <line x1="-7" y1="4" x2="7" y2="-4" />
                        </g>
                        <text x="21" y="15" fill="#00e5a3" fontSize="19" fontWeight="800" fontFamily='"Inter", "Space Grotesk", sans-serif' letterSpacing="0.5">ORG</text>
                      </g>
                    </g>
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      Advanced Technical Interview Prep
                    </span>
                    <span className="font-mono text-[9px] uppercase font-bold text-williams-purple dark:text-williams-gold bg-williams-purple/10 px-2 py-0.5 rounded border border-williams-purple/20">
                      Summer 2026 Course
                    </span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-charcoal">Advanced Technical Interview Prep (CodePath)</h4>
                  <p className="text-xs text-charcoal-light leading-relaxed mt-2 max-w-2xl">
                    Selected for CodePath's rigorous technical interview preparation curriculum, masterfully focusing on advanced algorithms, complex data structures, optimized time/space complexity analysis, and coding assessment design patterns.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 z-10 self-stretch md:self-auto justify-end">
                <a 
                  href="https://www.codepath.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2 bg-[#141414] hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-850 text-white font-mono text-xs font-semibold rounded-xl border border-cream-border transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Explore Community</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
