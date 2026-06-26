import React from "react";
import { createMetadata, parseScssVar, useComponentThemeClass, wrapComponent } from "xmlui";

import styles from "./AiApprovalRequest.module.scss";
import {
  AiApprovalRequestNative,
  defaultProps,
} from "./AiApprovalRequestNative";

const COMP = "AiApprovalRequest";

export const AiApprovalRequestMd = createMetadata({
  status: "experimental",
  description:
    "`AiApprovalRequest` renders a normalized approval request with pending and resolved states, and emits approve/reject decisions.",
  props: {
    request: {
      description: "The normalized approval request to render.",
      valueType: "any",
    },
    running: {
      description: "Indicates whether the parent run is still active.",
      valueType: "boolean",
      defaultValue: defaultProps.running,
    },
  },
  events: {
    approve: {
      description: "Emitted when the user approves the request.",
      signature: "approve(value: { requestId: string; decisionPayload?: unknown }): void",
      parameters: {
        value: "The approval decision payload.",
      },
    },
    reject: {
      description: "Emitted when the user rejects the request.",
      signature: "reject(value: { requestId: string; reason?: string }): void",
      parameters: {
        value: "The rejection payload.",
      },
    },
  },
  parts: {
    header: { description: "The request header region." },
    badge: { description: "The status badge." },
    content: { description: "The request body." },
    actions: { description: "The action button row." },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$borderColor",
    [`backgroundColor-${COMP}--requested`]: "rgb(from $color-secondary-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--approved`]: "rgb(from $color-success-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--rejected`]: "rgb(from $color-danger-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--edited`]: "rgb(from $color-primary-100 r g b / 0.45)",
    [`backgroundColor-${COMP}--expired`]: "rgb(from $color-surface-100 r g b / 0.6)",
    [`backgroundColor-${COMP}--failed`]: "rgb(from $color-danger-100 r g b / 0.55)",
    [`backgroundColor-${COMP}Badge`]: "$color-surface-100",
    [`backgroundColor-${COMP}Badge--active`]: "$color-primary-500",
    [`textColor-${COMP}Badge--active`]: "$color-surface-0",
    [`backgroundColor-${COMP}Approve`]: "$color-success-600",
    [`backgroundColor-${COMP}Approve--hover`]: "$color-success-500",
    [`backgroundColor-${COMP}Reject`]: "$color-danger-600",
    [`backgroundColor-${COMP}Reject--hover`]: "$color-danger-500",
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`backgroundColor-${COMP}--requested`]: "rgb(from $color-secondary-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--approved`]: "rgb(from $color-success-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--rejected`]: "rgb(from $color-danger-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--edited`]: "rgb(from $color-primary-300 r g b / 0.18)",
      [`backgroundColor-${COMP}--expired`]: "$color-surface-200",
      [`backgroundColor-${COMP}--failed`]: "rgb(from $color-danger-300 r g b / 0.18)",
    },
  },
});

type ThemedAiApprovalRequestProps = React.ComponentProps<typeof AiApprovalRequestNative>;

const ThemedAiApprovalRequest = React.forwardRef<HTMLDivElement, ThemedAiApprovalRequestProps>(
  function ThemedAiApprovalRequest({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(AiApprovalRequestMd);
    return (
      <AiApprovalRequestNative
        {...props}
        ref={ref}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
      />
    );
  },
);

export const aiApprovalRequestComponentRenderer = wrapComponent(COMP, ThemedAiApprovalRequest, AiApprovalRequestMd, {
  events: {
    approve: "onApprove",
    reject: "onReject",
  },
});
