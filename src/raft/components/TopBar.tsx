interface TopBarProps {
  onLaunchSandbox: () => void;
}

export function TopBar({ onLaunchSandbox }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-black/8 dark:border-white/10 transition-colors">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#overview"
          className="text-lg font-semibold tracking-tight text-[#111111] dark:text-white whitespace-nowrap shrink-0"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Eyobel Gebre
        </a>

        <nav
          aria-label="Case study sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#111111]/65 dark:text-white/65"
        >
          <a
            href="#overview"
            className="hover:text-[#111111] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#simulator"
            className="hover:text-[#111111] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Live Cluster
          </a>
          <a
            href="#architecture"
            className="hover:text-[#111111] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
          <a
            href="#verification"
            className="hover:text-[#111111] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Verification
          </a>
          <a
            href="#story"
            className="hover:text-[#111111] dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            The Story
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onLaunchSandbox}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1b5ca0] dark:bg-[#3e8ede] rounded-lg hover:bg-[#164b84] dark:hover:bg-[#579ee6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3e8ede] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Try Live Cluster
          </button>
        </div>
      </div>
    </header>
  );
}
