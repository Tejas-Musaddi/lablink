import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ConflictCase, EngineWeightConfig, AllocationResult } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import {
  Scale,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { runAllocationEngine } from '../../engine';
import { simulateWhatIf, WhatIfComparison } from '../../engine/simulator';
import { formatDateTime, formatDate } from '../../lib/utils';

export const ConflictResolutionPage: React.FC = () => {
  const {
    conflicts,
    bookingRequests,
    equipment,
    laboratories,
    users,
    projects,
    bookings,
    maintenanceRecords,
    engineWeights,
    setEngineWeights,
    currentRole,
    setRole,
    approveAllocation,
    setConflictResolution,
  } = useAppStore();

  const navigate = useNavigate();
  const [engineRanBanner, setEngineRanBanner] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  const [selectedConflictId, setSelectedConflictId] = useState<string>(
    conflicts.find((c) => c.isHeroScenario)?.id || conflicts[0]?.id || ''
  );

  const [activeTab, setActiveTab] = useState<'engine' | 'whatif'>('engine');

  // Local Weights for What-If
  const [whatIfWeights, setWhatIfWeights] = useState<EngineWeightConfig>({
    ...engineWeights,
  });

  // What-If Deadline Override (e.g. make Elena's deadline closer)
  const [deadlineOverride, setDeadlineOverride] = useState<string>('');

  const activeConflict = conflicts.find((c) => c.id === selectedConflictId) || conflicts[0];

  // Contending Requests
  const contendingRequests = useMemo(() => {
    if (!activeConflict) return [];
    return bookingRequests.filter((r) =>
      activeConflict.contendingRequestIds.includes(r.id)
    );
  }, [activeConflict, bookingRequests]);

  // Context for engine
  const engineContext = useMemo(() => {
    return {
      equipmentId: activeConflict?.equipmentId || 'eq-gpu---ai-workstations-001',
      contendingRequests,
      allEquipment: equipment,
      laboratories,
      users,
      projects,
      existingBookings: bookings,
      maintenanceRecords,
      weights: engineWeights,
      referenceTime: '2026-11-23T12:00:00Z',
    };
  }, [
    activeConflict,
    contendingRequests,
    equipment,
    laboratories,
    users,
    projects,
    bookings,
    maintenanceRecords,
    engineWeights,
  ]);

  // Active Resolution (computed live on load)
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(() => {
    try {
      return runAllocationEngine(engineContext);
    } catch {
      return null;
    }
  });

  const [isRunning, setIsRunning] = useState(false);

  // Run Allocation Engine Manually
  const handleRunEngine = () => {
    setIsRunning(true);
    setEngineRanBanner(null);
    setTimeout(() => {
      const res = runAllocationEngine(engineContext);
      setAllocationResult(res);
      if (activeConflict) {
        setConflictResolution(activeConflict.id, res);
      }
      setIsRunning(false);
      setEngineRanBanner(
        `Allocation Engine Executed! 5-factor scoring resolved ${res.totalRequests} competing requests. Fairness Index improved from ${res.fairnessIndexBefore.toFixed(2)} to ${res.fairnessIndexAfter.toFixed(2)}.`
      );
    }, 400);
  };

  // What-If Simulation
  const whatIfComparison: WhatIfComparison | null = useMemo(() => {
    try {
      return simulateWhatIf({
        baseContext: engineContext,
        customWeights: whatIfWeights,
        deadlineOverrides: deadlineOverride
          ? { 'proj-2': deadlineOverride }
          : undefined,
      });
    } catch {
      return null;
    }
  }, [engineContext, whatIfWeights, deadlineOverride]);

  // Sum of whatIfWeights
  const totalWeight = Math.round(
    (whatIfWeights.deadlineUrgency +
      whatIfWeights.projectPriority +
      whatIfWeights.waitingTime +
      whatIfWeights.usageFairness +
      whatIfWeights.requirementCriticality) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-800 mb-2">
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            <span>Deterministic Constraint Satisfaction Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            AI Fair Allocation & Conflict Resolution Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resolve overlapping high-contention research bookings with mathematical fairness, zero double-booking, and plain-English explainability.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'engine'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-primary-600" />
            <span>Live Allocation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatif')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'whatif'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Conflict Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {conflicts.map((conf) => {
          const isSelected = conf.id === activeConflict?.id;
          return (
            <div
              key={conf.id}
              onClick={() => {
                setSelectedConflictId(conf.id);
                setAllocationResult(null);
                setTimeout(handleRunEngine, 50);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-card'
                  : 'bg-white border-surface-border hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {conf.isHeroScenario ? '★ Hero Scenario' : 'Contention Case'}
                </span>
                <StatusChip status={conf.status} size="sm" />
              </div>
              <h4 className="text-xs font-bold text-navy-900 mt-1.5 line-clamp-1">
                {conf.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {conf.equipmentName}
              </p>
              <div className="mt-2 text-[10px] text-primary-600 font-semibold flex items-center gap-1">
                <span>{conf.contendingRequestIds.length} Contending Teams</span>
                <ChevronRightIcon />
              </div>
            </div>
          );
        })}
      </div>

      {/* TAB 1: Live Engine View */}
      {activeTab === 'engine' && (
        <div className="space-y-6">
          {/* Contending Requests Overview */}
          <Card>
            <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Contending Booking Requests ({contendingRequests.length} Teams)
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Target window: {formatDateTime(activeConflict.targetWindow.startTime)} –{' '}
                  {formatDateTime(activeConflict.targetWindow.endTime)}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                isLoading={isRunning}
                leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                onClick={handleRunEngine}
                className="shadow-xs font-bold"
              >
                Execute Allocation Engine
              </Button>
            </CardHeader>

            {/* Live Engine Execution Feedback Toast */}
            {engineRanBanner && (
              <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{engineRanBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEngineRanBanner(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Researcher / Team</th>
                    <th className="p-3">Research Project</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Requested Window</th>
                    <th className="p-3">Deadline Urgency</th>
                    <th className="p-3">Prior Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contendingRequests.map((req) => {
                    const u = users.find((usr) => usr.id === req.userId);
                    const p = projects.find((prj) => prj.id === req.projectId);
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-navy-900">
                          {u?.name}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {u?.email}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <span className="font-medium text-navy-800 line-clamp-1">
                            {p?.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {req.purpose}
                          </span>
                        </td>
                        <td className="p-3">
                          <StatusChip status={p?.priority || 'normal'} size="sm" />
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {formatDateTime(req.startTime)}
                          <span className="text-[10px] text-slate-400 block">
                            To {formatDateTime(req.endTime)}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-navy-900 block">
                            {formatDate(p?.deadline || '')}
                          </span>
                          <span className="text-[10px] text-rose-600 font-bold block">
                            Approaching
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-navy-900">
                            {u?.priorUsageHours} hrs
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Historical
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Allocation Results & Mathematical Explainability */}
          {allocationResult && (
            <div className="space-y-6">
              {/* Summary Metrics Bar */}
              <div className="rounded-card border border-surface-border bg-white p-5 shadow-card grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-r border-slate-100 pr-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Primary Slot Assigned
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {allocationResult.allocatedRequests} request
                  </span>
                  <span className="text-[11px] text-slate-500">Highest composite score</span>
                </div>

                <div className="border-r border-slate-100 pr-3">
                  <span className="text-[10px] uppercase font-bold text-primary-600 block">
                    Shifted to Equivalent Unit
                  </span>
                  <span className="text-2xl font-black text-primary-600 mt-1 block">
                    {allocationResult.shiftedToAlternativeUnits} requests
                  </span>
                  <span className="text-[11px] text-slate-500">Zero delay to students</span>
                </div>

                <div className="border-r border-slate-100 pr-3">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">
                    Shifted Slots / Waitlist
                  </span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">
                    {allocationResult.shiftedToAlternativeSlots + allocationResult.waitlistedRequests}
                  </span>
                  <span className="text-[11px] text-slate-500">Reconsidered on cancellation</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">
                    Fairness Index Delta
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-purple-700">
                      {allocationResult.fairnessIndexAfter}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {allocationResult.fairnessIndexBefore}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 block">
                    Jain's Metric Improved
                  </span>
                </div>
              </div>

              {/* Explanations & Factor Contribution Bars */}
              <Card>
                <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border">
                  <CardTitle className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                    Structured Explanations & Mathematical Rationale
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Transparent breakdown of score factors (0–100 normalized) and constraint satisfaction.
                  </p>
                </CardHeader>

                <div className="p-4 space-y-4">
                  {allocationResult.explanations.map((exp) => (
                    <div
                      key={exp.requestId}
                      className="p-4 rounded-xl border border-surface-border bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-navy-900">
                              {exp.userName}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({exp.requestId})
                            </span>
                            <StatusChip status={exp.status} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {exp.requestTitle}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-primary-700">
                            {exp.scoreBreakdown.totalScore.toFixed(1)} / 100
                          </span>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">
                            Composite Score
                          </span>
                        </div>
                      </div>

                      {/* Plain-English Explanation */}
                      <p className="text-xs text-navy-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {exp.explanationText}
                      </p>

                      {/* Why Alternative Offered Callout */}
                      {exp.whyAlternativeOffered && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary-50/60 border border-primary-200/60 text-xs text-primary-900">
                          <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Hardware Routing Decision</span>
                            <span>{exp.whyAlternativeOffered}</span>
                          </div>
                        </div>
                      )}

                      {/* 5 Factor Breakdown Progress Bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>Urgency (30%)</span>
                            <span className="font-bold text-navy-900">
                              {exp.scoreBreakdown.deadlineUrgency}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${exp.scoreBreakdown.deadlineUrgency}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>Priority (20%)</span>
                            <span className="font-bold text-navy-900">
                              {exp.scoreBreakdown.projectPriority}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${exp.scoreBreakdown.projectPriority}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>Waiting (20%)</span>
                            <span className="font-bold text-navy-900">
                              {exp.scoreBreakdown.waitingTime}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${exp.scoreBreakdown.waitingTime}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>Fairness (15%)</span>
                            <span className="font-bold text-navy-900">
                              {exp.scoreBreakdown.usageFairness}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${exp.scoreBreakdown.usageFairness}%` }}
                            />
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>Criticality (15%)</span>
                            <span className="font-bold text-navy-900">
                              {exp.scoreBreakdown.requirementCriticality}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${exp.scoreBreakdown.requirementCriticality}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Faculty Approval Commit Bar */}
              {activeConflict.status === 'resolved' || approvalFeedback ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Allocation Schedule Committed & Synced
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {approvalFeedback || 'This allocation has been approved by Faculty and committed atomically to the Smart Calendar.'}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/calendar')}
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0 font-bold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View in Smart Booking Calendar
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-purple-600" />
                      Faculty Review & Atomic Commitment
                    </h4>
                    <p className="text-[11px] text-purple-700">
                      Faculty Advisors review the mathematical reasoning and commit this schedule atomically to the calendar.
                    </p>
                    {currentRole !== 'faculty' && (
                      <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                        Currently in {currentRole} mode — clicking below switches to Faculty Advisor persona automatically.
                      </span>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (currentRole !== 'faculty') {
                        setRole('faculty');
                      }
                      const approved = approveAllocation(activeConflict.id);
                      if (approved) {
                        setApprovalFeedback('Allocation approved! 3 bookings committed atomically to the calendar.');
                      }
                    }}
                    className="bg-purple-700 hover:bg-purple-800 shrink-0 font-bold"
                  >
                    {currentRole === 'faculty' ? 'Approve & Commit Allocation' : 'Switch to Faculty & Approve'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: What-If Simulator View */}
      {activeTab === 'whatif' && whatIfComparison && (
        <div className="space-y-6">
          {/* Sliders Card */}
          <Card className="p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  What-If Weight Tuning & Simulation
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Adjust parameter weights to observe how ranking and assignments change in real time.
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
                <span className="text-[10px] text-slate-400 block">Must equal 100%</span>
              </div>
            </div>

            {/* Slider Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-navy-800 mb-1">
                  <span>Deadline Urgency</span>
                  <span>{Math.round(whatIfWeights.deadlineUrgency * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(whatIfWeights.deadlineUrgency * 100)}
                  onChange={(e) =>
                    setWhatIfWeights({
                      ...whatIfWeights,
                      deadlineUrgency: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-primary-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-800 mb-1">
                  <span>Project Priority</span>
                  <span>{Math.round(whatIfWeights.projectPriority * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(whatIfWeights.projectPriority * 100)}
                  onChange={(e) =>
                    setWhatIfWeights({
                      ...whatIfWeights,
                      projectPriority: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-800 mb-1">
                  <span>Waiting Time in Queue</span>
                  <span>{Math.round(whatIfWeights.waitingTime * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(whatIfWeights.waitingTime * 100)}
                  onChange={(e) =>
                    setWhatIfWeights({
                      ...whatIfWeights,
                      waitingTime: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-800 mb-1">
                  <span>Usage Fairness (Low Prior Usage)</span>
                  <span>{Math.round(whatIfWeights.usageFairness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(whatIfWeights.usageFairness * 100)}
                  onChange={(e) =>
                    setWhatIfWeights({
                      ...whatIfWeights,
                      usageFairness: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-navy-800 mb-1">
                  <span>Requirement Criticality</span>
                  <span>{Math.round(whatIfWeights.requirementCriticality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(whatIfWeights.requirementCriticality * 100)}
                  onChange={(e) =>
                    setWhatIfWeights({
                      ...whatIfWeights,
                      requirementCriticality: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-end justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWhatIfWeights({
                      deadlineUrgency: 0.3,
                      projectPriority: 0.2,
                      waitingTime: 0.2,
                      usageFairness: 0.15,
                      requirementCriticality: 0.15,
                    })
                  }
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Reset Weights
                </Button>

                {currentRole === 'admin' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEngineWeights(whatIfWeights);
                      alert('Engine weights saved as active campus policy!');
                    }}
                    className="w-full whitespace-nowrap"
                  >
                    Save as Policy
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Side-by-Side Simulation Comparison */}
          <Card>
            <CardHeader className="p-4 border-b border-surface-border">
              <CardTitle className="text-sm font-bold text-navy-900">
                Live Simulation Output vs Baseline
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Contending Researcher</th>
                    <th className="p-3">Baseline Score</th>
                    <th className="p-3">Simulated Score</th>
                    <th className="p-3">Baseline Status</th>
                    <th className="p-3">Simulated Status</th>
                    <th className="p-3">Net Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {whatIfComparison.changes.map((change) => (
                    <tr
                      key={change.requestId}
                      className={change.changed ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}
                    >
                      <td className="p-3 font-semibold text-navy-900">
                        {change.studentName}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {change.requestId}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        {change.baselineScore.toFixed(1)}
                      </td>
                      <td className="p-3 font-bold text-navy-900">
                        {change.simulatedScore.toFixed(1)}
                      </td>
                      <td className="p-3">
                        <StatusChip status={change.baselineStatus} size="sm" />
                      </td>
                      <td className="p-3">
                        <StatusChip status={change.simulatedStatus} size="sm" />
                      </td>
                      <td className="p-3">
                        {change.changed ? (
                          <span className="font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded text-[11px]">
                            Allocation Shifted
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unchanged</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

function ChevronRightIcon() {
  return <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>;
}
