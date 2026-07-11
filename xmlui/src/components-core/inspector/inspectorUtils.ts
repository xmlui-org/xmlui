export type XsLogEntry = Record<string, unknown>;

export function pushXsLog(entry: XsLogEntry): void {
  if (typeof window === "undefined") {
    return;
  }
  const target = window as typeof window & { _xsLogs?: XsLogEntry[] };
  target._xsLogs ??= [];
  target._xsLogs.push(entry);
}

export function createLogEntry(
  kind: string,
  extras: Partial<XsLogEntry> = {},
): XsLogEntry {
  const target = typeof window === "undefined"
    ? undefined
    : window as typeof window & { _xsCurrentTrace?: string };
  return {
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: target?._xsCurrentTrace,
    kind,
    ...extras,
  };
}

export function getCurrentTrace(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as typeof window & { _xsCurrentTrace?: string })._xsCurrentTrace;
}
