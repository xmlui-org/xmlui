import React from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../Button/ButtonNative";
import { Stack } from "../Stack/StackNative";
import TurndownService from "turndown";
import { TableEditorNative2 } from "./TableEditorNative2";

export function TableEditor2({ registerComponentApi }: { registerComponentApi?: (api: any) => void }) {
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

  React.useEffect(() => {
    if (registerComponentApi && editor) {
      const turndownService = new TurndownService();
      turndownService.addRule('table', {
        filter: 'table',
        replacement: function (content, node) {
          let rows = [];
          for (let row of node.querySelectorAll('tr')) {
            let cells = Array.from(row.children).map(cell => (cell as HTMLElement).textContent?.trim() ?? "");
            rows.push('| ' + cells.join(' | ') + ' |');
          }
          if (rows.length > 1) {
            // Add a separator after the header row
            const headerSep = '| ' + rows[0].split('|').slice(1, -1).map(() => '---').join(' | ') + ' |';
            rows.splice(1, 0, headerSep);
          }
          return rows.join('\n') + '\n';
        }
      });
      registerComponentApi({
        getHtmlSource: () => editor.getHTML(),
        getMarkdownSource: () => turndownService.turndown(editor.getHTML()),
      });
    }
  }, [registerComponentApi, editor]);

  return (
    <>
      <Stack orientation="horizontal">
        <Button onClick={() => editor && editor.commands.addRowAfter()} disabled={!editor}>
          <svg
            viewBox="0 0 24 16"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="16"
            style={{ marginRight: 4 }}
          >
            <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
            <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
            <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
            <line x1="19" y1="6" x2="19" y2="10" />
            <line x1="17" y1="8" x2="21" y2="8" />
          </svg>
          Insert Row
        </Button>
        <Button onClick={() => editor && editor.commands.deleteRow()} disabled={!editor}>
          <svg
            viewBox="0 0 24 16"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="16"
            style={{ marginRight: 4 }}
          >
            <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
            <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
            <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
            <line x1="17" y1="8" x2="21" y2="8" />
          </svg>
          Delete Row
        </Button>
        <Button onClick={() => editor && editor.commands.addColumnAfter()} disabled={!editor}>
          <svg
            viewBox="0 0 24 16"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="24"
            height="16"
            style={{ marginRight: 4 }}
          >
            <rect x="2.5" y="3" width="11" height="9" rx="1" />
            <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
            <line x1="9" y1="3.5" x2="9" y2="11.5" />
            <line x1="19" y1="6.5" x2="19" y2="9.5" />
            <line x1="17.5" y1="8" x2="20.5" y2="8" />
          </svg>
          Insert Column
        </Button>
        <Button onClick={() => editor && editor.commands.deleteColumn()} disabled={!editor}>
          <svg
            viewBox="0 0 24 16"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="24"
            height="16"
            style={{ marginRight: 4 }}
          >
            <rect x="2.5" y="3" width="11" height="9" rx="1" />
            <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
            <line x1="9" y1="3.5" x2="9" y2="11.5" />
            {/* Minus sign for delete */}
            <line x1="17" y1="8" x2="21" y2="8" />
          </svg>
          Delete Column
        </Button>
      </Stack>
      <TableEditorNative2 editor={editor} />
    </>
  );
}

export const editorComponentRenderer2 = {
  type: "TableEditor2",
  renderer: ({ registerComponentApi, ...props }: any) => (
    <TableEditor2 {...props} registerComponentApi={registerComponentApi} />
  ),
};