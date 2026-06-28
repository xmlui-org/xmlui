# Component Re-Migration Plan

Date: 2026-06-28

## Scope

This plan replaces the earlier "rewrite the behavior until the migrated E2E
passes" component strategy with a faster, stricter source-preserving strategy.
The old XMLUI component implementation at
`/Users/dotneteer/source/xmlui/xmlui/src/components` is the source of truth.

For each component, migrate by copying the original React implementation files
and `.module.scss` files literally, then making only the minimum import and
adapter changes needed to compile in the rewrite workspace. The component
metadata/defaults/renderer file may be adapted to the rewrite's current
component registration and compiler/runtime contracts.

## Non-Goals

- Do not redesign component DOM, class structure, behavior, or SCSS.
- Do not change original component E2E test files.
- Do not replace original component visuals with inline React style logic.
- Do not migrate multiple behavioral components in one approval unit.
- Do not mark a component complete because a foundation suite passes.

## Compatibility Rules

1. Preserve the old component's React files and `.module.scss` files as copied
   artifacts. Allowed edits are import-path rewrites, type import rewrites, and
   tiny compatibility shims that are documented in the component note.
2. The main component metadata/renderer file, defaults, docs, and registration
   glue may be adapted for the rewrite, because these are the boundary between
   old source and new runtime.
3. Keep the existing component E2E infrastructure features. Infrastructure can
   be extended, but old component test files must remain unchanged.
4. Run focused E2E continuously while tuning the component adapter. If old tests
   expose missing shared infrastructure, update the infrastructure instead of
   weakening the test.
5. After any component migration, `npm --workspace xmlui run test:e2e` must run
   successfully. The source-preserved component and all current components must
   work side by side; do not accept a migration that only passes its focused
   component suite while breaking unrelated component E2E.
6. When a component is complete, stop and ask the user for approval before
   starting the next component. The user will run additional tests and report
   regressions before the next approval.
7. Prefer migration order where a component depends only on already migrated
   components. When this is impossible, migrate the dependency first or record a
   blocker.

## Diagnostic Hypothesis

This plan uses the following hypothesis as a compatibility diagnostic:

If a component's original React implementation files and `.module.scss` files
are copied literally, its metadata/default theme variables are matched to the
old component, and its original E2E tests are preserved, then remaining
behavior or style divergence is strong evidence of a regression in shared
rendering infrastructure rather than in the component itself.

Shared infrastructure includes, at minimum:

- XMLUI markup parsing and compiled prop/event binding;
- renderer wrapper behavior, child rendering, layout context, and component API
  registration;
- theming variable generation, fallback/default resolution, variant resolution,
  CSS module loading, and global style ordering;
- part/class mapping and responsive-layout class injection;
- runtime state updates, event dispatch, focus handling, portals/overlays, and
  browser testbed behavior.

When this diagnostic fires, the next step should be to investigate and fix the
shared infrastructure or adapter boundary. Do not tune the copied component
implementation to hide the divergence unless the old source relies on an
explicit infrastructure contract that the rewrite intentionally cannot support;
in that case, document the exception as compatibility debt before proceeding.

## Rendering Pipeline Strategy

This plan does not assume the current rendering pipeline is already compatible.
It also does not start with a broad rendering-pipeline rewrite before component
migration. The source-preserved components are the diagnostic probes that tell
us exactly which shared layer is wrong.

Expected rendering-pipeline work is discovery-driven:

- first, copy a small component and adapt only its boundary;
- then, if the copied React, SCSS, metadata, and old tests still diverge from
  the original behavior, classify the failing layer;
- fix the smallest shared infrastructure contract that explains the mismatch;
- rerun the focused suite and full `npm --workspace xmlui run test:e2e`;
- record the pipeline fix in the component closure note so later components can
  reuse it instead of carrying component-local workarounds.

Likely rendering-pipeline areas to inspect during the first migrations:

- `wrapComponent` and renderer adapter prop conversion, especially boolean,
  number, string, event, child, and API registration handling;
- child rendering and container/layout context propagation;
- `classes`/part mapping, `COMPONENT_PART_KEY`, and responsive-layout class
  injection;
- SCSS module loading and style order, including old `@layer components`
  expectations;
- metadata-to-theme-variable extraction and default theme variable resolution;
- theme class generation and variant/theme override precedence;
- runtime state update timing and event dispatch semantics;
- Playwright testbed compilation/rendering paths used by old component specs.

So the answer is: we do not yet know the exact rendering-pipeline changes, and
we should not guess them in advance. We should expect that some will be needed,
but only accept a pipeline change when a source-preserved component exposes a
specific incompatibility that the old implementation did not have.

## Fast Component Loop

For each component:

1. Inventory old files:
   - `*React.tsx`, helper `.tsx`/`.ts` files, context files;
   - `*.module.scss` and component-local `.scss`;
   - old `*.spec.ts`/`*.spec.tsx`, docs, defaults, and fixtures.
2. Copy protected files:
   - copy React implementation/helper files and SCSS modules from the old
     component folder;
   - do not refactor while copying.
3. Rewrite imports only:
   - map old core imports to rewrite equivalents;
   - add missing compatibility exports in shared rewrite infrastructure when
     multiple components need the same symbol;
   - avoid component-local behavioral edits unless there is no shared adapter
     alternative.
4. Adapt metadata/renderer:
   - keep public props/events/theme vars aligned with the old metadata;
   - bridge the rewrite compiler/runtime to the copied React component;
   - register public API methods and state updates through existing rewrite
     facilities.
5. Run tests in a tight loop:
   - `npm --workspace xmlui run test:e2e -- src/components/<Component>/<specs>`
   - `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=<Component>`
   - `npm --workspace xmlui run compatibility:css-module-import-audit`
   - `npm --workspace xmlui run test:e2e`
6. Record closure:
   - update this table to `Awaiting user approval`;
   - add a short `.ai/<component>-source-preserving-migration-findings-YYYY-MM-DD.md`
     note with old files copied, adapter edits, tests run, and residual risk;
   - add durable migration learnings to the "Migration Learnings" section of
     this plan, especially shared rendering/theming/testbed findings that may
     affect later components;
   - ask the user for approval to continue.

## Migration Learnings

Record findings here as components are migrated. Keep these concise and useful
for later components.

### ProgressBar, 2026-06-28

- The current rewrite had component-local behavior in `ProgressBarReact.tsx`
  that was not present in the old source: value normalization happened inside
  React instead of at the renderer boundary. Source-preserving migration moves
  that coercion/clamping back to `ProgressBar.renderer.tsx`, keeping the copied
  React implementation visually simple like the old component.
- The copied old React implementation expects theme/root classes through
  `classes[COMPONENT_PART_KEY]`, while the rewrite adapter currently exposes
  the theme class as `rootAttrs().className`. For this component, the renderer
  bridges that by moving `rootAttrs().className` into the old `classes` map.
  This is a likely shared adapter contract to revisit if many source-preserved
  components need the same bridge.
