import type { CSSProperties } from "react";

import styles from "./ConciseValidationFeedback.module.scss";

export type ConciseValidationFeedbackProps = {
  className?: string;
  style?: CSSProperties;
  validationStatus?: string;
  invalidMessages?: unknown;
  successIcon?: string;
  errorIcon?: string;
} & Record<string, unknown>;

export function ConciseValidationFeedback({
  className,
  style,
  validationStatus,
  invalidMessages,
  successIcon = "checkmark",
  errorIcon = "error",
  ...rest
}: ConciseValidationFeedbackProps) {
  const messages = normalizeMessages(invalidMessages);

  if (validationStatus === "error") {
    const label = messages.join("\n");
    return (
      <span
        {...rest}
        className={cx(styles.feedback, styles.error, className)}
        style={style}
        role="img"
        aria-label={label || "Validation error"}
        title={label}
      >
        <span className={styles.icon} aria-hidden="true">{iconGlyph(errorIcon, "!")}</span>
        {label && <span className={styles.message}>{label}</span>}
      </span>
    );
  }

  if (validationStatus === "valid") {
    return (
      <span
        {...rest}
        className={cx(styles.feedback, styles.valid, className)}
        style={style}
        role="img"
        aria-label="Valid"
      >
        <span className={styles.icon} aria-hidden="true">{iconGlyph(successIcon, "✓")}</span>
      </span>
    );
  }

  return null;
}

function normalizeMessages(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => String(entry));
}

function iconGlyph(icon: string | undefined, fallback: string): string {
  if (!icon) {
    return fallback;
  }
  if (icon === "checkmark" || icon === "check" || icon === "success") {
    return "✓";
  }
  if (icon === "error" || icon === "warning") {
    return "!";
  }
  return fallback;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

