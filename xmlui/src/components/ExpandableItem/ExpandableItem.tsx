import styles from "./ExpandableItem.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { iconPositionMd } from "../abstractions";
import { createMetadata, d, dComponent } from "../../components/metadata-helpers";
import { defaultExpandableItemProps, ExpandableItem, PART_CONTENT, PART_SUMMARY } from "./ExpandableItemNative";

const COMP = "ExpandableItem";

export const ExpandableItemMd = createMetadata({
  status: "stable",
  description:
    "`ExpandableItem` creates expandable/collapsible section, similar to the HTML " +
    "details disclosure element. When the user clicks on the `summary` the content " +
    "expands or collapses.",
  parts: {
    [PART_SUMMARY]: {
      description: "The summary section that is always visible and acts as the trigger.",
    },
    [PART_CONTENT]: {
      description: "The content section that is expanded or collapsed.",
    },
  },
  props: {
    summary: dComponent("The summary content that is always visible and acts as the trigger."),
    initiallyExpanded: {
      description: "Determines if the component is initially expanded when rendered.",
      valueType: "boolean",
      defaultValue: defaultExpandableItemProps.initiallyExpanded,
    },
    enabled: {
      description:
        "When true, the expandable item can be opened and closed. When false, it cannot be toggled.",
      valueType: "boolean",
      defaultValue: defaultExpandableItemProps.enabled,
    },
    iconCollapsed: {
      description: "The icon to display when the item is collapsed.",
      valueType: "string",
      defaultValue: defaultExpandableItemProps.iconCollapsed,
    },
    iconExpanded: {
      description: "The icon to display when the item is expanded.",
      valueType: "string",
      defaultValue: defaultExpandableItemProps.iconExpanded,
    },
    iconPosition: {
      description: "Determines the position of the icon (start or end).",
      valueType: "string",
      availableValues: iconPositionMd,
      defaultValue: defaultExpandableItemProps.iconPosition,
    },
    withSwitch: {
      description: "When true, a switch is used instead of an icon to toggle the expanded state.",
      valueType: "boolean",
      defaultValue: defaultExpandableItemProps.withSwitch,
    },
  },
  events: {
    expandedChange: {
      description:
        `This event fires when the expandable item is expanded or collapsed. It provides a boolean value indicating the new state.`,
      signature: "expandedChange(isExpanded: boolean): void",
      parameters: {
        isExpanded: "A boolean indicating whether the item is now expanded (true) or collapsed (false).",
      },
    },
  },
  apis: {
    expand: {
      description: `This method expands the item.`,
      signature: "expand(): void",
    },
    collapse: {
      description: `This method collapses the item.`,
      signature: "collapse(): void",
    },
    toggle: {
      description: `This method toggles the item's expanded state.`,
      signature: "toggle(): void",
    },
    isExpanded: {
      description: `This method returns a boolean indicating whether the item is currently expanded.`,
      signature: "isExpanded(): boolean",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-${COMP}--hover`]: "$color-secondary-100",
    [`backgroundColor-${COMP}--active`]: "$color-secondary-100",
    [`color-${COMP}`]: "$textColor-primary",
    [`color-${COMP}--disabled`]: "$textColor--disabled",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "0",
    [`borderBottomWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "0",
    [`paddingTop-${COMP}`]: "$space-2",
    [`paddingBottom-${COMP}`]: "$space-2",
    [`paddingLeft-${COMP}`]: "$space-0",
    [`paddingRight-${COMP}`]: "$space-0",
    [`padding-summary-${COMP}`]: "$space-2 $space-4",
    [`borderRadius-summary-${COMP}`]: "$borderRadius",
    [`transition-summary-${COMP}`]: "color 0.2s, background 0.2s",
    [`gap-${COMP}`]: "$space-2",
    [`paddingLeft-content-${COMP}`]: "$space-3",
    [`paddingRight-content-${COMP}`]: "$space-3",
    [`paddingVertical-content-${COMP}`]: "$space-2",
    [`animationDuration-content-${COMP}`]: "0.2s",
    [`animation-content-${COMP}`]: "ease-out",
  },
});

export const expandableItemComponentRenderer = createComponentRenderer(
  COMP,
  ExpandableItemMd,
  ({ node, renderChild, lookupEventHandler, registerComponentApi, extractValue, className }) => {
    // Handle summary as either a string or a component definition
    const summaryProp = node.props?.summary;
    const summaryContent = summaryProp
      ? typeof summaryProp === 'object' && summaryProp.type
        ? renderChild(summaryProp)
        : extractValue(summaryProp)
      : undefined;
    
    return (
      <ExpandableItem
        summary={summaryContent}
        initiallyExpanded={extractValue.asOptionalBoolean(
          node.props.initiallyExpanded,
          defaultExpandableItemProps.initiallyExpanded,
        )}
        enabled={extractValue.asOptionalBoolean(
          node.props.enabled,
          defaultExpandableItemProps.enabled,
        )}
        iconExpanded={
          extractValue(node.props?.iconExpanded) ?? defaultExpandableItemProps.iconExpanded
        }
        iconCollapsed={
          extractValue(node.props?.iconCollapsed) ?? defaultExpandableItemProps.iconCollapsed
        }
        iconPosition={
          extractValue.asOptionalString(node.props.iconPosition) ??
          defaultExpandableItemProps.iconPosition
        }
        withSwitch={extractValue.asOptionalBoolean(
          node.props.withSwitch,
          defaultExpandableItemProps.withSwitch,
        )}
        onExpandedChange={lookupEventHandler("expandedChange")}
        className={className}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </ExpandableItem>
    );
  },
);
