import styles from "./ResponsiveBar.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick, dTriggerTemplate } from "../metadata-helpers";
import { defaultResponsiveBarProps, ResponsiveBar } from "./ResponsiveBarReact";
import { ResponsiveBarItem } from "./ResponsiveBarItem";
import { alignmentOptionMd } from "../abstractions";

const COMP = "ResponsiveBar";

export const ResponsiveBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveBar` is a layout container that automatically manages child " +
    "component overflow by moving items that don't fit into a dropdown menu. It supports " +
    "both horizontal and vertical orientations and provides a space-efficient way to display " +
    "navigation items, toolbar buttons, or other components that need to adapt to varying " +
    "container dimensions while maintaining full functionality.",
  docFolder: COMP,
  parts: {
    overflow: {
      description: "The overflow dropdown container that holds items that don't fit in the bar.",
    },
  },
  props: {
    orientation: {
      description:
        "Layout direction of the responsive bar. In horizontal mode, items are arranged " +
        "left-to-right and overflow is based on container width. In vertical mode, items are " +
        "arranged top-to-bottom and overflow is based on container height.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      defaultValue: defaultResponsiveBarProps.orientation,
    },
    overflowIcon: {
      description:
        "Icon to display in the dropdown trigger button when items overflow. " +
        'You can use component-specific icons in the format "iconName:ResponsiveBar".',
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.overflowIcon,
    },
    dropdownText: {
      description:
        "Text to display in the dropdown trigger button label when items overflow. " +
        "This text is used for accessibility and appears alongside the overflow icon.",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.dropdownText,
    },
    dropdownAlignment: {
      description:
        "Alignment of the dropdown menu relative to the trigger button. " +
        "By default, uses 'end' when reverse is false (dropdown on the right/bottom) " +
        "and 'start' when reverse is true (dropdown on the left/top).",
      valueType: "string",
      availableValues: alignmentOptionMd,
    },
    triggerTemplate: dTriggerTemplate(COMP),
    gap: {
      description:
        "Gap between child elements in pixels. Controls the spacing between items " +
        "in the responsive bar layout.",
      valueType: "number",
      defaultValue: defaultResponsiveBarProps.gap,
    },
    reverse: {
      description:
        "Reverses the direction of child elements. In horizontal mode, items are arranged " +
        "from right to left instead of left to right. In vertical mode, items are arranged " +
        "from bottom to top instead of top to bottom. The dropdown menu position also adjusts " +
        "to appear at the start (left/top) instead of the end (right/bottom).",
      valueType: "boolean",
      defaultValue: defaultResponsiveBarProps.reverse,
    },
  },
  events: {
    click: dClick(COMP),
    willOpen: {
      description:
        `This event fires when the \`${COMP}\` overflow dropdown menu is about to be opened. ` +
        `You can prevent opening the menu by returning \`false\` from the event handler. ` +
        `Otherwise, the menu will open at the end of the event handler like normal.`,
      signature: "willOpen(): boolean | void",
      parameters: {},
    },
  },
  apis: {
    close: {
      description: `This method closes the overflow dropdown menu.`,
      signature: "close(): void",
    },
    open: {
      description: `This method opens the overflow dropdown menu.`,
      signature: "open(): void",
    },
    hasOverflow: {
      description: `This method returns true if the ResponsiveBar currently has an overflow menu (i.e., some items don't fit and are in the dropdown).`,
      signature: "hasOverflow(): boolean",
    },
  },
  contextVars: {
    $overflow: {
      description:
        "Boolean indicating whether the child component is displayed in the overflow " +
        "dropdown menu (true) or visible in the main bar (false).",
      valueType: "boolean",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`padding-${COMP}`]: "0",
    [`margin-${COMP}`]: "0",
  },
});

