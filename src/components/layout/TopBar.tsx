import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Role } from '../../types';
import {
  RotateCcw,
  Bell,
  Sparkles,
  Command,
  GraduationCap,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  Check,
  Database,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ROLE_LABELS } from '../../lib/constants';
import { formatDateTime, cn } from '../../lib/utils';

interface TopBarProps {
  onToggleMobileNav: () => void;
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileNav,
  onOpenCommandPalette,
}) => {
  const {
    currentRole,
    currentUser,
    setRole,
    resetDemoData,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openGuidedTour,
    backendStatus,
    backendMessage,
    realtimeStatus,
  } = useAppStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
    { id: 'student', label: 'Student', icon: <GraduationCap className="w-4 h-4 text-primary-600" /> },
    { id: 'faculty', label: 'Faculty', icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
    { id: 'lab_manager', label: 'Lab Manager', icon: <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> },
    { id: 'admin', label: 'Campus Admin', icon: <ShieldAlert className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-border bg-white px-4 sm:px-6 shadow-2xs">
        {/* Left: Mobile Nav Toggle & Breadcrumb / Search trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 rounded-lg border border-surface-border bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <Command className="w-3.5 h-3.5 text-slate-400" />
            <span>Search equipment, labs, commands...</span>
            <kbd className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>

          {/* DEMO MODE Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>DEMO MODE</span>
          </div>

          {/* Database Backend Status Badge */}
          <div
            className={cn(
              "hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium cursor-help transition-colors",
              backendStatus === 'connected'
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : backendStatus === 'connecting'
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : backendStatus === 'error'
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-slate-100 border-slate-200 text-slate-700"
            )}
            title={backendMessage}
          >
            <Database className="w-3.5 h-3.5" />
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                backendStatus === 'connected'
                  ? "bg-emerald-500 animate-pulse"
                  : backendStatus === 'connecting'
                  ? "bg-blue-500 animate-ping"
                  : backendStatus === 'error'
                  ? "bg-rose-500"
                  : "bg-slate-400"
              )}
            />
            <span>
              {backendStatus === 'connected'
                ? realtimeStatus === 'SUBSCRIBED'
                  ? 'Supabase (Realtime Live)'
                  : 'Supabase DB'
                : backendStatus === 'connecting'
                ? 'Syncing Supabase...'
                : backendStatus === 'error'
                ? 'DB Offline (Fallback)'
                : 'LocalStorage DB'}
            </span>
          </div>

          {/* Guided Tour Launcher */}
          <button
            type="button"
            onClick={openGuidedTour}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Guided Tour (Hero Demo)</span>
          </button>
        </div>

        {/* Right: Role Switcher, Notifications, Reset Demo */}
        <div className="flex items-center gap-2.5">
          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-medium text-navy-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
              aria-expanded={isRoleDropdownOpen}
              aria-haspopup="true"
            >
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">Role:</span>
              <span className="font-semibold text-primary-700">{ROLE_LABELS[currentRole]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 rounded-card border border-surface-border bg-white p-1.5 shadow-elevated z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-navy-800 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {r.icon}
                        <span className={currentRole === r.id ? 'font-bold text-primary-700' : ''}>
                          {r.label}
                        </span>
                      </div>
                      {currentRole === r.id && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-slate-100 pt-1.5 px-2 text-[11px] text-slate-500">
                    Simulating: <span className="font-semibold text-navy-800">{currentUser.name}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-card border border-surface-border bg-white shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-surface-border bg-slate-50 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
                      Notifications ({unreadNotifications.length} unread)
                    </span>
                    {unreadNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-primary-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                            !n.read ? 'bg-primary-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-navy-900">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
            title="Reset simulation data to pristine state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Reset Demo Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Demo Simulation?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will wipe any changes made during this session and reload the pristine deterministic
            seed dataset (120+ equipment units, 15 projects, and the hero conflict scenario).
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => {
                resetDemoData();
                setIsResetModalOpen(false);
              }}
            >
              Reset to Factory Seed
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
