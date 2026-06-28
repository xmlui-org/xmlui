import type {
  AiApprovalRequest,
  AiMessage,
  AiMessagePart,
  AiRun,
  AiRunStatus,
  XmluiGenerationState,
  XmluiValidationIssue,
} from "../contract";
import type { A2XmluiAgentResponse, A2XmluiRequestBody, A2XmluiRequestDirectives } from "./a2xmluiContract";

export type AiThreadStatus = "idle" | "running" | "clarification" | "complete" | "error" | "cancelled";

export type AiThreadGenerationState = XmluiGenerationState & {
  lastWorkingCode?: string;
  operation?: "create" | "modify";
};

export type AiThreadValue = {
  messages: AiMessage[];
  isRunning: boolean;
  status: AiThreadStatus;
  statusLabel: string;
  error?: string | null;
  generation: AiThreadGenerationState;
  pendingPrompt?: string | null;
  queuedPrompt?: string | null;
  replacementPending: boolean;
  selectedAgent?: string;
  selectedModel?: string;
  activeRun?: AiRun;
  pendingApprovals?: AiApprovalRequest[];
  toolCalls?: unknown[];
  code?: string;
  lastSuccessfulCode?: string;
  codeStatus?: string;
  generatedError?: string | null;
};

export type AiThreadState = {
  messages: AiMessage[];
  isRunning: boolean;
  status: AiThreadStatus;
  error: string | null;
  generation: AiThreadGenerationState;
  pendingPrompt: string | null;
  queuedPrompt: string | null;
  replacementPending: boolean;
  selectedAgent?: string;
  selectedModel?: string;
  activeRun?: AiRun;
  pendingApprovals: AiApprovalRequest[];
  toolCalls: unknown[];
};

export type SubmitPayload = {
  text: string;
  files?: unknown[];
};

export type A2XmluiThreadStateInputs = {
  initialMessages?: AiMessage[];
  currentCode?: string;
  selectedAgent?: string;
  selectedModel?: string;
  runtimeContext?: Record<string, unknown>;
  requestDirectives?: A2XmluiRequestDirectives;
};

export function createA2XmluiThreadState(inputs: A2XmluiThreadStateInputs = {}): AiThreadState {
  const currentCode = inputs.currentCode?.trim() ? inputs.currentCode : undefined;
  const messages = cloneMessages(inputs.initialMessages ?? []);

  return {
    messages,
    isRunning: false,
    status: "idle",
    error: null,
    generation: {
      status: "idle",
      code: currentCode,
      lastWorkingCode: currentCode,
      summary: undefined,
      diagnostics: undefined,
      updatedAt: currentTimestamp(),
    },
    pendingPrompt: null,
    queuedPrompt: null,
    replacementPending: false,
    selectedAgent: inputs.selectedAgent,
    selectedModel: inputs.selectedModel,
    activeRun: undefined,
    pendingApprovals: [],
    toolCalls: [],
  };
}

export function projectA2XmluiThreadValue(state: AiThreadState): AiThreadValue {
  const statusLabel = resolveStatusLabel(state);
  const generationError = state.generation.diagnostics?.length
    ? state.generation.diagnostics.map((issue) => issue.message).join("\n")
    : null;

  return {
    messages: state.messages,
    isRunning: state.isRunning,
    status: state.status,
    statusLabel,
    error: state.error,
    generation: state.generation,
    pendingPrompt: state.pendingPrompt,
    queuedPrompt: state.queuedPrompt,
    replacementPending: state.replacementPending,
    selectedAgent: state.selectedAgent,
    selectedModel: state.selectedModel,
    activeRun: state.activeRun,
    pendingApprovals: state.pendingApprovals,
    toolCalls: state.toolCalls,
    code: state.generation.code,
    lastSuccessfulCode: state.generation.lastWorkingCode,
    codeStatus: statusLabel,
    generatedError: state.error ?? generationError,
  };
}

export function buildA2XmluiRequestBody(
  messages: AiMessage[],
  options: {
    currentCode?: string;
    runtimeContext?: Record<string, unknown>;
    requestDirectives?: A2XmluiRequestDirectives;
    selectedAgent?: string;
    selectedModel?: string;
  },
): A2XmluiRequestBody {
  return {
    messages,
    ...(options.currentCode !== undefined ? { currentCode: options.currentCode } : {}),
    ...(options.runtimeContext ? { runtimeContext: options.runtimeContext } : {}),
    ...(options.requestDirectives ? { requestDirectives: options.requestDirectives } : {}),
    ...(options.selectedAgent ? { selectedAgent: options.selectedAgent } : {}),
    ...(options.selectedModel ? { selectedModel: options.selectedModel } : {}),
  };
}

export function applyA2XmluiEnvelope(
  state: AiThreadState,
  envelope: A2XmluiAgentResponse,
): AiThreadState {
  const now = currentTimestamp();

  if (envelope.kind === "clarification") {
    const assistantMessage = buildClarificationMessage(envelope);
    return {
      ...state,
      messages: [...state.messages, assistantMessage],
      isRunning: false,
      status: "clarification",
      error: null,
      generation: {
        ...state.generation,
        status: "clarification",
        summary: envelope.reason ?? envelope.question,
        updatedAt: now,
      },
      pendingPrompt: null,
      replacementPending: false,
      activeRun: updateRun(state.activeRun, "completed"),
    };
  }

  const code = envelope.code.trim();
  const assistantMessage = buildCodeMessage(envelope);
  return {
    ...state,
    messages: [...state.messages, assistantMessage],
    isRunning: false,
    status: "complete",
    error: null,
    generation: {
      ...state.generation,
      status: "accepted",
      code,
      summary: envelope.summary,
      lastWorkingCode: code,
      operation: envelope.operation,
      diagnostics: undefined,
      updatedAt: now,
    },
    pendingPrompt: null,
    replacementPending: false,
    activeRun: updateRun(state.activeRun, "completed"),
  };
}

