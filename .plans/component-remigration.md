# Strict Component Remigration Plan

Status: active plan, reset after rollback
Branch at creation: `dotneteer/component-remigration`
Primary original source: `/Users/dotneteer/source/xmlui/xmlui/src/components`
Rewrite target: `/Users/dotneteer/source/xmlui-rs/xmlui/src/components`

## Why This Plan Exists

The previous component remigration drifted away from the intended strategy. It
patched copied React implementation files and component stylesheets directly,
which made the migrated code hard to compare with the original XMLUI framework.
This plan resets the rules for a stricter, auditable migration.

The old remigration plan was preserved before rollback as a historical record:

- File: `/private/tmp/xmlui-rs-remigration-records/component-remigration-before-rollback-2026-07-02.md`
- SHA-256: `7240e2ec5f75688f3e7bfaaab7b7b54bd8e770f00fa4dbf4927eff4698e3a1a0`

That file is context only. This document is the active migration contract.

## Scope

Migrate XMLUI built-in components from the original framework into this rewrite
while preserving user-visible behavior, DOM shape, styling, theming,
accessibility, routing, data behavior, and documented APIs.

This plan covers component source transfer, migration order, protected-file
rules, verification, and status tracking. It does not cover broad runtime
redesigns except where they are required to host the original components
unchanged.

## Non-Goals

- Do not redesign component DOM structure.
- Do not restyle components by hand.
- Do not simplify original component internals during migration.
- Do not replace original CSS module styles with new inline styles.
- Do not mark a component complete because it merely looks close in one
  screenshot.

## Non-Negotiable Protected-File Rule

For migrated components, the following files are protected:

- all copied React implementation files, such as `*React.tsx`;
- copied helper implementation files in the component folder, such as
  `TabItemReact.tsx`, `StepReact.tsx`, `InputAdornment.tsx`, or equivalent;
- all copied `*.module.scss` files;
- copied non-module SCSS files, such as inspector styles, when they are part of
  the original component implementation;
- copied component metadata/default files, such as `*.defaults.ts`, metadata
  descriptors, and any other files that feed generated component metadata;
- copied component documentation files, especially component-folder `*.md`
  files;
- copied component E2E specs, especially component-folder `*.spec.ts` files.

Allowed protected-file changes:

- import path rewrites needed because the rewrite repository has different
  relative paths or module names;
- export path rewrites that are mechanically equivalent to import rewrites;
- type-only import rewrites;
- CSS module import path rewrites;
- test import/export rewrites needed to point at the rewrite E2E harness.

Forbidden protected-file changes:

- changes to JSX or DOM shape;
- changes to component state logic;
- changes to event behavior;
- changes to class names;
- changes to SCSS declarations, selectors, variables, mixins, or nesting;
- visual fixes in copied `*.module.scss`;
- React-computed inline style replacements for original CSS module behavior;
- component metadata/default value changes;
- component documentation wording or example changes in copied `*.md` files;
- edits to copied E2E test cases, assertions, fixtures, or test names beyond
  import/export rewrites.

If a protected file cannot compile with import-only changes, stop. Implement a
compatibility bridge outside the protected file, or mark the component blocked
and record the missing runtime contract. Do not "fix" the copied implementation.

## Where Adaptation Is Allowed

Compatibility adaptation belongs outside protected component source:

- renderer/adapter files in the rewrite;
- component registration and metadata adapter files that are not copied
  component metadata/default source;
- E2E testing infrastructure, shared helpers, fixtures, and configuration;
- default prop mapping files;
- shared runtime shims;
- theme runtime and generated CSS variable infrastructure;
- router, app context, event, and data-operation services;
- tests and test harness utilities.

Component metadata remains a compatibility artifact. Registration code may be
adapted only to expose the same metadata contract; copied metadata/default
source files must remain unchanged except for import/export path rewrites. If a
metadata mismatch is discovered, fix generation, registration, or host
infrastructure rather than editing copied component metadata.

For components whose original folder has a main `<Component>.tsx` file, keep
component metadata and the rewrite renderer registration in that same
`<Component>.tsx` file. Do not create separate `<Component>.metadata.ts` or
`<Component>.renderer.tsx` sidecar files for newly migrated components. The
copied original metadata block and original-style component renderer export in
`<Component>.tsx` must remain unchanged except for import/export path rewrites;
append rewrite-specific renderer adapter code in the same file below the copied
source.

### Component Registration Pattern

Prefer the original XMLUI registry/provider shape from
`/Users/dotneteer/source/xmlui/xmlui/src/components/ComponentProvider.tsx` when
migrating registration code:

- component folders should export their renderer definitions from the component
  entry file, using the original-style `*ComponentRenderer` export where the
  original has one and a rewrite runtime renderer export from the same file;
- central registration should be a declarative list or table of renderer
  definitions that the registry iterates over, not a growing body of
  per-component conditional code;
- registration should stay separate from migration inventory, source-path
  reporting, runnable-test lists, and compatibility bookkeeping;
- when a component has related aliases or family members, describe that once in
  a small registry entry instead of scattering repeated booleans and nested
  conditionals through `component-core/registry.ts`;
- do not add new `<Component>.metadata.ts` or `<Component>.renderer.tsx`
  sidecars for newly migrated components unless a future plan explicitly
  documents why the original provider-style entry cannot work.

