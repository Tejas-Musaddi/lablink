import {
  BookingRequest,
  Equipment,
  Laboratory,
  User,
  Project,
  Booking,
  MaintenanceRecord,
} from '../types';
import { FeasibilityAssessment } from './types';

/**
 * Checks hard constraints for a single booking request.
 * Hard constraints ALWAYS override scores.
 */
export function checkHardConstraints(
  request: BookingRequest,
  equipment: Equipment,
  lab: Laboratory,
  user: User,
  project: Project,
  existingBookings: Booking[],
  maintenanceRecords: MaintenanceRecord[]
): FeasibilityAssessment {
  const reasons: string[] = [];

  const reqStart = new Date(request.startTime).getTime();
  const reqEnd = new Date(request.endTime).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    reasons.push('Invalid time interval: end time must be strictly after start time.');
  }

  // 1. Equipment Condition Usable
  if (
    equipment.condition === 'maintenance_required' ||
    equipment.condition === 'out_of_service'
  ) {
    reasons.push(
      `Equipment is currently unusable due to condition: ${equipment.condition.replace('_', ' ')}.`
    );
  }

  // 2. Slot length within policy
  const durationHours = (reqEnd - reqStart) / (1000 * 60 * 60);
  if (durationHours > equipment.maxBookingHoursPerSlot) {
    reasons.push(
      `Requested duration (${durationHours.toFixed(1)}h) exceeds maximum allowed slot limit (${equipment.maxBookingHoursPerSlot}h).`
    );
  }

  // 3. User meets prerequisite/training
  if (equipment.prerequisites && equipment.prerequisites.length > 0) {
    const missing = equipment.prerequisites.filter(
      (p) => !user.completedTrainings.includes(p)
    );
    if (missing.length > 0) {
      reasons.push(`User lacks required safety credentials: ${missing.join(', ')}.`);
    }
  }

  // 4. Before project deadline
  if (project.deadline) {
    const deadlineTime = new Date(project.deadline).getTime();
    if (reqEnd > deadlineTime) {
      reasons.push(
        `Requested slot concludes after project submission deadline (${project.deadline}).`
      );
    }
  }

  // 5. Within lab operating hours and days
  const startDate = new Date(request.startTime);
  const dayOfWeek = startDate.getUTCDay(); // 0 = Sun, 1 = Mon ...
  if (
    lab.operatingHours &&
    lab.operatingHours.daysOfWeek &&
    !lab.operatingHours.daysOfWeek.includes(dayOfWeek)
  ) {
    reasons.push(
      `Lab ${lab.name} is closed on day of week ${dayOfWeek} (Sunday=0, Monday=1).`
    );
  } else if (lab.operatingHours) {
    const [openH, openM] = lab.operatingHours.open.split(':').map(Number);
    const [closeH, closeM] = lab.operatingHours.close.split(':').map(Number);

    const slotStartMin = startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
    const endDate = new Date(request.endTime);
    const slotEndMin = endDate.getUTCHours() * 60 + endDate.getUTCMinutes();

    const labOpenMin = openH * 60 + openM;
    const labCloseMin = closeH * 60 + closeM;

    if (slotStartMin < labOpenMin || slotEndMin > labCloseMin) {
      reasons.push(
        `Requested time (${lab.operatingHours.open} - ${lab.operatingHours.close}) falls outside lab operating hours.`
      );
    }
  }

  // 6. Not during scheduled maintenance
  const hasMaintenanceOverlap = maintenanceRecords.some((m) => {
    if (m.equipmentId !== equipment.id || m.status === 'completed') return false;
    const mStart = new Date(m.scheduledStart).getTime();
    const mEnd = new Date(m.scheduledEnd).getTime();
    return Math.max(reqStart, mStart) < Math.min(reqEnd, mEnd);
  });

  if (hasMaintenanceOverlap) {
    reasons.push(
      `Requested slot conflicts with scheduled maintenance on equipment ${equipment.code}.`
    );
  }

  // 7. No double booking against existing confirmed bookings (excluding the contending batch itself)
  const hasConfirmedBookingOverlap = existingBookings.some((b) => {
    if (b.equipmentId !== equipment.id || b.status !== 'confirmed') return false;
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    return Math.max(reqStart, bStart) < Math.min(reqEnd, bEnd);
  });

  if (hasConfirmedBookingOverlap) {
    reasons.push(
      `Slot collides with an existing locked confirmed booking on ${equipment.name}.`
    );
  }

  return {
    requestId: request.id,
    isFeasible: reasons.length === 0,
    rejectionReasons: reasons,
  };
}
