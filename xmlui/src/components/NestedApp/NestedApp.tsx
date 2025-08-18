import styles from "./NestedApp.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { defaultProps } from "./defaultProps";
import { createMetadata } from "../metadata-helpers";

const COMP = "NestedApp";

export const NestedAppMd = createMetadata({
  status: "stable",
  description: `The ${COMP} component allows you to nest an entire xmlui app into another one.
`,
  props: {
    app: {
      description: "The source markup of the app to be nested",
    },
    api: {
      description: "This property defines an optional emulated API to be used with the nested app.",
    },
    components: {
      description:
        "This property defines an optional list of components to be used with the nested app.",
      defaultValue: defaultProps.components,
    },
    config: {
      description: "You can define the nested app's configuration with this property.",
    },
    activeTheme: {
      description:
        "This property defines the active theme for the nested app. " +
        "If not set, the default theme is used.",
    },
    activeTone: {
      description:
        "This property defines the active tone for the nested app. " +
        "If not set, the default tone is used.",
    },
    height: {
      description:
        "The height of the nested app. If not set, the height is determined automatically.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`marginTop-${COMP}`]: "$space-3",
    [`marginBottom-${COMP}`]: "$space-3",
    [`padding-${COMP}`]: "0",
    [`paddingTop-${COMP}`]: "0",
    [`border-${COMP}`]: "0.5px solid $borderColor",
    [`borderRadius-${COMP}`]: "$space-2",
    [`backgroundColor-frame-${COMP}`]: "$color-primary-50",
    [`gap-frame-${COMP}`]: "0",
    [`fontWeight-header-${COMP}`]: "$fontWeight-bold",
    [`boxShadow-${COMP}`]: "0px 0px 32px 0px rgba(0, 0, 0, 0.05)",
    [`backgroundColor-viewControls-${COMP}`]: "$color-primary-100",
    [`borderRadius-viewControls-${COMP}`]: "5px",
    [`padding-viewControls-${COMP}`]: "$space-0_5",
    [`borderBottom-header-${COMP}`]: "0.5px solid $borderColor",
    [`color-loadingText-${COMP}`]: "$color-surface-600",
    // --- Split view styles
    [`padding-button-splitView-${COMP}`]: "1px 6px",
    [`width-button-splitView-${COMP}`]: "60px",
    [`height-button-splitView-${COMP}`]: "19px",
    [`width-logo-splitView-${COMP}`]: "1.5rem",
    [`height-logo-splitView-${COMP}`]: "2rem",
    [`backgroundColor-button-splitView-${COMP}--active`]: "$color-surface-0",
    [`color-button-splitView-${COMP}`]: "$color-surface-600",
    [`color-button-splitView-${COMP}--active`]: "$color-primary",
    [`width-controls-${COMP}`]: "80px",
    [`backgroundColor-code-splitView-${COMP}`]: "$color-surface-0",
    [`borderRadius-button-splitView-${COMP}`]: "$space-1",
    [`borderColor-button-splitView-${COMP}`]: "transparent",
    dark: {
      [`backgroundColor-frame-${COMP}`]: "$color-surface-50",
      [`backgroundColor-button-splitView-${COMP}--active`]: "$color-surface-200",
      [`color-button-splitView-${COMP}`]: "$color-surface-500",
      [`color-button-splitView-${COMP}--active`]: "$color-surface-1",
    },
  },
});

export const nestedAppComponentRenderer = createComponentRenderer(
  COMP,
  NestedAppMd,
  ({ node, extractValue, className }) => {
    return (
      <IndexAwareNestedApp
        app={node.props?.app}
        className={className}
        api={extractValue(node.props?.api)}
        components={extractValue(node.props?.components)}
        config={extractValue(node.props?.config)}
        activeTheme={extractValue(node.props?.activeTheme)}
        activeTone={extractValue(node.props?.activeTone)}
        height={extractValue(node.props?.height)}
      />
    );
  },
);
