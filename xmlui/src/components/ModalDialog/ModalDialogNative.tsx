import React, {
  CSSProperties,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./ModalDialog.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import { Icon } from "../Icon/IconNative";
import { Button } from "../Button/ButtonNative";
import { ModalVisibilityContext } from "./ModalVisibilityContext";

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
  fullScreen?: boolean;
  title?: string;
  closeButtonVisible?: boolean;
};

type ModalDialogFrameProps = {
  isInitiallyOpen?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  onClose?: OnClose;
  onOpen?: OnOpen;
  renderDialog?: (modalContext?: any) => ReactNode;
};

export const ModalDialogFrame = React.forwardRef(
  (
    { isInitiallyOpen, onOpen, onClose, registerComponentApi, renderDialog }: ModalDialogFrameProps,
    ref,
  ) => {
    const modalContextStateValue = useModalLocalOpenState(isInitiallyOpen, onOpen, onClose);
    const { doOpen, doClose, isOpen, openParams } = modalContextStateValue;

    useEffect(() => {
      registerComponentApi?.({
        open: doOpen,
        close: doClose,
      });
    }, [doClose, doOpen, registerComponentApi]);

    return isOpen ? (
      <ModalStateContext.Provider value={modalContextStateValue}>
        {renderDialog({
          openParams,
          ref,
        })}
      </ModalStateContext.Provider>
    ) : null;
  },
);

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
  (
    {
      children,
      style,
      isInitiallyOpen,
      fullScreen,
      title,
      closeButtonVisible = true,
      onOpen,
      onClose,
    }: ModalProps,
    ref,
  ) => {
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

    const registeredForms = useRef(new Set());
    const modalVisibilityContextValue = useMemo(() => {
      return {
        registerForm: (id: string) => {
          registeredForms.current.add(id);
        },
        unRegisterForm: (id: string) => {
          registeredForms.current.delete(id);
        },
        amITheSingleForm: (id) => {
          return registeredForms.current.size === 1 && registeredForms.current.has(id);
        },
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
          {!fullScreen && <div className={styles.overlayBg} />}
          <Dialog.Overlay
            className={classnames(styles.overlay, {
              [styles.fullScreen]: fullScreen,
            })}
          >
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
              {closeButtonVisible && (
                <Dialog.Close asChild={true}>
                  <Button
                    variant={"ghost"}
                    themeColor={"secondary"}
                    className={styles.closeButton}
                    aria-label="Close"
                    icon={<Icon name={"close"} size={"sm"} />}
                    orientation={"vertical"}
                  />
                </Dialog.Close>
              )}
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

ModalDialog.displayName = "ModalDialog";
