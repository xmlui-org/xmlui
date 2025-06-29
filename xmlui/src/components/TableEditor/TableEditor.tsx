import React from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../Button/ButtonNative";
import { TableEditorNative } from "./TableEditorNative";

export function TableEditor({ registerComponentApi }: { registerComponentApi?: (api: any) => void }) {
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
    // Expose the getHtmlSource API method
  React.useEffect(() => {
    if (registerComponentApi && editor) {
      console.log("Registering TableEditor API");
      registerComponentApi({
        getHtmlSource: () => {
          const html = editor.getHTML();
          //console.log("getHtmlSource called, returning:", html);
          return html;
        },
      });
    }
  }, [registerComponentApi, editor]);

  return (
    <div>
      <Button onClick={() => editor && editor.commands.addRowAfter()} disabled={!editor}>
        Insert Row
      </Button>
      <TableEditorNative editor={editor} />
    </div>
  );
}

export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: (props: any) => <TableEditor {...props} />
};