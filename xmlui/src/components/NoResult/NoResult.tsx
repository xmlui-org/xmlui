import styles from "./NoResult.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dLabel } from "../metadata-helpers";
import { NoResult, defaultProps } from "./NoResultNative";

const COMP = "NoResult";

export const NoResultMd = createMetadata({
  status: "stable",
  description: "`NoResult` displays a visual indication that a query or search returned nothing.",
  props: {
    label: dLabel(),
    icon: {
      description: `This property defines the icon to display with the component.`,
      valueType: "string",
      defaultValue: defaultProps.icon,
    },
    hideIcon: {
      description: `This boolean property indicates if the icon should be hidden.`,
      valueType: "boolean",
      defaultValue: defaultProps.hideIcon,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`gap-icon-${COMP}`]: "$space-2",
    [`size-icon-${COMP}`]: "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const noResultComponentRenderer = createComponentRenderer(
  COMP,
  NoResultMd,
  ({ node, extractValue, className }) => {
    return (
      <NoResult
        label={extractValue.asDisplayText(node.props.label || node.children || "No results found")}
        icon={node.props.icon}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        className={className}
      />
    );
  },
);
