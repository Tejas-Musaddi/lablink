import {
  BookingRequest,
  Equipment,
  Laboratory,
  User,
  Project,
  Booking,
  MaintenanceRecord,
} from '../types';
import { ScoredRequest, ScheduledAssignment, CandidateSlot } from './types';
import { checkHardConstraints } from './feasibility';

/**
 * Checks if two time intervals overlap: [s1, e1) and [s2, e2)
 */
export function intervalsOverlap(
  start1: string | number,
  end1: string | number,
  start2: string | number,
  end2: string | number
): boolean {
  const s1 = typeof start1 === 'string' ? new Date(start1).getTime() : start1;
  const e1 = typeof end1 === 'string' ? new Date(end1).getTime() : end1;
  const s2 = typeof start2 === 'string' ? new Date(start2).getTime() : start2;
  const e2 = typeof end2 === 'string' ? new Date(end2).getTime() : end2;

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Deterministic comparator for requests.
 * Primary: Total score descending
 * Tie-breaker 1: Earlier creation timestamp
 * Tie-breaker 2: Lower prior usage hours
 * Tie-breaker 3: Request ID alphabetical ascending
 */
export function compareScoredRequests(a: ScoredRequest, b: ScoredRequest): number {
  if (Math.abs(b.breakdown.totalScore - a.breakdown.totalScore) > 0.001) {
    return b.breakdown.totalScore - a.breakdown.totalScore;
  }

  const timeA = new Date(a.request.createdAt).getTime();
  const timeB = new Date(b.request.createdAt).getTime();
  if (timeA !== timeB) {
    return timeA - timeB;
  }

  if (a.user.priorUsageHours !== b.user.priorUsageHours) {
    return a.user.priorUsageHours - b.user.priorUsageHours;
  }

  return a.request.id.localeCompare(b.request.id);
}

/**
 * Searches for a nearest feasible alternative slot on the same equipment within lab hours.
 */
export function findAlternativeSlot(
  request: BookingRequest,
  equipment: Equipment,
  lab: Laboratory,
  user: User,
  project: Project,
  lockedAssignments: ScheduledAssignment[],
  existingBookings: Booking[],
  maintenanceRecords: MaintenanceRecord[]
): CandidateSlot | null {
  const originalStart = new Date(request.startTime).getTime();
  const originalEnd = new Date(request.endTime).getTime();
  const durationMs = originalEnd - originalStart;

  // Search shifts: +1h, +2h, +3h, +4h, -1h, -2h, -3h, +24h
  const shiftOffsetsHours = [1, 2, 3, 4, 5, -1, -2, -3, 24, 26, 28];

  for (const shiftH of shiftOffsetsHours) {
    const candidateStartMs = originalStart + shiftH * 3600 * 1000;
    const candidateEndMs = candidateStartMs + durationMs;

    const candidateStart = new Date(candidateStartMs).toISOString();
    const candidateEnd = new Date(candidateEndMs).toISOString();

    const dummyReq: BookingRequest = {
      ...request,
      startTime: candidateStart,
      endTime: candidateEnd,
    };

    // Check hard constraints for candidate slot
    const feasibility = checkHardConstraints(
      dummyReq,
      equipment,
      lab,
      user,
      project,
      existingBookings,
      maintenanceRecords
    );

    if (!feasibility.isFeasible) continue;

    // Check overlap with already locked assignments in this run
    const overlapsLocked = lockedAssignments.some(
      (a) =>
        a.equipmentId === equipment.id &&
        intervalsOverlap(a.slot.startTime, a.slot.endTime, candidateStart, candidateEnd)
    );

    if (!overlapsLocked) {
      return {
        startTime: candidateStart,
        endTime: candidateEnd,
        equipmentId: equipment.id,
      };
    }
  }

  return null;
}

/**
 * Searches for an alternative equivalent equipment unit.
 */
export function findAlternativeEquipmentUnit(
  request: BookingRequest,
  primaryEquipment: Equipment,
  allEquipment: Equipment[],
  allLabs: Laboratory[],
  user: User,
  project: Project,
  lockedAssignments: ScheduledAssignment[],
  existingBookings: Booking[],
  maintenanceRecords: MaintenanceRecord[]
): { slot: CandidateSlot; alternativeUnit: Equipment } | null {
  const labMap = new Map(allLabs.map((l) => [l.id, l]));

  // Candidate units: explicitly configured equivalent equipment or same category
  const candidateUnitIds = primaryEquipment.equivalentEquipmentIds || [];
  const candidateUnits = allEquipment.filter(
    (e) =>
      e.id !== primaryEquipment.id &&
      (candidateUnitIds.includes(e.id) ||
        (e.categoryId === primaryEquipment.categoryId && e.condition === 'optimal'))
  );

  for (const unit of candidateUnits) {
    const lab = labMap.get(unit.labId);
    if (!lab) continue;

    const dummyReq: BookingRequest = {
      ...request,
      equipmentId: unit.id,
    };

    const feasibility = checkHardConstraints(
      dummyReq,
      unit,
      lab,
      user,
      project,
      existingBookings,
      maintenanceRecords
    );

    if (!feasibility.isFeasible) continue;

    const overlapsLocked = lockedAssignments.some(
      (a) =>
        a.equipmentId === unit.id &&
        intervalsOverlap(a.slot.startTime, a.slot.endTime, request.startTime, request.endTime)
    );

    if (!overlapsLocked) {
      return {
        slot: {
          startTime: request.startTime,
          endTime: request.endTime,
          equipmentId: unit.id,
        },
        alternativeUnit: unit,
      };
    }
  }

  return null;
}

/**
 * Step 4: Interval scheduling with backtracking.
 * Highest scoring request gets its requested slot. Losing overlapping requests
 * are shifted to alternative slots or equivalent units, or placed on waitlist.
 */
export function scheduleFeasibleRequests(
  scoredRequests: ScoredRequest[],
  primaryEquipment: Equipment,
  allEquipment: Equipment[],
  allLabs: Laboratory[],
  existingBookings: Booking[],
  maintenanceRecords: MaintenanceRecord[]
): ScheduledAssignment[] {
  const sorted = [...scoredRequests].sort(compareScoredRequests);
  const assignments: ScheduledAssignment[] = [];
  const primaryLab = allLabs.find((l) => l.id === primaryEquipment.labId)!;

  for (const scored of sorted) {
    const req = scored.request;

    // Check if the primary slot is currently open among locked assignments
    const overlapsWithCommitted = assignments.some(
      (a) =>
        a.equipmentId === primaryEquipment.id &&
        intervalsOverlap(a.slot.startTime, a.slot.endTime, req.startTime, req.endTime)
    );

    if (!overlapsWithCommitted) {
      // Primary requested slot awarded to highest score!
      assignments.push({
        requestId: req.id,
        equipmentId: primaryEquipment.id,
        slot: {
          startTime: req.startTime,
          endTime: req.endTime,
          equipmentId: primaryEquipment.id,
        },
        status: 'allocated',
        reason: 'Requested slot allocated based on top-tier score.',
      });
      continue;
    }

    // Overlaps! Look for alternative unit first (keeps requested time slot)
    const altUnit = findAlternativeEquipmentUnit(
      req,
      primaryEquipment,
      allEquipment,
      allLabs,
      scored.user,
      scored.project,
      assignments,
      existingBookings,
      maintenanceRecords
    );

    if (altUnit) {
      assignments.push({
        requestId: req.id,
        equipmentId: altUnit.alternativeUnit.id,
        slot: altUnit.slot,
        status: 'alternative_equipment',
        reason: `Shifted to equivalent unit ${altUnit.alternativeUnit.name} (${altUnit.alternativeUnit.code}) at the requested time.`,
      });
      continue;
    }

    // Look for alternative slot on the primary equipment
    const altSlot = findAlternativeSlot(
      req,
      primaryEquipment,
      primaryLab,
      scored.user,
      scored.project,
      assignments,
      existingBookings,
      maintenanceRecords
    );

    if (altSlot) {
      assignments.push({
        requestId: req.id,
        equipmentId: primaryEquipment.id,
        slot: altSlot,
        status: 'alternative_slot',
        reason: `Original window conflicted; shifted to nearest feasible slot on ${primaryEquipment.code}.`,
      });
      continue;
    }

    // Otherwise, place on waitlist
    assignments.push({
      requestId: req.id,
      equipmentId: primaryEquipment.id,
      slot: {
        startTime: req.startTime,
        endTime: req.endTime,
        equipmentId: primaryEquipment.id,
      },
      status: 'waitlisted',
      reason: 'No collision-free alternative slot or equivalent apparatus available; queued on high-priority waitlist.',
    });
  }

  return assignments;
}
