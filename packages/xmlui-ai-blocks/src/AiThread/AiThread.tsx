import { createMetadata, wrapComponent } from "xmlui";

import { defaultProps } from "./AiThreadNative";
import { AiThreadNative } from "./AiThreadNative";

const COMP = "AiThread";

export const AiThreadMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`AiThread` is the headless AI controller for `xmlui-ai-blocks`. The `a2xmlui` compatibility contract is deprecated and prototype-only; prefer the future streaming `agent-events` contract when available.",
  props: {
    contract: {
      description:
        "Selects the thread contract. `a2xmlui` is the temporary, deprecated compatibility bridge for the original prototype endpoint. `agent-events` is reserved for the streaming backend.",
      valueType: "string",
      availableValues: ["a2xmlui", "agent-events"],
      isStrictEnum: true,
      defaultValue: defaultProps.contract,
    },
    sendAction: {
      description:
        "Host endpoint URL used to submit A2XMLUI requests. When omitted, the component uses a local mock response for demos.",
      valueType: "string",
    },
    currentCode: {
      description: "The current XMLUI source to modify or replace.",
      valueType: "string",
    },
    initialMessages: {
      description: "Initial transcript messages.",
      valueType: "any",
    },
    selectedAgent: {
      description: "The currently selected agent identifier.",
      valueType: "string",
    },
    selectedModel: {
      description: "The currently selected model identifier.",
      valueType: "string",
    },
    runtimeContext: {
      description: "Optional request-scoped runtime context sent to the compatibility endpoint.",
      valueType: "hash",
    },
    requestDirectives: {
      description:
        "Optional compatibility directives. `allowFullReplacement` controls whether the request may replace the current code without a confirmation step.",
      valueType: "hash",
    },
  },
  apis: {
    submit: {
      description: "Sends a prompt to the compatibility endpoint.",
      signature: "submit(input: string | { text?: string; files?: unknown[] }): void",
      parameters: {
        input: "The prompt text or structured submission payload.",
      },
    },
    confirmNew: {
      description: "Confirms a pending full replacement and sends the queued prompt.",
      signature: "confirmNew(): void",
    },
    modifyCurrent: {
      description: "Confirms a pending prompt as an in-place modification of the current code.",
      signature: "modifyCurrent(): void",
    },
    cancelPending: {
      description: "Cancels the active request and clears pending queued prompt state.",
      signature: "cancelPending(): void",
    },
    stop: {
      description: "Alias for cancelPending().",
      signature: "stop(): void",
    },
    clear: {
      description: "Clears the transcript and resets the thread state.",
      signature: "clear(): void",
    },
  },
});

export const aiThreadComponentRenderer = wrapComponent(COMP, AiThreadNative, AiThreadMd, {
  stateful: true,
  exposeRegisterApi: true,
});

export type { A2XmluiAgentResponse, A2XmluiRequestBody, A2XmluiRequestDirectives } from "./a2xmluiContract";
export type { AiThreadGenerationState, AiThreadStatus, AiThreadValue } from "./a2xmluiAdapter";
