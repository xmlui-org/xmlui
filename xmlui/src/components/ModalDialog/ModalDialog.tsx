import styles from "./ModalDialog.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject, textSubject } from "../../components-core/theming/themes/base-utils";
import { MemoizedItem } from "../container-helpers";
import { defaultProps } from "./ModalDialog.defaults";
import { ModalDialog, ModalDialogFrame } from "./ModalDialogReact";
import { createMetadata } from "../metadata-helpers";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

const COMP = "ModalDialog";

export const ModalDialogMd = createMetadata({
  status: "stable",
  description:
    "`ModalDialog` creates overlay dialogs that appear on top of the main interface, " +
    "ideal for forms, confirmations, detailed views, or any content that requires " +
    "focused user attention. Dialogs are programmatically opened using the `open()` " +
    "method and can receive parameters for dynamic content.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  parts: {
    content: {
      description: "The main content area of the modal dialog.",
    },
    title: {
      description: "The title area of the modal dialog.",
    },
  },
  props: {
    fullScreen: {
      description:
        `Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum ` +
        `width and height (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
    title: {
      description: `Provides a prestyled heading to display the intent of the dialog.`,
      valueType: "string",
    },
    titleTemplate: {
      description: "A custom template to render the dialog title.",
      valueType: "ComponentDef",
    },
    closeButtonVisible: {
      description: `Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.`,
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
    closeOnClickAway: {
      description: "When `true`, clicking outside the dialog closes it.",
      valueType: "boolean",
      defaultValue: defaultProps.closeOnClickAway,
    },
    canCloseMessage: {
      description:
        "The confirmation message shown when the dialog is dirty and the user attempts to close it.",
      valueType: "string",
      defaultValue: defaultProps.canCloseMessage,
    },
    confirmCloseLabel: {
      description:
        "The label of the confirmation dialog button that closes a dirty modal dialog.",
      valueType: "string",
      defaultValue: defaultProps.confirmCloseLabel,
    },
    cancelCloseLabel: {
      description:
        "The label of the confirmation dialog button that keeps a dirty modal dialog open.",
      valueType: "string",
      defaultValue: defaultProps.cancelCloseLabel,
    },
  },
  events: {
    open: {
      description:
        `This event is fired when the \`${COMP}\` is opened either via a \`when\` or an ` +
        `imperative API call (\`open()\`).`,
      signature: "open(...params: any[]): void",
      parameters: {
        params:
          "Parameters passed to the open() method, accessible via $param and $params context variables.",
      },
    },
    close: {
      description:
        `This event is fired when the close button is pressed or the user clicks outside ` +
        `the \`${COMP}\`.`,
      signature: "close(): void",
      parameters: {},
    },
    willClose: {
      description:
        `This event is fired before the \`${COMP}\` closes. Return an explicit ` +
        `\`false\` value to prevent the dialog from closing. When this event is defined, ` +
        `dirty-state confirmation is skipped.`,
      signature: "willClose(): boolean | void",
      parameters: {},
    },
    dirtyChanged: {
      description:
        "Fires when the ModalDialog's dirty state changes. The event receives the new dirty state.",
      signature: "dirtyChanged(dirty: boolean): void",
      parameters: {
        dirty: "The new dirty state of the ModalDialog.",
      },
    },
  },
  apis: {
    close: {
      description:
        `This method is used to close the \`${COMP}\`. Invoke it using \`modalId.close()\` ` +
        `where \`modalId\` refers to a \`ModalDialog\` component.`,
      signature: "close(): void",
    },
    open: {
      description:
        "This method imperatively opens the modal dialog. You can pass an arbitrary number " +
        "of parameters to the method. In the `ModalDialog` instance, you can access those " +
        "with the `\$param` and `\$params` context values.",
      signature: "open(...params: any[]): void",
      parameters: {
        params: "An arbitrary number of parameters that can be used to pass data to the dialog.",
      },
    },
    setDirty: {
      description:
        "This method marks the modal dialog as dirty or clean. Dirty dialogs ask for confirmation before closing unless `willClose` is defined.",
      signature: "setDirty(dirty: boolean): void",
      parameters: {
        dirty: "When `true`, the dialog is marked dirty; when `false`, it is marked clean.",
      },
    },
    getDirty: {
      description: "This method returns whether the modal dialog is currently marked dirty.",
      signature: "getDirty(): boolean",
    },
  },
  contextVars: {
    $param: {
      description: "First parameter passed to the `open()` method",
    },
    $params: {
      description:
        "Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    ...paddingSubject(COMP, { all: "$space-7" }),
    ...textSubject(`title-${COMP}`, { size: "$fontSize-2xl" }),
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`maxWidth-${COMP}`]: "450px",
    [`maxHeight-${COMP}`]: "100%",
    [`marginBottom-title-${COMP}`]: "0",
  },
});

