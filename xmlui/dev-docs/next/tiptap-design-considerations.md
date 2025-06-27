# Tiptap Design Considerations for XMLUI Markdown Interop

## Context

XMLUI uses Markdown as the source of truth for all documentation and rich text content. The Markdown component supports a wide range of features, including GFM (GitHub Flavored Markdown) extensions, and maps Markdown/HTML tags to XMLUI's own React components for consistent theming and behavior.

## Interop Challenges

- **Tiptap (rich editor) natively produces HTML, not Markdown.**
- **Markdown is less expressive than HTML.** Some HTML features cannot be round-tripped to Markdown.
- **XMLUI Markdown only supports a subset of HTML tags,** mapped via the HTMLTags component. Arbitrary HTML is not guaranteed to render.

## Design Options

### 1. Plain Markdown Editor
- Simple `<textarea>` for raw Markdown editing.
- No conversion needed; what the user sees is what is stored.
- Power users can use all Markdown features.

### 2. Rich Editor Producing Markdown
- Use Tiptap for WYSIWYG editing, but restrict features to those that map cleanly to Markdown and XMLUI's Markdown component.
- On save, convert Tiptap's HTML output to Markdown (using a library like turndown).
- On load, convert Markdown to HTML for editing (using marked or markdown-it).
- Warn users about possible formatting loss if switching between modes.

## Supported Features

| Feature/Tag      | Markdown | HTML                        | XMLUI Markdown Support | Notes                        |
|------------------|----------|-----------------------------|-----------------------|------------------------------|
| Headings         | Yes      | `<h1>`-`<h6>`               | Yes                   | Standard                     |
| Bold/Italic      | Yes      | `<b>`, `<i>`, `<strong>`, `<em>` | Yes              | Mapped to Text variants      |
| Lists            | Yes      | `<ul>`, `<ol>`, `<li>`      | Yes                   | Standard                     |
| Links            | Yes      | `<a>`                       | Yes                   | Mapped to LinkNative         |
| Code/Pre         | Yes      | `<code>`, `<pre>`           | Yes                   | Mapped to Text/PreTag        |
| Tables           | GFM      | `<table>`                   | Yes (GFM)             | Supported via remark-gfm     |
| Images           | Yes      | `<img>`                     | Yes                   | Standard                     |
| Blockquote       | Yes      | `<blockquote>`              | Yes                   | Standard                     |
| Details/Section  | No (MD)  | `<details>`, `<section>`    | Yes (custom)          | Special handling             |
| Custom HTML      | No       | Most                        | No/Partial            | Only mapped tags allowed     |

## Best Practices

- **Keep Markdown as the canonical format.**
- **Restrict Tiptap features to those that map to XMLUI Markdown/HTMLTags.**
- **Warn users about possible formatting loss when switching between rich/plain modes.**
- **Test round-tripping** (Markdown → HTML → Markdown) for fidelity.
- **Document any limitations or unsupported features.**

## Open Questions

- Should the conversion logic live in the editor component or in global handlers?
- How should we handle features/extensions that are not supported by XMLUI Markdown?
- What is the best UX for switching between plain and rich modes?

---

*This document is a living record of design considerations for Tiptap/Markdown interop in XMLUI. Update as the implementation evolves.*