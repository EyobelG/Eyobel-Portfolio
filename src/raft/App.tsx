import { useEffect, useState } from 'react';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { HeroSection } from './components/HeroSection';
import { RaftSandbox } from './components/RaftSandbox';
import { StorySection } from './components/StorySection';
import { TopBar } from './components/TopBar';
import { VerificationSection } from './components/VerificationSection';

export default function RaftApp() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem('raft-portfolio-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('raft-portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToSandbox = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#050505] text-[#111111] dark:text-white selection:bg-[#3e8ede]/25 selection:text-[#111111] dark:selection:text-white transition-colors">
      <TopBar onLaunchSandbox={scrollToSandbox} />
      <main>
        <HeroSection
          onLaunchSandbox={scrollToSandbox}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <RaftSandbox isDark={theme === 'dark'} />
        <ArchitectureExplorer />
        <VerificationSection />
        <StorySection onBackToSandbox={scrollToSandbox} />
      </main>
    </div>
  );
}
