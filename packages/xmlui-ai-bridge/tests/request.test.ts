import { describe, expect, it } from "vitest";
import { parseAgentRequest } from "../src";

describe("parseAgentRequest", () => {
  it("accepts the minimal AgentRequest shape", () => {
    const parsed = parseAgentRequest({
      messages: [{ id: "m1", role: "user", parts: [{ kind: "text", text: "Build a dashboard" }] }],
      selectedModel: "fake",
    });

    expect(parsed).toEqual({
      ok: true,
      request: {
        messages: [{ id: "m1", role: "user", parts: [{ kind: "text", text: "Build a dashboard" }] }],
        selectedModel: "fake",
      },
    });
  });

  it("returns diagnostics for invalid requests", () => {
    const parsed = parseAgentRequest({ messages: [{ id: 1, role: "invalid", parts: "text" }] });

    expect(parsed.ok).toBe(false);
    if (parsed.ok === false) {
      expect(parsed.issues.map((issue) => issue.message)).toEqual([
        "messages[0].id must be a string.",
        "messages[0].role is invalid.",
        "messages[0].parts must be an array.",
      ]);
    }
  });
});
