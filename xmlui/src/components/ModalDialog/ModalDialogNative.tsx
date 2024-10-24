import type { CSSProperties, ReactNode } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ModalDialog.module.scss";
import classnames from "@components-core/utils/classnames";
import { Icon } from "@components/Icon/IconNative";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { useTheme } from "@components-core/theming/ThemeContext";
import { Button } from "@components/Button/ButtonNative";
import { useEvent } from "@components-core/utils/misc";
import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalVisibilityContext } from "./ModalVisibilityContext";

// =====================================================================================================================
// React component definition

type ModalProps = {
  isInitiallyOpen?: boolean;
  style?: CSSProperties;
  onClose?: (...args: any[]) => Promise<boolean | undefined | void> | boolean | undefined | void;
  onOpen?: (...args: any[]) => void;
  children?: ((modalContext: any) => ReactNode) | ReactNode;
  portalTo?: HTMLElement;
  fullScreen?: boolean;
  title?: string;
  registerComponentApi?: RegisterComponentApiFn;
  closeButtonVisible?: boolean;
};

export const ModalDialog = React.forwardRef(
  (
    {
      children,
      style,
      isInitiallyOpen,
      onClose,
      onOpen,
      fullScreen,
      title,
      registerComponentApi,
      closeButtonVisible = true,
    }: ModalProps,
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const isClosing = useRef(false);
    const { root } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const composedRef = ref ? composeRefs(ref, modalRef) : modalRef;
    const [modalContext, setModalContext] = useState(null);

    useEffect(() => {
      if (isOpen) {
        containerRef.current?.focus();
      }
    }, [isOpen]);

    const doOpen = useEvent((modalContext?: any) => {
      setModalContext(modalContext);
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

    useEffect(() => {
      registerComponentApi?.({
        open: doOpen,
        close: doClose,
      });
    }, [doClose, doOpen, registerComponentApi]);

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
              style={style}
            >
              {!!title && (
                <Dialog.Title style={{ marginTop: 0 }}>
                  <header id="dialogTitle" className={styles.dialogTitle}>
                    {title}
                  </header>
                </Dialog.Title>
              )}
              <div className={styles.innerContent}>
                <ModalVisibilityContext.Provider value={modalVisibilityContextValue}>
                  {isOpen && (typeof children === "function" ? children?.(modalContext) : children)}
                </ModalVisibilityContext.Provider>
              </div>
              {closeButtonVisible && (
                <Dialog.Close asChild={true}>
                  <Button
                    onClick={doClose}
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
