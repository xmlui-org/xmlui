import { useMemo, useRef } from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import {
  createCircuitState,
  RetryPolicyContext,
  type RetryErrorCategory,
  type RetryPolicySpec,
} from "../../runtime/retryPolicy";

const COMP = "RetryPolicy";

export const defaultProps = {
  attempts: 3,
  backoff: "exponential" as const,
  delayMs: 500,
  jitter: true,
  honourRetryAfter: true,
};

export const RetryPolicyMd = createMetadata({
  status: "experimental",
  description:
    "`RetryPolicy` is a non-visual wrapper that applies retry, backoff, and circuit-breaker behavior to eligible descendants such as `DataSource` and `APICall`.",
  props: {
    attempts: {
      description: "Total number of attempts, including the first try. Must be at least 1.",
      valueType: "number",
      defaultValue: defaultProps.attempts,
    },
    backoff: {
      description: "The delay algorithm between retries.",
      valueType: "string",
      availableValues: ["fixed", "linear", "exponential"],
      isStrictEnum: true,
      defaultValue: defaultProps.backoff,
    },
    delayMs: {
      description: "Base delay between retries in milliseconds.",
      valueType: "number",
      defaultValue: defaultProps.delayMs,
    },
    jitter: {
      description: "When true, random jitter is added to each retry delay.",
      valueType: "boolean",
      defaultValue: defaultProps.jitter,
    },
    onlyCategories: {
      description: "Comma-separated list or array of error categories that should be retried.",
      valueType: "any",
    },
    timeoutMs: {
      description: "Per-attempt timeout in milliseconds. Zero disables the timeout.",
      valueType: "number",
    },
    honourRetryAfter: {
      description: "When true, retry-after metadata overrides the computed backoff delay.",
      valueType: "boolean",
      defaultValue: defaultProps.honourRetryAfter,
    },
    circuitBreaker: {
      description: "Optional object `{ failureThreshold, resetMs }` controlling circuit-breaker behavior.",
      valueType: "any",
    },
  },
});

export const retryPolicyRenderer = wrapComponent({
  name: COMP,
  metadata: RetryPolicyMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const circuitStateRef = useRef(createCircuitState());
    const value = useMemo(
      () => ({
        spec: {
          attempts: Math.max(1, Math.trunc(adapter.numberProp("attempts", defaultProps.attempts))),
          backoff: normalizeBackoff(adapter.stringProp("backoff", defaultProps.backoff)),
          delayMs: Math.max(0, Math.trunc(adapter.numberProp("delayMs", defaultProps.delayMs))),
          jitter: adapter.booleanProp("jitter", defaultProps.jitter),
          onlyCategories: normalizeCategories(adapter.prop("onlyCategories")),
          timeoutMs: Math.max(0, Math.trunc(adapter.numberProp("timeoutMs", 0))),
          honourRetryAfter: adapter.booleanProp("honourRetryAfter", defaultProps.honourRetryAfter),
          circuitBreaker: normalizeCircuitBreaker(adapter.prop("circuitBreaker")),
        } satisfies RetryPolicySpec,
        circuitState: circuitStateRef.current,
      }),
      [adapter],
    );

    return (
      <RetryPolicyContext.Provider value={value}>
        {adapter.renderChildren(nonPropertyChildren(adapter.node.children))}
      </RetryPolicyContext.Provider>
    );
  },
});

function normalizeBackoff(value: string | undefined): RetryPolicySpec["backoff"] {
  return value === "fixed" || value === "linear" || value === "exponential"
    ? value
    : defaultProps.backoff;
}

function normalizeCategories(value: unknown): RetryErrorCategory[] | undefined {
  if (Array.isArray(value)) {
    const categories = value.map(String).filter(Boolean) as RetryErrorCategory[];
    return categories.length > 0 ? categories : undefined;
  }
  if (typeof value === "string") {
    const categories = value.split(",").map((item) => item.trim()).filter(Boolean) as RetryErrorCategory[];
    return categories.length > 0 ? categories : undefined;
  }
  return undefined;
}

function normalizeCircuitBreaker(value: unknown): RetryPolicySpec["circuitBreaker"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Record<string, unknown>;
  const failureThreshold = Number(source.failureThreshold);
  const resetMs = Number(source.resetMs);
  if (!Number.isFinite(failureThreshold) || !Number.isFinite(resetMs)) {
    return undefined;
  }
  return {
    failureThreshold: Math.max(1, Math.trunc(failureThreshold)),
    resetMs: Math.max(0, Math.trunc(resetMs)),
  };
}

function nonPropertyChildren(children: Array<any>) {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}