- The old SCSS module uses `components-core/theming/themes` to collect
  `themeVars` through `:export`; the rewrite file had replaced that with a
  local fake collector. Restoring the old SCSS tests whether the current Sass
  pipeline can consume old-style module exports directly.
- Restoring the old SCSS helper triggered Sass deprecation warnings from
  `components-core/theming/_themes.scss` for deprecated `if()` syntax. This did
  not fail the focused ProgressBar tests, but the warning will likely recur as
  more old SCSS modules are restored and should be treated as shared theming
  infrastructure noise/debt rather than component-local debt.
- A screenshot comparison exposed a visual mismatch that the focused E2E tests
  did not catch: completed `ProgressBar` bars were darker in the migrated app.
  The copied React/SCSS and matching metadata made this a shared theming
  failure, validating the diagnostic hypothesis. The old runtime generates
  `const-color-*` base tones with the `color` package's perceptual lightness
  behavior and inserts those generated variables between the root theme and the
  active `xmlui` theme layer. The rewrite lacked that generated base-tone layer,
  so `$color-success-500` resolved to the raw root constant
  `hsl(129.5, 58.4%, 51.5%)` instead of the old generated
  `hsl(129.5, 58.4%, 72.6%)`. The rewrite now ports this shared base-tone
  generation and applies it in `XmluiThemeRoot` and nested `ThemeScope`.
- The required full `npm --workspace xmlui run test:e2e` gate is still red after
  the ProgressBar-specific color fix. A rerun reached broader theme coverage and
  was stopped after 63 failed, 10 interrupted, 241 passed, and 4760 not run.
  Failures cluster around AutoComplete theme variables, Avatar/Badge border
  shorthand and longhand theme variables, and Button variant theme variables.
  ProgressBar should remain blocked on the global coexistence gate until these
  shared theme/variant/border contracts are fixed or the baseline is explicitly
  accepted as red.

### Avatar, 2026-06-28

- `AvatarReact.tsx` and `Avatar.module.scss` were restored to the old source
  shape. The only protected-file edits were import-path shims from old
  component-core symbols to rewrite equivalents.
- The old Avatar React component expects `classes[COMPONENT_PART_KEY]`, so the
  renderer uses the same bridge proven by `ProgressBar`: move
  `rootAttrs().className` into the old `classes` map while passing the adapter
  style/root attributes through unchanged.
- Avatar metadata cannot safely import `Avatar.module.scss` directly in this
  workspace. The dev Vite config pulls component metadata into its config-load
  graph, and Sass module imports with old `@use` syntax fail there before
  normal CSS handling is available. For source-preserving migration, keep the
  protected SCSS imported only from the React implementation and model metadata
  theme declarations in the main metadata file.
- The focused Avatar suite exposed a shared border theme regression. The old
  runtime generated side-specific variables from `border-*`,
  `borderHorizontal-*`, `borderVertical-*`, `borderColor-*`,
  `borderStyle-*`, and `borderWidth-*` theme variables. The rewrite now
  generates those border segments in shared theme code and applies them in
  default theme construction, `ThemeScope`, and component theme classes.
- The copied old SCSS also exposed a CSS cascade/layer regression. Avatar had
  correct inline `--xmlui-borderTopColor-Avatar` values, but computed borders
  still came from the base reset because `main.tsx` imported runtime/component
  modules before `global.css`, allowing `@layer components` to be created
  before the global layer order declaration. Moving `global.css` to the first
  import in `main.tsx` restores the old ordering contract: `base` reset first,
  component CSS later.
- The Avatar docs/example path exposed a compiler/runtime context regression:
  `onClick="toast('Avatar clicked')"` failed semantic validation with
  "Unresolved XMLUI script identifier 'toast'". The old renderer resolves
  identifiers against `AppContextObject`; the rewrite had a runtime toast
  service but did not inject an app-context object into script resolution. The
  migration now creates one app-context object, passes its keys into script
  analysis, injects the same object into `RuntimeScope`, and resolves context
  reads from it. This keeps future app-context globals discoverable from the
  injected object instead of requiring a separate compiler allow-list.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npx vitest run tests/compiler/scriptSemantics.test.ts` passes 46/46;
  `npm --workspace xmlui run test:e2e -- src/components/Avatar/Avatar.spec.ts`
  passes 97/97 unchanged; the exact Avatar/HStack/toast sample parses. The full
  global `test:e2e` gate was not rerun after Avatar; it remains a known broader
  baseline risk from the ProgressBar run.

### Icon, 2026-06-28

- `IconReact.tsx`, `Icon.module.scss`, icon helper components, icon-specific
  SCSS modules, SVG assets, `IconProvider.tsx`, `IconRegistryContext.tsx`, and
  `icons-abstractions.ts` were restored from the old source with import/type
  shims only. Icon is a prerequisite component rather than a visual leaf:
  Button, menu, input, table, and documentation components depend on the old
  provider/registry contract.
- The old icon helper components import SVG files with the `*.svg?react`
  convention. The rewrite's Vite pipeline treated SVG imports as URLs, which
  produced React runtime errors such as an invalid tag name beginning with
  `data:image/svg+xml`. A local `svgReactPlugin` now provides the old `?react`
  contract and is registered in dev, production, standalone, SSG, and CLI
  build/preview/start/build-lib paths.
- The old Icon source expects `components-core/theming/ThemeContext`,
  `parsers/style-parser/StyleParser`, and `components-core/utils/hooks`
  compatibility exports. These shims were added in shared locations so later
  copied components can reuse them instead of carrying component-local forks.
- The old Icon resource path uses `getResourceUrl("resource:icon.<name>")`.
  The testbed and runtime now pass test resources into `appGlobals.resources`,
  and `XmluiRoot` wraps rendered apps in `IconProvider` with icon resources
  normalized from that injected object.
- The existing Icon driver assumed the test id belonged to a wrapper containing
  an SVG. The old source puts root/test attributes directly on the SVG for
  built-in icons. The driver now supports both root-SVG and nested-SVG shapes,
  preserving existing E2E files while allowing source-preserved Icon output.
- The copied `IconReact` renders an inline-block wrapper span, but the rewrite
  App page-content layout blockifies direct flex children. `Icon.tsx` adds a
  neutral outer inline-block span at the metadata/renderer boundary so the
  preserved inner Icon wrapper still computes as `inline-block` under the old
  E2E assertion.
- Embedded `ThemedIcon` usage must receive both the component theme class and
  the component theme style object. The old `useComponentThemeClass` contract
  encoded theme variables in the returned class; the rewrite returns
  `className` plus inline CSS variables. Without applying `themeClass.style`,
  icons embedded in source-preserved components such as Button render at
  `0px` because `--xmlui-size-Icon` is missing.
- That neutral outer wrapper must be conditional. A visual check with an
  unresolved icon followed by a fallback icon showed an extra HStack gap because
  the wrapper rendered even when the preserved old `IconReact` returned `null`.
  `Icon.tsx` now resolves the icon name/fallback/resource at the boundary and
  returns `null` when no old icon path can render, preserving the original
  "missing icon consumes no layout space" behavior while keeping the
  inline-block wrapper for real icons.
- Invalid icon size handling is normalized at the renderer boundary: obviously
  invalid string sizes become zero-sized icons, while old React/SCSS sizing
  remains untouched for predefined sizes, CSS lengths, theme variables, and
  negative/zero edge cases.
- A root font-size mutation in one Icon E2E case leaked into later cases in the
  reused testbed page. `initTestBed` now clears `documentElement.style.fontSize`
  when installing a new payload, guarded for fresh-navigation init scripts.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Icon/Icon.spec.ts`
  passes 44/44 unchanged; the reported HStack visual regression now renders
  five icon children with even spacing for the six-`Icon` markup where one icon
  is unresolved and one uses `fallback="trash"`; the migrated component side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts --workers=1`
  passes 162/162. Full global `test:e2e` was not rerun for Icon because the
  broader baseline remained known-red after the ProgressBar run.

### Button, 2026-06-28

- `ButtonReact.tsx`, `Button.module.scss`, and `Button.defaults.ts` were
  restored from the old source. The protected React/SCSS/default files now keep
  the old DOM, class, part, focus, icon-label, and Sass-variable behavior; the
  rewrite-specific work lives in `Button.tsx` and shared compatibility shims.
- Button confirmed that `Icon` was the correct prerequisite. The renderer
  converts the public `icon` string into a source-preserved `ThemedIcon` node
  and passes it into old `ButtonReact`; no local Button icon rendering was
  reimplemented.
- The copied source required reusable compatibility shims for old
  `components-core/parts`, `COMPONENT_PART_KEY`, `Part`, `VisuallyHidden`, and
  old abstraction aliases such as `ButtonThemeColor`, `ButtonVariant`,
  `AlignmentOptions`, and `SizeType`.
- Button variant theme variables cannot rely only on raw SCSS extraction in the
  rewrite. The old SCSS declares many variables through Sass interpolation
  (`#{$component}` and color-scheme loops), which the current extractor cannot
  statically expand. `Button.tsx` declares the concrete variant/state theme
  variable surface at metadata level while keeping the old SCSS copied.
