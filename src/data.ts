import { Project, Publication, Experience, Education, Certification, Photo } from "./types";

export const PHOTOS_DATA: Photo[] = [
  { id: "getty-villa", src: "/photos/getty-villa-gardens.jpg", caption: "The Getty Villa", location: "Los Angeles, CA" },
  { id: "painted-ladies", src: "/photos/painted-ladies-sf.jpg", caption: "Painted Ladies, Alamo Square", location: "San Francisco, CA" },
  { id: "golden-gate", src: "/photos/golden-gate-bridge.jpg", caption: "Golden Gate Bridge", location: "San Francisco, CA" },
  { id: "twin-peaks", src: "/photos/twin-peaks-sf-skyline.jpg", caption: "City skyline from Twin Peaks", location: "San Francisco, CA" },
  { id: "isgm-tapestry", src: "/photos/isabella-stewart-gardner-tapestry.jpg", caption: "Woven sculpture installation", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "miro-prints", src: "/photos/miro-prints-isgm.jpg", caption: "Miró print series", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "isgm-night-1", src: "/photos/isgm-courtyard-night-1.jpg", caption: "Courtyard at night", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "isgm-night-2", src: "/photos/isgm-courtyard-night-2.jpg", caption: "Courtyard at night, another angle", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "old-state-house", src: "/photos/old-state-house-boston.jpg", caption: "Old State House", location: "Boston, MA" },
  { id: "freedom-trail-clock", src: "/photos/freedom-trail-clock.jpg", caption: "Street clock on the Freedom Trail", location: "Boston, MA" },
  { id: "isgm-aerial", src: "/photos/isgm-courtyard-aerial.jpg", caption: "Courtyard from above", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "koi-pond", src: "/photos/koi-pond.jpg", caption: "Koi pond", location: "Boston, MA" },
  { id: "carved-elephants", src: "/photos/carved-elephants.jpg", caption: "Carved wooden elephants", location: "New York, NY" },
  { id: "face-masks", src: "/photos/face-masks-installation.jpg", caption: "Face mask installation", location: "Museum of Fine Arts, Boston" },
  { id: "hanging-sculptures", src: "/photos/hanging-sculptures.jpg", caption: "Hanging fiber sculptures", location: "Museum of Fine Arts, Boston" },
  { id: "faneuil-hall", src: "/photos/faneuil-hall-statue.jpg", caption: "Faneuil Hall", location: "Boston, MA" },
  { id: "palace-fine-arts", src: "/photos/palace-of-fine-arts.jpg", caption: "Palace of Fine Arts", location: "San Francisco, CA" },
  { id: "orange-ring", src: "/photos/orange-ring-sculpture.jpg", caption: "Ring sculpture", location: "New York, NY" },
  { id: "meditating-figure", src: "/photos/meditating-figure-sculpture.jpg", caption: "Meditating figure sculpture", location: "New York, NY" },
  { id: "quilt-exhibition", src: "/photos/quilt-exhibition.jpg", caption: "Quilt exhibition", location: "Boston, MA" },
  { id: "vessel", src: "/photos/vessel-hudson-yards.jpg", caption: "The Vessel", location: "Hudson Yards, New York, NY" },
  { id: "nyc-aerial", src: "/photos/nyc-aerial-rooftop.jpg", caption: "Manhattan skyline from a rooftop", location: "New York, NY" },
  { id: "boston-common-snow", src: "/photos/boston-common-snow.jpg", caption: "Boston Common in snow", location: "Boston, MA" },
  { id: "oculus", src: "/photos/oculus-wtc.jpg", caption: "The Oculus", location: "World Trade Center, New York, NY" },
  { id: "north-end", src: "/photos/north-end-brownstone.jpg", caption: "Brownstone corner building", location: "North End, Boston, MA" },
  { id: "matcha-dumbo", src: "/photos/matcha-latte-brooklyn-bridge.jpg", caption: "Matcha latte, Manhattan Bridge view", location: "DUMBO, Brooklyn, NY" },
  { id: "isgm-fashion", src: "/photos/isgm-fashion-exhibit.jpg", caption: "Fashion exhibit", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "disneyland-tomorrowland", src: "/photos/disneyland-tomorrowland-night.jpg", caption: "Tomorrowland at night", location: "Disneyland, Anaheim, CA" },
  { id: "disneyland-castle", src: "/photos/disneyland-sleeping-beauty-castle.jpg", caption: "Sleeping Beauty Castle", location: "Disneyland, Anaheim, CA" },
  { id: "hollywood-sign", src: "/photos/hollywood-sign.jpg", caption: "Hollywood Sign", location: "Los Angeles, CA" },
  { id: "hogsmeade", src: "/photos/harry-potter-hogsmeade-night.jpg", caption: "Hogsmeade at night", location: "Universal Studios, Los Angeles, CA" },
  { id: "dca-pier", src: "/photos/disney-california-adventure-pier.jpg", caption: "Pixar Pier", location: "Disney California Adventure, Anaheim, CA" },
  { id: "mirror-sculpture", src: "/photos/geodesic-mirror-sculpture.jpg", caption: "Geodesic mirror sculpture", location: "Los Angeles, CA" },
  { id: "joshua-tree-1", src: "/photos/joshua-tree-1.jpg", caption: "Joshua Tree", location: "Joshua Tree National Park, CA" },
  { id: "joshua-tree-2", src: "/photos/joshua-tree-2.jpg", caption: "Joshua Tree, desert floor", location: "Joshua Tree National Park, CA" },
  { id: "desert-botanical", src: "/photos/desert-botanical-garden.jpg", caption: "Desert botanical garden", location: "California" },
  { id: "still-life-flowers", src: "/photos/still-life-flowers-painting.jpg", caption: "Still life with flowers", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "van-gogh-irises", src: "/photos/van-gogh-irises.jpg", caption: "Van Gogh, Irises", location: "Los Angeles, CA" },
  { id: "roman-forum", src: "/photos/roman-forum-painting.jpg", caption: "Roman Forum painting", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "mythological-ceiling", src: "/photos/mythological-ceiling-painting.jpg", caption: "Mythological ceiling painting", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "orange-rooftop-house", src: "/photos/little-orange-house-rooftop.jpg", caption: "Rooftop gatehouse", location: "New York, NY" },
  { id: "bookstore-ceiling", src: "/photos/bookstore-ceiling-stacks.jpg", caption: "Bookstore with stacked ceiling shelves", location: "New York, NY" },
  { id: "griffith-sunset", src: "/photos/griffith-observatory-sunset.jpg", caption: "Griffith Observatory at sunset", location: "Los Angeles, CA" },
  { id: "lacma-urban-light", src: "/photos/lacma-urban-light.jpg", caption: "Urban Light installation", location: "LACMA, Los Angeles, CA" },
  { id: "ethiopian-food", src: "/photos/ethiopian-food-platter.jpg", caption: "Ethiopian food platter", location: "Los Angeles, CA" },
  { id: "baker-beach", src: "/photos/baker-beach-golden-gate.jpg", caption: "Baker Beach, Golden Gate view", location: "San Francisco, CA" },
  { id: "isgm-spring", src: "/photos/isgm-courtyard-spring.jpg", caption: "Courtyard in spring", location: "Isabella Stewart Gardner Museum, Boston" },
  { id: "brunch-waffle", src: "/photos/brunch-waffle-latte.jpg", caption: "Brunch, waffles and latte art", location: "Los Angeles, CA" },
  { id: "venice-beach-houses", src: "/photos/venice-beach-houses.jpg", caption: "Venice Beach houses", location: "Venice, Los Angeles, CA" },
  { id: "hollywood-sign-wide", src: "/photos/hollywood-sign-wide.jpg", caption: "Hollywood Sign, wide view", location: "Los Angeles, CA" },
  { id: "griffith-dome", src: "/photos/griffith-observatory-dome.jpg", caption: "Griffith Observatory dome", location: "Los Angeles, CA" },
  { id: "santa-monica-sunset", type: "video", src: "/videos/santa-monica-pier-sunset.mp4", caption: "Sunset at Santa Monica Pier", location: "Santa Monica, CA" },
  { id: "venice-skatepark", type: "video", src: "/videos/venice-beach-skatepark.mp4", caption: "Skatepark", location: "Venice Beach, Los Angeles, CA" },
  { id: "getty-center-aerial", type: "video", src: "/videos/getty-center-aerial.mp4", caption: "Aerial view", location: "The Getty Center, Los Angeles, CA" },
  { id: "aquarium-stingray", type: "video", src: "/videos/aquarium-stingray.mp4", caption: "Stingray", location: "Aquarium" }
];

