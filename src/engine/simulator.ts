import { EngineWeightConfig, AllocationResult } from '../types';
import { EngineInputContext } from './types';
import { runAllocationEngine } from './index';

export interface WhatIfScenarioInput {
  baseContext: EngineInputContext;
  customWeights?: EngineWeightConfig;
  deadlineOverrides?: Record<string, string>; // projectId -> new deadline
  priorityOverrides?: Record<string, 'low' | 'normal' | 'high' | 'critical'>;
}

export interface WhatIfComparison {
  baseline: AllocationResult;
  simulated: AllocationResult;
  changes: {
    requestId: string;
    studentName: string;
    baselineStatus: string;
    simulatedStatus: string;
    baselineScore: number;
    simulatedScore: number;
    changed: boolean;
  }[];
}

/**
 * Runs What-If simulation comparing baseline against customized weights or project parameters.
 */
export function simulateWhatIf(input: WhatIfScenarioInput): WhatIfComparison {
  // 1. Run baseline
  const baseline = runAllocationEngine(input.baseContext);

  // 2. Clone projects with any overrides
  const modifiedProjects = input.baseContext.projects.map((p) => {
    let copy = { ...p };
    if (input.deadlineOverrides && input.deadlineOverrides[p.id]) {
      copy.deadline = input.deadlineOverrides[p.id];
    }
    if (input.priorityOverrides && input.priorityOverrides[p.id]) {
      copy.priority = input.priorityOverrides[p.id];
    }
    return copy;
  });

  // 3. Run simulated
  const simulated = runAllocationEngine({
    ...input.baseContext,
    projects: modifiedProjects,
    weights: input.customWeights || input.baseContext.weights,
  });

  // 4. Compare item by item
  const changes = baseline.explanations.map((baseExp) => {
    const simExp = simulated.explanations.find((s) => s.requestId === baseExp.requestId);
    const simStatus = simExp?.status || 'unknown';
    const simScore = simExp?.scoreBreakdown.totalScore || 0;
    const isChanged =
      baseExp.status !== simStatus ||
      Math.abs(baseExp.scoreBreakdown.totalScore - simScore) > 0.1 ||
      baseExp.assignedEquipmentId !== simExp?.assignedEquipmentId;

    return {
      requestId: baseExp.requestId,
      studentName: baseExp.userName,
      baselineStatus: baseExp.status,
      simulatedStatus: simStatus,
      baselineScore: baseExp.scoreBreakdown.totalScore,
      simulatedScore: simScore,
      changed: isChanged,
    };
  });

  return {
    baseline,
    simulated,
    changes,
  };
}
