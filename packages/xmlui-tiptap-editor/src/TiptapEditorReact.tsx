import React, { memo, useCallback, useEffect, useMemo, useRef, type HTMLAttributes, type ForwardedRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useTheme } from "xmlui";
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

function getMarkdownFromEditor(editor: any): string {
  try {
    return editor.storage?.markdown?.getMarkdown?.() ?? editor.getHTML();
  } catch {
    return editor.getHTML();
  }
}

function classifyTransaction(
  tr: any,
  editor: any,
): { type: string; displayLabel: string } | null {
  if (!tr.docChanged) return null;
  const steps = tr.steps;
  if (!steps || steps.length === 0) return null;

  for (const step of steps) {
    const json = step.toJSON();
    if (json.stepType === "addMark") {
      return { type: "format", displayLabel: `${json.mark?.type}: on` };
    }
    if (json.stepType === "removeMark") {
      return { type: "format", displayLabel: `${json.mark?.type}: off` };
    }
    if (json.stepType === "replace") {
      const content = json.slice?.content;
      if (!content || content.length === 0) {
        return { type: "delete", displayLabel: "delete" };
      }
      const firstNode = content[0];
      if (firstNode?.type === "horizontalRule") {
        return { type: "insert", displayLabel: "horizontal rule" };
      }
      if (firstNode?.type === "table") {
        const rows = firstNode.content?.length || 0;
        const cols = firstNode.content?.[0]?.content?.length || 0;
        return { type: "insert", displayLabel: `table ${rows}×${cols}` };
      }
      if (firstNode?.type === "heading") {
        const level = firstNode.attrs?.level || 1;
        return { type: "structure", displayLabel: `heading ${level}` };
      }
      if (firstNode?.type === "codeBlock") {
        return { type: "structure", displayLabel: "code block" };
      }
      if (firstNode?.text) {
        const text = firstNode.text;
        if (text.length <= 20) {
          return { type: "input", displayLabel: `"${text}"` };
        }
        return { type: "input", displayLabel: `"${text.slice(0, 20)}…" (${text.length} chars)` };
      }
      if (firstNode?.type === "paragraph" && firstNode.content?.[0]?.text) {
        const text = firstNode.content[0].text;
        if (text.length <= 20) {
          return { type: "input", displayLabel: `"${text}"` };
        }
        return { type: "input", displayLabel: `"${text.slice(0, 20)}…" (${text.length} chars)` };
      }
      if (firstNode?.type) {
        return { type: "insert", displayLabel: firstNode.type };
      }
    }
    if (json.stepType === "replaceAround") {
      const nodeType = json.slice?.content?.[0]?.type;
      if (nodeType) {
        return { type: "structure", displayLabel: nodeType };
      }
    }
  }
  return { type: "edit", displayLabel: "content changed" };
}

function Btn({
  onClick, active, disabled, title, children, colors,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title: string; children: React.ReactNode;
  colors?: { border: string; active: string; text: string };
}) {
  return (
    <button type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled} title={title}
      style={{
        padding: "4px 8px", fontSize: 13, lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        color: colors?.text || "inherit",
        background: active ? (colors?.active || "#e0e0e0") : "transparent",
        border: `1px solid ${colors?.border || "#ccc"}`, borderRadius: 4,
        opacity: disabled ? 0.4 : 1,
      }}>
      {children}
    </button>
  );
}

function Sep({ color }: { color?: string }) {
  return (
    <span style={{
      display: "inline-block", width: 1, height: 20,
      background: color || "#ccc", margin: "0 4px", verticalAlign: "middle",
    }} />
  );
}

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value?: string;
  onChange?: (value: string) => void;
  onNativeEvent?: (event: { type: string; displayLabel: string }) => void;
  registerApi?: (api: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
  toolbar?: boolean;
  toolbarItems?: string;
  height?: string;
  width?: string;
};

