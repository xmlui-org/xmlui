import { createComponentRenderer } from "../../components-core/renderers";
import { ThemedButton as Button } from "../Button/Button";
import { ThemedIcon } from "../Icon/Icon";
import { createMetadata } from "../metadata-helpers";
import { useAppLayoutContext } from "../App/AppLayoutContext";

const COMP = "NavPanelCollapseButton";

export const NavPanelCollapseButtonMd = createMetadata({
  status: "experimental",
  description:
    "`NavPanelCollapseButton` toggles the sidebar (NavPanel) collapse state when used in a vertical app layout. " +
    "Place it in the NavPanel footer (e.g. next to ToneChangerButton) for a Nextra-like sidebar toggle.",
  props: {
    icon: {
      description: "Icon name for the button when the panel is expanded (collapse action).",
      valueType: "string",
      defaultValue: "sidebar-collapse",
    },
    iconCollapsed: {
      description: "Icon name for the button when the panel is collapsed (expand action).",
      valueType: "string",
      defaultValue: "sidebar-collapse",
    },
    "aria-label": {
      description: "Accessible label for the button when expanded.",
      valueType: "string",
    },
    "aria-labelCollapsed": {
      description: "Accessible label for the button when collapsed.",
      valueType: "string",
    },
  },
});

export function NavPanelCollapseButton({
  icon = "sidebar-collapse",
  iconCollapsed = "sidebar-collapse",
  "aria-label": ariaLabel = "Collapse sidebar",
  "aria-labelCollapsed": ariaLabelCollapsed = "Expand sidebar",
}) {
  const layoutContext = useAppLayoutContext();
  const collapsed = layoutContext?.navPanelCollapsed ?? false;
  const toggle = layoutContext?.toggleNavPanelCollapsed;

  if (!toggle) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      icon={<ThemedIcon name={collapsed ? iconCollapsed : icon} />}
      aria-label={collapsed ? ariaLabelCollapsed : ariaLabel}
      onClick={toggle}
    />
  );
}

export const navPanelCollapseButtonComponentRenderer = createComponentRenderer(
  COMP,
  NavPanelCollapseButtonMd,
  ({ node, extractValue }) => {
    return (
      <NavPanelCollapseButton
        icon={extractValue.asOptionalString(node.props.icon)}
        iconCollapsed={extractValue.asOptionalString(node.props.iconCollapsed)}
        aria-label={extractValue.asOptionalString(node.props["aria-label"], "Collapse sidebar")}
        aria-labelCollapsed={extractValue.asOptionalString(
          node.props["aria-labelCollapsed"],
          "Expand sidebar",
        )}
      />
    );
  },
);
