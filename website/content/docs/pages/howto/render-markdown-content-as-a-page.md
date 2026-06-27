# Render Markdown content as a page

Load a `.md` file via `DataSource` and display it with the `Markdown` component.

The `Markdown` component renders a markdown string as styled HTML. Pair it with a `DataSource` that fetches a `.md` file and feed the result into the `content` prop. When the URL changes, `DataSource` fetches the new file and the rendered page updates automatically.

```xmlui-pg copy display name="Markdown page from files"
---app display
<App var.activePage="intro.md">
  <HStack marginBottom="$space-3">
    <Button
      label="Introduction"
      variant="{activePage === 'intro.md' ? 'solid' : 'outlined'}"
      onClick="activePage = 'intro.md'" />
    <Button
      label="Getting started"
      variant="{activePage === 'getting-started.md' ? 'solid' : 'outlined'}"
      onClick="activePage = 'getting-started.md'" />
  </HStack>

  <DataSource
    id="pageContent"
    url="/api/docs/{activePage}"
  />

  <Spinner when="{!pageContent.loaded}" />
  <Markdown
    when="{pageContent.loaded}"
    content="{pageContent.value}"
    showHeadingAnchors="{true}"
    openLinkInNewTab="{true}"
  />
</App>
---api display
{
  "apiUrl": "/api",
  "initialize": "$state.pages = {\n  'intro.md': '# Introduction\\n\\nWelcome to the **Project Hub** documentation.\\n\\n## Features\\n\\n- Reactive data binding\\n- Declarative UI markup\\n- Built-in theming\\n\\n**Tip:** Start with the Getting Started page if this is your first visit.',\n  'getting-started.md': '# Getting Started\\n\\nFollow these steps to set up your first project.\\n\\n## Prerequisites\\n\\n1. Node.js 18 or later\\n2. A package manager such as npm or pnpm\\n3. A code editor\\n\\n## Installation\\n\\n~~~bash\\nnpx create-xmlui-app my-app\\ncd my-app\\nnpm start\\n~~~\\n\\nOpen `Main.xmlui` and start editing. Changes appear instantly in the browser.'\n};",
  "operations": {
    "get-doc-page": {
      "url": "/docs/:page",
      "method": "get",
      "handler": "delay(400); return $state.pages[$pathParams.page];"
    }
  }
}
```

In a real app, the URL can point directly to a static file such as `/docs/intro.md`. The playground example uses an API mock so the how-to remains self-contained.

## Key points

**`DataSource` fetches the markdown file**: Set `url` to the path of the `.md` file. Binding the file name into the URL, as in `/api/docs/{activePage}`, makes document switching reactive.

**Bind the fetched text to `content`**: Pass `content="{pageContent.value}"` to `Markdown`. The component renders the string returned by the `DataSource`.

**Show loading UI while the file is fetched**: Use `pageContent.loaded` to hide the `Markdown` until the first response arrives and show a `Spinner` in its place.

**`showHeadingAnchors` adds clickable links**: Set `showHeadingAnchors="{true}"` to display an anchor icon on hover next to each heading. Users can click it to copy a deep link to that section.

**`openLinkInNewTab` controls link targets**: Set `openLinkInNewTab="{true}"` so every link inside the rendered markdown opens in a new browser tab. This is useful for documentation pages where users should not navigate away.

**Inline CDATA is best for short embedded snippets**: You can place markdown directly inside `<Markdown><![CDATA[ ... ]]></Markdown>`, but for page content, keep the markdown in `.md` files and load it through `DataSource`.

---

## See also

- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) - display a placeholder while the markdown file is being fetched
- [Limit content width on large screens](/docs/howto/limit-content-width-on-large-screens) - keep the rendered markdown column readable on wide monitors
- [Generate a QR code from user input](/docs/howto/generate-a-qr-code-from-user-input) - another component that renders dynamic content reactively