The current `xmlui/src/component-core/registry.ts` still mixes runtime
registration with transfer reporting. Refactor it toward the original pattern in
stages: first keep new component migrations on the provider-style path, then
move transfer inventory/reporting into separate data helpers before attempting a
large registry rewrite.

Registry migration has started. Runtime renderer registration now has a
dedicated provider-style entry module at
`xmlui/src/component-core/runtimeRegistry.ts`, and
`xmlui/src/component-core/index.ts` exports `builtInComponentRenderers` from
that module. Keep `registry.ts` temporarily as the migration inventory/reporting
source until its transfer bookkeeping is moved into smaller audit/data helpers.

Copied component-folder documentation files must be copied intact. If new
rewrite-specific documentation is needed, add a separate note outside the copied
component documentation instead of changing the original `*.md` file.

Copied component-folder E2E specs must preserve the original test cases
literally. Imports, exports, and harness entry points may be rewritten so the
tests run in this repository, and the shared E2E testing infrastructure may be
updated when needed. Additional regression coverage is allowed, but it must live
in a separate `*.spec.ts` file in the same component folder so the copied
original suite remains auditable.

When a visual mismatch appears, first audit whether protected files drifted. If
they did not, fix the surrounding runtime, theme, layout, or adapter contract.

## Required Drift Audit

Every migrated component must pass a protected-file drift audit before it can be
marked complete.

The audit compares the original file and the rewrite file after normalizing only
allowed import/export path differences. Any non-import difference is a failure.

Create a reusable helper before migrating more components:

```text
xmlui/scripts/verify-protected-component-copy.mjs
```

The helper should:

- accept a component name;
- find original and rewrite protected files;
- normalize import/export path lines only;
- fail on any remaining diff;
- print each protected file as `identical`, `import-only`, `missing`, or
  `entry-adapted`, `missing`, or `drifted`;
- exit non-zero for `missing` or `drifted`;
- support a manifest for helper files whose names do not follow `*React.tsx`.

Until the helper exists, use manual comparison and record the result in this
plan.

## Per-Component Workflow

For each component:

1. Read the original component folder, related tests, docs, and any shared
   original dependency.
2. Copy protected files from the original source, including metadata/default
   files, component-folder `*.md` documentation, and component-folder
   `*.spec.ts` E2E tests when present.
3. Rewrite imports only in protected files.
4. Keep each component's metadata and rewrite renderer registration together in
   the main `<Component>.tsx` file. Do not split them into
   `<Component>.metadata.ts` or `<Component>.renderer.tsx`; append rewrite
   adapter code below the copied original source when host adaptation is needed.
5. Register migrated components using the original provider-style pattern: add
   renderer definitions to declarative registry tables/lists where possible,
   and avoid adding new per-component conditionals to central registry code.
6. Implement missing host contracts in adapters, shared runtime, metadata, or
   shims.
7. Port original tests with only import/export or harness-entry changes,
   preserving test cases, assertions, fixtures, and test names literally.
8. Run the protected-file drift audit.
9. Run all copied component-folder E2E tests, any added component-specific E2E
   tests, focused tests, and metadata checks.
10. Compare old and new behavior only after the audit is clean.
11. Ask the user to approve the component before marking it complete.
12. Update both the detailed component table and the summary table.

## Failure Rules

- If the original component depends on a missing shared utility, migrate or shim
  that utility rather than editing the component.
- If a component needs a runtime service that does not exist yet, move the
  component to `Blocked` and add the service to the dependency notes.
- If visual styling differs, do not patch copied SCSS. Fix theme variables,
  generated CSS, layout props, class application, or adapter contracts.
- If metadata differs, do not patch copied metadata/default files. Fix metadata
  generation, registration, or compatibility adapters.
- If copied documentation differs, restore the copied `*.md` file to the
  original contents.
- If copied original E2E test cases need edits beyond import/export or harness
  entry rewrites, stop and fix the E2E infrastructure or host contract instead.
- If a test passes but screenshots differ, the test is insufficient. Add a DOM,
  computed-style, or screenshot assertion that targets the real issue.
- If the plan and source disagree, prefer the original source and update this
  plan with the reason.

## Verification Standards

Use the smallest verification that proves compatibility, then add broader checks
for shared contracts.

Common commands:

```bash
git status --short
rg --files /Users/dotneteer/source/xmlui/xmlui/src/components/<Component>
rg --files xmlui/src/components/<Component>
npm --workspace xmlui run test:e2e -- xmlui/src/components/<Component>/<Component>.spec.ts
npm --prefix xmlui run check:metadata
```

Component migration is not complete until every copied component-folder
`*.spec.ts` file for that component runs successfully in the rewrite. Added
regression specs should be run as well, but they do not replace the copied
original suite. After audit and verification pass, move the component to
`In review` and wait for user approval before marking it `Complete`.

For style-sensitive work, use local dev servers to query DOM and computed styles
in both old and new apps. Record exact measured properties when the issue is
subtle, such as padding, gap, font, line-height, border, outline, and box size.

### Theme Style Emission

Follow the original XMLUI theme pattern: theme variables must be emitted through
generated CSS classes and injected stylesheet rules, not through broad inline
`style` attributes on component DOM nodes. Runtime components may still use
inline styles for layout props or genuinely dynamic values, but component/theme
CSS variables should be carried by generated classes.

