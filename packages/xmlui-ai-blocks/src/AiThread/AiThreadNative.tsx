import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import type { RegisterComponentApiFn, UpdateStateFn } from "xmlui";
import type { AiMessage } from "../contract";
import { parseA2XmluiResponse } from "./a2xmluiContract";
import {
  applyA2XmluiEnvelope,
  applyA2XmluiFailure,
  buildA2XmluiRequestBody,
  buildSubmissionPayload,
  createA2XmluiThreadState,
  enqueueUserMessage,
  projectA2XmluiThreadValue,
  type AiThreadState,
  type SubmitPayload,
} from "./a2xmluiAdapter";
import type { A2XmluiRequestDirectives } from "./a2xmluiContract";

export const defaultProps = {
  contract: "a2xmlui" as const,
};

type Props = {
  contract?: "a2xmlui" | "agent-events";
  sendAction?: string;
  currentCode?: string;
  initialMessages?: AiMessage[];
  selectedAgent?: string;
  selectedModel?: string;
  runtimeContext?: Record<string, unknown>;
  requestDirectives?: A2XmluiRequestDirectives;
  updateState: UpdateStateFn;
  registerComponentApi: RegisterComponentApiFn;
  value?: unknown;
};

export const AiThreadNative = memo(function AiThreadNative({
  contract = "a2xmlui",
  sendAction,
  currentCode,
  initialMessages,
  selectedAgent,
  selectedModel,
  runtimeContext,
  requestDirectives,
  updateState,
  registerComponentApi,
}: Props) {
  const [state, setState] = useState<AiThreadState>(() =>
    createA2XmluiThreadState({
      initialMessages,
      currentCode,
      selectedAgent,
      selectedModel,
      runtimeContext,
      requestDirectives,
    }),
  );
  const stateRef = useRef(state);
  const propsRef = useRef({
    contract,
    sendAction,
    currentCode,
    initialMessages,
    selectedAgent,
    selectedModel,
    runtimeContext,
    requestDirectives,
  });
  const activeRequestRef = useRef<{
    id: string;
    controller?: AbortController;
    timer?: number;
    mode: "fetch" | "mock";
  } | null>(null);

  useEffect(() => {
    stateRef.current = state;
    updateState(projectA2XmluiThreadValue(state));
  }, [state, updateState]);

  useEffect(() => {
    propsRef.current = {
      contract,
      sendAction,
      currentCode,
      initialMessages,
      selectedAgent,
      selectedModel,
      runtimeContext,
      requestDirectives,
    };
  }, [contract, sendAction, currentCode, initialMessages, selectedAgent, selectedModel, runtimeContext, requestDirectives]);

  useEffect(() => {
    setState((current) => ({
      ...current,
      selectedAgent,
      selectedModel,
    }));
  }, [selectedAgent, selectedModel]);

  useEffect(() => {
    setState((current) => {
      const code = currentCode?.trim() ? currentCode : undefined;
      if (current.generation.code === code && current.generation.lastWorkingCode === code) {
        return current;
      }
      return {
        ...current,
        generation: {
          ...current.generation,
          code,
          lastWorkingCode: code,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, [currentCode]);

  useEffect(() => {
    registerComponentApi({
      submit: (input: string | { text?: string; files?: unknown[] }) => {
        void submitInput(input);
      },
      confirmNew: () => {
        void resolvePendingSubmission(true);
      },
      modifyCurrent: () => {
        void resolvePendingSubmission(false);
      },
      cancelPending: () => {
        cancelActiveRequest("cancelled");
      },
      stop: () => {
        cancelActiveRequest("cancelled");
      },
      clear: () => {
        clearThread();
      },
    });
  }, [registerComponentApi]);

  const clearThread = () => {
    const props = propsRef.current;
    cancelActiveRequest("cancelled");
    setState((current) =>
      createA2XmluiThreadState({
        initialMessages: props.initialMessages,
        currentCode: props.currentCode,
        selectedAgent: current.selectedAgent,
        selectedModel: current.selectedModel,
        runtimeContext: props.runtimeContext,
        requestDirectives: props.requestDirectives,
      }),
    );
  };

  const cancelActiveRequest = (status: "cancelled" | "error") => {
    const active = activeRequestRef.current;
    if (active?.controller) {
      active.controller.abort();
    }
    if (active?.timer) {
      window.clearTimeout(active.timer);
    }
    activeRequestRef.current = null;
    setState((current) => ({
      ...current,
      isRunning: false,
      status: status,
      error: status === "cancelled" ? null : current.error,
      pendingPrompt: null,
      queuedPrompt: null,
      replacementPending: false,
      generation: {
        ...current.generation,
        status: status === "cancelled" ? current.generation.status : "failed",
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const resolvePendingSubmission = async (allowFullReplacement: boolean) => {
    const pending = stateRef.current.pendingPrompt;
    if (!pending) return;
    setState((current) => ({
      ...current,
      pendingPrompt: null,
      replacementPending: false,
    }));
    await submitResolved({ text: pending }, { allowFullReplacement });
  };

  const submitInput = async (input: string | { text?: string; files?: unknown[] }) => {
    const payload = buildSubmissionPayload(input);
    if (!payload) return;
    if (stateRef.current.isRunning) {
      setState((current) => ({
        ...current,
        queuedPrompt: payload.text,
      }));
      return;
    }

    await submitResolved(payload);
  };

  const submitResolved = async (
    submission: SubmitPayload,
    overrides?: { allowFullReplacement?: boolean },
  ) => {
    const props = propsRef.current;

    if (props.contract !== "a2xmlui") {
      setState((current) => applyA2XmluiFailure(current, "The agent-events contract is not implemented yet."));
      return;
    }

    const current = stateRef.current;
    const allowFullReplacement =
      overrides?.allowFullReplacement ??
      props.requestDirectives?.allowFullReplacement ??
      (props.currentCode ? undefined : true);

    if (allowFullReplacement === undefined && props.currentCode) {
      setState((next) => ({
        ...next,
        pendingPrompt: submission.text,
        replacementPending: true,
        status: "clarification",
        generation: {
          ...next.generation,
          status: "clarification",
          summary: "Awaiting full-replacement confirmation",
          updatedAt: new Date().toISOString(),
        },
      }));
      return;
    }

    const userState = enqueueUserMessage(current, submission);
    const requestMessages = userState.state.messages;
    const requestBody = buildA2XmluiRequestBody(requestMessages, {
      currentCode: props.currentCode?.trim() ? props.currentCode : undefined,
      runtimeContext: props.runtimeContext,
      requestDirectives: {
        allowFullReplacement: allowFullReplacement ?? false,
      },
      selectedAgent: props.selectedAgent,
      selectedModel: props.selectedModel,
    });

    const runId = `run-${Date.now().toString(36)}`;
    setState((next) => ({
      ...userState.state,
      isRunning: true,
      status: "running",
      error: null,
      activeRun: {
        id: runId,
        status: "running",
        provider: props.selectedAgent,
        model: props.selectedModel,
      },
      pendingPrompt: null,
      replacementPending: false,
      generation: {
        ...next.generation,
        status: "generating",
        summary: undefined,
        updatedAt: new Date().toISOString(),
      },
    }));

    const abortController = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    activeRequestRef.current = { id: runId, controller: abortController, mode: props.sendAction ? "fetch" : "mock" };

    try {
      const responseText = props.sendAction
        ? await executeFetch(props.sendAction, requestBody, abortController?.signal)
        : await executeMock(runId, submission, abortController?.signal);

      if (abortController?.signal.aborted) return;

      const parsed = parseA2XmluiResponse(responseText, { currentCode: requestBody.currentCode });
      if (!parsed.ok) {
        setState((currentState) =>
          applyA2XmluiFailure(currentState, parsed.issues.map((issue) => issue.message).join(" "), undefined),
        );
        return;
      }

      setState((currentState) => {
        const next = applyA2XmluiEnvelope(currentState, parsed.response);
        return next;
      });
    } catch (error) {
      if (abortController?.signal.aborted) return;
      const message = error instanceof Error ? error.message : "The request failed.";
      setState((currentState) => applyA2XmluiFailure(currentState, message));
      return;
    } finally {
      if (activeRequestRef.current?.id === runId) {
        activeRequestRef.current = null;
      }
    }
  };

  const executeFetch = async (
    url: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<string> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}.`);
    }
    return text;
  };

  const executeMock = async (runId: string, submission: SubmitPayload, signal?: AbortSignal): Promise<string> => {
    const props = propsRef.current;
    return await new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const lowerText = submission.text.toLowerCase();
        if (lowerText.includes("clarify") || lowerText.includes("which") || lowerText.includes("what should")) {
          resolve(
            JSON.stringify({
              kind: "clarification",
              question: "Should this replace the current XMLUI code or modify it in place?",
              choices: ["Replace it", "Modify it"],
              reason: "The prompt suggests a full replacement may be needed.",
            }),
          );
          return;
        }

        resolve(
          JSON.stringify({
            kind: "code",
            operation: props.currentCode ? "modify" : "create",
            summary: `Mocked XMLUI response for: ${submission.text.slice(0, 80)}`,
            code:
              props.currentCode?.trim() ||
              `<VStack gap="$space-3">
  <Text value="${escapeXml(submission.text.slice(0, 60) || "Generated XMLUI")}" />
</VStack>`,
          }),
        );
      }, 250);

      activeRequestRef.current = {
        id: runId,
        timer,
        mode: "mock",
      };

      signal?.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  };

  const escapeXml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  useEffect(() => {
    if (state.isRunning) return;
    if (!state.queuedPrompt) return;
    if (state.status !== "complete" && state.status !== "error" && state.status !== "cancelled") return;
    const queued = state.queuedPrompt;
    setState((current) => ({ ...current, queuedPrompt: null }));
    void submitResolved({ text: queued });
  }, [state.isRunning, state.queuedPrompt, state.status]);

  const projectedValue = useMemo(() => projectA2XmluiThreadValue(state), [state]);

  useEffect(() => {
    updateState(projectedValue);
  }, [projectedValue, updateState]);

  return null;
});
