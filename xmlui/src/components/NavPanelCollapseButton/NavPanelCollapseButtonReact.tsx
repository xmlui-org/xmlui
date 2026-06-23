import type { CSSProperties } from "react";

import { Button } from "../Button/ButtonReact";
import {
  defaultNavPanelCollapseButtonProps,
} from "./NavPanelCollapseButton";
import { useNavPanelCollapseContext } from "./NavPanelCollapseContext";

export type NavPanelCollapseButtonProps = {
  "aria-label"?: string;
  "aria-labelCollapsed"?: string;
  "data-testid"?: string;
  "data-xmlui-id"?: string;
  id?: string;
  icon?: string;
  iconCollapsed?: string;
  style?: CSSProperties;
};

export function NavPanelCollapseButtonComponent({
  "aria-label": ariaLabel = defaultNavPanelCollapseButtonProps.ariaLabel,
  "aria-labelCollapsed": ariaLabelCollapsed = defaultNavPanelCollapseButtonProps.ariaLabelCollapsed,
  icon = defaultNavPanelCollapseButtonProps.icon,
  iconCollapsed = defaultNavPanelCollapseButtonProps.iconCollapsed,
  ...rest
}: NavPanelCollapseButtonProps) {
  const collapseContext = useNavPanelCollapseContext();
  if (!collapseContext) {
    return null;
  }

  const { collapsed, toggle } = collapseContext;
  const effectiveLabel = collapsed ? ariaLabelCollapsed : ariaLabel;

  return (
    <Button
      {...rest}
      aria-label={effectiveLabel}
      contextualLabel={effectiveLabel}
      data-nav-panel-collapsed={collapsed ? "true" : "false"}
      data-xmlui-component="NavPanelCollapseButton"
      icon={collapsed ? iconCollapsed : icon}
      onClick={toggle}
      variant="ghost"
    />
  );
}
