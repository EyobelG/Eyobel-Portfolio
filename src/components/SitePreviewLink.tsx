import { useState, type ReactNode } from "react";

interface SitePreviewLinkProps {
  href: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

// Server-rendered screenshot avoids X-Frame-Options/CSP blocks that make live iframes blank on most school sites.
// embed=screenshot.url makes Microlink redirect straight to the image bytes, so it's usable as a plain <img src>.
const screenshotUrl = (url: string) =>
  `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

export default function SitePreviewLink({ href, className, title, children }: SitePreviewLinkProps) {
  const [hovered, setHovered] = useState(false);
  const [errored, setErrored] = useState(false);

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
      {!errored && (
        <span
          className={`hidden sm:block absolute left-0 top-full mt-2 z-50 w-64 h-40 rounded-xl border-2 border-cream-border bg-cream-card shadow-2xl overflow-hidden pointer-events-none transition-all duration-200 ${
            hovered ? "opacity-85 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
          }`}
        >
          {hovered && (
            <img
              src={screenshotUrl(href)}
              alt={`${title ?? href} preview`}
              loading="lazy"
              onError={() => setErrored(true)}
              className="w-full h-full object-cover object-top"
            />
          )}
        </span>
      )}
    </span>
  );
}
