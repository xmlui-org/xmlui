import { TiptapEditorRender } from "./TiptapEditorRender";
import { wrapCompound } from "../../components-core/wrapComponent";
import {
  createMetadata,
  d,
  dDidChange,
  dInitialValue,
} from "../metadata-helpers";

const COMP = "TiptapEditor";

export const TiptapEditorMd = createMetadata({
  status: "experimental",
  description:
    "`TiptapEditor` wraps the Tiptap rich-text editor as an XMLUI component. " +
    "It provides a full-featured markdown editing experience with toolbar, " +
    "table editing, task lists, and live markdown output — all via `wrapCompound`.",
  props: {
    initialValue: dInitialValue(),
    placeholder: d("Placeholder text shown when the editor is empty.", undefined, "string", "Start writing..."),
    editable: d("Whether the editor is editable.", undefined, "boolean", true),
    toolbar: d("Whether to show the formatting toolbar.", undefined, "boolean", true),
    height: d("The height of the editor content area.", undefined, "string", "300px"),
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets focus on the editor.",
      signature: "focus(): void",
    },
    setValue: {
      description: "Sets the editor content (markdown string).",
      signature: "setValue(value: string): void",
      parameters: { value: "The new markdown content." },
    },
    getMarkdown: {
      description: "Gets the current editor content as markdown.",
      signature: "getMarkdown(): string",
    },
    getHTML: {
      description: "Gets the current editor content as HTML.",
      signature: "getHTML(): string",
    },
  },
});

export const tiptapEditorComponentRenderer = wrapCompound(
  COMP,
  TiptapEditorRender,
  TiptapEditorMd,
  {
    booleans: ["editable", "toolbar"],
    strings: ["placeholder", "height"],
    events: {
      didChange: "onDidChange",
    },
  },
);