The app runtime must provide the implicit root theme for every XMLUI app root,
not only when the root markup component is `<App>`. A document rooted at
`<VStack>`, `<HStack>`, or any other component except `<Component>` must still
receive the same root theme variables. The current rewrite does this by wrapping
the rendered app in `XmluiThemeRoot`, placing a generated root theme class on
`document.documentElement`, and using generated theme classes for component and
scoped `<Theme>` variables.

## Migration Order

1. Safety infrastructure: protected-file verifier, manifest, and test helper
   conventions.
2. Shared primitives: theme variable emission, layout prop mapping, icon
   provider, label behavior, input adornments, app context globals.
3. Low-risk display components: Text, Heading, Badge, Spinner, ProgressBar,
   ContentSeparator, QRCode, Avatar, NoResult.
4. Layout primitives: Stack family, FlowLayout, SpaceFiller, ResponsiveBar,
   ScrollViewer, Splitter.
5. Input foundation: Input helpers, FormItem, ConciseValidationFeedback, Button,
   TextBox, PasswordInput, TextArea, NumberBox, ColorPicker.
6. Navigation and app shell: Link, Pages, Page, Redirect, Bookmark, Logo,
   Footer, AppHeader, NavLink, NavGroup, NavPanel, App.
7. Overlays and menus: Drawer, ModalDialog, Tooltip, DropdownMenu, ContextMenu,
   Menu, ProfileMenu.
8. Structured forms: Form, FormSegment, ValidationSummary, Select, Option,
   Checkbox, RadioGroup, Switch, Slider, DateInput, DatePicker, TimeInput,
   RatingInput, AutoComplete, FileInput, FileUploadDropZone.
9. Data operations: RetryPolicy, APICall, DataSource, EventSource, WebSocket,
   Queue, Lifecycle, ChangeListener, MessageListener, Fallback.
10. Complex data display: Table, Column, Pagination, SelectionStore, Tree,
    TreeDisplay, TileGrid, Items, List.
11. Miscellaneous/runtime helpers: FocusScope, HtmlTags, I18n, Markdown,
    CodeBlock, IFrame, Image, IncludeMarkup, NestedApp, PageMetaTitle, Toast,
    Timer, ToneSwitch, ToneChangerButton, LiveRegion, Inspector.

Data-operation order should be `RetryPolicy` first, then `APICall`, then
`DataSource`, then stream/listener components, then `Fallback`. `Fallback`
depends on the loading/error contract exposed by data operations.

## Status Summary

Previous approvals from the rolled-back branch are not carried forward. A
component can be `Complete` only after the protected-file audit passes on this
branch.

| State | Meaning | Count |
| --- | --- | ---: |
| Not started | No strict migration work has been performed under this plan. | 0 |
| Audit required | Component exists in the rewrite but has not passed the new protected-file audit. | 98 |
| Blocked | Known prerequisite missing before strict migration can finish. | 0 |
| In review | Audit and tests passed; waiting for user approval. | 0 |
| Complete | User approved after audit and verification. | 6 |

The `Audit required` count is a starting estimate from the current rewrite
component inventory. Update it whenever a component changes state.

## Detailed Component Table

States are plan-local. `Audit required` means the folder currently exists in the
rewrite and must be checked against the original before any trust is placed in
it.

