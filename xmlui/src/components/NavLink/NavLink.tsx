import { createMetadata, dClick, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import navLinkStylesSource from "./NavLink.module.scss?xmlui-theme-vars";

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
  themeVars: extractScssThemeVars(navLinkStylesSource),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-${COMP}--hover`]: "transparent",
    [`backgroundColor-${COMP}--active`]: "transparent",
    [`backgroundColor-${COMP}--hover--active`]: "transparent",
    [`backgroundColor-${COMP}--pressed`]: "transparent",
    [`backgroundColor-${COMP}--pressed--active`]: "transparent",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-${COMP}--active`]: "$color-primary-500",
    [`textColor-${COMP}--hover`]: "$textColor-primary",
    [`textColor-${COMP}--hover--active`]: "$color-primary-500",
    [`textColor-${COMP}--pressed`]: "$textColor-primary",
    [`textColor-${COMP}--pressed--active`]: "$color-primary-500",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontWeight-${COMP}--active`]: "$fontWeight-normal",
    [`fontWeight-${COMP}--pressed`]: "$fontWeight-normal",
    [`lineHeight-${COMP}`]: "$lineHeight-relaxed",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`wordWrap-${COMP}`]: "break-word",
    [`borderRadius-indicator-${COMP}`]: "$borderRadius",
    [`thickness-indicator-${COMP}`]: "$space-0_5",
    [`color-indicator-${COMP}--active`]: "$color-primary-500",
    [`color-indicator-${COMP}--pressed`]: "$color-primary-500",
    [`color-indicator-${COMP}--hover`]: "$color-primary-600",
    [`gap-icon-${COMP}`]: "$space-3",
    [`color-icon-${COMP}`]: "$color-surface-500",
  },
});
