# xmlui

## 0.12.27

### Patch Changes

- 2a615fe: fix: add validationWrapper class to ensure proper flex distribution in horizontal Stack
- 3e7c7d5: Fix bindTo used within user-defined components accessed from a Form/FormItem
- 2bd9d49: Add audit-grade observability skeleton (plan #15 Step 0): `components-core/audit/` module with `AuditPolicy`, `RedactionRule`, `SamplingRule`, `RetentionRule`, `SinkConfig`, pass-through `redact`/`sample` stubs, W3C `TraceContext` correlation stubs, and no-op sink factories; `strictAuditLogging` appGlobals key documented; `kind:"audit"` registered in the Inspector trace.
- 2bd9d49: Add build-validation analyzer skeleton (plan #13 Step 0): `components-core/analyzer/` module with `BuildDiagnostic` type, rule registry, walker, and suppression-comment support; `strictBuildValidation` appGlobals key documented; `kind:"build"` registered in the Inspector trace.
- 2bd9d49: Add structured exception model skeleton (plan #07 Step 0): `components-core/errors/` module with `AppError` class, `RetryPolicySpec`/`CircuitBreakerSpec` types, `ErrorDiagnostic` type; `strictErrors` and `errorCorrelationIdHeader` appGlobals keys documented; `kind:"errors"` registered in the Inspector trace.
- 2bd9d49: Add theme-variable namespace prefix registry (plan #02 Step 0): `components-core/themevars/` module with canonical `PackagePrefix` table for all first-party extension packages; `themeNamespacePrefix` field added to the `Extension` interface.
- 2bd9d49: Wave 1 — Accessibility module Phase 1: linter + ComponentMetadata a11y block

  Adds `components-core/accessibility/` with `A11yDiagnostic` type, `A11yCode` union, and `lintComponentDef()` implementing seven Phase 1 rules: `missing-accessible-name`, `icon-only-button-no-label`, `modal-no-title`, `form-input-no-label`, `duplicate-landmark`, `redundant-aria-role`, and `missing-skip-link` (stub). Adds the `a11y` block to `ComponentMetadata` for ARIA role, accessible name prop declarations, and landmark metadata. Documents `"a11y"` XsLog kind in `inspectorUtils.ts` and `strictAccessibility` global in `standalone.ts`. See `dev-docs/plans/05-enforced-accessibility.md`.

- 2bd9d49: Wave 1 — Build-validation analyzer: identifier + expression + cross-binding rules

  Adds Phase 1 analyzer rules (`id-unknown-component`, `id-unknown-prop`, `id-unknown-event`) that validate component tags, attribute names, and event handlers against the component registry and component metadata. Adds Phase 2 expression rules (`expr-dead-conditional`, `expr-handler-no-value`) that detect literal/tautological conditions and bare identifier event handlers. Adds Phase 3 stubs (`id-undefined-component-ref`, `id-undefined-form-ref`) for cross-binding validation. Adds `_utils.ts` with shared helpers (Levenshtein distance, closest-match, walkComponentDef, framework/behavior prop allow-lists). Adds `getComponentNames()` to `ComponentRegistry`. See `dev-docs/plans/13-build-validation-analyzers.md`.

- 2bd9d49: Wave 1 — Exception model Phase 1: AppError integration in signError and ErrorBoundary

  Updates `signError()` in `AppContent.tsx` to accept `Error | AppError | string | unknown` and normalize via `AppError.from()`. Updates `ErrorBoundary.componentDidCatch()` to normalize the caught error through `AppError.from()` and include the `category` field in the trace log. See `dev-docs/plans/07-structured-exception-model.md`.

- 2bd9d49: Wave 1 — Themevars Phase 1: theming-missing-prefix analyzer rule stub

  Registers the `theming-missing-prefix` analyzer rule (stub) for detecting CSS variable references that do not follow the `PackagePrefix_ComponentName-token-name` convention. Full implementation pending `dev-docs/plans/02-themed-css-variable-prefix-convention.md` Step 1.

## 0.12.26

### Patch Changes

- cf45ffa: fix: DatePicker - set line-height to normal for improved layout
- b230d80: fix: vite-xmlui-plugin works without extra config or env vars
- c28814d: feat: add forwarded props for Stepper configuration in StepperForm component
- 67cc308: feat: implement TabsForm component with integrated form functionality and validation handling
- 292c69f: fix: adjust drawer body layout to prevent overlap with close button when no headerTemplate is provided

## 0.12.25

### Patch Changes

- 81e9ef8: fix: xmlui start command encountering blocking error by fetching Main.xmlui even in vite development mode
- a82544d: feat: add isDirty state to FormSegment and enhance Step component with error and completed states

## 0.12.24

### Patch Changes

- cfa46e7: Refactor Button component styles and tests
- ba102d8: fix: vite builds failing to detect they are in vite mode, not in standalone mode, breaking the `xmlui start` and other commands for websites using vite.

## 0.12.23

### Patch Changes

- 7acf59e: Fix: Default Ctrl+F search finds hidden NavLinks in NavPanel
- 826e360: Fix dev-server dep scanner failing on `.xmlui` files. The scanner runs in its own Rolldown pipeline that does not inherit Vite's main `plugins` array, so the xmlui transform never ran and the scan crashed with `[PARSE_ERROR] Unexpected token` / `Unexpected JSX expression` for every `.xmlui` source picked up via `import.meta.glob('/src/**')`. The xmlui plugin is now also registered under `optimizeDeps.rolldownOptions.plugins`, so the scanner can transform XML markup before parsing.
- 7acf59e: NavGroup: hide collapsed children from browser find-in-page (Ctrl+F) and assistive tech by toggling `visibility: hidden` on the collapsed content (with a delayed transition so the collapse animation still plays). Previously, NavLink labels inside a collapsed NavGroup remained discoverable via Ctrl+F because they were only faded out (`opacity: 0`).
- ed53f00: Fix standalone bundle regression where loading `Main.xmlui` without a `config.json` file crashed with "Cannot read properties of undefined (reading 'defaultTheme')". The standalone bootstrap now tolerates a missing config file, restoring the script-tag drop-in pattern (`<script src="xmlui-standalone.umd.js"></script>` + `Main.xmlui`) that worked in 0.12.15.
- 0e3b85f: fix: improve theme fallback logic in ThemeProvider

## 0.12.22

### Patch Changes

- 39b3cda: fix: icon positioning in button component
- b6c5ea0: Handle user-defined component recursion
- 107bd72: Fix root cause of CSS `@layer` order regression: `metadata-helpers.ts` no longer transitively imports a React component (`ItemWithLabel.tsx`) and its SCSS module. The shared `defaultProps` constant was extracted into a new leaf module `ItemWithLabel.defaults.ts` with no React/SCSS dependencies, eliminating the stray per-module CSS chunk that inverted the cascade in production builds.

  Adds `npm run check:metadata-purity` (a build-time guard that fails CI if any `.tsx` or `.module.scss` becomes reachable from `metadata-helpers.ts`) and `npm run check:css-chunks` (a build-output inspector that flags suspicious per-module CSS chunks and missing layer-order declarations in produced `dist/` directories). The existing `cssLayerOrderPlugin` is retained as defence-in-depth.

- 9e9ba66: Fix: reactive variable names cannot start with "$"
- 92cd77d: feat: add Stepper and Step components
- b62b4bd: Fix React warnings visible in the website
- dfef575: Remove the displayWhen behavior
- fa94885: Fix CSS @layer cascade order being inverted under Vite 8 / Rolldown. Per-module CSS chunks (e.g. one containing only `@layer components { ... }`) could be loaded before the main entry CSS, causing the browser to derive a wrong layer order in which `components` ranked lower than `base`. This made the CSS reset (transparent background on `button`) override component styles like `Button` solid-primary background. The xmlui build pipeline now declares the canonical layer order (`reset, base, components, themes, dynamic`) inline at the top of every generated `index.html` and prepends it to every emitted CSS asset, guaranteeing a deterministic cascade regardless of chunk load order.
- 49c058a: Improve goto-definition in the language server: resolve components by their declared `name` attribute (falling back to filename), scope candidates to the same XMLUI project as the requesting document, and position the cursor on the `<Component>` tag name instead of the start of the file.
- 2e6e24b: Display warning with duplicated component IDs
- 562743c: upgrade to vite 8
- e57d50a: Fix subtle issues in the playground
- af81fb8: Preserve form field values across FormItem unmount/remount
- 46d9398: fix: wire FormItem label htmlFor to the underlying input id across all input components
- 3c094f8: fix: enhance FormItem to support nested items with proper label width and spacing
- 21d76fd: Select now supports data-bound options
- 36fd1f3: Stabilize a few flaky E2E tests:
  - `Option.spec.ts › handles boolean values correctly`: select the option directly with an exact accessibility-name match instead of going through the substring-matching `selectLabel` helper.
  - `MessageListener.spec.ts › doesn't disrupt HStack layout gaps`: bump the layout-stabilization poll timeout from 5s to 10s to absorb CI load.
  - `Select.spec.ts › simple Select with groupBy can select options`: scope the post-selection assertion to the first matching `Carrot` element so it is unambiguous when the dropdown is still closing.
  - `datasource-responseHeaders.spec.ts › responseHeaders updated on refetch`: wait for the initial header counter to stabilize before triggering a refetch, then assert the post-refetch counter strictly increases instead of expecting a hard `+1` (React StrictMode and effect re-runs can cause additional intermediate refetches under load).
  - `TooltipContent.spec.ts` (recharts): swallow the occasional `Element is not visible` thrown by `pieSector.hover()` inside a poll loop so the loop can retry, instead of failing the test on the first pre-paint hover.
  - `Pdf.spec.ts`: serve a small local PDF from the test bed instead of fetching `https://www.w3.org/.../table1.pdf`, so the tests no longer depend on external network availability.
- aac0959: Introduce the shared semantic theme tokens `borderColor-outlined`,
  `borderColor-outlined--hover`, `borderColor-outlined--active` and
  `borderColor-outlined--focus` and add a `variant="outlined"` flavour to
  `Select`. An outlined `Button` (with the default `primary` theme color) and a
  `Select` declared with `variant="outlined"` now resolve to the same border
  color, so they always visually match — and overriding `borderColor-outlined`
  in a custom theme updates both at once.

  The outlined variant on form inputs is intentionally narrow: it only rebinds
  the border color (and its hover/focus states); padding, background and
  typography are unchanged. Existing markup is unaffected because `variant` is
  a new opt-in prop and Button's resolved colors are preserved by the new token
  defaults.

- 562743c: Upgrade from Vite 7 to Vite 8 (Rolldown/Oxc). Migrates build config from rollupOptions to rolldownOptions, removes deprecated esbuild transform options, adds moduleType to vite-xmlui-plugin transform output for Rolldown compatibility, and updates server.ws to server.hot API. Bumps @vitejs/plugin-react to v6, vite-plugin-svgr to v5, vite-plugin-lib-inject-css to v2.
- 03a0d43: fix: Checkbox/Switch labelPosition=start/end snug against control

## 0.12.21

### Patch Changes

- 4b7a288: Extend the confirm global function with the actionThemeColor option
- aa3cd6e: Emit XMLUI base styles during SSR so SSG pages render with framework styling before hydration.
- cb88c69: Revert the xmlui islands feature
- b10ff4d: fix: circular module initialization resulting in problems when building the vscode extension

## 0.12.20

### Patch Changes

- 87ae4e9: The XMLUI islands concept is ready for QA
- 5ddb712: refactor: Migrated all monochrome pool icons from mixed icon packs to Lucide — a single, consistent icon set
- b400578: feat: enhance ExpandableItem to respect explicit width and prevent sibling push in flex/grid layouts
- 16bff91: Scripting engine improvements: removed deprecated `::` global scope operator, added configurable sync execution timeout via `appGlobals.syncExecutionTimeout`, implemented `instanceof` operator support.
- 8d59847: Fix VStack not filling available width inside HStack, causing Table star-sized columns to render too narrow

## 0.12.19

### Patch Changes

- 74e7c88: Fix the build issue using multiple vite entry points

## 0.12.18

### Patch Changes

- f502d2b: Fix function dependency tracking in nested containers (Items, List, etc.)

  Script-defined functions used in expressions inside Items/List children were not triggering re-evaluation when the variables they reference changed. This was because child containers created by iteration components replaced the parent's function dependency context instead of merging with it.

- 1039048: Select: Fixed `dropdownHeight` to produce a stable dropdown height regardless of scroll indicator visibility. Added `scrollIndicators` prop (default `true`) to control whether up/down scroll arrows are shown in the dropdown.
- 8689e17: fix: bump "vite-plugin-lib-inject-css" which introduced css errors in case of multiple chunks in the lib

## 0.12.17

### Patch Changes

- 4dc14d0: Add `mockExecute` event to APICall component
- 00457e4: Improve List and Tree performance
- d474652: Fix `$param` being undefined in `<variable>` declarations that are direct children of `ModalDialog`
- f00a826: Fix RadioGroup keyboard navigation: arrow keys now correctly select the next/previous option instead of only moving focus without updating the value.
- 55258df: extened the number of parsing errors which can be displayed before reaching the point where only a single error can be reported without line numbers.
- 983bfe3: Add new theme variables to Table
- 41e4f0a: Fix the itemLabelWidth behavior in Form
- b296689: Extended List `groupBy` property to accept a function in addition to a string. When a function is provided (e.g., `groupBy="{(item) => item.name[0]}"`), it receives each list item and returns the value used for grouping.
- 80ff0fd: Fix HStack default item widths with input controls
- 2ac4c4a: Allow page scrolling while Select's dropdown is open
- e27fef3: Fix Select dropdown blocking page scroll when opened in non-searchable, single-select mode
- 611cc69: Add gap property to Tabs
- b45106d: Support object and array destructuring in reactive `var` declarations. `var {a, b} = expr` and `var [a, b] = expr` are now valid in code-behind scripts and markup script blocks. Destructured declarations are expanded into temporary variables to preserve reactive semantics.
- 9a1d99b: Add "before" and "after" values to labelPosition

## 0.12.16

### Patch Changes

- 3d64a86: Fix portal rendering issues in Drawer and NestedApp
- 07bc66e: All Tree rendering in standalone mode
- d72d007: Fix Table rendering regression
- 312d3fd: Do not animate Switch and Checkbox during the initial rendering
- 329fc83: feat: allow loading external theme files in standalone mode defined in config.defaultTheme
- 03f095c: refactor: remove redundant check for already registered icons in IconProvider
- 672c9d9: APCall deferred execution fixed
- cda9057: Improve Table and TileGrid performance
- c137a85: feat: add sticky button row and max height to ModalDialog and Form components

## 0.12.15

### Patch Changes

- 90f5002: Fix Stack to respect itemWidth when wrapContent is false
- 2623e28: Extend Form with savePendingLabel, and submitFeedbackDelay
- db67849: feat: implement select-all, delete-all functionality in DateInput component
- 28a77d7: Fix Select `dropdownHeight` prop leaking to the trigger element in SimpleSelect mode, causing the trigger to render at the dropdown's height instead of its normal size.
- 0dd6e23: fix: restore Bookmark hash navigation in shadow DOM and vertical-full-header layout
- 460a693: refactor: improve Select component formatting and styling consistency, adding e2e tests
- 7675d1c: fix: simplify inlinePickerMenu styling and add consistent padding
- 9df5f4b: feat: add hover preview for DatePicker range selection
- f74d48f: fix: quoted content in markup no longer has special meaning. `<Stack>"hi"</Stack>`no longer produces the unquoted string _hi_, but rather the quoted string as-is _"hi"_. This can technically break existing code which relied on quoting text that incluced the less-than (<) character. This feature was very hidden, we don't expect users to have markup like that. In case you are affected, use the _&lt;_ entity instead, or wrap the content in a CDATA.
- 5fa348e: Hide the experimental pub/sub behavior
- 370b985: feat: gracefully handle html when fetching files for standalone
- 4ee71c6: fix: preserve `PageMetaTitle` and other Helmet-managed head output during static site generation so generated HTML includes the correct page title and head tags at build time.
- 2623e28: Form's willSubmit will receive the data with noSubmit flag too for validation. The submit event will not.
- 2623e28: Add FormSegment component

## 0.12.14

### Patch Changes

- 60086b1: Fix DataSource name when no id is declared
- e72aee2: Allow setting the toast notification position
- c7933d4: fix: ItemWithLabel falls back to Form's itemLabelPosition from context
- 5d2d8ac: Add striped property to Table
- f90a550: Fix CLI bin path in published package: the `clean-package` replacement now correctly points to `dist/nodejs/bin/index.mjs` (the actual ESM output from tsdown) instead of the incorrect `dist/nodejs/bin/index.js`. This mismatch prevented `npm` from creating the `xmlui` symlink in `.bin` during install.
- f09e2fe: Fix: Variable initializers in user-defined components can now access routing context variables
- 46e4b62: Use `Globals.xs` instead of `Main.xmlui.xs` for global variable and function declarations. `Main.xmlui.xs` declarations are now local to the Main component, consistent with how all other code-behind files work.
- 9adc767: fix: only deep-coppy theme vars when <Theme> needs them. This reduces the number of CSS vars present on a site.
- 40d58ac: fix: select - label position, minWidth
- 084b7dd: Allow user-defined components to use arbitrary theme variables
- 90152c6: Extend headings and Markdown with anchorTemplate
- e554b84: Column width, minWidth, and maxWidth now accept and resolve theme variables, em/rem values
- b7f7152: NavPanel can be synched with the selected content
- 084b7dd: Auto-generate metadata for user-defined (compound) components by statically analyzing their definition tree. This enables proper theme variable optimization — compound component theme vars are now collected into the global `componentThemeVars` set, so `ThemeProvider` resolves hierarchical variables for them correctly.
- 9471ef6: fix: change NestedApp header background color to surface color

## 0.12.13

### Patch Changes

- d19a909: feat: add cancelButtonLabel prop to APICall for confirm dialog
- 61308b2: feat: xmlui-search - spotlight mode, filter by categories, suggested keywords
- c4fc0be: Fix reactive expressions in component properties not updating when they call functions that depend on changed variables
- 4127490: Add pathname global
- f6921ed: fix: responsive table glitch
- ed962d1: Markdown in fenced code block should not replace "@{}"
- 333bce7: Fixed a bug where setting the regex property to a valid regular expression also tested the input if it was empty.
- 4127490: Fix AppHeader theming
- b133970: Fix responsive CSS generation

## 0.12.12

### Patch Changes

- 44546ae: Fix tab-out issue with PasswordInput
- 0a4c214: expose a discoverRoute function which enables detecing the possible static and dynamic routes for an xmlui project
- 6dda27c: Ignore scrollStyle and showScrollerFade on mobile devices
- d65101f: Wire Inspector icon color through theme system so it responds to theme changes
- 82f5ad4: Experiment with persisting unsubmitted Form data
- fffde0d: Move Blog component from xmlui core to xmlui-docs-blocks extension package
- c9871a9: Fix DataSource reactivity through variables
- 7e0dab5: Improve component property name linting with responsive properties and behavior properties
- 894a635: Fix Select regression in Form (versus FormItem type="select")
- 77254bc: Move Carousel to xmlui-website-blocks extension
- 679b397: Upgrade lodash-es from 4.17.21 to 4.17.23 to fix CVE-2025-13465 (moderate severity vulnerability).

## 0.12.11

### Patch Changes

- 3daa045: Fix FormItem theme variable regression
- 93a19dd: Charts moved from xmlui core to the xmlui-recharts extension
- 8a3180d: Fix FormItem type="checkbox" regression
- 1b695f0: fix: JSDOM preventing running xmlui commands when bundled into executable file
- c903b50: List can handle row selection (similarly to Table)

## 0.12.10

### Patch Changes

- 166139f: fix error callback running on previous failed ApiCall after component mounts, as if the current call failed.
- bb6dfd8: Add bootstrap-like column widths
- 83c84c6: Remove RealTimeAdapter component
- d456b4b: Move Backdrop and Breakout to the xmlui-website-blocks extension
- bd49e49: Add experimental local storage persistence

## 0.12.9

### Patch Changes

- 39b3847: Retry patch release

## 0.12.8

### Patch Changes

- f889233: Add `TileGrid` component — a responsive, virtualized tile grid
- 6ccb0e6: Fix Markdown xmlui-pg regression
- 20be424: Fix issues with mobile NavPanel
- 70a091c: Add "spacing" to applyLayoutProperties
- 551775b: fix: Improve styling flexibility and theme handling across components
- 7e5c62f: Implement scroll-snap related layout properties
- 41552d1: Fix responsive width properties (e.g. `width-md`) not working on FlowLayout/HStack-wrap children; eliminate layout flash by using CSS @media rules instead of JS-based sizeIndex detection
- 7d85f4a: Add debounceWaitInMs property to ChangeListener
- fe26c40: Initialize global variables of App before children are initialized
- a9e8c42: DataSource and APICall now return repsonse headers
- 8660487: Make transaction IDs optional to avoid CORS preflight failures with third-party APIs.
- 3211bce: Fix NavGroup trigger alignment
- 2a5d32f: fix: playground - theme handing
- 36e79df: fix: wrapComponent - prevent layout props from being forwarded to native components unless explicitly declared in metadata
- c6aea4f: Upgrade `react-router-dom` from 6.26.2 to 6.30.3 to address CVE-2025-68470 (XSS via Open Redirects in `@remix-run/router`). `axios` was already upgraded to 1.13.5 to address CVE-2026-25639 (DoS via `__proto__` key in `mergeConfig`).
- 2f368e4: Fix dependency regression with global variables
- 9031871: Add "strict" setting so lintSeverity

## 0.12.7

### Patch Changes

- 3139ddc: Implement responsive layout properties
- 92db16f: improve: enhance wrapComponent functionality with metadata merging
- 2693f67: Add `mockData` property to `DataSource` for development and testing
- 420bae7: Add headerUserSelect and cellUserSelect properties to Table
- a72eb6d: Gather a search index into a json file at SSG time, which the client fetches.
- 1b8c544: Fix Table rows occasionally rendering as blank despite valid data by passing `itemSize={rowHeight}` to the virtua Virtualizer component
- be9a99b: Add applyLayoutProperties configuration option
- 12c1131: Fix ContextMenu and ModalDialog theming regressions
- 12c1131: Theme variables optimization ready for review
- 90fd13f: Add dock property to Stack
- 5b4ec41: Remove HoverCard and PositionedContainer
- 9791592: Fix Select regression
- f1aa401: feat: integrate wrapComponent into core components where possible
- 985a7be: Fix theme variable optimization regressions
- 12c1131: Fix portal styling issues with ModalDialog and Search
- 3286eb2: Global variables regression fixes

## 0.12.6

### Patch Changes

- 4a27cd3: fix: Links in tables can't be right-clicked
- 77cde39: Allow sync between Table instance with syncWithVar
- ffc1b30: Made pattern validation such as email, phone and url more lenient: now they accept empty values.
- 66da3b5: Updated search functionality on website and reworked search data transformation. Also added categories for search results.
- 8478033: Add responsive `when-xs`, `when-sm`, `when-md`, `when-lg`, `when-xl`, `when-xxl` attributes
  that control component visibility per breakpoint, following Tailwind's mobile-first (min-width)
  convention. When any responsive `when-*` attribute is defined it becomes the exclusive source of
  truth — the base `when` is only consulted when no responsive attributes are present, preserving
  full backward compatibility.
- 75c96b7: Fixed a bug where pressing enter after entering an input in the Search field on the website did not navigate to the first result.
- ee088cc: fix: ensure header and data cells remain aligned during column resizing in Table component
- 8478033: Add responsive "when" (-xs, -sm, -md, ect.) attributes

## 0.12.5

### Patch Changes

- 88ce91b: Add the 'ssg' subcommand to xmlui
- a8dd927: Add long text related properties to Link
- fd643cb: Remove the EmojiSelector component
- fd643cb: Fix `Actions.navigate` with relative paths (e.g. `'.'`) and query params now correctly stays on the current page instead of redirecting to the `Pages` fallback. The relative pathname is resolved to an absolute path before being passed to the router, because the wrapped navigate introduced in 12.4 for `willNavigate`/`didNavigate` events runs in a higher-level React context that lacked the nested route matches needed for correct relative-path resolution.
- ee167b7: refactor: prevent auto-focus in Sheet component
- 7a4a44f: refactor: update Link component to support noIndicator prop and improve footer layout on the website
- c32edd9: Add StickySection component
- fd643cb: Fix willNavigate and didNavigate regression
- 4aeced8: APICall now does not invalidate queries while navigating away
- 8d9f103: Remove deprecated \_meta.json files and related code. Navigation now uses navSections/ JSON files exclusively.
- 521d5b1: refactor: update layout and styling for navigation, introduce new theme vars for Drawer close button
- c14a331: Fix new operator parsing (priority) issue
- bc0f26b: ExpandableItem whitespace can be fully controlled via theme
- 7c6c270: Add Drawer component

## 0.12.4

### Patch Changes

- 0aaa878: Add experimental IncludeMarkup component
- 7cf02a7: Inline styles on components with the bindTo property applied will not style the label. Also fixed NumberBox adornment location when writing mode is right-to-left.
- 48b7e46: Use the new website project as the target of component document generation

## 0.12.3

### Patch Changes

- ee1124f: Add keyDown and keyUp events to App
- d1ca953: Prevent FileUploadDropZone from reacting to Ctrl+V (disable paste-on-clipboard)
- 138cd95: Fix variables declared in `Main.xmlui.xs` not propagating to child components and not updating after mutation.

  Variables in `Main.xmlui.xs` are now treated as globals (equivalent to `global.*` attributes on `<App>`), making them visible to user-defined child components. Mutations such as `codeBehindCount++` now correctly propagate to all child components.

- 73fa50b: Review the ExpandableItem component
- 138cd95: Fix global variables issue in Main.xmlui.xs
- fe94dbf: Experimenting with pdfjs API (overlays)
- c286f9c: Fix the slight scrollbar issue with Table
- 5039aef: improve: introducing xmlui-docs-blocks extension
- c438472: Fix Tabs color regression (#2840)
- b4ed223: Add proxy change optimization (#2844)
- fc50529: Fix regression with MenuSeparator duplication
- 75e0ef8: Add keyboard actions to Tree (copy/cut/paste/delete) #2853
- c0141e6: Fix Table rowDoubleClick regression

## 0.12.2

### Patch Changes

- 1ffaf6d: Fix bookmark navigation in nested apps (xmlui-pg playground examples)
- 51a7021: Add itemWidth property to Stack and FlowLayout
- c00f264: Change component document generation to the new link format
- 354669a: Remove global variables from compnent files
- 23db092: Fix virtualization issues with List and Table
- 63ef618: Fix shrinking Table selection checkbox
- 3cf2443: feat: improve NavPanel by using NavSection placeholder components for dynamic nav element generation
- 3c9936d: Fix initialPrimarySize issue with Splitter
- 71a1220: fix: handle active heading state in TableOfContents and update indicator visibility
- 8c51a09: Fix <script> + code-behind function declaration regression
- a1d6fde: fix: enhance footer behavior in App component
- a00651d: fix: toc - smoothScrolling
- 47d70ec: APICall allows access to error response details
- c9bea96: Actions.upload now allows field name
- 1ffaf6d: Fix Bookmark scrolling issue with xmlui-pg
- c853a36: Additional component metadata: "excludeBehaviors", "deprecationMessage"
- 01e2f2a: Remove multiple adjacent separators from DropdownMenu and ContextMenu
- a00651d: fix: scroll behavior handling in TableOfContents and AppContent components

## 0.12.1

### Patch Changes

- ef9bc10: Ensure vite dev server restarts when a module changes
- 4e33e2b: Fix Tree collapseNode to mark the node unloaded
- 5978efa: Allow Tree.replaceNode to change the node ID
- 916d0db: Improve inspector trace logging with additional event data
  - Add emitEvent logging to capture component event emissions with arguments
  - Include eventArgs in handler:start trace events for better debugging
  - Use getCurrentTrace() consistently in NavigateAction and ComponentAdapter
  - Add traceId fallback in DataLoader and standalone parser bundle

- 0050784: Global variable handling redesigned
- c9c4ee2: Fix return from try..catch
- 9b6268e: Conservative refactoring of containers and state management
- e506bd3: Removed react-icons as a dependency.

## 0.12.0

### Minor Changes

- 19e04b3: Add inspector logging infrastructure for debugging XMLUI applications
  - New `xsVerbose` app global enables detailed event tracing
  - Logs handler execution, state changes, API calls, and user interactions
  - Trace IDs correlate related events across async boundaries
  - Window properties (`window._xsLogs`, etc.) expose data to external tooling
  - Shared utilities extracted to `inspectorUtils.ts` for consistent logging

### Patch Changes

- d8d3613: - when using `parseAs`, remember the filename(s) and report them in the input box
  - mechanism to access header: getFields
  - display parse errors
  - acceptsFileType should influence the system filepicker
  - drag/drop example

- a79e4f6: improve TableOfContents component
- e4dab71: Fix Fragment visibility regression
- 547e261: Add module import to standalone apps
- a49f1a9: Fix <script> layout issue in App
- b9a0e56: Extend Tree API with replaceNode and replaceChildren
- 3dce31d: Experimenting with publish/subscribe behavior
- e8d6844: Minor Splitter improvements
- 74ac666: Add global variables to xmlui (Globals.xs)
- 79cd8c9: Fix breaking component links (404) in docs
- 7ea3e83: feat: implement navpanelFooter and NavPanelCollapseButton (experimental)
- f13b74f: Fix Windows-specific module resolution issues

## 0.11.34

### Patch Changes

- f4ff5cd: Fix ContextMenu regressions
- 6b1df19: Add icon to SubMenuItem
- be41834: Updated FileUploadDropZone so the default styling is more user friendly.
- 19eb716: Fix onContextMenu issues with Tree
- a1baf19: Fixed issue with markdown links to properly download resource files.
- b9d774f: Experiment with module imports
- a94ec67: Tweaked ExpandableItem styles so the summary button appears interactable.

## 0.11.33

### Patch Changes

- 8be5f66: Add selectAll, cut, copy, paste, and delete actions (with keybindings) to Table
- 7107dd7: fix: labelBehavior - double label issue

## 0.11.32

### Patch Changes

- cda5e22: fix: window.\_\_PUBLIC_PATH prefix applying twice to icon resources, making them not resolve to anything.
- e98efdf: Extend Table with userSelect properties
- 7d66fac: Review the async loading of Tree items
- 9bea8d0: feat: Open up possibility for custom components to receive input behaviors via an API/context
- 6ad3926: Add scrollStyle and showScrollerFade to Tree
- f4842b1: Removed timeout properties from onValidate.
- 1055794: improve: Provide accessible text label for RadioGroup
- a8117ba: Allow the "new" keyword in object literals as property name

## 0.11.31

### Patch Changes

- 796793b: Migrate Table to virtua (from @tanstack/react-virtual)
- 307611c: Experiment with deferred APICall
- c05a6dd: Parse async/await in scripts but raise error when executing
- 00f087d: Allow Column to use layout properties
- 10c1fa5: Parse new operator but raise error when executing
- 78716f4: Experimental generation of context variables
- 33c99cd: Fix <li> issue with Markdown in Firefox
- e11595e: Fix the inconsistent URL encoding between url and queryParams

## 0.11.30

### Patch Changes

- 4e0379f: Add ScrollViewer component
- 498abc1: Document and improve ContextMenu
- 62d88a4: - Columns with bindTo are now sortable by default
  - Use canSort="false" to disable sorting on individual columns
  - Use config.json with { "appGlobals": { "columnCanSortDefault": false } } to revert to the old default

- ded963e: Add QRCode component
- 4e0379f: Add scrollStyle property to Stack, FlowLayout, and NavPanel
- 84acbea: Add ContextMenu component
- 6decfd7: Added completed state theme variable for ProgressBar called "color-indicator-ProgressBar--complete".
- 0f9326f: Added validation timeout handling for input fields. New properties include customValidationsTimeout and customValidationsTimeoutMessage.
- 7a4974d: upgrade @remix-run/react to 2.17.4, migrate imports to react-router-dom
- 2fb95aa: Add contextMenu event to several components
- 05c9fd7: Add scroll fading effect
- bc7addd: Review markdown rendering and theming

## 0.11.29

### Patch Changes

- eead0f5: Add experimental MessageListener component
- 5c9cd56: Fix scroll issues with List virtualization
- 6021e4d: Added itemRequiredIndicator property to Form to control required/optional indicators for FormItems on the form level.
- 1906b59: make goto-definition reach components across the whole opened workspace
- 486588f: Change the indicator in TableOfContents
- 486588f: Add iconAlignment to NavLink and NavGroup
- 486588f: Add new Theme variables to NavLink and NavGroup
- 486588f: Experiment with documentation theme
- 45441eb: Add overflowMode and breakMode to Markdown
- a43b636: Renamed requiredIndicator to requireLabelMode and itemRequiredIndicator to itemRequireLabelMode.
- ee7ad5a: In the Search box, hitting Enter opens the first match when none selected.
- 6c232bf: Added requiredIndicator property to FormItem to customize required/optional indicators next to labels. Options are: "required", "optional", "both". Default is "required".
- beff0fc: Fix alignment issues with Text
- 23c44d5: Fix Column sortable regression
- 99039d4: Fix List visibility issue in Markdown
- 626bede: Removed language-server-web-worker export from package.json

## 0.11.28

### Patch Changes

- 7485959: FileInput: Automate parsing of csv/json.
- 96d510c: Fixed a bug where gaps were still rendered even if there were no labels provided for input fields.
- 13ebd58: Fixed incorrect background color for a number of components: AutoComplete, Form, NoResult, TextBox and other input controls.
- 94f2354: Fixed FlowLayout passing down width incorrectly to its children.
- cf6c6ef: Add openLinkNewTab property to Markdown.
- cf6c6ef: Add Markdown property truncateLinks
- 6c49cd2: Add support for rowspan and colspan attributes in Markdown tables
- 1d9a5e7: Fix star-sizing in App layouts
- 31e53a8: Fix state APICall and DataSource state references

## 0.11.27

### Patch Changes

- bc1090d: Add experimental bookmark behavior
- fd9a901: feat: add context, line-col numbers to script parse errors
- 79701ad: Add "stretch" property to Stack
- bc67363: Add scroll APIs to Stack, Card, and FlowLayout
- ff49047: Variables defined in <script> override variables in component attributes
- 79701ad: Add stretch property to Stack, Splitter, and FlowLayout
- 357946d: Fix vertically-aligned Text with overflowType="ellipsis"
- 0d04660: Fix FlowLayout issue with nested Text using ellipsis
- 539b718: Fix the issues with the List scroll API

## 0.11.26

### Patch Changes

- b736b85: Add verticalAlignment support to FlowLayout
- 9ebc8e5: feat: implement formBindingBehavior
- 01ef62b: Clip pixel artifacts experienced with Text overflowMode
- 5d715a3: Fix issues with empty script tag rendering
- bd035dd: Fix state variables

## 0.11.25

### Patch Changes

- 0abc5a0: Add Add status/progress to APICall
- 42c9bf8: Make valueTemplate of Select available in single-select mode
- bc0f328: fix: building in CONFIG_ONLY mode handles windows paths
- c4ac21c: Fix standalone app component discovery in templates
- 8b5c6e8: Add credentials option to DataSource/APICall

## 0.11.24

### Patch Changes

- ada1e74: Fix the rendering issues with an attributeless Theme component
- 1c230fb: Add "Br" component as an alias to "br"
- 82fcb62: Fix the TableOfContents navigation issue
- 6313178: Fix the wrong Select height with searchable="true"
- 6303921: feat: Pages - remember scroll-state of page
- c55b2c6: Fixed regular Select (non-searchable/multiSelect) not having a wide enough dropdown list if input is sized using percentages.
- 2a5e9f9: fix: building a projcet in configOnly mode no longer throws the error 'glob.glob is not a function'
- ff03158: Experiment with "init" and "cleanup" component events
- 17bc1e4: The <script> tag will hoist declarations and ignores non-declaration statements
- f1e1fd9: Add experimental "init" event to components
- fdca99c: fix: variant styling issue
- 38dd6f0: Add signature and parameter descriptions to component event metadata

## 0.11.23

### Patch Changes

- 7dfb281: Introduce theme-context-relative fontSize theme variables
- 7780fc4: Fix Form submit with nested Forms (ModalDialog)
- 7160bc8: fix: patternInvalidSeverity - phone pattern
- b3b10a2: fix: DatePicker to adjust its font size and spacing to the current font size
- 965e23e: fix: NumberBox startText and endText uses different color than TextBox
- 184b7f8: Implement the ideal text (attributes) typography flow
- 9936586: Form's $data is now available in buttonRowTemplate
- e7914aa: Fixed FormItem not passing the ungroupedHeaderTemplate and groupHeaderTemplate properties to underlying Select.
- 1f436da: Experimental <template> helper tag added
- 36b1352: fix: update disabled text color
- 74a81b4: improve: use the Select component in the Table as the page size selector

## 0.11.22

### Patch Changes

- 154ae26: feat: pagination controls should only appear in a Table as necessary, alwaysShowPagination - explicitly toggles pagination controls visibility
- 865710f: Extend ModalDialog with titleTemplate and title-related theme variables
- b4c1da8: Add grayscale prop to Image and Markdown components. Images can now be displayed in grayscale by setting `grayscale="true"` on either the Image component or the Markdown component (which applies to all images within the markdown content).
- f127399: fix: table pagination design on mobile
- cebc0d3: App component refactored
- 8ad6968: Add app state management with global functions
- fa04809: Add a removeBr property to Markdown

## 0.11.21

### Patch Changes

- 62f10d6: Reworked and standardized disabled input control visuals.
- 10b5305: fix: validationResult's position
- 3a5c730: Matched the structure of the $error context value and the returned object in onError. Updated APICall and Datasource docs to detail changes.
- 304c247: feat: Select - handle option groups in the dropdown list
- 160726e: Added property rowUnselectablePredicate to Table to manage per row selection.
- 7ca51e1: feat: Select - handle ungrouped options, ungroupedHeaderTemplate

## 0.11.20

### Patch Changes

- aaaeb59: Only show sorting indicators in the Table when the user hovers/focuses or orders by a column.
- d5d08fd: Add isDirty() API to Form
- 28317be: fix formItem initialValue with async loaded null field value
- 2097a64: Add getData() API to Form
- 4828156: Add disableInlineStyle property to Theme
- 0481073: refactor: improve Breakout component to handle different layouts
- 4686bfd: refactor: use radix for dropdown menu implementation
- 710e72b: Inline styles can be disabled witht "appGlobals.disableInlineStyle: true" setting

## 0.11.19

### Patch Changes

- c649cd5: fix: portal issue - AutoComplete, DatePicker
- d9d98d3: test: add nested DropdownMenu and Select/AutoComplete component interaction tests
- 60399c6: Fix the showHeadingAnchors issue with numbered markdown headings

## 0.11.18

### Patch Changes

- 0eaa966: consolidate radix dependency versions, fix ModalDialog, Select, DropdownMenu nesting

## 0.11.17

### Patch Changes

- f11267b: fix: dropdownmenu issue in a dialog

## 0.11.16

### Patch Changes

- 212c7ad: Fix StateContainer issue with updateState

## 0.11.15

### Patch Changes

- 8b1f851: Fix inaccurate ResponsiveBar e2e test

## 0.11.14

### Patch Changes

- d4e05af: Review ResponsiveBar and ContentSeparator
- 7276755: The return value of the Form willSubmit event can set the data to submit

## 0.11.13

### Patch Changes

- 225a580: Review NavLink theme varaible defaults
- 5e9bd24: Fix null value handling in TextBox

## 0.11.12

### Patch Changes

- cef5d43: fix: DropdownMenu - portal issue
- a9e3115: Modify behaviors to use extractValue on attached properties
- 72d968e: Fix clearable issue with DateInput (and TimeInput)

## 0.11.11

### Patch Changes

- d32fef2: New themes created: xmlui-docs, xmlui-blog, xmlui-web
- c882b72: The "contextVars" warning with inspect="true" is fixed

## 0.11.10

### Patch Changes

- 741f760: refactor: rename size prop to thickness and add length prop in ContentSeparator

## 0.11.9

### Patch Changes

- 9c42826: Add noIndicator property to NavLink and NavGroup

## 0.11.8

### Patch Changes

- e25ea5b: Add nonSticky property to Footer
- 6f11265: feat: formatter puts ">", "/>" on a newline for long tag.
- 53c383c: Remove the experimental Choose component

## 0.11.7

### Patch Changes

- de17ae1: Add the Choose component to xmlui
- dc3d889: Fix long text handling in markdown and dialogs

## 0.11.6

### Patch Changes

- f9ac95e: Fix the variant behavior. It uses a React component now.
- 097783b: Fixed Table row deselection if multiple row selections are disabled.
- 0bace0a: Add clearable property to Select
- 07b1a3d: Add a new layout, "desktop", to App
- 0bace0a: Add padding theme vars to ContentSeparator
- 0bace0a: Review Select fontSize and minHeight theme variables

## 0.11.5

### Patch Changes

- 10d755e: refactor: xmlui-playground - design update
- b3a4194: Fixed a case where if the data provided to a Table did not have 'id' attributes, the row selection would not work correctly.

## 0.11.4

### Patch Changes

- e384c59: Change validation status signature from having one dash to two dashes to better reflect that they are status modifiers. Ex. -default -> --default, -error -> --error
- f296904: Splitter now responds the visibility changes of its children
- f296904: Temporarily disable the "variant" behavior on Button
- be73336: fix: Select - use extractValue for controlled component value prop

## 0.11.3

### Patch Changes

- 4a311e2: improve: charts - better domain configuration
- f8a75ce: Tiny Splitter updates
- bbc421b: Text strong variant style fixed

## 0.11.2

### Patch Changes

- c1f306f: update package dependencies for tsx usage

## 0.11.1

### Patch Changes

- 7bbbb1d: Add the debounce function to globals

## 0.11.0

### Minor Changes

- 19145d2: xmlui builds with ESM
- 5109dce: Migrate from CommonJs to ESM internally. Lays the groundwork for exporting testing capabilities.

### Patch Changes

- fe503eb: Add enableSubmit to Form
- 06bb966: Fix TableOfContents styling
- e6b5810: fix: playground - app reset
- db94656: improve: bar/line chart spacing
- fe503eb: Queue now passes $queuedItems and $completedItems context variables to its event handlers
- 82ddbe7: Fix codefence first line indent style issue
- 75b701b: Extend form with hideButtonRow and FormItem with noSubmit

## 0.10.26

### Patch Changes

- e1b8d58: Heading now accepts "H1"..."H6", "1"..."6", too. Invalid values fall back to "h1".
- 1ad832c: Remove the showNavPanelIf property from AppHeader (fix NavPanel's "when" usage)

## 0.10.25

### Patch Changes

- e7c503e: refactor: Select - remove radix select
- 5fe3052: Fix the NavGroup click behavior in responsive view
- 5fe3052: Fix the $item access issue within a ModalDialog inside a Column
- 250647b: Fix the APICall becomes non-functional after first error when used with DataSource + Items + $item context issue

## 0.10.24

### Patch Changes

- 3e361c4: The xmlui-pg codefence now accepts emojies
- 3e361c4: Exend the formatDate, formatDateTime, and formatTime functions with optional format strings

## 0.10.23

### Patch Changes

- bf18444: Experiment with the "variant" behavior
- 6d3bb89: Form now has a willSubmit event (it can cancel the submit event)
- 89c69af: Fix the boolean conversion issue with showAnchor in Heading
- 4cfebf0: Fix loading code-behind files in standalone mode
- 145cd68: fix: pointer-events:none when using sibling Dialog

## 0.10.22

### Patch Changes

- 501f60a: The behavior infrastructure now uses ComponentProvider and allows adding custom behaviors
- 1020f1c: Extend Tab with the tabAlignment and accordionView properties

## 0.10.21

### Patch Changes

- 6fd4d62: Add custom Text variant styling

## 0.10.20

### Patch Changes

- 26eac90: fix: Autocomplete handles animations correctly
- f53edff: Add margin-related theme variables to ContentSeparator
- 1840916: Add applyIf property to Theme
- c6be7a3: fix: external animation is now correctly applied to ModalDialogs as well
- 6aaefaf: Added better error text when rendering FormItem outside of a Form.
- 28d2585: refactor: Select and AutoComplete components
- e29a231: The itemLabelWidth value of Form now supports theme variables ($space-\* values).
- 22162c0: AppState now uses a merge operation to set initialValue
- e90232b: fix: itemWithLabel - layout issue

## 0.10.19

### Patch Changes

- facb257: Add checkboxTolerance property to Table
- 6084c14: test: review onFocus, onBlur e2e tests
- e1fa9d7: Renamed the following properties in DatePicker: minValue -> startDate, maxValue -> endDate. Also updated component documentation.

## 0.10.18

### Patch Changes

- 202f2b2: refactor: use labelBehavior instead of ItemWithLabel
- 6650ee8: Add back removed RadioItem
- da98994: Fixed FormItem validation indicators to use a relaxed validation indication strategy.
- 8394663: fix: labelBehavior, input components - styling issue

## 0.10.17

### Patch Changes

- 07dae0b: fix: AccordionItem produces the right error outside of Accordion component

## 0.10.16

### Patch Changes

- 0ba6612: Undust and improve the Tree component
- 7b78052: Fixed Slider ranged version where only the first thumb is interactable.
- 314b429: improve: remove cmdk from autocomple, add keywords prop to option
- a1dea8f: fix: NumberBox initialValue ignores non-convertible string values, minValue and maxValue now applies to typed-in input as well as to increments / decrements with spinner buttons.
- cff754c: refactor: move behavior application earlier in ComponentAdapter render flow

## 0.10.15

### Patch Changes

- 3c8ad14: Add the data property to the Pdf component
- 5502fea: Add the "transform" layout property
- e08f0ba: Add syncWithAppState and initiallySelected properties to Table
- 5502fea: Fix MenuSeparator and SubMenuitem (forwardRef)
- db618b5: fix: NavGroup componenet's iconVertical{Expanded,Collapsed} properties now apply based on it's 'open' state. Only the Expanded one was present before the fix.
- a795b3d: Allow event handlers to use nested action components recursively
- 5851c02: feat: introducing behaviors - tooltip, animation, label

## 0.10.14

### Patch Changes

- 618049b: fix: Modal dialog scrolling issue
- 215a142: Allow image to accept binary data (and use it instead of src)
- 65b52e1: Allow user-defined components in extension packages
- 0cc2178: Fixed Slider input type, label focus, readOnly property, as well as min & max value issues.
- 53d4ed9: Fixed feature to add custom icons for the Carousel prev/next page buttons.

## 0.10.13

### Patch Changes

- 9401ee0: Added short debounce to ColorPicker to make changing color values with slider a bit smoother.
- eb62858: fix: assigning new properties to objects in xmlui script
- eb62858: fix: stricter empty body detection in RestApiProxy
- eb62858: fix: TextArea autofocus
- eb62858: fix: dropdownMenu overflow
- eb62858: fix: ability to use user defined components in triggerTemplate (dropdownMenu)
- eb62858: select: use focus-visible instead of focus for outline
- 243b7fa: fix: modal dialog/toast issue
- eb62858: form: hideButtonRowUntilDirty

## 0.10.12

### Patch Changes

- f12a042: fix: report errors in script tag
- 8731eb8: Avatar does not issue a resource URL warning when "url" is not specified
- eb6454f: refactor: change LineChart/BarChart property names
- 1210852: Fix the layout property usage of ModalDialog

## 0.10.11

### Patch Changes

- 8c76c8d: feat: style the error report colors and spaces in the browser for xmlui syntax errors
- d56c3e5: RadioGroup now correctly handles different types of initialValue property values, applies readOnly property, and places necessary ARIA tags if the required property is set. Clarified component reference description on how RadioGroup and Option handles value types.
- e42d367: Add FancyButton to xmlui-website-blocks
- f539526: feat: BarChart - add tooltip position tracking
- 19ce234: Review Option handling in Select and RadioGroup
- 455b6c0: feat: add animation support to all relevant components via animation and animationOptions props
- e90dc73: feat: add support for 'uses' property
- 819b563: Update fontSize and lineHeight themes and style (may break existing xmlui code)
- b57dfa2: Add the autoDetectTone property to App
- 9dd0f97: Update Checkbox and Switch with click event metadata
- 19ce234: Select accepts null as an option value; it converts a value to a string no longer
- 898346d: Extend Text and Heading APIs with hasOverflow
- 705dd04: Fix RestApiProxy to deliver response status when no error body specified

## 0.10.10

### Patch Changes

- fff80c5: Bump package version

## 0.10.9

### Patch Changes

- 879c09d: Component part handling and testing refactored
- 3ad8514: Added tooltip value display to Slider thumbs. Removed value display from Slider label.
- 0c69245: fix: virtualized list/table in ModalDialog
- 4ad31fc: refactor: rename dataKeys/nameKey to xKeys/yKey and layout to orientation in chart components - BarChart, LineChart
- c99f184: Fix ExpandableItem focus issue
- 5032e4a: Experimenting with HeroSection
- 2394f36: Enhance DateInput and TimeInput

## 0.10.8

### Patch Changes

- a4d62c4: Add experimental Timer component
- 7ed2918: Add the appendBlob function to the ApiInterceptor backend

## 0.10.7

### Patch Changes

- 664ea4f: Fixed BarChart hideTickY property to not remove the Y axis when set to true.
- a739a26: Fixed Checkbox and Switch visual issue. Fixed Line- and BarChart visual glitch in Table.
- bdb54dd: Small fixes for tiny bugs found during MyWorkDrive update
- 81724c6: Fixed BarChart tick labels not appearing.

## 0.10.6

### Patch Changes

- 6464ec8: fix ssr

## 0.10.5

### Patch Changes

- d38351d: fix missing dependency

## 0.10.4

### Patch Changes

- 43fd8c5: small fixes: Avatar, FileUploadDropzone, auto xsrf token handling
- 1df8e5d: Autocomplete: initiallyOpen prop
- 0d5d9d1: Reworked Pagination layout strategy. Provided props to better control layout: pageSizeSelectorPosition, pageInfoPosition, buttonRowPosition. These props are available in Table pagination as well.
- 3def673: DropdownMenu doesn't cooperate with Fragment triggerTemplate
- 428ebea: include themes.scss file in lib dist
- a12ce66: FileUploadDropZone fixes (dropPlaceholder disappeared)

## 0.10.3

### Patch Changes

- 2e512bb: Add solid overflow handling modes to Text
- 46d1d18: Remove the "codefence" Text variant
- 6bc9ed1: feat: support aligning cells in a Table row vertically
- 0b1f983: Add new, compound layout property name parsing
- a2637f3: Text is displayed as inline (you can nest Text into Text)
- eb4d592: Adding the "part" concept to native components

## 0.10.2

### Patch Changes

- ff14e15: fix: LineChart - sizing issue
- 1451a94: feat: make input padding configurable via theme variables

## 0.10.1

### Patch Changes

- 442416b: Refactor visual components to allow tooltip
- a018431: feat: add custom tooltip template support for Bar and Line charts
- 33cb547: Pagination component now handles itemCount being undefined/null. Introduced hasPrevPage and hasNextPage props to toggle button disabled state.
- b5d7537: Enhance the disabledDates property of DatePicker

## 0.10.0

### Minor Changes

- 000a311: Add tooltip behavior to visible components
- eb8b958: Rework inline styling system, prepare for responsive styling

### Patch Changes

- 6d0ce52: Added features to the Pagination component: page size selector dropdown control. Also added the following props: layout orientation and layout order reversal.
- 8c98f33: feat: add theme variable support for LineChart stroke width
- ef86593: feat: add didChange event handler to Tabs component
- da5f4e7: test: create e2e tests for chart components
- 47c7a2d: Integrated the new Pagination component with Table.
- 740f904: Add "activated" event to TabItem
- 5009c52: Add "parts" to component metadata
- 2f5ec32: Remove "from" from the list or reserved script keywords, as no longer used

## 0.9.101

### Patch Changes

- 791b0be: Experimenting with issuing release on larger GitHub machines

## 0.9.100

### Patch Changes

- 2dbf6d2: Added accessibility features, enabled prop and defaultThemeVars to Pagination. Also created E2E test cases for Pagination

## 0.9.99

### Patch Changes

- e5a09fb: Added a separate Pagination component with events and API methods for custom pagination.
- 36360f6: improve: add tickFormatterY to LineChart, create e2e tests

## 0.9.98

### Patch Changes

- ff781f3: new internal react component for integrating into existing react applications (StandaloneComponent)
- 377f0f2: Fix image animation issue in Carousel
- ce0ff76: Added hover & active styles for Slider on thumb. FileInput opens file browser on label focus.
- 208768a: Fixed input adornments not changing color on setting their respective theme variable. Spinbox buttons in NumberBox now have role=spinbutton.

## 0.9.97

### Patch Changes

- f7e8019: Implement simple IFrame APIs

## 0.9.96

### Patch Changes

- 3196156: Add IFrame component (first prototype)
- cfee78a: NumberBox tweaks: fixed missing padding theme var, fixed incorrect label association.
- f51002a: fix: Tabs - descendant button warning
- 3fa52d9: fix: Table sortBy now works as expected

## 0.9.95

### Patch Changes

- af6a7a0: fix: Tabs - fixed the inconsistency in the headerTemplate.
- 69a2a8f: Fix the useEventHaddler hook
- 29c68fe: fix: H1 ... H6 now ignores the level property

## 0.9.94

### Patch Changes

- 1d9365c: feat: Tabs component - use headerTemplate instead of labelTemplate/tabTemplate

## 0.9.93

### Patch Changes

- af17117: feat:add labelTemplate prop to TabItem component
- 44da3d9: The transformation of Checkbox and Switch values (to Booleans) are now documented and tested
- b7a6b9a: Fix formatHumanElapsedTime unit tests, make the local-independent
- bc95844: improve: Select and AutoComplete components
- 52d94a2: Fix the ComponentWrapper childrenAsTemplate issue
- 6629ce5: New end-to-end tests reviewed
- 0254471: Fixed the initialValue issue with TextArea
- 3318cfb: feat: provide context in browser error reports

## 0.9.92

### Patch Changes

- 347cda1: Review component e2e tests

## 0.9.91

### Patch Changes

- 6a7d779: Review Slot implementation

## 0.9.90

### Patch Changes

- 4b57f7e: Remove Spinner tests

## 0.9.89

### Patch Changes

- 2968eb9: fix initialValue handling in selects in forms
- 94f4eb5: safari regexp error workaround for optimized build, revert select inside form fix
- 8364c03: add new TextBox and TextArea test cases

## 0.9.88

### Patch Changes

- b79d7d8: Fix flaky Checkbox e2e tests

## 0.9.87

### Patch Changes

- 33846c2: Fix ios regex failure

## 0.9.86

### Patch Changes

- 48af60d: Temporarily suspend new checkbox e2e tests

## 0.9.85

### Patch Changes

- ee8d6ad: Fix "required" validation issue with "integer" and "number" FormItem
- 9ca7572: Extend the component API metadata with method signature and parameter descriptions
- 6944d2f: Add a scrollIntoView method to Heading
- c0c10e7: Added missing autoFocus feature and aria labels to Checkbox
- cbe1ef2: Use grammar and syntax highlight files straight form the xmlui package, instead of duplicating them in every app.

## 0.9.84

### Patch Changes

- c54abf3: update deps

## 0.9.83

### Patch Changes

- 8e3d6a3: Prevent the xmlui-optimizer to raise error on ShadowRoot
- 8644010: Add a scrollIntoView api to Bookmark

## 0.9.82

### Patch Changes

- 3bc29ae: fix: account for events with components inside them (like APICall) in a way that more syntax highlighters understand. VSCode worked fine, Shiki did not.
- 1101bf5: Fix a React warning in MarkdownNative (headingRef)
- cd8db58: Fixed ModalDialog overlay and fullScreen in nested apps. Now dialogs defined in nested apps stay inside them.
- 13beb58: Fixed ModalDialog context error when dialog is called from ApiCall or components using "confirm" in XMLUI code.
- 79c1d8a: fix: allow the playground to use the same tone as its source

## 0.9.81

### Patch Changes

- 59680b7: Allow configuring the initiallyShowCode flag in ComponentViewer

## 0.9.80

### Patch Changes

- 4598566: NumberBox and FromItem type="number" accepts numeric string as initialValue
- 14e6a7d: feat: add splitView to code inspection
- cf05bd2: Fix non-fatal StandaloneApp.tsx issue

## 0.9.79

### Patch Changes

- ad21a31: enhance treeshaking

## 0.9.78

### Patch Changes

- 94a68f0: Toggle password visibility in PasswordInput
- 94a68f0: Extend markdown to render compound headings with code spans and anchors
- 163a45c: Add ToneSwitch with icon customization
- 7ce528b: fix: BarChart - size management
- c6eb9a8: Fixed scrolling to specific Bookmarks inside nested apps.

## 0.9.77

### Patch Changes

- c867f38: Change split view startup animation

## 0.9.76

### Patch Changes

- aa08a8c: introducing ApiInterceptor->useWorker: true/false
- 15bf622: fix: add escaped \{ to textmate syntax, eliminate double extraction of props in FormItem causing bugs with escaped open curly brace being parsed as start of binding expression.
- 5761868: improve: BarChart - add tick formatter for X and Y axes

## 0.9.75

### Patch Changes

- c876be8: Turn docs deploy to standard routing

## 0.9.74

### Patch Changes

- 0043c5d: NestedApp new prop: withSplashScreen

## 0.9.73

### Patch Changes

- 88bf4f6: extend formatHumanElapsedTime with a short format flag
- fef53db: Allow specifying href targets with the markdown link tag
- 6167648: Fix the useMouseEventHandlers hook
- b2f4483: Fix missing code fence display
- e9040c6: Make the nested app's header smaller

## 0.9.72

### Patch Changes

- 4ab3b8a: add omitH1 to TableOfContents
- ac4a283: remove the AppWithCodeView component
- 38454c9: fix ApiInterceptor race conditions (inside NestedApps)

## 0.9.71

### Patch Changes

- 5774c53: fix ssr issues with Theme components

## 0.9.70

### Patch Changes

- 1da7847: Adjust CodeBlock theme variables for dark tone

## 0.9.69

### Patch Changes

- 9b36621: fix flaky Checkbox tests

## 0.9.68

### Patch Changes

- 9b1f718: change: add back the logo and the buttons to the xmlui-pg split view
- c79ced7: fix ssr hydration warn in AppWithCodeView
- d030ac2: A few theme variable defaults updated
- 21c4fd6: fix: mocked apis should work with multiple NestedApps

## 0.9.67

### Patch Changes

- 51a5b05: Small changes in a few component's metadata representation
- 9048af1: Remove the header logo and buttons from the AppWithCodeViewNative component
- 94f0e66: Accounted for some bad inputs in code fences when highlighting rows & substrings
- 3f0e6b0: fix memoization for tabs, pageInfo

## 0.9.66

### Patch Changes

- eae8145: Fixed Switch indicator positioning
- b6c64de: improve: charts - improved tick rendering
- 459bd3c: improve: Logo - add inline, alt props
- 96be435: feat: CodeBlock - add new themeVariables

## 0.9.65

### Patch Changes

- c17fc0d: fix the NestedAppNative.tsx issue introduced in #1547

## 0.9.64

### Patch Changes

- 5ad3ffc: Refactored the usage of theme variables in RadioGroup
- da3c8bc: Add a "noHeader" option to the xmlui-pg codefence
- 301cb39: Allow YAML (.yml) theme files in standalone apps
- d5d3f4d: Fixed Bar- & LineChart sizing in the Table component

## 0.9.63

### Patch Changes

- b9c0881: Fix: add a workaround to ListNative to avoid issues coming from undefined row values

## 0.9.62

### Patch Changes

- 832f31d: fix: nestedApp fills the available space in AppWithCode component
- 4f9ff06: Fix the build issue with FormSection

## 0.9.61

### Patch Changes

- 4ef5f3f: This version does not contain any real changes; it's just for bumping the version number.

## 0.9.60

### Patch Changes

- f37ed8c: Fine tune AppWithCodeView header
- 736dbc8: improve: AppWithCode - center the XML/UI buttons
- e2a6e1a: Add a popOutUrl="<url>" option to xmlui-pg to allow pop out to a custom playground location

## 0.9.59

### Patch Changes

- 2a07157: Rename Pages property 'defaultRoute' to 'fallbackPath'
- 97b3241: improve: expanding the styles of the components responsible for code display with new theme variables.
- c4abb20: Fixed RadioGroup disabled and validation indicator states. Also fixed an issue where the checked indicator was not aligned to center if the RadioGroup Option was resized in some way.
- f19720c: Added 0 min width to PieChart, Fixed focus error when one checkbox's state change depended on another
- 66c2288: Fixed NavLink indentation in horizontal App layout, if in a nested NavGroup in the NavPanel
- 2d27204: Fixed a number of color & visual state representations of the components: DatePicker, Switch, Select, TextBox, TextArea, NumberBox, AutoComplete

## 0.9.58

### Patch Changes

- dc43275: Fixed Pie- & DonutChart height property.
- f9562b5: make flowLayout auto-responsive behavior a bit smarter
- 1af11af: fix: eliminating the duplication of toast messages
- de570c2: Fixed number of small issues: Colorpicker now gets correct initial value, Options in Select now get correct keys, removed Tabs tabTemplate prop because of a bigger bug.
- 7d255a9: Changed open in new window button tooltip label for all occurrences.
- 69a7a1f: Fixed NavLink label break if overflowing available space.
- 873348c: new form properties: onSuccess, inProgressNotificationMessage, completedNotificationMessage, errorNotificationMessage
- 46bfe72: default style tweaks

## 0.9.57

### Patch Changes

- 93a1e70: fix: NavPanel - use layoutCss

## 0.9.56

### Patch Changes

- 9a3c3b6: feat: xmlui-devtools - start dialog animation from the click, use exit animation as well

## 0.9.55

### Patch Changes

- d507ea8: Add AppWithCodeView component to display code and running app side-by-side

## 0.9.54

### Patch Changes

- 2688a95: Change TreeDisplay theme variable defaults

## 0.9.53

### Patch Changes

- c64fa25: Allow turning on/off heading anchors in appGlobals
- 73c2c21: wip: code inspector buttons - label change, devtools - animation update

## 0.9.52

### Patch Changes

- d079208: The Footer component no provides a themeable gap between its children.
- 2a461d8: feat: NestedApp works with ApiInterceptor
- ad6d81e: fix NestedApp apiUrl overwrite
- f5b9f15: feat: xmlui-devtools - use it in a modal dialog
- 88e4741: fix: Table columns do not allow (and indicate) sorting when bindTo is not set
- 7af4b4e: change default borderColor
- 851ae21: fix table styling
- 7872ed0: Default theme variables changed for App, NestedApp, TableOfContents, and Text
- bf00dce: enhance xmlui parser error tolerance, recovering from unclosed tags
- 38180ce: merge xmlui-charts into core

## 0.9.51

### Patch Changes

- ef7add9: Added theme variable for setting the horizontal alignment of the logo in the NavPanel.
- ba2b5cd: Moved Drawer logo position to left.
- 96273bf: fix: Slider - min/max value validation
- 1a81bcf: fix: Markdown renders inline/block images correclty

## 0.9.50

### Patch Changes

- e6c3b39: standalone usage: explicit codeBehind reference
- 85031c8: Make the "marked" Text variant have lighter background color in dark mode.
- d349036: Tweaked Search dropdown panel styles. Corrected Link component text and decoration hover and active colors

## 0.9.49

### Patch Changes

- 9afd588: fix: XmluiCodeHighlighter - update token colorizing (light/dark tone)
- Updated dependencies [3b5e820]
  - xmlui-charts@0.1.23

## 0.9.48

### Patch Changes

- b5104b0: feat: Icon component now handles the click event
- 30d5c58: feat: Badge supports theme variable names in colormap
- 2e7f51f: change: the canSort property of Column defaults to true
- 4dd6d7f: feat: chart extension included by default
- f7f0571: fix theme component

## 0.9.47

### Patch Changes

- a5bef5d: feat: add "inherit" variant to Text
- ecc52d1: XMLUIExtensions namespace is optional
- 4322e1b: fix: search context scope
- 391927c: feat: add xmlui-tree codefence (displays a tree) to Markdown

## 0.9.46

### Patch Changes

- e20e867: improve: DatePicker - change chevrons, Slider - design updates, change drawer icon's padding
- 1f83bb2: Tables in Markdown scroll horizontally if there's not enough space.
- c433512: Removed close button from TextBox if type="search". Move the Search package from internal, add arrow key selection in search results and add use it in navigation drawer on small screens.
- bc68330: tweak search indexer
- ef3d208: improve: DatePicker - update chevrons

## 0.9.45

### Patch Changes

- de8d63c: Fixed small issues in CodeBlocks: adjusted row highlight length, substring highlight now works with '=' signs, corrected minor vertical positioning of code without syntax highlight, temporarily removed row numbering.
- bd6d1b4: experimental: runtime search indexing
- db5a5f4: fix: Allow APICall as an event handler
- 69b4402: improve: docs - footer logo, FormItem - labelBreak

## 0.9.44

### Patch Changes

- 3eab4a3: improve: design updates - devtools, playground, docs
- 411cd34: fix: inbound links to headers in markdown (anchor scroll slightly off)
- cdf96bb: fix: table inside flowlayout, horizontal scrollbar
- 121c55c: Changed the background color of the `marked` Text variant.
- f1092fe: Added emphasized substring highlights to CodeBlocks. Use it in markdown the following way: ```xmlui !/substr/

## 0.9.43

### Patch Changes

- e2324bb: fix prefetchedContent handling
- cacbf26: improve: AutoComplete - updating the selection logic, improved handling of readOnly and multi states, and removing unused or redundant code, improving tests
- 05c8dfe: test: DatePicker - fix e2e "disabled state prevents interaction"
- 42571db: test: create tests for the AutoComplete component, fix bugs
- 05205c7: Add diagnostics to language server
- 0a3d059: fix initial offset calculation for virtualized table/list

## 0.9.42

### Patch Changes

- 1ab3881: ssr fixes, experimental prefetchedContent
- 3d9729d: test: add tests for the DatePicker component

## 0.9.41

### Patch Changes

- 42416ba: test change for CI #2

## 0.9.40

### Patch Changes

- 34282f0: chage to test CI

## 0.9.39

### Patch Changes

- b79ca46: improve: DatePicker - design update, XmluiCodeHighlighter - use layoutCss
- bbec7a9: Added implicit code highlighter identification by Markdown if one is exposed under the name "codeHighlighter" in the appGlobals in config.
- e67762b: Replaced Admonition emojis with icons

## 0.9.38

### Patch Changes

- d314bad: msw update

## 0.9.37

### Patch Changes

- 1c33896: ssr fixes
- 8d662f3: Added anchor links for headings in markdown. Showing anchors is disabled by default, use the showHeadingAnchors prop on a Markdown component to use it.

## 0.9.36

### Patch Changes

- 6b0f2c1: fix: itemWithLabel fills the available width if no other value is specified

## 0.9.35

### Patch Changes

- ef3cd6e: Reworked NavLink & NavGroup styling: added disabled, hover & active states to button version

## 0.9.34

### Patch Changes

- bae8280: export NestedApp component
- 415aa66: Added color palette colors for CodeBlock, vertical NavPanel now has fixed scrollbar gutter, fixed vertical collapsed icon for NavGroup.

## 0.9.33

### Patch Changes

- dabeb53: Fixed NavPanel background color

## 0.9.32

### Patch Changes

- 4019d82: xmlui-playground, new exports from xmlui
- 450e1ee: feat: add aria-placeholder to Select component

## 0.9.31

### Patch Changes

- ed53215: test release
- ed53215: another testing

## 0.9.30

### Patch Changes

- b0ae113: testing

## 0.9.29

### Patch Changes

- f15c018: another testing
- f15c018: testing

## 0.9.28

### Patch Changes

- 421968b: testing

## 0.9.27

### Patch Changes

- 99bba69: testing

## 0.9.26

### Patch Changes

- bcf162c: testing changesets