export function applyA2XmluiFailure(
  state: AiThreadState,
  message: string,
  diagnostics?: XmluiValidationIssue[],
): AiThreadState {
  const now = currentTimestamp();
  const assistantMessage: AiMessage = {
    id: createMessageId("error"),
    role: "assistant",
    status: "error",
    parts: [{ kind: "error", message }],
  };

  return {
    ...state,
    messages: [...state.messages, assistantMessage],
    isRunning: false,
    status: "error",
    error: message,
    generation: {
      ...state.generation,
      status: "failed",
      diagnostics,
      updatedAt: now,
    },
    pendingPrompt: null,
    replacementPending: false,
    activeRun: updateRun(state.activeRun, "failed", message),
  };
}

export function enqueueUserMessage(
  state: AiThreadState,
  submission: SubmitPayload,
): { state: AiThreadState; message: AiMessage } {
  const message = buildUserMessage(submission);
  return {
    state: {
      ...state,
      messages: [...state.messages, message],
      generation: {
        ...state.generation,
        status: "generating",
        updatedAt: currentTimestamp(),
      },
    },
    message,
  };
}

export function buildSubmissionPayload(input: string | { text?: string; files?: unknown[] }): SubmitPayload | null {
  if (typeof input === "string") {
    const text = input.trim();
    return text ? { text } : null;
  }

  const text = (input.text ?? "").trim();
  const files = Array.isArray(input.files) ? input.files.filter((file) => file !== undefined) : [];
  if (!text && files.length === 0) return null;

  return {
    text: text || summarizeFiles(files),
    ...(files.length > 0 ? { files } : {}),
  };
}

export function deriveRequestDirectives(
  state: AiThreadState,
  props: {
    currentCode?: string;
    requestDirectives?: A2XmluiRequestDirectives;
    forceFullReplacement?: boolean;
  },
): A2XmluiRequestDirectives {
  if (props.forceFullReplacement !== undefined) {
    return { allowFullReplacement: props.forceFullReplacement };
  }

  if (props.requestDirectives?.allowFullReplacement !== undefined) {
    return { allowFullReplacement: props.requestDirectives.allowFullReplacement };
  }

  if (state.replacementPending) {
    return { allowFullReplacement: false };
  }

  return { allowFullReplacement: !props.currentCode };
}

export function shouldRequireReplacementConfirmation(
  currentCode: string | undefined,
  requestDirectives?: A2XmluiRequestDirectives,
): boolean {
  if (!currentCode) return false;
  if (requestDirectives?.allowFullReplacement !== undefined) return false;
  return true;
}

export function resolveStatusLabel(state: Pick<AiThreadState, "status" | "replacementPending">): string {
  if (state.replacementPending) return "Awaiting confirmation";
  switch (state.status) {
    case "idle":
      return "Idle";
    case "running":
      return "Running";
    case "clarification":
      return "Clarification needed";
    case "complete":
      return "Complete";
    case "error":
      return "Error";
    case "cancelled":
      return "Cancelled";
  }
}

export function buildCodeMessage(envelope: Extract<A2XmluiAgentResponse, { kind: "code" }>): AiMessage {
  const parts: AiMessagePart[] = [{ kind: "text", text: envelope.summary }];
  if (envelope.metadata?.title) {
    parts.push({ kind: "text", text: `Title: ${envelope.metadata.title}` });
  }
  if (envelope.metadata?.changedFiles?.length) {
    parts.push({ kind: "text", text: `Changed files: ${envelope.metadata.changedFiles.join(", ")}` });
  }
  if (envelope.metadata?.notes?.length) {
    parts.push({ kind: "text", text: envelope.metadata.notes.join("\n") });
  }

  return {
    id: createMessageId("assistant-code"),
    role: "assistant",
    parts,
    status: "complete",
  };
}

export function buildClarificationMessage(
  envelope: Extract<A2XmluiAgentResponse, { kind: "clarification" }>,
): AiMessage {
  return {
    id: createMessageId("assistant-clarification"),
    role: "assistant",
    parts: [
      {
        kind: "clarification",
        question: envelope.question,
        ...(envelope.choices ? { choices: envelope.choices } : {}),
        ...(envelope.reason ? { reason: envelope.reason } : {}),
      },
    ],
    status: "complete",
  };
}

function buildUserMessage(submission: SubmitPayload): AiMessage {
  const parts: AiMessagePart[] = [{ kind: "text", text: submission.text }];
  if (submission.files?.length) {
    parts.push({ kind: "text", text: summarizeFiles(submission.files) });
  }

  return {
    id: createMessageId("user"),
    role: "user",
    parts,
    status: "complete",
  };
}

function summarizeFiles(files: unknown[]): string {
  if (files.length === 0) return "";
  const names = files.map((file) => {
    if (typeof File !== "undefined" && file instanceof File) return file.name;
    if (typeof file === "object" && file !== null && "name" in file && typeof (file as any).name === "string") {
      return (file as any).name;
    }
    return "attachment";
  });
  return `Attachments: ${names.join(", ")}`;
}

function updateRun(run: AiRun | undefined, status: AiRunStatus, error?: string): AiRun | undefined {
  if (!run) return undefined;
  return {
    ...run,
    status,
    ...(error ? { error } : {}),
  };
}

function cloneMessages(messages: AiMessage[]): AiMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map((part) => ({ ...part })),
  }));
}

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${messageCounter++}`;
}

function currentTimestamp(): string {
  return new Date().toISOString();
}

let messageCounter = 1;
