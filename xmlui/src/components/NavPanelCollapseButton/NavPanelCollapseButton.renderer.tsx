import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import {
  defaultNavPanelCollapseButtonProps,
  NavPanelCollapseButtonMd,
} from "./NavPanelCollapseButton";
import { NavPanelCollapseButtonComponent } from "./NavPanelCollapseButtonReact";

export const navPanelCollapseButtonRenderer = wrapComponent({
  name: "NavPanelCollapseButton",
  metadata: NavPanelCollapseButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <NavPanelCollapseButtonComponent
      {...adapter.rootAttrs()}
      aria-label={adapter.stringProp("aria-label", defaultNavPanelCollapseButtonProps.ariaLabel)}
      aria-labelCollapsed={adapter.stringProp("aria-labelCollapsed", defaultNavPanelCollapseButtonProps.ariaLabelCollapsed)}
      icon={adapter.stringProp("icon", defaultNavPanelCollapseButtonProps.icon)}
      iconCollapsed={adapter.stringProp("iconCollapsed", defaultNavPanelCollapseButtonProps.iconCollapsed)}
    />
  ),
});
