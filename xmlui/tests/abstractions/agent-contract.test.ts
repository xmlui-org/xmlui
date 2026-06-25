import { describe, expect, it } from "vitest";
import {
  AGENT_EVENT_FAMILIES,
  parseXmluiAgentResponseEnvelope,
  validateGeneratedXmluiSource,
} from "../../src";

describe("agent contract", () => {
  it("exposes the canonical event families", () => {
    expect(AGENT_EVENT_FAMILIES).toEqual([
      "run",
      "message",
      "tool",
      "approval",
      "generation",
      "error",
    ]);
  });

  it("parses a code response envelope", () => {
    const result = parseXmluiAgentResponseEnvelope(
      JSON.stringify({
        kind: "code",
        operation: "create",
        summary: "Created a starter layout.",
        code: "<Stack><Text value=\"Hello\" /></Stack>",
        metadata: {
          title: "Starter",
          componentsUsed: ["Stack", "Text"],
          dataSourcesUsed: [],
          assumptions: ["Host provides the app shell."],
        },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.envelope).toEqual({
      kind: "code",
      operation: "create",
      summary: "Created a starter layout.",
      code: "<Stack><Text value=\"Hello\" /></Stack>",
      metadata: {
        title: "Starter",
        componentsUsed: ["Stack", "Text"],
        dataSourcesUsed: [],
        assumptions: ["Host provides the app shell."],
      },
    });
  });

  it("parses an error response envelope", () => {
    const result = parseXmluiAgentResponseEnvelope({
      kind: "error",
      message: "Generated markup failed XMLUI validation.",
      code: "xmlui-validation-failed",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.envelope).toEqual({
      kind: "error",
      message: "Generated markup failed XMLUI validation.",
      code: "xmlui-validation-failed",
    });
  });

  it("rejects malformed clarification envelopes", () => {
    const result = parseXmluiAgentResponseEnvelope({
      kind: "clarification",
      question: 42,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues[0]).toMatchObject({
      code: "xmlui-envelope-field",
      severity: "error",
    });
  });

  it("validates generated XMLUI source", () => {
    const result = validateGeneratedXmluiSource('<Stack><Text value="Hello" /></Stack>');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.component.type).toBe("Stack");
    expect(result.warnings).toEqual([]);
  });

  it("reports invalid XMLUI source", () => {
    const result = validateGeneratedXmluiSource("<Stack><Text></Stack>");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues.length).toBeGreaterThan(0);
  });
});
