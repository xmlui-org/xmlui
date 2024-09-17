import styles from "./NoResult.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { NoResult } from "./NoResultNative";
import { dLabel } from "@components/metadata-helpers";
import { createComponentRenderer } from "@components-core/renderers";

const COMP = "NoResult";

export const NoResultMd = createMetadata({
  description:
    `\`${COMP}\` is a component that displays a visual indication that some data query (search) ` +
    `resulted in no (zero) items.`,
  props: {
    label: dLabel(),
    icon: d(`This property defines the icon to display with the component.`),
    hideIcon: d(`This boolean property indicates if the icon should be hidden.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-vertical-${COMP}`]: "$space-2",
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
