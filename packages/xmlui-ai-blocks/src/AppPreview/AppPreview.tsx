import { createComponentRenderer, createMetadata } from "xmlui";
import { AppPreview } from "./AppPreviewReact";

const metadata = createMetadata({
  status: "experimental",
  description:
    "Compiles and renders generated XMLUI source in an isolated preview, falling back to the last renderable app.",
  props: {
    code: {
      description: "The XMLUI source to render.",
      valueType: "string",
    },
    lastSuccessfulCode: {
      description: "Last generated XMLUI source that successfully parsed.",
      valueType: "string",
    },
    status: {
      description: "Current generation status.",
      valueType: "string",
    },
    activeTheme: {
      description: "Theme id to activate inside the generated app preview.",
      valueType: "string",
    },
    activeTone: {
      description: "Tone to activate inside the generated app preview.",
      valueType: "string",
    },
  },
});

export const xmluiPreviewRenderer = createComponentRenderer(
  "XmluiPreview",
  metadata,
  ({ node, extractValue, updateState }) => (
    <AppPreview
      code={extractValue.asOptionalString(node.props.code)}
      lastSuccessfulCode={extractValue.asOptionalString(node.props.lastSuccessfulCode)}
      status={extractValue.asOptionalString(node.props.status)}
      activeTheme={extractValue.asOptionalString(node.props.activeTheme)}
      activeTone={extractValue.asOptionalString(node.props.activeTone)}
      updateState={updateState}
    />
  ),
);

export default {
  namespace: "XMLUIExtensions",
  components: [xmluiPreviewRenderer],
};
