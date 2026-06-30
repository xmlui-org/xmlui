import type {
  AgentRequest,
  AiMessage,
  AiRun,
  XmluiAgentResponseEnvelope,
  XmluiValidationIssue,
} from "./contract";
import type { AgentEventSink } from "./eventStream";
import { FakeModelAdapter, type ModelAdapter } from "./modelAdapter";

export type RunAgentOptions = {
  model?: ModelAdapter;
  now?: () => string;
  createId?: (prefix: string) => string;
};

export async function runAgentRequest(
  request: AgentRequest,
  sink: AgentEventSink,
  options: RunAgentOptions = {},
): Promise<void> {
  const model = options.model ?? new FakeModelAdapter();
  const createId = options.createId ?? createRuntimeId;
  const now = options.now ?? (() => new Date().toISOString());
  const run: AiRun = {
    id: createId("run"),
    status: "running",
    provider: request.selectedProvider ?? "fake",
    model: request.selectedModel ?? "fake",
  };

  try {
    sink.emit({ type: "run.updated", run });
    sink.emit({
      type: "generation.updated",
      generation: { status: "generating", updatedAt: now() },
    });

    const envelope = await model.generate(request, { attempt: 0 });
    const parsed = parseXmluiAgentResponseEnvelope(envelope);
    if (parsed.ok === false) {
      emitFailure(sink, run, createId, "Model response was not a valid XMLUI agent envelope.", parsed.issues);
      return;
    }

    const handled = handleEnvelope(parsed.envelope, sink, run, createId, now);
    if (!handled) {
      return;
    }

    sink.emit({ type: "run.updated", run: { ...run, status: "completed" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent request failed.";
    sink.emit({ type: "error", message, code: "agent-runtime-error" });
    sink.emit({ type: "run.updated", run: { ...run, status: "failed", error: message } });
  } finally {
    sink.close();
  }
}

function handleEnvelope(
  envelope: XmluiAgentResponseEnvelope,
  sink: AgentEventSink,
  run: AiRun,
  createId: (prefix: string) => string,
  now: () => string,
): boolean {
  if (envelope.kind === "error") {
    sink.emit({ type: "error", message: envelope.message, code: envelope.code });
    sink.emit({ type: "run.updated", run: { ...run, status: "failed", error: envelope.message } });
    return false;
  }

  if (envelope.kind === "clarification") {
    const message: AiMessage = {
      id: createId("message"),
      role: "assistant",
      status: "complete",
      parts: [
        {
          kind: "clarification",
          question: envelope.question,
          ...(envelope.choices ? { choices: envelope.choices } : {}),
          ...(envelope.reason ? { reason: envelope.reason } : {}),
        },
      ],
    };
    sink.emit({
      type: "generation.updated",
      generation: { status: "clarification", summary: envelope.reason ?? envelope.question, updatedAt: now() },
    });
    sink.emit({ type: "message.updated", message });
    return true;
  }

  const message: AiMessage = {
    id: createId("message"),
    role: "assistant",
    status: "complete",
    parts: [{ kind: "text", text: envelope.summary }],
  };
  sink.emit({
    type: "generation.updated",
    generation: {
      status: "accepted",
      code: envelope.code,
      summary: envelope.summary,
      updatedAt: now(),
    },
  });
  sink.emit({ type: "message.updated", message });
  return true;
}

function emitFailure(
  sink: AgentEventSink,
  run: AiRun,
  createId: (prefix: string) => string,
  message: string,
  diagnostics: XmluiValidationIssue[],
): void {
  sink.emit({
    type: "generation.updated",
    generation: { status: "failed", diagnostics },
  });
  sink.emit({
    type: "message.updated",
    message: {
      id: createId("message"),
      role: "assistant",
      status: "error",
      parts: [{ kind: "error", message }],
    },
  });
  sink.emit({ type: "run.updated", run: { ...run, status: "failed", error: message } });
}

function parseXmluiAgentResponseEnvelope(
  input: unknown,
): { ok: true; envelope: XmluiAgentResponseEnvelope } | { ok: false; issues: XmluiValidationIssue[] } {
  if (!isRecord(input)) {
    return invalidEnvelope("xmlui-envelope-type", "Expected a JSON object.");
  }

  if (input.kind === "code") {
    const issues: XmluiValidationIssue[] = [];
    const operation = readString(input.operation, "operation", issues);
    const summary = readString(input.summary, "summary", issues);
    const code = readString(input.code, "code", issues);

    if (operation !== undefined && operation !== "create" && operation !== "modify") {
      issues.push(makeIssue("xmlui-envelope-operation", 'operation must be either "create" or "modify".'));
    }

    if (issues.length > 0 || operation === undefined || summary === undefined || code === undefined) {
      return { ok: false, issues };
    }

    const normalizedOperation = normalizeOperation(operation);

    return {
      ok: true,
      envelope: { kind: "code", operation: normalizedOperation, summary, code },
    };
  }

  if (input.kind === "clarification") {
    const issues: XmluiValidationIssue[] = [];
    const question = readString(input.question, "question", issues);
    const reason = readOptionalString(input.reason, "reason", issues);
    const choices = readOptionalStringArray(input.choices, "choices", issues);

    if (issues.length > 0 || question === undefined) {
      return { ok: false, issues };
    }

    return {
      ok: true,
      envelope: {
        kind: "clarification",
        question,
        ...(choices ? { choices } : {}),
        ...(reason !== undefined ? { reason } : {}),
      },
    };
  }

  if (input.kind === "error") {
    const issues: XmluiValidationIssue[] = [];
    const message = readString(input.message, "message", issues);
    const code = readOptionalString(input.code, "code", issues);

    if (issues.length > 0 || message === undefined) {
      return { ok: false, issues };
    }

    return {
      ok: true,
      envelope: { kind: "error", message, ...(code !== undefined ? { code } : {}) },
    };
  }

  return invalidEnvelope("xmlui-envelope-kind", 'Envelope must declare kind "code", "clarification", or "error".');
}

function readString(value: unknown, path: string, issues: XmluiValidationIssue[]): string | undefined {
  if (typeof value !== "string") {
    issues.push(makeIssue("xmlui-envelope-field", `${path} must be a string.`));
    return undefined;
  }
  return value;
}

function readOptionalString(value: unknown, path: string, issues: XmluiValidationIssue[]): string | undefined {
  if (value === undefined) return undefined;
  return readString(value, path, issues);
}

function readOptionalStringArray(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    issues.push(makeIssue("xmlui-envelope-field", `${path} must be an array of strings.`));
    return undefined;
  }

  const values = value.filter((entry, index): entry is string => {
    if (typeof entry === "string") return true;
    issues.push(makeIssue("xmlui-envelope-field", `${path}[${index}] must be a string.`));
    return false;
  });
  return values;
}

function normalizeOperation(value: string): "create" | "modify" {
  return value === "modify" ? "modify" : "create";
}

function invalidEnvelope(
  code: string,
  message: string,
): { ok: false; issues: XmluiValidationIssue[] } {
  return { ok: false, issues: [makeIssue(code, message)] };
}

function makeIssue(code: string, message: string): XmluiValidationIssue {
  return { code, message, severity: "error" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

let idCounter = 1;

function createRuntimeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${idCounter++}`;
}
