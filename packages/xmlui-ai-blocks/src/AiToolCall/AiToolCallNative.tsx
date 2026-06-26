import React, { forwardRef, memo, type CSSProperties } from "react";
import classnames from "classnames";

import styles from "./AiToolCall.module.scss";
import type { AiToolCall } from "../contract";

export type AiToolCallNativeProps = {
  toolCall: AiToolCall;
  defaultOpen?: boolean;
  showInput?: "none" | "summary";
  showOutput?: "none" | "summary";
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
};

export const defaultProps = {
  defaultOpen: false,
  showInput: "summary" as const,
  showOutput: "summary" as const,
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusLabel(status: AiToolCall["status"]) {
  return titleCase(status);
}

export const AiToolCallNative = memo(
  forwardRef<HTMLDetailsElement, AiToolCallNativeProps>(function AiToolCallNative(
    {
      toolCall,
      defaultOpen = defaultProps.defaultOpen,
      showInput = defaultProps.showInput,
      showOutput = defaultProps.showOutput,
      className,
      classes,
      style,
    },
    ref,
  ) {
    return (
      <details
        ref={ref}
        className={classnames(styles.root, classes?.["-component"], className)}
        style={style}
        open={defaultOpen}
        data-status={toolCall.status}
      >
        <summary className={classnames(styles.summary, classes?.summary)}>
          <span className={styles.name}>{toolCall.name}</span>
          <span className={classnames(styles.statusBadge, classes?.badge)}>{statusLabel(toolCall.status)}</span>
        </summary>

        <div className={classnames(styles.content, classes?.content)}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Tool call</span>
            <span className={styles.metaValue}>{toolCall.id}</span>
          </div>

          {showInput !== "none" && toolCall.inputSummary ? (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Input</div>
              <div className={styles.sectionValue}>{toolCall.inputSummary}</div>
            </div>
          ) : null}

          {showOutput !== "none" && toolCall.outputSummary ? (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Output</div>
              <div className={styles.sectionValue}>{toolCall.outputSummary}</div>
            </div>
          ) : null}

          {toolCall.error ? (
            <div className={styles.errorSection}>
              <div className={styles.sectionLabel}>Error</div>
              <div className={styles.errorValue}>{toolCall.error}</div>
            </div>
          ) : null}
        </div>
      </details>
    );
  }),
);
