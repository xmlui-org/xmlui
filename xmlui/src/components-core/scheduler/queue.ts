export interface ScheduledTask {
  traceId: string;
  spanId: string;
  enqueuedAt: number;
  handler: () => Promise<void>;
  label: string;
}

export interface Scheduler {
  enqueue(task: ScheduledTask): void;
  drain(traceId: string): Promise<void>;
  mode: "fifo" | "concurrent";
}

export function createScheduler(mode: "fifo" | "concurrent"): Scheduler {
  const queues = new Map<string, ScheduledTask[]>();
  return {
    mode,
    enqueue(task) {
      if (mode === "concurrent") {
        void task.handler();
        return;
      }
      const queue = queues.get(task.traceId) ?? [];
      queue.push(task);
      queues.set(task.traceId, queue);
    },
    async drain(traceId) {
      const queue = queues.get(traceId) ?? [];
      while (queue.length > 0) {
        const task = queue.shift()!;
        await task.handler();
      }
      queues.delete(traceId);
    },
  };
}
