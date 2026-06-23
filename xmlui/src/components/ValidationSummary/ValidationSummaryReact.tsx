import type { CSSProperties } from "react";

import { useFormContext } from "../Form/FormContext";
import styles from "./ValidationSummary.module.scss";

type Severity = "error" | "warning";

type ValidationIssue = {
  field?: string;
  message: string;
  severity: Severity;
};

export type ValidationSummaryProps = {
  className?: string;
  style?: CSSProperties;
  fieldValidationResults?: unknown;
  generalValidationResults?: unknown;
} & Record<string, unknown>;

export function ValidationSummary({
  className,
  style,
  fieldValidationResults,
  generalValidationResults,
  ...rest
}: ValidationSummaryProps) {
  const form = useFormContext();
  const issues = [
    ...issuesFromFormErrors(form?.errors),
    ...issuesFromFieldValidationResults(fieldValidationResults),
    ...issuesFromGeneralValidationResults(generalValidationResults),
  ];
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div {...rest} className={cx(styles.summary, className)} style={style} data-validation-summary>
      <ValidationDisplay heading="Validation warnings" issues={warnings} severity="warning" />
      <ValidationDisplay heading="Validation errors" issues={errors} severity="error" />
    </div>
  );
}

function ValidationDisplay({
  heading,
  issues,
  severity,
}: {
  heading: string;
  issues: ValidationIssue[];
  severity: Severity;
}) {
  if (issues.length === 0) {
    return null;
  }
  return (
    <div
      className={cx(styles.display, severity === "error" ? styles.error : styles.warning)}
      data-validation-display-severity={severity}
    >
      <p className={styles.heading}>{heading}</p>
      <ul className={styles.list}>
        {issues.map((issue, index) => (
          <li key={index} className={styles.entry}>
            {issue.field && <span className={styles.field}>{issue.field}: </span>}
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function issuesFromFormErrors(errors: Record<string, string> | undefined): ValidationIssue[] {
  if (!errors) {
    return [];
  }
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
    severity: "error",
  }));
}

function issuesFromFieldValidationResults(value: unknown): ValidationIssue[] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const issues: ValidationIssue[] = [];
  for (const [field, result] of Object.entries(value as Record<string, unknown>)) {
    const validations = Array.isArray((result as { validations?: unknown[] })?.validations)
      ? (result as { validations: unknown[] }).validations
      : [];
    for (const validation of validations) {
      const normalized = normalizeValidationResult(validation, field);
      if (normalized) {
        issues.push(normalized);
      }
    }
  }
  return issues;
}

function issuesFromGeneralValidationResults(value: unknown): ValidationIssue[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const normalized = normalizeValidationResult(entry);
    return normalized ? [normalized] : [];
  });
}

function normalizeValidationResult(value: unknown, field?: string): ValidationIssue | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (record.isValid === true) {
    return undefined;
  }
  const message = record.invalidMessage ?? record.message;
  if (typeof message !== "string" || message.length === 0) {
    return undefined;
  }
  const severity = record.severity === "warning" ? "warning" : "error";
  return { field, message, severity };
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

