import { CodeEditorRender } from "./CodeEditorRender";
import { wrapCompound } from "../../components-core/wrapComponent";
import {
  createMetadata,
  d,
  dDidChange,
  dInitialValue,
  dReadonly,
} from "../metadata-helpers";

const COMP = "CodeEditor";

export const CodeEditorMd = createMetadata({
  status: "experimental",
  description:
    "`CodeEditor` wraps Monaco Editor (the engine behind VS Code) as an XMLUI " +
    "component. It demonstrates that `wrapCompound` works with large, complex " +
    "React components — not just small primitives.",
  props: {
    initialValue: dInitialValue(),
    language: d("The programming language for syntax highlighting.", undefined, "string", "javascript"),
    theme: d("The editor color theme.", undefined, "string", "vs-dark"),
    height: d("The height of the editor.", undefined, "string", "300px"),
    readOnly: dReadonly(),
    minimap: d("Whether to show the minimap.", undefined, "boolean", true),
    lineNumbers: d("Whether to show line numbers.", undefined, "boolean", true),
    wordWrap: d("Whether to wrap long lines.", undefined, "boolean", false),
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: "Gets the current editor content.",
      signature: "get value(): string",
    },
    setValue: {
      description: "Sets the editor content programmatically.",
      signature: "setValue(value: string): void",
      parameters: { value: "The new text content." },
    },
    focus: {
      description: "Sets focus on the editor.",
      signature: "focus(): void",
    },
  },
});

export const codeEditorComponentRenderer = wrapCompound(COMP, CodeEditorRender, CodeEditorMd, {
  booleans: ["readOnly", "minimap", "lineNumbers", "wordWrap"],
  strings: ["language", "theme", "height"],
  events: {
    didChange: "onDidChange",
  },
});
