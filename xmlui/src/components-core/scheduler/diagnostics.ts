export type DeterminismDiagCode =
  | "determinism-handler-reordered"
  | "determinism-state-write-after-render"
  | "determinism-floating-point-token"
  | "determinism-iteration-order-symbol"
  | "determinism-replay-divergence"
  | "determinism-convergence-failed";

export interface DeterminismDiagnostic {
  code: DeterminismDiagCode;
  severity: "error" | "warn" | "info";
  message: string;
  traceId?: string;
  data?: unknown;
}
