# Introduction

Welcome to **My Docs** — the documentation site for your project.

This template was built with [XMLUI](https://xmlui.org) and gives you a fully functional
documentation site out of the box. Edit the Markdown files in `content/docs/` to add your
own content.

## What You Get

This docs template includes:

- **Sidebar navigation** with collapsible groups and icons
- **Full-text search** across all your documentation pages
- **Table of contents** that auto-builds from headings on each page
- **Previous / next** navigation between pages, derived from the sidebar order
- **Dark / light mode** toggle in the header
- **Responsive layout** that works on mobile and desktop

## How It's Structured

```
my-docs/
├── content/
│   └── docs/
│       ├── introduction.md
│       ├── quick-start.md
│       ├── installation.md
│       ├── configuration.md
│       ├── core-concepts.md
│       ├── advanced.md
│       ├── api-overview.md
│       ├── api-endpoints.md
│       └── changelog.md
└── src/
    ├── Main.xmlui          ← app shell, navigation, routing
    ├── config.ts           ← app globals (docsContent, search index)
    └── content.ts          ← loads markdown files at build time
```

Each page is rendered by the built-in `DocumentPage` component (from the
`xmlui-docs-blocks` package). It picks up the Markdown content from
`appGlobals.docsContent` and renders it alongside a `TableOfContents` sidebar
and prev/next links.

## Getting Started

1. Edit the `<NavPanel>` in `src/Main.xmlui` to update the sidebar links.
2. Add or remove `<Page>` entries in the `<Pages>` block.
3. Drop a corresponding `.md` file into `content/docs/` for each new page.
4. Reference it from a `<Page>` as `appGlobals.docsContent['<filename>']`.

Head over to the [Quick Start](/quick-start) guide to see the next steps.
