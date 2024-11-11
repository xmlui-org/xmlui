import styles from "./ModalDialog.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { paddingSubject } from "@components-core/theming/themes/base-utils";
import { MemoizedItem } from "@components/container-helpers";
import { ModalDialog } from "./ModalDialogNative";

const COMP = "ModalDialog";

export const ModalDialogMd = createMetadata({
  description:
    `The \`${COMP}\` component defines a modal dialog UI element that can be displayed over ` +
    `the existing UI - triggered by some action.`,
  props: {
    fullScreen: d(
      `Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum ` +
        `width and height (\`false\`).`,
    ),
    title: d(`Provides a prestyled heading to display the intent of the dialog.`),
    closeButtonVisible: d(
      `Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.`,
    ),
    isInitiallyOpen: d(
      `This property sets whether the modal dialog appears open (\`true\`) or not (\`false\`) ` +
        `when the page is it is defined on is rendered.`,
    ),
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
    open: d(``),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    ...paddingSubject(COMP, { all: "$space-7" }),
    [`color-bg-${COMP}`]: "$color-bg-primary",
    [`color-bg-overlay-${COMP}`]: "$color-bg-overlay",
    [`color-text-${COMP}`]: "$color-text-primary",
    [`radius-${COMP}`]: "$radius",
    [`font-family-${COMP}`]: "$font-family",
    [`max-width-${COMP}`]: "450px",
    [`margin-bottom-title-${COMP}`]: "0",
    dark: {
      [`color-bg-${COMP}`]: "$color-bg-primary",
    },
  },
});

export const modalViewComponentRenderer = createComponentRenderer(
  COMP,
  ModalDialogMd,
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
          return (
            <MemoizedItem
              node={node.children}
              renderChild={renderChild}
              layoutContext={{ type: "Stack" }}
              contextVars={{ $modalContext: modalContext }}
            />
          );
        }}
      </ModalDialog>
    );
  },
);
