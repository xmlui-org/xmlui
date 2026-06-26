import React, { forwardRef, memo, type CSSProperties } from "react";
import classnames from "classnames";

import styles from "./AiApprovalRequest.module.scss";
import type { AiApprovalRequest } from "../contract";

export type AiApprovalRequestDecisionPayload = {
  requestId: string;
  decisionPayload?: unknown;
};

export type AiApprovalRequestRejectPayload = {
  requestId: string;
  reason?: string;
};

export type AiApprovalRequestNativeProps = {
  request: AiApprovalRequest;
  running?: boolean;
  onApprove?: (value: AiApprovalRequestDecisionPayload) => void;
  onReject?: (value: AiApprovalRequestRejectPayload) => void;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
};

export const defaultProps = {
  running: false,
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusLabel(status: AiApprovalRequest["status"]) {
  return titleCase(status);
}

export const AiApprovalRequestNative = memo(
  forwardRef<HTMLDivElement, AiApprovalRequestNativeProps>(function AiApprovalRequestNative(
    { request, running = defaultProps.running, onApprove, onReject, className, classes, style },
    ref,
  ) {
    const isPending = request.status === "requested";
    const isResolved = !isPending;

    return (
      <section
        ref={ref}
        className={classnames(styles.root, classes?.["-component"], className)}
        style={style}
        data-status={request.status}
        data-running={running ? "true" : "false"}
      >
        <header className={classnames(styles.header, classes?.header)}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{request.title ?? "Approval request"}</span>
            <span className={classnames(styles.statusBadge, classes?.badge)}>{statusLabel(request.status)}</span>
          </div>
          <div className={styles.subtitle}>{running ? "Running" : "Awaiting decision"}</div>
        </header>

        <div className={classnames(styles.content, classes?.content)}>
          {request.reason ? (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Reason</div>
              <div className={styles.sectionValue}>{request.reason}</div>
            </div>
          ) : null}

          {request.details ? (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Details</div>
              <div className={styles.sectionValue}>{request.details}</div>
            </div>
          ) : null}

          {isResolved ? (
            <div className={styles.resolvedNote}>
              This request has been {statusLabel(request.status).toLowerCase()}.
            </div>
          ) : null}
        </div>

        {isPending ? (
          <footer className={classnames(styles.actions, classes?.actions)}>
            <button
              type="button"
              className={classnames(styles.rejectButton, classes?.rejectButton)}
              onClick={() => onReject?.({ requestId: request.id, reason: request.reason })}
            >
              Reject
            </button>
            <button
              type="button"
              className={classnames(styles.approveButton, classes?.approveButton)}
              onClick={() => onApprove?.({ requestId: request.id, decisionPayload: request.decisionPayload })}
            >
              Approve
            </button>
          </footer>
        ) : null}
      </section>
    );
  }),
);
