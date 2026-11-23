import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Tabs } from '../../components/ui/Tabs';
import {
  ShieldCheck,
  Building2,
  Users,
  Sliders,
  FileText,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Database,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Server,
  AlertCircle,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { testSupabaseConnection } from '../../lib/supabase';

export const AdminPortalPage: React.FC = () => {
  const {
    currentRole,
    setRole,
    departments,
    laboratories,
    users,
    equipment,
    auditLogs,
    engineWeights,
    setEngineWeights,
    backendStatus,
    backendMessage,
    realtimeStatus,
    seedSupabaseFromLocal,
    syncFromSupabase,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('weights');
  const [weights, setWeights] = useState({ ...engineWeights });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalWeight = Math.round(
    (weights.deadlineUrgency +
      weights.projectPriority +
      weights.waitingTime +
      weights.usageFairness +
      weights.requirementCriticality) *
      100
  );

  const tabs = [
    { id: 'weights', label: 'Engine Weights Configuration', icon: <Sliders className="w-4 h-4" /> },
    { id: 'database', label: 'Database & Cloud Backend', icon: <Database className="w-4 h-4" /> },
    { id: 'users', label: 'Users & Roles Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments & Facilities', icon: <Building2 className="w-4 h-4" /> },
    { id: 'audit', label: 'System Audit Trail', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleSaveWeights = () => {
    if (totalWeight !== 100) {
      alert(`Weights must sum to exactly 100%. Current sum: ${totalWeight}%.`);
      return;
    }
    setEngineWeights(weights);
    alert('Campus Allocation Engine weights updated successfully!');
  };

  const handlePushToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await seedSupabaseFromLocal();
      setSyncFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncFeedback({ type: 'error', message: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncFromSupabase();
      setSyncFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncFeedback({ type: 'error', message: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await testSupabaseConnection();
      setSyncFeedback({
        type: res.ok ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncFeedback({ type: 'error', message: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner if not Admin */}
      {currentRole !== 'admin' && (
        <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              You are currently viewing in <strong>{currentRole}</strong> mode. Switch persona to <strong>Campus Administrator</strong> to modify system-wide engine weights and policies.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRole('admin')}
            className="bg-amber-700 hover:bg-amber-800 shrink-0"
          >
            Switch to Admin
          </Button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">
          Campus Administration & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure university allocation policies, inspect student usage fairness metrics, and monitor institutional audit trails.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Engine Weights Configuration */}
      {activeTab === 'weights' && (
        <Card className="p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
            <div>
              <CardTitle className="text-base font-bold text-navy-900">
                Institutional Fair Allocation Weights
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                These weights govern how competing booking requests are scored and prioritized campus-wide.
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-sm font-bold ${
                  totalWeight === 100 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                Sum: {totalWeight}%
              </span>
              <span className="text-[10px] text-slate-400 block">Strict constraint: 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-navy-900 mb-1">
                  <span>Deadline Urgency Weight</span>
                  <span className="font-bold">{Math.round(weights.deadlineUrgency * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(weights.deadlineUrgency * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, deadlineUrgency: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-primary-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Prioritizes students with impending thesis or conference publication deadlines.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-900 mb-1">
                  <span>Project Priority Weight</span>
                  <span className="font-bold">{Math.round(weights.projectPriority * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(weights.projectPriority * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, projectPriority: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-purple-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Reflects faculty-assigned project priority levels (Critical, High, Normal, Low).
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-900 mb-1">
                  <span>Waiting Time in Queue Weight</span>
                  <span className="font-bold">{Math.round(weights.waitingTime * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(weights.waitingTime * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, waitingTime: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Prevents starvation by boosting requests that have been queued for prolonged periods.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-navy-900 mb-1">
                  <span>Usage Fairness Weight</span>
                  <span className="font-bold">{Math.round(weights.usageFairness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(weights.usageFairness * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, usageFairness: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Awards higher scores to researchers with lower historical usage to prevent monopoly.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-900 mb-1">
                  <span>Requirement Criticality Weight</span>
                  <span className="font-bold">{Math.round(weights.requirementCriticality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(weights.requirementCriticality * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, requirementCriticality: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Evaluates whether the experiment strictly depends on this specialized hardware.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setWeights({
                  deadlineUrgency: 0.3,
                  projectPriority: 0.2,
                  waitingTime: 0.2,
                  usageFairness: 0.15,
                  requirementCriticality: 0.15,
                })
              }
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Recommended Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveWeights}
            >
              Apply Institutional Policy
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 2: Database & Supabase Backend */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <Card className="p-6 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
              <div>
                <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary-600" />
                  <span>Cloud Database & Synchronization</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Manage the PostgreSQL backend layer powered by Supabase with automatic offline LocalStorage fallback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip
                  status={
                    backendStatus === 'connected'
                      ? 'optimal'
                      : backendStatus === 'connecting'
                      ? 'fair'
                      : backendStatus === 'error'
                      ? 'out_of_service'
                      : 'good'
                  }
                  customLabel={
                    backendStatus === 'connected'
                      ? 'Supabase Live'
                      : backendStatus === 'connecting'
                      ? 'Connecting...'
                      : backendStatus === 'error'
                      ? 'Connection Error (Fallback Active)'
                      : 'LocalStorage Mode'
                  }
                />
                <StatusChip
                  status={realtimeStatus === 'SUBSCRIBED' ? 'optimal' : 'fair'}
                  customLabel={
                    realtimeStatus === 'SUBSCRIBED'
                      ? 'Realtime Broadcast: Active'
                      : realtimeStatus === 'CONNECTING'
                      ? 'Realtime: Connecting'
                      : 'Realtime: Standby'
                  }
                />
              </div>
            </div>

            {/* Live Status Details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-navy-900">Backend Status Message:</span>
                <span className="font-mono text-[11px] text-slate-500">{backendStatus}</span>
              </div>
              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                {backendMessage}
              </p>
            </div>

            {/* Sync Feedback Alert */}
            {syncFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  syncFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold">
                    {syncFeedback.type === 'success' ? 'Success' : 'Error'}
                  </span>
                  <p>{syncFeedback.message}</p>
                </div>
              </div>
            )}

            {/* Database Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Equipment Units</span>
                <p className="text-xl font-bold text-navy-900 mt-1">{equipment.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Laboratories</span>
                <p className="text-xl font-bold text-navy-900 mt-1">{laboratories.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Departments</span>
                <p className="text-xl font-bold text-navy-900 mt-1">{departments.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <span className="text-[11px] text-slate-500 font-medium">Users Seeded</span>
                <p className="text-xl font-bold text-navy-900 mt-1">{users.length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isSyncing}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
              >
                Test Supabase Connection
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePushToSupabase}
                disabled={isSyncing}
                leftIcon={<CloudUpload className="w-3.5 h-3.5" />}
              >
                Push Seed Data to Supabase
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePullFromSupabase}
                disabled={isSyncing}
                leftIcon={<CloudDownload className="w-3.5 h-3.5" />}
              >
                Pull Records from Supabase
              </Button>
            </div>
          </Card>

          {/* Setup Instructions Card */}
          <Card className="p-6 shadow-card space-y-4">
            <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-primary-600" />
              <span>How to connect your own Supabase project</span>
            </CardTitle>
            <div className="text-xs text-slate-600 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                  1
                </span>
                <p>
                  Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary-600 underline font-medium">supabase.com</a>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                  2
                </span>
                <p>
                  In the Supabase SQL Editor, run the migration script located at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-navy-900">supabase/migrations/20261123_init.sql</code>. It creates all 12 tables and RLS public policies.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                  3
                </span>
                <p>
                  Copy your Project URL and Anon Public Key from <em>Project Settings → API</em> into <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-navy-900">.env</code>:
                </p>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                  4
                </span>
                <p>
                  Click <strong>&quot;Push Seed Data to Supabase&quot;</strong> above to populate all 120+ equipment units, 12 labs, and demo conflict scenarios into your cloud database.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Users & Roles Directory */}
      {activeTab === 'users' && (
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border">
            <CardTitle className="text-sm font-bold text-navy-900">
              Campus User Registry ({users.length} simulated profiles)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b border-surface-border">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Prior Usage Hours</th>
                  <th className="p-3">Safety Certifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 20).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-500">{u.id}</td>
                    <td className="p-3 font-semibold text-navy-900">
                      {u.name}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {u.email}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize font-semibold text-navy-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.departmentId}</td>
                    <td className="p-3 font-semibold text-navy-900">{u.priorUsageHours} hrs</td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {u.completedTrainings.length} credentials
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Departments & Facilities */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const deptLabs = laboratories.filter((l) => l.departmentId === dept.id);
            return (
              <Card key={dept.id} className="p-4 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary-600">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {deptLabs.length} Labs
                  </span>
                </div>
                <h4 className="font-bold text-sm text-navy-900">{dept.name}</h4>
                <p className="text-xs text-slate-500">{dept.description}</p>
                <div className="pt-2 text-xs text-slate-600 border-t border-slate-100 space-y-1">
                  <div>Building: <strong>{dept.building}</strong></div>
                  <div>Department Head: <strong>{dept.headOfDepartment}</strong></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 4: System Audit Trail */}
      {activeTab === 'audit' && (
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border">
            <CardTitle className="text-sm font-bold text-navy-900">
              System Audit Trail ({auditLogs.length} events logged)
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-navy-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{log.details}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Actor: {log.actorName}</span>
                  <span>•</span>
                  <span>Target: {log.entityType} ({log.entityId})</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
