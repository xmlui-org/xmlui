import React, {
  CSSProperties,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";
import * as Dialog from "@radix-ui/react-dialog";

import styles from "./ModalDialog.module.scss";
import { useTheme, useEvent } from "xmlui";
import { ModalVisibilityContext } from "./ModalVisibilityContext";

// Default props for ModalDialog component
export const defaultProps = {
  fullScreen: false,
  closeButtonVisible: true,
};

// =====================================================================================================================
// React component definition

type OnClose = (...args: any[]) => Promise<boolean | undefined | void> | boolean | undefined | void;
type OnOpen = (...args: any[]) => void;
type ModalProps = {
  isInitiallyOpen?: boolean;
  style?: CSSProperties;
  onClose?: OnClose;
  onOpen?: OnOpen;
  children?: ReactNode;
  title?: ReactNode;
};

const ModalStateContext = React.createContext(null);

function useModalLocalOpenState(isInitiallyOpen: boolean, onOpen?: OnOpen, onClose?: OnClose) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const isClosing = useRef(false);
  const [openParams, setOpenParams] = useState(null);

  const doOpen = useEvent((...openParams: any) => {
    setOpenParams(openParams);
    onOpen?.();
    setIsOpen(true);
  });

  const doClose = useEvent(async () => {
    if (!isClosing.current) {
      try {
        isClosing.current = true;
        const result = await onClose?.();
        if (result === false) {
          return;
        }
      } finally {
        isClosing.current = false;
      }
    }
    setIsOpen(false);
  });

  return useMemo(() => {
    return {
      isOpen,
      doClose,
      doOpen,
      openParams,
    };
  }, [doClose, doOpen, isOpen, openParams]);
}

function useModalOpenState(isInitiallyOpen = true, onOpen?: OnOpen, onClose?: OnClose) {
  const modalStateContext = useContext(ModalStateContext);
  const modalLocalOpenState = useModalLocalOpenState(isInitiallyOpen, onOpen, onClose);
  return modalStateContext || modalLocalOpenState;
}

export const ModalDialog = React.forwardRef(
  ({ children, style, isInitiallyOpen, title, onOpen, onClose }: ModalProps, ref) => {
    const { root } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const composedRef = ref ? composeRefs(ref, modalRef) : modalRef;

    const { isOpen, doClose, doOpen } = useModalOpenState(isInitiallyOpen, onOpen, onClose);

    useEffect(() => {
      if (isOpen) {
        modalRef.current?.focus();
      }
    }, [isOpen]);

    // https://github.com/radix-ui/primitives/issues/2122#issuecomment-2140827998
    useEffect(() => {
      if (isOpen) {
        // Pushing the change to the end of the call stack
        const timer = setTimeout(() => {
          document.body.style.pointerEvents = "";
        }, 0);

        return () => clearTimeout(timer);
      } else {
        document.body.style.pointerEvents = "auto";
      }
    }, [isOpen]);

    const modalVisibilityContextValue = useMemo(() => {
      return {
        requestClose: () => {
          return doClose();
        },
      };
    }, [doClose]);

    if (!root) {
      return null;
    }

    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? doOpen() : doClose())}>
        <Dialog.Portal container={root}>
          <div className={styles.overlayBg} />
          <Dialog.Overlay className={classnames(styles.overlay)}>
            <Dialog.Content
              className={classnames(styles.content)}
              onPointerDownOutside={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("._debug-inspect-button") !== null
                ) {
                  //we prevent the auto modal close on clicking the inspect button
                  event.preventDefault();
                }
              }}
              ref={composedRef}
              style={{ ...style, gap: undefined }}
            >
              {!!title && (
                <Dialog.Title style={{ marginTop: 0 }}>
                  <header id="dialogTitle" className={styles.dialogTitle}>
                    {title}
                  </header>
                </Dialog.Title>
              )}
              <div className={styles.innerContent} style={{ gap: style?.gap }}>
                <ModalVisibilityContext.Provider value={modalVisibilityContextValue}>
                  {children}
                </ModalVisibilityContext.Provider>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

ModalDialog.displayName = "ModalDialog";
