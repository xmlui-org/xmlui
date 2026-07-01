import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { NavGroupMd, defaultNavGroupProps } from "./NavGroup";
import { NavGroupComponent } from "./NavGroupReact";
import { ThemedIcon } from "../Icon/Icon";
import navLinkStyles from "../NavLink/NavLink.module.scss";

export const navGroupRenderer = wrapComponent({
  name: "NavGroup",
  metadata: NavGroupMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const to = adapter.stringProp("to");
    const hasIconVerticalCollapsed = Object.prototype.hasOwnProperty.call(
      adapter.node.props,
      "iconVerticalCollapsed",
    );
    return (
      <NavGroupComponent
        {...adapter.rootAttrs()}
        disabled={!adapter.booleanProp("enabled", defaultNavGroupProps.enabled)}
        initiallyExpanded={adapter.booleanProp("initiallyExpanded", defaultNavGroupProps.initiallyExpanded)}
        label={adapter.stringProp("label")}
        icon={adapter.stringProp("icon")
          ? <ThemedIcon name={adapter.stringProp("icon")} className={navLinkStyles.icon} />
          : undefined}
        iconHorizontalCollapsed={adapter.stringProp("iconHorizontalCollapsed", defaultNavGroupProps.iconHorizontalCollapsed)}
        iconHorizontalExpanded={adapter.stringProp("iconHorizontalExpanded", defaultNavGroupProps.iconHorizontalExpanded)}
        iconVerticalCollapsed={hasIconVerticalCollapsed
          ? adapter.stringProp("iconVerticalCollapsed", defaultNavGroupProps.iconVerticalCollapsed)
          : undefined}
        iconVerticalExpanded={adapter.stringProp("iconVerticalExpanded", defaultNavGroupProps.iconVerticalExpanded)}
        noIndicator={adapter.booleanProp("noIndicator", defaultNavGroupProps.noIndicator)}
        iconAlignment={adapter.stringProp("iconAlignment", defaultNavGroupProps.iconAlignment) as "baseline" | "start" | "center" | "end"}
        expandIconAlignment={adapter.stringProp("expandIconAlignment", defaultNavGroupProps.expandIconAlignment) as "start" | "end"}
        to={to}
        onNavigate={() => {
          if (to) {
            adapter.scope.routing?.navigate(to);
          }
        }}
      >
        {adapter.renderChildren()}
      </NavGroupComponent>
    );
  },
});