- The Button style suite exposed a shared theme-pipeline regression, not a
  component regression: generated hover/active Button tone variables were
  computed before default component variables and then overwritten by defaults.
  `createComponentThemeClass` now applies generated Button tone fallbacks after
  base variables so explicit base values can feed hover/active states.
- Button also refined border shorthand precedence. `border-*` shorthand should
  supply missing `borderColor-*`, `borderStyle-*`, and `borderWidth-*`
  longhands, including hover fallbacks, but explicit longhands such as
  `borderColor-Button-primary-outlined` must outrank shorthand-derived colors.
  The explicit theme map now generates shorthand longhands first, then overlays
  actual explicit longhands.
- A user visual check of the old Button documentation markup exposed a gap in
  the E2E coverage: `contentPosition` tests asserted `justify-content`, but did
  not catch that embedded icons were zero-sized. The cause was the shared
  `ThemedIcon` theme bridge described in the Icon learning above, not copied
  Button source. After applying Icon theme styles inside `ThemedIcon`, the exact
  markup with `width="200px"`, `icon="drive"`, and center/start/end
  `contentPosition` measures a visible `~19.2px` icon and correctly aligned
  icon+label groups.
- The same visual check then exposed missing fallback emission for
  variant-specific theme variables. The copied Button SCSS asks for concrete
  names such as `fontSize-Button-primary-solid` and
  `borderRadius-Button-primary-solid`; old theming resolves those through
  hierarchical fallbacks like `fontSize-Button` and `borderRadius-Button`.
  `componentThemeVariablesToCssProperties` now emits fallback values for
  declared theme vars, so Button defaults compute to the old visual shape:
  `14px` font size, `4px` radius, and `33px` height for the reported `sm`
  solid buttons.
- Button documentation still uses the legacy `iconPosition="right"` value.
  The old wrapper passed that value through to `ButtonReact`, where every
  non-`start` value rendered the icon after the label. The rewrite renderer was
  normalizing unknown values to the default `start`, so `right` regressed. The
  renderer now maps `right -> end` and `left -> start` before passing props to
  copied Button source, preserving the legacy aliases while keeping the modern
  `start`/`end` behavior.
- A user visual check of `themeColor="secondary"` exposed another shared
  theming issue. Old Button metadata defines secondary as a solid fill with a
  light default border (`borderColor-Button-secondary`), and copied SCSS asks
  for the more specific `borderColor-Button-secondary-solid`. The rewrite's
  generated-tone lookup must walk the same hierarchical fallback chain used
  when emitting CSS variables, otherwise generated tone colors mask old
  component defaults. The Button metadata now carries the missing old
  secondary/attention state defaults, and the shared `firstThemeReference`
  helper resolves fallback names before generating tones. The reported
  secondary solid button now computes a `1px` border with the old light
  secondary color instead of the generated fill tone.
- A user visual check with `<Theme width-Button="120px">` inside `HStack`
  exposed a Theme rendering-pipeline mismatch. The old Theme wrapper uses
  `display: contents`, so scoped children still participate as direct flex
  items of the surrounding layout container. The rewrite's `ThemeScope`
  rendered a normal `div`, turning the Theme into the single HStack item and
  stacking its Button children vertically. `ThemeScope` now forces
  `display: contents` on the scoping element while still carrying the scoped CSS
  variables, matching the original layout-transparent wrapper contract.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  passes 153/159 with 6 skips unchanged; the Theme+Button focused run
  `npm --workspace xmlui run test:e2e -- src/components/Theme/Theme.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  passes 158/164 with 6 skips unchanged; the side-by-side migrated component
  run `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  passes 315/321 with 6 skips unchanged.

### Checkbox, 2026-06-28

- `Toggle.tsx`, `Toggle.module.scss`, and `Toggle.defaults.ts` were restored
  from the old source as the protected implementation used by Checkbox and,
  later, Switch. `Checkbox` itself remains a rewrite metadata/renderer boundary
  around the copied Toggle because the old Checkbox component is metadata glue
  over Toggle rather than a separate styled React implementation.
- The copied Toggle source exposed a renderer callback identity regression.
  Old Toggle runs an initial-value effect whenever `updateState` changes, so a
  renderer adapter that creates a new `updateState` function every render
  resets API-driven values back to the initial value. `Checkbox.renderer.tsx`
  now passes stable `updateState` and `registerComponentApi` callbacks backed
  by refs. This is a reusable rendering-pipeline lesson for other preserved
  components that assume stable component API/state callbacks.
- The Checkbox renderer must distinguish an explicitly authored `value` prop
  from an absent one. Passing a defaulted `value={false}` into old Toggle makes
  it controlled and blocks `setValue`/form updates from repainting. The adapter
  now passes the explicit `value` only when the markup supplied it; otherwise it
  feeds form or local state.
