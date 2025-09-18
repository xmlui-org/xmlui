import React, {
  type CSSProperties,
  type ReactNode,
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

const PART_TITLE = "title";
const PART_CONTENT = "content";

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
  className?: string;
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
ModalDialogFrame.displayName = "ModalDialogFrame";

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
      fullScreen = defaultProps.fullScreen,
      title,
      closeButtonVisible = defaultProps.closeButtonVisible,
      className,
      onOpen,
      onClose,
      ...rest
    }: ModalProps,
    ref,
  ) => {
    const { root } = useTheme();
    // NOTE: at this point, we can't use useAppContext here,
    // since the ModalDialog context provider (via ConfirmationModalContextProvider) is mounted outside of the AppContext,
    // and ModalDialogs can also be called using the imperative API (see functions like "confirm")
    // String-based type checking: Use constructor.name to identify ShadowRoot
    // This avoids direct ShadowRoot type dependency while being more explicit than duck typing
    const isDialogRootInShadowDom =
      typeof ShadowRoot !== "undefined" && root?.getRootNode() instanceof ShadowRoot;
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
        amITheSingleForm: (id: string) => {
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

    const Content = (
      <Dialog.Content
        {...rest}
        data-part-id={PART_CONTENT}
        className={classnames(styles.content, className)}
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
            <header id="dialogTitle" className={styles.dialogTitle} data-part-id={PART_TITLE}>
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
    );

    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? doOpen() : doClose())}>
        <Dialog.Portal container={root}>
          {isDialogRootInShadowDom && (
            /*
              In the Shadow DOM we can omit the Dialog.Overlay,
              since we get the same result & the main content outside remains scrollable.
            */
            <div
              className={classnames(styles.overlayBg, styles.nested, {
                [styles.fullScreen]: fullScreen,
              })}
            >
              {Content}
            </div>
          )}
          {!isDialogRootInShadowDom && (
            <>
              <div className={classnames(styles.overlayBg)} />
              {/* This Overlay is responsible for the focus capture & scroll-lock */}
              <Dialog.Overlay
                className={classnames(styles.overlay, {
                  [styles.fullScreen]: fullScreen,
                })}
              >
                {Content}
              </Dialog.Overlay>
            </>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

ModalDialog.displayName = "ModalDialog";
