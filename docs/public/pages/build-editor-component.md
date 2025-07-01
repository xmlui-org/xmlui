# Build a TableEditor Component


This guide walks you through building a `TableEditor` component for XMLUI, using the [Tiptap](https://tiptap.dev) editor as a foundation. It will provide a visual and Markdown-friendly way to create and edit tables for use in XMLUI-powered documentation.

> [!INFO]
> If you operate in the [XMLUI](https://github.com/xmlui-org/xmlui) repo you can test your work live. Follow the instructions in `dev-docs/next/generating-component-reference.md` to build the XMLUI docs site, then load localhost:5173. When you edit `.tsx` files they will automatically recompile, so you can iterate rapidly as you develop your component. And you can add a test page to the site in order to use your evolving component

# Build a TableEditor Component

## Latest version

```xmlui-pg
<App var.showHtml="{false}" var.showMarkdown="{false}">

  <TableEditor
    id="tableEditor"
    size="xs"
  />

    <TableEditor
    id="tableEditor2"
    size="sm"
  />

      <TableEditor
    id="tableEditor3"
    size="md"
  />

        <TableEditor
    id="tableEditor4"
    size="lg"
  />




  <Text variant="codefence" preserveLinebreaks="true">
    { tableEditor.getMarkdownSource() }
  </Text>

</App>
```

## Step 1: Create the subdirectory

```bash
mkdir -p xmlui/src/components/TableEditor
```

## Step 2: Register the component

- Export a minimal renderer from `TableEditor.tsx`:

```tsx
import { TableEditor } from "./TableEditorNative";
```

```tsx
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
```

```
export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: (props: any) => <TableEditor />
};
```

- Register in `ComponentProvider.tsx`:

```tsx
if (process.env.VITE_USED_COMPONENTS_TableEditor !== "false") {
  this.registerCoreComponent(editorComponentRenderer);
}
```

## Step 3: Add a placeholder native component

Create `xmlui/src/components/TableEditor/TableEditorNative.tsx` with:

```tsx
import React from "react";

export function TableEditor() {
  // ...
  return (
    <div>
      <button
        onClick={() => editor && editor.commands.addRowAfter()}
      >
        Insert Row
      </button>
      <EditorContent editor={editor} />
    </div>
  );
}
```

This is the raw component using a native HTML `<button>`. Try it in a test environment.

```xmlui
<App>
  <TableEditor />
</App>

```

![](/resources/devdocs/table-editor-01.png)

We can edit the existing cells, and use `Insert Row` to add rows. The button has no style. Instead of writing CSS to style it we will instead switch to an XMLUI [Button](/components/Button) that inherits theming.

## Step 4: Use XMLUI's Button

Import and use the XMLUI `Button` component instead of a native HTML button.

```tsx
import { Button } from "../Button/ButtonNative";

export function TableEditor() {
  // ...
  return (
    <div>
      <Button
        onClick={() => editor && editor.commands.addRowAfter()}
      >
        Insert Row
      </Button>
      <EditorContent editor={editor} />
    </div>
  );
}
```

```xmlui
<App>
  <TableEditor />
</App>
```

![](/resources/devdocs/table-editor-02.png)

## Step 5: Show the HTML

Tiptap works natively with HTML, not Markdown. We'll eventually show Markdown but first let's show HTML.

```
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
```

```xmlui
<App var.showHtml="{false}">
  <TableEditor id="tableEditor" />
  <Button onClick="{() => showHtml = !showHtml}">
    {showHtml ? "Hide HTML Source" : "Show HTML Source"}
  </Button>
  <Text when="{showHtml}" >
  { tableEditor.getHtmlSource() }
  </Text>
</App>
```

![](/resources/devdocs/table-editor-03.png)

## Step 6: Show the Markdown

Tiptap does not provide an HTML-to-Markdown  converter. We'll start with a basic one called `turndown`.

```xmlui  {1} {7-22} {31-36}
import TurndownService from "turndown";

  React.useEffect(() => {
    if (registerComponentApi && editor) {
      const turndownService = new TurndownService();

      turndownService.addRule('table', {
        filter: 'table',
        replacement: function (content, node) {
          let rows = [];
          for (let row of node.querySelectorAll('tr')) {
            let cells = Array.from(row.children).map(cell => cell.textContent.trim());
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
          return md
        }
      });
    }
  }, [registerComponentApi, editor]);
```

```xmlui
<App var.showHtml="{false}" var.showMarkdown="{false}">
  <TableEditor id="tableEditor" />

  <HStack>
    <Button
      onClick="{() => { showHtml = !showHtml; if (showHtml) showMarkdown = false; }}"
      disabled="{showMarkdown}"
    >
      {showHtml ? "Hide HTML Source" : "Show HTML Source"}
    </Button>

    <Button
      onClick="{() => { showMarkdown = !showMarkdown; if (showMarkdown) showHtml = false; }}"
      disabled="{showHtml}"
    >
      {showMarkdown ? "Hide Markdown Source" : "Show Markdown Source"}
    </Button>
  </HStack>

  <Text when="{showHtml}">
    { tableEditor.getHtmlSource() }
  </Text>

  <Text when="{showMarkdown}" variant="codefence" preserveLinebreaks="true">
    { tableEditor.getMarkdownSource() }
  </Text>
</App>
```

Exported Markdown:

```
| Fruit | Color |
| --- | --- |
| Apple | Red |
| Banana | Yellow |
```

Rendered in XMLUI Markdown:

<Image src="/resources/devdocs/table-editor-05.png" width="200px"/>

## Step 7: Add controls

We can improve the TableEditor by adding more table editing controls like Insert Column, Delete Row, and Delete Column. But where should these controls live?

1. **TableEditorNative.tsx** (lowest level)
   - Pros: Closest to the editor instance
   - Cons: Not idiomatic for XMLUI; the "native" component should be minimal
2. **TableEditor.tsx** (middle level)
   - Pros: Provides a good default "batteries included" experience; keeps the native component minimal; still allows advanced users to build custom controls if needed
   - Cons: Slightly less flexible than fully user-defined controls
3. **User-defined component** (highest level)
   - Pros: Maximum flexibility for users
   - Cons: Every user has to reimplement the same basic controls; not user-friendly

We chose to implement the controls in `TableEditor.tsx` because it provides the best balance of usability and flexibility. Users get a working table editor with sensible controls out of the box, while advanced users can still build custom UIs using the exposed API if needed.

```tsx
import { Stack } from "../Stack/StackNative";
```

```tsx
return (
  <>
    <Stack orientation="horizontal">
      <Button onClick={() => editor && editor.commands.addRowAfter()} disabled={!editor}>
        Insert Row
      </Button>
      <Button onClick={() => editor && editor.commands.deleteRow()} disabled={!editor}>
        Delete Row
      </Button>
      <Button onClick={() => editor && editor.commands.addColumnAfter()} disabled={!editor}>
        Insert Column
      </Button>
      <Button onClick={() => editor && editor.commands.deleteColumn()} disabled={!editor}>
        Delete Column
      </Button>
    </Stack>
    <TableEditorNative editor={editor} />
  </>
);
```

![](/resources/devdocs/table-editor-06.png)

- **XMLUI Stack Component**: We import and use `Stack` from `../Stack/StackNative`. Note that `HStack` is not available as a native component, so we can't use that shortcut.
- **React Fragment (`<>...</>`)**: A component must return a single element. This groups the buttons into an anonymous container.

## Step 8: Theme the buttons

Our TableEditor component currently uses hardcoded button styling. To make TableEditor behave like a proper XMLUI component, we need to add theme support.

Try adding different theme props to your TableEditor:

```xml
<TableEditor themeColor="secondary" variant="outlined" size="lg" />
```

The buttons remain blue and solid. This happens because XMLUI doesn't know which props are valid for custom components. Without proper metadata, theme attributes are filtered out.

XMLUI components need metadata to define their allowed props. Let's look at how the Button component does this, then apply the same pattern to TableEditor.

First, add the necessary imports to `TableEditor.tsx`:

```tsx
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { buttonThemeMd, buttonVariantMd, sizeMd } from "../abstractions";
```

Modify the TableEditor function to accept theme props:

```tsx
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
  // ... existing logic
}
```

Then forward these props to all Button components:

```tsx
<Button
  onClick={() => editor && editor.commands.addRowAfter()}
  disabled={!editor}
  themeColor={themeColor}
  variant={variant}
  size={size}
>
  Insert Row
</Button>
```

After the TableEditor function, add metadata that defines the allowed props:

```tsx
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
```

Replace the simple renderer with a proper one that uses metadata:

```tsx
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
```

Button size affects padding but not icon size. To make icons scale with button size, add a size mapping function:

```tsx
// Map button size to icon size
const getIconSize = (size: string) => {
  switch (size) {
    case 'xs': return '14px';
    case 'sm': return '18px';
    case 'md': return '22px';
    case 'lg': return '26px';
    default: return '18px';
  }
};

const iconSize = getIconSize(size);
```

Then add SVG icons to buttons using the calculated size:

```tsx
<Button
  onClick={() => editor && editor.commands.addRowAfter()}
  disabled={!editor}
  themeColor={themeColor}
  variant={variant}
  size={size}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 16"
    width={iconSize}
    height={iconSize}
    stroke="currentColor"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="12" height="10" rx="1" />
    <line x1="2" y1="6" x2="14" y2="6" />
    <line x1="2" y1="9" x2="14" y2="9" />
    <line x1="19" y1="5" x2="19" y2="9" />
    <line x1="17" y1="7" x2="21" y2="7" />
  </svg>
  Insert Row
</Button>
```

Now TableEditor supports full theme customization.

```xmlui
  <TableEditor
    id="tableEditor"
  />

  <TableEditor
    id="tableEditor2"
    themeColor="primary"
    size="lg"
    variant="outlined"
  />

    <TableEditor
    id="tableEditor3"
    themeColor="attention"
    variant="ghost"
    size="sm"
  />
```

![](/resources/devdocs/table-editor-07.png)

The component now behaves like a native XMLUI component with automatic responsive design. Note that buttons collapse to icon-only mode on narrow screens.

<Image src="/resources/devdocs/table-editor-08.png" width="400px"/>

