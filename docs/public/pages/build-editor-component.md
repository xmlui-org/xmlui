# Build a TableEditor Component


This guide walks you through building a `TableEditor` component for XMLUI, using the [Tiptap](https://tiptap.dev) editor as a foundation. It will provide a visual and Markdown-friendly way to create and edit tables for use in XMLUI-powered documentation.

> [!INFO]
> If you operate in the [XMLUI](https://github.com/xmlui-org/xmlui) repo you can test your work live. Follow the instructions in `dev-docs/next/generating-component-reference.md` to build the XMLUI docs site, then load localhost:5173. When you edit `.tsx` files they will automatically recompile, so you can iterate rapidly as you develop your component. And you can add a test page to the site in order to use your evolving component

## Latest test version

```xmlui-pg
<App>

  <TableEditor2 id="tableEditor" />

  <Text variant="codefence" preserveLinebreaks="true">
    { tableEditor.getMarkdownSource() }
  </Text>

</App>
```

## Latest official version

```xmlui-pg
<App>

  <TableEditor size="xs" id="tableEditor"  />

  <TableEditor size="sm" id="tableEditor"  />

  <TableEditor size="md" id="tableEditor"  />

  <TableEditor size="lg" id="tableEditor"  />


  <Text variant="codefence" preserveLinebreaks="true">
    { tableEditor.getMarkdownSource() }
  </Text>

</App>
```

## Step 1: Create the folder.

```bash
mkdir -p xmlui/src/components/TableEditor
```

## Step 2: Create a minimal renderer

Add `TableEditor.tsx` in that folder.

```
export function TableEditor() {
  return (
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
  );
}

export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: (props: any) => <TableEditor {...props} />
};
```

Register it in `ComponentProvider.tsx`.

```tsx
import { editorComponentRenderer as TableEditorRenderer } from "./components/TableEditor/TableEditor";

if (process.env.VITE_USED_COMPONENTS_TableEditor !== "false") {
  this.registerCoreComponent(TableEditorRenderer);
}
```

You can now use this XMLUI markup.

```xmlui
<App>
  <TableEditor />
</App>
```

![](/resources/devdocs/table_editor_01.png)

We are just rendering an HTML table at this point, with no XMLUI theme support and no editing capability.

## Step 3: Make the table editable with Tiptap

Install Tiptap dependencies.

```
 npm install @tiptap/react @tiptap/starter-kit \
   @tiptap/extension-table @tiptap/extension-table-row \
   @tiptap/extension-table-cell @tiptap/extension-table-header
```

Update `TableEditor.tsx`.

```
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export function TableEditor() {
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

  return <EditorContent editor={editor} />;
}

export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: (props: any) => <TableEditor {...props} />
};
```

Use the same XMLUI markup.

```xmlui
<App>
  <TableEditor />
</App>
```

You can now edit the cells in the table.


![](/resources/devdocs/table_editor_02.png)


## Step 4: Add an Insert Row button

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export function TableEditor() {
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

  return (
    <div>
      <button
        onClick={() => editor && editor.commands.addRowAfter()}
        disabled={!editor}
      >
        Insert Row
      </button>
      <EditorContent editor={editor} />
    </div>
  );
}

export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: (props: any) => <TableEditor {...props} />
};
```

Use the same XMLUI markup.

```xmlui
<App>
  <TableEditor />
</App>
```

You can now insert rows.

![](/resources/devdocs/table_editor_03.png)

## Step 5: Use XMLUI's Button

Import and use `Button`.


```tsx
   import { useEditor, EditorContent } from "@tiptap/react";
   import StarterKit from "@tiptap/starter-kit";
   import Table from "@tiptap/extension-table";
   import TableRow from "@tiptap/extension-table-row";
   import TableCell from "@tiptap/extension-table-cell";
   import TableHeader from "@tiptap/extension-table-header";
   import { Button } from "../Button/ButtonNative";

   export function TableEditor() {
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

     return (
       <div>
         <Button
           onClick={() => editor && editor.commands.addRowAfter()}
           disabled={!editor}
         >
           Insert Row
         </Button>
         <EditorContent editor={editor} />
       </div>
     );
   }

   export const editorComponentRenderer = {
     type: "TableEditor",
     renderer: (props: any) => <TableEditor {...props} />
   };
```

You now have a proper themed XMLUI button.

![](/resources/devdocs/table_editor_04.png)

## Step 6: Show the HTML

Tiptap works natively with HTML, not Markdown. We'll eventually show Markdown but first let's add a method to show the HTML.

To keep our code modular, we’ll separate the editor’s rendering logic into a minimal presentational component. This makes it easy to reuse the editor UI in different contexts.

Create `TableEditorNative.tsx` alongside `TableEditor.tsx`.

```tsx
import { EditorContent } from "@tiptap/react";

export function TableEditorNative({ editor }: { editor: any }) {
  return <EditorContent editor={editor} />;
}
```

This component simply renders the Tiptap editor UI for a given editor instance.

Now, let’s expose a method to get the current HTML from the editor. Add this to `TableEditor.tsx`.

```tsx
React.useEffect(() => {
  if (registerComponentApi && editor) {
    registerComponentApi({
      getHtmlSource: () => editor.getHTML(),
    });
  }
}, [registerComponentApi, editor]);
```

Now we can show the HTML using this markup.

```xmlui
<App>

  <TableEditor2 id="tableEditor" />

  <Text> { tableEditor.getHtmlSource() } </Text>

</App>
```

![](/resources/devdocs/table_editor_05.png)


## Step 7: Show the Markdown

Tiptap does not provide an HTML-to-Markdown  converter. We'll start with a basic one called `turndown`. First install it.

```
npm install turndown
```

Then update `TableEditor.tsx` to use it.

```tsx
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../Button/ButtonNative";
import TurndownService from "turndown";

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
      registerComponentApi({
        getHtmlSource: () => editor.getHTML(),
        getMarkdownSource: () => turndownService.turndown(editor.getHTML()),
      });
    }
  }, [registerComponentApi, editor]);

  return (
    <div>
      <Button
        onClick={() => editor && editor.commands.addRowAfter()}
        disabled={!editor}
      >
        Insert Row
      </Button>
      <EditorContent editor={editor} />
    </div>
  );
}

