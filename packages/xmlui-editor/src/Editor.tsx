import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Editor } from "./EditorNative";

const COMP = "Editor";

export const EditorMd = createMetadata({
  description: "XMLUI Editor",
  status: "experimental",
  props: {
    readOnly: {
      description: "Whether the editor is read-only or not.",
    },
    language: {
      description: "The language of the editor.",
    },
    highlight: {
      description: "Whether to highlight the editor or not.",
    },
    value: {
      description: "The value of the editor.",
      valueType: "string",
    }
  },
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const editorComponentRenderer = createComponentRenderer(
  COMP,
  EditorMd,
  ({ extractValue, node, layoutCss, renderChild }: any) => {
    return (
      <Editor
        readOnly={extractValue.asOptionalBoolean(node.props?.readOnly)}
        language={extractValue.asOptionalString(node.props?.language)}
        highlight={extractValue.asOptionalBoolean(node.props?.highlight)}
        value={extractValue.asOptionalString(node.props?.value)}
        style={layoutCss}
      />
    );
  },
);
