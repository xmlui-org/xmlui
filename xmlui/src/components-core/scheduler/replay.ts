import type { XsLogEntry } from "../inspector/inspectorUtils";

export interface ReplayInput {
  traces: ReadonlyArray<XsLogEntry>;
  actualTraces?: ReadonlyArray<XsLogEntry>;
  snapshot?: unknown;
}

export interface ReplayResult {
  diverged: boolean;
  divergenceAt?: number;
  expected?: XsLogEntry;
  actual?: XsLogEntry;
}

export async function replay(_input: ReplayInput): Promise<ReplayResult> {
  const actual = _input.actualTraces ?? _input.traces;
  const length = Math.max(_input.traces.length, actual.length);
  for (let index = 0; index < length; index++) {
    const expectedEntry = _input.traces[index];
    const actualEntry = actual[index];
    if (!sameReplayEntry(expectedEntry, actualEntry)) {
      return {
        diverged: true,
        divergenceAt: index,
        expected: expectedEntry,
        actual: actualEntry,
      };
    }
  }
  return { diverged: false };
}

function sameReplayEntry(expected: XsLogEntry | undefined, actual: XsLogEntry | undefined): boolean {
  if (!expected || !actual) return expected === actual;
  return stableReplayString(expected) === stableReplayString(actual);
}

function stableReplayString(entry: XsLogEntry): string {
  return JSON.stringify(stripVolatileFields(entry));
}

function stripVolatileFields(value: any): any {
  if (Array.isArray(value)) {
    return value.map(stripVolatileFields);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  return Object.keys(value)
    .filter((key) => key !== "ts" && key !== "startPerfTs" && key !== "duration")
    .sort()
    .reduce((acc, key) => {
      acc[key] = stripVolatileFields(value[key]);
      return acc;
    }, {} as Record<string, unknown>);
}