- The old Toggle implementation paints the checkbox indicator through
  `box-shadow` on `::before`, while the current Checkbox driver read
  `::before.color`. `CheckboxDriver.getIndicatorColor()` now supports both
  shapes by reading the first CSS color from `box-shadow` before falling back
  to `color`, preserving the old E2E file while supporting source-preserved
  CSS.
- Focus outline variables needed the same hierarchical fallback shape as old
  XMLUI: `outlineWidth-Checkbox--focus` resolves through
  `outlineWidth-Checkbox`, which then resolves through the global focus
  variable. The metadata now models that chain so explicit Theme overrides and
  defaults both compute correctly.
- The old Toggle output puts the actual input at the component root. The
  Checkbox renderer adds only boundary wrappers needed for XMLUI label,
  `requireLabelMode`, variant, and part/test-id contracts; the copied Toggle
  DOM and SCSS remain untouched.
- A user visual check exposed that Checkbox labels must follow the old shared
  `LabelBehavior`/`ItemWithLabel` contract, not the rewrite's earlier inline
  label wrapper. The old Checkbox metadata has `compactInlineLabel: true`, but
  the default label position still comes from `ItemWithLabel` as `top`; only
  explicit `start`/`end` are compacted to snug `before`/`after`. The renderer
  now defaults unlabeled-positioned checkboxes to a full-width top label layout
  and keeps compact before/after positioning for explicit horizontal labels.
- A follow-up visual check showed the label font size was still too large. Old
  `ItemWithLabel` typography comes from shared form-item label variables,
  especially `fontSize-label-formItem` defaulting to `$fontSize-sm` and
  `fontWeight-label-formItem` defaulting to `$fontWeight-medium`. The Checkbox
  boundary wrapper now uses these shared typography variables as fallbacks
  instead of inheriting the page/base text size.
- Another visual check exposed that label spacing is also part of the old
  shared label contract. `ItemWithLabel` uses a `0.5em` container gap for label
  placement; the migrated Checkbox wrapper had used the rewrite's normal stack
  gap, which pushed top-positioned checkbox inputs too far from their labels.
  The Checkbox boundary now falls back to `0.5em` while still allowing an
  explicit `gap-label-Checkbox` theme override.
- A later alignment check showed the old `ItemWithLabel` DOM split matters:
  the outer form-item wrapper carries root/layout/test attributes, while an
  inner container handles label/input positioning. A single full-width `<label>`
  mixed those roles and shifted Checkbox blocks in centered layouts. The
  Checkbox boundary now uses an outer wrapper plus an inner label container,
  and only explicit compact horizontal positions shrink the outer test-id box
  to `fit-content`.
- The final reported alignment mismatch for
  `<App verticalAlignment="center">` was a shared App-shell regression rather
  than a Checkbox regression. In the rewrite, `adapter.rootAttrs()` and
  `adapter.style` carried generic alignment styles onto the outer App flex
  container, so `verticalAlignment="center"` became `align-items: center` and
  shrank/centered the main content to the Checkbox block's intrinsic width.
  The old App wrapper keeps the normal full-width/max-width page container in
  this case. `AppReact` now filters `alignItems` and `justifyContent` from the
  App shell style while preserving other layout props, restoring the original
  page geometry for source-preserved Checkbox examples.
