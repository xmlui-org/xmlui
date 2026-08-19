import React, {
  type CSSProperties,
  type ReactNode,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./ModalDialog.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedButton as Button } from "../Button/Button";
import { ModalVisibilityContext } from "./ModalVisibilityContext";
import { Part } from "../Part/Part";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import { defaultProps } from "./ModalDialog.defaults";

// Part IDs for theming
const PART_TITLE = "title";
const PART_CONTENT = "content";

// =====================================================================================================================
// React component definition

type OnClose = (...args: any[]) => Promise<boolean | undefined | void> | boolean | undefined | void;
type OnOpen = (...args: any[]) => void;
type CloseGuard = () => Promise<boolean | undefined | void> | boolean | undefined | void;
type OnDirtyChanged = (dirty: boolean) => void;
type ModalStateValue = {
  isOpen?: boolean;
  doClose: () => Promise<void>;
  doOpen: (...openParams: any[]) => void;
  setDirty: (dirty: boolean) => void;
  getDirty: () => boolean;
  setFormDirty: (formId: string, dirty: boolean) => void;
  removeFormDirty: (formId: string) => void;
  registerCloseGuard: (closeGuard?: CloseGuard) => () => void;
  registerDirtyChanged: (onDirtyChanged?: OnDirtyChanged) => () => void;
  openParams: any[] | null;
};
type ModalProps = {
  isInitiallyOpen?: boolean;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  onClose?: OnClose;
  onWillClose?: CloseGuard;
  onOpen?: OnOpen;
  onDirtyChanged?: OnDirtyChanged;
  confirm?: AppContextObject["confirm"];
  children?: ReactNode;
  fullScreen?: boolean;
  title?: string;
  titleTemplate?: ReactNode;
  closeButtonVisible?: boolean;
  closeOnClickAway?: boolean;
  skipDirtyConfirmation?: boolean;
  confirmCloseTitle?: string;
  canCloseMessage?: string;
  confirmCloseLabel?: string;
  cancelCloseLabel?: string;
  externalAnimation?: boolean;
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
    const { doOpen, doClose, setDirty, getDirty, openParams } = modalContextStateValue;

    useEffect(() => {
      registerComponentApi?.({
        open: doOpen,
        close: doClose,
        setDirty,
        getDirty,
      });
    }, [doClose, doOpen, getDirty, registerComponentApi, setDirty]);

    return (
      <ModalStateContext.Provider value={modalContextStateValue}>
        {renderDialog({
          openParams,
          ref,
        })}
      </ModalStateContext.Provider>
    );
  },
);

const ModalStateContext = React.createContext<ModalStateValue | null>(null);

function useModalLocalOpenState(
  isInitiallyOpen?: boolean,
  onOpen?: OnOpen,
  onClose?: OnClose,
): ModalStateValue {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const isClosing = useRef(false);
  const isDirtyRef = useRef(false);
  const formDirtyRef = useRef(new Map<string, boolean>());
  const closeGuardRef = useRef<CloseGuard | undefined>();
  const dirtyChangedRef = useRef<OnDirtyChanged | undefined>();
  const lastReportedDirtyRef = useRef(false);
  const [openParams, setOpenParams] = useState<any[] | null>(null);

  const getDirty = useEvent(() => {
    if (isDirtyRef.current) {
      return true;
    }
    return Array.from(formDirtyRef.current.values()).some((dirty) => dirty);
  });

  const notifyDirtyChanged = useEvent(() => {
    const dirty = getDirty();
    if (dirty !== lastReportedDirtyRef.current) {
      lastReportedDirtyRef.current = dirty;
      dirtyChangedRef.current?.(dirty);
    }
  });

  const doOpen = useEvent((...openParams: any) => {
    isDirtyRef.current = false;
    formDirtyRef.current.clear();
    notifyDirtyChanged();
    setOpenParams(openParams);
    onOpen?.();
    setIsOpen(true);
  });

  const setDirty = useEvent((dirty: boolean) => {
    isDirtyRef.current = dirty === true;
    notifyDirtyChanged();
  });

  const setFormDirty = useEvent((formId: string, dirty: boolean) => {
    formDirtyRef.current.set(formId, dirty === true);
    notifyDirtyChanged();
  });

  const removeFormDirty = useEvent((formId: string) => {
    formDirtyRef.current.delete(formId);
    notifyDirtyChanged();
  });

  const registerCloseGuard = useEvent((closeGuard?: CloseGuard) => {
    closeGuardRef.current = closeGuard;
    return () => {
      if (closeGuardRef.current === closeGuard) {
        closeGuardRef.current = undefined;
      }
    };
  });

  const registerDirtyChanged = useEvent((onDirtyChanged?: OnDirtyChanged) => {
    dirtyChangedRef.current = onDirtyChanged;
    return () => {
      if (dirtyChangedRef.current === onDirtyChanged) {
        dirtyChangedRef.current = undefined;
      }
    };
  });

  const doClose = useEvent(async () => {
    if (!isClosing.current) {
      try {
        isClosing.current = true;
        const result = closeGuardRef.current
          ? await closeGuardRef.current()
          : await onClose?.();
        if (result === false) {
          return;
        }
        isDirtyRef.current = false;
        formDirtyRef.current.clear();
        notifyDirtyChanged();
        setIsOpen(false);
      } finally {
        isClosing.current = false;
      }
    }
  });

  return useMemo(() => {
    return {
      isOpen,
      doClose,
      doOpen,
      setDirty,
      getDirty,
      setFormDirty,
      removeFormDirty,
      registerCloseGuard,
      registerDirtyChanged,
      openParams,
    };
  }, [
    doClose,
    doOpen,
    getDirty,
    isOpen,
    openParams,
    registerCloseGuard,
    registerDirtyChanged,
    removeFormDirty,
    setDirty,
    setFormDirty,
  ]);
}
function useModalOpenState(isInitiallyOpen = true, onOpen?: OnOpen, onClose?: OnClose) {
  const modalStateContext = useContext(ModalStateContext);
  const modalLocalOpenState = useModalLocalOpenState(isInitiallyOpen, onOpen, onClose);

  if (!modalStateContext) {
    return modalLocalOpenState;
  }

  return modalStateContext;
}

