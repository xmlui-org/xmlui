import React, { useEffect, useRef, useState, forwardRef, memo, type ForwardedRef } from "react";
import { createPortal } from "react-dom";
import classnames from "classnames";

import styles from "./Inspector.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { normalizePath } from "../../components-core/utils/misc";
import { createLogEntry, pushXsLog } from "../../components-core/inspector/inspectorUtils";
import SearchCodeIcon from "../Icon/svg/l-search-code.svg?react";
import {
  checkLocalViewer,
  parseRuntimeVersion,
  resolveViewer,
  type ResolveFailure,
} from "./inspectorResolver";

type Props = {
  src?: string;
  tooltip?: string;
  dialogTitle?: string;
  dialogWidth?: string;
  dialogHeight?: string;
  fetchMissing?: boolean;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
};

import { defaultProps } from "./Inspector.defaults";

/**
 * What the dialog body shows:
 * - `frame`: a plain iframe on `src` (default, no opt-in);
 * - `srcDoc`: the resolved viewer HTML (`fetchMissing`);
 * - `loading` / `error`: a message instead of an empty frame.
 */
type ViewerState =
  | { kind: "frame" }
  | { kind: "loading" }
  | { kind: "srcDoc"; srcDoc: string }
  | { kind: "error"; failure: ResolveFailure };

function toAbsoluteUrl(path: string, ownerDocument: Document | null): string {
  const base = ownerDocument?.defaultView?.location.href ?? window.location.href;
  return new URL(normalizePath(path), base).href;
}

export const Inspector = memo(forwardRef(function Inspector(
  {
    src = defaultProps.src,
    tooltip = defaultProps.tooltip,
    dialogTitle = defaultProps.dialogTitle,
    dialogWidth = defaultProps.dialogWidth,
    dialogHeight = defaultProps.dialogHeight,
    fetchMissing = defaultProps.fetchMissing,
    classes,
    registerComponentApi,
  }: Props,
  forwardedRef: ForwardedRef<HTMLSpanElement>,
) {
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState<ViewerState>(
    fetchMissing ? { kind: "loading" } : { kind: "frame" },
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);
  // Resolution runs once per `src` / `fetchMissing`; reopening the dialog reuses it.
  const resolvedKeyRef = useRef<string | null>(null);

  const setButtonRef = (node: HTMLSpanElement | null) => {
    buttonRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
      close: () => setOpen(false),
    });
  }, [registerComponentApi]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const ownerDocument = buttonRef.current?.ownerDocument ?? (typeof document !== "undefined" ? document : null);

  useEffect(() => {
    if (!open) return;
    const key = `${fetchMissing ? "fetch" : "local"}|${src}`;
    if (resolvedKeyRef.current === key) return;
    resolvedKeyRef.current = key;

    let cancelled = false;
    const localViewerUrl = toAbsoluteUrl(src, ownerDocument);

    if (!fetchMissing) {
      // Default: no network access beyond the app's own origin. The iframe renders at
      // once; a missing local file swaps it for a message instead of an empty frame.
      setViewer({ kind: "frame" });
      checkLocalViewer(localViewerUrl).then((failure) => {
        if (!cancelled && failure) setViewer({ kind: "error", failure });
      });
      return () => {
        cancelled = true;
      };
    }

    setViewer({ kind: "loading" });
    const version = parseRuntimeVersion(import.meta.env.VITE_XMLUI_VERSION);
    resolveViewer({ localViewerUrl, version }).then((result) => {
      for (const r of result.resolutions) {
        pushXsLog(
          createLogEntry("inspector:resolve", {
            file: r.file,
            source: r.source,
            url: r.url,
          }),
        );
      }
      if (result.status === "failed") {
        pushXsLog(
          createLogEntry("inspector:resolve", {
            file: result.failure.file,
            source: "missing",
            tried: result.failure.tried,
            ...(version ? {} : { note: "no runtime version; CDN fallback disabled" }),
          }),
        );
      }
      if (cancelled) return;
      setViewer(
        result.status === "ok"
          ? { kind: "srcDoc", srcDoc: result.srcDoc }
          : { kind: "error", failure: result.failure },
      );
    });
    return () => {
      cancelled = true;
      // Let the next open retry if this one was interrupted.
      resolvedKeyRef.current = null;
    };
  }, [open, src, fetchMissing, ownerDocument]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  let body: React.ReactNode;
  switch (viewer.kind) {
    case "frame":
      body = (
        <iframe src={normalizePath(src)} className={styles.iframe} data-testid="InspectorFrame" />
      );
      break;
    case "srcDoc":
      body = <iframe srcDoc={viewer.srcDoc} className={styles.iframe} data-testid="InspectorFrame" />;
      break;
    case "loading":
      body = (
        <div className={styles.message} data-testid="InspectorMessage">
          Loading Inspector…
        </div>
      );
      break;
    case "error":
      body = (
        <div className={styles.message} role="alert" data-testid="InspectorError">
          <div>
            The Inspector could not load <code>{viewer.failure.file}</code>. Tried:
          </div>
          <ul className={styles.messageUrls}>
            {viewer.failure.tried.map((url) => (
              <li key={url}>{url}</li>
            ))}
          </ul>
          {!fetchMissing && (
            <div>
              Copy the file next to the app, or set <code>fetchMissing="true"</code> on{" "}
              <code>Inspector</code> to load it from the CDN.
            </div>
          )}
        </div>
      );
      break;
  }

  const dialog = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-testid="InspectorDialog"
    >
      <div
        className={styles.dialog}
        style={{ minWidth: dialogWidth, minHeight: dialogHeight }}
      >
        <div className={styles.header}>
          <span className={styles.title}>{dialogTitle}</span>
          <button className={styles.closeButton} onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>
        {body}
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={setButtonRef}
        className={classnames(styles.iconButton, classes?.[COMPONENT_PART_KEY])}
        onClick={() => setOpen(true)}
        title={tooltip}
        role="button"
        aria-label="Inspector"
        data-testid="Inspector"
      >
        <SearchCodeIcon className={styles.icon} />
      </span>
      {open && ownerDocument?.body && createPortal(dialog, ownerDocument.body)}
    </>
  );
}));
