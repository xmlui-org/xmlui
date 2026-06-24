import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "ContextMenu";
const contextMenuStylesSource = `
  createThemeVar("backgroundColor-ContextMenu");
  createThemeVar("borderRadius-ContextMenu");
  createThemeVar("boxShadow-ContextMenu");
  createThemeVar("borderColor-ContextMenu-content");
  createThemeVar("borderWidth-ContextMenu-content");
  createThemeVar("borderStyle-ContextMenu-content");
  createThemeVar("minWidth-ContextMenu");
`;

export const ContextMenuMd = createMetadata({
  status: "in progress",
  description:
    "`ContextMenu` provides a context-sensitive menu opened programmatically at an event position.",
  themeVarContributorComponents: ["MenuItem", "MenuSeparator", "SubMenuItem"],
  parts: {
    content: {
      description: "The content area of the ContextMenu where menu items are displayed.",
    },
  },
  props: {
    menuWidth: {
      valueType: "string",
      description: "Sets the width of the context menu.",
    },
    testId: {
      valueType: "string",
      description: "Adds a test identifier to the context menu content.",
    },
  },
  events: {},
  apis: {
    close: {
      description: "Closes the context menu.",
      signature: "close(): void",
    },
    openAt: {
      description:
        "Opens the context menu at the specified event position and exposes optional context data as `$context`.",
      signature: "openAt(event: MouseEvent, context?: any): void",
    },
  },
  contextVars: {
    $context: {
      description: "Contains context data passed to the `openAt()` method.",
      valueType: "any",
    },
  },
  themeVars: extractScssThemeVars(contextMenuStylesSource),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
    [`minWidth-${COMP}`]: "160px",
    [`boxShadow-${COMP}`]: "$boxShadow-xl",
    [`borderStyle-${COMP}-content`]: "solid",
    [`borderWidth-${COMP}-content`]: "1px",
    [`borderColor-${COMP}-content`]: "$borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
  },
});
