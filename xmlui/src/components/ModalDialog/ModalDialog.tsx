import styles from "./ModalDialog.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { MemoizedItem } from "../container-helpers";
import { ModalDialog, ModalDialogFrame } from "./ModalDialogNative";
import { describe } from "yargs";

const COMP = "ModalDialog";

export const ModalDialogMd = createMetadata({
  description:
    `The \`${COMP}\` component defines a modal dialog UI element that can be displayed over ` +
    `the existing UI - triggered by some action.`,
  props: {
    fullScreen: {
      description:
        `Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum ` +
        `width and height (\`false\`).`,
      valueType: "boolean",
      defaultValue: false,
    },
    title: d(`Provides a prestyled heading to display the intent of the dialog.`),
    closeButtonVisible: {
      description: `Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.`,
      valueType: "boolean",
      defaultValue: true,
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
    close: d(
      `This method is used to close the \`${COMP}\`. Invoke it using \`modalId.close()\` ` +
        `where \`modalId\` refers to a \`ModalDialog\` component.`,
    ),
    open: d(
      "This method imperatively opens the modal dialog. You can pass an arbitrary number " +
        "of parameters to the method. In the \`ModalDialog\` instance, you can access those " +
        "with the \`$paramq` and \`$params\` context values.",
    ),
  },
  contextVars: {
    $param: d(
      "This value represents the first parameters passed to the \`open()\` method to " +
        "display the modal dialog.",
    ),
    $params: d(
      "This value represents the array of parameters passed to the \`open()\` method. " +
        "You can use \`$params[0]\` to access the first and \`$params[1]\` to access the " +
        "second (and so on) parameters. \`$param\` is the same as \`$params[0]\`.",
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
    layoutCss,
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
          isInitiallyOpen={node.when !== undefined}
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
        style={layoutCss}
        fullScreen={extractValue(node.props?.fullScreen)}
        title={extractValue(node.props?.title)}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible)}
      >
        {renderChild(node.children, { type: "Stack" })}
      </ModalDialog>
    );
  },
);
