import React, { forwardRef, memo, type CSSProperties } from "react";
import classnames from "classnames";

import styles from "./AiMessageParts.module.scss";
import type { AiMessage, AiMessagePart } from "../contract";

export type AiMessagePartsNativeProps = {
  message: AiMessage;
  streaming?: boolean;
  collapseReasoning?: boolean;
  showSources?: boolean;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
};

export const defaultProps = {
  collapseReasoning: false,
  showSources: true,
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusLabel(value?: AiMessage["status"], streaming?: boolean) {
  if (streaming) return "Streaming";
  if (!value) return "Complete";
  return titleCase(value);
}

function roleLabel(role: AiMessage["role"]) {
  return role === "assistant" ? "Assistant" : titleCase(role);
}

function renderPart(part: AiMessagePart, showSources: boolean, collapseReasoning: boolean) {
  switch (part.kind) {
    case "text":
      return (
        <div key={`text-${part.text}`} className={styles.textPart} data-streaming={part.streaming ? "true" : "false"}>
          {part.text}
        </div>
      );
    case "reasoning":
      return collapseReasoning ? (
        <details key={`reasoning-${part.text}`} className={styles.reasoningDisclosure}>
          <summary className={styles.reasoningSummary}>{part.summary ? "Reasoning summary" : "Reasoning"}</summary>
          <div className={styles.reasoningBody}>{part.text}</div>
        </details>
      ) : (
        <div key={`reasoning-${part.text}`} className={styles.reasoningPart}>
          <div className={styles.partLabel}>{part.summary ? "Reasoning summary" : "Reasoning"}</div>
          <div className={styles.reasoningBody}>{part.text}</div>
        </div>
      );
    case "source":
      if (!showSources) return null;
      return (
        <div key={`source-${part.title ?? part.url ?? "source"}`} className={styles.sourcePart}>
          {part.url ? (
            <a
              className={styles.sourceLink}
              href={part.url}
              target="_blank"
              rel="noreferrer"
            >
              {part.title ?? part.url}
            </a>
          ) : (
            <span className={styles.sourceText}>{part.title ?? "Source"}</span>
          )}
        </div>
      );
    case "tool-call":
      return (
        <div key={`tool-${part.toolCallId}`} className={styles.toolReference}>
          Tool call: <span className={styles.toolReferenceId}>{part.toolCallId}</span>
        </div>
      );
    case "clarification":
      return (
        <div key={`clarification-${part.question}`} className={styles.clarificationPart}>
          <div className={styles.partLabel}>Clarification requested</div>
          <div className={styles.clarificationQuestion}>{part.question}</div>
          {part.reason ? <div className={styles.clarificationReason}>{part.reason}</div> : null}
          {part.choices?.length ? (
            <ul className={styles.choiceList}>
              {part.choices.map((choice) => (
                <li key={choice} className={styles.choiceItem}>
                  {choice}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    case "error":
      return (
        <div key={`error-${part.message}`} className={styles.errorPart}>
          <div className={styles.partLabel}>Error</div>
          <div className={styles.errorMessage}>{part.message}</div>
          {part.code ? <div className={styles.errorCode}>{part.code}</div> : null}
        </div>
      );
    default:
      return null;
  }
}

export const AiMessagePartsNative = memo(
  forwardRef<HTMLElement, AiMessagePartsNativeProps>(function AiMessagePartsNative(
    { message, streaming, collapseReasoning = defaultProps.collapseReasoning, showSources = defaultProps.showSources, className, classes, style },
    ref,
  ) {
    const resolvedStreaming = streaming ?? message.status === "streaming";
    const resolvedStatus = statusLabel(message.status, resolvedStreaming);

    return (
      <article
        ref={ref}
        className={classnames(styles.root, classes?.["-component"], className)}
        style={style}
        data-role={message.role}
        data-status={message.status ?? "complete"}
        data-streaming={resolvedStreaming ? "true" : "false"}
        aria-live={resolvedStreaming ? "polite" : undefined}
      >
        <header className={classnames(styles.header, classes?.header)}>
          <span className={classnames(styles.roleBadge, classes?.badge)}>{roleLabel(message.role)}</span>
          <span className={classnames(styles.statusBadge, classes?.badge)}>{resolvedStatus}</span>
        </header>

        <div className={classnames(styles.content, classes?.content)}>
          {message.parts?.length ? (
            message.parts.map((part) => renderPart(part, showSources, collapseReasoning))
          ) : (
            <div className={styles.emptyState}>No message content</div>
          )}
        </div>
      </article>
    );
  }),
);
