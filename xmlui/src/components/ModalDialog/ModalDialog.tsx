import type { CSSProperties, ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ModalDialog.module.scss";
import classnames from "@components-core/utils/classnames";
import { Icon } from "@components/Icon/Icon";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useTheme } from "@components-core/theming/ThemeContext";
import { Button } from "@components/Button/Button";
import { useEvent } from "@components-core/utils/misc";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { paddingSubject } from "@components-core/theming/themes/base-utils";
import * as Dialog from "@radix-ui/react-dialog";
import {MemoizedItem} from "@components/container-helpers";

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
    ref
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

    if (!root) {
      return null;
    }

    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? doOpen() : doClose())}>
        <Dialog.Portal container={root}>
          {!fullScreen && <div className={styles.overlayBg} />}
          <Dialog.Overlay className={classnames(styles.overlay, {
            [styles.fullScreen]: fullScreen,
          })}>
            <Dialog.Content
              className={classnames(styles.content)}
              onPointerDownOutside={(event)=>{
                if(event.target instanceof Element && event.target.closest('._debug-inspect-button') !== null){    //we prevent the auto modal close on clicking the inspect button
                  event.preventDefault();
                }
              }}
              ref={composedRef}
              style={style}
            >
              {!!title && (
                <Dialog.Title>
                  <header id="dialogTitle" className={styles.dialogTitle}>
                    {title}
                  </header>
                </Dialog.Title>
              )}
              <div className={styles.innerContent}>
                {isOpen && (typeof children === "function" ? children?.(modalContext) : children)}
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
  }
);

ModalDialog.displayName = "ModalDialog";

// =====================================================================================================================
// ModalDialog definition

/**
 * The \`ModalDialog\` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action.
 * @descriptionRef
 */
export interface ModalDialogComponentDef extends ComponentDef<"ModalDialog"> {
  props: {
    /** 
     * Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum width and height (\`false\`).
     * The default value is \`false\`.
     * @descriptionRef
     */
    fullScreen?: boolean;
    /** 
     * Provides a prestyled heading to display the intent of the dialog.
     * @descriptionRef
     */
    title?: string;
    /** 
     * This property sets whether the modal dialog appears open (\`true\`) or not (\`false\`)
     * when the page is it is defined on is rendered.
     * The default value is \`false\`.
     * @descriptionRef
     */
    isInitiallyOpen?: string;
    /** 
     * Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.
     * The default value is \`true\`.
     * @descriptionRef
     */
    closeButtonVisible?: string;
  };
  events?: {
    /** 
     * This event is fired when the close button is pressed or the user clicks outside the \`ModalDialog\`.
     * 
     * > For the API method of the same name, see \`close\` under the \`Api\` section.
     * @descriptionRef
     */
    close: string;
    /** 
     * This event is fired when the \`ModalDialog\` is opened either via a \`when\` or an imperative API call (\`open()\`).
     * 
     * > For the API method of the same name, see \`open\` under the \`Api\` section.
     * @descriptionRef
     */
    open: string;
  };
  api?: {
    /** 
     * This method is used to close the \`ModalDialog\`.
     * Invoke it using \`modalId.close()\` where \`modalId\` refers to a \`ModalDialog\` component.
     * 
     * See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.
     * 
     * > For the event of the same name, see \`close\` under the \`Event\` section.
     */
    close: () => void;
    /** 
     * This method is used to open the \`ModalDialog\`.
     * Invoke it using \`modalId.close()\` where \`modalId\` refers to a \`ModalDialog\` component.
     * 
     * See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.
     * 
     * > For the event of the same name, see \`open\` under the \`Event\` section.
     */
    open: () => void;
  }
}

const metadata: ComponentDescriptor<ModalDialogComponentDef> = {
  displayName: "ModalDialog",
  description: "A container for a modal dialog",
  props: {
    fullScreen: {
      description: "Indicates the modal fills the entire screen",
      valueType: "boolean",
    },
    title: {
      description: "The title of the modal",
      valueType: "string",
    },
    closeButtonVisible: desc("Indicates if the close button is visible"),
  },
  events: {
    close: {
      description: "The modal is closed",
      valueType: "ActionSet",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    ...paddingSubject("ModalDialog", { all: "$space-7" }),
    "color-bg-ModalDialog": "$color-bg-primary",
    "color-bg-overlay-ModalDialog": "$color-bg-overlay",
    "color-text-ModalDialog": "$color-text-primary",
    "radius-ModalDialog": "$radius",
    "font-family-ModalDialog": "$font-family",
    "max-width-ModalDialog": "450px",
    "margin-bottom-title-ModalDialog": "0",
    dark: {
      "color-bg-ModalDialog": "$color-bg-primary",
    }
  },
};

/**
 * This function define the renderer for the ModalDialog component.
 */

export const modalViewComponentRenderer = createComponentRenderer<ModalDialogComponentDef>(
  "ModalDialog",
  ({ node, extractValue, layoutCss, renderChild, lookupEventHandler, registerComponentApi }) => {
    return (
      <ModalDialog
        isInitiallyOpen={node.when !== undefined}
        style={layoutCss}
        onClose={lookupEventHandler("close")}
        onOpen={lookupEventHandler("open")}
        fullScreen={extractValue(node.props?.fullScreen)}
        title={extractValue(node.props?.title)}
        registerComponentApi={registerComponentApi}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible)}
      >
        {(modalContext) => {
          return <MemoizedItem node={node.children} renderChild={renderChild} layoutContext={{type: "Stack"}} context={modalContext}/>
        }}
      </ModalDialog>
    );
  },
  metadata
);