type ThemedModalDialogProps = React.ComponentPropsWithoutRef<typeof ModalDialog>;

export const ThemedModalDialog = React.forwardRef<
  React.ElementRef<typeof ModalDialog>,
  ThemedModalDialogProps
>(function ThemedModalDialog({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(ModalDialogMd);
  return (
    <ModalDialog
      {...props}
      className={`${themeClass}${className ? ` ${className}` : ""}`}
      ref={ref}
    />
  );
});

export const modalViewComponentRenderer = wrapComponent(COMP, ModalDialog, ModalDialogMd, {
  exposeRegisterApi: true,
  exclude: [
    "fullScreen",
    "title",
    "titleTemplate",
    "closeButtonVisible",
    "closeOnClickAway",
    "canCloseMessage",
    "confirmCloseLabel",
    "cancelCloseLabel",
    "externalAnimation",
  ],
  events: [],
  customRender(
    _props,
    {
      node,
      contextVars,
      extractValue,
      classes,
      renderChild,
      lookupEventHandler,
      registerComponentApi,
      layoutContext,
      appContext,
    },
  ) {
    // --- If the ModalDialog is not inside a ModalDialogFrame, wrap it in one.
    if (!layoutContext?._insideModalFrame) {
      // --- Context variables are now directly available via contextVars parameter
      return (
        <ModalDialogFrame
          isInitiallyOpen={extractValue(node.when) !== undefined}
          registerComponentApi={registerComponentApi}
          renderDialog={({ openParams, ref }) => {
            return (
              <MemoizedItem
                node={node}
                renderChild={renderChild}
                layoutContext={{ _insideModalFrame: true }}
                contextVars={{
                  ...contextVars,
                  $param: openParams?.[0],
                  $params: openParams,
                }}
                vars={(node as any)._savedVarDefs}
                functions={(node as any)._savedFunctionDefs}
              />
            );
          }}
        />
      );
    }

    return (
      <ModalDialog
        classes={classes}
        fullScreen={extractValue.asOptionalBoolean(node.props?.fullScreen)}
        title={extractValue(node.props?.title)}
        titleTemplate={renderChild(node.props?.titleTemplate)}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible)}
        closeOnClickAway={extractValue.asOptionalBoolean(node.props.closeOnClickAway)}
        canCloseMessage={extractValue.asOptionalString(node.props.canCloseMessage)}
        confirmCloseLabel={extractValue.asOptionalString(node.props.confirmCloseLabel)}
        cancelCloseLabel={extractValue.asOptionalString(node.props.cancelCloseLabel)}
        externalAnimation={extractValue.asOptionalBoolean(node.props.externalAnimation)}
        onClose={lookupEventHandler("close")}
        onWillClose={lookupEventHandler("willClose")}
        onOpen={lookupEventHandler("open")}
        onDirtyChanged={lookupEventHandler("dirtyChanged")}
        confirm={appContext.confirm}
      >
        {renderChild(node.children, { type: "Stack" })}
      </ModalDialog>
    );
  },
});
