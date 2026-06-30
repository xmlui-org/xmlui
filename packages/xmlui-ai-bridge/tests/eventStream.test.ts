import { describe, expect, it } from "vitest";
import type { AgentEvent } from "../src";
import {
  collectAgentEvents,
  createAgentEventStream,
  deserializeAgentEvent,
  serializeAgentEvent,
} from "../src";

describe("AgentEvent stream serialization", () => {
  it("serializes one normalized event per line", () => {
    const event: AgentEvent = {
      type: "generation.updated",
      generation: {
        status: "accepted",
        code: "<App />",
        summary: "Done",
      },
    };

    const serialized = serializeAgentEvent(event);

    expect(serialized).toBe(`${JSON.stringify(event)}\n`);
    expect(deserializeAgentEvent(serialized)).toEqual(event);
  });

  it("collects events from the local readable stream in emission order", async () => {
    const stream = createAgentEventStream();
    const collected = collectAgentEvents(stream.readable);

    stream.emit({ type: "run.updated", run: { id: "run-1", status: "running" } });
    stream.emit({ type: "message.delta", messageId: "message-1", text: "hello" });
    stream.close();

    expect(await collected).toEqual([
      { type: "run.updated", run: { id: "run-1", status: "running" } },
      { type: "message.delta", messageId: "message-1", text: "hello" },
    ]);
  });
});
