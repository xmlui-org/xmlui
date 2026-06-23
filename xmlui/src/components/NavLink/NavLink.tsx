import { createMetadata, dClick, dComponent } from "../../component-core/metadata/helpers";

const COMP = "NavLink";

export const defaultNavLinkProps = {
  active: false,
  displayActive: true,
  noIndicator: false,
  iconAlignment: "center" as "baseline" | "start" | "center" | "end",
};

export const NavLinkMd = createMetadata({
  status: "in progress",
  description:
    "`NavLink` creates interactive navigation items that connect users to routes or external URLs.",
  parts: {
    indicator: {
      description: "The active indicator within the NavLink component.",
    },
  },
  props: {
    to: {
      description: "The URL of the link.",
      valueType: "url",
    },
    enabled: {
      description: "Indicates whether the navigation link is enabled.",
      valueType: "boolean",
      defaultValue: true,
    },
    active: {
      description: "Forces the navigation link active state.",
      valueType: "boolean",
      defaultValue: defaultNavLinkProps.active,
    },
    target: {
      description: "Specifies where to open the clicked link.",
      valueType: "string",
      availableValues: ["_blank", "_self", "_parent", "_top"],
    },
    label: {
      description: "The visible navigation label.",
      valueType: "string",
    },
    vertical: {
      description: "Displays the active indicator vertically.",
      valueType: "boolean",
    },
    displayActive: {
      description: "Controls whether active state should have a visual indication.",
      valueType: "boolean",
      defaultValue: defaultNavLinkProps.displayActive,
    },
    noIndicator: {
      description: "Hides the active/hover indicator.",
      valueType: "boolean",
      defaultValue: defaultNavLinkProps.noIndicator,
    },
    exact: {
      description: "Only considers the link active when the current URL matches exactly.",
      valueType: "boolean",
    },
    icon: {
      description: "Optional icon name to display before the label.",
      valueType: "icon",
    },
    iconTemplate: dComponent("Optional rendered icon content."),
    iconAlignment: {
      description: "Controls vertical icon alignment when the label wraps.",
      valueType: "string",
      availableValues: ["baseline", "start", "center", "end"],
      defaultValue: defaultNavLinkProps.iconAlignment,
    },
    level: {
      description: "The nesting level for the navigation link.",
      valueType: "number",
      availableValues: [1, 2, 3, 4],
    },
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: {
    [`backgroundColor-${COMP}`]: "NavLink background.",
    [`backgroundColor-${COMP}--hover`]: "NavLink hover background.",
    [`backgroundColor-${COMP}--active`]: "NavLink active background.",
    [`textColor-${COMP}`]: "NavLink text color.",
    [`textColor-${COMP}--hover`]: "NavLink hover text color.",
    [`textColor-${COMP}--active`]: "NavLink active text color.",
    [`fontFamily-${COMP}`]: "NavLink font family.",
    [`fontSize-${COMP}`]: "NavLink font size.",
    [`fontWeight-${COMP}`]: "NavLink font weight.",
    [`paddingVertical-${COMP}`]: "NavLink vertical padding.",
    [`paddingHorizontal-${COMP}`]: "NavLink horizontal padding.",
    [`borderRadius-${COMP}`]: "NavLink border radius.",
    [`thickness-indicator-${COMP}`]: "NavLink active indicator thickness.",
    [`color-indicator-${COMP}--active`]: "NavLink active indicator color.",
    [`gap-icon-${COMP}`]: "Gap between icon and label.",
    [`color-icon-${COMP}`]: "NavLink icon color.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-${COMP}--active`]: "transparent",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-${COMP}--hover`]: "$textColor-primary",
    [`textColor-${COMP}--active`]: "$color-primary-500",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`thickness-indicator-${COMP}`]: "$space-0_5",
    [`color-indicator-${COMP}--active`]: "$color-primary-500",
    [`gap-icon-${COMP}`]: "$space-3",
    [`color-icon-${COMP}`]: "$color-surface-500",
  },
});
