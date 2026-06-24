import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { FocusScopeMd } from "./FocusScope";
import { defaultProps } from "./FocusScope.defaults";
import { FocusScope } from "./FocusScopeReact";

export const focusScopeRenderer = wrapComponent({
  name: "FocusScope",
  metadata: FocusScopeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <FocusScope
        {...rootAttrs}
        autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
        restore={adapter.booleanProp("restore", defaultProps.restore)}
        trap={adapter.booleanProp("trap", defaultProps.trap)}
      >
        {adapter.renderChildren()}
      </FocusScope>
    );
  },
});

