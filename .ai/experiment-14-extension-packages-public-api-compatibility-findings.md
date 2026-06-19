# Experiment 14: Extension Packages and Public API Compatibility Findings

Status: Implemented for the first compatibility slice

## Original XMLUI Anchors

Inspected original sources:

- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ExtensionDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/index.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneExtensionManager.ts`
- `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/index.tsx`
- `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/package.json`
- `/Users/dotneteer/source/xmlui/packages/xmlui-search/src/index.tsx`
- `/Users/dotneteer/source/xmlui/packages/xmlui-search/package.json`

The old extension package contract is an object with optional `namespace`,
`components`, `themes`, `functions`, and `themeNamespacePrefix`. First-party
packages usually default-export that object and expose build scripts such as
`xmlui build-lib` and `xmlui build-lib --mode=metadata`.

The old `StandaloneExtensionManager` preserves registration order, replays
previous registrations to new subscribers, and accepts one extension or an
array.

## Implemented Rewrite Shape

Implemented:

- `xmlui/src/extensions` public API with `Extension`, `ComponentExtension`,
  `ThemeDefinition`, extension component props, normalization helpers,
  `StandaloneExtensionManager`, and global registration helpers.
- `xmlui/src/index.ts` exports the supported extension-facing API.
- `packages/xmlui-counter-badge` fixture package default-exports an old-style
  extension object with:
  - namespace: `XMLUIExtensions`;
  - component: `CounterBadge`;
  - function: `addAmount`;
  - theme namespace prefix: `CounterBadge`;
  - metadata build script.
- Parser support for namespaced tags and attributes such as
  `<ext:CounterBadge />` and `xmlns:ext="XMLUIExtensions"`.
- XMLUI markup namespace resolution to `XMLUIExtensions.CounterBadge`.
- Compiler contract ingestion for extension components and qualified aliases.
- Event-handler code generation for extension function calls through
  `ctx.callFunction`.
- Runtime extension rendering with evaluated props, rendered children, and
  event handlers.
- Runtime scope propagation of extension functions.
- Vite dev, production, SSG, and standalone registration paths.
- Metadata generation includes extension components. The main metadata artifact
  now reports 26 components.
- Docs-reference generation includes extension component pages.
- Production and SSG builds include an extension fixture.
- Standalone global exposes `xmlui.registerExtension` and
  `xmlui.createElement` for plain browser extension samples.

## Samples and Mutation

Added:

- `xmlui/src/examples/extension-counter-badge/Main.xmlui`
- `xmlui/standalone-samples/extension-counter-badge/Main.xmlui`
- `xmlui/standalone-samples/extension-counter-badge/index.html`

The sample renders extension state through props, invokes an extension event,
calls the extension function `addAmount`, mutates XMLUI local state, and updates
the rendered result.

## Verification

Passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui-counter-badge run test
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
npm --workspace xmlui run build
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui-vscode run build
npm --workspace xmlui-vscode run test
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run test:e2e
```

Observed results:

- XMLUI compiler tests: 26 files, 209 tests passed.
- Fixture package tests: 1 file, 1 test passed.
- VS Code tests: 2 files, 13 tests passed.
- E2E tests: 54 tests passed.
- Metadata generation: 26 components, 3 examples.
- SSG generated `/extension-counter-badge`.

## Deferred Compatibility

Still deferred:

- arbitrary old React extension renderer compatibility;
- full old `xmlui` public export parity;
- `xmlui build-lib` CLI command compatibility;
- `clean-package` publish rewrite behavior;
- richer extension CSS bundling and package artifact shape;
- extension package HMR parity;
- extension package registry/download support;
- full theme variable prefix validation;
- full metadata parity for extension package docs.

