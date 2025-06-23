import styles from "./NoResult.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dLabel } from "../metadata-helpers";
import { NoResult, defaultProps } from "./NoResultNative";

const COMP = "NoResult";

export const NoResultMd = createMetadata({
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <NoResult
        label={extractValue.asDisplayText(node.props.label || node.children || "No results found")}
        icon={node.props.icon}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        style={layoutCss}
      />
    );
  },
);
