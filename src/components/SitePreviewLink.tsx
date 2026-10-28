import { useState, type ReactNode } from "react";

interface SitePreviewLinkProps {
  href: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

export default function SitePreviewLink({ href, className, title, children }: SitePreviewLinkProps) {
  const [hovered, setHovered] = useState(false);

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
      <span
        className={`hidden sm:block absolute left-0 top-full mt-2 z-50 w-64 h-40 rounded-xl border-2 border-cream-border bg-cream-card shadow-2xl overflow-hidden pointer-events-none transition-all duration-200 ${
          hovered ? "opacity-80 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
        }`}
      >
        {hovered && (
          <iframe
            src={href}
            title={`${title ?? href} preview`}
            loading="lazy"
            sandbox=""
            className="origin-top-left"
            style={{ width: "400%", height: "400%", border: "none", transform: "scale(0.25)" }}
          />
        )}
      </span>
    </span>
  );
}
