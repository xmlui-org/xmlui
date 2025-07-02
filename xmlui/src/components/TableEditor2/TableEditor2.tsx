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
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { buttonThemeMd, buttonVariantMd, sizeMd } from "../abstractions";
import Icon from "../Icon/IconNative";

export function TableEditor2({
  registerComponentApi,
  themeColor = "primary",
  variant = "solid",
  size = "sm",
}: {
  registerComponentApi?: (api: any) => void;
  themeColor?: "primary" | "secondary" | "attention";
  variant?: "solid" | "outlined" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
}) {
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
        <Button onClick={() => editor && editor.commands.addRowAfter()} disabled={!editor} themeColor={themeColor} variant={variant} size={size} icon={<Icon name="table-insert-row" aria-hidden />} contextualLabel="Insert Row">
          Insert Row
        </Button>
        <Button onClick={() => editor && editor.commands.deleteRow()} disabled={!editor} themeColor={themeColor} variant={variant} size={size} icon={<Icon name="table-delete-row" aria-hidden />} contextualLabel="Delete Row">
          Delete Row
        </Button>
        <Button onClick={() => editor && editor.commands.addColumnAfter()} disabled={!editor} themeColor={themeColor} variant={variant} size={size} icon={<Icon name="table-insert-column" aria-hidden />} contextualLabel="Insert Column">
          Insert Column
        </Button>
        <Button onClick={() => editor && editor.commands.deleteColumn()} disabled={!editor} themeColor={themeColor} variant={variant} size={size} icon={<Icon name="table-delete-column" aria-hidden />} contextualLabel="Delete Column">
          Delete Column
        </Button>
      </Stack>
      <TableEditorNative2 editor={editor} />
    </>
  );
}

export const TableEditor2Md = createMetadata({
  description:
    "`TableEditor2` provides an interactive table editing interface with controls for adding and deleting rows and columns. It supports theme customization and exports table data in HTML and Markdown formats.",
  status: "experimental",
  props: {
    themeColor: {
      description: "Sets the color scheme for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: buttonThemeMd,
      defaultValue: "primary",
    },
    variant: {
      description: "Sets the visual style for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: buttonVariantMd,
      defaultValue: "solid",
    },
    size: {
      description: "Sets the size for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: sizeMd,
      defaultValue: "sm",
    },
  },
  events: {},
});

export const editorComponentRenderer2 = createComponentRenderer(
  "TableEditor2",
  TableEditor2Md,
  ({ node, extractValue, registerComponentApi }) => (
    <TableEditor2
      themeColor={extractValue.asOptionalString(node.props.themeColor)}
      variant={extractValue.asOptionalString(node.props.variant)}
      size={extractValue.asOptionalString(node.props.size)}
      registerComponentApi={registerComponentApi}
    />
  ),
);