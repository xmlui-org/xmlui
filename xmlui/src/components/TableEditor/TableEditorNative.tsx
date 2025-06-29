import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function TableEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello, Tiptap!</p>",
  });

  return <EditorContent editor={editor} />;
}