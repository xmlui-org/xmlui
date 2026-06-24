import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { NavGroupMd, defaultNavGroupProps } from "./NavGroup";
import { NavGroupComponent } from "./NavGroupReact";

export const navGroupRenderer = wrapComponent({
  name: "NavGroup",
  metadata: NavGroupMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const to = adapter.stringProp("to");
    return (
      <NavGroupComponent
        {...adapter.rootAttrs()}
        disabled={!adapter.booleanProp("enabled", defaultNavGroupProps.enabled)}
        initiallyExpanded={adapter.booleanProp("initiallyExpanded", defaultNavGroupProps.initiallyExpanded)}
        label={adapter.stringProp("label")}
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
