---
"xmlui-docs-blocks": patch
---

Remove the unsupported `url` prop from `DocumentPage` and `DocumentPageNoTOC` metadata. Pass Markdown text through `content`; fetch remote documents separately with `DataSource`. An obsolete `url` value no longer hides `DocumentPageNoTOC` slot content when `content` is absent.