export const TiptapEditorRender = memo(
  React.forwardRef(
    ({ value, onChange, onNativeEvent, registerApi, placeholder,
       editable = true, toolbar = true, toolbarItems,
       className, height = "300px", width, style, ...rest }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { getThemeVar } = useTheme();
    const colors = useMemo(() => {
      const bg = getThemeVar("color-surface-50") || "#fafafa";
      const bgAlt = getThemeVar("color-surface-100") || "#f5f5f5";
      const border = getThemeVar("color-surface-200") || "#ddd";
      const text = getThemeVar("textColor-primary") || "#333";
      const textMuted = getThemeVar("textColor-secondary") || "#666";
      const active = getThemeVar("color-primary-100") || "#e0e0e0";
      return { bg, bgAlt, border, text, textMuted, active };
    }, [getThemeVar]);
    const visibleItems = React.useMemo(() => {
      if (!toolbarItems) return null;
      return new Set(toolbarItems.split(",").map((s: string) => s.trim()));
    }, [toolbarItems]);
    const show = (id: string) => !visibleItems || visibleItems.has(id);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onNativeEventRef = useRef(onNativeEvent);
    onNativeEventRef.current = onNativeEvent;
    const suppressUpdate = useRef(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
        Table.configure({ resizable: true }),
        TableRow, TableCell, TableHeader,
        Link.configure({ openOnClick: false }),
        TaskList, TaskItem.configure({ nested: true }),
        Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
        Markdown,
      ],
      content: value || "",
      editable,
      onUpdate: ({ editor: ed }) => {
        if (suppressUpdate.current) return;
        const md = getMarkdownFromEditor(ed);
        onChangeRef.current?.(md);
      },
      onTransaction: ({ editor: ed, transaction: tr }) => {
        if (suppressUpdate.current) return;
        if (!onNativeEventRef.current) return;
        const classified = classifyTransaction(tr, ed);
        if (classified) {
          onNativeEventRef.current({
            type: classified.type,
            displayLabel: classified.displayLabel,
          });
        }
      },
      onFocus: () => {
        onNativeEventRef.current?.({ type: "focus", displayLabel: "focus" });
      },
      onBlur: () => {
        onNativeEventRef.current?.({ type: "blur", displayLabel: "blur" });
      },
    });

    useEffect(() => { editor?.setEditable(editable); }, [editor, editable]);

    useEffect(() => {
      if (!editor) return;
      const current = getMarkdownFromEditor(editor);
      if (value !== undefined && value !== current) {
        suppressUpdate.current = true;
        editor.commands.setContent(value);
        suppressUpdate.current = false;
      }
    }, [editor, value]);

    useEffect(() => {
      if (!editor) return;
      registerApi?.({
        focus: () => editor.commands.focus(),
        setValue: (v: string) => {
          suppressUpdate.current = true;
          editor.commands.setContent(v);
          suppressUpdate.current = false;
          const md = (editor.storage.markdown as any)?.getMarkdown?.() ?? editor.getHTML();
          onChangeRef.current?.(md);
        },
        getMarkdown: () => (editor.storage.markdown as any)?.getMarkdown?.() ?? editor.getHTML(),
        getHTML: () => editor.getHTML(),
      });
    }, [editor, registerApi]);

    if (!editor) return null;

    const btnColors = { border: colors.border, active: colors.active, text: colors.text };

    return (
      <div ref={ref} className={className} style={{ width: width || "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }} {...rest}>
        {toolbar && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: "6px 8px",
            borderBottom: `1px solid ${colors.border}`, background: colors.bgAlt, borderRadius: "4px 4px 0 0" }}>
            {show("bold") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><strong>B</strong></Btn>}
            {show("italic") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><em>I</em></Btn>}
            {show("strike") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></Btn>}
            {show("code") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">{"<>"}</Btn>}
            {(show("h1") || show("h2") || show("h3")) && <Sep color={colors.border} />}
            {([1, 2, 3] as const).map((level) => show(`h${level}`) ? <Btn key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} active={editor.isActive("heading", { level })} title={`Heading ${level}`}>H{level}</Btn> : null)}
            {(show("bulletList") || show("orderedList") || show("taskList")) && <Sep color={colors.border} />}
            {show("bulletList") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">&bull; List</Btn>}
            {show("orderedList") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</Btn>}
            {show("taskList") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task list">&#9745; Tasks</Btn>}
            {(show("blockquote") || show("codeBlock") || show("hr")) && <Sep color={colors.border} />}
            {show("blockquote") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">&ldquo; Quote</Btn>}
            {show("codeBlock") && <Btn colors={btnColors} onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">{"{ }"} Code</Btn>}
            {show("hr") && <Btn colors={btnColors} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">&mdash; HR</Btn>}
            {show("link") && <Sep color={colors.border} />}
            {show("link") && <Btn colors={btnColors} onClick={() => { if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); } else { const url = window.prompt("URL:"); if (url) { editor.chain().focus().setLink({ href: url }).run(); } } }} active={editor.isActive("link")} title="Link">&#128279; Link</Btn>}
            {(show("table") || show("tableRow") || show("tableCol")) && <Sep color={colors.border} />}
            {show("table") && <Btn colors={btnColors} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table">&#9638; Table</Btn>}
            {show("tableRow") && <><Btn colors={btnColors} onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} title="Add row">+ Row</Btn><Btn colors={btnColors} onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} title="Delete row">- Row</Btn></>}
            {show("tableCol") && <><Btn colors={btnColors} onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()} title="Add column">+ Col</Btn><Btn colors={btnColors} onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()} title="Delete column">- Col</Btn></>}
            {(show("undo") || show("redo")) && <Sep color={colors.border} />}
            {show("undo") && <Btn colors={btnColors} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">&#8617; Undo</Btn>}
            {show("redo") && <Btn colors={btnColors} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">&#8618; Redo</Btn>}
          </div>
        )}
        <style>{`
          .tiptap-editor-content table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
          .tiptap-editor-content th,
          .tiptap-editor-content td { border: 1px solid ${colors.border}; padding: 6px 10px; text-align: left; }
          .tiptap-editor-content th { background: ${colors.bgAlt}; font-weight: 600; }
        `}</style>
        <div className="tiptap-editor-content" style={{ height, overflow: "auto", padding: "12px 16px",
          border: `1px solid ${colors.border}`, color: colors.text, background: colors.bg,
          borderTop: toolbar ? "none" : `1px solid ${colors.border}`, borderRadius: toolbar ? "0 0 4px 4px" : 4 }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
  ),
);
