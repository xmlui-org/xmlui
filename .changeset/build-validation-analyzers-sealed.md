---
"xmlui": patch
---

Plan #13 (build-time validation analyzers) sealed — implemented remaining identifier, expression, and cross-binding rules: `id-unknown-method`, `expr-unbound-identifier`, `expr-unused-var`, `id-undefined-component-ref`, `id-undefined-form-ref`. The analyzer walker now lazy-parses XMLUI markup via `xmlUiMarkupToComponent` when callers don't supply a pre-built `markupAst`, so rules fire across the CLI (`xmlui check`), Vite plugin (`analyze: "off"|"warn"|"strict"`), and LSP diagnostic provider without callers having to pre-parse. New shared AST infrastructure (`rules/_ast-utils.ts`, `rules/_reserved-identifiers.ts`) supports identifier-reference / rooted-chain collection, lazy expression parsing, and framework-context-variable whitelisting. `id-unknown-slot` is registered as a documented no-op pending a `ComponentMetadata.slots` field (out of plan scope).
