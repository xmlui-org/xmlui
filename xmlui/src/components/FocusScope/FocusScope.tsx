import { createMetadata } from "../../component-core/metadata/helpers";
import { defaultProps } from "./FocusScope.defaults";

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

