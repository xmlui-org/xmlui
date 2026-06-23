import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./ExpandableItem.defaults";
import { PART_CONTENT, PART_SUMMARY } from "./ExpandableItem.constants";

const COMP = "ExpandableItem";
const expandableItemStylesSource = `
  createThemeVar("backgroundColor-ExpandableItem");
  createThemeVar("backgroundColor-ExpandableItem--hover");
  createThemeVar("backgroundColor-ExpandableItem--active");
  createThemeVar("backgroundColor-summary-ExpandableItem");
  createThemeVar("backgroundColor-summary-ExpandableItem--hover");
  createThemeVar("backgroundColor-summary-ExpandableItem--active");
  createThemeVar("borderRadius-summary-ExpandableItem");
  createThemeVar("color-ExpandableItem");
  createThemeVar("color-ExpandableItem--disabled");
  createThemeVar("fontFamily-ExpandableItem");
  createThemeVar("fontSize-ExpandableItem");
  createThemeVar("fontWeight-ExpandableItem");
  createThemeVar("borderColor-ExpandableItem");
  createThemeVar("borderWidth-ExpandableItem");
  createThemeVar("borderBottomWidth-ExpandableItem");
  createThemeVar("borderStyle-ExpandableItem");
  createThemeVar("borderRadius-ExpandableItem");
  createThemeVar("paddingTop-ExpandableItem");
  createThemeVar("paddingBottom-ExpandableItem");
  createThemeVar("paddingLeft-ExpandableItem");
  createThemeVar("paddingRight-ExpandableItem");
  createThemeVar("padding-summary-ExpandableItem");
  createThemeVar("paddingVertical-summary-ExpandableItem");
  createThemeVar("paddingHorizontal-summary-ExpandableItem");
  createThemeVar("paddingLeft-content-ExpandableItem");
  createThemeVar("paddingRight-content-ExpandableItem");
  createThemeVar("paddingVertical-content-ExpandableItem");
  createThemeVar("gap-ExpandableItem");
  createThemeVar("transition-summary-ExpandableItem");
  createThemeVar("animation-content-ExpandableItem");
  createThemeVar("animationDuration-content-ExpandableItem");
`;

export const ExpandableItemMd = createMetadata({
  status: "in progress",
  description:
    "`ExpandableItem` creates an expandable/collapsible section, similar to the HTML details disclosure element.",
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
      defaultValue: defaultProps.initiallyExpanded,
    },
    enabled: {
      description: "When true, the expandable item can be opened and closed.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    iconCollapsed: {
      description: "The icon to display when the item is collapsed.",
      valueType: "string",
      defaultValue: defaultProps.iconCollapsed,
    },
    iconExpanded: {
      description: "The icon to display when the item is expanded.",
      valueType: "string",
      defaultValue: defaultProps.iconExpanded,
    },
    iconPosition: {
      description: "Determines the position of the icon.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultProps.iconPosition,
    },
    withSwitch: {
      description: "When true, a switch is used instead of an icon to toggle the expanded state.",
      valueType: "boolean",
      defaultValue: defaultProps.withSwitch,
    },
    contentWidth: {
      description: "Sets the width of the expanded content area.",
      valueType: "string",
      defaultValue: defaultProps.contentWidth,
    },
    fullWidthSummary: {
      description: "When true, the summary section takes the full width of the parent container.",
      valueType: "boolean",
      defaultValue: defaultProps.fullWidthSummary,
    },
    testId: {
      description: "Adds a test identifier to the ExpandableItem root.",
      valueType: "string",
    },
  },
  events: {
    expandedChange: {
      description: "This event fires when the expandable item is expanded or collapsed.",
      signature: "expandedChange(isExpanded: boolean): void",
      parameters: {
        isExpanded: "A boolean indicating whether the item is now expanded.",
      },
    },
  },
  apis: {
    expand: {
      description: "This method expands the item.",
      signature: "expand(): void",
    },
    collapse: {
      description: "This method collapses the item.",
      signature: "collapse(): void",
    },
    toggle: {
      description: "This method toggles the item's expanded state.",
      signature: "toggle(): void",
    },
    isExpanded: {
      description: "This method returns whether the item is currently expanded.",
      signature: "isExpanded(): boolean",
    },
  },
  themeVars: extractScssThemeVars(expandableItemStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-summary-${COMP}--hover`]: "$color-secondary-100",
    [`backgroundColor-summary-${COMP}--active`]: "$color-secondary-100",
    [`color-${COMP}`]: "$textColor-primary",
    [`color-${COMP}--disabled`]: "$textColor--disabled",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "0",
    [`borderBottomWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "0",
    [`paddingTop-${COMP}`]: "$space-0",
    [`paddingBottom-${COMP}`]: "$space-0",
    [`paddingLeft-${COMP}`]: "$space-0",
    [`paddingRight-${COMP}`]: "$space-0",
    [`padding-summary-${COMP}`]: "$space-2 $space-4",
    [`paddingVertical-summary-${COMP}`]: "$space-2",
    [`paddingHorizontal-summary-${COMP}`]: "$space-4",
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
