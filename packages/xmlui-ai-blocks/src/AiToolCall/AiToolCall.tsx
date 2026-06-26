import React from "react";
import { createMetadata, parseScssVar, useComponentThemeClass, wrapComponent } from "xmlui";

import styles from "./AiToolCall.module.scss";
import { AiToolCallNative, defaultProps } from "./AiToolCallNative";

const COMP = "AiToolCall";

export const AiToolCallMd = createMetadata({
  status: "experimental",
  description:
    "`AiToolCall` renders a normalized tool call with compact status, input/output summaries, and optional error details.",
  props: {
    toolCall: {
      description: "The normalized tool call to render.",
      valueType: "any",
    },
    defaultOpen: {
      description: "If true, the disclosure starts expanded.",
      valueType: "boolean",
      defaultValue: defaultProps.defaultOpen,
    },
    showInput: {
      description: "Controls whether the input summary is shown.",
      valueType: "string",
      availableValues: ["none", "summary"],
      isStrictEnum: true,
      defaultValue: defaultProps.showInput,
    },
    showOutput: {
      description: "Controls whether the output summary is shown.",
      valueType: "string",
      availableValues: ["none", "summary"],
      isStrictEnum: true,
      defaultValue: defaultProps.showOutput,
    },
  },
  parts: {
    summary: { description: "The summary row." },
    badge: { description: "The status badge." },
    content: { description: "The disclosure body." },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$borderColor",
    [`backgroundColor-${COMP}--requested`]: "rgb(from $color-secondary-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--running`]: "rgb(from $color-primary-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--succeeded`]: "rgb(from $color-success-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--failed`]: "rgb(from $color-danger-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--cancelled`]: "rgb(from $color-surface-100 r g b / 0.6)",
    [`backgroundColor-${COMP}Badge`]: "$color-surface-100",
    [`backgroundColor-${COMP}Badge--active`]: "$color-primary-500",
    [`textColor-${COMP}Badge--active`]: "$color-surface-0",
    [`borderColor-${COMP}--open`]: "$borderColor",
    [`borderColor-${COMP}--failed`]: "$color-danger-400",
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`backgroundColor-${COMP}--requested`]: "rgb(from $color-secondary-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--running`]: "rgb(from $color-primary-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--succeeded`]: "rgb(from $color-success-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--failed`]: "rgb(from $color-danger-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--cancelled`]: "$color-surface-200",
    },
  },
});

type ThemedAiToolCallProps = React.ComponentProps<typeof AiToolCallNative>;

const ThemedAiToolCall = React.forwardRef<HTMLDetailsElement, ThemedAiToolCallProps>(
  function ThemedAiToolCall({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(AiToolCallMd);
    return (
      <AiToolCallNative
        {...props}
        ref={ref}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
      />
    );
  },
);

export const aiToolCallComponentRenderer = wrapComponent(COMP, ThemedAiToolCall, AiToolCallMd);
