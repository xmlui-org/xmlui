import { createComponentRenderer, createMetadata } from "xmlui";
import { Editor } from "xmlui-devtools";

const COMP = "Editor";

export const EditorMd = createMetadata({
  status: "internal",
  description: "Editor component",
  props: {
    value: {
      description: "The value of the editor.",
    },
    onChange: {
      description: "The onChange event handler.",
    },
    language: {
      description: "The language of the editor.",
    },
    activeThemeTone: {
      description: "The active theme tone.",
    },
  },
});

export const editorRenderer = createComponentRenderer(
  COMP,
  EditorMd,
  ({ extractValue, node, lookupEventHandler }: any) => {
    return (
      <Editor
        readOnly={false}
        value={extractValue(node.props.value)}
        onChange={lookupEventHandler("change")}
        language={extractValue(node.props.language)}
        activeThemeTone={extractValue(node.props.activeThemeTone)}
      />
    );
  },
);
