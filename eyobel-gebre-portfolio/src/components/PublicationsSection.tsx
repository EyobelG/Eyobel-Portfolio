import React, { useState } from "react";
import { PUBLICATIONS_DATA } from "../data";
import { BookOpen, Calendar, Award, ExternalLink, ScrollText, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PublicationsSection() {
  const [activePubIdx, setActivePubIdx] = useState<number>(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="publications-container">
      {/* List Column */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center space-x-2 text-tufts-blue mb-1">
          <BookOpen className="w-5 h-5 text-williams-gold" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">Research Publications</span>
        </div>
        <h3 className="font-serif text-2xl lg:text-3xl text-charcoal font-semibold tracking-tight">
          Co-Authored Papers
        </h3>
        <p className="text-sm text-charcoal-light leading-relaxed">
          Eyobel worked alongside professors and students in the prestigious <strong>SMALL REU</strong> at Williams College, one of the premier undergraduate research groups in the US.
        </p>

        {/* Paper Cards */}
        <div className="space-y-3 mt-6">
          {PUBLICATIONS_DATA.map((pub, idx) => {
            const isActive = activePubIdx === idx;
            return (
              <div
                key={pub.id}
                id={`pub-list-item-${idx}`}
                onClick={() => setActivePubIdx(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-williams-purple text-williams-gold border-williams-gold shadow-md"
                    : "bg-[#141414] text-white border-white/5 hover:bg-[#1a1a1a] hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-mono text-[10px] uppercase font-semibold tracking-wide ${
                    isActive ? "text-williams-gold-light" : "text-tufts-blue-light"
                  }`}>
                    {pub.venue}
                  </span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-williams-purple-dark text-williams-gold border border-williams-purple-light/20" : "bg-white/5 border border-white/5 text-charcoal-light"
                  }`}>
                    {pub.year}
                  </span>
                </div>
                <h4 className="font-serif font-medium text-sm mt-2 leading-snug">
                  {pub.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Abstract Card Column */}
      <div className="lg:col-span-7 bg-[#141414] rounded-3xl border-2 border-white/10 p-6 lg:p-8 space-y-6 shadow-xl">
        {(() => {
          const pub = PUBLICATIONS_DATA[activePubIdx];
          return (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="font-mono text-[10px] text-tufts-blue-light font-bold uppercase tracking-widest block">
                  Featured Research Document
                </span>
                <h4 className="font-serif text-xl lg:text-2xl text-white font-semibold tracking-tight mt-1 leading-tight">
                  {pub.title}
                </h4>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-white/10 text-xs">
                <div className="space-y-1">
                  <span className="font-mono text-charcoal-light uppercase font-semibold block text-[10px]">Authors:</span>
                  <p className="text-white leading-relaxed font-sans">{pub.authors}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-charcoal-light uppercase font-semibold block text-[10px]">Publication Venue:</span>
                  <p className="text-white leading-relaxed font-serif font-semibold">{pub.venue} • {pub.year}</p>
                </div>
              </div>

              {/* Abstract Description */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs uppercase tracking-wider text-charcoal-light font-bold flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-williams-gold" />
                  Mathematical Abstract
                </h5>
                <p className="text-sm text-charcoal-light leading-relaxed font-sans italic p-4 bg-white/5 rounded-xl border border-white/5">
                  "{pub.description}"
                </p>
              </div>

              {/* Research stats tags */}
              <div className="flex flex-wrap gap-2 pt-2">
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
              <div className="flex items-center space-x-3 pt-4">
                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-williams-purple hover:bg-williams-purple-light text-white font-mono text-xs font-semibold rounded-lg shadow-sm border border-williams-gold/30 transition-all"
                  >
                    <span>View Full Manuscript</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {pub.arxiv && (
                  <a
                    href={`https://arxiv.org/abs/${pub.arxiv}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 border border-white/10 bg-[#1c1c1c] hover:bg-[#252525] text-white font-mono text-xs transition-all rounded-lg"
                  >
                    <span>arXiv:{pub.arxiv}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-charcoal-light" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}
