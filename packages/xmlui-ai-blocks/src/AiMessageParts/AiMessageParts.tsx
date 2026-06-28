import React from "react";
import { createMetadata, parseScssVar, useComponentThemeClass, wrapComponent } from "xmlui";

import styles from "./AiMessageParts.module.scss";
import { AiMessagePartsNative, defaultProps } from "./AiMessagePartsNative";

const COMP = "AiMessageParts";

export const AiMessagePartsMd = createMetadata({
  status: "experimental",
  description:
    "`AiMessageParts` renders a normalized AI message with streaming text, reasoning, sources, tool references, clarifications, and errors.",
  props: {
    message: {
      description: "The normalized AI message to render.",
      valueType: "any",
    },
    streaming: {
      description: "Marks the message as streaming even if the message status has not updated yet.",
      valueType: "boolean",
    },
    collapseReasoning: {
      description: "If true, reasoning parts render inside disclosure blocks.",
      valueType: "boolean",
      defaultValue: defaultProps.collapseReasoning,
    },
    showSources: {
      description: "If true, source parts render as links or text.",
      valueType: "boolean",
      defaultValue: defaultProps.showSources,
    },
  },
  parts: {
    header: { description: "The message header region." },
    badge: { description: "Role and status badges." },
    content: { description: "The main message content area." },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$borderColor",
    [`textColor-${COMP}`]: "$textColor",
    [`backgroundColor-reasoning-${COMP}`]: "rgb(from $color-surface-100 r g b / 0.70)",
    [`backgroundColor-${COMP}--assistant`]: "transparent",
    [`backgroundColor-${COMP}--user`]: "rgb(from $color-primary-100 r g b / 0.70)",
    [`backgroundColor-${COMP}--system`]: "rgb(from $color-secondary-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--tool`]: "rgb(from $color-attention-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--streaming`]: "rgb(from $color-primary-100 r g b / 0.35)",
    [`borderColor-${COMP}--streaming`]: "$color-primary-300",
    [`backgroundColor-${COMP}Badge`]: "$color-surface-100",
    [`backgroundColor-${COMP}Badge--active`]: "$color-primary-500",
    [`textColor-${COMP}Badge--active`]: "$color-surface-0",
    [`backgroundColor-${COMP}Error`]: "rgb(from $color-danger-100 r g b / 0.65)",
    [`borderColor-${COMP}Error`]: "$color-danger-300",
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`backgroundColor-${COMP}--assistant`]: "transparent",
      [`backgroundColor-${COMP}--user`]: "rgb(from $color-primary-300 r g b / 0.24)",
      [`backgroundColor-${COMP}--system`]: "rgb(from $color-secondary-300 r g b / 0.20)",
      [`backgroundColor-${COMP}--tool`]: "rgb(from $color-attention-300 r g b / 0.20)",
      [`backgroundColor-${COMP}--streaming`]: "rgb(from $color-primary-300 r g b / 0.20)",
      [`backgroundColor-${COMP}Badge`]: "$color-surface-200",
      [`backgroundColor-${COMP}Error`]: "rgb(from $color-danger-300 r g b / 0.18)",
      [`borderColor-${COMP}Error`]: "$color-danger-400",
    },
  },
});

type ThemedAiMessagePartsProps = React.ComponentProps<typeof AiMessagePartsNative>;

const ThemedAiMessageParts = React.forwardRef<HTMLElement, ThemedAiMessagePartsProps>(
  function ThemedAiMessageParts({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(AiMessagePartsMd);
    return (
      <AiMessagePartsNative
        {...props}
        ref={ref}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
      />
    );
  },
);

export const aiMessagePartsComponentRenderer = wrapComponent(COMP, ThemedAiMessageParts, AiMessagePartsMd);
