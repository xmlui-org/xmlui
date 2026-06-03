import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./RetryPolicy.defaults";
import { RetryPolicy } from "./RetryPolicyReact";

const COMP = "RetryPolicy";

export const RetryPolicyMd = createMetadata({
  status: "experimental",
  description:
    `\`${COMP}\` is a non-visual wrapper that applies a retry / backoff / ` +
    `circuit-breaker policy to its eligible descendants (currently ` +
    `\`DataSource\` and any \`Loader\`-backed component). Failures bubble ` +
    `up to the structured \`AppError\` channel; retries happen ` +
    `transparently before \`$error\` fires.`,
  props: {
    attempts: {
      description:
        `Total number of attempts, including the first try. Must be at least 1.`,
      valueType: "number",
      defaultValue: defaultProps.attempts,
    },
    backoff: {
      description:
        `Algorithm used to compute the delay between retries: \`fixed\` ` +
        `keeps the delay constant, \`linear\` multiplies by attempt index, ` +
        `\`exponential\` doubles each time.`,
      valueType: "string",
      availableValues: ["fixed", "linear", "exponential"],
      isStrictEnum: true,
      defaultValue: defaultProps.backoff,
    },
    delayMs: {
      description: `Base delay between retries in milliseconds.`,
      valueType: "number",
      defaultValue: defaultProps.delayMs,
    },
    jitter: {
      description:
        `When \`true\` (default), a random ±25% jitter is added to each ` +
        `delay to spread out retries across concurrent callers.`,
      valueType: "boolean",
      defaultValue: defaultProps.jitter,
    },
    onlyCategories: {
      description:
        `Comma-separated list (or array) of \`AppError\` categories that ` +
        `should be retried. Errors whose category is not listed are ` +
        `rethrown immediately. Example: \`"network,server"\`.`,
      valueType: "any",
    },
    timeoutMs: {
      description:
        `Hard ceiling per attempt in milliseconds. \`0\` (default) ` +
        `disables the per-attempt timeout.`,
      valueType: "number",
    },
    honourRetryAfter: {
      description:
        `When \`true\` (default), an HTTP \`Retry-After\` value carried in ` +
        `\`AppError.data.retryAfterMs\` overrides the computed backoff delay ` +
        `(capped at 60s).`,
      valueType: "boolean",
      defaultValue: defaultProps.honourRetryAfter,
    },
    circuitBreaker: {
      description:
        `Optional object \`{ failureThreshold, resetMs }\` that opens a ` +
        `circuit after \`failureThreshold\` consecutive failures and fails ` +
        `fast for \`resetMs\` milliseconds before probing once.`,
      valueType: "any",
    },
  },
});

export const retryPolicyComponentRenderer = wrapComponent(
  COMP,
  RetryPolicy,
  RetryPolicyMd,
  {
    stateful: false,
    customRender: (_props, { node, extractValue, renderChild }) => (
      <RetryPolicy
        attempts={extractValue.asOptionalNumber(node.props.attempts)}
        backoff={extractValue.asOptionalString(node.props.backoff) as any}
        delayMs={extractValue.asOptionalNumber(node.props.delayMs)}
        jitter={extractValue.asOptionalBoolean(node.props.jitter)}
        onlyCategories={extractValue(node.props.onlyCategories)}
        timeoutMs={extractValue.asOptionalNumber(node.props.timeoutMs)}
        honourRetryAfter={extractValue.asOptionalBoolean(node.props.honourRetryAfter)}
        circuitBreaker={extractValue(node.props.circuitBreaker)}
      >
        {renderChild(node.children)}
      </RetryPolicy>
    ),
  },
);
