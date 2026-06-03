import { TiptapEditorRender } from "./TiptapEditorReact";
import {
  wrapCompound,
  createMetadata,
  type ComponentMetadata,
  dDidChange,
  dInitialValue,
} from "xmlui";

const COMP = "TiptapEditor";

export const TiptapEditorMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`TiptapEditor` wraps the Tiptap rich-text editor as an XMLUI component. " +
    "It provides a full-featured markdown editing experience with toolbar, " +
    "table editing, task lists, and live markdown output.",
  props: {
    initialValue: dInitialValue(),
    placeholder: {
      description: "Placeholder text shown when the editor is empty.",
      valueType: "string",
      defaultValue: "Start writing...",
    },
    editable: {
      description: "Whether the editor is editable.",
      valueType: "boolean",
      defaultValue: true,
    },
    toolbar: {
      description: "Whether to show the formatting toolbar.",
      valueType: "boolean",
      defaultValue: true,
    },
    toolbarItems: {
      description:
        "Comma-separated list of toolbar items to show. If omitted, all items are shown.",
      valueType: "string",
    },
    height: {
      description: "The height of the editor content area.",
      valueType: "string",
      defaultValue: "300px",
    },
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
  defaultAriaLabel: "Rich text editor",
});

export const tiptapEditorComponentRenderer = wrapCompound(
  COMP,
  TiptapEditorRender,
  TiptapEditorMd,
  {
    captureNativeEvents: true,
  },
);
