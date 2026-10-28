import { useState, type ReactNode } from "react";

interface SitePreviewLinkProps {
  href: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

// Pre-captured screenshots, served from /public — avoids iframe X-Frame-Options blocks
// and the rate limits of free third-party screenshot APIs. Add a new entry here whenever
// a new linked site/paper gets a preview.
const PREVIEW_IMAGES: Record<string, string> = {
  "https://www.tufts.edu": "/link-previews/tufts.jpg",
  "https://www.codepath.org": "/link-previews/codepath.jpg",
  "https://www.gse.upenn.edu": "/link-previews/upenn-gse.jpg",
  "https://www.williams.edu": "/link-previews/williams.jpg",
  "https://lidetacatholiccathedralschool.com": "/link-previews/lideta.jpg",
  "https://ajc.maths.uq.edu.au/pdf/87/ajc_v87_p129.pdf": "/link-previews/ajc-v87-p129.jpg",
  "https://ajc.maths.uq.edu.au/pdf/96/ajc_v96_p395-411.pdf": "/link-previews/ajc-v96-p395-411.jpg",
  "https://arxiv.org/abs/2206.06907": "/link-previews/arxiv-2206-06907.jpg",
  "https://arxiv.org/abs/2508.05761": "/link-previews/arxiv-2508-05761.jpg",
};

export default function SitePreviewLink({ href, className, title, children }: SitePreviewLinkProps) {
  const [hovered, setHovered] = useState(false);
  const previewSrc = PREVIEW_IMAGES[href];

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={className}>
        {children}
      </a>

      {/* Faded miniature site preview, desktop hover only */}
      {previewSrc && (
        <span
          className={`hidden sm:block absolute left-0 top-full mt-2 z-50 w-64 h-40 rounded-xl border-2 border-cream-border bg-cream-card shadow-2xl overflow-hidden pointer-events-none transition-all duration-200 ${
            hovered ? "opacity-85 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
          }`}
        >
          <img
            src={previewSrc}
            alt={`${title ?? href} preview`}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        </span>
      )}
    </span>
  );
}
