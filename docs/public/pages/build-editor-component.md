# Build a TableEditor Component

This guide walks you through building a TableEditor component for XMLUI, using the Tiptap editor as a foundation. The TableEditor is focused on providing a visual and Markdown-friendly way to create and edit tables for documentation. We'll follow the same patterns as the HelloWorld guide, from setup to registration and testing.

## What You'll Build

By the end of this guide, you'll have created a TableEditor component that:

- Renders a visual table editor using Tiptap's table features
- Is fully integrated with XMLUI's component system
- Outputs Markdown tables for easy use in documentation
- Can be extended with props, events, and theming (in future steps)

## XMLUI Component Architecture

XMLUI components consist of three main parts:

1. **Native React Component** (`TableEditorNative.tsx`) – The actual React/Tiptap implementation
2. **Component Metadata** (`TableEditor.tsx`) – Describes props and integrates with XMLUI
3. **Component Registration** (`ComponentProvider.tsx`) – Registers the component with XMLUI

This separation allows XMLUI to understand your component's interface while keeping the React code clean.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A working XMLUI development environment

## Step 1: Create the Component Directory

Create:

```bash
mkdir -p xmlui/src/components/TableEditor
```

## Step 2: Add a Placeholder Native Component

Create `xmlui/src/components/TableEditor/TableEditorNative.tsx` with:

```tsx
import React from "react";

export function TableEditor() {
  return <div>TableEditor placeholder</div>;
}
```

## Step 3: Register the Component

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

## Step 4: Testbed and Verification

Add minimal XMLUI markup in the docs testbed:

```xmlui-pg display
<App>
  TableEditor!
  <TableEditor />
</App>
```

Confirm that the TableEditor placeholder renders in the docs app.

## Step 5: Minimal Tiptap Integration

Replace the placeholder with a minimal Tiptap table editor in `TableEditorNative.tsx`:

```tsx
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function TableEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello, Tiptap Table!</p>",
  });

  return <EditorContent editor={editor} />;
}
```

Install dependencies:

```bash
npm install @tiptap/react @tiptap/starter-kit
```

Rebuild and confirm the Tiptap TableEditor renders in the docs app.
