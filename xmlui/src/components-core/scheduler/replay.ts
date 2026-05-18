import type { XsLogEntry } from "../inspector/inspectorUtils";

export interface ReplayInput {
  traces: ReadonlyArray<XsLogEntry>;
  snapshot?: unknown;
}

export interface ReplayResult {
  diverged: boolean;
  divergenceAt?: number;
  expected?: XsLogEntry;
  actual?: XsLogEntry;
}

export async function replay(_input: ReplayInput): Promise<ReplayResult> {
  return { diverged: false };
}
