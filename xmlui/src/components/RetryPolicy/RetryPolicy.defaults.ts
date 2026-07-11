export const defaultProps = {
  attempts: 3,
  backoff: "exponential" as "fixed" | "linear" | "exponential",
  delayMs: 500,
  jitter: true,
  honourRetryAfter: true,
};
