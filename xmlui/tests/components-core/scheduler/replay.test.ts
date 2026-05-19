import { describe, expect, it } from "vitest";

import { replay } from "../../../src/components-core/scheduler";

describe("replay", () => {
  it("accepts identical traces while ignoring volatile timing fields", async () => {
    await expect(
      replay({
        traces: [{ kind: "handler:start", ts: 1, traceId: "t", eventName: "click" } as any],
        actualTraces: [{ kind: "handler:start", ts: 2, traceId: "t", eventName: "click" } as any],
      }),
    ).resolves.toEqual({ diverged: false });
  });

  it("reports the first divergence", async () => {
    await expect(
      replay({
        traces: [{ kind: "handler:start", ts: 1, traceId: "t", eventName: "click" } as any],
        actualTraces: [{ kind: "handler:error", ts: 1, traceId: "t", eventName: "click" } as any],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        diverged: true,
        divergenceAt: 0,
      }),
    );
  });
});
