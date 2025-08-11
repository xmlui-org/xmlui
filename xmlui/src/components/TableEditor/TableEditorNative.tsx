import React, { useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../Button/ButtonNative";
import { Stack } from "../Stack/StackNative";
import TurndownService from "turndown";
import Icon from "../Icon/IconNative";
import styles from "./TableEditor.module.scss";

type TableEditorProps = {
  registerComponentApi?: (api: any) => void;
  themeColor?: "primary" | "secondary" | "attention";
  variant?: "solid" | "outlined" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  onDidChange?: (payload: { html: string; markdown: string }) => void;
};

export const TableEditor = forwardRef<unknown, TableEditorProps>(function TableEditor(
  {
    registerComponentApi,
    themeColor = "primary",
    variant = "solid",
    size = "sm",
    onDidChange = () => {},
  },
  ref,
) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `
      <table>
        <thead>
          <tr>
            <th>Fruit</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Apple</td>
            <td>Red</td>
          </tr>
          <tr>
            <td>Banana</td>
            <td>Yellow</td>
          </tr>
        </tbody>
      </table>
    `,
  });

  const turndownService = new TurndownService();
  turndownService.addRule("table", {
    filter: "table",
    replacement: function (content, node) {
      let rows = [];
      for (let row of (node as Element).querySelectorAll("tr")) {
        let cells = Array.from(row.children).map(
          (cell) => (cell as Element).textContent?.trim() ?? "",
        );
        rows.push("| " + cells.join(" | ") + " |");
      }
      if (rows.length > 1) {
        // Add a separator after the header row
        const headerSep =
          "| " +
          rows[0]
            .split("|")
            .slice(1, -1)
            .map(() => "---")
            .join(" | ") +
          " |";
        rows.splice(1, 0, headerSep);
      }
      return rows.join("\n") + "\n";
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getMarkdownSource: () => turndownService.turndown(editor?.getHTML?.() ?? ""),
      getHtmlSource: () => editor?.getHTML?.() ?? "",
    }),
    [editor],
  );

  React.useEffect(() => {
    if (registerComponentApi && editor) {
      registerComponentApi({
        getHtmlSource: () => editor.getHTML(),
        getMarkdownSource: () => turndownService.turndown(editor.getHTML()),
      });
    }
  }, [registerComponentApi, editor]);

  // Emit onDidChange whenever the editor content changes
  React.useEffect(() => {
    if (!editor) return;
    const handler = () => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      //console.log("[TableEditor] onDidChange about to fire", { html, markdown, onDidChange });
      onDidChange({ html, markdown });
    };
    editor.on("update", handler);
    // Emit once on mount
    handler();
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onDidChange]);

  return (
    <div className="table-editor-root">
      <div className="button-stack">
        <Stack orientation="horizontal">
          <Button
            onClick={() => editor && editor.commands.addRowAfter()}
            disabled={!editor}
            themeColor={themeColor}
            variant={variant}
            size={size}
            orientation="horizontal"
            icon={<Icon name="table-insert-row" aria-hidden />}
          >
            Insert Row
          </Button>
          <Button
            onClick={() => editor && editor.commands.deleteRow()}
            disabled={!editor}
            themeColor={themeColor}
            variant={variant}
            size={size}
            orientation="horizontal"
            icon={<Icon name="table-delete-row" aria-hidden />}
          >
            Delete Row
          </Button>
          <Button
            onClick={() => editor && editor.commands.addColumnAfter()}
            disabled={!editor}
            themeColor={themeColor}
            variant={variant}
            size={size}
            orientation="horizontal"
            icon={<Icon name="table-insert-column" aria-hidden />}
          >
            Insert Column
          </Button>
          <Button
            onClick={() => editor && editor.commands.deleteColumn()}
            disabled={!editor}
            themeColor={themeColor}
            variant={variant}
            size={size}
            orientation="horizontal"
            icon={<Icon name="table-delete-column" aria-hidden />}
          >
            Delete Column
          </Button>
        </Stack>
      </div>
      <div className={styles.editor}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});
