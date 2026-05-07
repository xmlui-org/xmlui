---
title: "Building a Docs Site with XMLUI"
slug: "building-a-docs-site-with-xmlui"
description: "A step-by-step walkthrough of the docs template — navigation, TOC, and Markdown rendering."
author: "Jane Smith"
date: "2025-03-10"
tags: ["tutorial", "xmlui"]
---

## The Docs Template

The `create-xmlui-app` tool ships with a docs template that gives you a complete
documentation site in minutes:

```bash
npx create-xmlui-app my-docs --template docs
cd my-docs && npm start
```

## What You Get

The template includes:

- A **sidebar** built with `NavPanel` and collapsible `NavGroup` sections
- A **Table of Contents** sidebar that auto-generates from page headings
- **Full-text search** across all Markdown content
- **Previous / next** navigation between pages
- A **dark / light mode** toggle

## How the Layout Works

The `vertical-sticky` app layout puts the `NavPanel` on the left and the content area on
the right. Inside each content page, the `DocumentPage` component (from
`xmlui-docs-blocks`) renders the Markdown next to a `TableOfContents` and a prev/next
links section.

## Adding a New Page

1. Drop a new `.md` file into `content/docs/`.
2. Add a `NavLink` in the `NavPanel` section of `Main.xmlui`.
3. Add a matching `Page` element inside `Pages` that loads the Markdown via
   `appGlobals.docsContent['<filename>']`.

That is all it takes.
