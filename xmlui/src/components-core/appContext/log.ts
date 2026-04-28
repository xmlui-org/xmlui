import { pushXsLog } from "../inspector/inspectorUtils";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogNamespace = {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

/**
 * Creates the `Log` global namespace available to XMLUI expressions.
 *
 * - Each level maps to a `"log:<level>"` trace entry pushed via `pushXsLog`.
 * - When `silentConsole` is `false` (the default), each call also mirrors to
 *   the native `console.*` method so existing DevTools workflows keep working.
 * - When `silentConsole` is `true`, only the trace entry is emitted — nothing
 *   reaches the browser console. This is useful in production deployments
 *   where trace data is exported to a server sink.
 *
 * The native `console` global is on the Phase 1.9 ban list. `Log.*` is the
 * sanctioned replacement.
 */
export function createLog(silentConsole: boolean): LogNamespace {
  function emit(level: LogLevel, args: unknown[]): void {
    pushXsLog({
      kind: `log:${level}`,
      ts: Date.now(),
      args,
    });
    if (!silentConsole) {
      // eslint-disable-next-line no-console
      (console as any)[level](...args);
    }
  }

  return {
    debug(...args) { emit("debug", args); },
    info(...args)  { emit("info",  args); },
    warn(...args)  { emit("warn",  args); },
    error(...args) { emit("error", args); },
  };
}
