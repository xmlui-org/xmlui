import styles from "./ContextMenu.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../metadata-helpers";
import { ContextMenu } from "./ContextMenuNative";
import type { ContainerWrapperDef } from "../../components-core/rendering/ContainerWrapper";
import { useMemo } from "react";
import { filterAdjacentSeparators } from "../menu-helpers";

const CMCOMP = "ContextMenu";


export const ContextMenuMd = createMetadata({
  status: "stable",
  description:
    "`ContextMenu` provides a context-sensitive menu that appears at a specific position " +
    "when opened programmatically via its `openAt()` API. Unlike `DropdownMenu`, it has no " +
    "trigger button and is typically used with `onContextMenu` events to create right-click " +
    "menus or custom context-aware action menus. The menu automatically positions itself " +
    "within the viewport and closes when clicking outside or when a menu item is selected. ",
  parts: {
    content: {
      description: "The content area of the ContextMenu where menu items are displayed.",
    },
  },
  props: {
    menuWidth: {
      type: "string",
      description: "Sets the width of the context menu.",
    },
  },
  events: {},
  apis: {
    close: {
      description: `This method closes the context menu.`,
      signature: "close(): void",
    },
    openAt: {
      description:
        `This method opens the context menu at the specified event position (e.g., mouse click coordinates). ` +
        `Optionally, you can pass a context object that will be available within the menu as \`$context\`. ` +
        `The method automatically prevents the browser's default context menu from appearing.`,
      signature: "openAt(event: MouseEvent, context?: any): void",
    },
  },
  contextVars: {
    $context: {
      description:
        "Contains the context data passed to the `openAt()` method. This allows menu items " +
        "to access information about the element or data that triggered the context menu.",
      valueType: "any",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${CMCOMP}`]: "$color-surface-raised",
    [`minWidth-${CMCOMP}`]: "160px",
    [`boxShadow-${CMCOMP}`]: "$boxShadow-xl",
    [`borderStyle-${CMCOMP}-content`]: "solid",
    [`borderRadius-${CMCOMP}`]: "$borderRadius",
  },
});

export const contextMenuComponentRenderer = createComponentRenderer(
  CMCOMP,
  ContextMenuMd,
  ({ node, extractValue, renderChild, registerComponentApi, className, state, updateState }) => {
    // Get the context data from state
    const contextData = state.$context;

    // Extract menuWidth property
    const menuWidth = extractValue(node.props.menuWidth);

    // Filter out adjacent separators before rendering
    const filteredChildren = filterAdjacentSeparators(node.children);

    // Wrap children in a Container with context variables to make $context available
    const nodeWithContextVars = useMemo(
      () =>
        ({
          type: "Container",
          contextVars: { $context: contextData },
          children: filteredChildren,
        }) as ContainerWrapperDef,
      [filteredChildren, contextData],
    );

    return (
      <ContextMenu
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        className={className}
        menuWidth={menuWidth}
      >
        {renderChild(nodeWithContextVars)}
      </ContextMenu>
    );
  },
);
