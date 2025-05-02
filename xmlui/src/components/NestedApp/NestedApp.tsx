import styles from "./NestedApp.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { NestedApp } from "./NestedAppNative";
import { title } from "process";

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
    },
    config: {
      description: "You can define the nested app's configuration with this property.",
    },
    activeTheme: {
      description: "This property defines the active theme for the nested app.",
    },
    activeTone: {
      description: "This property defines the active tone for the nested app.",
    },
    title: {
      description: "The title of the nested app.",
    },
    height: {
      description: "The height of the nested app.",
    },
    allowPlaygroundPopup: {
      description:
        "This property defines whether the nested app can be opened in the xmlui playground.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`marginTop-${COMP}`]: "$space-3",
    [`marginBottom-${COMP}`]: "$space-3",
    [`padding-${COMP}`]: "$space-4",
    [`paddingTop-${COMP}`]: "$space-3",
    [`borderRadius-${COMP}`]: "$space-4",
    [`backgroundColor-frame-${COMP}`]: "$color-primary-100",
    [`gap-frame-${COMP}`]: "$space-4",
    [`fontWeight-header-${COMP}`]: "$fontWeight-bold",
  },
});

export const nestedAppComponentRenderer = createComponentRenderer(
  COMP,
  NestedAppMd,
  ({ node, extractValue }) => {
    return (
      <NestedApp
        app={node.props?.app}
        api={extractValue(node.props?.api)}
        components={extractValue(node.props?.components)}
        config={extractValue(node.props?.config)}
        activeTheme={extractValue(node.props?.activeTheme)}
        activeTone={extractValue(node.props?.activeTone)}
        title={extractValue(node.props?.title)}
        height={extractValue(node.props?.height)}
        allowPlaygroundPopup={extractValue.asOptionalBoolean(node.props?.allowPlaygroundPopup)}
      />
    );
  },
);
