import styles from "./NestedApp.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { NestedApp } from "./NestedAppNative";

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
      description:
        "You can define the nested app's configuration with this property.",
    },
    activeTheme: {
      description:
        "This property defines the active theme for the nested app.",
    },
    activeTone: {
      description:
        "This property defines the active tone for the nested app.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "4px",
    [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`border-${COMP}`]: "0px solid $color-surface-400A80",
    [`backgroundColor-${COMP}`]: "$color-surface-100",
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
      />
    );
  },
);
