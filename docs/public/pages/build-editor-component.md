# Build a TableEditor Component

This guide walks you through building a TableEditor component for XMLUI, using the Tiptap editor as a foundation. The TableEditor will provide a visual and Markdown-friendly way to create and edit tables for use in XMLUI-powered documentation.

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

Note: We have not defined any theming specific to `TableEditor`.

