import { createContext, useState, type ReactNode } from "react";
import { noop } from "lodash-es";
import * as RadixToast from "@radix-ui/react-toast";
import styles from "./Toast.module.scss";
import { MdOutlineClose } from "react-icons/md";
import classnames from "classnames";

type ToastMessage = {
  type: "success" | "warning" | "error" | "info";
  title?: string;
  description: string;
};

type ToastContextDefinition = {
  toastMessage: ToastMessage | null;
  showToast: (toastMessage: ToastMessage) => void;
};

export const ToastContext = createContext<ToastContextDefinition>({
  toastMessage: null,
  showToast: noop,
});

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = (toastMessage: ToastMessage) => {
    setToastMessage(toastMessage);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ toastMessage, showToast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        <RadixToast.Root
          open={open}
          onOpenChange={setOpen}
          className={classnames(styles.ToastRoot, {
            [styles.success]: toastMessage?.type === "success",
            [styles.warning]: toastMessage?.type === "warning",
            [styles.error]: toastMessage?.type === "error",
          })}
        >
          <RadixToast.Close className={styles.ToastClose}>
            <MdOutlineClose />
          </RadixToast.Close>
          {toastMessage?.title && (
            <RadixToast.Title className={styles.ToastTitle}>{toastMessage?.title}</RadixToast.Title>
          )}
          <RadixToast.Description className={styles.ToastDescription} asChild>
            <div>{toastMessage?.description}</div>
          </RadixToast.Description>
        </RadixToast.Root>
        <RadixToast.Viewport className={styles.ToastViewport} />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};
