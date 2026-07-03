export type XsLogEntry = Record<string, unknown>;

export function pushXsLog(entry: XsLogEntry): void {
  if (typeof window === "undefined") {
    return;
  }
  const target = window as typeof window & { _xsLogs?: XsLogEntry[] };
  target._xsLogs ??= [];
  target._xsLogs.push(entry);
}
