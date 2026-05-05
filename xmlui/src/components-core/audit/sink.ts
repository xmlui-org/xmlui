/**
 * Audit sinks (Phase 4).
 *
 * An `AuditSink` receives redacted, sampled log entries and forwards them
 * to an external system.  Two implementations are provided:
 *
 * - **OTLP sink** — batches entries into 1-second windows and POSTs them as
 *   OTLP/JSON `LogsData` to a configurable `endpoint`.  Retries with
 *   exponential back-off (1 s → 30 s cap).  Flushes via `navigator.sendBeacon`
 *   on `beforeunload`.
 *
 * - **Console sink** — writes each entry as a structured `console.log` with
 *   collapsible groups per trace.  Auto-enabled in dev mode when no `<sink>`
 *   is declared.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { SinkConfig } from "./policy";

// ---------------------------------------------------------------------------
// AuditSink interface
// ---------------------------------------------------------------------------

export interface AuditSink {
  /** Accept a single entry. Must not throw. */
  push(entry: XsLogEntry): void;
  /** Flush any buffered entries. Resolves when the flush completes. */
  flush(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Severity mapping (OTLP numeric severity numbers)
// ---------------------------------------------------------------------------

const SEVERITY_NUMBER: Record<string, number> = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21,
};

function toOtlpSeverity(severity?: string): number {
  return SEVERITY_NUMBER[severity ?? "info"] ?? 9;
}

// ---------------------------------------------------------------------------
// OTLP sink
// ---------------------------------------------------------------------------

/**
 * Create an OTLP/HTTP sink that batches entries and sends them as
 * OTLP Logs JSON to `cfg.endpoint`.
 */
export function createOtlpSink(cfg: SinkConfig): AuditSink {
  const endpoint = cfg.endpoint ?? "";
  const extraHeaders: Record<string, string> = cfg.headers ?? {};

  let batch: XsLogEntry[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let backoffMs = 1000;
  const MAX_BACKOFF_MS = 30_000;

  function scheduleFlush() {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      void sendBatch();
    }, 1000);
  }

  async function sendBatch(): Promise<void> {
    if (batch.length === 0) return;
    const toSend = batch.splice(0, batch.length);
    const body = buildOtlpPayload(toSend);
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify(body),
        keepalive: true,
      });
      if (!resp.ok) {
        throw new Error(`OTLP sink: HTTP ${resp.status}`);
      }
      backoffMs = 1000; // reset on success
    } catch (err) {
      // Re-queue entries for retry and schedule with back-off
      batch.unshift(...toSend);
      const delay = backoffMs;
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
      timer = setTimeout(() => {
        timer = null;
        void sendBatch();
      }, delay);
      // Emit to console so the developer knows
      console.warn("[xmlui audit] OTLP sink send failed:", err);
    }
  }

  // Flush via sendBeacon on page unload so we don't lose in-flight entries
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      if (batch.length === 0) return;
      const body = buildOtlpPayload(batch);
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      navigator.sendBeacon?.(endpoint, blob);
    });
  }

  return {
    push(entry: XsLogEntry) {
      batch.push(entry);
      scheduleFlush();
    },
    async flush(): Promise<void> {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      await sendBatch();
    },
  };
}

/**
 * Build an OTLP/JSON `LogsData` payload from a batch of log entries.
 */
function buildOtlpPayload(entries: XsLogEntry[]): object {
  const logRecords = entries.map((e) => ({
    timeUnixNano: String(e.ts * 1_000_000),
    severityNumber: toOtlpSeverity(e.severity),
    severityText: (e.severity ?? "INFO").toUpperCase(),
    body: { stringValue: e.text ?? e.message ?? e.kind ?? "" },
    traceId: e.traceId ?? "",
    spanId: e.spanId ?? "",
    attributes: [
      { key: "xmlui.kind", value: { stringValue: e.kind ?? "" } },
      ...(e.code ? [{ key: "xmlui.code", value: { stringValue: String(e.code) } }] : []),
      ...(e.componentType
        ? [{ key: "xmlui.componentType", value: { stringValue: e.componentType } }]
        : []),
    ],
  }));

  return {
    resourceLogs: [
      {
        resource: {
          attributes: [{ key: "service.name", value: { stringValue: "xmlui" } }],
        },
        scopeLogs: [
          {
            scope: { name: "xmlui.audit" },
            logRecords,
          },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Console sink
// ---------------------------------------------------------------------------

/**
 * Create a console sink that writes each entry as a structured log line.
 *
 * Groups consecutive entries sharing the same `traceId` into a collapsible
 * `console.groupCollapsed` block.
 *
 * Auto-enabled in dev mode (NODE_ENV !== "production") when no `<sink>` is
 * declared — call `createConsoleSink()` and push entries into it.
 */
export function createConsoleSink(): AuditSink {
  let currentGroup: string | null = null;

  function closeGroup() {
    if (currentGroup !== null) {
      console.groupEnd();
      currentGroup = null;
    }
  }

  return {
    push(entry: XsLogEntry) {
      const traceId = entry.traceId;

      if (traceId && traceId !== currentGroup) {
        closeGroup();
        console.groupCollapsed(`[xmlui audit] trace: ${traceId}`);
        currentGroup = traceId;
      } else if (!traceId && currentGroup !== null) {
        closeGroup();
      }

      const label = `[${entry.kind ?? "log"}]${entry.code ? ` ${entry.code}` : ""}`;
      const logFn =
        entry.severity === "error"
          ? console.error
          : entry.severity === "warn"
            ? console.warn
            : console.log;
      logFn(label, entry);
    },
    flush(): Promise<void> {
      closeGroup();
      return Promise.resolve();
    },
  };
}

