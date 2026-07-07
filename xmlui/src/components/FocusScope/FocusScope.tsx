import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./FocusScope.defaults";
import { FocusScope } from "./FocusScopeReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import type { RuntimeRenderLayoutContext } from "../../runtime/rendering/types";

const COMP = "FocusScope";

export const FocusScopeMd = createMetadata({
  status: "stable",
  description:
    "`FocusScope` traps Tab navigation inside its subtree and restores focus " +
    "when the subtree unmounts. Use it for custom popovers, drawers, and modal surfaces.",
  props: {
    trap: {
      description: "When true, Tab and Shift+Tab cycle inside the scope.",
      valueType: "boolean",
      defaultValue: defaultProps.trap,
    },
    restore: {
      description: "When true, focus returns to the previously focused element on unmount.",
      valueType: "boolean",
      defaultValue: defaultProps.restore,
    },
    autoFocus: {
      description: "When true, the first focusable child receives focus after mount.",
      valueType: "boolean",
      defaultValue: defaultProps.autoFocus,
    },
  },
});

export const focusScopeComponentRenderer = wrapComponent(COMP, FocusScope, FocusScopeMd, {
  booleans: ["trap", "restore", "autoFocus"],
});

export const focusScopeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FocusScopeMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <FocusScope
      {...adapter.rootAttrs()}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      restore={adapter.booleanProp("restore", defaultProps.restore)}
      trap={adapter.booleanProp("trap", defaultProps.trap)}
    >
      {adapter.renderChildren(
        undefined,
        adapter.props.layoutContext as RuntimeRenderLayoutContext | undefined,
      )}
    </FocusScope>
  ),
});
