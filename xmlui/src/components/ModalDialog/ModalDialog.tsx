import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./ModalDialog.defaults";

export { ModalDialogComponent as ThemedModalDialog } from "./ModalDialogReact";

const COMP = "ModalDialog";
const modalDialogStylesSource = `
  createThemeVar("padding-ModalDialog");
  createThemeVar("paddingTop-ModalDialog");
  createThemeVar("paddingRight-ModalDialog");
  createThemeVar("paddingBottom-ModalDialog");
  createThemeVar("paddingLeft-ModalDialog");
  createThemeVar("backgroundColor-ModalDialog");
  createThemeVar("backgroundColor-overlay-ModalDialog");
  createThemeVar("border-ModalDialog");
  createThemeVar("borderRadius-ModalDialog");
  createThemeVar("borderColor-ModalDialog");
  createThemeVar("borderWidth-ModalDialog");
  createThemeVar("borderStyle-ModalDialog");
  createThemeVar("boxShadow-ModalDialog");
  createThemeVar("fontFamily-ModalDialog");
  createThemeVar("textColor-ModalDialog");
  createThemeVar("minWidth-ModalDialog");
  createThemeVar("maxWidth-ModalDialog");
  createThemeVar("maxHeight-ModalDialog");
  createThemeVar("gap-ModalDialog");
  createThemeVar("marginBottom-title-ModalDialog");
  createThemeVar("fontFamily-title-ModalDialog");
  createThemeVar("fontSize-title-ModalDialog");
  createThemeVar("fontWeight-title-ModalDialog");
  createThemeVar("textColor-title-ModalDialog");
  createThemeVar("top-closeButton-ModalDialog");
  createThemeVar("right-closeButton-ModalDialog");
  createThemeVar("zIndex-ModalDialog");
`;

export const ModalDialogMd = createMetadata({
  status: "in progress",
  description:
    "`ModalDialog` creates overlay dialogs that appear on top of the main interface.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  parts: {
    content: { description: "The main content area of the modal dialog." },
    title: { description: "The title area of the modal dialog." },
  },
  props: {
    fullScreen: {
      description: "Toggles whether the dialog encompasses the whole UI.",
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
    title: {
      description: "Provides a prestyled heading to display the intent of the dialog.",
      valueType: "string",
    },
    titleTemplate: dComponent("A custom template to render the dialog title."),
    closeButtonVisible: {
      description: "Shows or hides the dialog close button.",
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
    testId: {
      description: "Adds a test identifier to the dialog content element.",
      valueType: "string",
    },
  },
  events: {
    open: {
      description: "Fired when the ModalDialog is opened.",
      signature: "open(...params: any[]): void",
    },
    close: {
      description: "Fired when the ModalDialog is closed.",
      signature: "close(): void",
    },
  },
  apis: {
    open: { description: "Opens the ModalDialog.", signature: "open(...params: any[]): void" },
    close: { description: "Closes the ModalDialog.", signature: "close(): void" },
    isOpen: { description: "Returns true when the ModalDialog is open.", signature: "isOpen(): boolean" },
  },
  contextVars: {
    $param: { description: "First parameter passed to the open() method." },
    $params: { description: "Array of all parameters passed to the open() method." },
  },
  themeVars: extractScssThemeVars(modalDialogStylesSource),
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-7",
    [`paddingTop-${COMP}`]: `$padding-${COMP}`,
    [`paddingRight-${COMP}`]: `$padding-${COMP}`,
    [`paddingBottom-${COMP}`]: `$padding-${COMP}`,
    [`paddingLeft-${COMP}`]: `$padding-${COMP}`,
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`boxShadow-${COMP}`]: "$boxShadow-spread",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`minWidth-${COMP}`]: "0",
    [`maxWidth-${COMP}`]: "450px",
    [`maxHeight-${COMP}`]: "100%",
    [`gap-${COMP}`]: "$space-4",
    [`marginBottom-title-${COMP}`]: "0",
    [`fontFamily-title-${COMP}`]: "$fontFamily",
    [`fontSize-title-${COMP}`]: "$fontSize-2xl",
    [`fontWeight-title-${COMP}`]: "$fontWeight-bold",
    [`textColor-title-${COMP}`]: "$textColor-primary",
    [`top-closeButton-${COMP}`]: "$space-2",
    [`right-closeButton-${COMP}`]: "$space-2",
    [`zIndex-${COMP}`]: "300",
  },
});
