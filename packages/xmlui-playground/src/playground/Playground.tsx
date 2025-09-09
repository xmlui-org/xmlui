import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Playground } from "./PlaygroundNative";

const COMP = "Playground";

export const PlaygroundMd = createMetadata({
  description: "XMLUI Playground component.",
  status: "experimental",
  props: {
    app: {
      description: "",
    },
    name: {
      description: "The name of the component to be rendered.",
    },
    api: {
      description: "",
    },
    description: {
      description: "The description of the component to be rendered.",
    },
    previewOnly: {
      description: "If true, the component will be rendered in preview mode only.",
    },
  },
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const playgroundComponentRenderer = createComponentRenderer(
  COMP,
  PlaygroundMd,
  ({ extractValue, node, renderChild }: any) => {
    return (
      <Playground
        height={extractValue(node.props.height)}
        initialEditorHeight={extractValue.asOptionalString(node.props.initialEditorHeight)}
        swapped={extractValue.asOptionalBoolean(node.props.swapped)}
        horizontal={extractValue.asOptionalBoolean(node.props.horizontal)}
        allowStandalone={extractValue.asOptionalBoolean(node.props.allowStandalone)}
        fixedTheme={extractValue.asOptionalBoolean(node.props.fixedTheme)}
        themes={extractValue(node.props.themes)}
        previewOnly={extractValue.asBoolean(node.props.previewOnly)}
        components={extractValue(node.props.components)}
        app={extractValue.asOptionalString(node.props.app)}
        name={extractValue.asOptionalString(node.props.name)}
        api={extractValue(node.props.api)}
        description={extractValue.asOptionalString(node.props.description)}
      />
    );
  },
);
