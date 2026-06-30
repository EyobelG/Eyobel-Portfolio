import { Project, Publication, Experience, Education, Certification } from "./types";

export const EDUCATION_DATA: Education[] = [
  {
    institution: "Tufts University",
    location: "Medford, MA",
    degree: "Post-Baccalaureate / MS Candidate in Computer Science",
    period: "July 2025 – June 2027",
    gpa: "4.0",
    details: [
      "Rigorous coursework in Systems Programming, Advanced Algorithms, Web Development, and Machine Learning.",
      "Developing strong full-stack and low-level software expertise."
    ]
  },
  {
    institution: "CodePath",
    location: "Remote / National",
    degree: "Advanced Software Engineering Fellow",
    period: "May 2026 – September 2026",
    details: [
      "Admitted to an intensive, highly selective algorithmic problem-solving program focused on complex data structures, algorithms, and technical evaluation methods.",
      "Engineered optimized software solutions weekly, analyzing runtime complexity benchmarks (Big O, space-time trade-offs)."
    ]
  },
  {
    institution: "University of Pennsylvania",
    location: "Philadelphia, PA",
    degree: "Independent School Teaching Residency (MS in Education Program)",
    period: "June 2022 – August 2024",
    details: [
      "Completed rigorous pedagogy coursework alongside intensive mathematics teaching residency at NMH.",
      "Authored query project about grading for equity and student motivation."
    ]
  },
  {
    institution: "Williams College",
    location: "Williamstown, MA",
    degree: "Bachelor of Arts in Mathematics",
    period: "September 2017 – June 2022",
    details: [
      "Dean's List: Fall 2020, Spring 2021, Fall 2021, Spring 2022.",
      "Completed advanced projects in Graph Theory, Linear Algebra, and Combinatorics.",
      "Participated actively in the prestigious SMALL REU program."
    ]
  },
  {
    institution: "Lideta Catholic Cathedral School",
    location: "Addis Ababa, Ethiopia",
    degree: "High School Diploma",
    period: "Graduated June 2016",
    details: [
      "Valedictorian, Mathematics Achievement Award.",
      "Scored in the Top 10 National Exam scores in Ethiopia (2016)."
    ]
  }
];

