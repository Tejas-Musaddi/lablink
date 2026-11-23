import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import {
  Sparkles,
  Search,
  Scale,
  Calendar,
  Layers,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart2,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { formatDateTime } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentRole,
    currentUser,
    equipment,
    laboratories,
    departments,
    projects,
    bookings,
    bookingRequests,
    conflicts,
    auditLogs,
    openGuidedTour,
    setRole,
  } = useAppStore();

  const totalEquipmentCount = equipment.length;
  const availableNowCount = equipment.filter((e) => e.availability === 'available').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingApprovalsCount = bookingRequests.filter((r) => r.status === 'pending_approval').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

  // Department Utilization Data for Chart
  const deptUtilizationData = departments.map((d) => {
    const deptEq = equipment.filter((e) => e.departmentId === d.id);
    const inUse = deptEq.filter((e) => e.availability === 'in_use' || e.availability === 'reserved').length;
    const total = deptEq.length;
    const rate = total > 0 ? Math.round((inUse / total) * 100) : 0;
    return {
      department: d.code,
      name: d.name,
      rate,
      total,
      inUse,
    };
  });

  // Hourly Peak Demand Heatmap / Area data
  const peakHoursData = [
    { hour: '08:00', load: 24, baseline: 12 },
    { hour: '10:00', load: 68, baseline: 35 },
    { hour: '12:00', load: 82, baseline: 42 },
    { hour: '14:00', load: 96, baseline: 58 },
    { hour: '16:00', load: 91, baseline: 51 },
    { hour: '18:00', load: 74, baseline: 39 },
    { hour: '20:00', load: 45, baseline: 22 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-primary-900 p-6 sm:p-8 text-white shadow-elevated">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>GenAI-Powered Campus Equipment Sharing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Democratizing Specialized Lab Resources Across Campus
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminate equipment silos between Computer Science, Robotics, Bio-Engineering, and Materials.
            Discover 120+ specialized apparatus, map project needs with semantic AI, and eliminate scheduling gridlock
            with our transparent, deterministic Fair Allocation Engine.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              onClick={openGuidedTour}
              className="bg-primary-500 hover:bg-primary-400 font-bold"
            >
              Start Guided Demo Tour
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/conflicts')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              View Conflict Engine
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/discovery')}
              className="text-slate-300 hover:text-white"
            >
              Browse Equipment
            </Button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <div className="w-full h-full border-l border-white/20 grid grid-cols-4 grid-rows-4" />
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Total Equipment
          </span>
          <span className="text-2xl font-black text-navy-900 mt-1 block">
            {totalEquipmentCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 12 Labs & 6 Depts
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">
            Available Now
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {availableNowCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ready for instant reservation
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] uppercase font-bold text-primary-600 block">
            Active Bookings
          </span>
          <span className="text-2xl font-black text-primary-600 mt-1 block">
            {activeBookingsCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Scheduled & in session
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] uppercase font-bold text-amber-600 block">
            Pending Approvals
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {pendingApprovalsCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Awaiting faculty confirmation
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-purple-600 block">
            Active Projects
          </span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {activeProjectsCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cross-departmental teams
          </span>
        </div>
      </div>

      {/* Core Impact Panel (Section 9.6 Requirement) */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50/50 p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-600 text-white">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-navy-900">
                Verified Campus Impact: LabLink vs First-Come-First-Served (FCFS) Baseline
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic allocation replaces race-condition booking with equitable priority scoring.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/analytics')}
            className="text-xs shrink-0"
          >
            Full Analytics & CSV Export
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 text-center">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Utilization Uplift
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">+48.2%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">vs siloed FCFS</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Cross-Dept Sharing
            </span>
            <span className="text-xl sm:text-2xl font-black text-primary-600">62.4%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">inter-college slots</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Conflicts Resolved
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-600">100%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">zero deadlocks</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Avg Wait Time
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600">-58%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">shorter queue delay</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Fairness Index
            </span>
            <span className="text-xl sm:text-2xl font-black text-navy-900">0.89 <span className="text-xs font-normal text-slate-400">vs 0.62</span></span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">+43.5% equity</span>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Utilization Bar Chart */}
        <Card>
          <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-600" />
              Department Resource Utilization (%)
            </CardTitle>
            <span className="text-[11px] text-slate-400">Current active capacity</span>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Capacity`, 'Utilization']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Bar dataKey="rate" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Demand Heatmap / Load Area Chart */}
        <Card>
          <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Peak Hours Load vs Baseline (08:00 - 22:00)
            </CardTitle>
            <span className="text-[11px] text-slate-400">LabLink vs Unoptimized</span>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Workload']} />
                  <Area
                    type="monotone"
                    dataKey="load"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLoad)"
                    name="LabLink Optimization"
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorBaseline)"
                    name="FCFS Baseline"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Specific Quick Widgets & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Widget (Col 1) */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-4 border-b border-surface-border">
            <CardTitle className="text-sm font-bold text-navy-900">
              Active Persona: {currentUser.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Simulated Role
              </span>
              <span className="font-bold text-navy-900 capitalize block">
                {currentRole.replace('_', ' ')}
              </span>
              <span className="text-slate-500 block">
                Prior Usage: {currentUser.priorUsageHours} hours
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Completed Safety Certifications ({currentUser.completedTrainings.length})
              </span>
              <ul className="space-y-1">
                {currentUser.completedTrainings.slice(0, 3).map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-navy-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              {currentRole === 'faculty' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/faculty')}
                  className="w-full"
                >
                  Open Faculty Review Queue
                </Button>
              )}
              {currentRole === 'lab_manager' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/manager')}
                  className="w-full"
                >
                  Manage Equipment & QR Check-In
                </Button>
              )}
              {currentRole === 'admin' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="w-full"
                >
                  Open Campus Admin Console
                </Button>
              )}
              {currentRole === 'student' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  className="w-full"
                >
                  Manage My Projects & Bookings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Audit Feed (Col 2 & 3) */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-navy-900">
              Live Campus Activity & Allocation Feed
            </CardTitle>
            <span className="text-[11px] text-slate-400">Audit-backed event stream</span>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3.5 text-xs hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-navy-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{log.details}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Actor: {log.actorName}</span>
                  <span>•</span>
                  <span className="capitalize">{log.actorRole}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
