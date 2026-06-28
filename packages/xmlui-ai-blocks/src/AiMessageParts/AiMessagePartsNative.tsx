import { forwardRef, memo, type CSSProperties, type ReactNode } from "react";
import classnames from "classnames";
import { Markdown, Text } from "xmlui";

import styles from "./AiMessageParts.module.scss";
import type { AiMessage, AiMessagePart } from "../contract";

type SourcePart = Extract<AiMessagePart, { kind: "source" }>;

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

function escapeMarkdownLabel(value: string) {
  return value.replace(/([\\[\]])/g, "\\$1");
}

function escapeMarkdownUrl(value: string) {
  return value.replace(/\)/g, "%29");
}

function getSourceListItem(part: SourcePart) {
  const label = escapeMarkdownLabel(part.title ?? part.url ?? "Source");
  return part.url ? `[${label}](${escapeMarkdownUrl(part.url)})` : label;
}

function renderSourcePart(part: SourcePart) {
  return (
    <div key={`source-${part.title ?? part.url ?? "source"}`} className={styles.sourcePart}>
      <Markdown openLinkInNewTab>{`Sources\n\n- ${getSourceListItem(part)}`}</Markdown>
    </div>
  );
}

function renderSourceParts(parts: SourcePart[], key: string) {
  return (
    <div key={key} className={styles.sourcePart}>
      <Markdown openLinkInNewTab>{`Sources\n\n${parts.map((part) => `- ${getSourceListItem(part)}`).join("\n")}`}</Markdown>
    </div>
  );
}

function renderPart(part: AiMessagePart, showSources: boolean) {
  switch (part.kind) {
    case "text":
      return (
        <div key={`text-${part.text}`} className={styles.textPart} data-streaming={part.streaming ? "true" : "false"}>
          {part.text}
        </div>
      );
    case "reasoning":
      return (
        <div className={styles.reasoningContainer}>
          <Markdown>
  {`> [!DETAILS] Reasoning
>
${part.text.split("\n").map((line) => `> ${line}`).join("\n")}`}
        </Markdown>
        </div>
      );
    case "source":
      if (!showSources) return null;
      return renderSourcePart(part);
    case "tool-call":
      return (
        <div key={`tool-${part.toolCallId}`} className={styles.toolReference}>
          Tool call: <span className={styles.toolReferenceId}>{part.toolCallId}</span>
        </div>
      );
    case "clarification":
      return (
        <div key={`clarification-${part.question}`} className={styles.clarificationPart}>
          <Text variant="subheading">Clarification requested</Text>
          <Markdown>
            {`
${part.question}
${!!part.reason ? part.reason : null}
${part.choices?.length ? part.choices.map((choice) => `- ${choice}`).join("\n") : null}
            `}
          </Markdown>
          {/* <div className={styles.clarificationQuestion}>{part.question}</div>
          {part.reason ? <div className={styles.clarificationReason}>{part.reason}</div> : null}
          {part.choices?.length ? (
            <ul className={styles.choiceList}>
              {part.choices.map((choice) => (
                <li key={choice} className={styles.choiceItem}>
                  {choice}
                </li>
              ))}
            </ul>
          ) : null} */}
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

function renderMessageParts(parts: AiMessagePart[], showSources: boolean) {
  const renderedParts: ReactNode[] = [];
  let sourceParts: SourcePart[] = [];

  const flushSourceParts = () => {
    if (!sourceParts.length) return;
    renderedParts.push(renderSourceParts(sourceParts, `sources-${renderedParts.length}`));
    sourceParts = [];
  };

  parts.forEach((part) => {
    if (part.kind === "source" && showSources) {
      sourceParts.push(part);
      return;
    }

    flushSourceParts();
    const renderedPart = renderPart(part, showSources);
    if (renderedPart) {
      renderedParts.push(renderedPart);
    }
  });

  flushSourceParts();
  return renderedParts;
}

export const AiMessagePartsNative = memo(
  forwardRef<HTMLElement, AiMessagePartsNativeProps>(function AiMessagePartsNative(
    { message, streaming, showSources = defaultProps.showSources, className, classes, style },
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
        {/* <header className={classnames(styles.header, classes?.header)}>
          <span className={classnames(styles.roleBadge, classes?.badge)}>{roleLabel(message.role)}</span>
          <span className={classnames(styles.statusBadge, classes?.badge)}>{resolvedStatus}</span>
        </header> */}

        <div className={classnames(styles.content, classes?.content)}>
          {message.parts?.length ? (
            renderMessageParts(message.parts, showSources)
          ) : (
            <div className={styles.emptyState}>No message content</div>
          )}
        </div>
      </article>
    );
  }),
);
