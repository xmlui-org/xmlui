import styles from "./NestedApp.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { defaultProps } from "./defaultProps";

const COMP = "NestedApp";

export const NestedAppMd = createMetadata({
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
    title: {
      description: "The optional title of the nested app. If not set, no title is displayed.",
    },
    height: {
      description:
        "The height of the nested app. If not set, the height is determined automatically.",
    },
    allowPlaygroundPopup: {
      description:
        "This property defines whether the nested app can be opened in the xmlui playground.",
      valueType: "boolean",
      defaultValue: defaultProps.allowPlaygroundPopup,
    },
    withFrame: {
      description: "This property defines whether the nested app should be displayed with a frame.",
      valueType: "boolean",
      defaultValue: defaultProps.withFrame,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`marginTop-${COMP}`]: "$space-3",
    [`marginBottom-${COMP}`]: "$space-3",
    [`padding-${COMP}`]: "$space-4",
    [`paddingTop-${COMP}`]: "$space-2",
    [`border-${COMP}`]: "1px solid $color-surface-100",
    [`borderRadius-${COMP}`]: "$space-4",
    [`backgroundColor-frame-${COMP}`]: "$color-primary-50",
    [`gap-frame-${COMP}`]: "$space-4",
    [`fontWeight-header-${COMP}`]: "$fontWeight-bold",
    [`boxShadow-${COMP}`]: "$boxShadow-md",
  },
});

export const nestedAppComponentRenderer = createComponentRenderer(
  COMP,
  NestedAppMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <IndexAwareNestedApp
        app={node.props?.app}
        style={layoutCss}
        api={extractValue(node.props?.api)}
        components={extractValue(node.props?.components)}
        config={extractValue(node.props?.config)}
        activeTheme={extractValue(node.props?.activeTheme)}
        activeTone={extractValue(node.props?.activeTone)}
        title={extractValue(node.props?.title)}
        height={extractValue(node.props?.height)}
        allowPlaygroundPopup={extractValue.asOptionalBoolean(node.props?.allowPlaygroundPopup)}
        withFrame={extractValue.asOptionalBoolean(node.props?.withFrame)}
      />
    );
  },
);
