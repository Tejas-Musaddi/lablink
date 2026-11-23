import { AllocationResult, ExplanationItem, BookingStatus } from '../types';
import { EngineInputContext, ScoredRequest } from './types';
import { checkHardConstraints } from './feasibility';
import { scoreBookingRequest } from './scoring';
import { scheduleFeasibleRequests } from './scheduler';
import { buildExplanation } from './explain';
import { computeFairnessComparison } from './fairness';
import { DEFAULT_ENGINE_WEIGHTS } from '../data/seedData';

export * from './types';
export * from './feasibility';
export * from './scoring';
export * from './fairness';
export * from './scheduler';
export * from './explain';
export * from './simulator';

/**
 * Main Allocation Engine entry point.
 * Pure TypeScript module with ZERO UI dependencies.
 * Deterministic, explainable, and fully unit-testable.
 */
export function runAllocationEngine(context: EngineInputContext): AllocationResult {
  const {
    equipmentId,
    contendingRequests,
    allEquipment,
    laboratories,
    users,
    projects,
    existingBookings,
    maintenanceRecords,
    weights = DEFAULT_ENGINE_WEIGHTS,
    referenceTime,
  } = context;

  const primaryEquipment = allEquipment.find((e) => e.id === equipmentId);
  if (!primaryEquipment) {
    throw new Error(`Engine execution error: primary equipment ID "${equipmentId}" not found.`);
  }

  const primaryLab = laboratories.find((l) => l.id === primaryEquipment.labId);
  if (!primaryLab) {
    throw new Error(`Engine execution error: Lab ID "${primaryEquipment.labId}" not found.`);
  }

  const userMap = new Map(users.map((u) => [u.id, u]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Step 1: Evaluate hard feasibility constraints for each request
  const feasibleRequests: {
    request: (typeof contendingRequests)[0];
    user: (typeof users)[0];
    project: (typeof projects)[0];
  }[] = [];

  const infeasibleExplanations: ExplanationItem[] = [];

  for (const req of contendingRequests) {
    const user = userMap.get(req.userId);
    const project = projectMap.get(req.projectId);

    if (!user || !project) {
      continue;
    }

    const check = checkHardConstraints(
      req,
      primaryEquipment,
      primaryLab,
      user,
      project,
      existingBookings,
      maintenanceRecords
    );

    if (check.isFeasible) {
      feasibleRequests.push({ request: req, user, project });
    } else {
      const dummyScore = scoreBookingRequest(req, primaryEquipment, user, project, weights, referenceTime);
      infeasibleExplanations.push(
        buildExplanation(
          { request: req, project, user, breakdown: dummyScore },
          undefined,
          check.rejectionReasons
        )
      );
    }
  }

  // Step 2 & 3: Score all feasible requests
  const scoredRequests: ScoredRequest[] = feasibleRequests.map(({ request, user, project }) => ({
    request,
    user,
    project,
    breakdown: scoreBookingRequest(request, primaryEquipment, user, project, weights, referenceTime),
  }));

  // Step 4: Schedule feasible requests via interval scheduling with backtracking
  const scheduledAssignments = scheduleFeasibleRequests(
    scoredRequests,
    primaryEquipment,
    allEquipment,
    laboratories,
    existingBookings,
    maintenanceRecords
  );

  const assignmentMap = new Map(scheduledAssignments.map((a) => [a.requestId, a]));

  // Step 5: Explanations & Fairness Computation
  const explanations: ExplanationItem[] = [
    ...scoredRequests.map((s) => buildExplanation(s, assignmentMap.get(s.request.id))),
    ...infeasibleExplanations,
  ];

  // Calculate Fairness Index (before vs after)
  const studentPriorHours = scoredRequests.map((s) => s.user.priorUsageHours);
  const allocatedHoursPerStudent = scoredRequests.map((s) => {
    const assignment = assignmentMap.get(s.request.id);
    if (assignment && assignment.status !== 'waitlisted') {
      const start = new Date(assignment.slot.startTime).getTime();
      const end = new Date(assignment.slot.endTime).getTime();
      return Math.max(0, (end - start) / (3600 * 1000));
    }
    return 0;
  });

  const { fairnessBefore, fairnessAfter } = computeFairnessComparison(
    studentPriorHours,
    allocatedHoursPerStudent
  );

  // Build Feasible Schedule
  const feasibleSchedule = scheduledAssignments
    .filter((a) => a.status !== 'waitlisted')
    .map((a) => ({
      requestId: a.requestId,
      equipmentId: a.equipmentId,
      startTime: a.slot.startTime,
      endTime: a.slot.endTime,
      status: 'confirmed' as BookingStatus,
    }));

  const allocatedCount = scheduledAssignments.filter((a) => a.status === 'allocated').length;
  const shiftedSlotsCount = scheduledAssignments.filter((a) => a.status === 'alternative_slot').length;
  const shiftedUnitsCount = scheduledAssignments.filter((a) => a.status === 'alternative_equipment').length;
  const waitlistedCount = scheduledAssignments.filter((a) => a.status === 'waitlisted').length;

  return {
    equipmentId,
    timestamp: referenceTime || new Date().toISOString(),
    totalRequests: contendingRequests.length,
    allocatedRequests: allocatedCount,
    shiftedToAlternativeSlots: shiftedSlotsCount,
    shiftedToAlternativeUnits: shiftedUnitsCount,
    waitlistedRequests: waitlistedCount,
    rejectedInfeasibleRequests: infeasibleExplanations.length,
    fairnessIndexBefore: fairnessBefore,
    fairnessIndexAfter: fairnessAfter,
    explanations,
    feasibleSchedule,
  };
}
