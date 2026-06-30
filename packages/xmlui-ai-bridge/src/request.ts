import type { AgentRequest, XmluiValidationIssue } from "./contract";

export type AgentRequestParseResult =
  | { ok: true; request: AgentRequest }
  | { ok: false; issues: XmluiValidationIssue[] };

export function parseAgentRequest(input: unknown): AgentRequestParseResult {
  if (!isRecord(input)) {
    return invalid("agent-request-type", "AgentRequest must be a JSON object.");
  }

  const issues: XmluiValidationIssue[] = [];
  const messages = readMessages(input.messages, issues);
  const threadId = readOptionalString(input.threadId, "threadId", issues);
  const sessionId = readOptionalString(input.sessionId, "sessionId", issues);
  const currentCode = readOptionalString(input.currentCode, "currentCode", issues);
  const selectedProvider = readOptionalString(input.selectedProvider, "selectedProvider", issues);
  const selectedModel = readOptionalString(input.selectedModel, "selectedModel", issues);
  const requestDirectives = readOptionalRecord(input.requestDirectives, "requestDirectives", issues);
  const context = readOptionalRecord(input.context, "context", issues);

  if (issues.length > 0 || !messages) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    request: {
      messages,
      ...(threadId !== undefined ? { threadId } : {}),
      ...(sessionId !== undefined ? { sessionId } : {}),
      ...(currentCode !== undefined ? { currentCode } : {}),
      ...(selectedProvider !== undefined ? { selectedProvider } : {}),
      ...(selectedModel !== undefined ? { selectedModel } : {}),
      ...(requestDirectives !== undefined ? { requestDirectives } : {}),
      ...(context !== undefined ? { context } : {}),
    } as AgentRequest,
  };
}

export async function readJsonRequestBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) {
    throw new Error("Request body is empty.");
  }
  return JSON.parse(text);
}

function readMessages(value: unknown, issues: XmluiValidationIssue[]): AgentRequest["messages"] | undefined {
  if (!Array.isArray(value)) {
    issues.push(makeIssue("agent-request-messages", "messages must be an array."));
    return undefined;
  }

  const messages: AgentRequest["messages"] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(makeIssue("agent-request-message", `messages[${index}] must be an object.`));
      return;
    }
    if (typeof entry.id !== "string") {
      issues.push(makeIssue("agent-request-message", `messages[${index}].id must be a string.`));
    }
    if (!["system", "user", "assistant", "tool"].includes(String(entry.role))) {
      issues.push(makeIssue("agent-request-message", `messages[${index}].role is invalid.`));
    }
    if (!Array.isArray(entry.parts)) {
      issues.push(makeIssue("agent-request-message", `messages[${index}].parts must be an array.`));
    }
    messages.push(entry as AgentRequest["messages"][number]);
  });

  return messages;
}

function readOptionalString(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    issues.push(makeIssue("agent-request-field", `${path} must be a string.`));
    return undefined;
  }
  return value;
}

function readOptionalRecord(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(makeIssue("agent-request-field", `${path} must be an object.`));
    return undefined;
  }
  return value;
}

function invalid(code: string, message: string): AgentRequestParseResult {
  return { ok: false, issues: [makeIssue(code, message)] };
}

function makeIssue(code: string, message: string): XmluiValidationIssue {
  return { code, message, severity: "error" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