export const ModalDialog = memo(React.forwardRef(
  (
    {
      children,
      style,
      isInitiallyOpen,
      fullScreen = defaultProps.fullScreen,
      title,
      titleTemplate,
      closeButtonVisible = defaultProps.closeButtonVisible,
      closeOnClickAway = defaultProps.closeOnClickAway,
      skipDirtyConfirmation = defaultProps.skipDirtyConfirmation,
      className,
      classes,
      onOpen,
      onClose,
      onWillClose,
      onDirtyChanged,
      confirm,
      confirmCloseTitle = defaultProps.confirmCloseTitle,
      canCloseMessage = defaultProps.canCloseMessage,
      confirmCloseLabel = defaultProps.confirmCloseLabel,
      cancelCloseLabel = defaultProps.cancelCloseLabel,
      externalAnimation = true,
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

    const modalStateContext = useContext(ModalStateContext);
    const {
      isOpen,
      doClose,
      doOpen,
      setDirty,
      getDirty,
      setFormDirty,
      removeFormDirty,
      registerCloseGuard,
      registerDirtyChanged,
    } = useModalOpenState(isInitiallyOpen, onOpen, onClose);

    const confirmDirtyClose = useEvent(async () => {
      if (confirm) {
        return confirm({
          title: confirmCloseTitle,
          message: canCloseMessage,
          actionLabel: confirmCloseLabel,
          cancelLabel: cancelCloseLabel,
          actionThemeColor: "attention",
        });
      }
      return typeof window !== "undefined" ? window.confirm(canCloseMessage) : false;
    });

    const shouldClose = useEvent(async () => {
      if (onWillClose) {
        const result = await onWillClose();
        if (result === false) {
          return false;
        }
      } else if (!skipDirtyConfirmation && getDirty()) {
        const confirmed = await confirmDirtyClose();
        if (confirmed !== true) {
          return false;
        }
      }

      const result = await onClose?.();
      return result !== false;
    });

    useEffect(() => {
      return registerCloseGuard?.(shouldClose);
    }, [registerCloseGuard, shouldClose]);

    useEffect(() => {
      return registerDirtyChanged?.(onDirtyChanged);
    }, [onDirtyChanged, registerDirtyChanged]);

    // When inside a ModalDialogFrame, fire onOpen in the inner container context when the
    // dialog transitions from closed to open (triggered by the outer frame's doOpen call).
    const prevIsOpenRef = useRef(false);
    useIsomorphicLayoutEffect(() => {
      if (modalStateContext && isOpen && !prevIsOpenRef.current) {
        onOpen?.();
      }
      prevIsOpenRef.current = isOpen;
    }, [isOpen, modalStateContext, onOpen]);

    /**
     * https://github.com/radix-ui/primitives/issues/3648
     */
    useIsomorphicLayoutEffect(() => {
      return () => {
        const root = document.getElementById("root");
        if (root)
          requestAnimationFrame(() => {
            root.removeAttribute("aria-hidden");
            document.body.style.pointerEvents = "auto";
          });
      };
    }, []);

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
          setFormDirty(id, false);
        },
        unRegisterForm: (id: string) => {
          registeredForms.current.delete(id);
          removeFormDirty(id);
        },
        setFormDirty: (id: string, dirty: boolean) => {
          setFormDirty(id, dirty);
        },
        amITheSingleForm: (id: string) => {
          return registeredForms.current.size === 1 && registeredForms.current.has(id);
        },
        requestClose: () => {
          return doClose();
        },
      };
    }, [doClose, removeFormDirty, setFormDirty]);

    if (!root) {
      return null;
    }

    const Content = isOpen ? (
      <Part partId={PART_CONTENT}>
        <Dialog.Content
          {...rest}
          className={classnames(
            {
              [styles.contentAnimation]: !externalAnimation,
            },
            styles.content,
            classes?.[COMPONENT_PART_KEY],
            className,
          )}
          onPointerDownOutside={(event) => {
            if (
              !closeOnClickAway ||
              (event.target instanceof Element &&
                (event.target.closest("._debug-inspect-button") !== null ||
                  event.target.localName === "com-1password-button"))
            ) {
              event.preventDefault();
            }
          }}
          ref={composedRef}
          style={{ ...style, gap: undefined }}
        >
          {(!!title || !!titleTemplate) ? (
            <Part partId={PART_TITLE}>
              <Dialog.Title style={{ marginTop: 0 }}>
                <header id="dialogTitle" className={styles.dialogTitle}>
                  {titleTemplate || title}
                </header>
              </Dialog.Title>
            </Part>
          ) : (
            <VisuallyHidden>
              <Dialog.Title />
            </VisuallyHidden>
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
                icon={<ThemedIcon name={"close"} size={"sm"} />}
                orientation={"vertical"}
              />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Part>
    ) : null;

    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? doOpen() : doClose())}>
        <Dialog.Portal container={root}>
          {/* className is placed on this wrapper so that CSS custom properties
              (theme variables) cascade to both the backdrop (.overlayBg) and
              the dialog content, without applying layout styles like max-width
              directly to the fixed-position backdrop. */}
          <div className={classnames(classes?.[COMPONENT_PART_KEY], className)}>
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
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
));
