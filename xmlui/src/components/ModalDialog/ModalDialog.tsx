import styles from "./ModalDialog.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { MemoizedItem } from "../container-helpers";
import { ModalDialog, ModalDialogFrame, defaultProps } from "./ModalDialogNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "ModalDialog";

export const ModalDialogMd = createMetadata({
  status: "stable",
  description:
    "`ModalDialog` creates overlay dialogs that appear on top of the main interface, " +
    "ideal for forms, confirmations, detailed views, or any content that requires " +
    "focused user attention. Dialogs are programmatically opened using the `open()` " +
    "method and can receive parameters for dynamic content.",
  props: {
    fullScreen: {
      description:
        `Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum ` +
        `width and height (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
    title: d(`Provides a prestyled heading to display the intent of the dialog.`),
    closeButtonVisible: {
      description: `Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.`,
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
  },
  events: {
    open: d(
      `This event is fired when the \`${COMP}\` is opened either via a \`when\` or an ` +
        `imperative API call (\`open()\`).`,
    ),
    close: d(
      `This event is fired when the close button is pressed or the user clicks outside ` +
        `the \`${COMP}\`.`,
    ),
  },
  apis: {
    close: {
      description: `This method is used to close the \`${COMP}\`. Invoke it using \`modalId.close()\` ` +
        `where \`modalId\` refers to a \`ModalDialog\` component.`,
      signature: "close(): void",
    },
    open: {
      description: "This method imperatively opens the modal dialog. You can pass an arbitrary number " +
        "of parameters to the method. In the `ModalDialog` instance, you can access those " +
        "with the `\$param` and `\$params` context values.",
      signature: "open(...params: any[]): void",
      parameters: {
        params: "An arbitrary number of parameters that can be used to pass data to the dialog.",
      },
    },
  },
  contextVars: {
    $param: d("First parameter passed to the `open()` method"),
    $params: d(
      "Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)",
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    ...paddingSubject(COMP, { all: "$space-7" }),
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`maxWidth-${COMP}`]: "450px",
    [`marginBottom-title-${COMP}`]: "0",
  },
});

export const modalViewComponentRenderer = createComponentRenderer(
  COMP,
  ModalDialogMd,
  ({
    node,
    extractValue,
    className,
    renderChild,
    lookupEventHandler,
    registerComponentApi,
    layoutContext,
  }) => {
    // gigantic hack: If the ModalDialog is not inside a ModalDialogFrame, wrap it in one
    //   we do this through the layout context, render it through another render loop with the extra $param context var
    //   (note the layoutContext and node on the MemoizedItem)
    // one solution would be to have a renderChild that can take a contextVars argument
    if (!layoutContext?._insideModalFrame) {
      return (
        <ModalDialogFrame
          isInitiallyOpen={extractValue(node.when) !== undefined}
          registerComponentApi={registerComponentApi}
          onClose={lookupEventHandler("close")}
          onOpen={lookupEventHandler("open")}
          renderDialog={({ openParams, ref }) => {
            return (
              <MemoizedItem
                node={node}
                renderChild={renderChild}
                layoutContext={{ _insideModalFrame: true }}
                contextVars={{ $param: openParams?.[0], $params: openParams }}
              />
            );
          }}
        />
      );
    }

    return (
      <ModalDialog
        className={className}
        fullScreen={extractValue.asOptionalBoolean(node.props?.fullScreen)}
        title={extractValue(node.props?.title)}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible)}
      >
        {renderChild(node.children, { type: "Stack" })}
      </ModalDialog>
    );
  },
);
