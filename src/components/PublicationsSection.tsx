import React, { useState, useEffect } from "react";
import { PUBLICATIONS_DATA } from "../data";
import { 
  BookOpen, Calendar, Award, ExternalLink, ScrollText, 
  CheckCircle, Search, Copy, Check, Filter, RotateCcw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Publication } from "../types";

export default function PublicationsSection() {
  const [activePubId, setActivePubId] = useState<string>(PUBLICATIONS_DATA[0].id);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Journal" | "Preprint">("All");
  const [filterYear, setFilterYear] = useState<"All" | "2025" | "2023" | "2022">("All");

  // Citation Copy States
  const [citationTab, setCitationTab] = useState<"bibtex" | "mla" | "apa">("bibtex");
  const [copied, setCopied] = useState(false);

  // Reset copied state when active publication or citation format changes
  useEffect(() => {
    setCopied(false);
  }, [activePubId, citationTab]);

  // Filter logic
  const filteredPublications = PUBLICATIONS_DATA.filter((pub) => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const isJournal = pub.venue.toLowerCase().includes("journal") || pub.venue.toLowerCase().includes("art of discrete");
    const isPreprint = pub.venue.toLowerCase().includes("preprint") || pub.venue.toLowerCase().includes("arxiv");
    
    const matchesType = 
      filterType === "All" ||
      (filterType === "Journal" && isJournal) ||
      (filterType === "Preprint" && isPreprint);
      
    const matchesYear = 
      filterYear === "All" || 
      pub.year.toString() === filterYear;
      
    return matchesSearch && matchesType && matchesYear;
  });

  // Safe active publication resolver
  const activePub = filteredPublications.find((p) => p.id === activePubId) || filteredPublications[0] || PUBLICATIONS_DATA[0];

  // Sync active publication ID if filtered list shrinks and excludes current active selection
  useEffect(() => {
    if (filteredPublications.length > 0 && !filteredPublications.some(p => p.id === activePubId)) {
      setActivePubId(filteredPublications[0].id);
    }
  }, [searchTerm, filterType, filterYear]);

  // Dynamic Citation Generator
  const getCitationText = (pub: Publication, format: "bibtex" | "mla" | "apa") => {
    if (!pub) return "";
    const cleanId = pub.id.replace(/-/g, "");
    
    switch (format) {
      case "bibtex":
        return `@article{gebre${pub.year}${cleanId},\n  title={${pub.title}},\n  author={${pub.authors}},\n  journal={${pub.venue}},\n  year={${pub.year}},\n  url={${pub.link || "https://arxiv.org/abs/" + (pub.arxiv || "")}}\n}`;
      case "mla":
        return `${pub.authors}. "${pub.title}." *${pub.venue}*, ${pub.year}. Web.`;
      case "apa":
        return `${pub.authors}. (${pub.year}). ${pub.title}. *${pub.venue}*. ${pub.link ? "Retrieved from " + pub.link : ""}`;
      default:
        return "";
    }
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("All");
    setFilterYear("All");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="publications-container">
      {/* List & Filters Column */}
      <div className="lg:col-span-5 space-y-5">
        <div className="flex items-center space-x-2 text-tufts-blue mb-1">
          <BookOpen className="w-5 h-5 text-williams-gold animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">Research Publications</span>
        </div>
        <h3 className="font-serif text-2xl lg:text-3xl text-charcoal font-semibold tracking-tight">
          Co-Authored Papers
        </h3>
        <p className="text-sm text-charcoal-light leading-relaxed">
          Eyobel worked alongside professors and students in the prestigious <strong>SMALL REU</strong> at Williams College, one of the premier undergraduate research groups in the US.
        </p>

        {/* SEARCH AND FILTERS TOOLBOX */}
        <div className="bg-cream-card/60 border border-cream-border p-4 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-400" /> Filter Library
            </span>
            {(searchTerm || filterType !== "All" || filterYear !== "All") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] font-mono text-williams-purple dark:text-williams-gold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="pub-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, author, keyword..."
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-cream-border rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 shadow-sm"
            />
          </div>

          {/* Filter Row 1: Type Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 mr-1 shrink-0">Type:</span>
            {(["All", "Journal", "Preprint"] as const).map((type) => (
              <button
                key={type}
                id={`btn-filter-type-${type}`}
                onClick={() => setFilterType(type)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  filterType === type
                    ? "bg-williams-purple text-white dark:text-williams-gold border-williams-gold font-semibold shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-charcoal-light border-cream-border hover:bg-cream-card-sub"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Filter Row 2: Year Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 mr-1 shrink-0">Year:</span>
            {(["All", "2025", "2023", "2022"] as const).map((year) => (
              <button
                key={year}
                id={`btn-filter-year-${year}`}
                onClick={() => setFilterYear(year)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  filterYear === year
                    ? "bg-williams-purple text-white dark:text-williams-gold border-williams-gold font-semibold shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-charcoal-light border-cream-border hover:bg-cream-card-sub"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Cards List */}
        <div className="space-y-3 mt-4 max-h-[360px] overflow-y-auto pr-1">
          {filteredPublications.length > 0 ? (
            filteredPublications.map((pub, idx) => {
              const isActive = activePub.id === pub.id;
              return (
                <div
                  key={pub.id}
                  id={`pub-list-item-${pub.id}`}
                  onClick={() => setActivePubId(pub.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-williams-purple text-white dark:text-williams-gold border-williams-gold shadow-md"
                      : "bg-cream-card text-charcoal border-cream-border hover:bg-cream-card-sub"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-mono text-[10px] uppercase font-semibold tracking-wide truncate max-w-[180px] ${
                      isActive ? "text-williams-gold-light" : "text-tufts-blue-light"
                    }`}>
                      {pub.venue}
                    </span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                      isActive ? "bg-williams-purple-dark text-white dark:text-williams-gold border border-williams-purple-light/20" : "bg-cream-card-sub border border-cream-border text-charcoal-light"
                    }`}>
                      {pub.year}
                    </span>
                  </div>
                  <h4 className="font-serif font-medium text-sm mt-2 leading-snug">
                    {pub.title}
                  </h4>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-cream-card/40 border border-cream-border rounded-xl">
              <p className="text-xs font-mono text-zinc-400">No matching publications found.</p>
              <button
                onClick={handleResetFilters}
                className="mt-2 text-xs font-mono text-williams-purple dark:text-williams-gold underline cursor-pointer"
              >
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Abstract & Citation Tool Column */}
      <div className="lg:col-span-7 bg-cream-card rounded-3xl border-2 border-cream-border p-6 lg:p-8 space-y-6 shadow-xl">
        {activePub ? (
          <motion.div
            key={activePub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <span className="font-mono text-[10px] text-tufts-blue-light font-bold uppercase tracking-widest block">
                Featured Research Document
              </span>
              <h4 className="font-serif text-xl lg:text-2xl text-charcoal font-semibold tracking-tight mt-1 leading-tight">
                {activePub.title}
              </h4>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-cream-border text-xs">
              <div className="space-y-1">
                <span className="font-mono text-charcoal-light uppercase font-semibold block text-[10px]">Authors:</span>
                <p className="text-charcoal leading-relaxed font-sans">{activePub.authors}</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-charcoal-light uppercase font-semibold block text-[10px]">Publication Venue:</span>
                <p className="text-charcoal leading-relaxed font-serif font-semibold">{activePub.venue} • {activePub.year}</p>
              </div>
            </div>

            {/* Abstract Description */}
            <div className="space-y-2">
              <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold flex items-center gap-1.5">
                <ScrollText className="w-4 h-4 text-williams-gold" />
                Mathematical Abstract
              </h5>
              <p className="text-sm text-charcoal-light leading-relaxed font-sans italic p-4 bg-cream-card-sub rounded-xl border border-cream-border">
                "{activePub.description}"
              </p>
            </div>
            {/* Research stats tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center space-x-1 px-3 py-1 bg-williams-gold/15 text-williams-gold-light text-xs rounded-full border border-williams-gold-dark/30">
                <Award className="w-3.5 h-3.5 text-williams-gold" />
                <span>Peer Reviewed</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs rounded-full border border-emerald-800/30">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Graph Theory & Divisor Focus</span>
              </div>
            </div>

            {/* Link buttons */}
            <div className="flex items-center space-x-3 pt-2">
              {activePub.link && (
                <a
                  href={activePub.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-williams-purple hover:bg-williams-purple-light text-white font-mono text-xs font-semibold rounded-lg shadow-sm border border-williams-gold/30 transition-all"
                >
                  <span>View Full Manuscript</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {activePub.arxiv && (
                <a
                  href={`https://arxiv.org/abs/${activePub.arxiv}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 border border-cream-border bg-cream-card-sub hover:opacity-80 text-charcoal font-mono text-xs transition-all rounded-lg"
                >
                  <span>arXiv:{activePub.arxiv}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-charcoal-light" />
                </a>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm font-mono text-zinc-400">Select a paper to explore details and citations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
