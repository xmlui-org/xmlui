import styles from "./ResponsiveBar.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dClick, dTriggerTemplate } from "../metadata-helpers";
import { defaultResponsiveBarProps, ResponsiveBar } from "./ResponsiveBarNative";
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
  props: {
    orientation: {
      description:
        "Layout direction of the responsive bar. In horizontal mode, items are arranged " +
        "left-to-right and overflow is based on container width. In vertical mode, items are " +
        "arranged top-to-bottom and overflow is based on container height.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultResponsiveBarProps.orientation,
    },
    overflowIcon: {
      description: 
        "Icon to display in the dropdown trigger button when items overflow. " +
        "You can use component-specific icons in the format \"iconName:ResponsiveBar\".",
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

export const responsiveBarComponentRenderer = createComponentRenderer(
  COMP,
  ResponsiveBarMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi, layoutContext }) => {
    const children = Array.isArray(node.children) ? node.children : node.children ? [node.children] : [];
    
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
        className={className}
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
);
