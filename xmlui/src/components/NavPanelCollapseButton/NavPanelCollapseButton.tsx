import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultNavPanelCollapseButtonProps = {
  icon: "sidebar-collapse",
  iconCollapsed: "sidebar-collapse",
  ariaLabel: "Collapse sidebar",
  ariaLabelCollapsed: "Expand sidebar",
};

export const NavPanelCollapseButtonMd = createMetadata({
  status: "in progress",
  description:
    "`NavPanelCollapseButton` toggles the sidebar (NavPanel) collapse state when used in a vertical app layout.",
  props: {
    icon: {
      description: "Icon name for the button when the panel is expanded.",
      valueType: "string",
      defaultValue: defaultNavPanelCollapseButtonProps.icon,
    },
    iconCollapsed: {
      description: "Icon name for the button when the panel is collapsed.",
      valueType: "string",
      defaultValue: defaultNavPanelCollapseButtonProps.iconCollapsed,
    },
    "aria-label": {
      description: "Accessible label for the button when expanded.",
      valueType: "string",
    },
    "aria-labelCollapsed": {
      description: "Accessible label for the button when collapsed.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the button.",
      valueType: "string",
    },
  },
});
