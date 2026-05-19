export interface ScheduledTask {
  traceId: string;
  spanId: string;
  enqueuedAt: number;
  handler: () => Promise<void>;
  label: string;
}

export interface Scheduler {
  enqueue(task: ScheduledTask): Promise<void>;
  drain(traceId: string): Promise<void>;
  mode: "fifo" | "concurrent";
}

export interface SchedulerOptions {
  maxQueuedPerTrace?: number;
  strict?: boolean;
  onDiagnostic?: (diagnostic: {
    code: "determinism-handler-reordered" | "determinism-convergence-failed";
    severity: "error" | "warn" | "info";
    message: string;
    traceId?: string;
    data?: unknown;
  }) => void;
}

type QueuedTask = ScheduledTask & {
  resolve: () => void;
  reject: (error: unknown) => void;
};

export function createScheduler(
  mode: "fifo" | "concurrent",
  options: SchedulerOptions = {},
): Scheduler {
  const queues = new Map<string, QueuedTask[]>();
  const drains = new Map<string, Promise<void>>();
  const activeCounts = new Map<string, number>();
  const expectedConcurrentOrder = new Map<string, string[]>();
  const actualConcurrentOrder = new Map<string, string[]>();
  const reorderedConcurrentTraces = new Set<string>();
  const maxQueuedPerTrace = options.maxQueuedPerTrace ?? 64;

  const report = (diagnostic: Parameters<NonNullable<SchedulerOptions["onDiagnostic"]>>[0]) => {
    options.onDiagnostic?.(diagnostic);
  };

  return {
    mode,
    enqueue(task) {
      if (mode === "concurrent") {
        const expected = expectedConcurrentOrder.get(task.traceId) ?? [];
        expected.push(task.spanId);
        expectedConcurrentOrder.set(task.traceId, expected);
        return task.handler().finally(() => {
          const actual = actualConcurrentOrder.get(task.traceId) ?? [];
          actual.push(task.spanId);
          actualConcurrentOrder.set(task.traceId, actual);
          const expectedPrefix = expected.slice(0, actual.length);
          if (!sameOrder(expectedPrefix, actual) && !reorderedConcurrentTraces.has(task.traceId)) {
            reorderedConcurrentTraces.add(task.traceId);
            report({
              code: "determinism-handler-reordered",
              severity: options.strict ? "warn" : "info",
              traceId: task.traceId,
              message: "Concurrent handler completion order differed from enqueue order.",
              data: { expected: expectedPrefix, actual },
            });
          }
        });
      }
      const queue = queues.get(task.traceId) ?? [];
      const promise = new Promise<void>((resolve, reject) => {
        queue.push({ ...task, resolve, reject });
      });
      if (queue.length + (activeCounts.get(task.traceId) ?? 0) > maxQueuedPerTrace) {
        const rejected = queue.pop();
        rejected?.reject(new Error("Deterministic scheduler queue exceeded maxQueuedPerTrace."));
        report({
          code: "determinism-convergence-failed",
          severity: options.strict ? "error" : "warn",
          traceId: task.traceId,
          message: `Scheduler queue exceeded maxQueuedPerTrace (${maxQueuedPerTrace}).`,
          data: { maxQueuedPerTrace, label: task.label },
        });
        return promise;
      }
      queues.set(task.traceId, queue);
      if (!drains.has(task.traceId)) {
        drains.set(
          task.traceId,
          drainQueue(task.traceId, queues, activeCounts).finally(() => {
            drains.delete(task.traceId);
          }),
        );
      }
      return promise;
    },
    async drain(traceId) {
      await (drains.get(traceId) ?? Promise.resolve());
      await drainQueue(traceId, queues, activeCounts);
    },
  };
}

async function drainQueue(
  traceId: string,
  queues: Map<string, QueuedTask[]>,
  activeCounts: Map<string, number>,
): Promise<void> {
  const queue = queues.get(traceId);
  if (!queue) return;
  while (queue.length > 0) {
    const task = queue.shift()!;
    activeCounts.set(traceId, (activeCounts.get(traceId) ?? 0) + 1);
    try {
      await task.handler();
      task.resolve();
    } catch (error) {
      task.reject(error);
    } finally {
      const active = Math.max(0, (activeCounts.get(traceId) ?? 1) - 1);
      if (active === 0) {
        activeCounts.delete(traceId);
      } else {
        activeCounts.set(traceId, active);
      }
    }
  }
  queues.delete(traceId);
}

function sameOrder(expected: readonly string[], actual: readonly string[]): boolean {
  if (expected.length !== actual.length) return false;
  return expected.every((value, index) => value === actual[index]);
}