export const responsiveBarComponentRenderer = wrapComponent(COMP, ResponsiveBar, ResponsiveBarMd, {
  exposeRegisterApi: true,
  exclude: [
    "orientation",
    "overflowIcon",
    "dropdownText",
    "dropdownAlignment",
    "triggerTemplate",
    "gap",
    "reverse",
  ],
  events: [],
  customRender(
    _props,
    {
      node,
      extractValue,
      renderChild,
      classes,
      lookupEventHandler,
      registerComponentApi,
      layoutContext,
    },
  ) {
    const children = Array.isArray(node.children)
      ? node.children
      : node.children
        ? [node.children]
        : [];

    const renderChildWithContext = (childNode: any, isOverflow: boolean) => (
      <ResponsiveBarItem
        node={childNode}
        isOverflow={isOverflow}
        renderChild={renderChild}
        layoutContext={layoutContext}
      />
    );

    return (
      <ResponsiveBar
        orientation={extractValue(node.props?.orientation)}
        overflowIcon={extractValue(node.props?.overflowIcon)}
        dropdownText={extractValue(node.props?.dropdownText)}
        dropdownAlignment={extractValue(node.props?.dropdownAlignment)}
        triggerTemplate={renderChild(node.props?.triggerTemplate)}
        gap={extractValue(node.props?.gap)}
        reverse={extractValue.asOptionalBoolean(node.props?.reverse)}
        onClick={lookupEventHandler("click")}
        onWillOpen={lookupEventHandler("willOpen")}
        registerComponentApi={registerComponentApi}
        classes={classes}
        childNodes={children}
        renderChildFn={renderChildWithContext}
      >
        {children.map((child, index) => (
          <ResponsiveBarItem
            key={index}
            node={child}
            isOverflow={false}
            renderChild={renderChild}
            layoutContext={layoutContext}
          />
        ))}
      </ResponsiveBar>
    );
  },
});

import type { CSSProperties } from "react";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { COMPONENT_PART_KEY } from "../../styling/layout";
import { wrapComponent as wrapRuntimeComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import type { RuntimeRenderLayoutContext } from "../../runtime/rendering/types";
import type { AlignmentOptions } from "../abstractions";

export const responsiveBarRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ResponsiveBarMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const childNodes = nonPropertyChildren(adapter.node.children);
    const layoutContext = adapter.props.layoutContext as RuntimeRenderLayoutContext | undefined;
    const triggerTemplate = templateChildren(adapter.node, "triggerTemplate")
      ? adapter.renderTemplate("triggerTemplate")
      : undefined;
    const renderChildWithContext = (childNode: XmluiNode, isOverflow: boolean) => {
      const childScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues: {
          $overflow: isOverflow,
        },
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        emitEvent: adapter.scope.emitEvent,
      });
      return adapter.context.renderChildren([childNode], childScope, adapter.node.range.end, layoutContext);
    };

    return (
      <ResponsiveBar
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        orientation={adapter.stringProp("orientation", defaultResponsiveBarProps.orientation) as "horizontal" | "vertical"}
        overflowIcon={adapter.stringProp("overflowIcon", defaultResponsiveBarProps.overflowIcon)}
        dropdownText={adapter.stringProp("dropdownText", defaultResponsiveBarProps.dropdownText)}
        dropdownAlignment={adapter.stringProp("dropdownAlignment") as AlignmentOptions | undefined}
        triggerTemplate={triggerTemplate}
        gap={adapter.numberProp("gap", defaultResponsiveBarProps.gap)}
        reverse={adapter.booleanProp("reverse", defaultResponsiveBarProps.reverse)}
        onClick={() => void adapter.event("click")()}
        onWillOpen={() => adapter.event("willOpen")() as Promise<boolean | undefined>}
        registerComponentApi={adapter.registerApi}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        childNodes={childNodes}
        renderChildFn={renderChildWithContext}
      >
        {childNodes.map((childNode, index) => (
          <div key={index}>{renderChildWithContext(childNode, false)}</div>
        ))}
      </ResponsiveBar>
    );
  },
});
