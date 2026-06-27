# Extension Package Migration Template

Use this template for each website extension package migrated from
`/Users/dotneteer/source/xmlui/packages/<package-name>` into
`/Users/dotneteer/source/xmlui-rs/packages/<package-name>`.

## Package: `<package-name>`

Status: planned  
Old source: `/Users/dotneteer/source/xmlui/packages/<package-name>`  
New source: `/Users/dotneteer/source/xmlui-rs/packages/<package-name>`  
Website routes/snippets using this package: `<list routes or content files>`

## Goal

Migrate `<package-name>` with enough public API, metadata, styles, tests, and
website integration to preserve old XMLUI behavior for users and to support the
website visual regression surface.

## Compatibility Baseline

Record before implementation:

- old `package.json` scripts, dependencies, exports, side effects, and
  `clean-package` rewrite;
- exported extension object shape: namespace, components, themes, functions,
  and `themeNamespacePrefix`;
- public types or utility exports consumed by the website or other packages;
- component list, props, events, APIs, parts, theme variables, defaults, and
  metadata source;
- CSS module files and global CSS/resource assumptions;
- demo app files and docs pages that show expected behavior;
- old E2E/unit tests and skipped cases;
- old build artifacts in `dist/` and metadata artifacts, when useful.

## Scope

- Port source, metadata, styles, assets, and local demo files required by the
  website.
- Preserve old authoring names and extension registration behavior.
- Build local extension and metadata artifacts.
- Migrate old package tests and add missing state-update smoke tests.
- Add or update website smoke coverage for one route/snippet using the package.

## Non-Goals

- Publishing to npm.
- Full `clean-package` automation unless needed for local artifact shape.
- Rewriting package internals for style beyond compatibility and build needs.
- Migrating unrelated packages.

## Implementation Steps

### Step 1: Inventory and Findings

Create `.ai/<package-name>-migration-findings.md`.

Include:

- inspected old files and observed behavior;
- dependency and bundler requirements;
- package-specific XMLUI public API requirements;
- tests to migrate;
- missing rewrite APIs or compatibility blockers.

Verification:

- Findings note cites old source files and test files.

### Step 2: Workspace Package Skeleton

Tasks:

- create or refresh `packages/<package-name>/package.json`;
- preserve old local-development `exports` shape unless the rewrite package
  infrastructure requires a documented difference;
- add `tsconfig.json`, test config, scripts, and metadata build entry;
- add package to root scripts only when it is ready for routine verification.

Verification:

- `npm --workspace <package-name> run build` reaches source compilation, or
  fails only on documented missing source/API work.

### Step 3: Source, Styles, Assets, and Metadata

Tasks:

- copy package source, XMLUI component files, SCSS modules, public assets, and
  metadata;
- adapt imports only where the rewrite public API differs, and record each
  compatibility shim or API gap;
- keep component visual styling in package stylesheets/classes;
- preserve package resource paths used by demos or website content.

Verification:

- package typecheck/build passes;
- package metadata build passes;
- CSS module import audit passes when relevant.

### Step 4: Public API Compatibility

Tasks:

- ensure default export matches the old extension object shape;
- verify components register by old names and namespace conventions;
- verify extension functions are available to XMLUI expressions/event handlers;
- verify themes and `themeNamespacePrefix` affect theme variables as before;
- expose public types used by website code.

Verification:

- a package unit test asserts extension object shape and utility exports;
- a focused XMLUI E2E renders at least one component from the package.

### Step 5: Existing Tests

Tasks:

- copy old package specs into the new package or into the rewrite E2E suite;
- activate tests in small groups;
- keep unsupported tests skipped only with a current compatibility reason and
  source link;
- prefer fixing package/runtime compatibility over weakening assertions.

Verification:

- old package spec command passes for activated groups;
- skipped/fixme audit is clean except documented blockers.

### Step 6: New State-Update Test Cases

Add at least one new E2E case when old package coverage is missing or only
checks static display.

Good candidates:

- user interaction changes selected item/page/value;
- component event mutates an XMLUI local/global variable;
- component API call changes rendered output;
- extension function participates in a binding or event handler;
- theme/tone switch changes visible package styling.

Verification:

- new test proves the rendered result changes after the interaction.

### Step 7: Website Integration

Tasks:

- add the package to `website/package.json` and `website/extensions.ts`;
- copy or update website content/routes/snippets that use the package;
- add a website smoke assertion for one visible use.

Verification:

- website dev server renders the route/snippet;
- no unknown-component diagnostics for this package;
- screenshot or DOM assertion confirms a visible package component.

### Step 8: Closure

Update:

- `.plans/website-migration-plan.md` package status;
- `.ai/<package-name>-migration-findings.md` with final verification;
- `.ai/compatibility-debt.md` for unresolved gaps.

Final verification:

- `npm --workspace <package-name> run build`
- `npm --workspace <package-name> run build:metadata`
- package test command
- focused website smoke using the package
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:e2e` when the package changes shared runtime
  behavior
