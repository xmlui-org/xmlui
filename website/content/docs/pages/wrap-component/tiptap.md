# Tiptap

Tiptap is a headless rich-text editor built on ProseMirror. It's the kind of component that would typically require months of integration work to embed in a framework. With `wrapCompound` and `captureNativeEvents`, it took an afternoon.

## Transaction classification

ProseMirror represents every edit as a transaction. The render component classifies each transaction into a trace-friendly native event:

- `input` -- text typed
- `format` -- bold toggled, italic applied, etc.
- `structure` -- heading inserted, list toggled
- `insert` -- table created, horizontal rule added
- `delete` -- content removed

This is domain-specific knowledge that the render component owns -- the wrapper just traces whatever the render component reports. The pattern is the same as [BigCalendar's](/docs/guides/wrap-component/bigcalendar) native events, applied to a much richer event model.

## Demo

Type, format, insert a table -- then open the inspector. You'll see events like `native:input "hello"`, `native:format "bold: on"`, `native:insert "table 3x3"`. Every interaction is semantically classified without any changes to the XMLUI core.

```xmlui-pg
---app display
<App>
  <TiptapEditor
    aria-label="Demo editor"
    width="100%"
    height="500px"
    placeholder="Type here -- bold, italic, headings, lists, tables, code blocks..."
    initialValue="## Try it out

Type some text. **Bold** and *italic* work. Add a heading, toggle a list.

| Feature | Status | Notes |
|---|---|---|
| Bold / italic | Working | Toolbar or Ctrl+B/I |
| Tables | Working | Add/remove rows and columns |
| Task lists | Working | Checkboxes with nesting |

Then open the inspector and watch the native events." />
</App>
```

A complex, mature library with its own document model and transaction system can be wrapped for XMLUI in an afternoon. The result has full tracing -- every edit is semantically classified -- and no changes to the XMLUI core were needed.