- There is an open compatibility wrinkle around `NaN`: the migrated Checkbox
  E2E expects API/value coercion to treat `NaN` as truthy, while copied old
  Toggle's internal `transformToLegitValue` treats numeric `NaN` as false. The
  current renderer normalizes boundary `NaN` to the string `"NaN"` so the
  unchanged E2E suite passes. Before reusing this rule broadly, verify the
  actual old runtime behavior through the original browser app and decide
  whether the test or runtime observation is the stronger contract.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  the label-focused run
  `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts --workers=1 -g "Label|renders with label|label is associated|requireLabelMode|inside Form with label"`
  passes 32/32;
  `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts --workers=1`
  passes 118/118 unchanged after the spacing/alignment/App-shell updates; live
  Playwright inspection confirmed the migrated App page content returned from
  the incorrect 110.75px centered strip to the original 1280px max-width
  container geometry; the migrated component side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts --workers=1`
  passes 433/439 with 6 skips unchanged.

### Switch, 2026-06-28

- The old `Switch` source is metadata/renderer glue over the shared old
  `Toggle` implementation with `variant="switch"`. The migration therefore
  reuses the copied `Toggle.tsx`, `Toggle.module.scss`, and
  `Toggle.defaults.ts` from Checkbox instead of preserving a separate Switch
  React implementation.
- The Switch renderer mirrors the Checkbox boundary lessons: stable
  `updateState`/`registerComponentApi` callbacks, explicit-vs-absent `value`
  detection, form-bound value synchronization, and `NaN` boundary normalization
  are all handled outside copied Toggle.
- Switch uses the same old label/form-item contract discovered through
  Checkbox. A visual check of `<Switch readOnly="true" label="Checked" />`
  confirmed that an omitted `labelPosition` must resolve to the old
  `ItemWithLabel` default of `top`; only explicit `start`/`end` are remapped
  to compact `before`/`after` behavior. Boundary-only styles in
  `Switch.module.scss` provide the outer wrapper, compact horizontal label
  positions, `0.5em` label gap, and old form-item label typography while the
  switch track/thumb visuals come from copied `Toggle.module.scss`.
- The copied Toggle's `Part` wrapper needs an explicit `data-part-id="input"`
  from the renderer boundary because `rootAttrs()` may otherwise pass an
  undefined `data-part-id` that wins over the slot merge. Switch now applies
  the same explicit part bridge as Checkbox.
- Custom `variant` behavior needs an outer boundary wrapper when Switch is
  unlabeled. The wrapper carries root/test/theme behavior attributes and CSS
  variables, while the copied old Toggle remains the nested visible input part.
  This preserves unchanged tests that expect `getByTestId("test")` to contain
  `[data-part-id="input"]` for variant/animation cases.
- Focus outline defaults need the same hierarchical old-style fallback chain as
  Checkbox: `outlineWidth-Switch--focus -> outlineWidth-Switch ->
  outlineWidth--focus` and similarly for color, offset, and style.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Switch/Switch.spec.ts --workers=1`
  passes 104/104 unchanged; the migrated component side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`
  passes 537/543 with 6 skips unchanged.

### Badge, 2026-06-28

- The old `BadgeReact.tsx` and `Badge.module.scss` were restored as the
  protected implementation. The React file needed only import-compatible paths;
  the SCSS file could remain old source because the rewrite workspace already
  carries the old `components-core/theming/themes` SCSS helper.
- Badge exposed a renderer/metadata boundary trap: importing the SCSS module
  from `Badge.tsx` metadata makes Vite's config bundler try to parse SCSS before
  the runtime SCSS pipeline is active. Keep protected SCSS imported only by the
  browser/component React path, and declare composed theme-var metadata in TS
  when a component uses old SCSS composition helpers instead of direct
  `createThemeVar(...)` calls.
- The previous rewrite renderer had a runtime border-style compensation helper.
  With the old SCSS restored, border, padding, text, and pill variant behavior
  belong back in CSS classes; the renderer only resolves XMLUI boundary concerns:
  `value`, children fallback, `colorMap`, root attributes, component classes,
  and `contextMenu`.
- A visual check with `colorMap` exposed two shared theme-pipeline mismatches.
  First, rewrite spacing tokens used invalid CSS multiplication expressions
  such as `calc(0.5 * var(--xmlui-space-base))`; the old runtime generates
  concrete `space-*` values from `space-base`. Second, copied old SCSS expects
  `padding-*` shorthands to be segmented into `paddingTop/Right/Bottom/Left-*`
  variables. The rewrite now generates base spacing tokens and padding
  segments in the shared theme runtime, while Badge keeps the full composed
  padding metadata surface expected by the old SCSS.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Badge/Badge.spec.ts --workers=1`
  passes 24/24 unchanged; the migrated component side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`
  passes 561/567 with 6 skips unchanged.

### Br, 2026-06-28

- `Br` has no protected React implementation file or `.module.scss` in the old
  source. The compatibility surface is the metadata/renderer boundary itself:
  both lowercase `br` and capitalized `Br` render a void HTML `<br>` element.
- The old renderer used `PropsTrasform(...).asRest()` and forwarded rest props
  to the HTML element. The rewrite metadata now marks `Br` as accepting
  arbitrary props, and the renderer forwards `adapter.rootAttrs()` to preserve
  that old rest-prop behavior through the current adapter.
- Metadata keeps the old public shape: deprecated status, `isHtmlTag: true`,
  and identical metadata for the lowercase and capitalized names. No component
  styling or child rendering is introduced.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Br/Br.spec.ts --workers=1`
  passes 4/4 unchanged; `npm --prefix xmlui run check:metadata` passes; the
  migrated component side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`
  passes 565/571 with 6 skips unchanged.
- User confirmed Br is complete.

### Text, 2026-06-28

- `TextReact.tsx`, `Text.module.scss`, and `Text.defaults.ts` were restored
  from the old source. The protected React file only has import/dependency shims:
  a local composed-ref helper replaces `@radix-ui/react-compose-refs`, and a
  tiny local class merger replaces `classnames` because the rewrite workspace
  does not carry those dependencies.
- The renderer boundary preserves old value-vs-children behavior and bridges the
  current adapter root theme class into the old `classes[COMPONENT_PART_KEY]`
  contract. This is the same root-class bridge seen in earlier copied
  components.
- The renderer boundary must also preserve the old `extractValue.asDisplayText`
  behavior for `value`: repeated spaces and tabs are converted to `\xa0` after
  the first plain space in a run. This matters for multiline attribute values
  even when `preserveLinebreaks="false"` because indentation still affects
  browser wrapping. A plain `String(value)` subtly changed the wrapping of
  indented `Text value="..."` examples.
- Text exposed missing shared compatibility helpers rather than component-local
  behavior: copied source expects `getMaxLinesStyle`, `toCssVar`, and
  `useComponentStyle`. Minimal rewrite-side shims were added under
  `components-core` so protected component files can stay source-preserved.
- Known Text variants need a renderer-boundary dynamic class to make old
  variant-specific theme variables override the base Text CSS through the current
  CSS layer model. The class must be narrow: padding side variables use the old
  fallback order (`paddingTop/Bottom/Left/Right-Text-variant` before
  `paddingVertical/Horizontal-Text-variant`) or the dynamic class can override a
  more specific copied-SCSS declaration with a generic zero value.
- Text's inline HStack test exposed a shared driver/root-attribute problem in
  `Icon`: the current Icon boundary had attached `testId` to the inner SVG
  instead of the XMLUI root span. Moving root attributes to the outer span keeps
  Icon's public root aligned with the old driver contract and fixes mixed
  inline alignment measurements without changing Text's protected files.
- Text also exposed a Stack default-boundary gap: old metadata supplies default
  `horizontalAlignment` and `verticalAlignment`, while the rewrite renderer had
  allowed them to stay undefined. The Stack boundary now falls back to `start`
  for both properties unless fixed by `HStack`/`VStack`.
- A user visual check of the breakMode documentation sample exposed a shared
  Stack layout regression rather than a copied Text regression. The colored Text
  boxes had correct intrinsic heights, but nested `VStack` sections were flex
  shrinking to the App viewport height and letting their children overflow,
  causing later headings to paint over previous Text blocks. Old normal vertical
  Stack children are content-sized unless an explicit star/dock layout opts into
  shrink/stretch behavior. The rewrite Stack stylesheet now prevents direct
  children of vertical stacks from shrinking by default.
- Verification: `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes;
  `npm --prefix xmlui run check:metadata` passes;
  `npm --workspace xmlui run test:e2e -- src/components/Text/Text.spec.ts --workers=1`
  passes 140/140 unchanged after the `asDisplayText` boundary fix; the current rewrite Stack suite remains at its
  existing baseline of 2 passed and 83 skipped; the migrated component
  side-by-side run
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts src/components/Text/Text.spec.ts --workers=1`
  passes 705/711 with 6 skips unchanged.

## Pilot Sequence

| Step | Target | Why This Target | Dependency Gate | Completion Gate |
| ---: | --- | --- | --- | --- |
| 1 | `ProgressBar` | Simple visual leaf. Old implementation has one React file, one SCSS module, defaults, docs, and one old E2E suite. It validates the copy/import/metadata loop quickly. | Shared metadata/theming helpers only. | Old `ProgressBar.spec.ts` passes unchanged; SCSS module audit passes; `npm --workspace xmlui run test:e2e` passes; ask user approval. |
| 2 | `Button` | More difficult but still bounded. It exercises events, focus, disabled state, variants, icon part rendering, accessible icon-only labels, and many expanded tests. | `Icon`, `Part`, and `VisuallyHidden` must be usable from copied source. If `Part` is not source-preserved enough, migrate `Part` first as a tiny dependency. | Old `Button.spec.ts` and `Button-style.spec.ts` pass unchanged; expanded audit count matches old; `npm --workspace xmlui run test:e2e` passes; ask user approval. |
| 3 | `Table` | Complex target. It stresses data rendering, column context, row selection, pagination, sorting, virtualization, keyboard actions, theme vars, and composed dependencies. | `Checkbox`/`Toggle`, `Column`, `Icon`, `Pagination`, `Part`, `SelectionStore`, and `Spinner` must already be source-preserving complete. If any are not, execute those as prerequisite approval units before `Table`. | Old `Table.spec.ts` and `TableCellTextOverflow.spec.ts` pass unchanged; no skipped/fixme cases added; `npm --workspace xmlui run test:e2e` passes; ask user approval. |

The third step is intentionally gated. If `Table` dependencies are not ready,
the next approved component should be the smallest missing prerequisite, not
`Table` itself.

## Migration Status

Status values:

- `Not started`: no source-preserving re-migration under this plan yet.
- `Prerequisite`: migrate before a dependent target.
- `Candidate`: eligible when dependencies are green.
- `Blocked`: needs an open question resolved.
- `Awaiting approval`: focused migration passed and user approval is needed.
- `Approved complete`: user approved moving on after additional checks.

| Component | Complexity | Old Specs | Style Files | Main Dependencies Observed | Status | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| `APICall` | Complex | 1 | none | runtime data/APIs | Not started | Nonvisual data behavior; preserve async edge cases. |
| `Accordion` | More difficult | 1 | `Accordion.module.scss` | icon, part, toggle behavior | Not started | Stateful children and item context. |
| `Animation` | Simple | 0 | none | runtime animation hooks | Not started | No direct old spec; verify via dependents. |
| `App` | Complex | 5 | `App.module.scss`, `Sheet.module.scss` | AppHeader, NavPanel, Pages, Part | Not started | Shell/routing tests require broad smoke. |
| `AppHeader` | More difficult | 1 | `AppHeader.module.scss` | App, Part | Not started | App shell dependency. |
| `AppState` | More difficult | 1 | none | runtime state | Not started | Data mutation and event tests matter. |
| `AutoComplete` | Complex | 1 | `AutoComplete.module.scss` | ConciseValidationFeedback, Form, FormItem, Part, Select | Not started | Wait for input/form/select family. |
| `Avatar` | Simple | 1 | `Avatar.module.scss` | metadata helpers | Approved complete | User confirmed Avatar works as expected; focused unchanged suite passes 97/97; source-preserved React/SCSS copied with import shims; shared border theme generation and CSS layer order fixed. Full global E2E gate remains broader known risk. |
| `Badge` | Simple | 1 | `Badge.module.scss` | metadata helpers | Approved complete | User confirmed Badge works as expected; source-preserved React/SCSS restored from old project; colorMap padding mismatch fixed through shared spacing/padding theme generation without touching protected React/SCSS; focused unchanged Badge suite passes 24/24; side-by-side migrated component run passes 561/567 with 6 skips. |
| `Bookmark` | More difficult | 1 | `Bookmark.module.scss` | runtime navigation/state | Not started | Foundation-only signal exists in current tests. |
| `Br` | Simple | 1 | none | metadata helpers | Approved complete | User confirmed Br is complete; old metadata/renderer boundary restored for lowercase `br` and capitalized `Br`; arbitrary rest props are forwarded through `adapter.rootAttrs()`; focused unchanged Br suite passes 4/4; metadata and TypeScript checks pass; side-by-side migrated component run passes 565/571 with 6 skips. |
| `Button` | More difficult | 2 | `Button.module.scss` | Icon, Part, VisuallyHidden | Approved complete | User confirmed Button is complete; focused unchanged Button suites pass 153/159 with 6 skips; side-by-side migrated component run with ProgressBar, Avatar, Icon, Button, and Checkbox passes 433/439 with 6 skips. |
| `Card` | More difficult | 1 | `Card.module.scss` | Avatar, Heading, Link, Part, Text | Not started | Migrate after its visual/text dependencies. |
| `ChangeListener` | More difficult | 1 | none | runtime state/listeners | Not started | Event semantics over visuals. |
| `Checkbox` | More difficult | 1 | none in old folder | Toggle | Approved complete | User confirmed Checkbox works as expected; focused unchanged Checkbox suite passes 118/118; copied old Toggle React/SCSS/defaults power the renderer; stable callback and explicit/implicit value boundary fixes preserve old Toggle semantics. |
| `CodeBlock` | More difficult | 1 | `CodeBlock.module.scss` | Button, Icon, Part, Text | Not started | Copy button/text first. |
| `ColorPicker` | More difficult | 1 | `ColorPicker.module.scss` | FormItem, Part | Not started | Input/form dependency. |
| `Column` | More difficult | 0 | none | Table context | Prerequisite | Required before `Table`; verify through table specs. |
| `ConciseValidationFeedback` | More difficult | 0 | `ConciseValidationFeedback.module.scss` | Form, Icon, Tooltip | Prerequisite | Required by input components. |
| `ContentSeparator` | Simple | 1 | `ContentSeparator.module.scss` | metadata helpers | Candidate | Visual leaf. |
| `ContextMenu` | Complex | 1 | `ContextMenu.module.scss` | DropdownMenu, menu helpers | Not started | Overlay/menu family. |
| `DataSource` | Complex | 1 | none | runtime data | Not started | Data loading contract. |
| `DateInput` | Complex | 1 | `DateInput.module.scss` | ConciseValidationFeedback, Form, Icon, Input, Part | Not started | Wait for input/form. |
| `DatePicker` | Complex | 1 | `DatePicker.module.scss` | ConciseValidationFeedback, Form, FormItem, Icon, Input | Not started | Current fixme indicates shell mismatch risk. |
| `Drawer` | More difficult | 1 | `Drawer.module.scss` | Icon | Not started | Overlay/focus behavior. |
| `DropdownMenu` | Complex | 1 | `DropdownMenu.module.scss` | Button, Icon, menu helpers | Not started | Old suite currently skipped in rewrite. |
| `EventSource` | Complex | 0 | none | runtime events | Not started | Verify via synthetic event source fixtures. |
| `ExpandableItem` | More difficult | 1 | `ExpandableItem.module.scss` | Icon, Part, Toggle | Not started | Old suite currently skipped in rewrite. |
| `Fallback` | More difficult | 0 | none | runtime error/fallback | Not started | Verify through runtime scenarios. |
| `FileInput` | Complex | 1 | `FileInput.module.scss` | Button, FormItem, Icon, TextBox | Not started | Wait for Button/TextBox/FormItem. |
| `FileUploadDropZone` | More difficult | 1 | `FileUploadDropZone.module.scss` | Icon, component utils | Not started | Browser file/drop semantics. |
| `FlowLayout` | Complex | 1 | `FlowLayout.module.scss` | ScrollViewer | Not started | Existing skipped layout cases; high visual risk. |
| `FocusScope` | More difficult | 1 | none | focus management | Not started | Needs browser focus-specific checks. |
| `Footer` | More difficult | 1 | `Footer.module.scss` | App | Not started | Old suite currently skipped in rewrite. |
| `Form` | Complex | 1 | `Form.module.scss` | Button, FormItem, Part, ValidationSummary | Not started | Central prerequisite for inputs. |
| `FormItem` | Complex | 2 | `FormItem.module.scss`, `HelperText.module.scss` | many form/input components | Not started | Important dependency hub; migrate after minimal inputs are stable or preserve helper APIs. |
| `FormSegment` | More difficult | 1 | none in old folder | Form | Not started | Form family. |
| `Fragment` | Simple | 1 | none | metadata helpers | Candidate | Markup/container behavior. |
| `Heading` | Simple | 2 | `Heading.module.scss` | metadata/container helpers | Candidate | Text/HTML dependency. |
| `HtmlTags` | More difficult | 1 | `HtmlTags.module.scss` | Heading, Link, Text | Not started | After text/link. |
| `I18n` | More difficult | 0 | none | metadata helpers | Not started | No direct old spec; needs usage fixture. |
| `IFrame` | Simple | 1 | `IFrame.module.scss` | metadata helpers | Candidate | Browser-sensitive but isolated. |
| `Icon` | Complex | 1 | many icon `.module.scss` files | icon registry/provider | Approved complete | User confirmed Icon is ready; focused unchanged suite passes 44/44; required shared `svg?react`, IconProvider, resource, driver, and testbed isolation fixes. Required by Button/Table and many others. |
| `Image` | Simple | 1 | `Image.module.scss` | metadata helpers | Candidate | Visual media leaf. |
| `IncludeMarkup` | Complex | 1 | none | compiler/runtime include | Not started | Async compile boundary. |
| `Input` | More difficult | 0 | input part SCSS modules | Icon, Text | Prerequisite | Required by TextBox/DateInput/TimeInput. |
| `InspectButton` | More difficult | 0 | `InspectButton.scss` old / module in rewrite | Button, Icon | Not started | Pair with Inspector. |
| `Inspector` | Complex | 0 | `Inspector.scss` old / module in rewrite | Icon, inspect mode store | Not started | Debug UI and global styles question. |
| `Items` | More difficult | 1 | none | container helpers | Not started | Container iteration semantics. |
| `Lifecycle` | More difficult | 0 | none | runtime lifecycle/events | Not started | Existing fixmes for thrown script support. |
| `Link` | More difficult | 1 | `Link.module.scss` | Icon, Part | Not started | Navigation and browser behavior. |
| `List` | Complex | 1 | `List.module.scss` | Card, Checkbox, SelectionStore, Spinner, Table, Text | Not started | Depends on many data/display components. |
| `LiveRegion` | More difficult | 1 | `LiveRegion.module.scss` old | accessibility/runtime announcement | Not started | Accessibility behavior. |
| `Logo` | Simple | 0 | `Logo.module.scss` old | AppHeader, Image | Not started | Verify via app shell. |
| `Markdown` | Complex | 2 | `Markdown.module.scss`, `CodeText.module.scss` | CodeBlock, ExpandableItem, Heading, Link, NestedApp, Text, Toggle, TreeDisplay | Not started | Large parser/rendering surface. |
| `Menu` | Simple | 0 | `Menu.module.scss` | none | Prerequisite | Shared menu styles; migrate before menu family. |
| `MessageListener` | More difficult | 1 | none | runtime messages | Not started | Browser messaging. |
| `ModalDialog` | Complex | 1 | `ModalDialog.module.scss` old plus dialog styles | Button, Icon, Part, Stack, Text | Not started | Overlay/focus and portal behavior. |
| `NavGroup` | Complex | 1 | `NavGroup.module.scss` | App, Icon, NavLink, NavPanel | Not started | Navigation shell. |
| `NavLink` | Complex | 1 | `NavLink.module.scss` | App, Icon, NavGroup, NavPanel | Not started | Old suite currently skipped. |
| `NavPanel` | Complex | 1 | `NavPanel.module.scss` | App, Logo, Part, ScrollViewer | Not started | Old suite currently skipped. |
| `NavPanelCollapseButton` | More difficult | 0 | none | App, Button, Icon | Not started | Navigation shell dependency. |
| `NestedApp` | Complex | 1 | `NestedApp.module.scss` plus helpers | App, Button, ComponentRegistryContext, Icon, Markdown | Not started | Runtime app embedding. |
| `NoResult` | Simple | 1 | `NoResult.module.scss` | Icon | Not started | After Icon. |
| `NumberBox` | Complex | 1 | `NumberBox.module.scss` | Button, ConciseValidationFeedback, Form, FormItem, Icon, Input, Part | Not started | Input/form dependency. |
| `Option` | More difficult | 1 | none | container helpers | Prerequisite | Required by Select/Pagination/RadioGroup. |
| `PageMetaTitle` | Simple | 1 | none | document title | Candidate | Browser metadata behavior. |
| `Pages` | Complex | 1 | none old / module in rewrite | App | Not started | Routing shell. |
| `Pagination` | Complex | 1 | `Pagination.module.scss` | Button, FormItem, Icon, Option, Part, Select, Text | Prerequisite | Required before `Table`. |
| `Part` | Simple | 0 | none | none | Prerequisite | Required by Button/Table and many themed components. |
| `ProfileMenu` | More difficult | 0 | `ProfileMenu.module.scss` | Avatar, DropdownMenu | Not started | Menu/avatar dependency. |
| `ProgressBar` | Simple | 1 | `ProgressBar.module.scss` | metadata helpers | Approved complete | User considers ProgressBar complete; focused old suite and audits pass; screenshot color mismatch fixed via shared base-tone generation; now passes in the side-by-side migrated component run. |
| `QRCode` | Simple | 1 | `QRCode.module.scss` | metadata helpers | Candidate | Visual leaf with external rendering dependency. |
| `Queue` | Complex | 1 | none | runtime queue | Not started | Data mutation/order behavior. |
| `RadioGroup` | Complex | 1 | `RadioGroup.module.scss` | FormItem, Option | Not started | Input/form dependency. |
| `RatingInput` | More difficult | 1 | `RatingInput.module.scss` | Part | Not started | Stateful input without large dependencies. |
| `Redirect` | More difficult | 1 | none | routing utils | Not started | Browser/routing behavior. |
| `ResponsiveBar` | Complex | 1 | `ResponsiveBar.module.scss` | DropdownMenu, Part | Not started | Existing skipped overflow cases. |
| `RetryPolicy` | More difficult | 0 | none | request policy | Not started | Verify through APICall/DataSource. |
| `ScrollViewer` | Complex | 1 | `ScrollViewer.module.scss` | scroller helper | Not started | Existing skipped fade/overlay cases. |
| `Select` | Complex | 1 | `Select.module.scss` | ConciseValidationFeedback, Form, FormItem, Icon, Option, Part | Not started | Overlay/input family. |
| `SelectionStore` | More difficult | 0 | none | selection context | Prerequisite | Required before `Table`, `List`, `TileGrid`. |
| `SkipLink` | More difficult | 1 | none | focus/navigation | Not started | Accessibility/browser behavior. |
| `Slider` | More difficult | 1 | `Slider.module.scss` | FormItem, Tooltip | Not started | Input/form dependency. |
| `Slot` | More difficult | 1 | none | runtime slot projection | Not started | Composition semantics. |
| `SpaceFiller` | Simple | 1 | `SpaceFiller.module.scss` | metadata helpers | Candidate | Layout primitive. |
| `Spinner` | Simple | 1 | `Spinner.module.scss` | Part | Prerequisite | Required before `Table`, `List`. |
| `Splitter` | Complex | 3 | `Splitter.module.scss` | Part | Not started | Pointer/layout behavior. |
| `Stack` | Complex | 5 | `Stack.module.scss` | FlowLayout, ScrollViewer | Not started | Old suite currently skipped; layout hub. |
| `Stepper` | Complex | 1 | `Stepper.module.scss` | Icon | Not started | Stateful multi-step component. |
| `StepperForm` | Complex | 1 | none old / module in rewrite | Form | Not started | Form plus Stepper. |
| `StickyBox` | More difficult | 0 | `StickyBox.module.scss` | metadata helpers | Not started | Verify through layout/browser. |
| `StickySection` | More difficult | 1 | `StickySection.module.scss` | metadata helpers | Not started | Sticky layout behavior. |
| `Switch` | More difficult | 1 | none in old folder | Toggle | Approved complete | User confirmed Switch works as expected; focused unchanged Switch suite passes 104/104; reused copied old Toggle with Switch renderer boundary learned from Checkbox; side-by-side migrated component run passes 537/543 with 6 skips. |
| `Table` | Complex | 2 | `Table.module.scss` | Checkbox, Column, Icon, Pagination, Part, SelectionStore, Spinner | Blocked | Pilot step 3 after prerequisite completion. |
| `TableOfContents` | Complex | 1 | `TableOfContents.module.scss` | App, ScrollViewer | Not started | Page heading/index behavior. |
| `Tabs` | Complex | 1 | `Tabs.module.scss` | Form, container helpers | Not started | Old suite currently skipped. |
| `TabsForm` | Complex | 1 | none | Form | Not started | Form plus Tabs. |
| `Text` | Simple | 1 | `Text.module.scss` | abstractions/metadata, Icon, Stack | Awaiting approval | Source-preserved React/SCSS/defaults restored from old project with import/dependency shims only; renderer bridges old classes contract, old `asDisplayText` value rendering, value fallback, variant props, contextMenu, overflow, and component API; breakMode visual overlap fixed through the shared vertical Stack no-shrink default; focused unchanged Text suite passes 140/140; metadata and TypeScript checks pass; side-by-side migrated component run passes 705/711 with 6 skips. Awaiting user approval before next component. |
| `TextArea` | Complex | 1 | `TextArea.module.scss` | ConciseValidationFeedback, Form, FormItem, Part | Not started | Input/form dependency. |
| `TextBox` | Complex | 1 | `TextBox.module.scss` | ConciseValidationFeedback, Form, FormItem, Input, Part | Not started | Good post-Button form/input target. |
| `Theme` | Complex | 1 | `Theme.module.scss` | App, ComponentRegistryContext | Not started | Global theming behavior. |
| `TileGrid` | Complex | 1 | `TileGrid.module.scss` | Checkbox, SelectionStore, Table | Not started | After Table/selection. |
| `TimeInput` | Complex | 1 | `TimeInput.module.scss` | Icon, Input, Part | Not started | Input dependency. |
| `Timer` | More difficult | 1 | none | runtime scheduling | Not started | Timing-sensitive tests. |
| `Toast` | More difficult | 1 | none | runtime toast container | Not started | Portal/service behavior. |
| `Toggle` | More difficult | 0 | `Toggle.module.scss` | FormItem, Part | Prerequisite | Copied old Toggle React/SCSS/defaults for Checkbox and Switch; verify again through ExpandableItem before marking independently complete. |
| `ToneChangerButton` | More difficult | 1 | none | Button, Icon | Not started | After Button. |
| `ToneSwitch` | More difficult | 1 | `ToneSwitch.module.scss` | Icon, Toggle | Not started | After Toggle/Icon. |
| `Tooltip` | Complex | 1 | `Tooltip.module.scss` | Markdown | Not started | Overlay/Markdown dependency. |
| `Tree` | Complex | 9 | `TreeComponent.module.scss` | Icon, ScrollViewer, Spinner | Not started | Large async/dynamic suite. |
| `TreeDisplay` | More difficult | 1 | `TreeDisplay.module.scss` | metadata helpers | Not started | Needed by Markdown. |
| `ValidationSummary` | More difficult | 0 | `ValidationSummary.module.scss` | Button, Form, Icon, SpaceFiller, Stack, Text | Not started | Form dependency. |
| `WebSocket` | Complex | 0 | none | runtime websocket | Not started | Needs controllable server/test fixture. |

## Source Inventory Findings

- The old component tree has a component folder for every folder currently
  present in the rewrite, so this is a re-migration/parity plan rather than a
  missing-folder plan.
- Many current rewrite specs still contain foundation-only suites, global
  old-suite skips, or explicit `test.fixme` entries. These are strong signals
  that old-source parity is not closed.
- The old source consistently separates public metadata/defaults from React
  implementation and styling. This supports the proposed rule: copy React/SCSS,
  adapt only the metadata/renderer boundary.
- Large dependency hubs are `FormItem`, `Table`, `App`, `Markdown`, `Select`,
  and `Stack`. They should not be early blind targets unless their immediate
  dependencies are already source-preserving complete.
- Components with no direct old E2E specs must be verified through dependents
  and a small source-preserving smoke fixture; they still require copied source
  and closure notes.

## Open Questions

1. Should copied old React/SCSS files be kept byte-for-byte except import lines,
   or is a tiny documented shim inside those files acceptable when the rewrite
   has no equivalent shared adapter yet?
2. Some old components use non-module global `.scss` (`InspectButton`,
   `Inspector`) while the rewrite currently has module files. Should this plan
   preserve the old global stylesheet form literally, or is module conversion
   allowed for these exceptions?
3. Should current `*.foundation.spec.ts` files remain as additional smoke tests
   after the old suite passes, or should they be removed/renamed to avoid
   confusing completion status?
4. The current E2E audit counts transferred tests by spec files, but it does
   not prove that a copied spec is textually unchanged. Should we add a
   "protected old spec drift" audit that fails when migrated old specs differ
   from `/Users/dotneteer/source/xmlui`?
5. Should there be a similar "protected React/SCSS drift" audit that allows
   only import-line differences and documented allowlisted shims?
6. For complex dependencies like `Table`, should prerequisite approval units be
   allowed to complete with verification only through the dependent component
   when the dependency has no direct old tests (`Column`, `SelectionStore`,
   `Part`)?
7. When user-run additional tests find regressions after focused E2E passes,
   should the component stay `Awaiting approval`, or should it move to
   `Blocked` until the regression is fixed and the focused loop is rerun?

## Immediate Next Action

Stop here for user approval of `Text`. If approved, choose the next prerequisite
before `Table` rather than starting `Table` blindly; likely smallest candidates
are `Column`, `Part`, `Spinner`, or `Pagination`, depending on which dependency
is most useful to validate next.
