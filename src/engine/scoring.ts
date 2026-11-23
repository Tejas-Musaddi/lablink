import {
  BookingRequest,
  Equipment,
  User,
  Project,
  EngineWeightConfig,
  ScoreBreakdown,
} from '../types';
import { DEFAULT_ENGINE_WEIGHTS } from '../data/seedData';

/**
 * Normalizes Deadline Urgency to 0–100.
 * Closer deadline yields higher score.
 */
export function calculateDeadlineUrgency(
  projectDeadline: string,
  referenceTimeMs: number
): number {
  if (!projectDeadline) return 50;
  const deadlineMs = new Date(projectDeadline).getTime();
  const diffHours = (deadlineMs - referenceTimeMs) / (1000 * 60 * 60);

  if (diffHours <= 0) return 100; // deadline already passed or imminent
  if (diffHours <= 24) return 98;
  if (diffHours <= 48) return 92;
  if (diffHours <= 72) return 85;
  if (diffHours <= 168) {
    // 3 to 7 days
    return Math.round(85 - ((diffHours - 72) / (168 - 72)) * 25);
  }
  // > 7 days
  const score = Math.max(10, 60 - ((diffHours - 168) / (336 - 168)) * 40);
  return Math.round(Math.min(100, score));
}

/**
 * Normalizes Project Priority to 0–100.
 */
export function calculateProjectPriority(priority: Project['priority']): number {
  switch (priority) {
    case 'critical':
      return 100;
    case 'high':
      return 80;
    case 'normal':
      return 50;
    case 'low':
      return 25;
    default:
      return 50;
  }
}

/**
 * Normalizes Waiting Time to 0–100.
 * Longer elapsed time since request creation = higher score.
 */
export function calculateWaitingTime(
  requestCreatedAt: string,
  referenceTimeMs: number
): number {
  const createdMs = new Date(requestCreatedAt).getTime();
  const waitHours = Math.max(0, (referenceTimeMs - createdMs) / (1000 * 60 * 60));
  // 72 hours waiting gives maximum 100 score
  return Math.min(100, Math.round((waitHours / 72) * 100));
}

/**
 * Normalizes Usage Fairness to 0–100.
 * Less prior usage = higher score.
 */
export function calculateUsageFairness(priorUsageHours: number): number {
  const maxBenchmark = 80; // hours
  const ratio = Math.min(1, Math.max(0, priorUsageHours / maxBenchmark));
  return Math.round((1 - ratio) * 100);
}

/**
 * Normalizes Requirement Criticality to 0–100.
 */
export function calculateRequirementCriticality(
  equipment: Equipment,
  project: Project
): number {
  const eqNameLower = equipment.name.toLowerCase();
  const eqCodeLower = equipment.code.toLowerCase();

  // Check if specifically named in project attached requirements
  const eqNameClean = eqNameLower.replace(/\([^)]*\)/g, '').trim(); // e.g. "nvidia dgx station a100"
  const isDirectlyNamed = project.attachedRequirements.some((req) => {
    const rLower = req.toLowerCase();
    return (
      rLower.includes(eqNameLower) ||
      rLower.includes(eqCodeLower) ||
      rLower.includes(eqNameClean) ||
      eqNameLower.includes(rLower)
    );
  });

  if (isDirectlyNamed) return 100;

  // Check category match
  const isCategoryMatch = project.requiredEquipmentCategories.includes(equipment.categoryId);
  if (isCategoryMatch) return 75;

  return 40;
}

/**
 * Computes full normalized score breakdown and weighted total.
 */
export function scoreBookingRequest(
  request: BookingRequest,
  equipment: Equipment,
  user: User,
  project: Project,
  weights: EngineWeightConfig = DEFAULT_ENGINE_WEIGHTS,
  referenceTime?: string
): ScoreBreakdown {
  const refMs = referenceTime ? new Date(referenceTime).getTime() : new Date('2026-11-23T12:00:00Z').getTime();

  const deadlineUrgency = calculateDeadlineUrgency(project.deadline, refMs);
  const projectPriority = calculateProjectPriority(project.priority);
  const waitingTime = calculateWaitingTime(request.createdAt, refMs);
  const usageFairness = calculateUsageFairness(user.priorUsageHours);
  const requirementCriticality = calculateRequirementCriticality(equipment, project);

  const totalScore =
    weights.deadlineUrgency * deadlineUrgency +
    weights.projectPriority * projectPriority +
    weights.waitingTime * waitingTime +
    weights.usageFairness * usageFairness +
    weights.requirementCriticality * requirementCriticality;

  return {
    deadlineUrgency,
    projectPriority,
    waitingTime,
    usageFairness,
    requirementCriticality,
    totalScore: Math.round(totalScore * 10) / 10,
  };
}
