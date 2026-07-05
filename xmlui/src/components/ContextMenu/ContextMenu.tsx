import styles from "./ContextMenu.module.scss";
import { useEffect, useMemo, useState } from "react";

import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createSlotScope } from "../../runtime/rendering/components";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../metadata-helpers";
import { ContextMenu } from "./ContextMenuReact";
import type { ContainerWrapperDef } from "../../components-core/rendering/ContainerWrapper";
import { filterSeparators } from "../menu-helpers";
import { COMPONENT_PART_KEY } from "../../styling";
import { filterMenuSeparators } from "../DropdownMenu/DropdownMenu";

const CMCOMP = "ContextMenu";


export const ContextMenuMd = createMetadata({
  status: "stable",
  description:
    "`ContextMenu` provides a context-sensitive menu that appears at a specific position " +
    "when opened programmatically via its `openAt()` API. Unlike `DropdownMenu`, it has no " +
    "trigger button and is typically used with `onContextMenu` events to create right-click " +
    "menus or custom context-aware action menus. The menu automatically positions itself " +
    "within the viewport and closes when clicking outside or when a menu item is selected. ",
    themeVarContributorComponents: ["MenuItem", "MenuSeparator", "SubMenuItem" ],
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

export const contextMenuComponentRenderer = wrapComponent(CMCOMP, ContextMenu, ContextMenuMd, {
  exposeRegisterApi: true,
  customRender: (_props, { node, extractValue, renderChild, registerComponentApi, updateState, state, classes }) => {
    // Filter separators dynamically: accounts for adjacent/leading/trailing separators
    // and `when` conditions on menu items so hidden items don't leave orphaned separators.
    const filteredChildren = filterSeparators(node.children, extractValue);

    // Wrap filtered children with $context variable.
    // Try to get $context from local state first (set via updateState in openAt),
    // but fall back to extractValue to find it in parent scopes if needed.
    const nodeWithContextVars: ContainerWrapperDef = {
      type: "Container",
      contextVars: {
        $context: state?.$context ?? extractValue("$context"),
      },
      children: filteredChildren,
    };

    return (
      <ContextMenu
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        classes={classes}
        {..._props}
      >
        {renderChild(nodeWithContextVars)}
      </ContextMenu>
    );
  },
});

function RuntimeContextMenu({ adapter }: { adapter: XmluiComponentAdapter }) {
  const [contextValue, setContextValue] = useState<unknown>();
  const scopedContext = useMemo(
    () => createSlotScope(adapter.scope, { $context: contextValue }),
    [adapter.scope, contextValue],
  );
  const rootAttrs = adapter.rootAttrs("content");
  const contentClassName = adapter.className;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let content: HTMLElement | null = null;
    const findContent = () => {
      const className = contentClassName.split(/\s+/).find(Boolean);
      if (!className) {
        return null;
      }
      const escaped = typeof CSS !== "undefined" && CSS.escape
        ? CSS.escape(className)
        : className.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
      return document.querySelector<HTMLElement>(`.${escaped}`);
    };
    const syncContentAttrs = () => {
      content = findContent();
      if (!content) {
        return;
      }
      for (const [name, value] of Object.entries(rootAttrs)) {
        if ((name.startsWith("data-") || name === "id") && value !== undefined && value !== null) {
          content.setAttribute(name, String(value));
        }
      }
      for (const separator of content.querySelectorAll<HTMLElement>('[role="separator"]')) {
        separator.setAttribute("data-xmlui-component", "MenuSeparator");
        separator.setAttribute("data-xmlui-part", "root");
      }
    };

    syncContentAttrs();
    const observer = new MutationObserver(syncContentAttrs);
    observer.observe(document.body, { childList: true, subtree: true });

    const closeOnOutsidePointer = (event: PointerEvent) => {
      content = content?.isConnected ? content : findContent();
      if (content && event.target instanceof Node && !content.contains(event.target)) {
        (adapter.api.close as (() => void) | undefined)?.();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        (adapter.api.close as (() => void) | undefined)?.();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [adapter.api, contentClassName, rootAttrs]);

  return (
    <ContextMenu
      {...rootAttrs}
      classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      menuWidth={adapter.stringProp("menuWidth")}
      registerComponentApi={adapter.registerApi}
      updateState={(state) => {
        if (Object.prototype.hasOwnProperty.call(state, "$context")) {
          setContextValue(state.$context);
        }
      }}
    >
      {adapter.context.renderChildren(
        filterMenuSeparators(adapter.node.children),
        scopedContext,
        adapter.node.range.end,
      )}
    </ContextMenu>
  );
}

export const contextMenuRenderer = wrapRuntimeComponent({
  name: CMCOMP,
  metadata: ContextMenuMd as ComponentMetadata,
  renderer: ({ adapter }) => <RuntimeContextMenu adapter={adapter} />,
});
