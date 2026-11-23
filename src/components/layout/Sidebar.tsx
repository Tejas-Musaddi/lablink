import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Search,
  Building2,
  FolderGit2,
  CalendarDays,
  Scale,
  BotMessageSquare,
  FileCheck2,
  Sliders,
  ShieldCheck,
  BarChart3,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentRole, conflicts } = useAppStore();

  const pendingConflictsCount = conflicts.filter(
    (c) => c.status === 'detected' || c.status === 'analyzed'
  ).length;

  const mainNav = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/discovery', label: 'Equipment Discovery', icon: <Search className="w-4 h-4" /> },
    { to: '/labs', label: 'Laboratory Explorer', icon: <Building2 className="w-4 h-4" /> },
    { to: '/projects', label: 'Projects & Requirements', icon: <FolderGit2 className="w-4 h-4" /> },
    { to: '/calendar', label: 'Smart Booking Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    {
      to: '/conflicts',
      label: 'Fair Allocation Engine',
      icon: <Scale className="w-4 h-4" />,
      badge: pendingConflictsCount > 0 ? `${pendingConflictsCount} active` : undefined,
    },
    { to: '/assistant', label: 'AI Lab Assistant', icon: <BotMessageSquare className="w-4 h-4" />, highlight: true },
  ];

  const roleNav = [
    {
      to: '/faculty',
      label: 'Faculty Portal',
      icon: <FileCheck2 className="w-4 h-4" />,
      role: 'faculty',
    },
    {
      to: '/manager',
      label: 'Lab Manager Portal',
      icon: <Sliders className="w-4 h-4" />,
      role: 'lab_manager',
    },
    {
      to: '/admin',
      label: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
      role: 'admin',
    },
    {
      to: '/analytics',
      label: 'Analytics & Impact',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-navy-900 text-white">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-navy-800">
          <NavLink to="/" className="flex items-center gap-2.5 focus:outline-none" onClick={onCloseMobile}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-black text-lg shadow-sm">
              L
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>LabLink</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 px-1.5 py-0.2 rounded border border-primary-500/30">
                  GenAI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Campus Resource Hub
              </p>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {/* Core Modules */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Platform Modules
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white',
                      item.highlight && !isActive && 'text-primary-300 bg-primary-950/40 hover:bg-primary-900/50'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Governance & Portals */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Governance & Portals
            </div>
            <nav className="space-y-1">
              {roleNav.map((item) => {
                const isHighlightRole = item.role === currentRole;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-primary-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-navy-800 hover:text-white',
                        isHighlightRole && !isActive && 'border-l-2 border-primary-400 pl-2.5 text-white'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isHighlightRole && (
                      <span className="text-[9px] font-bold uppercase text-primary-300 bg-primary-900/60 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Impact Summary Card */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/40">
        <div className="rounded-xl bg-navy-800/80 p-3 border border-navy-700/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Resource Sharing Impact
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-navy-900/80 p-1.5 border border-navy-700">
              <span className="block text-[10px] text-slate-400 uppercase">Cross-Dept</span>
              <span className="text-sm font-bold text-emerald-400">+48.2%</span>
            </div>
            <div className="rounded-lg bg-navy-900/80 p-1.5 border border-navy-700">
              <span className="block text-[10px] text-slate-400 uppercase">Fairness</span>
              <span className="text-sm font-bold text-primary-300">0.89</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-full">
            <div className="w-full shadow-2xl">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};
