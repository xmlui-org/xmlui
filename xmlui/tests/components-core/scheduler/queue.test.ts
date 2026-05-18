import { describe, expect, it } from "vitest";

import { createScheduler } from "../../../src/components-core/scheduler";

describe("createScheduler", () => {
  it("runs concurrent tasks immediately", async () => {
    const calls: string[] = [];
    const scheduler = createScheduler("concurrent");
    scheduler.enqueue({
      traceId: "t",
      spanId: "s",
      enqueuedAt: 1,
      label: "a",
      handler: async () => {
        calls.push("a");
      },
    });
    await scheduler.drain("t");
    expect(calls).toEqual(["a"]);
  });

  it("drains fifo tasks in enqueue order", async () => {
    const calls: string[] = [];
    const scheduler = createScheduler("fifo");
    for (const label of ["a", "b"]) {
      scheduler.enqueue({
        traceId: "t",
        spanId: label,
        enqueuedAt: calls.length,
        label,
        handler: async () => {
          calls.push(label);
        },
      });
    }
    await scheduler.drain("t");
    expect(calls).toEqual(["a", "b"]);
  });
});