export const PUBLICATIONS_DATA: Publication[] = [
  {
    id: "pub-1",
    title: "Uniform Scrambles on Graphs",
    authors: "Cenek, L., Ferguson, L., Gebre, E., Marcussen, C., Meintjes, J., Morrison, R., ... & Ramakrishna, S.",
    venue: "Australasian Journal of Combinatorics, 87(1)",
    year: 2023,
    link: "https://ajc.maths.uq.edu.au/pdf/87/ajc_v87_p129.pdf",
    doi: "ajc_v87_p129",
    description: "Explores the properties of 'scramble number' on graphs—a metric related to the graph's structural complexity—demonstrating uniform scrambles and proving lower bounds for complex networks."
  },
  {
    id: "pub-2",
    title: "Scramble number and tree-cut decompositions",
    authors: "Cenek, L., Ferguson, L., Gebre, E., et al.",
    venue: "The Art of Discrete and Applied Mathematics, 8(2)",
    year: 2025,
    doi: "10.26493/2590-9770.1792.fb4",
    description: "Establishes tight connections between tree-cut width decompositions and graph scramble numbers, offering computational insights into routing and game theory on finite graphs."
  },
  {
    id: "pub-3",
    title: "Bounds on higher graph gonality",
    authors: "Cenek, L., Ferguson, L., Gebre, E., Marcussen, C., Meintjes, J., Morrison, R., ... & Ramakrishna, S.",
    venue: "arXiv Preprint",
    year: 2022,
    arxiv: "2206.06907",
    link: "https://arxiv.org/abs/2206.06907",
    description: "Derives mathematical bounds for higher divisonal gonality of graphs, drawing direct applications to the Riemann-Roch theory for graphs and network flow optimization."
  },
  {
    id: "pub-4",
    title: "The gonality of circulant graphs",
    authors: "Cenek, L., Ferguson, L., Gebre, E., Marcussen, C., Meintjes, J., Morrison, R., Ostermeyer, L., & Ramakrishna, S.",
    venue: "arXiv Preprint",
    year: 2025,
    arxiv: "2508.05761",
    link: "https://arxiv.org/abs/2508.05761",
    description: "Investigates chip-firing games and divisor theory on circulant graphs to determine their gonality, solving open conjectures about symmetric networks."
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "proj-1",
    title: "Universal Machine (UM)",
    category: "Systems",
    tags: ["Systems Programming", "C", "Virtualization"],
    description: "Architected a custom 32-bit virtual machine in C capable of loading, parsing, and executing complex software binaries.",
    details: [
      "Designed and implemented a custom instruction set featuring 14 distinct micro-operations (bitwise, arithmetic, segmented loading, I/O registers).",
      "Built a custom segmented memory management system with zero-leak tracking.",
      "Engineered direct support for executing assembly-like compiled binaries."
    ],
    tech: ["C", "GCC", "Valgrind", "GDB", "Systems Architecture"],
    impact: "Able to run complex operating-system-like binaries in a sandboxed, virtualized environment."
  },
  {
    id: "proj-2",
    title: "Profiling & Performance Tuning",
    category: "Systems",
    tags: ["C", "Valgrind", "Optimization"],
    description: "Executed aggressive performance tuning of the Universal Machine to eliminate execution bottlenecks.",
    details: [
      "Identified and isolated performance hotspots via Valgrind, Callgrind, and KCachegrind profiling tools.",
      "Replaced high-overhead memory abstractions with highly optimized contiguous arrays and bitwise micro-operations.",
      "Achieved an astronomical 3348.28% execution speedup from the baseline virtual machine implementation."
    ],
    tech: ["C", "Valgrind", "Callgrind", "KCachegrind", "Performance Profiling", "Low-Level Optimization"],
    impact: "Turned a slow, simulation-based emulator into a production-grade, highly performant systems executor."
  },
  {
    id: "proj-3",
    title: "Arith: Low-Loss Image Compressor",
    category: "Systems",
    tags: ["Signal Processing", "C", "Algorithms"],
    description: "Implemented a full JPEG-style image compressor/decompressor in C using advanced mathematical transformations.",
    details: [
      "Applied Discrete Cosine Transform (DCT) and quantization matrices to translate spatial image pixels into the frequency domain.",
      "Engineered chroma subsampling and aggressive bitpacking to shrink images down to a strict 3:1 compression ratio.",
      "Outperformed standard reference implementations by maintaining high visual fidelity with < 2% total image quality loss."
    ],
    tech: ["C", "Discrete Cosine Transform (DCT)", "Bitpacking", "Color Space Transformation", "Algorithms"],
    impact: "Achieved powerful reduction in memory storage requirements while strictly preserving perceptual image quality."
  },
  {
    id: "proj-4",
    title: "Skillswap",
    category: "Web Apps",
    tags: ["Full Stack", "React", "Node.js", "MongoDB"],
    description: "Engineered a peer-to-peer knowledge exchange web platform enabling community skill-sharing.",
    details: [
      "Designed an intuitive, responsive frontend using React to handle real-time session discovery, listings, and tutor bookings.",
      "Built a secure backend API in Node.js/Express, utilizing MongoDB for flexible user profile and transaction logging.",
      "Implemented JWT authentication and state-driven scheduling tools."
    ],
    tech: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JWT Auth"],
    impact: "Connected community learners, facilitating over 100+ peer tutoring hours with decentralized coordination."
  },
  {
    id: "proj-5",
    title: "files4pix: Binary File Recovery",
    category: "Systems",
    tags: ["Data Recovery", "C", "Bit Manipulation"],
    description: "Engineered a raw forensic data recovery tool to reconstruct corrupted image files from low-level storage drives.",
    details: [
      "Analyzed raw binary headers and byte markers to isolate starts and ends of JPG/PNG payloads.",
      "Used bit manipulation to repair broken headers and byte boundaries.",
      "Restored unreadable pixel arrays back into fully renderable images."
    ],
    tech: ["C", "Hex Editing", "Bitwise Operators", "File System Forensics"],
    impact: "Successfully recovered high-value photos from damaged SD cards with zero reference cataloging."
  },
  {
    id: "proj-6",
    title: "Locality: Cache-Optimized Image Processor",
    category: "Systems",
    tags: ["C", "Computer Architecture", "Hardware Cache"],
    description: "Optimized image processing routines by maximizing spatial and temporal CPU cache hits.",
    details: [
      "Analyzed row-major vs. column-major memory layouts to design cache-friendly pixel iteration algorithms.",
      "Significantly reduced execution latency and memory stalls during large-scale image transformations (rotations, blurs).",
      "Maximized L1/L2 cache hit-rates through blocking and tiling optimizations."
    ],
    tech: ["C", "Valgrind Cachegrind", "Cache Optimization", "Systems Programming"],
    impact: "Achieved a 4x reduction in run latency on 4K image transformations compared to unoptimized loops."
  },
  {
    id: "proj-7",
    title: "UMASM: Macro Assembly & RPN Calculator",
    category: "Systems",
    tags: ["Assembly", "Compilers", "Virtual Machines"],
    description: "Authored a stack-based RPN Calculator and recursive factorial calculator using a custom macro assembly language.",
    details: [
      "Leveraged a custom macro assembly designed specifically for the Universal Machine architecture.",
      "Built low-level stack abstractions, division handlers, and recursive function call frames entirely in machine code.",
      "Implemented a fully robust input parser to execute commands interactively."
    ],
    tech: ["UM Assembly", "Assemblers", "RPN Logic", "Recursion", "Software Design"],
    impact: "Demonstrated full Turing-completeness of the custom 32-bit VM with modular assembly software packages."
  },
  {
    id: "proj-8",
    title: "Metro Transit Simulator",
    category: "Theory/Math",
    tags: ["Data Structures", "C++", "Simulation"],
    description: "Built a transit system flow simulator utilizing classical computer science data structures.",
    details: [
      "Engineered abstract Queues and circular Doubly Linked Lists to schedule train arrivals and dispatch passenger flows.",
      "Implemented interactive command-line controls to monitor congestion metrics in real-time.",
      "Simulated passenger behaviors under unexpected train delays to optimize dispatch cycles."
    ],
    tech: ["C++", "Queues", "Linked Lists", "Event-Driven Simulation", "Algorithms"],
    impact: "Allowed transit planners to identify structural bottleneck stations in municipal train networks."
  },
  {
    id: "proj-9",
    title: "Binary Bomb Reverse Engineering",
    category: "Systems",
    tags: ["Security", "Reverse Engineering", "Assembly"],
    description: "De-fused a layered virtual security bomb by reverse engineering raw executable binaries.",
    details: [
      "Disassembled compiled machine code using GDB and objdump to analyze control-flow trees.",
      "Uncovered complex nested conditions, password comparisons, recursive mathematical structures, and pointer offsets.",
      "Safely bypassed anti-tamper phases without triggering the explosive routines."
    ],
    tech: ["GDB", "x86/64 Assembly", "Objdump", "Security Analysis", "Binary Exploitation"],
    impact: "Developed a deep understanding of assembly control flow, memory buffers, and program security auditing."
  },
  {
    id: "proj-10",
    title: "Typewriter: Back-end Text Editor Engine",
    category: "Systems",
    tags: ["Data Structures", "C++", "Low-Level Design"],
    description: "Developed the low-overhead mechanical back-end for a text editing application.",
    details: [
      "Implemented a Doubly Linked List to handle character additions, deletions, and cursor jumps with O(1) complexity.",
      "Designed stable line wrapping and paragraph alignment handlers.",
      "Guaranteed memory leaks were fully avoided using smart pointers and explicit destructors."
    ],
    tech: ["C++", "Memory Management", "Doubly Linked List", "API Design"],
    impact: "Provides clean, lightning-fast keystroke responsiveness even when manipulating extremely large documents."
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: "exp-1",
    role: "Resident Counselor (Wharton Summer Discovery)",
    organization: "The Wharton School - San Francisco",
    location: "San Francisco Bay Area / USF Campus",
    period: "July 2025 – August 2025",
    type: "Leadership",
    bullets: [
      "Collaborated with a team of 10 staff members to manage the residential life and wellness of pre-college high school students on campus.",
      "Supervised daily program logistics, social activities, academic schedules, and off-campus excursions around the San Francisco Bay Area.",
      "Provided close mentorship, helping students navigate academic rigor, build social confidence, and transition smoothly."
    ],
    skills: ["Leadership", "Community Management", "Logistics Planning", "Crisis Resolution"]
  },
  {
    id: "exp-2",
    role: "Residential Math Faculty",
    organization: "EF Academy Pasadena",
    location: "Pasadena, CA",
    period: "August 2024 – May 2025",
    type: "Teaching",
    bullets: [
      "Served as a full-time mathematics instructor responsible for teaching AP Calculus BC (2 sections), Linear Algebra, and Integrated Math 3.",
      "Co-taught 'Innovation and Impact'—a project-based class encouraging students to design community-driven solutions mapped to UN Sustainable Goals.",
      "Applied Project-Based Learning (PBL) and Competency-Based Learning (CBL) to stimulate deep mathematical reasoning and application.",
      "Facilitated the Outdoor Sports Club twice a week, leading recreational hiking, climbing, and running excursions."
    ],
    skills: ["AP Calculus BC", "Linear Algebra", "Project-Based Learning", "Pedagogy", "Coaching"]
  },
  {
    id: "exp-3",
    role: "Resident Counselor",
    organization: "UMass Amherst Pre-College (Summer Discovery)",
    location: "Amherst, MA",
    period: "June 2024 – August 2024",
    type: "Leadership",
    bullets: [
      "Oversaw student safety, emotional wellness, and community integration for biweekly cohorts of pre-college students.",
      "Coordinated group team-building exercises and solved fast-paced residential conflicts."
    ],
    skills: ["Mentorship", "Problem-Solving", "Public Speaking", "Community Care"]
  },
  {
    id: "exp-4",
    role: "Penn Teaching Fellow in Mathematics",
    organization: "Northfield Mount Hermon School",
    location: "Gill, MA",
    period: "August 2022 – May 2024",
    type: "Teaching",
    bullets: [
      "Selected for the highly competitive Penn Residency Master's program. Designed and taught independent full-year courses in Linear Algebra, Advanced Calculus I, Algebra II, and Diversity & Social Justice.",
      "Advised cohorts of 6-7 high school students, maintaining regular reports with parents and counseling boards regarding academic growth.",
      "Led weekly mathematical help desk sessions in the NMH Math/Science Center.",
      "Did intensive pedagogy research, developing a portfolio focused on 'Grading for Equity' and student cognitive motivation."
    ],
    skills: ["Curriculum Design", "Equitable Grading", "Advanced Calculus", "Dorm Supervision", "Advising"]
  },
  {
    id: "exp-5",
    role: "Undergraduate Researcher & Author",
    organization: "SMALL REU (Williams College)",
    location: "Williamstown, MA",
    period: "June 2021 – August 2021",
    type: "Research",
    bullets: [
      "Joined the prestigious SMALL REU Chip-Firing Project, working in one of the premier undergraduate mathematics programs in the United States.",
      "Collaborated with Prof. Ralph Morrison and a team of researchers to co-author four research papers regarding divisior theory, scramble number, and higher gonality of graphs.",
      "Presented research findings and open conjectures at the national Young Mathematicians Conference."
    ],
    skills: ["Graph Theory", "Algebraic Combinatorics", "Academic Writing", "LaTeX", "Collaboration"]
  },
  {
    id: "exp-6",
    role: "Mathematics Teaching Assistant",
    organization: "Williams College Mathematics Dept",
    location: "Williamstown, MA",
    period: "February 2021 – June 2022",
    type: "Teaching",
    bullets: [
      "TA for MATH 341 (Probability) under Professor Mihai Stoiciu, grading assignments and running weekly interactive review sessions for 40+ students.",
      "TA for MATH 435 (Chip-firing Games on Graphs) under Professor Ralph Morrison, supporting research projects and holding individual office hours."
    ],
    skills: ["Probability Theory", "Chip-Firing Games", "Office Hours", "Technical Explanation"]
  },
  {
    id: "exp-7",
    role: "Mathematics Research Assistant",
    organization: "Williams College Math Dept (with Prof. Chad Topaz)",
    location: "Williamstown, MA",
    period: "June 2020 – September 2020",
    type: "Research",
    bullets: [
      "Researched differential equation models of vegetation patterns, simulating biological spatial clustering in dryland ecosystems.",
      "Wrote analysis scripts in MATLAB, Mathematica, and LaTeX to model pattern nucleation boundaries."
    ],
    skills: ["MATLAB", "Mathematica", "Differential Equations", "Numerical Simulation"]
  }
];

