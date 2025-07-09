import styles from "./AppWithCodeView.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { AppWithCodeViewNative } from "./AppWithCodeViewNative";
import { defaultProps } from "./defaultProps";
import { createMetadata } from "../metadata-helpers";

const COMP = "AppWithCodeView";

export const AppWithCodeViewMd = createMetadata({
  status: "stable",
  description: `The ${COMP} component displays a combination of markdown content and a nested xmlui app. 
It supports both side-by-side and stacked layouts.`,
  props: {
    markdown: {
      description: "The markdown content to be displayed alongside the app",
      valueType: "string",
    },
    splitView: {
      description: "Whether to render the markdown and app side by side or stacked vertically",
      valueType: "boolean",
    },
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
  defaultThemeVars: {},
});

export const appWithCodeViewComponentRenderer = createComponentRenderer(
  COMP,
  AppWithCodeViewMd,
  ({ node, extractValue, renderChild }) => {
    let renderedChildren = "";

    // 1. Static content prop fallback
    if (!renderedChildren) {
      renderedChildren = extractValue.asString(node.props.markdown);
    }

    // 2. "data" property fallback
    if (!renderedChildren && typeof (node.props as any).data === "string") {
      renderedChildren = extractValue.asString((node.props as any).data);
    }

    // 3. Children fallback
    if (!renderedChildren) {
      (node.children ?? []).forEach((child) => {
        const renderedChild = renderChild(child);
        console.log("renderedChild", renderedChild);
        if (typeof renderedChild === "string") {
          renderedChildren += renderedChild;
        }
      });
    }

    return (
      <AppWithCodeViewNative
        markdown={renderedChildren}
        splitView={extractValue.asOptionalBoolean(node.props?.splitView)}
        app={node.props?.app}
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
