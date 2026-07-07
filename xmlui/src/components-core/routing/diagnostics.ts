export type RoutingDiagnosticCode =
  | "constraint-rejected"
  | "unknown-constraint"
  | "duplicate-constraint"
  | "non-canonical-url"
  | "guard-bypass-attempt";

export interface RoutingDiagnostic {
  code: RoutingDiagnosticCode;
  severity: "error" | "warn";
  pageUrl?: string;
  segment?: string;
  constraint?: string;
  rawValue?: string;
  message: string;
  data?: unknown;
}
