import { createPortal } from "react-dom";
import { forwardRef, memo, useEffect, useMemo, useState, type CSSProperties, type ForwardedRef } from "react";

import type { XmluiDebugEvent } from "../../compiler/scriptSemantics";
import { getXmluiDebugBridge } from "../../runtime/debug";
import { defaultProps } from "./Inspector.defaults";

export type InspectorApi = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
};

export type InspectorProps = {
  src?: string;
  tooltip?: string;
  dialogTitle?: string;
  dialogWidth?: string;
  dialogHeight?: string;
  className?: string;
  style?: CSSProperties;
  testId?: string;
  registerApi?: (api: Record<string, unknown>) => void;
};

export const InspectorComponent = memo(forwardRef(function InspectorComponent(
  {
    src = defaultProps.src,
    tooltip = defaultProps.tooltip,
    dialogTitle = defaultProps.dialogTitle,
    dialogWidth = defaultProps.dialogWidth,
    dialogHeight = defaultProps.dialogHeight,
    className,
    style,
    testId,
    registerApi,
  }: InspectorProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
) {
  const [openState, setOpenState] = useState(false);
  const [events, setEvents] = useState<XmluiDebugEvent[]>([]);

  useEffect(() => {
    const bridge = getXmluiDebugBridge();
    return bridge?.subscribe((event) => {
      setEvents((previous) => [...previous.slice(-19), event]);
    });
  }, []);

  const api = useMemo<InspectorApi>(() => ({
    open: () => {
      setOpenState(true);
    },
    close: () => {
      setOpenState(false);
    },
    isOpen: () => openState,
  }), [openState]);

  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  useEffect(() => {
    if (!openState) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenState(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openState]);

  return (
    <>
      <button
        ref={forwardedRef}
        aria-label="Inspector"
        className={["xmluiInspectorIconButton", className].filter(Boolean).join(" ")}
        data-testid={testId ?? "Inspector"}
        data-xmlui-component="Inspector"
        onClick={() => setOpenState(true)}
        role="button"
        style={style}
        title={tooltip}
        type="button"
      >
        <span aria-hidden="true" className="xmluiInspectorIcon">i</span>
      </button>
      {openState && typeof document !== "undefined"
        ? createPortal(
          <div
            className="xmluiInspectorOverlay"
            data-testid="InspectorDialog"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpenState(false);
              }
            }}
          >
            <div
              aria-label={dialogTitle}
              aria-modal="true"
              className="xmluiInspectorDialog"
              role="dialog"
              style={{ minWidth: dialogWidth, minHeight: dialogHeight }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="xmluiInspectorHeader">
                <span className="xmluiInspectorTitle">{dialogTitle}</span>
                <button aria-label="Close" className="xmluiInspectorCloseButton" onClick={() => setOpenState(false)} type="button">x</button>
              </header>
              <div className="xmluiInspectorDialogBody">
                <iframe className="xmluiInspectorFrame" data-testid="InspectorFrame" src={normalizePath(src)} title={dialogTitle} />
                <section className="xmluiInspectorEvents" data-testid="InspectorEvents" aria-label="Inspector debug events">
                  {events.length === 0 ? (
                    <p className="xmluiInspectorEventItem">No debug events captured.</p>
                  ) : events.map((event, index) => (
                    <pre className="xmluiInspectorEventItem" key={`${event.metadata.timestamp}-${index}`}>
                      {formatEvent(event)}
                    </pre>
                  ))}
                </section>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}));

function normalizePath(src: string | undefined): string {
  const value = src || defaultProps.src;
  return value.startsWith("/") ? value : `/${value}`;
}

function formatEvent(event: XmluiDebugEvent): string {
  const label = event.label === undefined ? "" : ` ${String(event.label)}`;
  const value = event.value === undefined ? "" : ` = ${safeJson(event.value)}`;
  return `${event.kind}${label}${value}`;
}

function safeJson(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}
