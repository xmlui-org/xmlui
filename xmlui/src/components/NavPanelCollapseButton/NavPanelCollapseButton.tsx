import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";
import { createMetadata } from "../metadata-helpers";
import { useAppLayoutContext } from "../App/AppLayoutContext";

const COMP = "NavPanelCollapseButton";

export const NavPanelCollapseButtonMd = createMetadata({
  status: "stable",
  description:
    "`NavPanelCollapseButton` toggles the sidebar (NavPanel) collapse state when used in a vertical app layout. " +
    "Place it in the NavPanel footer (e.g. next to ToneChangerButton) for a Nextra-like sidebar toggle.",
  props: {
    icon: {
      description: "Icon name for the button when the panel is expanded (collapse action).",
      valueType: "string",
      defaultValue: "menu",
    },
    iconCollapsed: {
      description: "Icon name for the button when the panel is collapsed (expand action).",
      valueType: "string",
      defaultValue: "menu",
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
  icon = "menu",
  iconCollapsed = "menu",
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
      icon={<Icon name={collapsed ? iconCollapsed : icon} />}
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
        icon={extractValue.asOptionalString(node.props.icon, "menu")}
        iconCollapsed={extractValue.asOptionalString(node.props.iconCollapsed, "menu")}
        aria-label={extractValue.asOptionalString(node.props["aria-label"], "Collapse sidebar")}
        aria-labelCollapsed={extractValue.asOptionalString(
          node.props["aria-labelCollapsed"],
          "Expand sidebar",
        )}
      />
    );
  },
);
