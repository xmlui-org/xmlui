# Render a Markdown content as a page

Load a `.md` file via `DataSource` and display it with the `Markdown` component.

The `Markdown` component renders a markdown string as styled HTML. Pair it with a `DataSource` that fetches a `.md` file and feed the result into the `content` prop. The content re-renders reactively whenever the data source value changes, so switching between documents is seamless.

```xmlui-pg copy display name="Markdown page with switchable content"
---app display
<App>
  <variable name="activePage" value="intro" />

  <HStack marginBottom="$space-3">
    <Button
      label="Introduction"
      variant="{activePage === 'intro' ? 'solid' : 'outlined'}"
      onClick="activePage = 'intro'" />
    <Button
      label="Getting started"
      variant="{activePage === 'getting-started' ? 'solid' : 'outlined'}"
      onClick="activePage = 'getting-started'" />
  </HStack>

  <Markdown when="{activePage === 'intro'}">
    <![CDATA[
# Introduction

Welcome to the **Project Hub** documentation. 
This guide covers installation, configuration, and daily usage.

## Features
- Reactive data binding
- Declarative UI markup
- Built-in theming

**Tip:** Start with the Getting Started page if this is your first visit.
    ]]>
  </Markdown>

  <Markdown when="{activePage !== 'intro'}">
    <![CDATA[
# Getting Started

Follow these steps to set up your first project.

## Prerequisites

1. Node.js 18 or later
2. A package manager (npm or pnpm)
3. A code editor

## Installation

````bash
npx create-xmlui-app my-app
cd my-app
npm start
````

Open `Main.xmlui` and start editing. Changes appear instantly in the browser.
    ]]>
  </Markdown>
</App>
```

## Key points

**CDATA sections let you write markdown inline**: Wrap markdown content in `<![CDATA[ … ]]>` as a direct child of the `<Markdown>` tag. This avoids XML parsing conflicts with characters like `<`, `>`, and `&` — you write plain markdown without any escaping.

**`when` switches between multiple content blocks**: Place several `<Markdown>` components with different `when` conditions (e.g. `when="{activePage === 'intro'}"`) so only the matching one renders. This is simpler than building a single long ternary expression in `content`.

**`content` and `DataSource` are alternative loading methods**: Instead of inline CDATA, pass a string to `content="{ds.value}"` where `ds` is a `DataSource` that fetches a `.md` file by URL. The `Markdown` component re-renders whenever the bound value changes.

**`showHeadingAnchors` adds clickable links**: Set `showHeadingAnchors="{true}"` to display an anchor icon on hover next to each heading. Users can click it to copy a deep link to that section.

**`openLinkInNewTab` controls link targets**: Set `openLinkInNewTab="{true}"` so every link inside the rendered markdown opens in a new browser tab — useful for documentation pages where users should not navigate away.

---

## See also

- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — display a placeholder while the markdown file is being fetched
- [Limit content width on large screens](/docs/howto/limit-content-width-on-large-screens) — keep the rendered markdown column readable on wide monitors
- [Generate a QR code from user input](/docs/howto/generate-a-qr-code-from-user-input) — another component that renders dynamic content reactively
