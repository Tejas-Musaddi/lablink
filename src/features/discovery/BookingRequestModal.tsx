import React, { useState } from 'react';
import { Equipment } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { checkHardConstraints } from '../../engine/feasibility';

interface BookingRequestModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    currentUser,
    projects,
    laboratories,
    bookings,
    maintenanceRecords,
    createBookingRequest,
  } = useAppStore();

  const userProjects = projects.filter((p) =>
    p.leadStudentId === currentUser.id || p.teamMembers.includes(currentUser.id)
  );

  const [projectId, setProjectId] = useState(
    userProjects.length > 0 ? userProjects[0].id : projects[0]?.id || ''
  );
  const [startDate, setStartDate] = useState('2026-11-25');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [purpose, setPurpose] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!equipment) return null;

  const lab = laboratories.find((l) => l.id === equipment.labId);
  const selectedProject = projects.find((p) => p.id === projectId);

  const startIso = `${startDate}T${startTime}:00Z`;
  const endIso = `${startDate}T${endTime}:00Z`;

  // Real-time Feasibility Pre-check
  let feasibilityWarning: string | null = null;
  let hasContention = false;

  if (lab && selectedProject) {
    const check = checkHardConstraints(
      {
        id: 'preview',
        projectId,
        userId: currentUser.id,
        equipmentId: equipment.id,
        startTime: startIso,
        endTime: endIso,
        purpose: 'preview',
        createdAt: new Date().toISOString(),
        status: 'pending_approval',
      },
      equipment,
      lab,
      currentUser,
      selectedProject,
      bookings,
      maintenanceRecords
    );

    if (!check.isFeasible) {
      feasibilityWarning = check.rejectionReasons[0];
    } else {
      // Check if there are active bookings or contending requests in this slot
      const hasBookingOverlap = bookings.some((b) => {
        if (b.equipmentId !== equipment.id || b.status !== 'confirmed') return false;
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        const reqStart = new Date(startIso).getTime();
        const reqEnd = new Date(endIso).getTime();
        return Math.max(reqStart, bStart) < Math.min(reqEnd, bEnd);
      });
      if (hasBookingOverlap || equipment.id === 'eq-gpu---ai-workstations-001') {
        hasContention = true;
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setErrorMsg('Please specify research purpose & methodology.');
      return;
    }

    createBookingRequest({
      projectId,
      userId: currentUser.id,
      equipmentId: equipment.id,
      startTime: startIso,
      endTime: endIso,
      purpose,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Slot: ${equipment.name}`}
      description={`Asset Tag: ${equipment.code} • Max duration: ${equipment.maxBookingHoursPerSlot} hours`}
      size="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-navy-900">
            Booking Request Queued!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your request has been routed to the Fair Allocation Engine. Priority scoring and scheduling verification are complete.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Project */}
          <Select
            label="Associate with Research Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            helperText="Priority and submission deadline will be pulled from project profile."
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (Priority: {p.priority.toUpperCase()})
              </option>
            ))}
          </Select>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              type="date"
              label="Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Start Time (UTC)"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              type="time"
              label="End Time (UTC)"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {/* Purpose & Rationale */}
          <div>
            <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1.5">
              Research Objective & Hardware Rationale
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Explain how your model, experiment, or simulation depends on this specific piece of equipment..."
              className="block w-full rounded-lg border border-surface-border bg-white px-3.5 py-2 text-sm text-navy-900 placeholder:text-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            />
            {errorMsg && <p className="mt-1 text-xs text-red-600 font-medium">{errorMsg}</p>}
          </div>

          {/* Inline Live Feedback Alerts */}
          {feasibilityWarning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hard Constraint Warning</span>
                <span>{feasibilityWarning}</span>
              </div>
            </div>
          )}

          {hasContention && !feasibilityWarning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">High Demand / Contention Detected</span>
                <span>
                  Multiple teams are contending for this equipment window. The Fair Allocation Engine
                  will score requests by urgency and prior usage to resolve slots transparently.
                </span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
