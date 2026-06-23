import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Drawer.defaults";

const COMP = "Drawer";
const drawerStylesSource = `
  createThemeVar("backgroundColor-Drawer");
  createThemeVar("backgroundColor-backdrop-Drawer");
  createThemeVar("borderRadius-Drawer");
  createThemeVar("boxShadow-Drawer");
  createThemeVar("paddingTop-Drawer");
  createThemeVar("paddingRight-Drawer");
  createThemeVar("paddingBottom-Drawer");
  createThemeVar("paddingLeft-Drawer");
  createThemeVar("width-Drawer");
  createThemeVar("maxWidth-Drawer");
  createThemeVar("height-Drawer");
  createThemeVar("maxHeight-Drawer");
  createThemeVar("zIndex-Drawer");
  createThemeVar("gap-Drawer");
  createThemeVar("animationDuration-Drawer");
  createThemeVar("animationEasing-Drawer");
  createThemeVar("top-closeButton-Drawer");
  createThemeVar("right-closeButton-Drawer");
`;

export const DrawerMd = createMetadata({
  status: "in progress",
  description: "`Drawer` is a panel that slides in from one of the four edges of the viewport.",
  props: {
    position: {
      description: "Specifies the edge from which the drawer slides in.",
      valueType: "string",
      availableValues: ["left", "right", "top", "bottom"],
      defaultValue: defaultProps.position,
    },
    hasBackdrop: {
      description: "When true, a translucent overlay is shown behind the drawer while it is open.",
      valueType: "boolean",
      defaultValue: defaultProps.hasBackdrop,
    },
    initiallyOpen: {
      description: "When true, the drawer is open on its first render.",
      valueType: "boolean",
      defaultValue: defaultProps.initiallyOpen,
    },
    closeButtonVisible: {
      description: "When true, a close button is displayed in the drawer.",
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
    closeOnClickAway: {
      description: "When true, clicking outside the drawer panel closes it.",
      valueType: "boolean",
      defaultValue: defaultProps.closeOnClickAway,
    },
    headerTemplate: dComponent("A custom template rendered in the sticky header area."),
    testId: {
      description: "Adds a test identifier to the Drawer panel.",
      valueType: "string",
    },
  },
  events: {
    open: {
      description: "Fired when the Drawer is opened.",
      signature: "open(): void",
    },
    close: {
      description: "Fired when the Drawer is closed.",
      signature: "close(): void",
    },
  },
  apis: {
    open: { description: "Opens the Drawer.", signature: "open(): void" },
    close: { description: "Closes the Drawer.", signature: "close(): void" },
    isOpen: { description: "Returns true when the Drawer is open.", signature: "isOpen(): boolean" },
  },
  themeVars: extractScssThemeVars(drawerStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-backdrop-${COMP}`]: "rgba(0, 0, 0, 0.4)",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`boxShadow-${COMP}`]: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    [`paddingTop-${COMP}`]: "$space-4",
    [`paddingRight-${COMP}`]: "$space-4",
    [`paddingBottom-${COMP}`]: "$space-4",
    [`paddingLeft-${COMP}`]: "$space-4",
    [`gap-${COMP}`]: "$space-4",
    [`width-${COMP}`]: "320px",
    [`maxWidth-${COMP}`]: "80%",
    [`height-${COMP}`]: "320px",
    [`maxHeight-${COMP}`]: "50%",
    [`zIndex-${COMP}`]: "200",
    [`animationDuration-${COMP}`]: "250ms",
    [`animationEasing-${COMP}`]: "cubic-bezier(0.4, 0, 0.2, 1)",
    [`top-closeButton-${COMP}`]: "$space-2",
    [`right-closeButton-${COMP}`]: "$space-3",
  },
});

