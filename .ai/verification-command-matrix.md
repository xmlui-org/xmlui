# XMLUI Verification Command Matrix

Use this matrix to choose the minimum verification commands for each rebuild
surface. Add commands as the repo grows.

## Always Consider

For any compatibility-sensitive change:

```text
npm --workspace xmlui run compatibility:sweep
```

For performance-sensitive compiler/runtime changes:

```text
npm --workspace xmlui run compatibility:perf
```

The full sweep starts local Playwright/Vite servers. In sandboxed agent
execution it may require permission to bind localhost ports.

## Parser, Compiler, Script, IR, and Diagnostics

```text
npm --workspace xmlui run test
npx vitest run tests/compatibility
npm --workspace xmlui run compatibility:perf
```

Add targeted tests under `xmlui/tests/compiler` or `xmlui/tests/compatibility`
with old source anchors.

## Runtime State, Rendering, Data, Routing, and Theming

```text
npm --workspace xmlui run test
npm --workspace xmlui run test:e2e
npm --workspace xmlui run compatibility:sweep
```

Use E2E tests for user-visible rendering and mutation behavior.

## Components

Minimum:

```text
npm --workspace xmlui run test
npm --workspace xmlui run test:e2e
```

Before marking `parity-tested` or `closed`:

```text
npm --workspace xmlui run compatibility:sweep
```

Also run visual/theme checks once the visual harness exists. Each component
closure note must list old spec/docs anchors and at least one mutation path when
the component can mutate state or participate in mutable data.

## Package, Build, Production, Standalone, and SSG

```text
npm --workspace xmlui run build
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run compatibility:sweep
```

For standalone sample changes:

```text
npm --workspace xmlui run prepare:standalone-samples
npm --workspace xmlui run test:e2e -- tests/e2e/standalone-runtime.spec.ts
```

## Metadata, Docs Reference, and VS Code

```text
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui-vscode run build
npm --workspace xmlui-vscode run test
```

Also run the full sweep when metadata changes because metadata feeds docs, VS
Code, diagnostics, and package tooling.

## Extension Packages

```text
npm run build:website-extensions
npm run build:website-extensions:metadata
npm run verify:website-extensions
npm run test:e2e:extension-packages
npm --workspace xmlui-counter-badge run test
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
npm --workspace xmlui run compatibility:sweep
```

For migrated website extension packages, `npm run test:e2e:extension-packages` runs
package-level Playwright smoke coverage for `xmlui-docs-blocks`,
`xmlui-website-blocks`, `xmlui-search`, `xmlui-masonry`, `xmlui-gauge`,
`xmlui-echart`, `xmlui-calendar`, `xmlui-grid-layout`, and
`xmlui-tiptap-editor`. It also runs the activated copied old package specs for
`xmlui-search`, `xmlui-docs-blocks` (`Share`, `DocsBlocks`),
`xmlui-website-blocks` (`Backdrop`, `Breakout`, `Carousel`, `HeroSection`),
`xmlui-gauge`, `xmlui-echart`, `xmlui-masonry`, and
`xmlui-tiptap-editor`, plus new source-adjacent package specs for
`xmlui-calendar` and `xmlui-grid-layout` because no old package specs were
found for those extensions. `npm run verify:website-extensions` aggregates the
website extension build, metadata build, and package E2E. As old first-party
packages are ported, add each package's test/build/metadata commands here.

These commands may start local Vite/Playwright servers. In sandboxed agent
execution they may require permission to bind localhost ports.

## Tooling, Website, Playground, Integration, and Release

Website display/production/SSG smoke:

```text
npm run verify:website
npm --workspace xmlui-website run build
npm --workspace xmlui-website run build-ssg
npm --workspace xmlui-website run verify:preview-ssg
npm run test:website:e2e
```

`npm run verify:website` aggregates the website production build, SSG build,
preview-SSG smoke, and website Playwright smoke. The website Playwright and
preview commands start local servers, so sandboxed agent execution may require
permission to bind localhost ports.

Current state: create-app, playground, full integration, and release surfaces
remain compatibility debt and are not yet implemented in the rewrite.

When each surface is rebuilt, add commands for:

- create-app generated project smoke;
- preview-ssg package smoke;
- playground startup and example execution;
- integration-test app creation/build/run;
- release artifact and package contents checks.
