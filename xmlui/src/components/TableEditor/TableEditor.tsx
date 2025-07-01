import React, { useImperativeHandle, forwardRef } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../Button/ButtonNative";
import { Stack } from "../Stack/StackNative";
import { TableEditorNative } from "./TableEditorNative";
import TurndownService from "turndown";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { buttonThemeMd, buttonVariantMd, sizeMd } from "../abstractions";
import Icon from "../Icon/IconNative";

type TableEditorProps = {
  registerComponentApi?: (api: any) => void;
  themeColor?: "primary" | "secondary" | "attention";
  variant?: "solid" | "outlined" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
};

const TableEditor = forwardRef<unknown, TableEditorProps>(function TableEditor({
  registerComponentApi,
  themeColor = "primary",
  variant = "solid",
  size = "sm",
}, ref) {
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

  useImperativeHandle(ref, () => ({
    getMarkdownSource: () => turndownService.turndown(editor?.getHTML?.() ?? ""),
    getHtmlSource: () => editor?.getHTML?.() ?? "",
  }), [editor]);

  React.useEffect(() => {
    if (registerComponentApi && editor) {
      registerComponentApi({
        getHtmlSource: () => editor.getHTML(),
        getMarkdownSource: () => turndownService.turndown(editor.getHTML()),
      });
    }
  }, [registerComponentApi, editor]);

  return (
    <>
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
      <TableEditorNative editor={editor} />
    </>
  );
});

export default TableEditor;

// Create metadata for TableEditor that defines allowed props
export const TableEditorMd = createMetadata({
  description:
    "`TableEditor` provides an interactive table editing interface with controls for adding and deleting rows and columns. It supports theme customization and exports table data in HTML and Markdown formats.",
  status: "stable",
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

export const editorComponentRenderer = createComponentRenderer(
  "TableEditor",
  TableEditorMd,
  ({ node, extractValue, registerComponentApi }) => {
    return (
      <TableEditor
        themeColor={extractValue.asOptionalString(node.props.themeColor)}
        variant={extractValue.asOptionalString(node.props.variant)}
        size={extractValue.asOptionalString(node.props.size)}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
