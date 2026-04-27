import { createContext, useContext } from "react";

/**
 * Defence-in-depth limit for nested compound (user-defined) component
 * rendering. Real-world UDC nesting almost never exceeds a couple of dozen
 * levels; this budget allows legitimate recursive UDCs (e.g. tree views) while
 * stopping unbounded recursion long before the browser freezes or the JS stack
 * overflows.
 */
export const DEFAULT_MAX_COMPOUND_DEPTH = 256;

export type CompoundDepthInfo = {
  // Ordered list of UDC type names on the current render path, for error
  // messages and cycle extraction. React context scoping means this is always
  // the true ancestor chain — entries are added by descendants and removed
  // automatically when their subtree unmounts.
  stack: string[];
  // Current nesting depth (= stack.length), checked against the budget.
  depth: number;
};

const EMPTY_DEPTH_INFO: CompoundDepthInfo = { stack: [], depth: 0 };

export const CompoundDepthContext = createContext<CompoundDepthInfo>(EMPTY_DEPTH_INFO);

export function useCompoundDepth(): CompoundDepthInfo {
  return useContext(CompoundDepthContext);
}

/**
 * Given the full ancestor chain at the point where the depth limit fires,
 * extract the minimal cycle: the shortest suffix of `chain` that starts at the
 * previous occurrence of the final element.
 *
 * Examples:
 *   [A, B, A, B, A, B, A]  →  [A, B, A]   (period 2, A↔B cycle)
 *   [F, F, F, F]           →  [F, F]      (self-loop)
 *   [A, B, C]              →  [A, B, C]   (no repetition, return as-is)
 */
export function extractMinimalCycle(chain: string[]): string[] {
  if (chain.length === 0) return chain;
  const last = chain[chain.length - 1];
  const prevIdx = chain.lastIndexOf(last, chain.length - 2);
  return prevIdx !== -1 ? chain.slice(prevIdx) : chain;
}

/**
 * Error thrown by `CompoundComponent` when the recursion-depth budget for
 * nested compound components is exceeded. `chain` is the **minimal cycle**
 * extracted from the full ancestor stack — e.g. `["MyButton", "MyText",
 * "MyButton"]` rather than 256 repetitions.
 */
export class CompoundRecursionError extends Error {
  readonly chain: string[];
  constructor(chain: string[]) {
    super(
      `[XMLUI] Compound component recursion detected. ` +
        `Chain: ${chain.join(" → ")}. ` +
        `This usually means a user-defined component references itself or another ` +
        `user-defined component without a terminating condition.`,
    );
    this.name = "CompoundRecursionError";
    this.chain = chain;
  }
}
