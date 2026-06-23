import { createMetadata } from "../../component-core/metadata/helpers";

const COMP = "NavGroup";

export const defaultNavGroupProps = {
  initiallyExpanded: false,
  enabled: true,
  noIndicator: false,
  iconHorizontalExpanded: "chevronright",
  iconHorizontalCollapsed: "chevronright",
  iconVerticalExpanded: "chevrondown",
  iconVerticalCollapsed: "chevronright",
  iconAlignment: "center",
  expandIconAlignment: "start",
};

export const NavGroupMd = createMetadata({
  status: "in progress",
  description:
    "`NavGroup` creates collapsible containers for organizing related navigation items.",
  props: {
    label: {
      description: "The group label.",
      valueType: "string",
    },
    initiallyExpanded: {
      description: "Whether the group is initially expanded.",
      valueType: "boolean",
      defaultValue: defaultNavGroupProps.initiallyExpanded,
    },
    enabled: {
      description: "Whether the group can be toggled.",
      valueType: "boolean",
      defaultValue: defaultNavGroupProps.enabled,
    },
    to: {
      description: "Optional navigation target for the group header.",
      valueType: "string",
    },
    icon: {
      description: "Optional icon name.",
      valueType: "string",
    },
    iconHorizontalExpanded: {
      description: "Horizontal expanded icon.",
      valueType: "string",
      defaultValue: defaultNavGroupProps.iconHorizontalExpanded,
    },
    iconVerticalExpanded: {
      description: "Vertical expanded icon.",
      valueType: "string",
      defaultValue: defaultNavGroupProps.iconVerticalExpanded,
    },
    iconHorizontalCollapsed: {
      description: "Horizontal collapsed icon.",
      valueType: "string",
      defaultValue: defaultNavGroupProps.iconHorizontalCollapsed,
    },
    iconVerticalCollapsed: {
      description: "Vertical collapsed icon.",
      valueType: "string",
      defaultValue: defaultNavGroupProps.iconVerticalCollapsed,
    },
    noIndicator: {
      description: "Hides the visual active indicator on the group header.",
      valueType: "boolean",
      defaultValue: defaultNavGroupProps.noIndicator,
    },
    iconAlignment: {
      description: "Controls icon alignment.",
      valueType: "string",
      availableValues: ["baseline", "start", "center", "end"],
      defaultValue: defaultNavGroupProps.iconAlignment,
    },
    expandIconAlignment: {
      description: "Controls expand/collapse icon alignment.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultNavGroupProps.expandIconAlignment,
    },
  },
  themeVars: {
    [`paddingVertical-${COMP}`]: "NavGroup vertical padding.",
    [`paddingHorizontal-${COMP}`]: "NavGroup horizontal padding.",
    [`marginTop-items-${COMP}`]: "Margin above child items.",
    [`marginBottom-items-${COMP}`]: "Margin below child items.",
    [`backgroundColor-${COMP}`]: "NavGroup header background.",
    [`backgroundColor-${COMP}--hover`]: "NavGroup header hover background.",
    [`textColor-${COMP}`]: "NavGroup header text color.",
    [`textColor-${COMP}--hover`]: "NavGroup header hover text color.",
    [`fontFamily-${COMP}`]: "NavGroup font family.",
    [`fontSize-${COMP}`]: "NavGroup font size.",
    [`borderRadius-${COMP}`]: "NavGroup border radius.",
    [`gap-${COMP}`]: "NavGroup header gap.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`marginTop-items-${COMP}`]: "0",
    [`marginBottom-items-${COMP}`]: "0",
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-${COMP}--hover`]: "$color-surface-100",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-${COMP}--hover`]: "$textColor-primary",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`gap-${COMP}`]: "$space-2",
  },
});
