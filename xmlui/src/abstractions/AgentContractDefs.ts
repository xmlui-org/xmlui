import type { ComponentDef, CompoundComponentDef } from "./ComponentDefs";

export const AGENT_EVENT_FAMILIES = [
  "run",
  "message",
  "tool",
  "approval",
  "generation",
  "error",
] as const;

export type AgentEventFamily = (typeof AGENT_EVENT_FAMILIES)[number];

export type AiMessageRole = "system" | "user" | "assistant" | "tool";

export type AiMessageStatus = "streaming" | "complete" | "error";

export type AiMessagePart =
  | {
      kind: "text";
      text: string;
      streaming?: boolean;
    }
  | {
      kind: "reasoning";
      text: string;
      summary?: boolean;
    }
  | {
      kind: "source";
      title?: string;
      url?: string;
    }
  | {
      kind: "tool-call";
      toolCallId: string;
    }
  | {
      kind: "clarification";
      question: string;
      choices?: string[];
      reason?: string;
    }
  | {
      kind: "error";
      message: string;
      code?: string;
    };

export type AiMessage = {
  id: string;
  role: AiMessageRole;
  parts: AiMessagePart[];
  status?: AiMessageStatus;
};

export type AiRunStatus =
  | "queued"
  | "running"
  | "awaiting-approval"
  | "completed"
  | "failed"
  | "cancelled";

export type AiRun = {
  id: string;
  status: AiRunStatus;
  provider?: string;
  model?: string;
  error?: string;
};

export type AiToolCallStatus = "requested" | "running" | "succeeded" | "failed" | "cancelled";

export type AiToolCall = {
  id: string;
  name: string;
  status: AiToolCallStatus;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
};

export type AiApprovalRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "edited"
  | "expired"
  | "failed";

export type AiApprovalRequest = {
  id: string;
  status: AiApprovalRequestStatus;
  title?: string;
  reason?: string;
  details?: string;
  decisionPayload?: unknown;
  editedPayload?: unknown;
  error?: string;
};

export type XmluiValidationIssue = {
  code: string;
  message: string;
  severity: "error" | "warn";
  pos?: number;
  end?: number;
};

export type XmluiValidationResult =
  | {
      ok: true;
      component: ComponentDef | CompoundComponentDef;
      warnings: string[];
    }
  | {
      ok: false;
      issues: XmluiValidationIssue[];
      warnings?: string[];
    };

export type XmluiGenerationStatus =
  | "idle"
  | "generating"
  | "repairing"
  | "clarification"
  | "accepted"
  | "failed";

export type XmluiGenerationState = {
  status: XmluiGenerationStatus;
  code?: string;
  summary?: string;
  diagnostics?: XmluiValidationIssue[];
  updatedAt?: string;
};

export type RequestDirectives = {
  allowFullReplacement?: boolean;
  allowMockData?: boolean;
  approvalPolicy?: "default" | "strict" | "host-managed";
};

export type AgentRequest = {
  threadId?: string;
  sessionId?: string;
  messages: AiMessage[];
  currentCode?: string;
  selectedProvider?: string;
  selectedModel?: string;
  requestDirectives?: RequestDirectives;
  context?: Record<string, unknown>;
};

export type XmluiAgentResponseEnvelope =
  | {
      kind: "code";
      operation: "create" | "modify";
      summary: string;
      code: string;
      metadata?: {
        title?: string;
        componentsUsed?: string[];
        dataSourcesUsed?: string[];
        assumptions?: string[];
      };
    }
  | {
      kind: "clarification";
      question: string;
      choices?: string[];
      reason?: string;
    }
  | {
      kind: "error";
      message: string;
      code?: string;
    };

export type AgentEvent =
  | {
      type: "run.updated";
      run: AiRun;
    }
  | {
      type: "message.updated";
      message: AiMessage;
    }
  | {
      type: "message.delta";
      messageId: string;
      text: string;
    }
  | {
      type: "tool.updated";
      toolCall: AiToolCall;
    }
  | {
      type: "approval.updated";
      request: AiApprovalRequest;
    }
  | {
      type: "generation.updated";
      generation: XmluiGenerationState;
    }
  | {
      type: "error";
      message: string;
      code?: string;
    };

export type AgentEventType = AgentEvent["type"];
