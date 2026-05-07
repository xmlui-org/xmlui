/**
 * Levenshtein-distance suggestion helper for the type-contract verifier.
 *
 * Used by the `unknown-prop` check to surface "did you mean…?" hints
 * when a prop name is close (distance ≤ 2) to a known prop name.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phase 2 §2.1.
 */

const MAX_SUGGESTION_DISTANCE = 2;

/**
 * Compute the Levenshtein edit distance between two strings.
 *
 * Uses the standard single-row DP algorithm: O(|a| × |b|) time, O(|b|) space.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // dp[j] = edit distance between a[0..i] and b[0..j] for current row i
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const curr = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : Math.min(prev, dp[j - 1], dp[j]) + 1;
      prev = curr;
    }
  }
  return dp[n];
}

/**
 * Return the closest matching candidate to `name` with edit distance ≤
 * `MAX_SUGGESTION_DISTANCE` (currently 2), or `undefined` if none is within
 * range.
 *
 * When multiple candidates share the minimum distance the first one
 * encountered (in iteration order) wins — callers should pass a stable list.
 */
export function findSuggestion(
  name: string,
  candidates: readonly string[],
): string | undefined {
  let best: string | undefined;
  let bestDist = MAX_SUGGESTION_DISTANCE + 1;
  for (const candidate of candidates) {
    const d = levenshtein(name, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  return bestDist <= MAX_SUGGESTION_DISTANCE ? best : undefined;
}
