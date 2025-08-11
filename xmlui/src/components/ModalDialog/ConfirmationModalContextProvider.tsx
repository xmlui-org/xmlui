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
  confirm: async (title: string, message?: string, actionLabel?: string) => false,
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
    async (title: string | ConfirmParams, message?: string, actionLabel?: string) => {
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
    if (resolver.current) {
      resolver.current(value);
    }
    setShowConfirmationModal(false);
  }, []);

  const handleCancel = useCallback(() => {
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
