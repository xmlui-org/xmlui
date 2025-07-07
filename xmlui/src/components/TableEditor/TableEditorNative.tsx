import { useEditor, EditorContent } from "@tiptap/react";

export function TableEditorNative({ editor, className }: { editor: any, className?: string }) {
  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
