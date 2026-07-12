# Theme and Style Old-Pattern Migration Plan

Status: proposed for review  
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

### Step 5: Port the Old Theme Compilation Pipeline

Replace the simplified `components-core/theming/ThemeProvider.tsx`
implementation with the old pipeline, adapted to rewrite types and registry
names. Restore:

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

Do not remove `XmluiThemeRoot` yet; first make the legacy provider capable of
serving the old contract.

Verification:

- Port old `tests/components-core/theming/ThemeProvider.test.tsx` coverage.
- Add tests proving a custom default theme changes root CSS variables without a
  manual nested `<Theme>`.
- Add tests for generated padding/border/font/button/base-tone variables.
- `npm --workspace xmlui exec -- vitest run tests/components-core/theming`
- `npm --workspace xmlui run test:unit`
- `npm --workspace xmlui run test:e2e -- --max-failures=10`

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
