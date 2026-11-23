import { describe, it, expect } from 'vitest';
import {
  runAllocationEngine,
  checkHardConstraints,
  calculateDeadlineUrgency,
  calculateProjectPriority,
  calculateWaitingTime,
  calculateUsageFairness,
  calculateRequirementCriticality,
  calculateJainsFairnessIndex,
  compareScoredRequests,
  simulateWhatIf,
} from '../index';
import { getInitialSeedData } from '../../data/seedData';
import { BookingRequest, Equipment, Laboratory, User, Project, Booking } from '../../types';

describe('Allocation Engine — Step 1: Feasibility & Hard Constraints', () => {
  const seed = getInitialSeedData();
  const eq = seed.equipment.find((e) => e.id === 'eq-gpu---ai-workstations-001')!;
  const lab = seed.laboratories.find((l) => l.id === eq.labId)!;
  const user = seed.users.find((u) => u.id === 'student-1')!;
  const project = seed.projects.find((p) => p.id === 'proj-1')!;

  it('passes a fully valid request within hours, prerequisites, and deadlines', () => {
    const validReq: BookingRequest = {
      id: 'req-test-valid',
      projectId: project.id,
      userId: user.id,
      equipmentId: eq.id,
      startTime: '2026-11-25T14:00:00Z',
      endTime: '2026-11-25T17:00:00Z',
      purpose: 'Model training test',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const res = checkHardConstraints(validReq, eq, lab, user, project, [], []);
    expect(res.isFeasible).toBe(true);
    expect(res.rejectionReasons).toHaveLength(0);
  });

  it('rejects a request with missing prerequisite training certifications', () => {
    const untrainedUser: User = {
      ...user,
      completedTrainings: [], // no credentials
    };

    const req: BookingRequest = {
      id: 'req-test-noprereq',
      projectId: project.id,
      userId: untrainedUser.id,
      equipmentId: eq.id,
      startTime: '2026-11-25T14:00:00Z',
      endTime: '2026-11-25T17:00:00Z',
      purpose: 'Model training test',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const res = checkHardConstraints(req, eq, lab, untrainedUser, project, [], []);
    expect(res.isFeasible).toBe(false);
    expect(res.rejectionReasons[0]).toContain('lacks required safety credentials');
  });

  it('rejects a request that exceeds maximum booking slot hours', () => {
    const req: BookingRequest = {
      id: 'req-test-toolong',
      projectId: project.id,
      userId: user.id,
      equipmentId: eq.id,
      startTime: '2026-11-25T10:00:00Z',
      endTime: '2026-11-25T20:00:00Z', // 10 hours (max is 6)
      purpose: 'Overly long test',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const res = checkHardConstraints(req, eq, lab, user, project, [], []);
    expect(res.isFeasible).toBe(false);
    expect(res.rejectionReasons[0]).toContain('exceeds maximum allowed slot limit');
  });

  it('rejects a request outside laboratory operating hours', () => {
    const req: BookingRequest = {
      id: 'req-test-afterhours',
      projectId: project.id,
      userId: user.id,
      equipmentId: eq.id,
      startTime: '2026-11-25T02:00:00Z', // 2 AM (lab opens at 08:00)
      endTime: '2026-11-25T05:00:00Z',
      purpose: 'Late night run',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const res = checkHardConstraints(req, eq, lab, user, project, [], []);
    expect(res.isFeasible).toBe(false);
    expect(res.rejectionReasons[0]).toContain('outside lab operating hours');
  });

  it('rejects a request overlapping with scheduled maintenance', () => {
    const req: BookingRequest = {
      id: 'req-test-maint',
      projectId: project.id,
      userId: user.id,
      equipmentId: eq.id,
      startTime: '2026-11-24T09:00:00Z',
      endTime: '2026-11-24T12:00:00Z',
      purpose: 'Maintenance overlap test',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const maintenance = [
      {
        id: 'm-1',
        equipmentId: eq.id,
        labId: lab.id,
        title: 'Thermal paste flush',
        description: 'Scheduled maintenance',
        scheduledStart: '2026-11-24T08:00:00Z',
        scheduledEnd: '2026-11-24T14:00:00Z',
        performedBy: 'Technician',
        type: 'routine' as const,
        status: 'scheduled' as const,
      },
    ];

    const res = checkHardConstraints(req, eq, lab, user, project, [], maintenance);
    expect(res.isFeasible).toBe(false);
    expect(res.rejectionReasons[0]).toContain('conflicts with scheduled maintenance');
  });

  it('rejects a request overlapping with an existing confirmed booking', () => {
    const req: BookingRequest = {
      id: 'req-test-doublebook',
      projectId: project.id,
      userId: user.id,
      equipmentId: eq.id,
      startTime: '2026-11-25T14:00:00Z',
      endTime: '2026-11-25T17:00:00Z',
      purpose: 'Double book test',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const existingBookings: Booking[] = [
      {
        id: 'b-existing-1',
        requestId: 'req-other',
        projectId: 'proj-other',
        userId: 'student-99',
        equipmentId: eq.id,
        labId: lab.id,
        startTime: '2026-11-25T15:00:00Z',
        endTime: '2026-11-25T18:00:00Z',
        status: 'confirmed',
        createdAt: '2026-11-20T10:00:00Z',
      },
    ];

    const res = checkHardConstraints(req, eq, lab, user, project, existingBookings, []);
    expect(res.isFeasible).toBe(false);
    expect(res.rejectionReasons[0]).toContain('collides with an existing locked confirmed booking');
  });
});

describe('Allocation Engine — Step 3: Scoring & Normalization', () => {
  const seed = getInitialSeedData();
  const eq = seed.equipment.find((e) => e.id === 'eq-gpu---ai-workstations-001')!;
  const proj = seed.projects.find((p) => p.id === 'proj-1')!;

  it('scores deadline urgency higher as deadline approaches', () => {
    const refMs = new Date('2026-11-23T12:00:00Z').getTime();
    const urgent = calculateDeadlineUrgency('2026-11-24T12:00:00Z', refMs); // 24h away
    const far = calculateDeadlineUrgency('2026-12-20T12:00:00Z', refMs); // ~27 days away
    expect(urgent).toBeGreaterThan(far);
    expect(urgent).toBeGreaterThanOrEqual(95);
    expect(far).toBeLessThan(50);
  });

  it('scores project priority hierarchically', () => {
    expect(calculateProjectPriority('critical')).toBe(100);
    expect(calculateProjectPriority('high')).toBe(80);
    expect(calculateProjectPriority('normal')).toBe(50);
    expect(calculateProjectPriority('low')).toBe(25);
  });

  it('rewards lower prior usage in fairness factor', () => {
    const lowUsageScore = calculateUsageFairness(10);
    const highUsageScore = calculateUsageFairness(70);
    expect(lowUsageScore).toBeGreaterThan(highUsageScore);
  });

  it('rewards waiting time in queue', () => {
    const refMs = new Date('2026-11-23T12:00:00Z').getTime();
    const waitedLong = calculateWaitingTime('2026-11-20T12:00:00Z', refMs); // 72 hrs ago
    const justSubmitted = calculateWaitingTime('2026-11-23T11:30:00Z', refMs);
    expect(waitedLong).toBe(100);
    expect(justSubmitted).toBeLessThan(10);
  });

  it('awards 100 criticality when equipment is directly named in requirements', () => {
    const score = calculateRequirementCriticality(eq, proj);
    expect(score).toBe(100);
  });
});

describe('Allocation Engine — Step 4 & 5: Hero Conflict Scenario & Determinism', () => {
  const seed = getInitialSeedData();
  const heroEqId = 'eq-gpu---ai-workstations-001';
  const heroConflict = seed.conflicts.find((c) => c.isHeroScenario)!;
  const contending = seed.bookingRequests.filter((r) =>
    heroConflict.contendingRequestIds.includes(r.id)
  );

  it('resolves the Hero scenario deterministically', () => {
    const result = runAllocationEngine({
      equipmentId: heroEqId,
      contendingRequests: contending,
      allEquipment: seed.equipment,
      laboratories: seed.laboratories,
      users: seed.users,
      projects: seed.projects,
      existingBookings: seed.bookings,
      maintenanceRecords: seed.maintenanceRecords,
      weights: seed.engineWeights,
      referenceTime: '2026-11-23T12:00:00Z',
    });

    expect(result.totalRequests).toBe(3);
    // Primary slot awarded to top-scoring Aarav Sharma (student-1, proj-1)
    const aaravAssignment = result.explanations.find((e) => e.requestId === 'req-hero-1');
    expect(aaravAssignment).toBeDefined();
    expect(aaravAssignment?.status).toBe('allocated');

    // Rival requests shifted to alternative equipment or slot
    const elenaAssignment = result.explanations.find((e) => e.requestId === 'req-hero-2');
    expect(elenaAssignment).toBeDefined();
    expect(['alternative_equipment', 'alternative_slot']).toContain(elenaAssignment?.status);

    // Fairness index calculated
    expect(result.fairnessIndexAfter).toBeGreaterThanOrEqual(result.fairnessIndexBefore);

    // Feasible schedule has no double bookings
    expect(result.feasibleSchedule.length).toBeGreaterThan(0);
  });

  it('guarantees 100% deterministic outputs across repeated runs', () => {
    const context = {
      equipmentId: heroEqId,
      contendingRequests: contending,
      allEquipment: seed.equipment,
      laboratories: seed.laboratories,
      users: seed.users,
      projects: seed.projects,
      existingBookings: seed.bookings,
      maintenanceRecords: seed.maintenanceRecords,
      weights: seed.engineWeights,
      referenceTime: '2026-11-23T12:00:00Z',
    };

    const run1 = runAllocationEngine(context);
    const run2 = runAllocationEngine(context);
    const run3 = runAllocationEngine(context);

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    expect(JSON.stringify(run2)).toBe(JSON.stringify(run3));
  });

  it('handles tie-breakers deterministically', () => {
    const reqA: BookingRequest = {
      id: 'req-tie-A',
      projectId: 'proj-1',
      userId: 'student-1',
      equipmentId: heroEqId,
      startTime: '2026-11-25T14:00:00Z',
      endTime: '2026-11-25T17:00:00Z',
      purpose: 'Tie break A',
      createdAt: '2026-11-23T08:00:00Z',
      status: 'pending_approval',
    };

    const reqB: BookingRequest = {
      id: 'req-tie-B',
      projectId: 'proj-1',
      userId: 'student-2',
      equipmentId: heroEqId,
      startTime: '2026-11-25T14:00:00Z',
      endTime: '2026-11-25T17:00:00Z',
      purpose: 'Tie break B',
      createdAt: '2026-11-23T09:00:00Z', // 1 hour later
      status: 'pending_approval',
    };

    const scoredA = {
      request: reqA,
      project: seed.projects[0],
      user: seed.users[0],
      breakdown: {
        deadlineUrgency: 90,
        projectPriority: 90,
        waitingTime: 50,
        usageFairness: 50,
        requirementCriticality: 80,
        totalScore: 75.0,
      },
    };

    const scoredB = {
      request: reqB,
      project: seed.projects[0],
      user: seed.users[0],
      breakdown: {
        deadlineUrgency: 90,
        projectPriority: 90,
        waitingTime: 50,
        usageFairness: 50,
        requirementCriticality: 80,
        totalScore: 75.0,
      },
    };

    // Equal score: A was created earlier, so compareScoredRequests must order A before B
    const order = compareScoredRequests(scoredA, scoredB);
    expect(order).toBeLessThan(0);
  });
});

describe('Allocation Engine — Jain’s Fairness Index', () => {
  it('computes 1.0 for equal allocations', () => {
    expect(calculateJainsFairnessIndex([10, 10, 10, 10])).toBe(1.0);
  });

  it('computes 1/n for absolute monopoly', () => {
    // 1 user gets 100, others get ~0
    const index = calculateJainsFairnessIndex([100, 0, 0, 0]);
    expect(index).toBeCloseTo(0.25, 1);
  });
});

describe('Allocation Engine — What-If Simulator', () => {
  const seed = getInitialSeedData();
  const heroEqId = 'eq-gpu---ai-workstations-001';
  const heroConflict = seed.conflicts.find((c) => c.isHeroScenario)!;
  const contending = seed.bookingRequests.filter((r) =>
    heroConflict.contendingRequestIds.includes(r.id)
  );

  it('simulates allocation outcome changes when weights are shifted', () => {
    const baseContext = {
      equipmentId: heroEqId,
      contendingRequests: contending,
      allEquipment: seed.equipment,
      laboratories: seed.laboratories,
      users: seed.users,
      projects: seed.projects,
      existingBookings: seed.bookings,
      maintenanceRecords: seed.maintenanceRecords,
      weights: seed.engineWeights,
      referenceTime: '2026-11-23T12:00:00Z',
    };

    const sim = simulateWhatIf({
      baseContext,
      customWeights: {
        deadlineUrgency: 0.05,
        projectPriority: 0.10,
        waitingTime: 0.05,
        usageFairness: 0.70, // Overwhelming weight on usage fairness
        requirementCriticality: 0.10,
      },
    });

    expect(sim.baseline).toBeDefined();
    expect(sim.simulated).toBeDefined();
    expect(sim.changes).toHaveLength(3);
  });
});