export const editorComponentRenderer2 = {
  type: "TableEditor",
  renderer: ({ registerComponentApi, ...props }: any) => (
    <TableEditor {...props} registerComponentApi={registerComponentApi} />
  ),
};
```

Now we can show the Markdown.

```xmlui
<App>

  <TableEditor2 id="tableEditor" />

  <Text variant="codefence" preserveLinebreaks="{true}">
    { tableEditor.getMarkdownSource() }
  </Text>

</App>
```

![](/resources/devdocs/table_editor_06.png)

Rendered in XMLUI Markdown:

<Image src="/resources/devdocs/xmlui-rendering-of-tiptap-markdown.png" width="200px"/>


## Step 8: Add controls

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
}

export const editorComponentRenderer = {
  type: "TableEditor",
  renderer: ({ registerComponentApi, ...props }: any) => (
    <TableEditor {...props} registerComponentApi={registerComponentApi} />
  ),
};
```

We import and use `Stack` from `../Stack/StackNative`. Note that `HStack` is not available as a native component, so we can't use that shortcut.

A component must return a single element. We use a React Fragment (`<>...</>`) to group the buttons into an anonymous container.

Now we have this result.

```xmlui
<App>

  <TableEditor id="tableEditor" />

  <Text variant="codefence" preserveLinebreaks="{true}">
    { tableEditor.getMarkdownSource() }
  </Text>

</App>
```

![](/resources/devdocs/table_editor_07.png)




## Step 9: Add custom icons

The table editor buttons currently use only text labels. Let's add custom SVG icons.

