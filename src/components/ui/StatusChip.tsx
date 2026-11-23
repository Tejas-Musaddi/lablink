import React from 'react';
import { cn } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Wrench,
  Sparkles,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  EquipmentAvailability,
  EquipmentCondition,
  BookingStatus,
  ProjectPriority,
} from '../../types';

interface StatusChipProps {
  status: EquipmentAvailability | EquipmentCondition | BookingStatus | ProjectPriority | string;
  size?: 'sm' | 'md';
  className?: string;
  customLabel?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'sm',
  className,
  customLabel,
}) => {
  let label = customLabel || status;
  let bgClass = 'bg-slate-100 text-slate-800 border-slate-200';
  let icon: React.ReactNode = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    // Availability
    case 'available':
      label = customLabel || 'Available Now';
      bgClass = 'bg-status-success-bg text-emerald-800 border-status-success-border';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'in_use':
      label = customLabel || 'In Use';
      bgClass = 'bg-status-info-bg text-blue-800 border-status-info-border';
      icon = <Clock className="w-3.5 h-3.5 text-blue-600" />;
      break;
    case 'reserved':
      label = customLabel || 'Reserved';
      bgClass = 'bg-status-warning-bg text-amber-800 border-status-warning-border';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'under_maintenance':
      label = customLabel || 'Under Maintenance';
      bgClass = 'bg-status-error-bg text-rose-800 border-status-error-border';
      icon = <Wrench className="w-3.5 h-3.5 text-rose-600" />;
      break;

    // Condition
    case 'optimal':
      label = customLabel || 'Optimal';
      bgClass = 'bg-status-success-bg text-emerald-800 border-status-success-border';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'good':
      label = customLabel || 'Good';
      bgClass = 'bg-status-info-bg text-blue-800 border-status-info-border';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      break;
    case 'fair':
      label = customLabel || 'Fair';
      bgClass = 'bg-status-warning-bg text-amber-800 border-status-warning-border';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'maintenance_required':
      label = customLabel || 'Service Needed';
      bgClass = 'bg-status-warning-bg text-amber-900 border-amber-300';
      icon = <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'out_of_service':
      label = customLabel || 'Out of Service';
      bgClass = 'bg-status-error-bg text-rose-800 border-status-error-border';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;

    // Booking Status
    case 'confirmed':
      label = customLabel || 'Confirmed';
      bgClass = 'bg-status-success-bg text-emerald-800 border-status-success-border';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'pending_approval':
      label = customLabel || 'Pending Approval';
      bgClass = 'bg-status-warning-bg text-amber-800 border-status-warning-border';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'rejected':
      label = customLabel || 'Rejected';
      bgClass = 'bg-status-error-bg text-rose-800 border-status-error-border';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;
    case 'in_session':
      label = customLabel || 'In Session';
      bgClass = 'bg-purple-50 text-purple-800 border-purple-200';
      icon = <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      break;
    case 'completed':
      label = customLabel || 'Completed';
      bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
      break;
    case 'cancelled':
      label = customLabel || 'Cancelled';
      bgClass = 'bg-slate-100 text-slate-500 border-slate-200 line-through';
      icon = <XCircle className="w-3.5 h-3.5 text-slate-400" />;
      break;
    case 'waitlisted':
      label = customLabel || 'Waitlisted';
      bgClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      icon = <Clock className="w-3.5 h-3.5 text-indigo-600" />;
      break;

    // Project Priority
    case 'critical':
      label = customLabel || 'Critical';
      bgClass = 'bg-status-error-bg text-rose-800 border-status-error-border font-semibold';
      icon = <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
      break;
    case 'high':
      label = customLabel || 'High Priority';
      bgClass = 'bg-status-warning-bg text-amber-800 border-status-warning-border';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'normal':
      label = customLabel || 'Normal';
      bgClass = 'bg-status-info-bg text-blue-800 border-status-info-border';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      break;
    case 'low':
      label = customLabel || 'Low';
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1.5' : 'text-sm px-3 py-1 gap-2';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border shadow-2xs capitalize whitespace-nowrap',
        sizeClasses,
        bgClass,
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
