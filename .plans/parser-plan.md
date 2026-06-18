# XMLUI Parser Plan

Status: initial draft  
Parent plan: `.plans/master-plan.md`, section `3. Markup Parser`

## Scope

The first parser experiment should implement only the XMLUI markup support
needed by the initial Vite dev-server examples. It should be small, explicit,
and designed to grow into the full XMLUI parser later.

Required now:

- parse enough XML to handle elements, attributes, comments, self-closing tags,
  text nodes, and nested children;
- preserve source locations for elements, attributes, text, expressions, and
  event handlers;
- understand the special root tags `<App>` and `<Component>`;
- split attributes by prefix:
  - normal props;
  - `var.*` local variables;
  - `global.*` global variables;
  - `on*` event handlers;
- parse text nodes with mixed literal text and `{expression}` segments.

Old XMLUI source to learn from:

- `createXmlUiParser`;
- `nodeToComponentDef`;
- compound component collection from `<Component>`.

Simplify for this experiment:

- no `<property>` helper tag;
- no `<event>` helper tag;
- no `<variable>` helper tag;
- no `<global>` helper tag;
- no `<Slot>`;
- no CDATA;
- no namespaces;
- no loaders;
- no `when`;
- no responsive props;
- no layout props;
- no parser-level diagnostics beyond clear syntax failures needed for the
  examples.

## Current Questions

- Should the first parser continue as a small hand-written parser, or should we
  switch early to a more formal XML tokenizer/parser while keeping our own
  XMLUI-specific transform?
- What source-location shape should be shared by compiler diagnostics, source
  maps, unit tests, and future language-server diagnostics?
- Should mixed text be represented as raw text plus expression spans, or should
  the parser produce separate text/expression parts immediately?
