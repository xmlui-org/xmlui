# Experiment 13: Tooling and Metadata Unification Findings

Status: Implemented for the current experimental subset

## Original XMLUI Compatibility Anchors

Inspected original project areas:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/coreComponentMetadata.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/collectedComponentMetadata.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/metadata-helpers.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ud-metadata.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/completion.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/hover.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/type-contract-diagnostic.ts`
- `/Users/dotneteer/source/xmlui/tools/vscode`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components`
- `/Users/dotneteer/source/xmlui/website/navSections/components.json`
- `/Users/dotneteer/source/xmlui/website/public/resources/components.json`

The old framework treats component metadata as a shared tooling contract. The
language server uses it for component/member completions and hover text, type
contract diagnostics use it for prop/event validation, and website/docs assets
consume related metadata for component reference pages and navigation.

The old implementation is broader than this experiment. It includes rich
descriptions, accepted child rules, enum/value types, default values,
deprecations, theme/style surface, accessibility diagnostics, strictness
handling, extension package metadata, and generated language-server metadata.
Those remain compatibility targets, not requirements for this first slice.

## Implemented Rewrite Shape

The rewrite now has a compiler-owned metadata module in
`xmlui/src/metadata`. It exports:

- a versioned artifact schema with `schemaVersion: 1`;
- metadata generation from the compiler component contract registry;
- user component metadata extraction from parsed component sources;
- validation and deterministic JSON serialization;
- unified diagnostics adapted from parser/compiler/contract diagnostics;
- metadata-driven completions and hover helpers.

Generated metadata is written by:

```text
npm --workspace xmlui run build:metadata
```

The artifact path is:

```text
xmlui/dist-metadata/xmlui-metadata.json
```

The artifact currently covers 24 components and 3 mutation-bearing example
records. It uses a deterministic `generatedAt` value and contract hash so tests
can detect drift without timestamp noise.

## Tooling Consumers

VS Code now consumes the shared metadata adapters for:

- XMLUI component completions;
- prop/event/template/declaration completions;
- hover text for components and members;
- unified diagnostics for parser, IR, and managed contract checks.

The existing semantic-token path still uses the parser directly, which is the
right split for LSP readiness: syntax/token features stay parser-owned, while
component facts come from metadata.

The docs reference generator now creates:

```text
xmlui/dist-docs-reference/components.json
xmlui/dist-docs-reference/nav-components.json
xmlui/dist-docs-reference/components/*.md
```

These outputs are intentionally experimental generated artifacts and are
ignored by git.

Production and SSG builds copy the generated metadata artifact into their
outputs and record it in the manifest metadata field, including a content hash.

## Diagnostics Note

`collectUnifiedDiagnostics` now uses `compileXmluiSource`, so it sees the same
managed component contracts as runtime compilation. Unknown component
diagnostics are de-duplicated when the IR validator and contract validator
report the same span.

## Verification

Passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui-vscode run test
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui-vscode run build
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run test:e2e
```

Observed results:

- XMLUI compiler tests: 25 files, 204 tests passed.
- VS Code tests: 2 files, 13 tests passed.
- E2E tests: 52 tests passed.
- Metadata generation reports 24 components and 3 examples.

## Deferred Compatibility

Still deferred:

- full original metadata field parity;
- full old language-server process parity;
- completion replacement ranges matching all original cursor contexts;
- accessibility diagnostics;
- reactive-cycle diagnostics in the language service;
- strictness/config-driven diagnostic escalation;
- extension package metadata ingestion;
- full website documentation generation.

