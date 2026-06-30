import { describe, expect, it } from "vitest";
import { collectAgentEvents, createAgentHandler, createLocalServer, FakeModelAdapter } from "../src";

const requestBody = {
  messages: [{ id: "m1", role: "user", parts: [{ kind: "text", text: "Create a hello app" }] }],
};

describe("local agent handler", () => {
  it("streams normalized AgentEvent objects from the fake model", async () => {
    const handler = createAgentHandler({
      createId: (prefix) => `${prefix}-1`,
      now: () => "2026-06-29T00:00:00.000Z",
      model: new FakeModelAdapter([
        {
          kind: "code",
          operation: "create",
          summary: "Created app",
          code: "<App><Text>Hello</Text></App>",
        },
      ]),
    });

    const response = await handler(
      new Request("http://localhost/agent", {
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/x-ndjson");
    expect(await collectAgentEvents(response.body!)).toEqual([
      {
        type: "run.updated",
        run: { id: "run-1", status: "running", provider: "fake", model: "fake" },
      },
      {
        type: "generation.updated",
        generation: { status: "generating", updatedAt: "2026-06-29T00:00:00.000Z" },
      },
      {
        type: "generation.updated",
        generation: {
          status: "accepted",
          code: "<App><Text>Hello</Text></App>",
          summary: "Created app",
          updatedAt: "2026-06-29T00:00:00.000Z",
        },
      },
      {
        type: "message.updated",
        message: {
          id: "message-1",
          role: "assistant",
          status: "complete",
          parts: [{ kind: "text", text: "Created app" }],
        },
      },
      {
        type: "run.updated",
        run: { id: "run-1", status: "completed", provider: "fake", model: "fake" },
      },
    ]);
  });

  it("can be served through the local HTTP server", async () => {
    const server = await createLocalServer({
      createId: (prefix) => `${prefix}-2`,
      now: () => "2026-06-29T00:00:00.000Z",
    });

    try {
      const response = await fetch(server.url, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200);
      const events = await collectAgentEvents(response.body!);
      expect(events.map((event) => event.type)).toEqual([
        "run.updated",
        "generation.updated",
        "generation.updated",
        "message.updated",
        "run.updated",
      ]);
    } finally {
      await server.close();
    }
  });
});
