import React, {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ButtonVariant, ButtonThemeColor } from "../abstractions";
import { ThemedButton as Button } from "../Button/Button";
import { ThemedStack as Stack } from "../Stack/Stack";
import { Dialog } from "./Dialog";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";

const ConfirmationModalContext = React.createContext({
  confirm: (_title?: string, _message?: string, _actionLabel?: string, _cancelLabel?: string) =>
    Promise.resolve(false),
});

export const useConfirm = () => useContext(ConfirmationModalContext);

type Props = {
  children: ReactNode;
};

type ConfirmButtonParams = {
  variant?: ButtonVariant;
  themeColor?: ButtonThemeColor;
  label: string;
  value: any;
};

// Check if verbose tracing is active by looking for window._xsLogs directly.
// We can't use useAppContext() here because ConfirmationModalContextProvider
// is mounted above AppContext in the component tree.
function isTracingActive(): boolean {
  return typeof window !== "undefined" && Array.isArray((window as any)._xsLogs);
}

export const ConfirmationModalContextProvider = ({ children }: Props) => {
  // State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [title, setTitle] = useState<string>("Are you sure?");
  const [message, setMessage] = useState<string | undefined>();
  const [cancelLabel, setCancelLabel] = useState<string>("Cancel");
  const [buttons, setButtons] = useState<Array<ConfirmButtonParams>>([]);
  // Refs and other
  const resolver = useRef<((confirmationResult: boolean) => void) | null>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showConfirmationModal) {
      setTimeout(() => {
        const focusable: NodeListOf<HTMLButtonElement> | undefined =
          buttonsRef.current?.querySelectorAll("button");
        if (focusable) {
          focusable[focusable.length - 1].focus();
        }
      }, 0);
    }
  }, [showConfirmationModal]);

  const handleShow = useCallback(
    (
      title = "Confirm Operation",
      message = "Are you sure you want to perform this operation?",
      actionLabel = "Yes",
      cancelLabel = "Cancel",
    ) => {
      // Trace confirmation modal show
      if (isTracingActive()) {
        const w = window as any;
        w._xsPendingConfirmTrace = w._xsCurrentTrace || w._xsLastInteraction?.id;
        pushXsLog({
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: w._xsCurrentTrace,
          kind: "modal:show",
          modalType: "confirmation",
          title,
          buttons: [
            { label: actionLabel, value: true },
            { label: cancelLabel, value: false },
          ],
        });
      }
      setTitle(title);
      setButtons([{ label: actionLabel, value: true }]);
      setMessage(message);
      setCancelLabel(cancelLabel);
      setShowConfirmationModal(true);
      return new Promise<boolean>(function (resolve) {
        resolver.current = resolve;
      });
    },
    [],
  );

  const handleOk = useCallback((value: any, buttonLabel?: string) => {
    // Trace confirmation
    if (isTracingActive()) {
      const w = window as any;
      // Restore trace context from when modal was shown
      if (w._xsPendingConfirmTrace) {
        w._xsCurrentTrace = w._xsPendingConfirmTrace;
      }
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: w._xsCurrentTrace,
        kind: "modal:confirm",
        modalType: "confirmation",
        value,
        buttonLabel,
      });
    }
    if (resolver.current) {
      resolver.current(value);
    }
    setShowConfirmationModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    // Trace cancellation
    if (isTracingActive()) {
      const w = window as any;
      // Restore trace context from when modal was shown
      if (w._xsPendingConfirmTrace) {
        w._xsCurrentTrace = w._xsPendingConfirmTrace;
      }
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: w._xsCurrentTrace,
        kind: "modal:cancel",
        modalType: "confirmation",
      });
    }
    if (resolver.current) {
      resolver.current(false);
    }
    setShowConfirmationModal(false);
  }, []);

  const contextValue = useMemo(() => {
    return {
      confirm: handleShow,
    };
  }, [handleShow]);

  return (
    <ConfirmationModalContext.Provider value={contextValue}>
      {children}

      {showConfirmationModal && (
        <Dialog
          title={title}
          description={message}
          isOpen={true}
          onClose={handleCancel}
          buttons={
            <Stack
              orientation="horizontal"
              horizontalAlignment="end"
              style={{ width: "100%", gap: "1em" }}
              ref={buttonsRef}
            >
              <Button variant="ghost" themeColor="secondary" size="sm" onClick={handleCancel}>
                {cancelLabel}
              </Button>
              {buttons.length > 1 ? <div style={{ flex: 1 }} /> : undefined}
              {buttons.map(
                ({ label, value, variant = "solid", themeColor = "attention" }, index) => {
                  return (
                    <Button
                      key={index}
                      variant={variant}
                      themeColor={themeColor}
                      size="sm"
                      type="submit"
                      onClick={() => {
                        handleOk(value, label);
                      }}
                    >
                      {label}
                    </Button>
                  );
                },
              )}
            </Stack>
          }
        />
      )}
    </ConfirmationModalContext.Provider>
  );
};
