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
import { Button } from "../Button/ButtonNative";
import { Stack } from "../Stack/StackNative";
import { Dialog } from "./Dialog";

const ConfirmationModalContext = React.createContext({
  confirm: (title: string, message?: string, actionLabel?: string) => Promise.resolve(false),
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

type ConfirmParams = {
  message?: string;
  title: string;
  buttons: Array<ConfirmButtonParams>;
};

export const ConfirmationModalContextProvider = ({ children }: Props) => {
  // State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [title, setTitle] = useState<string>("Are you sure?");
  const [message, setMessage] = useState<string | undefined>();
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
    (title: string | ConfirmParams, message?: string, actionLabel?: string) => {
      if (typeof window !== "undefined") {
        const w = window as any;
        w._xsPendingConfirmTrace = w._xsCurrentTrace || w._xsLastInteraction?.id;
        // Trace confirmation modal show
        if (Array.isArray(w._xsLogs)) {
          const modalTitle = typeof title === "string" ? title : title.title;
          w._xsLogs.push({
            ts: Date.now(),
            perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
            traceId: w._xsCurrentTrace,
            kind: "modal:show",
            modalType: "confirmation",
            title: modalTitle,
          });
        }
      }
      if (typeof title === "string") {
        setTitle(title);
        setButtons([
          {
            label: actionLabel || "Ok",
            value: true,
          },
        ]);
        setMessage(message);
      } else {
        setTitle(title.title);
        setButtons(title.buttons);
        setMessage(title.message);
      }
      setShowConfirmationModal(true);
      return new Promise<boolean>(function (resolve) {
        resolver.current = resolve;
      });
    },
    [],
  );

  const handleOk = useCallback((value: any) => {
    // Trace confirmation
    if (typeof window !== "undefined") {
      const w = window as any;
      if (Array.isArray(w._xsLogs)) {
        // Restore trace context from when modal was shown
        if (w._xsPendingConfirmTrace) {
          w._xsCurrentTrace = w._xsPendingConfirmTrace;
        }
        w._xsLogs.push({
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: w._xsCurrentTrace,
          kind: "modal:confirm",
          modalType: "confirmation",
          value,
        });
      }
    }
    if (resolver.current) {
      resolver.current(value);
    }
    setShowConfirmationModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    // Trace cancellation
    if (typeof window !== "undefined") {
      const w = window as any;
      if (Array.isArray(w._xsLogs)) {
        // Restore trace context from when modal was shown
        if (w._xsPendingConfirmTrace) {
          w._xsCurrentTrace = w._xsPendingConfirmTrace;
        }
        w._xsLogs.push({
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: w._xsCurrentTrace,
          kind: "modal:cancel",
          modalType: "confirmation",
        });
      }
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
                Cancel
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
                        handleOk(value);
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
