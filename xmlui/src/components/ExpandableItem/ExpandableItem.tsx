import styles from "./ExpandableItem.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { iconPositionMd } from "../abstractions";
import { dComponent } from "../../components/metadata-helpers";
import { defaultExpandableItemProps, ExpandableItem } from "./ExpandableItemNative";

const COMP = "ExpandableItem";

export const ExpandableItemMd = createMetadata({
  description:
    "`ExpandableItem` creates expandable/collapsible section, similar to the HTML " +
    "details disclosure element. When the user clicks on the `summary` the content " +
    "expands or collapses.",
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
    expandedChange: d(
      `This event fires when the expandable item is expanded or collapsed. It provides a boolean value indicating the new state.`,
    ),
  },
  apis: {
    expand: d(`This method expands the expandable item.`),
    collapse: d(`This method collapses the expandable item.`),
    toggle: d(`This method toggles the expandable item's expanded state.`),
    isExpanded: d(
      `This method returns a boolean indicating whether the expandable item is currently expanded.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
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
    [`gap-${COMP}`]: "$space-2",
    [`paddingLeft-content-${COMP}`]: "$space-3",
    [`paddingRight-content-${COMP}`]: "$space-3",
    [`paddingVertical-content-${COMP}`]: "$space-2",
    [`transition-${COMP}`]: "0.2s ease",
  },
});

export const expandableItemComponentRenderer = createComponentRenderer(
  COMP,
  ExpandableItemMd,
  ({ node, renderChild, lookupEventHandler, registerComponentApi, extractValue, layoutCss }) => {
    return (
      <ExpandableItem
        summary={extractValue(node.props?.summary)}
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
        style={layoutCss}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </ExpandableItem>
    );
  },
);
