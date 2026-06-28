import { createComponentRenderer, createMetadata } from "xmlui";
import { CodeView } from "./CodeViewReact";

const metadata = createMetadata({
  status: "experimental",
  description: "Renders syntax-highlighted generated XMLUI source.",
  props: {
    code: {
      description: "The XMLUI source to render.",
      valueType: "string",
    },
  },
});

export const codeViewRenderer = createComponentRenderer(
  "CodeView",
  metadata,
  ({ node, extractValue }) => <CodeView code={extractValue.asOptionalString(node.props.code)} />,
);

export default {
  namespace: "XMLUIExtensions",
  components: [codeViewRenderer],
};