export const SKILLS_DATA = {
  programming: [
    { name: "C/C++", level: 95 },
    { name: "Python", level: 90 },
    { name: "Java", level: 85 },
    { name: "JavaScript / TS", level: 88 },
    { name: "Assembly", level: 85 },
    { name: "SQL", level: 80 },
    { name: "MySQL", level: 85 },
    { name: "R", level: 75 },
    { name: "MATLAB", level: 80 }
  ],
  webDev: [
    "React",
    "Node.js",
    "Express",
    "FastAPI",
    "Vite",
    "MongoDB",
    "REST APIs",
    "Tailwind CSS",
    "HTML5 / CSS3",
    "JSON / AJAX",
    "Heroku & Render"
  ],
  mathScience: [
    "Graph Theory",
    "Algebraic Combinatorics",
    "Linear Algebra",
    "Probability & Statistics",
    "Differential Equations",
    "Data Visualization (D3.js)",
    "Scikit-Learn",
    "LaTeX",
    "Algorithm Design"
  ],
  languages: [
    { name: "English", proficiency: "Full Professional" },
    { name: "Amharic", proficiency: "Native / Bilingual" },
    { name: "French", proficiency: "Introductory" }
  ]
};

export const CERTIFICATIONS: Certification[] = [
  {
    name: "Applied AI Foundations",
    provider: "OpenAI Academy",
    date: "Jun 2026",
    link: "https://academy.openai.com/home/certificate/un0leifgya"
  },
  {
    name: "Introduction to Model Context Protocol (MCP)",
    provider: "Anthropic",
    date: "Jun 2026",
    link: "https://verify.skilljar.com/c/ep65oewbfxqf"
  },
  {
    name: "Agents and Workflows",
    provider: "OpenAI Academy",
    date: "Jun 2026",
    link: "https://academy.openai.com/home/certificate/zhj17oaovu"
  },
  {
    name: "AI Fluency for students",
    provider: "Anthropic",
    date: "Jun 2026",
    link: "https://verify.skilljar.com/c/ddapxvd593hq"
  },
  {
    name: "Introduction to agent skills",
    provider: "Anthropic",
    date: "Jun 2026",
    link: "https://verify.skilljar.com/c/2j9qmfq3ubuq"
  },
  {
    name: "Applied Skills: Create agents in Microsoft Copilot Studio",
    provider: "Microsoft",
    date: "Jun 2026",
    link: "https://learn.microsoft.com/api/credentials/share/en-us/GebreEyobel-1602/AE4C7762F9CB4710?sharingId=3F2F02C3E5253A2D"
  },
  {
    name: "Hands-On AI: Build a Generative Language Model from Scratch",
    provider: "LinkedIn Learning",
    date: "Jun 2026",
    link: "https://www.linkedin.com/learning/certificates/ff98d5022372e54e640776e452690f2645f900816933507843dc982841c45b1f"
  },
  {
    name: "Learn C: Pointers and Memory",
    provider: "Codecademy",
    date: "Jan 2026",
    link: "https://www.codecademy.com/profiles/ethiopianeph/certificates/3c4790154f3548a087a71a7f5b3cea25"
  },
  {
    name: "Learn C++",
    provider: "Codecademy",
    date: "Jun 2025",
    link: "https://www.codecademy.com/profiles/ethiopianeph/certificates/b74a2390dfc4127fa5d43fe147425ad0"
  },
  {
    name: "Social & Behavioral Research Investigators",
    provider: "CITI Program",
    date: "May 2026",
    link: "https://www.citiprogram.org/verify/?w0ac48d32-ae96-442e-96e8-4b55afe7f7b8-37250811"
  }
];
