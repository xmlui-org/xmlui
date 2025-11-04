import { createComponentRenderer, createMetadata, NestedApp } from "xmlui";

const COMP = "Preview";

export const PreviewMd = createMetadata({
  status: "internal",
  description: "Preview component",
  props: {
    withSplashScreen: {
      description: "If true, the app will be rendered with a splash screen.",
    },
    app: {
      description: "The app to be rendered.",
    },
    components: {
      description: "The components to be used.",
    },
    config: {
      description: "The config to be used.",
    },
    activeTheme: {
      description: "The active theme.",
    },
    activeTone: {
      description: "The active tone.",
    },
    refreshVersion: {
      description: "The refresh version.",
    },
  },
});

export const previewRenderer = createComponentRenderer(
  COMP,
  PreviewMd,
  ({ extractValue, node }: any) => {
    return (
      <NestedApp
        withSplashScreen={extractValue.asOptionalBoolean(node.props.withSplashScreen)}
        app={extractValue.asOptionalString(node.props.app)}
        components={extractValue(node.props.components)}
        config={extractValue(node.props.config)}
        activeTheme={extractValue.asOptionalString(node.props.activeTheme)}
        activeTone={extractValue.asOptionalString(node.props.activeTone)}
        refreshVersion={extractValue.asOptionalNumber(node.props.refreshVersion)}
      />
    );
  },
);
