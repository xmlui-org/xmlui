---
title: "Theming in XMLUI"
slug: "theming-in-xmlui"
description: "How to customise colours, typography, and spacing with XMLUI theme variables."
author: "Alex Johnson"
date: "2025-03-20"
tags: ["theming", "xmlui", "css"]
---

## The Theme System

XMLUI uses a token-based theming system. Every component exposes a set of CSS-variable-like
theme variables that you can override at any level of the tree.

## Changing the Primary Color

Wrap any subtree in a `Theme` component and set the token you want to override. The
`color-primary-500` token cascades to buttons, links, and active navigation items
automatically.

```xml
<Theme color-primary-500="#6366f1">
  <App>
    ...
  </App>
</Theme>
```

## Typography

Use `fontFamily-base`, `fontSize-base`, and `lineHeight-base` theme variables to set the
global typography for your app.

## Dark Mode

Add `autoDetectTone="true"` on the `App` component to follow the system preference. Or
let users switch manually with the `ToneChangerButton` component in the `AppHeader`.

## Scoped Themes

Themes are scoped — they only affect descendants. This lets you apply a different look to
a single section without touching the rest of the app.

## Finding Token Names

Every component's documentation lists its supported theme variables. You can also inspect
the rendered HTML and look for CSS custom properties prefixed with `--xmlui-`.
