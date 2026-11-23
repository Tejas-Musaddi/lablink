import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import {
  TrendingUp,
  Download,
  Sparkles,
  BarChart3,
  Scale,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Cpu,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { equipment, departments, laboratories, bookings, conflicts, projects } = useAppStore();

  // 1. Department Utilization Data
  const deptUtilizationData = useMemo(() => {
    return departments.map((d) => {
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
  }, [departments, equipment]);

  // 2. Equipment Category Breakdown Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    equipment.forEach((e) => {
      counts[e.categoryId] = (counts[e.categoryId] || 0) + e.totalHoursLogged;
    });
    const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#4F46E5', '#EA580C'];
    return Object.entries(counts).map(([name, hours], idx) => ({
      name,
      hours,
      color: colors[idx % colors.length],
    }));
  }, [equipment]);

  // 3. Fairness Index Comparison Data (FCFS vs LabLink)
  const fairnessData = [
    { metric: 'First-Come-First-Served (FCFS)', fairness: 0.62, color: '#94A3B8' },
    { metric: 'LabLink Fair Allocation Engine', fairness: 0.89, color: '#10B981' },
  ];

  // 4. Underutilized Hardware (Unused resources)
  const underutilized = equipment
    .filter((e) => e.totalHoursLogged < 100 && e.condition === 'optimal')
    .slice(0, 5);

  // 5. Download CSV Report
  const handleExportCSV = () => {
    const headers = ['ID', 'AssetCode', 'Name', 'Category', 'Department', 'HoursLogged', 'Availability', 'Condition'];
    const rows = equipment.map((e) => [
      e.id,
      e.code,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.categoryId}"`,
      e.departmentId,
      e.totalHoursLogged,
      e.availability,
      e.condition,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lablink_equipment_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Campus Laboratory Analytics & Resource Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data-driven institutional intelligence measuring utilization uplift, cross-department sharing, and scheduling fairness.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4 text-primary-600" />}
          onClick={handleExportCSV}
          className="shadow-2xs font-semibold"
        >
          Export Analytics (CSV)
        </Button>
      </div>

      {/* Hero Metric Comparison Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block">
            Net Utilization Uplift
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">+48.2%</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across non-host departments
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase text-primary-600 block">
            Cross-Dept Sharing Rate
          </span>
          <span className="text-2xl font-black text-primary-600 mt-1 block">62.4%</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Inter-college reservations
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase text-purple-600 block">
            Fairness Index Delta
          </span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">0.89 <span className="text-sm font-normal text-slate-400">vs 0.62</span></span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Jain's Equity Benchmark
          </span>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">
            Average Wait Reduction
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">-58%</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Shorter allocation lead time
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Utilization Bar Chart */}
        <Card>
          <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-navy-900">
              Department Apparatus Utilization (%)
            </CardTitle>
            <span className="text-[11px] text-slate-400">Active vs Total Capacity</span>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Capacity']} />
                  <Bar dataKey="rate" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hours Logged by Category */}
        <Card>
          <CardHeader className="p-4 border-b border-surface-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-navy-900">
              Total Research Hours by Equipment Category
            </CardTitle>
            <span className="text-[11px] text-slate-400">Cumulative runtime logged</span>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} hrs`, 'Logged']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Institutional Optimization Insights */}
      <Card className="border-primary-200 bg-gradient-to-r from-primary-50/50 via-white to-slate-50/50">
        <CardHeader className="p-4 border-b border-primary-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <div>
            <CardTitle className="text-sm font-bold text-navy-900">
              AI Institutional Resource Optimization Insights
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Automated heuristics derived from semester booking demand, peak window collisions, and idle capacity.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs text-navy-900">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-primary-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Compute Demand Concentration on NVIDIA DGX Station A100
            </span>
            <p className="text-slate-600 pl-5">
              The NVIDIA DGX Station A100 in Turing 302 experiences 89% peak contention 48 hours prior to IEEE and ACM paper deadlines.
              LabLink's automatic routing successfully shifted 67% of contention to the under-booked H100 SuperServer Node 01, preserving critical project timelines without acquiring additional hardware.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-primary-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Cross-Disciplinary Synergies Between Robotics and Life Sciences
            </span>
            <p className="text-slate-600 pl-5">
              32% of microfluidic and bionic hand teams now utilize the Franklin Wing's Confocal Laser Scanning Microscope.
              Inter-departmental access rules increased bio-imaging asset utilization by 41% without impacting biology student coursework.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="font-bold text-primary-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              3. Unused Capacity Alert: Laser Powder Sintering & Metal 3D Printers
            </span>
            <p className="text-slate-600 pl-5">
              The Markforged Metal X and Formlabs Fuse 1+ systems in Wright Hall currently average under 60 hours logged per month.
              Recommendation: Conduct cross-departmental workshops for ECE and Bio-Engineering students to leverage additive metal manufacturing for sensor enclosures and implants.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Underutilized Hardware Table */}
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border">
          <CardTitle className="text-sm font-bold text-navy-900">
            Underutilized Apparatus Candidates ({underutilized.length} units flagged)
          </CardTitle>
          <p className="text-[11px] text-slate-500">
            Instruments in optimal condition with low cumulative runtime, ideal for cross-departmental project promotion.
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <tr>
                <th className="p-3">Asset Code</th>
                <th className="p-3">Apparatus Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Logged Runtime</th>
                <th className="p-3">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {underutilized.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-primary-700">{eq.code}</td>
                  <td className="p-3 font-semibold text-navy-900">{eq.name}</td>
                  <td className="p-3 text-slate-500">{eq.categoryId}</td>
                  <td className="p-3">
                    <StatusChip status={eq.condition} size="sm" />
                  </td>
                  <td className="p-3 font-semibold text-navy-800">{eq.totalHoursLogged} hrs</td>
                  <td className="p-3 text-emerald-700 font-medium">
                    Promote in cross-dept project suggestions
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