export const EDUCATION_DATA: Education[] = [
  {
    institution: "Tufts University",
    location: "Medford, MA",
    degree: "Master's in Computer Science Candidate",
    period: "July 2025 – June 2027",
    website: "https://www.tufts.edu",
    details: [
      "Rigorous coursework in Systems Programming, Advanced Algorithms, Web Development, and Machine Learning.",
      "Current coursework (Fall 2026): Machine Learning, Cloud Computing, Programming Languages.",
      "Developing strong full-stack and low-level software expertise."
    ]
  },
  {
    institution: "CodePath",
    location: "Remote / National",
    degree: "Advanced Software Engineering Fellow",
    period: "May 2026 – September 2026",
    website: "https://www.codepath.org",
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
    website: "https://www.gse.upenn.edu",
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
    website: "https://www.williams.edu",
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
    website: "https://lidetacatholiccathedralschool.com",
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
    authors: "Cenek, L., Ferguson, L., Gebre, E., Marcussen, C., Meintjes, J., Morrison, R., Ostermeyer, L., & Ramakrishna, S.",
    venue: "Australasian Journal of Combinatorics, 96(3)",
    year: 2026,
    doi: "ajc_v96_p395-411",
    arxiv: "2206.06907",
    link: "https://ajc.maths.uq.edu.au/pdf/96/ajc_v96_p395-411.pdf",
    description: "Proves new lower and upper bounds on the higher gonalities of finite graphs, generalizing first-gonality bounds involving independence number and scramble number, and shows that computing second gonality is NP-hard when restricted to multiplicity-free divisors."
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
    id: "proj-quantfolio",
    title: "QuantFolio: Portfolio Analytics Platform",
    category: "Web Apps",
    tags: ["Quantitative Finance", "Full-Stack", "Data Visualization"],
    description: "Built and deployed a full-stack quantitative finance platform that analyzes portfolio risk, optimizes allocations, validates them out-of-sample, and paper-trades the winning strategy live through Alpaca.",
    details: [
      "Computes risk-adjusted performance metrics from live market data — Sharpe and Sortino ratios, maximum drawdown, 95% Value at Risk and Conditional VaR, plus beta and Jensen's alpha measured against the S&P 500.",
      "Solves mean-variance and Black-Litterman equilibrium optimization to trace the efficient frontier, identifying the max-Sharpe and minimum-volatility allocations and plotting the user's own portfolio against the curve.",
      "Walk-forward backtests six allocation rules — max-Sharpe, risk parity, hierarchical risk parity, and equal-weight among them — with transaction costs, refitting at each rebalance on only the data available at the time to measure genuine out-of-sample performance instead of an in-sample curve fit.",
      "Adds statistical rigor with deflated and probabilistic Sharpe ratios, stationary-bootstrap confidence intervals, and a GARCH(1,1) volatility model fit by maximum likelihood, implemented from the underlying math rather than pulled from a library.",
      "Closes the loop from analysis to execution: a live Alpaca paper-trading integration auto-selects whichever strategy currently backtests best out-of-sample, diffs it against real account positions, and places the rebalancing orders on user confirmation.",
      "Designed the API so slower upstream metadata calls degrade gracefully rather than failing the analysis, and cached price downloads to stay within provider rate limits."
    ],
    tech: ["Python", "FastAPI", "React", "TypeScript", "PyPortfolioOpt", "pandas", "NumPy", "Recharts", "Alpaca API", "Docker", "Render"],
    github: "https://github.com/EyobelG/quant-portfolio-analytics",
    liveUrl: "https://quant-portfolio-web.onrender.com",
    impact: "Turns portfolio analysis into a tradeable decision — showing not just where a real portfolio sits versus the efficient frontier, but which allocation actually holds up out-of-sample, then executing it live in a paper account."
  },
  {
    id: "proj-scoop-site",
    title: "SCOOP: Open Carbon Accounting (in progress)",
    category: "Web Apps",
    tags: ["Data Visualization", "Front-End", "Standards"],
    description: "Designed and built the public site for SCOOP (Sustainable Carbon Options with Open Protocols), the Tufts Auster Center's open carbon-accounting platform and reference implementation for the IEEE P7802 MMRV standard.",
    details: [
      "Translates the project's core data model — carbon as time-stamped, source-attributed `carbon_event` records carrying an explicit measurement maturity level — into an interactive explanation aimed at engineers and standards reviewers.",
      "Built an annotated walkthrough of a single carbon event, tracing it from a ~6-second power read through integration to kWh, grid-factor attribution, and the ledger entry that records method and coverage.",
      "Built a scenario timeline contrasting estimated versus measured-and-settled carbon, labeled so projected years read as scenarios rather than measurements.",
      "Visualized the measured record from metered lab-server data, with each point representing one settled accounting period.",
      "Honors `prefers-reduced-motion`, disabling the ambient animation throughout for motion-sensitive visitors."
    ],
    tech: ["TypeScript", "React", "Data Visualization", "CSS Animation", "Vercel"],
    liveUrl: "https://website-jade-eta-97.vercel.app/",
    impact: "Front-end work on an active research project: gives the IEEE P7802 working group a public explanation of the SCOOP core model. The standard and platform are the working group's."
  },
  {
    id: "proj-ml-reading-level",
    title: "Reading-Level Difficulty Classification",
    category: "Machine Learning",
    tags: ["NLP", "Transformers", "Model Evaluation"],
    description: "Built a text-classification ML pipeline to predict reading difficulty (lower-level vs. upper-level) across thousands of Project Gutenberg passages, for Tufts CS 135.",
    details: [
      "Baseline (Problem 1): Bag-of-Words (CountVectorizer) features into L2-regularized Logistic Regression (C=0.01).",
      "Caught and fixed a cross-validation data leak caused by author repetition across folds by switching to author-grouped 5-fold CV, so held-out scores reflect genuine generalization rather than memorized author style.",
      "Deep model (Problem 2): fine-tuned `deberta-v3-large` end-to-end on Tufts HPC GPU nodes with 10-fold author-grouped CV (learning rate 4e-6).",
      "Achieved 0.792 CV AUROC and 0.7726 test AUROC — ranked top 3 of the entire class on the Gradescope leaderboard."
    ],
    tech: ["Python", "scikit-learn", "PyTorch", "HuggingFace Transformers", "deberta-v3-large", "Tufts HPC"],
    impact: "Top-3 class result built on a methodology fix most submissions missed: grouping cross-validation splits by author to stop leakage from inflating the score."
  },
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
  },
  {
    id: "proj-11",
    title: "PlayDate",
    category: "Web Apps",
    tags: ["iOS", "SwiftUI", "Firebase", "AI-Assisted Dev"],
    description: "A native iOS dating app built with Claude — two matched users must play a real-time mini-game together in a shared 'Game Arena' before chat unlocks, replacing swiping with cooperative play.",
    details: [
      "Architected persistence behind a single PlayDatesBackend protocol with swappable in-memory mock and Firebase (Firestore/Auth/Storage) implementations, so the app builds and runs fully featured with zero Firebase SDK installed.",
      "Built a real-time 1v1 Game Arena spanning a dozen+ mini-games (Chess Duel, Vibe Mapping, Harmonic Match, Tarot Connection, Neon Stack 3D, trivia, and more), each gating chat unlock behind a server-enforced compatibility-score threshold.",
      "Implemented full messaging with photo, GIF, audio, video, and location attachments, plus live voice/video calling.",
      "Maintained a disciplined AI-assisted engineering workflow: syntax-check/build/test shell scripts, XCTest unit and UI smoke suites, and a pack of role-specific agent prompts (build, test, regression-triage, quality-gate) for working with Claude Code.",
      "327 Swift files across 30+ XCTest suites, with dedicated coverage on safety-critical paths: age verification/age gating, content moderation, photo/face verification, secure reporting, and location-sharing privacy. GitHub Actions CI/CD on every push."
    ],
    tech: ["Swift", "SwiftUI", "Firebase (Firestore/Auth/Storage)", "XCTest", "MVVM", "CI/CD"],
    impact: "A fully-featured, testable iOS dating app where compatibility is measured through shared play instead of profile scrolling — architected for AI-assisted development from day one.",
    image: "/projects/playdate-matches.png"
  },
  {
    id: "proj-12",
    title: "ContextLens: Python Tests",
    category: "Systems",
    tags: ["VS Code Extension", "LLM", "RAG", "TypeScript", "Published"],
    description: "A published VS Code extension that generates Python unit tests with an LLM and verifies them by actually executing them in a sandbox, auto-repairing failures instead of trusting generated code blindly.",
    details: [
      "Built a closed-loop generate-and-verify pipeline: an LLM writes unittest tests, a sandboxed subprocess runs python3 -m unittest against them, and failures are fed back into the next model attempt (up to a configurable retry count) rather than surfacing broken tests.",
      "Designed a lightweight, embeddings-free RAG retrieval engine from scratch — per-function/class chunking with stopword-filtered term-frequency scoring — that supplies relevant codebase context for both test generation and a second AI review pass flagging bugs, duplicate logic, and convention drift.",
      "Implemented multi-provider LLM routing (OpenAI-compatible, Anthropic, Google Gemini) with automatic provider detection, environment-variable credential fallback, and an explicit override setting for non-standard API key formats.",
      "Extended static analysis to detect Python class methods and nested functions (not just free functions) by walking the document for enclosing class/function context, with bracket-aware parameter parsing.",
      "Shipped it for real: unit test suite (Node's built-in test runner), MIT license, custom icon, and a published listing on the VS Code Marketplace."
    ],
    tech: ["TypeScript", "VS Code Extension API", "esbuild", "Node.js", "OpenAI/Anthropic/Gemini APIs"],
    impact: "Live on the VS Code Marketplace — install it, generate tests on a real Python function, and watch it verify them in a sandbox before you see them.",
    github: "https://github.com/EyobelG/ContextLens",
    marketplace: "https://marketplace.visualstudio.com/items?itemName=eyobelg.context-lens-python"
  },
  {
    id: "proj-13",
    title: "Receipt Scanner: OCR Data Extractor",
    category: "Systems",
    tags: ["Computer Vision", "OCR", "Python"],
    description: "Built a receipt-scanning pipeline that corrects skewed photos with computer-vision perspective transforms, then OCRs and parses out vendor, date, total, and tax.",
    details: [
      "Detected receipt edges and contours and applied a four-point perspective transform (OpenCV, imutils) to de-skew photographed receipts.",
      "Converted receipts to high-contrast binary images with local adaptive thresholding (scikit-image) to sharpen text for OCR.",
      "Ran images through Tesseract OCR (pytesseract), experimenting with page-segmentation modes to fit the noisy receipt-photo domain.",
      "Parsed vendor, date, total, and tax from raw OCR output with regex, handling inconsistent date/currency formats and common OCR errors."
    ],
    tech: ["Python", "OpenCV", "imutils", "scikit-image", "Tesseract OCR", "pytesseract", "Regex"],
    github: "https://github.com/EyobelG/receipt_scanner_project",
    impact: "Turns a photo of a paper receipt into structured, queryable data without manual entry."
  },
  {
    id: "proj-14",
    title: "WhatsUp: gRPC Chat Service",
    category: "Systems",
    tags: ["Go", "gRPC", "Protocol Buffers", "Distributed Systems"],
    description: "A client/server chat application built on gRPC and Protocol Buffers in Go, with token-based auth enforced by a server-side interceptor and a central mail-exchange model for message delivery.",
    details: [
      "Authored the .proto service definition \u2014 ChatMessage/ChatMessages/UserList/AuthToken message types and the Connect, Send, Fetch, List, and Disconnect RPCs \u2014 and generated the Go stubs via protoc with protoc-gen-go and protoc-gen-go-grpc.",
      "Implemented token-based authentication: the client registers once, receives a connection token, and attaches it as outgoing gRPC metadata on every subsequent call, which a unary server interceptor validates and maps back to a username before dispatching to a handler.",
      "Built the server-side exchange handlers around per-user inbox queues, with batch size controlled by the server rather than the client, and purge-on-disconnect semantics that also invalidate the caller\u2019s auth token.",
      "Implemented the client-side RPC calls behind an interactive CLI (send to user, fetch new messages, list active users, quit) and verified delivery end to end by running concurrent clients against a local server.",
      "Modernized the toolchain, resolving a generated-stub/runtime version mismatch by upgrading the grpc-go and protobuf dependencies to match the code emitted by the current plugins."
    ],
    tech: ["Go", "gRPC", "Protocol Buffers", "protoc", "Unary Interceptors", "gRPC Metadata"],
    impact: "An end-to-end look at how RPC services actually authenticate and route traffic \u2014 schema-first APIs, generated stubs, and interceptor-enforced auth rather than hand-rolled HTTP handlers."
  },
  {
    id: "proj-15",
    title: "CoRead: Shared Reading Rooms",
    category: "Web Apps",
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Row-Level Security"],
    description: "A browser-based reading platform where small groups read the same book together, with shared progress and notes that unlock only as each reader reaches them.",
    details: [
      "Parses DRM-free EPUBs entirely in the browser, with ZIP-bomb and path-traversal limits, sanitized XHTML, and character-offset annotation anchors that survive window resizing.",
      "Reading rooms add invite links, shared progress, and spoiler-gated notes, with privacy enforced by Postgres row-level security rather than only in the UI.",
      "Plan limits (rooms per user, participants per room) are enforced in database triggers with race-safe locking, returning a specific error code the app turns into an upgrade prompt.",
      "Email magic-link sign-in via Brevo SMTP; statically exported and deployed on Vercel."
    ],
    tech: ["Next.js 15", "React", "TypeScript", "Supabase", "PostgreSQL", "Row-Level Security", "Tailwind CSS", "Vitest"],
    impact: "Shows how to keep multi-user privacy in the database itself: the server never sends a note a reader hasn't reached, so nothing can leak through the browser.",
    liveUrl: "https://coread-beta.vercel.app",
    github: "https://github.com/EyobelG/coread"
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: "exp-scoop",
    role: "Core Model Engineer — SCOOP Carbon Accounting",
    organization: "Tufts Auster Center for Applied Innovation and Research",
    location: "Medford, MA (Hybrid)",
    period: "September 2026 – Present",
    type: "Engineering",
    logoKey: "SCOOP",
    bullets: [
      "Core Model Engineer on SCOOP (Sustainable Carbon Options with Open Protocols), the Auster Center's Environmental Innovation initiative building the missing accounting infrastructure for carbon markets — a general liability-and-asset MMRV (Measurement, Monitoring, Reporting, and Validation) framework.",
      "Designing the SCOOP core model stack with the Data Engineering and Impact Network teams: cloud-based transformation and normalization of carbon claims and emissions across the carbon data supply chain, so credits can be compared, restated, and traced back to their dynamic physical origin.",
      "Mapping requirements against the SCOOP principles — interoperability, measurable externalities, verifiability, decentralization, privacy, scalability, and traceability — and instantiating the IEEE P7802 standard incrementally through prototypes with carbon project owners, raters, registries, and market makers.",
      "Building and testing core model instances for reuse at scale (high processing volumes) and scope (multiple industries measuring claims, offsets, verifications, registries, and settlements), including API and self-service architecture for corporate and academic developers, policy makers, and auditors.",
      "Evaluating and selecting tooling with the data engineering team — ETL and data movement, privacy and blockchain primitives, AI-assisted development — plus secure code versioning, DevOps, and threat modeling for the platform."
    ],
    skills: ["Software Architecture", "API Development", "Python", "Cloud (AWS/GCP/Azure)", "Data Modeling", "ETL", "Secure Coding", "DevOps", "Carbon Accounting", "IEEE P7802"]
  },
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
    skills: ["AP Calculus BC", "Linear Algebra", "Project-Based Learning", "Pedagogy", "Coaching"],
    courses: [
      {
        name: "AP Calculus BC",
        description: "Rigorous university-level single-variable calculus covering derivatives, integrals, and power series.",
        syllabus: [
          "Limits and Continuity",
          "Advanced Differentiation Techniques",
          "Applications of Derivatives & Extreme Values",
          "Integration and Accumulation of Change",
          "Differential Equations & Separation of Variables",
          "Infinite Series, Taylor, and Maclaurin expansions"
        ],
        evaluations: [
          { metric: "Student Mastery Score", score: "4.8 / 5.0" },
          { metric: "AP Exam Pass Rate Estimate", score: "96%" }
        ]
      },
      {
        name: "Linear Algebra",
        description: "High-level vector space mathematics, matrix linear transformations, determinants, and eigensystems.",
        syllabus: [
          "Systems of Linear Equations",
          "Matrix Algebra & Inverse Matrices",
          "Vector Spaces, Bases, and Subspaces",
          "Eigenvalues, Eigenvectors, & Diagonalization",
          "Orthogonality, Projections, and Least Squares"
        ],
        evaluations: [
          { metric: "Course Recommendation Rate", score: "94%" },
          { metric: "Clarity of Presentation", score: "4.9 / 5.0" }
        ]
      }
    ]
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
    skills: ["Curriculum Design", "Equitable Grading", "Advanced Calculus", "Dorm Supervision", "Advising"],
    courses: [
      {
        name: "Advanced Calculus I",
        description: "An inquiry-based real analysis seminar covering supremum axioms, Cauchy sequences, and topology of the real line.",
        syllabus: [
          "Completeness Axiom & Infimum/Supremum",
          "Limits & Convergence of Sequences",
          "Open, Closed, and Compact sets in R",
          "Limits of Functions & Continuous functions",
          "Intermediate & Mean Value Theorems",
          "Introductory Riemann Integration theory"
        ],
        evaluations: [
          { metric: "Instruction Rigor Rating", score: "4.8 / 5.0" },
          { metric: "Student Intellectual Engagement", score: "95%" }
        ]
      },
      {
        name: "Diversity & Social Justice",
        description: "An interdisciplinary seminar exploring institutional power structures, identity dynamics, and statistical modeling of gerrymandering and voting equity.",
        syllabus: [
          "Frameworks of Oppression and Privilege",
          "History of Civil Rights Movements",
          "Mathematical Modeling of Gerrymandering (Graph Cuts & Polsby-Popper)",
          "Socio-Economic Deserts & Algorithmic Biases",
          "Student-Led Equity Action Projects"
        ],
        evaluations: [
          { metric: "Pedagogy Effectiveness", score: "4.7 / 5.0" },
          { metric: "Inclusivity Classroom Rating", score: "98%" }
        ]
      }
    ]
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
    { name: "Go", level: 80 },
    { name: "JavaScript / TS", level: 88 },
    { name: "Assembly", level: 85 },
    { name: "SQL", level: 80 },
    { name: "MySQL", level: 85 },
    { name: "PostgreSQL", level: 80 },
    { name: "Scheme", level: 75 },
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
    "Heroku & Render",
    "CI/CD (GitHub Actions)",
    "Cloud Computing (in progress, Tufts, Fall 2026)",
    "Next.js",
    "Supabase & Row-Level Security",
    "Vercel",
    "Vitest",
    "Transactional Email (Brevo / SMTP)",
    "Client-side EPUB Parsing"
  ],
  mathScience: [
    "Graph Theory",
    "Algebraic Combinatorics",
    "Linear Algebra",
    "Probability & Statistics",
    "Differential Equations",
    "Data Visualization (D3.js)",
    "Machine Learning",
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
    name: "Go (Intermediate) Certificate",
    provider: "HackerRank",
    date: "Oct 2026",
    link: "https://www.hackerrank.com/certificates/5148296a4728"
  },
  {
    name: "Frontend Developer (React) Certificate",
    provider: "HackerRank",
    date: "Sep 2026",
    link: "https://www.hackerrank.com/certificates/iframe/dc5ee18b3ff2"
  },
  {
    name: "Model Context Protocol: Advanced Topics",
    provider: "Anthropic",
    date: "Aug 2026",
    link: "https://verify.skilljar.com/c/vwjx3zrdzq5i"
  },
  {
    name: "SQL (Advanced) Certificate",
    provider: "HackerRank",
    date: "Aug 2026",
    link: "https://www.hackerrank.com/certificates/iframe/ca1c64090e5b"
  },
  {
    name: "Software Engineer Certificate",
    provider: "HackerRank",
    date: "Aug 2026",
    link: "https://www.hackerrank.com/certificates/iframe/6ddceb72acc4"
  },
  {
    name: "REST API (Intermediate) Certificate",
    provider: "HackerRank",
    date: "Aug 2026",
    link: "https://www.hackerrank.com/certificates/iframe/058d3276c362"
  },
  {
    name: "C# (Basic) Certificate",
    provider: "HackerRank",
    date: "Aug 2026",
    link: "https://www.hackerrank.com/certificates/iframe/2388335d79e3"
  },
  {
    name: "AI Fluency for Builders",
    provider: "Anthropic",
    date: "Aug 2026",
    link: "https://verify.skilljar.com/c/jhzjgunj5bdz"
  },
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
