import React from "react";
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

export function TableEditor({
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
  // Expose the getHtmlSource API method
  React.useEffect(() => {
    if (registerComponentApi && editor) {
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

      console.log("Registering TableEditor API");
      registerComponentApi({
        getHtmlSource: () => {
          const html = editor.getHTML();
          //console.log("getHtmlSource called, returning:", html);
          return html;
        },
        getMarkdownSource: () => {
          const html = editor.getHTML();
          const md = turndownService.turndown(html);
          console.log("getMarkdownSource called, returning:", md);
          return md;
        },
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
        >
<svg
  viewBox="0 0 24 16"
  stroke="currentColor"
  fill="none"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="2" y="2" width="12" height="10" rx="1" />
  <line x1="2" y1="5.5" x2="14" y2="5.5" />
  <line x1="2" y1="9.5" x2="14" y2="9.5" />
  <line x1="19" y1="6.5" x2="19" y2="9.5" />
  <line x1="17.5" y1="8" x2="20.5" y2="8" />
</svg>
          Insert Row
        </Button>
        <Button
          onClick={() => editor && editor.commands.deleteRow()}
          disabled={!editor}
          themeColor={themeColor}
          variant={variant}
          size={size}
        >
<svg
  viewBox="0 0 24 16"
  stroke="currentColor"
  fill="none"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="2" y="2" width="12" height="10" rx="1" />
  <line x1="2" y1="6" x2="14" y2="6" />
  <line x1="2" y1="9" x2="14" y2="9" />
  {/* X mark with moderate spacing, centered vertically */}
  <line x1="17.5" y1="5" x2="20.5" y2="11" />
  <line x1="20.5" y1="5" x2="17.5" y2="11" />
</svg>
          Delete Row
        </Button>
        <Button
          onClick={() => editor && editor.commands.addColumnAfter()}
          disabled={!editor}
          themeColor={themeColor}
          variant={variant}
          size={size}
        >
<svg
  viewBox="0 0 24 16"
  stroke="currentColor"
  fill="none"
  strokeWidth="1.25"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="2.5" y="3" width="11" height="9" rx="1" />
  <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
  <line x1="9" y1="3.5" x2="9" y2="11.5" />
  <line x1="19" y1="6.5" x2="19" y2="9.5" />
  <line x1="17.5" y1="8" x2="20.5" y2="8" />
</svg>
          Insert Column
        </Button>
        <Button
          onClick={() => editor && editor.commands.deleteColumn()}
          disabled={!editor}
          themeColor={themeColor}
          variant={variant}
          size={size}
        >
<svg
  viewBox="0 0 24 16"
  stroke="currentColor"
  fill="none"
  strokeWidth="1.25"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="2.5" y="3" width="11" height="9" rx="1" />
  <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
  <line x1="9" y1="3.5" x2="9" y2="11.5" />
  {/* X mark centered and scaled */}
  <line x1="17.5" y1="5" x2="20.5" y2="11" />
  <line x1="20.5" y1="5" x2="17.5" y2="11" />
</svg>
          Delete Column
        </Button>
      </Stack>
      <TableEditorNative editor={editor} />
    </>
  );
}

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
