# Build an Editor Component

This guide walks you through building a rich text Editor component for XMLUI, using the Tiptap editor as a foundation. We'll follow the same patterns as the HelloWorld guide, from setup to registration and testing.

## What You'll Build

By the end of this guide, you'll have created an Editor component that:

- Renders a rich text editor using Tiptap
- Is fully integrated with XMLUI's component system
- Can be extended with props, events, and theming (in future steps)

## XMLUI Component Architecture

XMLUI components consist of three main parts:

1. **Native React Component** (`EditorNative.tsx`) – The actual React/Tiptap implementation
2. **Component Metadata** (`Editor.tsx`) – Describes props and integrates with XMLUI
3. **Component Registration** (`ComponentProvider.tsx`) – Registers the component with XMLUI

This separation allows XMLUI to understand your component's interface while keeping the React code clean.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A working XMLUI development environment

## Step 1: Create the Component Directory

Create:

```bash
mkdir -p xmlui/src/components/Editor
```

## Step 2: Add a Placeholder Native Component

Create `xmlui/src/components/Editor/EditorNative.tsx` with:

```tsx
import React from "react";

export function Editor() {
  return <div>Editor placeholder</div>;
}
```

## Step 3: Register the Component

- Export a minimal renderer from `Editor.tsx`:

```tsx
import { Editor } from "./EditorNative";

export const editorComponentRenderer = {
  type: "Editor",
  renderer: (props: any) => <Editor />
};
```

- Register in `ComponentProvider.tsx`:

```tsx
if (process.env.VITE_USED_COMPONENTS_Editor !== "false") {
  this.registerCoreComponent(editorComponentRenderer);
}
```

## Step 4: Testbed and Verification

Add minimal XMLUI markup in the docs testbed:

```xmlui-pg display
<App>
  Editor!
  <Editor />
</App>
```

Confirm that the placeholder renders in the docs app.

## Step 5: Minimal Tiptap Integration

Replace the placeholder with a minimal Tiptap editor in `EditorNative.tsx`:

```tsx
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello, Tiptap!</p>",
  });

  return <EditorContent editor={editor} />;
}
```

Install dependencies:

```bash
npm install @tiptap/react @tiptap/starter-kit
```

Rebuild and confirm the Tiptap editor renders in the docs app.
