# Build a TableEditor Component

## Current

```xmlui-pg
<App var.showHtml="{false}" var.showMarkdown="{false}">

  <TableEditor
    id="tableEditor"
    themeColor="primary"
    size="lg"
  />

    <TableEditor
    id="tableEditor"
    themeColor="attention"
    size="sm"
  />


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



This guide walks you through building a TableEditor component for XMLUI, using the Tiptap editor as a foundation. The TableEditor will provide a visual and Markdown-friendly way to create and edit tables for use in XMLUI-powered documentation.

> [!INFO]
> If you operate in the [XMLUI](https://github.com/xmlui-org/xmlui) repo you can test your work live. Follow the instructions in `dev-docs/next/generating-component-reference.md` to build the XMLUI docs site, then load localhost:5173. When you edit `.tsx` files they will automatically recompile, so you can iterate rapidly as you develop your component. And you can add a test page to the site in order to use your evolving component

## Step 1: Create the Component Directory

Create:

```bash
mkdir -p xmlui/src/components/TableEditor
```

## Step 2: Register the Component

- Export a minimal renderer from `TableEditor.tsx`:

```tsx
import { TableEditor } from "./TableEditorNative";

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

## Step 3: Add a Placeholder Native Component

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

## Step 4: Use XMLUI Button

Import and using the XMLUI `Button` component instead of a native HTML button.

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

## Step 7: Add Controls

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

