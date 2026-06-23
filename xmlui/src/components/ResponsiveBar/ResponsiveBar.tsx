import { createMetadata, dClick, dComponent } from "../../component-core/metadata/helpers";
import { defaultResponsiveBarProps } from "./ResponsiveBar.defaults";

const COMP = "ResponsiveBar";

export const ResponsiveBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveBar` is a layout container that automatically manages child component overflow by moving items that do not fit into a dropdown menu.",
  docFolder: COMP,
  parts: {
    overflow: {
      description: "The overflow dropdown container that holds items that do not fit in the bar.",
    },
  },
  props: {
    orientation: {
      description: "Layout direction of the responsive bar.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      defaultValue: defaultResponsiveBarProps.orientation,
    },
    overflowIcon: {
      description: "Icon to display in the dropdown trigger button when items overflow.",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.overflowIcon,
    },
    dropdownText: {
      description: "Text to display in the dropdown trigger button label when items overflow.",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.dropdownText,
    },
    dropdownAlignment: {
      description: "Alignment of the dropdown menu relative to the trigger button.",
      valueType: "string",
      availableValues: ["start", "center", "end"],
    },
    triggerTemplate: dComponent("Optional template used as the overflow trigger."),
    gap: {
      description: "Gap between child elements in pixels.",
      valueType: "number",
      defaultValue: defaultResponsiveBarProps.gap,
    },
    reverse: {
      description: "Reverses the direction of child elements.",
      valueType: "boolean",
      defaultValue: defaultResponsiveBarProps.reverse,
    },
    testId: {
      description: "Adds a test identifier to the ResponsiveBar root.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
    willOpen: {
      description: "Fires when the overflow dropdown menu is about to be opened.",
      signature: "willOpen(): boolean | void",
      parameters: {},
    },
  },
  apis: {
    close: {
      description: "Closes the overflow dropdown menu.",
      signature: "close(): void",
    },
    open: {
      description: "Opens the overflow dropdown menu.",
      signature: "open(): void",
    },
    hasOverflow: {
      description: "Returns true if the ResponsiveBar currently has an overflow menu.",
      signature: "hasOverflow(): boolean",
    },
  },
  contextVars: {
    $overflow: {
      description: "Indicates whether the child component is displayed in the overflow dropdown menu.",
      valueType: "boolean",
    },
  },
  themeVars: {
    [`backgroundColor-${COMP}`]: "ResponsiveBar background color.",
    [`padding-${COMP}`]: "ResponsiveBar padding.",
    [`margin-${COMP}`]: "ResponsiveBar margin.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`padding-${COMP}`]: "0",
    [`margin-${COMP}`]: "0",
  },
});

