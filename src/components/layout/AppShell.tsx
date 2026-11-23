import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AppShell: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { currentRole } = useAppStore();

  useEffect(() => {
    const handleOpen = () => setCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Skip to Content for Accessibility (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:m-4"
      >
        Skip to main content
      </a>

      {/* Sidebar (Desktop and Mobile) */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar
          onToggleMobileNav={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 outline-none">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Trigger Pill */}
      <Link
        to="/assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-navy-900 text-white px-4 py-3 shadow-elevated hover:bg-primary-600 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/30 group"
        aria-label="Open AI Lab Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-primary-400 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-semibold tracking-wide pr-1">Ask AI Assistant</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      </Link>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};
