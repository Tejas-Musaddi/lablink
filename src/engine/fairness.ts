/**
 * Computes Jain's Fairness Index:
 * J(x1, x2, ..., xn) = (sum(xi))^2 / (n * sum(xi^2))
 * Returns a value between 0.0 and 1.0.
 */
export function calculateJainsFairnessIndex(values: number[]): number {
  if (!values || values.length === 0) return 1.0;
  if (values.length === 1) return 1.0;

  // Add small epsilon to avoid divide-by-zero if all values are 0
  const adjusted = values.map((v) => Math.max(0.01, v));
  const sum = adjusted.reduce((acc, curr) => acc + curr, 0);
  const sumSq = adjusted.reduce((acc, curr) => acc + curr * curr, 0);

  const n = adjusted.length;
  const index = (sum * sum) / (n * sumSq);
  return Math.min(1.0, Math.max(0.0, Math.round(index * 100) / 100));
}

/**
 * Computes Fairness Index on student usage hours before and after a set of proposed allocations.
 */
export function computeFairnessComparison(
  studentPriorHours: number[],
  addedHoursPerStudent: number[]
): {
  fairnessBefore: number;
  fairnessAfter: number;
} {
  // To evaluate fairness of access, lower prior hours should ideally receive more hours.
  // We measure equity across (priorHours + addedHours)
  const combined = studentPriorHours.map((prior, i) => prior + (addedHoursPerStudent[i] || 0));

  const fairnessBefore = calculateJainsFairnessIndex(studentPriorHours);
  const fairnessAfter = calculateJainsFairnessIndex(combined);

  return {
    fairnessBefore,
    fairnessAfter,
  };
}
