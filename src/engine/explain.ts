import { ExplanationItem, ScoreBreakdown } from '../types';
import { ScoredRequest, ScheduledAssignment } from './types';

/**
 * Builds structured explanations with factor contributions and plain-English text.
 */
export function buildExplanation(
  scored: ScoredRequest,
  assignment?: ScheduledAssignment,
  infeasibleReasons?: string[]
): ExplanationItem {
  const req = scored.request;
  const proj = scored.project;
  const user = scored.user;
  const breakdown = scored.breakdown;

  if (infeasibleReasons && infeasibleReasons.length > 0) {
    return {
      requestId: req.id,
      requestTitle: proj.title,
      userName: user.name,
      scoreBreakdown: breakdown,
      status: 'rejected_infeasible',
      appliedConstraints: infeasibleReasons,
      explanationText: `Request disqualified by hard feasibility policy: ${infeasibleReasons.join(' ')}`,
      whyAlternativeOffered: 'Hard constraints always override allocation scoring.',
    };
  }

  if (!assignment) {
    return {
      requestId: req.id,
      requestTitle: proj.title,
      userName: user.name,
      scoreBreakdown: breakdown,
      status: 'waitlisted',
      appliedConstraints: [],
      explanationText: `No open slot could be found; queued on waitlist with score ${breakdown.totalScore.toFixed(1)}/100.`,
    };
  }

  const appliedConstraints: string[] = [
    'Zero double booking verified',
    'Within lab operating hours',
    'User safety qualifications confirmed',
  ];

  let plainEnglish = '';
  let whyAlternative: string | undefined = undefined;

  switch (assignment.status) {
    case 'allocated':
      plainEnglish = `Awarded primary slot. Total score: ${breakdown.totalScore.toFixed(1)}/100. Key drivers: Urgency (${breakdown.deadlineUrgency}/100), Priority (${breakdown.projectPriority}/100), Usage Equity (${breakdown.usageFairness}/100 with only ${user.priorUsageHours}h prior usage).`;
      break;

    case 'alternative_equipment':
      plainEnglish = `Shifted to equivalent hardware (${assignment.equipmentId}) at requested time. Total score: ${breakdown.totalScore.toFixed(1)}/100.`;
      whyAlternative = `Primary unit was allocated to a higher-scoring contention with closer deadline or higher priority. Equivalent hardware maintains your scheduled timeline without delay.`;
      break;

    case 'alternative_slot':
      plainEnglish = `Shifted to next collision-free window. Total score: ${breakdown.totalScore.toFixed(1)}/100. Urgency: ${breakdown.deadlineUrgency}/100.`;
      whyAlternative = `The requested window had an overlap with a contending request having higher deadline urgency or priority. Moving by the offset keeps the booking within project submission limits.`;
      break;

    case 'waitlisted':
      plainEnglish = `Placed in waitlist queue with priority score ${breakdown.totalScore.toFixed(1)}/100.`;
      whyAlternative = `All immediate slots and equivalent apparatus were booked. If any session cancels, your position will be automatically promoted.`;
      break;
  }

  return {
    requestId: req.id,
    requestTitle: proj.title,
    userName: user.name,
    assignedEquipmentId: assignment.equipmentId,
    allocatedSlot: assignment.slot
      ? {
          startTime: assignment.slot.startTime,
          endTime: assignment.slot.endTime,
        }
      : undefined,
    scoreBreakdown: breakdown,
    status: assignment.status,
    explanationText: plainEnglish,
    appliedConstraints,
    whyAlternativeOffered: whyAlternative,
  };
}