| Component / family | Protected source to copy or audit | Key dependencies | State | First verification |
| --- | --- | --- | --- | --- |
| APICall | `APICall.tsx` if original has no React file | app context, RetryPolicy, fetch service | Audit required | behavior tests for load/error/refetch |
| Accordion | `AccordionReact.tsx`, `AccordionItemReact.tsx`, `Accordion.module.scss` | Stack, Icon | Audit required | original Accordion spec plus style audit |
| Animation | `AnimationReact.tsx` | lifecycle timing | Audit required | animation visibility/state tests |
| App | `AppReact.tsx`, `App.module.scss` | router, app shell, theme, globals, locale | Audit required | app layout, nav, route, state specs |
| AppHeader | `AppHeaderReact.tsx`, `AppHeader.module.scss` | Logo, NavPanel context | Audit required | header layout screenshots and DOM measurements |
| AppState | renderer only unless original has protected files | runtime state registry | Audit required | cross-component state sharing tests |
| AutoComplete | `AutoCompleteReact.tsx`, `AutoComplete.module.scss` | Input, Option, popover | Audit required | original suite and keyboard behavior |
| Avatar | `AvatarReact.tsx`, `Avatar.module.scss` | image/icon fallback | Audit required | visual variants and initials |
| Badge | `BadgeReact.tsx`, `Badge.module.scss` | theme variants | Audit required | font, color, size computed styles |
| Bookmark | `Bookmark.module.scss` if original has it | router/hash scroll container | Audit required | hash navigation in page and nested scroll |
| Br | no protected React file expected | renderer text flow | Audit required | line break rendering |
| Button | `Button.tsx`, `ButtonReact.tsx`, `Button.module.scss`, `Button.defaults.ts`, `Button.md`, `Button.spec.ts`, `Button-style.spec.ts`; added `Button.compat.spec.ts` | Icon, event handler, theme, test resources | Complete | User approved after protected-file audit and verification. `node xmlui/scripts/verify-protected-component-copy.mjs Button` passed (`Button.tsx` entry-adapted; copied React/SCSS/defaults/docs/specs identical); `npm --prefix xmlui run check:metadata` passed; `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Button/Button.spec.ts xmlui/src/components/Button/Button-style.spec.ts xmlui/src/components/Button/Button.compat.spec.ts --workers=1` passed 154/160 with 6 original skips. Added compatibility spec asserts original secondary solid hover colors: border `rgb(226, 229, 234)` and background `rgb(140, 151, 169)`. |
| Card | `CardReact.tsx`, `Card.module.scss` | layout props | Audit required | card sections and border styles |
| ChangeListener | original implementation file | reactive state graph | Audit required | change event trigger tests |
| Checkbox | `CheckboxReact.tsx`, `Checkbox.module.scss` | label behavior, form | Audit required | checked/indeterminate/form tests |
| CodeBlock | `CodeBlockReact.tsx`, `CodeBlock.module.scss` | Markdown/highlight if any | Audit required | language and copy behavior |
| ColorPicker | `ColorPickerReact.tsx`, `ColorPicker.module.scss` | label behavior, input | Audit required | label/readOnly/value tests |
| Column | `ColumnReact.tsx` | Table | Audit required | table column integration |
| ConciseValidationFeedback | `ConciseValidationFeedbackReact.tsx`, module SCSS | FormItem | Audit required | error display style |
| ContentSeparator | `ContentSeparatorReact.tsx`, module SCSS | theme | Audit required | orientation and spacing |
| ContextMenu | `ContextMenuReact.tsx`, module SCSS | menu, portal, focus | Audit required | open/close, nested menu |
| DataSource | original implementation file | APICall, cache, data state | Audit required | load, transform, error, refetch |
| DateInput | `DateInputReact.tsx`, module SCSS | Input, date utils | Audit required | parsing, formatting, disabled |
| DatePicker | `DatePickerReact.tsx`, module SCSS | DateInput, popover/calendar | Audit required | calendar and keyboard tests |
| Drawer | `DrawerReact.tsx`, module SCSS | portal, layer stack, focus | Audit required | backdrop, close, position |
| DropdownMenu | `DropdownMenuReact.tsx`, module SCSS | menu, portal, focus | Audit required | menu item and submenu tests |
| EventSource | original implementation file | stream service, data ops | Audit required | open/message/error lifecycle |
| ExpandableItem | `ExpandableItemReact.tsx`, module SCSS | Icon, layout | Audit required | original tests and summary DOM measurements |
| Fallback | `FallbackReact.tsx` | APICall/DataSource loading contract | Audit required | loading/error fallback tests |
| FileInput | `FileInputReact.tsx`, module SCSS | input, form | Audit required | file selection tests |
| FileUploadDropZone | `FileUploadDropZoneReact.tsx`, module SCSS | drag/drop, FileInput | Audit required | drag states and file events |
| FlowLayout | `FlowLayoutReact.tsx`, module SCSS | layout props | Audit required | responsive placement tests |
| FocusScope | `FocusScopeReact.tsx`, module SCSS | focus manager | Audit required | tab trapping and restore |
| Footer | `FooterReact.tsx`, module SCSS | App shell | Audit required | app shell placement |
| Form | `FormReact.tsx`, module SCSS | FormItem, validation, data submit | Audit required | submit/reset/validation |
| FormItem | `FormItemReact.tsx`, module SCSS | label behavior, validation | Audit required | label click, layout modes |
| FormSegment | `FormSegmentReact.tsx`, module SCSS | Form | Audit required | segment layout and validation |
| Fragment | original implementation file | renderer | Audit required | child rendering |
| Heading family | `Heading.tsx`, `HeadingReact.tsx`, `Heading.module.scss`, `Heading.defaults.ts`, `Heading.md`, `H1.md` ... `H6.md`, `Heading.spec.ts`, `HeadingShortcuts.spec.ts` | theme text styles, old app/TOC/context helper shims | Complete | User approved Heading, including `H1` ... `H6`, after protected-file audit and verification. Copied Heading protected files from the original. `Heading.tsx` is entry-adapted with rewrite runtime renderers for `Heading`, `H1`, `H2`, `H3`, `H4`, `H5`, and `H6` appended below the copied source; the generic `Heading` runtime renderer includes `H1` ... `H6` metadata as theme contributors so `level`-specific font variables are emitted for generic headings. Copied docs, SCSS, defaults, React implementation, and copied specs are identical under the verifier. Added host compatibility shims for old `AppContext`, `TableOfContentsContext`, `ComponentDefs`, `RendererDefs`, `resolveAndCleanProps`, `MemoizedItem`, and `dComponent` export; `wrapComponent` now provides the legacy `layoutContext` field expected by copied renderers. `node xmlui/scripts/verify-protected-component-copy.mjs Heading` passed; `npm --prefix xmlui run check:metadata` passed. A targeted TypeScript check for `Heading.tsx`, `HeadingReact.tsx`, and their shims no longer reports the VS Code diagnostics for missing old abstraction modules, missing `layoutContext`, or text nodes without `range`; the remaining standalone diagnostic is only the non-project SCSS module declaration. Before the final font-size contributor fix, `npm --workspace xmlui run test:e2e -- xmlui/src/components/Heading/Heading.spec.ts xmlui/src/components/Heading/HeadingShortcuts.spec.ts --workers=1` passed 135/135. After the fix, live DOM verification on `http://127.0.0.1:5173/` measured generic heading sizes H1-H6 as `24px`, `20px`, `18px`, `16px`, `14px`, and `12px`; E2E rerun was blocked by the comparison server occupying the hard-coded test port `127.0.0.1:5173`. |
| HtmlTags | `HtmlTags.tsx`, module SCSS | renderer | Audit required | native tag output |
| I18n | original implementation file | locale bundle/app context | Audit required | initial locale and runtime switch |
| IFrame | `IFrameReact.tsx`, module SCSS | layout props | Audit required | src/title/sizing tests |
| Icon | `Icon.tsx`, `IconReact.tsx`, `Icon.module.scss`, `Icon.md`, `Icon.spec.ts`, original helper icon TSX files, icon module SCSS files, `Icon/svg/*`, `IconProvider.tsx`, `IconRegistryContext.tsx`, `icons-abstractions.ts` | original icon provider/registry, SVG React transform, theme resource lookup | Complete | User approved after protected-file audit and verification. Original Icon folder, docs, copied spec, SVG assets, registry provider, registry context, and icon-name abstractions copied from the original. `Icon.tsx` is entry-adapted with rewrite runtime renderer appended; copied `IconReact.tsx`, `Icon.module.scss`, `Icon.md`, and `Icon.spec.ts` are identical under verifier. Added host shims for old `ThemeContext`, `useIsomorphicLayoutEffect`, and `toCssVar`; added `svgReactPlugin` so original `*.svg?react` imports work without editing icon helpers. `node xmlui/scripts/verify-protected-component-copy.mjs Icon` passed; `npm --workspace xmlui run test:e2e -- xmlui/src/components/Icon/Icon.spec.ts --workers=1` passed 44/44; `npm --prefix xmlui run check:metadata` passed. |
| Image | `ImageReact.tsx`, module SCSS | resource URLs | Audit required | fit/fallback/loading tests |
| IncludeMarkup | `IncludeMarkupReact.tsx` | markup loader/compiler | Audit required | include loading/error |
| Input helpers | `InputAdornment.tsx`, `InputDivider.tsx`, `InputLabel.tsx`, `PartialInput.tsx`, module SCSS | TextBox, NumberBox, ColorPicker | Audit required | shared label/adornment measurements |
| InspectButton / Inspector | original React files and SCSS | dev tools state | Audit required | inspect mode tests |
| Items | `ItemsReact.tsx` | renderer collection | Audit required | repeated item rendering |
| Lifecycle | original implementation file | renderer lifecycle | Audit required | mount/unmount events |
| Link | `LinkReact.tsx`, module SCSS | router/hash behavior | Audit required | href, navigation, hash |
| List | `ListReact.tsx`, module SCSS | Items, layout | Audit required | item rendering and selection |
| LiveRegion | `LiveRegionReact.tsx`, module SCSS | accessibility | Audit required | aria-live output |
| Logo | `LogoReact.tsx`, module SCSS | AppHeader | Audit required | default/custom logo measurements |
| Markdown | `Markdown.tsx`, `CodeText.tsx`, module SCSS | markdown renderer | Audit required | markdown/code tests |
| Menu family | menu module SCSS and original React helpers | DropdownMenu, NavGroup | Audit required | keyboard/submenu behavior |
| MessageListener | original implementation file | browser messaging | Audit required | message event tests |
| ModalDialog | `ModalDialogReact.tsx`, module SCSS | portal, focus, layer stack | Audit required | open/close/focus/backdrop |
| NavGroup | `NavGroupReact.tsx`, module SCSS | Menu, NavPanel, portal | Audit required | horizontal/vertical nested groups |
| NavLink | `NavLinkReact.tsx`, module SCSS | router, Icon | Audit required | active state and custom children |
| NavPanel | `NavPanelReact.tsx`, module SCSS | App shell, NavGroup/NavLink | Audit required | vertical/horizontal placement |
| NavPanelCollapseButton | `NavPanelCollapseButtonReact.tsx` | NavPanel context | Audit required | collapsed state |
| NestedApp | `NestedAppReact.tsx`, module SCSS | app context nesting | Audit required | nested route/context tests |
| NoResult | `NoResultReact.tsx`, module SCSS | Icon | Audit required | default/custom content |
| NumberBox | `NumberBoxReact.tsx`, module SCSS | Input helpers | Audit required | spin buttons, adornments, padding |
| Option | `OptionReact.tsx` | Select, RadioGroup | Audit required | option registration |
| PageMetaTitle | `PageMetaTitleReact.tsx` | document title | Audit required | title update/restore |
| Pages / Page | renderer and original routing files | router | Audit required | fallback, params, nested pages |
| Pagination | `PaginationReact.tsx`, module SCSS | Button/Icon | Audit required | page navigation and styles |
| Part / Slot | original implementation files | component composition | Audit required | slot/part rendering |
| ProfileMenu | `ProfileMenuReact.tsx`, module SCSS | App shell, menu | Audit required | profile menu visibility |
| ProgressBar | `ProgressBar.tsx`, `ProgressBarReact.tsx`, `ProgressBar.module.scss`, `ProgressBar.defaults.ts`, `ProgressBar.md`, `ProgressBar.spec.ts` | theme variants, single-file metadata/renderer entry | Complete | User approved after protected-file audit and verification. `node xmlui/scripts/verify-protected-component-copy.mjs ProgressBar` passed (`ProgressBar.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical); `npm --prefix xmlui run check:metadata` passed; `npm --workspace xmlui run test:e2e -- xmlui/src/components/ProgressBar/ProgressBar.spec.ts xmlui/src/components/ProgressBar/ProgressBar.compat.spec.ts --workers=1` passed 22/22. |
| QRCode | `QRCodeReact.tsx`, module SCSS | QR library/runtime | Audit required | generated code output |
| Queue | original implementation file | async orchestration | Audit required | queue lifecycle tests |
| RadioGroup | `RadioGroupReact.tsx`, module SCSS | Option, FormItem | Audit required | selection and keyboard |
| RatingInput | `RatingInputReact.tsx`, module SCSS | input/form | Audit required | value and hover tests |
| Redirect | renderer only unless original has protected file | router | Audit required | immediate and conditional redirect |
| ResponsiveBar | `ResponsiveBarReact.tsx`, module SCSS | layout measurement | Audit required | overflow/collapse behavior |
| RetryPolicy | original implementation file | APICall/DataSource | Audit required | retry timing and cancellation |
| ScrollViewer | `ScrollViewerReact.tsx`, module SCSS | layout, Bookmark | Audit required | scroll container behavior |
| Select | `SelectReact.tsx`, module SCSS | Option, popover, Input | Audit required | keyboard, label, clear |
| SelectionStore | `SelectionStoreReact.tsx` | Table/List/Tree | Audit required | shared selection state |
| SkipLink | module SCSS and implementation | accessibility | Audit required | focus/skip behavior |
| Slider | `SliderReact.tsx`, module SCSS | input/form | Audit required | value, range, disabled |
| SpaceFiller | `SpaceFillerReact.tsx`, module SCSS | flex layout | Audit required | flex fill behavior |
| Spinner | `SpinnerReact.tsx`, module SCSS | theme | Audit required | size/color variants |
| Splitter | `SplitterReact.tsx`, module SCSS | layout/star sizing | Audit required | horizontal/vertical resize |
| Stack family | `StackReact.tsx`, `Stack.module.scss`, `Stack.defaults.ts`, `Stack.md`, `HStack.md`, `VStack.md`, `CHStack.md`, `CVStack.md`, `Stack.spec.ts`, `HStack.spec.ts`, `VStack.spec.ts`, `CHStack.spec.ts`, `CVStack.spec.ts` | layout props, star sizing, original ScrollViewer fade/scroll host contract, boolean attribute parsing | Complete | User approved after protected-file audit and verification. Protected-file audit clean: all copied Stack-family protected files are identical to `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack`. Added rewrite Stack renderer adapter plus host shims for original `StackReact` imports, ScrollViewer fade compatibility, Stack child main-axis sizing normalization, FlowLayout transparent `Items` support, and parser normalization for bare boolean attributes such as `wrapContent`. `npm --workspace xmlui run build:metadata` passed. Full copied Stack-family suite `npm --workspace xmlui run test:e2e -- xmlui/src/components/Stack/Stack.spec.ts xmlui/src/components/Stack/HStack.spec.ts xmlui/src/components/Stack/VStack.spec.ts xmlui/src/components/Stack/CHStack.spec.ts xmlui/src/components/Stack/CVStack.spec.ts` passed 89/89. `npm --workspace xmlui run build` still stops on unrelated pre-existing compiler/Button/Icon/IconProvider type errors. |
| Stepper | `StepperReact.tsx`, `StepReact.tsx`, module SCSS | Form, Tabs-like state | Audit required | step navigation |
| StepperForm | `StepperFormReact.tsx`, module SCSS | Form, Stepper | Audit required | multi-step submit |
| StickyBox | `StickyBoxReact.tsx`, module SCSS | scroll containers | Audit required | sticky behavior |
| StickySection | `StickySectionReact.tsx`, module SCSS | scroll containers | Audit required | section stickiness |
| Switch | `SwitchReact.tsx`, module SCSS | FormItem | Audit required | checked/disabled |
| Table / Column | `TableReact.tsx`, module SCSS, `ColumnReact.tsx` | data, selection, pagination | Audit required | original table suite |
| TableOfContents | `TableOfContentsReact.tsx`, module SCSS | headings, Bookmark | Audit required | active section links |
| Tabs | `TabsReact.tsx`, `TabItemReact.tsx`, module SCSS | router optional, layout | Audit required | tab selection and style |
| TabsForm | `TabsFormReact.tsx` | Form, Tabs | Audit required | form sections |
| Text | `Text.tsx`, `TextReact.tsx`, `Text.module.scss`, `Text.defaults.ts`, `Text.md`, `Text.spec.ts` | theme typography, original style helper shims | Complete | User approved after protected-file audit and DOM/computed-style verification against the original dev server. `node xmlui/scripts/verify-protected-component-copy.mjs Text` passed (`Text.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Manual Playwright DOM comparison against `http://localhost:5173/` and `http://127.0.0.1:5173/` for preserve-linebreaks, custom variant, and built-in variant markup returned an empty diff for the built-in variant set after host theme fixes. Text completion required host changes outside protected files: dynamic `useComponentStyle`, original Text font-size generated theme aliases, a guard against self-referential variant theme aliases, root light-theme color alignment, and multiline `value` text normalization for original NBSP indentation behavior. `npm --workspace xmlui run build` still stops on pre-existing/non-Text TypeScript failures in `compileXmluiModule.ts`, `Button.tsx`, icon helper files, and `IconProvider.tsx`. |
| TextArea | `TextAreaReact.tsx`, module SCSS | Input helpers | Audit required | autosize, focus, label |
| TextBox | `TextBoxReact.tsx`, module SCSS | Input helpers | Audit required | label, adornment, padding |
| Theme | renderer/original theme React if present | generated CSS variables | Audit required | no broad inline style emission |
| TileGrid | `TileGridReact.tsx`, module SCSS | FlowLayout/items | Audit required | tile placement |
| TimeInput | `TimeInputReact.tsx`, module SCSS | Input helpers | Audit required | parsing/formatting |
| Timer | original implementation file | scheduling | Audit required | tick/start/stop |
| Toast | original implementation file | app globals, notifications | Audit required | global toast contract |
| Toggle | original implementation file | Switch/Button semantics | Audit required | toggle state |
| ToneChangerButton | renderer/original implementation | theme tone | Audit required | tone change behavior |
| ToneSwitch | module SCSS and implementation | theme tone | Audit required | tone switch behavior |
| Tooltip | `TooltipReact.tsx`, module SCSS | portal, focus/hover | Audit required | open placement and delay |
| Tree | `TreeReact.tsx`, module SCSS | data loading, selection | Audit required | dynamic/static tree suites |
| TreeDisplay | `TreeDisplayReact.tsx`, module SCSS | Tree data display | Audit required | display variants |
| ValidationSummary | `ValidationSummaryReact.tsx`, module SCSS | Form | Audit required | validation list output |
| WebSocket | original implementation file | data/event service | Audit required | connect/message/error lifecycle |

## Data Operation Plan

Data components should be migrated in this order:

1. `RetryPolicy`: establishes retry timing, cancellation, and error semantics.
2. `APICall`: establishes imperative and declarative request behavior.
3. `DataSource`: builds on APICall-like loading state and shared data binding.
4. `EventSource` and `WebSocket`: streaming data and lifecycle behavior.
5. `Queue`, `Lifecycle`, `ChangeListener`, `MessageListener`: orchestration
   and event bridges.
6. `Fallback`: loading/error/content selection once the upstream state contract
   is real.

Do not finish `Fallback` by guessing its data-state contract. It should be
completed only after APICall/DataSource behavior is available.

## Cross-Component Learnings To Preserve

- Label behavior is shared. Fix label spacing, font, and layout in the shared
  label/FormItem/Input infrastructure, not separately in every input component.
- Theme variables should be emitted through generated CSS or scoped theme
  infrastructure. Component visuals should continue to come from CSS classes and
  CSS modules.
- The implicit app theme is a runtime host contract, not an `App` component
  behavior. Non-`App` roots must receive the root theme class too. In the
  rewrite, `XmluiThemeRoot` applies generated root theme CSS to `html`, and
  component/scoped `Theme` variables are emitted as generated stylesheet rules
  plus classes rather than broad inline CSS variable maps.
- Visual tests must assert the measured property that failed. A screenshot alone
  is useful for discovery, but E2E tests should query DOM/computed style for
  padding, gap, font, border, outline, size, and scroll parent when those are
  the compatibility risk.
- If a component looks wrong and its protected files match the original, the
  bug is likely in host contracts: theme values, layout prop translation,
  provider context, portal/layer behavior, router/hash handling, or shared
  input/menu helpers.
- Portals, focus outlines, scroll parents, and star sizing are recurring app
  shell risks. Verify them with DOM queries in old and new local dev servers.

## Current Handoff Notes

- Protected-copy verifier exists at
  `xmlui/scripts/verify-protected-component-copy.mjs`. It currently audits
  copied React files, helper TSX files named in a future manifest,
  `*.module.scss`, non-module SCSS, `*.defaults.ts`, component-folder `*.md`,
  component-folder `*.spec.ts`, and `<Component>.tsx` metadata/renderer source.
- ProgressBar is `Complete`. The user approved it after protected-file audit,
  metadata check, copied E2E tests, and the added compatibility spec passed.
- ProgressBar copied React, SCSS, defaults, docs, and E2E files are
  byte-identical to the original. The main `ProgressBar.tsx` keeps the copied
  original metadata and original-style renderer, with rewrite renderer adapter
  code appended in the same file. Do not recreate `ProgressBar.metadata.ts` or
  `ProgressBar.renderer.tsx`.
- Button is `Complete`. The user approved it after protected-file audit,
  metadata check, copied E2E tests, original style tests, and the added
  compatibility spec passed. Its copied protected files are auditable under the
  verifier; host fixes landed in shared runtime/theme/test/Icon shims rather
  than in copied Button React, SCSS, defaults, docs, or specs.
- Button migration added shared compatibility for test resources, custom icon
  resources, `borderThickness-*` theme variable aliases, hierarchical theme
  variable fallbacks, secondary solid hover default colors, and E2E mouse
  parking away from the top-left origin so hover styles do not leak between
  copied tests.
- Icon is `Complete`. The user approved it after protected-file audit,
  metadata check, and copied E2E tests passed. The original Icon component
  folder, SVG assets, `IconProvider.tsx`, `IconRegistryContext.tsx`, and
  `icons-abstractions.ts` have been migrated from the original project. This
  replaces the earlier temporary `drive` mapping with the original provider
  registry pattern and the full original icon set.
- Icon host adaptation lives outside copied protected implementation files:
  `Icon.tsx` has the rewrite runtime renderer appended below the copied
  original metadata/renderer source; `xmlui/src/runtime/index.tsx` wraps apps
  with `IconProvider` in the original AppWrapper position; legacy shims provide
  `components-core/theming/ThemeContext`, `components-core/utils/hooks`, and
  `parsers/style-parser/StyleParser.toCssVar`; `svgReactPlugin` supports the
  original `*.svg?react` imports across dev, production, standalone, SSG, CLI,
  build-lib, and sample Vite configs.
- Icon verification passed:
  `node xmlui/scripts/verify-protected-component-copy.mjs Icon`,
  `npm --workspace xmlui run test:e2e -- xmlui/src/components/Icon/Icon.spec.ts --workers=1`
  (44/44), and `npm --prefix xmlui run check:metadata`. The E2E fixture now
  resets `document.documentElement.style.fontSize` between shared-page tests;
  this fixed leaked root font-size state from the copied Icon suite without
  editing the copied spec.
- Button's added `Button.compat.spec.ts` now asserts the user-reported
  secondary solid hover colors from the original runtime: border
  `rgb(226, 229, 234)` and background `rgb(140, 151, 169)`. Full Button
  verification passed 154/160 with 6 original skips using
  `XMLUI_REUSE_EXISTING_SERVER=0`; use that environment variable when a manual
  sample Vite server is already occupying `127.0.0.1:5173`.
- AppContext global identifiers are compiler-recognized through
  `xmlui/src/abstractions/AppContextDefs.ts`. Add future app-level global
  functions/properties there and keep compiler checks using
  `isAppContextObjectProperty`; do not add one-off identifier exceptions in
  `scriptSemantics.ts`.
- Registry migration has started, but is intentionally partial:
  `xmlui/src/component-core/runtimeRegistry.ts` owns provider-style runtime
  renderer registration and `component-core/index.ts` exports
  `builtInComponentRenderers` from it. `registry.ts` still owns transfer
  inventory/reporting and can be deleted only after that bookkeeping is split
  into focused audit/data modules.
- After the initial registry extraction, these checks passed:
  `node xmlui/scripts/verify-protected-component-copy.mjs ProgressBar`,
  `npm --prefix xmlui run check:metadata`, and
  `npm --workspace xmlui run test:e2e -- xmlui/src/components/ProgressBar/ProgressBar.spec.ts`
  (21/21). `npm --workspace xmlui run build` still stops at the pre-existing
  `src/compiler/compileXmluiModule.ts(235,31)` `XmluiModuleIr.document` type
  error.
- Theme/style host contract update: `xmlui/src/runtime/rendering/theme.tsx`
  now contains the rewrite's small generated-style registry. `StyleProvider`
  injects generated stylesheet rules, `XmluiThemeRoot` applies the implicit
  root theme class to `html` for any app root, `ThemeScope` uses a generated
  class for scoped theme variables, and `useComponentThemeClass` returns
  generated classes instead of broad inline CSS variable maps. Manual probe of
  the sample `<VStack>` root at `http://127.0.0.1:5173/` showed five rendered
  ProgressBars, a generated `xmlui-css-*` class on `html`, generated style
  tags, and component inline style reduced to layout-only `box-sizing`.
- Scoped `<Theme>` wrappers must stay layout-transparent like the original
  `Theme.module.scss` `.themeWrapper { display: contents; }`. The rewrite now
  emits `display: contents` through the generated `ThemeScope` class so themed
  children remain direct layout participants of parent stacks. Regression
  coverage lives in `xmlui/src/components/Theme/Theme.spec.ts` with the user's
  `HStack` + `Theme width-Button="120px"` button grouping markup; the focused
  Theme E2E file passed 6/6.
- ProgressBar completed-state color regression: the original app resolves
  `$color-success-500` to `rgb(144, 226, 157)` through its transformed default
  success palette, while the browser-native interpretation of the old HSL token
  produced `rgb(59, 204, 82)` in the rewrite. The rewrite success palette in
  `xmlui/src/styling/theme.ts` is now pinned to the original transformed tones,
  and `xmlui/src/components/ProgressBar/ProgressBar.compat.spec.ts` asserts the
  completed default color. Live sample probe of the exact `<VStack>` markup
  reported the last two bars as `rgb(144, 226, 157)`.
- `xmlui/src/vite-plugin/xmluiPlugin.ts` imports `XmluiComponentContract` from
  the leaf `compiler/contracts/types` module so Vite config bundling does not
  eagerly walk built-in component metadata and copied SCSS.

## New Session Bootstrap

A new AI session should start with these steps:

1. Read `AGENTS.md`.
2. Read this plan completely.
3. Confirm the branch and clean worktree:

   ```bash
   git branch --show-current
   git status --short
   ```

4. Confirm the original source checkout exists:

   ```bash
   rg --files /Users/dotneteer/source/xmlui/xmlui/src/components | head
   ```

5. Pick exactly one component or one shared prerequisite from the detailed
   table.
6. Read original files and tests before editing.
7. Copy protected files and rewrite imports only.
8. Run or manually perform the protected-file drift audit.
9. Run focused tests.
10. Update this plan with status and evidence.

The main review question for every migrated component is:

```text
Are all copied React implementation and stylesheet files identical to the
original after import/export path normalization?
```

If the answer is not yes, the component is not migrated.
