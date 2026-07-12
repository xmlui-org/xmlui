# Theme and Style Old-Pattern Migration Plan

Status: Step 4.5 implemented and verified; Step 5 resequenced after rollback  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`  
Primary gates:

- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

## Purpose

Migrate the rewrite's style and theme handling back to the exact runtime pattern
used by the old XMLUI project. The target is not a cleaner or parallel theme
model; the target is old XMLUI behavior from the user's point of view, including
theme variables, generated variables, component defaults, scoped `<Theme>`,
root themes, theme switching, style injection, SSG hydration, extension
component theming, and diagnostics.

The current unit and E2E suites pass. Each implementation step below must keep
that true. A step is not complete while unit tests fail. A step is also not
complete while there are E2E failures, except for up to three confirmed flaky
tests that pass on rerun without code changes.

## Compatibility Sources

Old implementation files to treat as the contract:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeContext.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleRegistry.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleContext.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/transformThemeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/extendThemeUtils.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/hvar.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/_themes.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themeVars.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themes/root.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themes/xmlui.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/validator/*`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/*`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ComponentProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppRoot.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/infrastructure/TestBed.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/ssg.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/Islands/activateIslands.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NestedApp/NestedAppReact.tsx`

Old docs and tests to preserve:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/*.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/*theme*.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/Theme.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/Theme.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/tests/components-core/theming/*.test.ts*`
- `/Users/dotneteer/source/xmlui/xmlui/tests-e2e/pages/styles-and-themes/*.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/tests-e2e/how-to-examples/*theme*.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/tests-e2e/inline-styles-disabled.spec.ts`

Current rewrite files that must be reconciled:

- `xmlui/src/runtime/rendering/theme.tsx`
- `xmlui/src/components-core/theming/ThemeContext.tsx`
- `xmlui/src/components-core/theming/ThemeProvider.tsx`
- `xmlui/src/components-core/theming/StyleContext.tsx`
- `xmlui/src/components-core/theming/StyleRegistry.ts`
- `xmlui/src/components-core/theming/utils.ts`
- `xmlui/src/styling/theme.ts`
- `xmlui/src/styling/contracts.ts`
- `xmlui/src/components/Theme/*`
- `xmlui/src/runtime/index.tsx`
- `xmlui/src/component-core/registry.ts`
- `xmlui/src/component-core/runtimeRegistry.ts`

## Current Divergences

The rewrite currently has two theme systems: `XmluiThemeRoot`/`ThemeScope` in
`runtime/rendering/theme.tsx`, plus a `LegacyThemeProvider` shim in
`components-core/theming/ThemeContext.tsx`. The old project has one
authoritative `ThemeProvider` and a root `<Theme root />` wrapper. This split
means config-level `defaultTheme`, website-local themes, scoped themes, and
component-generated CSS variables can disagree.

The old `StyleRegistry` has stable hashing, nested selector and at-rule CSS
generation, layers, SSR style extraction, root class collection, ref-counted
client injection, server hash hydration, parent-provider reuse, and
ShadowRoot/document injection targets. The rewrite's compatibility
`StyleContext` is mostly a no-op with a small global dynamic-style cache, and
the runtime `StyleRegistry` only handles flat `CSSProperties`.

The old `ThemeProvider` builds the active theme from built-ins, custom themes,
theme `extends`, root defaults, component default theme vars, tone-specific
vars, generated spacings, padding segments, border segments, base color tones,
button tones, base font sizes, and text font sizes. The rewrite's
`useCompiledTheme` merges a simplified variable stack and generates only part
of that behavior.

The old provider uses `ComponentProvider` as the source of component
`themeVars`, `defaultThemeVars`, declarations, and contributor components. The
rewrite has metadata fields, but the active runtime theme path does not feed
them through the old global theme chain in the same way.

The old `useComponentThemeClass` emits per-component CSS variables from the
current resolved theme scope, including contributor components and compound
values such as `1px solid $borderColor`. The rewrite's implementation infers a
component name from metadata and delegates to `createComponentThemeClass`,
which is not the same fallback/cascade model.

The old `<Theme>` component behavior includes `themeId`, `tone`, `root`,
`applyIf`, `disableInlineStyle`, wrapper elision for empty/inactive themes,
root class propagation, portal root tracking, notification defaults, and nested
scope behavior. The rewrite has both the old React component and a new runtime
renderer wrapper, creating extra places where semantics can drift.

The old theme validation and accessibility diagnostics pipeline is absent or
bypassed in the rewrite's active path. This includes strict theme sanitization,
known-name collection, derived-variable validation, diagnostic emission, and
contrast logging.

The old resource/font path loads theme resources, resolves `resource:` URLs,
uses `resourceMap`, exposes `fontLinks`, and loads `FontFace` objects on the
client. The rewrite only partially mirrors this.

The old SSG, islands, nested app, and test-bed style behavior depends on the
real `StyleProvider` contract: shared registries, `data-style-registry`,
`data-ssr-hashes`, `data-style-hash`, root classes, and shadow-root injection.
Those are not preserved by the current simplified style path.

The old Sass helper `_themes.scss` is mostly copied, but the rewrite has local
changes for modern Sass syntax. Those changes must be proven output-equivalent
or limited to syntax-preserving rewrites.

## Migration Principles

- Prefer porting old files and adapting imports/types over reimplementing the
  behavior from memory.
- Port old unit tests wherever the old behavior is covered by unit tests. Do
  not rely on E2E coverage alone when a focused old unit test exists.
- Keep one authoritative theme provider and style registry when the migration
  is complete.
- Preserve public exports: `useTheme`, `useThemes`, `useComponentThemeClass`,
  `StyleProvider`, `parseScssVar`, `themes.scss`, `ThemeDefinition`, and
  extension authoring compatibility.
- Keep generated files out of the repo unless an existing script intentionally
  updates them.
- After each step, run the full unit gate:
  `npm --workspace xmlui run test:unit`.
- After the unit gate passes, run the full E2E gate with max ten failures:
  `npm --workspace xmlui run test:e2e -- --max-failures=10`.
- If `test:unit` fails, port/fix the focused old unit coverage before moving
  on. Unit failures are not acceptable as flakes.
- If the full suite reports one to three suspected flakes, rerun only those
  specs with the same worker model. The step is complete only if the rerun
  passes without code changes.
- If there are more than three failures, or any deterministic failure, fix
  before moving to the next step.

## Regression Lessons From the Aborted Step 5 Attempt

After Step 4, an attempted Step 4.5 plus Step 5 run produced dozens of E2E
failures. The main mistake was not the old theme compiler itself, but the size
of the runtime change: provider compilation, theme context topology,
component-theme class generation, metadata registry activation, fallback
contexts, and component-specific shims were changed together. That made broad
interaction failures, such as `ContextMenu` and `Checkbox` regressions,
difficult to attribute to a single compatibility difference.

Use these guardrails for the renewed sequence:

- Step 4.5 is build/SSG plumbing only. It must not change runtime theme
  compilation, provider topology, `useComponentThemeClass`, component
  interaction behavior, or component styles.
- Step 5 must introduce the old compiler first as pure, inert code; then as a
  shadow calculation; then behind opt-in canaries; and only then as the global
  provider path.
- Do not edit `components-core/theming/utils.ts` or restore
  `useComponentThemeClass` during Step 5. That remains Step 7.
- Do not edit root provider topology, no-prop nested provider behavior, or
  `XmluiThemeRoot` ownership during Step 5. That remains Step 8.
- Do not patch component interaction drivers or Playwright helper behavior to
  hide theme regressions. If a menu, checkbox, portal, or keyboard test fails
  after a theme step, first prove whether the emitted CSS or class topology
  changed.
- If any Step 5 substep causes more than three deterministic E2E failures,
  revert or bisect that substep before adding more code.
- Run focused canaries before full E2E. Do not run multiple Playwright E2E
  commands in parallel against the same dev server.

## Implementation Steps

### Step 1: Freeze the Theme Contract Inventory

Create `.ai/theme-style-old-pattern-findings.md` with a concise source-linked
inventory of old theme behavior and the current divergences listed above. Add
a machine-readable or script-generated comparison of old vs rewrite component
theme metadata counts: component names, `themeVars`, `defaultThemeVars`,
`toneSpecificThemeVars`, `themeVarContributorComponents`, and declared value
types.

Implementation notes:

- Use the old checkout as the reference and do not normalize away differences.
- Include website-local themes from `website/src/themes/*.ts`.
- Include extension package metadata for the packages used by the website.

Verification:

- Port any old metadata/theme inventory unit tests that apply to this step.
- `npm --workspace xmlui exec -- vitest run tests/compiler/metadata.test.ts`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 2: Restore the Old StyleRegistry Contract

Port the old `StyleRegistry.ts` and `StyleContext.tsx` behavior into the
rewrite, preserving current import paths. Restore:

- `StyleProvider` props: `styleRegistry`, `forceNew`, parent-provider reuse;
- `useStyleRegistry` error behavior;
- `StyleInjectionTargetContext` and `useDomRoot`;
- nested selector and at-rule generation;
- `getSsrStyles`, `addRootClasses`, and `getRootClassNames`;
- SSR hash hydration from `style[data-style-registry="true"]`;
- ref-counted injection and cleanup using `data-style-hash`;
- layer ordering: `reset`, `base`, `components`, `themes`, `dynamic`.

Keep the current runtime renderers compiling by adapting type imports only.
Do not change component visuals in this step.

Verification:

- Port old unit tests for stable hashing, nested selector output, root classes,
  SSR style output, provider reuse, and shadow-root injection; add rewrite-side
  tests only where the old suite has no focused coverage.
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 3: Make the Test Bed and SSG Use the Restored Registry

Implementation note, 2026-07-12:

- The active rewrite SSG entry and sample SSG builder now return and inject
  old-style `ssrStyles`, `ssrHashes`, and root classes from `StyleRegistry`.
- `StyleProvider` and `StyleRegistry` are exported from the public `xmlui`
  entry so generated SSG modules can use the same import pattern as the old
  project.
- The focused SSG/standalone Playwright gate is currently blocked before tests
  run by the existing `build:ssg`/`build:production` pipeline: `tsc -p
  tsconfig.build.json --noEmit` reports broad unrelated strictness/module
  errors, and the direct SSG Vite build still hits the existing `.xmlui` plugin
  `Unknown file extension ".ts"` issue. This caveat is superseded by Step 4.5,
  which unblocks a focused SSG gate without weakening the full production type
  gate. The standard `test:unit` and `test:e2e -- --max-failures=10` gates
  passed after the Step 3 edits.

Re-align test and server rendering paths with the old registry behavior:

- keep a stable outer `StyleProvider` in the E2E test bed reinit path;
- restore old-style SSG collection and injection of `ssrStyles` and
  `ssrHashes`;
- route nested apps and islands through `StyleInjectionTargetContext`;
- update any rewrite SSG scripts that currently expect `data-xmlui-style-hash`.

Verification:

- Port old unit tests for test-bed/SSG style-registry behavior where
  available, and add focused tests for test-bed remount style stability.
- `npm --workspace xmlui run test:unit`
- Run focused SSG/standalone specs directly if they are not part of the
  default suite. Do not use `test:e2e:all`:
  `npm --workspace xmlui exec -- playwright test --max-failures=10 tests/e2e/ssg-hydration.spec.ts tests/e2e/standalone-runtime.spec.ts`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 4: Reconnect Component Metadata to the Theme Chain

Implementation note, 2026-07-12:

- Runtime-wrapped components now carry their `ComponentMetadata` and theme
  contributor metadata on the renderer function so the active runtime registry
  can expose the same component metadata surface the old registry used.
- Extension component definitions and old authoring compatibility wrappers now
  preserve `metadata`, `themeVars`, `defaultThemeVars`,
  `toneSpecificThemeVars`, and `themeVarContributorComponents` instead of
  dropping theme metadata at normalization time.
- `component-core/themeMetadata.ts` now collects old-registry-shaped
  `componentThemeVars`, deeply merged `componentDefaultThemeVars`,
  `componentThemeVarDeclarations`, contributor relationships, and
  `componentMetadataByName` from core runtime renderers and optional
  extensions. Extension theme variables are namespaced with
  `themeNamespacePrefix`.
- `tests/compiler/themeMetadata.test.ts` covers the representative component
  set, deep default-theme-var merging, and a namespaced extension with theme
  declarations and contributor metadata.
- Verification passed:
  `npm --workspace xmlui exec -- vitest run tests/compiler/themeMetadata.test.ts`,
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run test:unit`, and
  `npm --workspace xmlui run test:e2e -- --max-failures=10`. The metadata
  check still logs Vite's sandbox-only WebSocket `EPERM` warning but exits
  successfully and regenerates metadata.

Restore the old component registry theme metadata contract in the rewrite's
active component registry:

- collect every component's `themeVars`;
- deeply merge every component's `defaultThemeVars`;
- expose `componentThemeVarDeclarations`;
- preserve contributor component relationships;
- support extension component metadata and namespaced theme variables.

This step should not yet replace the provider. It should make the data needed
by the old provider available.

Verification:

- Add a parity test comparing old and rewrite counts/names for a representative
  set: `App`, `Button`, `Text`, `Heading`, `NavPanel`, `NavLink`,
  `Markdown`, `ContextMenu`, `Select`, `DatePicker`, and one extension.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 4.5: Unblock the Focused SSG Theme Gate

Before replacing the provider, make the SSG/render build path usable enough to
verify theme CSS collection and hydration without taking on the entire
production strict-type cleanup.

Scope guard:

- This step is allowed to touch build, Vite plugin, SSG render, sample build
  script, Playwright web-server wiring, and generated-bundle ignore rules only.
- This step must not touch runtime provider semantics, theme compilation,
  `ThemeContext`, `ThemeProvider`, `useComponentThemeClass`, component
  stylesheets, component renderers, or interaction/test helpers.
- Complete and verify this step alone before starting Step 5. If generated
  standalone sample bundles change during verification, either ignore them via
  the appropriate `.gitignore` rule or leave them unstaged as generated output;
  do not mix generated-bundle churn into the Step 5 diff.

Scope:

- Fix the `.xmlui` Vite plugin's build-time compiler loading path. In dev the
  plugin can use `server.ssrLoadModule`, but in build it currently falls back
  to native Node `import()` of `compileXmluiModule.ts`, which fails with
  `Unknown file extension ".ts"`. Replace that fallback with a Vite-compatible
  load/transform path or a build-safe compiler entry that does not require Node
  to import raw TypeScript.
- Add a focused SSG build/check script or test helper that builds the SSG render
  entry and runs SSG hydration/standalone specs without requiring
  `build:production`'s broad `tsc -p tsconfig.build.json --noEmit` gate.
- Keep `build:ssg` behavior documented: it still depends on
  `build:production`, so it remains blocked until the broader strict
  TypeScript errors are fixed. Do not hide or weaken that production gate as
  part of theme migration.
- Record the broad strict-type errors as separate build-pipeline debt if they
  still reproduce after the focused SSG path is fixed.

Verification:

- Direct SSG render build succeeds:
  `npm --workspace xmlui exec -- vite build --config vite.ssg-render.config.ts`
- Focused SSG/standalone specs run without `test:e2e:all`:
  `npm --workspace xmlui exec -- playwright test --max-failures=10 tests/e2e/ssg-hydration.spec.ts tests/e2e/standalone-runtime.spec.ts`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

Implementation checkpoint:

- Added a build-safe `.xmlui` compiler loader that uses an internal Vite SSR
  server instead of native Node importing `compileXmluiModule.ts`.
- Added shared Vite environment CSS handling so SSG/compiler SSR loads keep the
  same SCSS preprocessor options in Vite environments.
- Added `build:ssg:focused` for the focused SSG gate while leaving
  `build:ssg` and `build:production` strict typing behavior unchanged.
- Updated the focused Playwright SSG server to use `build:ssg:focused`.
- Wrapped SSG rendering in `MemoryRouter` so SSG render does not instantiate a
  browser router while rendering server-side.
- Replaced production-manifest config-time compiler imports with a static
  compatibility manifest for the focused fixture build. The broad
  compiler-backed production manifest analysis remains explicit deferred debt.
- Verification passed:
  `vite build --config vite.ssg-render.config.ts`,
  `npm --workspace xmlui run build:ssg:focused`,
  focused SSG/standalone Playwright specs (`8 passed`),
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run test:unit` (`308 passed`), and
  `npm --workspace xmlui run test:e2e -- --max-failures=10`
  (`5534 passed`, `83 skipped`).
- Remaining notes: `check:metadata` still logs Vite's sandbox-only WebSocket
  `EPERM` warning but exits successfully; SSG rendering still logs React
  `useLayoutEffect` SSR warnings; generated standalone sample bundles are
  tracked in the repository, so they may appear modified even though the
  `.gitignore` rule now ignores newly generated copies.

### Step 5: Port the Old Theme Compilation Pipeline Safely

Do not replace the active provider in one step. Step 5 ports the old compiler
through small substeps that are either unit-only, inert at runtime, shadowed at
runtime, or opt-in for focused canaries. The global provider switch is the last
substep, after component-specific incompatibilities are isolated and tested.

The old behavior to restore across the substeps is:

- built-in theme list and active theme/tone state;
- `collectThemeChainByExtends` with `RootThemeDefinition` plus component
  defaults;
- custom themes before built-ins, matching old precedence;
- generated variable insertion before the final theme layer;
- `generateBootstrapBaseColumns`, `generateBaseSpacings`,
  `generatePaddingSegments`, `generateBorderSegments`, `generateBaseTones`,
  `generateButtonTones`, `generateBaseFontSizes`, and
  `generateTextFontSizes`;
- `matchThemeVar` hierarchical fallback generation;
- `$var` chain resolution and embedded `$var` to CSS var conversion;
- `themeCssVars`, `themeVars`, `rawAllThemeVars`, `getThemeVar`,
  `getResourceUrl`, and `fontLinks`.

#### Step 5.1: Port Pure Compiler Helpers

Port pure functions from the old theme provider and helper modules into the
rewrite without wiring them to React context or emitted CSS. This includes the
generated-variable helpers, `matchThemeVar`, variable reference resolution,
embedded `$var` conversion, theme-chain collection, and resource URL helpers.

Verification:

- Port old focused unit tests for generated spacing, padding, border, tone,
  font-size, button-tone, and variable-resolution helpers.
- Add rewrite tests that compare representative old and new compiler helper
  outputs for `RootThemeDefinition`, `xmlui`, and one custom theme.
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

The E2E suite should be unchanged by this substep. Any deterministic E2E
failure means the substep accidentally changed runtime behavior and must be
bisected before continuing.

#### Step 5.2: Add an Inert Old Compiler Entry

Add a buildable old-pattern compiler entry, such as `compileOldThemeModel`,
that accepts explicit inputs: built-in themes, custom themes, component theme
metadata from Step 4, resources, resource map, default theme, and default tone.
It must return the old provider-shaped output, but no runtime provider may use
it yet.

Verification:

- Port old `tests/components-core/theming/ThemeProvider.test.tsx` cases that
  can be expressed as pure compiler tests.
- Add output-shape tests for representative components and contributors:
  `App`, `Button`, `Avatar`, `AutoComplete`, `DateInput`, `ContextMenu`,
  `Select`, `DatePicker`, `Markdown`, and one namespaced extension.
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

#### Step 5.3: Shadow the Compiler Without Applying It

Compute the old compiler output beside the current active theme provider in
development/test mode, but do not emit its CSS variables, classes, root
classes, font links, or resource lookups. The only runtime side effect allowed
is a test-readable diagnostic or debug snapshot used by focused assertions.

Verification:

- Add a focused unit or component test proving the shadow compiler runs with
  the active metadata registry and produces stable output.
- Add tests that diff shadow output against the currently emitted root vars for
  known mismatches without failing the application render.
- `npm --workspace xmlui run test:unit`
- Focused canary run:
  `npm --workspace xmlui exec -- playwright test --max-failures=10 src/components/Theme/Theme.spec.ts src/components/DateInput/DateInput.spec.ts src/components/AutoComplete/AutoComplete.spec.ts src/components/Avatar/Avatar.spec.ts src/components/ContextMenu/ContextMenu.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts src/components/Checkbox/Checkbox.spec.ts`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

Full E2E should remain behaviorally unchanged. Any broad E2E failure here
means the shadow path is not side-effect free.

#### Step 5.4: Add an Opt-In Old Compiler Canary Path

Add an internal opt-in that lets a focused test bed or fixture use the old
compiler output for root CSS variables. Keep the default runtime path on the
current provider. The opt-in must be explicit per test/app; do not enable it
globally through ambient process state that affects unrelated E2E specs.

Verification:

- Add canary tests for root custom theme variables, generated padding/border
  variables, generated font variables, base tones, button tones, resource URLs,
  and font links.
- Add a custom default-theme test proving root CSS variables can change without
  requiring a manual nested `<Theme>`.
- Run the focused canary specs with the opt-in enabled.
- Run the full default E2E suite with the opt-in disabled:
  `npm --workspace xmlui run test:e2e -- --max-failures=10`

#### Step 5.5: Isolate Component Compatibility Carve-Outs

Only after the opt-in root compiler canaries pass, fix component-specific
theme-variable mismatches one component at a time. Known risk areas from the
aborted attempt include `DateInput` custom variants, `AutoComplete` themed
inputs, `Avatar` border/background variables, and menu/portal interaction
surfaces that are sensitive to class topology.

Rules:

- Each component carve-out needs a focused failing test first.
- Prefer matching old Sass/theme-variable semantics over React-computed inline
  styles.
- If a temporary inline bridge is unavoidable, document why in the test or
  adjacent code comment and keep it scoped to emitted theme CSS variables.
- Do not change shared interaction helpers while fixing theme output.

Verification per component:

- Focused component E2E file, for example:
  `npm --workspace xmlui exec -- playwright test --max-failures=10 src/components/DateInput/DateInput.spec.ts`
- Focused theming unit tests affected by the carve-out.
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

#### Step 5.6: Switch the Active Provider to the Old Compiler

Switch the default provider to the old compiler only after Steps 5.1 through
5.5 pass. Keep `XmluiThemeRoot` in place until Step 8; this substep only
changes which compiled variables the legacy provider serves.

Verification:

- Port any remaining old `ThemeProvider.test.tsx` coverage that required the
  live provider rather than pure compiler tests.
- Run the Step 5 canary list first:
  `npm --workspace xmlui exec -- playwright test --max-failures=10 src/components/Theme/Theme.spec.ts src/components/DateInput/DateInput.spec.ts src/components/AutoComplete/AutoComplete.spec.ts src/components/Avatar/Avatar.spec.ts src/components/ContextMenu/ContextMenu.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts src/components/Checkbox/Checkbox.spec.ts`
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

Step 5 is complete only when the full unit and E2E gates pass after the global
switch. Up to three E2E flakes are acceptable only if they pass on focused
rerun without code changes.

### Step 6: Restore Strict Theme Validation and Accessibility Diagnostics

Port the old `validator/*` modules and wire them into the active provider:

- strict known-name validation from global and component vars;
- invalid value sanitization before CSS vars are emitted;
- derived-variable validation;
- diagnostic emission through the same old channel;
- contrast checks in dev mode and strict accessibility mode.

Verification:

- Port old validator unit tests.
- Add one runtime test proving an invalid strict theme var is filtered and
  logged, while a valid var applies.
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming/validator.test.ts`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 7: Restore `useComponentThemeClass`

Replace the rewrite adapter in `components-core/theming/utils.ts` with the old
component theme class behavior:

- read the current `ThemeScope`;
- collect `descriptor.themeVars`, `descriptor.defaultThemeVars`, and
  contributor descriptors from the component registry;
- strip old namespaces such as `Input:` and `Heading:` exactly as before;
- emit only variables that exist in `themeScope.themeVars`;
- use `useStyles(..., { layer: "themes" })`;
- preserve compound values already resolved to CSS variables.

Then adapt current component wrappers/renderers to use this one behavior,
removing duplicate component-theme generation only after tests pass.

Verification:

- Add focused tests for contributor vars with `Markdown`, `ContextMenu`, and
  `App`.
- Add a test for compound values such as `1px solid $borderColor`.
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 8: Align Root Provider Topology

Make the rewrite's app root match the old app root:

- root XMLUI markup is wrapped in `<Theme root />` before rendering;
- the authoritative `ThemeProvider` owns active theme/tone state;
- `defaultTheme`, `defaultTone`, `resources`, `resourceMap`,
  `strictTheming`, and `strictAccessibility` flow into that provider;
- local-storage theme/tone restoration happens before first render where old
  behavior requires it;
- remove or bypass `XmluiThemeRoot` only after the old provider fully supplies
  root CSS variables and tone switching.

Verification:

- Add tests for config `defaultTheme`, config `defaultTone`, `persistTheme`,
  and `ToneSwitch`/tone changer behavior.
- `npm --workspace xmlui run test:unit`
- Run existing and old App theme specs if enabled:
  `npm --workspace xmlui run test:e2e:app-compat -- --max-failures=10`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 9: Reconcile the `<Theme>` Component

Make `xmlui/src/components/Theme/*` match the old component behavior while
keeping the rewrite renderer entry points:

- `themeId` extends the selected theme;
- `tone` overrides the current tone for the subtree;
- `root` applies root classes and root theme styles;
- empty `<Theme>` does not introduce a wrapper;
- inactive `applyIf` renders children without applying a theme;
- dynamic `applyIf` and dynamic theme variables update after state changes;
- `disableInlineStyle` preserves old behavior;
- notification defaults still use theme config;
- portal root tracking avoids repeated state updates but preserves old output.

Verification:

- Restore the old assertions in `Theme.spec.ts` where they were relaxed, unless
  another documented compatibility issue makes them impossible.
- Port old `<Theme>` unit/component tests before relying on E2E coverage.
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10 src/components/Theme/Theme.spec.ts`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 10: Preserve Sass Theme Variable Collection

Audit `_themes.scss`, `themes.scss`, `themeVars.module.scss`, every component
`.module.scss`, and extension SCSS files against the old project:

- keep the old `appendThemeVar`, fallback, compose, spacing, border, radius,
  and text helper semantics;
- keep modern Sass syntax changes only when compiled output is equivalent;
- ensure `parseScssVar(styles.themeVars)` returns the same names and metadata
  shape expected by component metadata;
- avoid invalid `var(var(--xmlui-*)))` output.

Verification:

- Add a script or test that compares old and rewrite exported theme var lists
  for representative SCSS modules.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui run build:production`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 11: Remove the Duplicate Simplified Runtime Theme Model

After old-pattern behavior is passing, remove or shrink
`runtime/rendering/theme.tsx` so it no longer owns a conflicting theme model.
Keep only compatibility helpers that delegate to the old provider/registry.

Tasks:

- update `wrapComponent`, runtime adapter, behavior definitions, and extension
  authoring compatibility to use the restored old hooks;
- delete duplicated default theme variable maps from `styling/theme.ts` only
  after all references are gone or delegated;
- keep `styling/layout.ts` and layout resolver behavior if it is independent
  and already compatible.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 12: Port Old Theme Documentation E2E Coverage

Bring the old website theme/style docs and how-to E2E specs into the rewrite's
current `xmlui/tests/e2e` structure. Start by copying the old `tests-e2e`
specs verbatim; modify them only as needed for the rewrite's fixtures,
selectors, paths, or stability, while preserving the same scenario and
assertion intent:

- styles-and-themes pages: themes, theme variables, variable defaults, common
  units, layout props;
- how-to examples for custom color themes, overriding component vars, dark mode
  toggle, scoped themes, button variants, form input states, nested NavGroup
  theming, DatePicker theming, Badge theming, and related style examples;
- `inline-styles-disabled.spec.ts`.

Prefer computed-style assertions over display-only checks where the old docs
describe visual theme behavior.

Verification:

- Focused run of the newly ported specs with retries and the default worker
  model.
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 13: Website Theme Parity Checkpoint

Use the migrated old website as the broad visual compatibility surface:

- verify `website/src/themes/*.ts` are consumed by the root provider;
- verify `xmlui-website-theme`, `xmlui-hero-theme`,
  `xmlui-landing-theme`, and `xmlui-*-on-default` behave as in the old site;
- inspect the first viewport of home, docs, blog, get-started, and news;
- convert any theme regressions into focused XMLUI E2E tests before fixing.

Verification:

- `npm --workspace xmlui-website run test:e2e`
- `npm --workspace xmlui-website run build`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

### Step 14: Final Compatibility Sweep

Run the broader compatibility commands and record closure notes:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run build:production`
- `npm --workspace xmlui run build:ssg`
- `npm --workspace xmlui run compatibility:sweep`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

Create `.ai/theme-style-old-pattern-closure.md` with:

- final source files changed;
- remaining accepted deviations, if any;
- flaky tests observed and rerun evidence;
- commands and results;
- follow-up risks for website visual tuning.

## Risk Areas

- The highest regression risk is a broad provider switch that also changes
  `ThemeContext`, `useComponentThemeClass`, component-specific generated
  variables, and root topology. Keep those concerns separated by the Step 5
  substeps and do not advance after broad E2E failures.
- Replacing provider topology can cause large visual changes even when tests
  still pass; add targeted theme assertions before deleting the simplified
  runtime model.
- SSG and nested-app style injection are easy to break because they depend on
  DOM root selection and style tag attributes.
- `defaultTheme` and nested `<Theme themeId>` precedence can regress silently
  if tests only check that pages render.
- Component default vars are deeply merged in the old provider; shallow merges
  will lose tone-specific defaults.
- Extension metadata and namespaced theme variables must participate in the
  same registry as core components.
- Sass modernization can be safe syntactically but still alter exported theme
  var JSON; compare outputs.

## Decisions

- Do not use `test:e2e:all` as a QA gate. Use `test:unit`,
  `test:e2e -- --max-failures=10`, and focused direct Playwright commands for
  specs outside the default suite when needed.
- Copy old `tests-e2e` specs verbatim first, then modify them only as needed
  while preserving the same scenario.
- For `xmlui/src/styling/theme.ts`, choose the most straightforward
  implementation path during the migration. It may be kept as a compatibility
  facade or removed after delegation to `components-core/theming`, depending on
  which path leaves the least duplicate theme logic.
