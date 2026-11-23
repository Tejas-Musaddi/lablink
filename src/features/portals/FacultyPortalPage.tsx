import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Modal } from '../../components/ui/Modal';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../lib/utils';

export const FacultyPortalPage: React.FC = () => {
  const {
    currentRole,
    currentUser,
    setRole,
    conflicts,
    bookingRequests,
    equipmentMap,
    projectMap,
    userMap,
    approveAllocation,
    rejectAllocation,
  } = useAppStore();

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedConflictId, setSelectedConflictId] = useState<string>('');
  const [facultyComment, setFacultyComment] = useState('');
  const [rejectMode, setRejectMode] = useState(false);

  const pendingConflicts = conflicts.filter((c) => c.status !== 'resolved');

  const handleOpenApprove = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setRejectMode(false);
    setFacultyComment('Approved: Allocation engine priority scoring verified.');
    setCommentModalOpen(true);
  };

  const handleOpenReject = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setRejectMode(true);
    setFacultyComment('Requires revision: Manual override requested by Department Chair.');
    setCommentModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (rejectMode) {
      rejectAllocation(selectedConflictId, facultyComment);
    } else {
      approveAllocation(selectedConflictId, facultyComment);
    }
    setCommentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Role Banner if not Faculty */}
      {currentRole !== 'faculty' && (
        <div className="rounded-xl bg-purple-50 p-4 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0" />
            <span>
              You are currently viewing in <strong>{currentRole}</strong> mode. Switch persona to <strong>Faculty Advisor</strong> to execute approvals.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRole('faculty')}
            className="bg-purple-700 hover:bg-purple-800 shrink-0"
          >
            Switch to Faculty
          </Button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">
          Faculty Governance & Allocation Approval Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review high-contention resource allocations sorted by AI urgency, inspect score breakdowns, and commit schedules atomically.
        </p>
      </div>

      {/* Approval Queue */}
      <div className="space-y-4">
        {pendingConflicts.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-navy-900">All Queue Items Reviewed</h3>
            <p className="text-xs text-slate-500">
              No pending scheduling conflicts require approval at this time.
            </p>
          </Card>
        ) : (
          pendingConflicts.map((conf) => {
            const eq = equipmentMap[conf.equipmentId];
            const contending = bookingRequests.filter((r) =>
              conf.contendingRequestIds.includes(r.id)
            );

            return (
              <Card key={conf.id} className="overflow-hidden shadow-card">
                <CardHeader className="bg-slate-50/70 p-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                        {conf.isHeroScenario ? '★ Hero Contention' : 'Conflict Review'}
                      </span>
                      <StatusChip status={conf.status} size="sm" />
                    </div>
                    <CardTitle className="text-base font-bold text-navy-900 mt-1">
                      {conf.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Apparatus: <strong>{eq?.name}</strong> ({eq?.code})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReject(conf.id)}
                      className="text-red-600 hover:bg-red-50 text-xs"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleOpenApprove(conf.id)}
                      className="text-xs font-bold"
                    >
                      Approve Recommendation
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Contending Research Teams ({contending.length})
                    </h5>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {contending.map((req) => {
                        const u = userMap[req.userId];
                        const p = projectMap[req.projectId];
                        return (
                          <div
                            key={req.id}
                            className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-navy-900">
                                {u?.name} ({p?.title})
                              </span>
                              <span className="text-slate-500 block">
                                Requested: {formatDateTime(req.startTime)} – {formatDateTime(req.endTime)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusChip status={p?.priority || 'normal'} size="sm" />
                              <span className="text-[11px] font-semibold text-slate-600">
                                Prior: {u?.priorUsageHours}h
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Engine Reasoning Summary */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-navy-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      LabLink Engine Rationale:
                    </span>
                    <p className="text-slate-600">
                      Primary requested window assigned to Aarav Sharma (critical priority, earliest thesis deadline, low prior usage). Elena Rostova's team is shifted to equivalent hardware (NVIDIA H100 Node 01) with zero schedule disruption.
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Confirmation & Comment Modal */}
      <Modal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title={rejectMode ? 'Reject Allocation Recommendation' : 'Approve & Commit Allocation'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            {rejectMode
              ? 'Please record the rationale for rejecting this allocation recommendation.'
              : 'Approving this schedule will atomically lock the calendar bookings, notify the student teams, and update usage history.'}
          </p>

          <div>
            <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1.5">
              Faculty Comments / Directives
            </label>
            <textarea
              rows={3}
              value={facultyComment}
              onChange={(e) => setFacultyComment(e.target.value)}
              className="block w-full rounded-lg border border-surface-border bg-white p-3 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={rejectMode ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmAction}
            >
              Confirm {rejectMode ? 'Rejection' : 'Approval'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