```xmlui
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
    <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
    <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
    <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
    <line x1="19" y1="6" x2="19" y2="10" />
    <line x1="17" y1="8" x2="21" y2="8" />
  </svg>
  Insert Row
</Button>
```

We'll repeat this pattern for the other buttons.

<Image src="/resources/devdocs/table-editor-07.png" width="600px"/>

## Step 10: Theme the buttons

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

<Image src="/resources/devdocs/table-editor-08.png" />

## Step 10: Register the icons

> [!INFO]
> Registering icons is optional if you only use them inline within your component, but it is strongly recommended for reusability, maintainability, and accessibility.

- **Global usage:** Registered icons can be referenced anywhere in your app or docs by name (e.g., `<Icon name="table-insert-row" />` or as a Button's `icon` prop).
- **Accessibility:** Using the `<Icon />` component or Button's `icon` prop helps ensure ARIA attributes and accessible labeling are handled consistently.

To make your custom icon usable in XMLUI, wrap your SVG markup in a React component. This allows the icon to inherit color, size, and accessibility props from its parent.

```tsx
// File: xmlui/src/components/Icon/TableInsertRowIcon.tsx
import React from "react";

export default function TableInsertRowIcon(props) {
  return (
    <svg
      viewBox="0 0 24 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}  // Enables theming, sizing, and accessibility
    >
      <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
      <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
      <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
      <line x1="19" y1="6" x2="19" y2="10" />
      <line x1="17" y1="8" x2="21" y2="8" />
    </svg>
  );
}
```

> [!INFO]
> The `{...props}` spread is essential—it lets XMLUI pass color, size, and ARIA attributes to your icon automatically.

Register the icon in `IconProvider.tsx`.

   ```tsx
   import TableInsertRowIcon from "./Icon/TableInsertRowIcon";

   registerIconRenderer("table-insert-row", (props) => <TableInsertRowIcon {...props} />);
   ```


For icon-only buttons, use the `contextualLabel` prop to provide an accessible name.

  ```xmlui
  <Button icon="table-insert-row" contextualLabel="Insert a new row" />
  ```
  This ensures screen readers announce the button's purpose, even if only the icon is visible.


For decorative icons, use `aria-hidden="true"` to hide the icon from assistive technology.

  ```xmlui
  <Icon name="table-insert-row" aria-hidden="true" />
  ```




## Interlude: Understanding the layers

When working with TableEditor (and XMLUI components in general), it's important to understand the difference between referencing the component's API in XMLUI markup and in React/TSX code.

| Context         | How to reference TableEditor API         | How to get Markdown?                |
|-----------------|-----------------------------------------|-------------------------------------|
| XMLUI Markup    | Use `id` and `{ tableEditor.method() }`  | `{ tableEditor.getMarkdownSource() }` |
| React/TSX       | Use `ref` and `ref.current.method()`     | `tableEditorRef.current?.getMarkdownSource()` |

In XMLUI markup, assign an `id` to your TableEditor. The XMLUI runtime creates a variable with that name, allowing you to call registered API methods in markup expressions.

  ```xmlui
  <TableEditor id="tableEditor" />
  <Text>
    { tableEditor.getMarkdownSource() }
  </Text>
  ```

In React/TSX the `id` prop does **not** create a variable in your scope. To access the API, use a React `ref`:

  ```tsx
  const tableEditorRef = useRef();
  <TableEditor ref={tableEditorRef} />
  <Text>
    {tableEditorRef.current?.getMarkdownSource()}
  </Text>
  ```

> [!INFO]
> If you need to support both XMLUI and React/TSX usage, ensure your component exposes its API via both `registerComponentApi` (for XMLUI) and `useImperativeHandle` (for React refs).

> [!INFO]
> The `{ tableEditor.getMarkdownSource() }` syntax works in XMLUI markup because the `id` attribute creates a reference variable. In React/TSX, use a ref to access the API.
