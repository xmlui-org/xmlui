import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Link } from "@tiptap/extension-link";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

// Helper to get markdown from editor storage
function getMarkdownFromEditor(editor: any): string {
  try {
    return editor.storage?.markdown?.getMarkdown?.() ?? editor.getHTML();
  } catch {
    return editor.getHTML();
  }
}

// ── Toolbar button ──────────────────────────────────────────────────
function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      style={{
        padding: "4px 8px",
        fontSize: 13,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        background: active ? "#e0e0e0" : "transparent",
        border: "1px solid #ccc",
        borderRadius: 4,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ── Separator ───────────────────────────────────────────────────────
function Sep() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 1,
        height: 20,
        background: "#ccc",
        margin: "0 4px",
        verticalAlign: "middle",
      }}
    />
  );
}

// ── Main render component ───────────────────────────────────────────
export const TiptapEditorRender = React.forwardRef(
  (
    {
      value,
      onChange,
      registerApi,
      placeholder,
      editable = true,
      toolbar = true,
      toolbarItems,
      className,
      height = "300px",
      ...rest
    }: any,
    ref: any,
  ) => {
    // Parse toolbarItems into a Set for O(1) lookup; undefined = show all
    const visibleItems = React.useMemo(() => {
      if (!toolbarItems) return null;
      return new Set(toolbarItems.split(",").map((s: string) => s.trim()));
    }, [toolbarItems]);
    const show = (id: string) => !visibleItems || visibleItems.has(id);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const suppressUpdate = useRef(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4] },
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        Link.configure({ openOnClick: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: placeholder || "Start writing...",
        }),
        Markdown,
      ],
      content: value || "",
      editable,
      onUpdate: ({ editor: ed }) => {
        if (suppressUpdate.current) return;
        const md = getMarkdownFromEditor(ed);
        onChangeRef.current?.(md);
      },
    });

    // Sync editable prop
    useEffect(() => {
      editor?.setEditable(editable);
    }, [editor, editable]);

    // Sync external value changes
    useEffect(() => {
      if (!editor) return;
      const current =
        getMarkdownFromEditor(editor);
      if (value !== undefined && value !== current) {
        suppressUpdate.current = true;
        editor.commands.setContent(value);
        suppressUpdate.current = false;
      }
    }, [editor, value]);

    // Register component APIs
    useEffect(() => {
      if (!editor) return;
      registerApi?.({
        focus: () => editor.commands.focus(),
        setValue: (v: string) => {
          suppressUpdate.current = true;
          editor.commands.setContent(v);
          suppressUpdate.current = false;
          const md =
            (editor.storage.markdown as any)?.getMarkdown?.() ??
            editor.getHTML();
          onChangeRef.current?.(md);
        },
        getMarkdown: () =>
          (editor.storage.markdown as any)?.getMarkdown?.() ??
          editor.getHTML(),
        getHTML: () => editor.getHTML(),
      });
    }, [editor, registerApi]);

    if (!editor) return null;

    return (
      <div ref={ref} className={className} {...rest}>
        {toolbar && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              padding: "6px 8px",
              borderBottom: "1px solid #ddd",
              background: "#fafafa",
              borderRadius: "4px 4px 0 0",
            }}
          >
            {show("bold") && (
              <Btn onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")} title="Bold (Ctrl+B)">
                <strong>B</strong>
              </Btn>
            )}
            {show("italic") && (
              <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")} title="Italic (Ctrl+I)">
                <em>I</em>
              </Btn>
            )}
            {show("strike") && (
              <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")} title="Strikethrough">
                <s>S</s>
              </Btn>
            )}
            {show("code") && (
              <Btn onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive("code")} title="Inline code">
                {"<>"}
              </Btn>
            )}

            {(show("h1") || show("h2") || show("h3")) && <Sep />}
            {([1, 2, 3] as const).map((level) =>
              show(`h${level}`) ? (
                <Btn key={level}
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  active={editor.isActive("heading", { level })}
                  title={`Heading ${level}`}>
                  H{level}
                </Btn>
              ) : null,
            )}

            {(show("bulletList") || show("orderedList") || show("taskList")) && <Sep />}
            {show("bulletList") && (
              <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")} title="Bullet list">
                &bull; List
              </Btn>
            )}
            {show("orderedList") && (
              <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")} title="Numbered list">
                1. List
              </Btn>
            )}
            {show("taskList") && (
              <Btn onClick={() => editor.chain().focus().toggleTaskList().run()}
                active={editor.isActive("taskList")} title="Task list">
                &#9745; Tasks
              </Btn>
            )}

            {(show("blockquote") || show("codeBlock") || show("hr")) && <Sep />}
            {show("blockquote") && (
              <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")} title="Blockquote">
                &ldquo; Quote
              </Btn>
            )}
            {show("codeBlock") && (
              <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive("codeBlock")} title="Code block">
                {"{ }"} Code
              </Btn>
            )}
            {show("hr") && (
              <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal rule">
                &mdash; HR
              </Btn>
            )}

            {show("link") && <Sep />}
            {show("link") && (
              <Btn
                onClick={() => {
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    const url = window.prompt("URL:");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }
                }}
                active={editor.isActive("link")} title="Link">
                &#128279; Link
              </Btn>
            )}

            {(show("table") || show("tableRow") || show("tableCol")) && <Sep />}
            {show("table") && (
              <Btn onClick={() => editor.chain().focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                title="Insert table">
                &#9638; Table
              </Btn>
            )}
            {show("tableRow") && (
              <>
                <Btn onClick={() => editor.chain().focus().addRowAfter().run()}
                  disabled={!editor.can().addRowAfter()} title="Add row">+ Row</Btn>
                <Btn onClick={() => editor.chain().focus().deleteRow().run()}
                  disabled={!editor.can().deleteRow()} title="Delete row">- Row</Btn>
              </>
            )}
            {show("tableCol") && (
              <>
                <Btn onClick={() => editor.chain().focus().addColumnAfter().run()}
                  disabled={!editor.can().addColumnAfter()} title="Add column">+ Col</Btn>
                <Btn onClick={() => editor.chain().focus().deleteColumn().run()}
                  disabled={!editor.can().deleteColumn()} title="Delete column">- Col</Btn>
              </>
            )}

            {(show("undo") || show("redo")) && <Sep />}
            {show("undo") && (
              <Btn onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
                &#8617; Undo
              </Btn>
            )}
            {show("redo") && (
              <Btn onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
                &#8618; Redo
              </Btn>
            )}
          </div>
        )}

        <div
          style={{
            height,
            overflow: "auto",
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderTop: toolbar ? "none" : "1px solid #ddd",
            borderRadius: toolbar ? "0 0 4px 4px" : 4,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);

TiptapEditorRender.displayName = "TiptapEditorRender";
