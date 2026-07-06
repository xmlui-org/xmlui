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
| Audit required | Component exists in the rewrite but has not passed the new protected-file audit. | 69 |
| Blocked | Known prerequisite missing before strict migration can finish. | 1 |
| In review | Audit and tests passed; waiting for user approval. | 0 |
| Complete | User approved after audit and verification. | 34 |

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
| App | `AppReact.tsx`, `App.module.scss`; added `App.foundation.spec.ts` | router, app shell, theme, globals, locale | Complete | User approved after protected-file audit, metadata verification, focused E2E coverage, DOM probes, and iterative parity fixes for App layout, AppHeader/NavPanel/Footer/content spacing, narrow-screen drawer behavior, active NavLink state, vertical logo/nav spacing, `loggedInUser`, star sizing, and `messageReceived` from component event handlers. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs App` passed (`App.tsx` entry-adapted; copied React/SCSS/docs/defaults/specs identical). Added runtime adapter below copied entry, plus host shims for Router, HelmetProvider, AppContext, theme hooks, app shell hooks, CSS utilities, and original dependencies. Runtime component adapter now accepts an orientation hint; App declares vertical orientation so `verticalAlignment` resolves to `justify-content` rather than horizontal `align-items`; the runtime App provider reuses an existing React Router context so nested `<App>` markup does not create a second `BrowserRouter`. `npm --prefix xmlui run check:metadata` passed. Focused copied smoke `XMLUI_INCLUDE_INCOMPLETE_COMPAT=1 XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/App/App.spec.ts --grep "renders with basic props" --workers=1` passed 1/1. Follow-up focused regressions passed for `loggedInUser`, App star sizing, Button-posted `messageReceived`, and `XMLUI_E2E_DEV_PORT=5265 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/App/App.foundation.spec.ts --workers=1` passed 2/2 for App `verticalAlignment` axis mapping and nested App router reuse with the ColorPicker API-button sample. |
| AppHeader | `AppHeaderReact.tsx`, `AppHeader.module.scss` | Logo, NavPanel context | Complete | User approved after protected-file audit and verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs AppHeader` passed (`AppHeader.tsx` entry-adapted; `AppHeaderReact.tsx` import-only; copied SCSS/docs/defaults/spec identical). Runtime adapter appended below copied entry and root-attribute bridge added outside copied React implementation. `npm --prefix xmlui run check:metadata` passed. Focused copied smoke `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/AppHeader/AppHeader.spec.ts --grep "renders with basic props" --workers=1` passed 1/1. |
| AppState | `AppState.tsx`, `AppStateReact.tsx`, `AppState.defaults.ts`, `AppState.md`, `AppState.spec.ts` | runtime state registry, framework-level `id`/`ref`/`testId` props, compiled reference API calls, static component-id binding | Complete | User approved after protected-file audit and verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs AppState` passed (`AppState.tsx` entry-adapted; copied React/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Host contract generation now admits framework-level `id`, `ref`, and `testId` outside copied metadata, and the runtime adapter exposes AppState references through `id` or legacy `ref`. Script codegen now allows AppState API method calls (`update`, `appendToList`, `removeFromList`, `listIncludes`) so compiled markup such as `appState.update({ enhancedMode: v })` works. Script scope creation now binds static component `id`/`ref` values as references, preventing child component markup such as `<AppState id="state" />` plus `enabled="{state.value.enhancedMode}"` from compiling `state` as an implicit global. `npm --prefix xmlui run check:metadata` passed. Protected-file audit passed. Full copied suite plus added foundation regression `XMLUI_E2E_DEV_PORT=5227 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/AppState/AppState.spec.ts xmlui/src/components/AppState/AppState.foundation.spec.ts --workers=1` passed 17/17. Focused compiler regression `npx vitest run xmlui/tests/compiler/compileXmluiModule.test.ts --testNamePattern "AppState API|static component ids"` passed 2/2. Sample Vite plugin verification passed by starting `npm run dev` in `sample/` and fetching `/src/Main.xmlui?import`, which compiled the posted `appState.update` sample without the unsupported-method error; a Playwright probe confirmed the `Set enhanced options` button is disabled when unchecked, enabled when checked, and disabled again when unchecked. |
| AutoComplete | `AutoCompleteReact.tsx`, `AutoComplete.module.scss`, `AutoComplete.defaults.ts`, `AutoComplete.md`, `AutoComplete.spec.ts`, `AutoCompleteContext.tsx` | Input, Option, popover, event mutation invalidation | Complete | User approved after protected-file audit and verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs AutoComplete` passed (`AutoComplete.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec/context identical). Runtime adapter appended below copied entry; host fixes stayed outside copied protected files. `npm --prefix xmlui run check:metadata` passed. Focused compiler/runtime coverage passed for `item => newItems.push(item)` compilation and in-place mutation invalidation. Focused AutoComplete E2E `XMLUI_E2E_DEV_PORT=5224 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/AutoComplete/AutoComplete.spec.ts --grep "creates new option" --workers=1` passed 1/1. Manual Playwright probe against the sample confirmed typing `Peter Parker` and pressing Enter renders `New items: Peter Parker`. |
| Avatar | `Avatar.tsx`, `AvatarReact.tsx`, `Avatar.module.scss`, `Avatar.defaults.ts`, `Avatar.md`, `Avatar.spec.ts` | image/icon fallback, border theme precedence | Complete | User approved after protected-file audit, metadata verification, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Avatar` passed (`Avatar.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; runtime and inventory registries import the provider-style entry. Host fixes stayed outside copied React/SCSS: adapter-tail border precedence now prevents generated side longhands from `border-Avatar` from overriding explicit aggregate `borderColor-Avatar` or `borderStyle-Avatar`, while preserving side-specific overrides. `npm --prefix xmlui run check:metadata` passed. Full copied suite passed with `XMLUI_E2E_DEV_PORT=5293 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Avatar/Avatar.spec.ts xmlui/src/components/Badge/Badge.spec.ts xmlui/src/components/Br/Br.spec.ts --workers=1` (125/125 across the batch). |
| Badge | `Badge.tsx`, `BadgeReact.tsx`, `Badge.module.scss`, `Badge.defaults.ts`, `Badge.md`, `Badge.spec.ts` | theme variants | Complete | User approved after protected-file audit, metadata verification, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Badge` passed (`Badge.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; runtime and inventory registries import the provider-style entry. `npm --prefix xmlui run check:metadata` passed. Full copied suite passed in the Avatar/Badge/Br batch: `XMLUI_E2E_DEV_PORT=5293 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Avatar/Avatar.spec.ts xmlui/src/components/Badge/Badge.spec.ts xmlui/src/components/Br/Br.spec.ts --workers=1` (125/125). |
| Bookmark | `Bookmark.tsx`, `BookmarkReact.tsx`, `Bookmark.module.scss`, `Bookmark.defaults.ts`, `Bookmark.md`, `Bookmark.spec.ts`; added `Bookmark.foundation.spec.ts` | router/hash scroll container, Link runtime navigation, App scroll restoration | Complete | User approved after protected-file audit, focused regression coverage, metadata verification, and live DOM probe. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Bookmark` passed (`Bookmark.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Host fixes stayed outside copied Bookmark source: App now scrolls hash targets inside the active App scroll container after navigation/restoration, and Link runtime navigation handles `/#id` hash targets so `scrollWholePage="false"` layouts scroll the content area. Focused regression `XMLUI_E2E_DEV_PORT=5183 XMLUI_REUSE_EXISTING_SERVER=0 npx playwright test src/components/Bookmark/Bookmark.foundation.spec.ts --workers=1` passed 1/1. `npm --workspace xmlui run build:metadata` passed. Live DOM probe against the local sample at `127.0.0.1:5173` confirmed clicking `Jump to green`, `Jump to blue`, and `Jump to red` moved the main content scroller to approximately `840`, `1660`, and `20` respectively, with the expected bookmark in viewport each time. |
| Br | `Br.tsx`, `Br.spec.ts` | renderer text flow, original `PropsTrasform` helper typo shim | Complete | User approved after protected-file audit, metadata verification, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Br` passed (`Br.tsx` entry-adapted; copied spec identical). Runtime adapters for `br` and `Br` appended below copied entry; shared host shims added outside the copied body for the original misspelled `PropsTrasform` import and custom-render `extractResourceUrl` argument. `npm --prefix xmlui run check:metadata` passed. Full copied suite passed in the Avatar/Badge/Br batch: `XMLUI_E2E_DEV_PORT=5293 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Avatar/Avatar.spec.ts xmlui/src/components/Badge/Badge.spec.ts xmlui/src/components/Br/Br.spec.ts --workers=1` (125/125). |
| Button | `Button.tsx`, `ButtonReact.tsx`, `Button.module.scss`, `Button.defaults.ts`, `Button.md`, `Button.spec.ts`, `Button-style.spec.ts`; added `Button.compat.spec.ts` | Icon, event handler, theme, test resources | Complete | User approved after protected-file audit and verification. `node xmlui/scripts/verify-protected-component-copy.mjs Button` passed (`Button.tsx` entry-adapted; copied React/SCSS/defaults/docs/specs identical); `npm --prefix xmlui run check:metadata` passed; `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Button/Button.spec.ts xmlui/src/components/Button/Button-style.spec.ts xmlui/src/components/Button/Button.compat.spec.ts --workers=1` passed 154/160 with 6 original skips. Added compatibility spec asserts original secondary solid hover colors: border `rgb(226, 229, 234)` and background `rgb(140, 151, 169)`. |
| Card | `Card.tsx`, `CardReact.tsx`, `Card.module.scss`, `Card.defaults.ts`, `Card.md`, `Card.spec.ts`; added `Card.foundation.spec.ts` | layout props, Avatar/Link/Part host shims | Complete | User approved after protected-file audit, metadata verification, copied E2E suite, added foundation regression, and live DOM parity check for title/subtitle typography. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Card` passed (`Card.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry and registries now import the provider-style entry renderer; obsolete `Card.renderer.tsx` removed. Host compatibility restored outside copied Card source with `ThemedAvatar`, `ThemedLinkNative`, `capitalizeFirstLetter`, Card child shrink normalization for scrollable fixed-size children, stale foundation selector alignment to original `data-part-id`, and generic Heading theme emission for level-specific title variables used by copied Card internals. Live DOM comparison for `<Card avatarUrl="https://i.pravatar.cc/100" title="Example Title" subtitle="Predefined subtitle" maxWidth="300px">...` matched original title `20px/25px/600` and subtitle `14px/23.8px/400` geometry. `npm --prefix xmlui run check:metadata` passed. Full copied suite `XMLUI_E2E_DEV_PORT=5179 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Card/Card.spec.ts --workers=1` passed 27/27. Added foundation regression `XMLUI_E2E_DEV_PORT=5180 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Card/Card.foundation.spec.ts --workers=1` passed 1/1. Focused Heading sizing check `XMLUI_E2E_DEV_PORT=5179 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Heading/Heading.spec.ts --grep "component supports different heading levels with different font sizes" --workers=1` passed 1/1. |
| ChangeListener | `ChangeListener.tsx`, `ChangeListenerReact.tsx`, `ChangeListener.defaults.ts`, `ChangeListener.md`, `ChangeListener.spec.ts` | reactive state graph, compiled event handlers, debounce/throttle timing | Complete | User approved after protected-file audit, metadata verification, and full copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs ChangeListener` passed (`ChangeListener.tsx` entry-adapted; copied React/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Host behavior preserves `listenTo`, `listenToSources`, changed source payloads, inactive state without watched values, conditional rendering behavior, complex value comparisons, and debounce precedence over throttle. `npm --workspace xmlui run build:metadata` passed. Full copied suite `XMLUI_E2E_DEV_PORT=5184 XMLUI_REUSE_EXISTING_SERVER=0 npx playwright test src/components/ChangeListener/ChangeListener.spec.ts --workers=1` passed 21/21. |
| Checkbox | `Checkbox.tsx`, `Checkbox.md`, `Checkbox.spec.ts`; current runtime temporarily reuses rewrite-native `CheckboxReact.tsx`/`Checkbox.module.scss` until Toggle is remigrated; added `Checkbox.foundation.spec.ts` | Toggle, label behavior, form | Complete | User approved after protected-file audit, metadata verification, live DOM probes, focused copied-suite coverage, and visual foundation regressions. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Checkbox` passed (`Checkbox.tsx` entry-adapted; copied docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Original Checkbox delegates to Toggle, but Toggle is still separately pending remigration; the copied entry uses an import-only bridge to the existing native Checkbox implementation for runtime hosting while preserving the original entry body for audit, and original `Toggle.module.scss` was copied as a prerequisite stylesheet. Host fixes stayed outside the copied Checkbox body: metadata helper shim now includes `dIndeterminate`; label behavior remains responsible for Checkbox labels and now uses the FormItem/ItemWithLabel-style wrapper, original label theme defaults, full-width labeled item layout, default top positioning, and compact before/after placement for explicit inline label positions; the native host narrows Form effect dependencies to avoid registration churn; temporary Checkbox host CSS falls back through the original input border-radius chain, uses `:focus-visible` instead of mouse-click `:focus` for outlines, and pins the checkbox control's local font size so large surrounding label text does not resize the `1em` control geometry. `npm --prefix xmlui run check:metadata` passed. Live sample DOM probe for the indeterminate/grouped checkbox repro on `127.0.0.1:5173` showed label computed styles matching original (`14px`, weight `500`, line height `23.8px`), 16x16 inputs, and the two HStack Checkbox label wrappers sharing the 1248px content width as 616px/616px columns. Focused form/label slice `XMLUI_E2E_DEV_PORT=5230 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Checkbox/Checkbox.spec.ts --grep "requireLabelMode|bindTo syncs|does not duplicate label" --workers=1` passed 10/10. Visual foundation regression last rerun after shared label behavior changes with `XMLUI_E2E_DEV_PORT=5258 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Checkbox/Checkbox.foundation.spec.ts --workers=1` and passed 6/6, including border-radius, focus-visible, surrounding-font-size, and default label-above-input coverage. Full copied suite after the earlier size fix `XMLUI_E2E_DEV_PORT=5239 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Checkbox/Checkbox.spec.ts --workers=1` passed 114/118 with 4 original skips; a later interrupted exploratory copied-suite rerun exposed unrelated labelBreak wrapper parity to revisit with shared label behavior work. |
| CodeBlock | `CodeBlockReact.tsx`, `CodeBlock.module.scss` | Markdown/highlight if any | Audit required | language and copy behavior |
| ColorPicker | `ColorPicker.tsx`, `ColorPickerReact.tsx`, `ColorPicker.module.scss`, `ColorPicker.defaults.ts`, `ColorPicker.md`, `ColorPicker.spec.ts` | label behavior, input, form binding, shared Input theme aliases | Complete | User approved after protected-file audit, metadata verification, copied E2E suite, and DOM parity probes. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs ColorPicker` passed (`ColorPicker.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry and registries now import the provider-style entry renderer; obsolete `ColorPicker.renderer.tsx` removed. Host fixes stayed outside copied ColorPicker source: shared label behavior now supplies generated `htmlFor`/input ids and left-aligns ColorPicker labels without shrinking unless explicit width is authored; ColorPicker validation wrappers use `display: contents` so validated color inputs do not gain inline-baseline line-box height; ColorPicker runtime adapter adds form/value/API wiring, percentage-width normalization, and direct Input-compatible theme defaults; `dValidationStatus` accepts original default values; FormItem color controls use the copied `ColorPicker` export. Local old/new DOM probe against original `localhost:5311` and rewrite `127.0.0.1:5312` matched the sample `<ColorPicker id="colorPicker" label="Select your favorite color" />` for input x/y/size (`31, 51.797, 48x24`), border (`1px solid rgb(199, 214, 225)`), radius (`4px`), transparent background, and label x/y/size (`31, 20, 165.344x23.797`). Follow-up old/new DOM probe for the three validation-status example matched group gap (`20px`) and input gaps (`51.796875px`) after removing the validation wrapper baseline contribution. `npm --prefix xmlui run check:metadata` passed. Full copied suite `XMLUI_E2E_DEV_PORT=5264 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/ColorPicker/ColorPicker.spec.ts --workers=1` passed 70/70. `npm --prefix xmlui run build` still fails on unrelated branch-wide TypeScript errors; a filtered rerun found no remaining ColorPicker/FormItem ColorPicker diagnostics before the visual follow-up. |
| Column | `ColumnReact.tsx` | Table | Audit required | table column integration |
| ConciseValidationFeedback | `ConciseValidationFeedbackReact.tsx`, module SCSS | FormItem | Audit required | error display style |
| ContentSeparator | `ContentSeparator.tsx`, `ContentSeparatorReact.tsx`, `ContentSeparator.module.scss`, `ContentSeparator.defaults.ts`, `ContentSeparator.md`, `ContentSeparator.spec.ts`, `test-padding.xmlui`; added `ContentSeparator.compat.spec.ts` | theme | Complete | User approved after protected-file audit, metadata verification, copied E2E suite, live DOM parity check, and focused regression. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs ContentSeparator` passed (`ContentSeparator.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Follow-up parity fix stayed outside copied React/SCSS: the runtime adapter strips the accidental flex-container style caused by treating the semantic `orientation` prop as layout orientation and pins separator roots to `flex-shrink: 0`, matching the original wrapper behavior. Live DOM probe against old `http://localhost:5173` and rewrite `http://127.0.0.1:5173` for the reported sample measured the vertical separator at `10px` width, `120px` height, `display: block`, and `flex-shrink: 0` on both sides. `npm --prefix xmlui run check:metadata` passed. Full copied suite `XMLUI_E2E_DEV_PORT=5328 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts --workers=1` passed 37/37. Added regression `XMLUI_E2E_DEV_PORT=5329 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/ContentSeparator/ContentSeparator.compat.spec.ts --workers=1` passed 1/1. Full build still fails on unrelated branch-wide TypeScript errors; a filtered build diagnostic grep found no ContentSeparator, Fragment, Logo, Image entry, runtimeRegistry, or registry diagnostics. |
| ContextMenu | `ContextMenuReact.tsx`, module SCSS | menu, portal, focus | Audit required | open/close, nested menu |
| DataSource | original implementation file | APICall, cache, data state | Audit required | load, transform, error, refetch |
| DateInput | `DateInputReact.tsx`, module SCSS; added `DateInput.compat.spec.ts` | Input, date utils | Complete | User approved after protected-file audit, metadata verification, focused copied-suite checks, compatibility regressions, and DOM parity probes. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs DateInput` passed (`DateInput.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Follow-up fixes restored original-style border, padding, disabled surface colors, placeholder color, validation border colors, clear button height, and `clearToInitialValue="false"` controlled-clear behavior while keeping copied React/SCSS protected. Verification passed: `npm --prefix xmlui run check:metadata`; `XMLUI_E2E_DEV_PORT=5286 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/DateInput/DateInput.compat.spec.ts --workers=1` passed 4/4. |
| DatePicker | `DatePickerReact.tsx`, module SCSS; added `DatePicker.compat.spec.ts` | DateInput, popover/calendar | Complete | User approved after protected-file audit, metadata verification, copied E2E suite, compatibility regressions, and DOM parity probes. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs DatePicker` passed (`DatePicker.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below the copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Added original Ark UI dependency `@ark-ui/react@5.36.2`, restored `useMediaQuery` in the shared hooks shim, bridged runtime root attributes/test ids/state onto the copied root, supplied standalone DatePicker theme defaults, wired direct `bindTo`/Form registration/value API/validation feedback, preserved copied range default month behavior by not forcing `numOfMonths`, normalized the quoted custom preset array expression expected by the copied suite, fixed the adapter's disabled border/text aliases to point at the original-style global disabled tokens, mapped the disabled DatePicker background alias to the emitted root background token used by the original runtime, and pinned DatePicker validation-border aliases to the original emitted colors. Local DOM probes matched original disabled input colors (background `rgb(248, 250, 251)`, border `rgb(199, 214, 225)`, text `rgb(96, 140, 170)`) and validation borders for none/valid/warning/error (`rgb(199, 214, 225)`, `rgb(86, 211, 106)`, `rgb(218, 127, 0)`, `rgb(245, 0, 16)`). Verification passed: `npm --prefix xmlui run check:metadata`; `XMLUI_E2E_DEV_PORT=5321 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/DatePicker/DatePicker.compat.spec.ts --workers=1` passed 2/2; `XMLUI_E2E_DEV_PORT=5322 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/DatePicker/DatePicker.spec.ts --workers=1` passed 97/100 with 3 original skips. A DatePicker-filtered `tsc` grep still reports strictness diagnostics inside copied protected `DatePickerReact.tsx`; left untouched per protected-file rule. |
| Drawer | `DrawerReact.tsx`, module SCSS | portal, layer stack, focus | Audit required | backdrop, close, position |
| DropdownMenu | `DropdownMenuReact.tsx`, module SCSS | menu, portal, focus | Audit required | menu item and submenu tests |
| EventSource | original implementation file | stream service, data ops | Audit required | open/message/error lifecycle |
| ExpandableItem | `ExpandableItemReact.tsx`, module SCSS | Icon, layout | Audit required | original tests and summary DOM measurements |
| Fallback | `FallbackReact.tsx` | APICall/DataSource loading contract | Audit required | loading/error fallback tests |
| FileInput | `FileInputReact.tsx`, module SCSS; added `FileInput.compat.spec.ts` and `FileInput.compat.module.scss` | input, form | Complete | User approved after protected-file audit, metadata verification, focused smoke/CSV parsing checks, and Browse button polish. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs FileInput` passed (`FileInput.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Vite aliases preserve copied imports for `attr-accept` and `papaparse` default-export compatibility. The Browse button intentionally improves on an original visual issue by hiding an empty default icon slot in the runtime adapter path, centering the label without modifying copied source. Verification passed: `npm --prefix xmlui run check:metadata`; `XMLUI_E2E_DEV_PORT=5287 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/FileInput/FileInput.compat.spec.ts --workers=1` passed 1/1. |
| FileUploadDropZone | `FileUploadDropZoneReact.tsx`, module SCSS | drag/drop, FileInput | Audit required | drag states and file events |
| FlowLayout | `FlowLayoutReact.tsx`, module SCSS | layout props | Audit required | responsive placement tests |
| FocusScope | `FocusScopeReact.tsx`, module SCSS | focus manager | Audit required | tab trapping and restore |
| Footer | `FooterReact.tsx`, module SCSS | App shell | Complete | User approved after protected-file audit and verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Footer` passed (`Footer.tsx` entry-adapted; copied React/SCSS/docs/defaults/spec identical). Runtime adapter appended below copied entry. `npm --prefix xmlui run check:metadata` passed. |
| Form | `FormReact.tsx`, module SCSS | FormItem, validation, data submit | Audit required | submit/reset/validation |
| FormItem | `FormItemReact.tsx`, module SCSS | label behavior, validation | Audit required | label click, layout modes |
| FormSegment | `FormSegmentReact.tsx`, module SCSS | Form | Audit required | segment layout and validation |
| Fragment | `Fragment.tsx`, `Fragment.spec.ts` | renderer | Complete | User approved after protected-file audit, metadata verification, and copied E2E suite. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Fragment` passed (`Fragment.tsx` entry-adapted; copied spec identical). Runtime adapter appended below copied entry and preserves child rendering without adding a DOM wrapper. `npm --prefix xmlui run check:metadata` passed. Full copied suite `npm --workspace xmlui run test:e2e -- xmlui/src/components/Fragment/Fragment.spec.ts --workers=1` passed 2/2. Full build still fails on unrelated branch-wide TypeScript errors; a filtered build diagnostic grep found no ContentSeparator, Fragment, Logo, Image entry, runtimeRegistry, or registry diagnostics. |
| Heading family | `Heading.tsx`, `HeadingReact.tsx`, `Heading.module.scss`, `Heading.defaults.ts`, `Heading.md`, `H1.md` ... `H6.md`, `Heading.spec.ts`, `HeadingShortcuts.spec.ts` | theme text styles, old app/TOC/context helper shims | Complete | User approved Heading, including `H1` ... `H6`, after protected-file audit and verification. Copied Heading protected files from the original. `Heading.tsx` is entry-adapted with rewrite runtime renderers for `Heading`, `H1`, `H2`, `H3`, `H4`, `H5`, and `H6` appended below the copied source; the generic `Heading` runtime renderer includes `H1` ... `H6` metadata as theme contributors so `level`-specific font variables are emitted for generic headings. Copied docs, SCSS, defaults, React implementation, and copied specs are identical under the verifier. Added host compatibility shims for old `AppContext`, `TableOfContentsContext`, `ComponentDefs`, `RendererDefs`, `resolveAndCleanProps`, `MemoizedItem`, and `dComponent` export; `wrapComponent` now provides the legacy `layoutContext` field expected by copied renderers. `node xmlui/scripts/verify-protected-component-copy.mjs Heading` passed; `npm --prefix xmlui run check:metadata` passed. A targeted TypeScript check for `Heading.tsx`, `HeadingReact.tsx`, and their shims no longer reports the VS Code diagnostics for missing old abstraction modules, missing `layoutContext`, or text nodes without `range`; the remaining standalone diagnostic is only the non-project SCSS module declaration. Before the final font-size contributor fix, `npm --workspace xmlui run test:e2e -- xmlui/src/components/Heading/Heading.spec.ts xmlui/src/components/Heading/HeadingShortcuts.spec.ts --workers=1` passed 135/135. After the fix, live DOM verification on `http://127.0.0.1:5173/` measured generic heading sizes H1-H6 as `24px`, `20px`, `18px`, `16px`, `14px`, and `12px`; E2E rerun was blocked by the comparison server occupying the hard-coded test port `127.0.0.1:5173`. |
| HtmlTags | `HtmlTags.tsx`, module SCSS | renderer | Audit required | native tag output |
| I18n | original implementation file | locale bundle/app context | Audit required | initial locale and runtime switch |
| IFrame | `IFrameReact.tsx`, module SCSS | layout props | Audit required | src/title/sizing tests |
| Icon | `Icon.tsx`, `IconReact.tsx`, `Icon.module.scss`, `Icon.md`, `Icon.spec.ts`, original helper icon TSX files, icon module SCSS files, `Icon/svg/*`, `IconProvider.tsx`, `IconRegistryContext.tsx`, `icons-abstractions.ts` | original icon provider/registry, SVG React transform, theme resource lookup | Complete | User approved after protected-file audit and verification. Original Icon folder, docs, copied spec, SVG assets, registry provider, registry context, and icon-name abstractions copied from the original. `Icon.tsx` is entry-adapted with rewrite runtime renderer appended; copied `IconReact.tsx`, `Icon.module.scss`, `Icon.md`, and `Icon.spec.ts` are identical under verifier. Added host shims for old `ThemeContext`, `useIsomorphicLayoutEffect`, and `toCssVar`; added `svgReactPlugin` so original `*.svg?react` imports work without editing icon helpers. `node xmlui/scripts/verify-protected-component-copy.mjs Icon` passed; `npm --workspace xmlui run test:e2e -- xmlui/src/components/Icon/Icon.spec.ts --workers=1` passed 44/44; `npm --prefix xmlui run check:metadata` passed. |
| Image | `ImageReact.tsx`, module SCSS | resource URLs | Audit required | fit/fallback/loading tests |
| IncludeMarkup | `IncludeMarkupReact.tsx` | markup loader/compiler | Audit required | include loading/error |
| Input helpers | `InputAdornment.tsx`, `InputDivider.tsx`, `InputLabel.tsx`, `PartialInput.tsx`, module SCSS | TextBox, NumberBox, ColorPicker | Complete | User approved after protected-helper audit and metadata verification. Helper modules were copied as shared prerequisites for the input-family remigration. `node xmlui/scripts/verify-protected-component-copy.mjs Input` passed for copied SCSS modules (`InputAdornment.module.scss`, `InputDivider.module.scss`, `InputLabel.module.scss`, `PartialInput.module.scss` identical). `npm --prefix xmlui run check:metadata` passed. Runtime consumers including TextBox, DateInput, FileInput, RadioGroup, NumberBox, and TextArea carry the component-specific parity evidence in their rows and follow-up notes. |
| InspectButton / Inspector | original React files and SCSS | dev tools state | Audit required | inspect mode tests |
| Items | `ItemsReact.tsx` | renderer collection | Audit required | repeated item rendering |
| Lifecycle | original implementation file | renderer lifecycle | Audit required | mount/unmount events |
| Link | `LinkReact.tsx`, module SCSS | router/hash behavior | Audit required | href, navigation, hash |
| List | `ListReact.tsx`, module SCSS | Items, layout, compiler event-expression spread assignment support | Complete | User approved after protected-file audit, metadata verification, copied-suite triage, focused foundation E2E coverage, and iterative parity fixes for grouped default rendering, empty default groups, overlay selection checkboxes, component-module `syncWithVar`, empty selection sync state, and top-level arrow event handlers with nested callbacks. Strict copy migrated from original and protected-file audit passed (`List.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Added runtime adapter below copied entry plus host shims for original virtualization (`virtua`), keybinding parsing, selection store, row-selection helper, themed Card/Text/Spinner/Checkbox imports, legacy renderer types, scroll hooks, compiler `scroll` event contract, migrated List sync props, and test-driver original row marker fallback. `npm --prefix xmlui run check:metadata` passed. Foundation suite `XMLUI_E2E_DEV_PORT=5206 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/List/List.foundation.spec.ts --workers=1` passed 8/8. Compiler codegen regression `./node_modules/.bin/vitest run xmlui/tests/compiler/codegen.test.ts` passed 15/15. Protected copy guard `node xmlui/scripts/verify-protected-component-copy.mjs List` passed. Full copied suite last ran `XMLUI_E2E_DEV_PORT=5204 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/List/List.spec.ts --workers=1` and passed 121/123; the two remaining failures are documented as a rewrite compiler parser gap for copied fixtures using `onClick="items = [...items, ...]"`, before List renders, not as a List runtime blocker. |
| LiveRegion | `LiveRegionReact.tsx`, module SCSS | accessibility | Audit required | aria-live output |
| Logo | `Logo.tsx`, `LogoReact.tsx`, `Logo.defaults.ts`, `Logo.md`; added `Logo.compat.spec.ts` | AppHeader, Image host shim | Complete | User approved after protected-file audit, metadata verification, and compatibility E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Logo` passed (`Logo.tsx` entry-adapted; copied React/defaults/docs identical). Runtime adapter appended below copied entry; obsolete rewrite-only `Logo.module.scss` and incompatible `Logo.spec.ts` for the non-original `src` prop removed. Added `ThemedImage` compatibility export in the Image entry so copied `LogoReact.tsx` can keep its original import. `npm --prefix xmlui run check:metadata` passed. Logo has no copied original component-folder spec, so added compatibility coverage in `Logo.compat.spec.ts`; `npm --workspace xmlui run test:e2e -- xmlui/src/components/Logo/Logo.compat.spec.ts --workers=1` passed 2/2. Full build still fails on unrelated branch-wide TypeScript errors; a filtered build diagnostic grep found no ContentSeparator, Fragment, Logo, Image entry, runtimeRegistry, or registry diagnostics. |
| Markdown | `Markdown.tsx`, `CodeText.tsx`, module SCSS | markdown renderer | Audit required | markdown/code tests |
| Menu family | menu module SCSS and original React helpers | DropdownMenu, NavGroup | Audit required | keyboard/submenu behavior |
| MessageListener | `MessageListener.tsx`, `MessageListenerReact.tsx`, `MessageListener.defaults.ts`, `MessageListener.md`, `MessageListener.spec.ts` | browser messaging | Complete | User approved after protected-file audit, metadata verification, filtered build diagnostics, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs MessageListener` passed (`MessageListener.tsx` entry-adapted; copied React/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed and registries now import the entry renderer. Adapter defers `messageReceived` dispatch by microtask so nested/coexisting browser `message` listeners all receive the current postMessage event before state invalidation rerenders listeners. Verification passed: `npm --prefix xmlui run check:metadata`; filtered development build diagnostics found no touched-file errors; `XMLUI_E2E_DEV_PORT=5334 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/MessageListener/MessageListener.spec.ts --workers=1` passed 17/17. |
| ModalDialog | `ModalDialogReact.tsx`, module SCSS | portal, focus, layer stack | Audit required | open/close/focus/backdrop |
| NavGroup | `NavGroupReact.tsx`, module SCSS | Menu, NavPanel, portal | Complete | User approved after protected-file audit, metadata verification, and iterative DOM parity fixes for horizontal top-level chevron behavior, disabled/cursor state, dropdown padding/min-width, submenu wrapping, and submenu hover/focus behavior. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs NavGroup` passed (`NavGroup.tsx` entry-adapted; copied React/SCSS/docs/defaults/spec identical). Runtime adapter appended below copied entry; original Radix dropdown dependency restored. `npm --prefix xmlui run check:metadata` passed. Live DOM comparisons matched original for top-level trigger geometry, expanded dropdown size (`176 x 168`), nested item geometry (`176 x 42`), and submenu hover state with no stray focus outline on `Page 2-4`. |
| NavLink | `NavLinkReact.tsx`, module SCSS | router, Icon | Complete | User approved after protected-file audit, metadata verification, and DOM parity fixes for active routing state plus mixed child whitespace around custom Stack/text content. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs NavLink` passed (`NavLink.tsx` entry-adapted; copied React/SCSS/docs/defaults/spec identical). Runtime adapter appended below copied entry. `npm --prefix xmlui run check:metadata` passed. Final live DOM comparison for custom `<Stack /> Home` / `<Stack /> About` children matched original text nodes (`" Home "`, `" About "`), link widths (`111.515625px`, `112.0234375px`), and sibling gap (`0`). |
| NavPanel | `NavPanelReact.tsx`, module SCSS | App shell, NavGroup/NavLink | Complete | User approved after protected-file audit, metadata verification, and iterative DOM parity fixes for vertical/horizontal app shell placement, narrow-screen drawer content, logo spacing, active navigation state, and source-boundary whitespace in mixed logo templates. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs NavPanel` passed (`NavPanel.tsx` entry-adapted; copied React/SCSS/docs/defaults/spec identical). Runtime adapter appended below copied entry and `ThemedLogo` host export restored for copied NavPanelReact. `npm --prefix xmlui run check:metadata` passed. Final live DOM check for `<Icon name="drive" /> DriveDiag (Nav)` measured the expected collapsed boundary space between the icon and text. |
| NavPanelCollapseButton | `NavPanelCollapseButtonReact.tsx` | NavPanel context | Audit required | collapsed state |
| NestedApp | `NestedAppReact.tsx`, module SCSS | app context nesting | Audit required | nested route/context tests |
| NoResult | `NoResult.tsx`, `NoResultReact.tsx`, `NoResult.module.scss`, `NoResult.defaults.ts`, `NoResult.md`, `NoResult.spec.ts` | Icon | Complete | User approved after protected-file audit, metadata verification, filtered build diagnostics, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs NoResult` passed (`NoResult.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed and registries now import the entry renderer. Adapter preserves copied defaults and filters optional padding theme variables from root layout styles for old sidecar parity. Verification passed: `npm --prefix xmlui run check:metadata`; filtered development build diagnostics found no touched-file errors; `XMLUI_E2E_DEV_PORT=5331 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/NoResult/NoResult.spec.ts --workers=1` passed 2/2. |
| NumberBox | `NumberBox.tsx`, `NumberBoxReact.tsx`, `NumberBox.module.scss`, `NumberBox.defaults.ts`, `NumberBox.md`, `NumberBox.spec.ts`, `numberbox-abstractions.ts` | Input helpers, Form context, ConciseValidationFeedback, Button/Icon | Complete | User approved after protected-file audit, metadata verification, and the `{Math.PI}` initial value fix. Copied original protected files from `/Users/dotneteer/source/xmlui/xmlui/src/components/NumberBox`; label remains owned by the label behavior, not the NumberBox internals. Added rewrite runtime adapter and Input theme aliases below the copied `NumberBox.tsx` entry, updated registries to import the entry renderer, removed the obsolete rewrite sidecar renderer, and updated `FormItemReact` to use the copied `NumberBox` implementation. Verification passed: `node xmlui/scripts/verify-protected-component-copy.mjs NumberBox` reported copied defaults/docs/SCSS/spec/React identical and `NumberBox.tsx` entry-adapted; `npm --prefix xmlui run check:metadata` passed. Browser DOM verification for `<App><NumberBox integersOnly="true" initialValue="42" /><NumberBox integersOnly="false" initialValue="{Math.PI}" /></App>` rendered input values `42` and `3.141592653589793` after adding `Math` to the rewrite's built-in expression references. Focused E2E was not rerun cleanly because the comparison dev server occupied the hard-coded Playwright port. `npm --prefix xmlui run build` no longer reports host integration errors from the NumberBox adapter/FormItem wiring, but still stops on unrelated branch-wide type errors plus copied protected NumberBox strict TypeScript diagnostics in `numberbox-abstractions.ts` and `NumberBoxReact.tsx`; protected copied implementation files were kept unchanged. |
| Option | `OptionReact.tsx` | Select, RadioGroup | Audit required | option registration |
| PageMetaTitle | `PageMetaTitle.tsx`, `PageMetaTitleReact.tsx`, `PageMetaTitle.defaults.ts`, `PageMetaTitle.md`, `PageMetaTitle.spec.ts` | document title | Complete | User approved after protected-file audit, metadata verification, filtered build diagnostics, and copied E2E coverage. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs PageMetaTitle` passed (`PageMetaTitle.tsx` entry-adapted; copied React/defaults/docs/spec identical). Runtime adapter appended below copied entry; adapter supplies the missing test-bed app-name title suffix through an explicit final Helmet title while leaving the copied Helmet-based implementation unchanged. Verification passed: `npm --prefix xmlui run check:metadata`; filtered development build diagnostics found no touched-file errors; `XMLUI_E2E_DEV_PORT=5337 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/PageMetaTitle/PageMetaTitle.spec.ts --workers=1` passed 7/7. |
| Pages / Page | `Pages.tsx`, `PagesReact.tsx`, `Pages.module.scss`, `Pages.defaults.ts`, `Pages.md`, `Page.md`, `Pages.spec.ts` | router | Complete | User approved after protected-file audit and verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Pages` passed (`Pages.tsx` entry-adapted; copied React/SCSS/docs/defaults/spec identical). Runtime adapters for `Pages` and `Page` appended below copied entry, and routing/query-state host shims added outside protected files. `npm --prefix xmlui run check:metadata` passed. |
| Pagination | `PaginationReact.tsx`, module SCSS | Button/Icon | Audit required | page navigation and styles |
| Part / Slot | original implementation files | component composition | Audit required | slot/part rendering |
| ProfileMenu | `ProfileMenuReact.tsx`, module SCSS | App shell, menu | Audit required | profile menu visibility |
| ProgressBar | `ProgressBar.tsx`, `ProgressBarReact.tsx`, `ProgressBar.module.scss`, `ProgressBar.defaults.ts`, `ProgressBar.md`, `ProgressBar.spec.ts` | theme variants, single-file metadata/renderer entry | Complete | User approved after protected-file audit and verification. `node xmlui/scripts/verify-protected-component-copy.mjs ProgressBar` passed (`ProgressBar.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical); `npm --prefix xmlui run check:metadata` passed; `npm --workspace xmlui run test:e2e -- xmlui/src/components/ProgressBar/ProgressBar.spec.ts xmlui/src/components/ProgressBar/ProgressBar.compat.spec.ts --workers=1` passed 22/22. |
| QRCode | `QRCode.tsx`, `QRCodeReact.tsx`, `QRCode.module.scss`, `QRCode.defaults.ts`, `QRCode.md`, `QRCode.spec.ts` | QR library/runtime | Complete | User approved after protected-file audit, metadata verification, filtered build diagnostics, copied E2E coverage, and the Vite CommonJS import compatibility fix. Strict copy migrated from original and restored the original `react-qr-code@2.0.18` dependency. `node xmlui/scripts/verify-protected-component-copy.mjs QRCode` passed (`QRCode.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed and registries now import the entry renderer. Adapter resolves QRCode theme defaults through the runtime theme layer and fires the copied `init` event once on mount. Added a host-side Vite alias for `react-qr-code` to `src/compat/reactQrCode.tsx`, an ESM-compatible shim that preserves the copied component's expected named `QRCode` export without importing the package's raw CommonJS entry; wired the alias through framework, sample, production, standalone, SSG, and CLI Vite configs. Verification passed: `npm --prefix xmlui run check:metadata`; filtered development build diagnostics found no touched-file errors; `XMLUI_E2E_DEV_PORT=5340 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/QRCode/QRCode.spec.ts --workers=1` passed 13/13. |
| Queue | original implementation file | async orchestration | Audit required | queue lifecycle tests |
| RadioGroup | `RadioGroupReact.tsx`, `RadioItemReact.tsx`, module SCSS; added `RadioGroup.compat.spec.ts` | Option, FormItem | Complete | User approved after protected-file audit, metadata verification, focused smoke checks, disabled border parity, and validation border parity. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs RadioGroup` passed (`RadioGroup.tsx` entry-adapted; copied React/RadioItemReact/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Adapter-tail aliases now bridge copied RadioGroup option border variables for default, hover, active, disabled, and validation states. Live DOM probes matched original for disabled option borders (`rgb(199, 214, 225)`) and selected validation borders (`rgb(245, 0, 16)`, `rgb(218, 127, 0)`, `rgb(86, 211, 106)`) while unselected options remain `rgb(199, 214, 225)`. Verification passed: `npm --prefix xmlui run check:metadata`; `XMLUI_E2E_DEV_PORT=5289 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/RadioGroup/RadioGroup.compat.spec.ts --workers=1` passed 2/2. |
| RatingInput | `RatingInputReact.tsx`, module SCSS | input/form | Complete | User approved after protected-file audit and metadata verification. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs RatingInput` passed (`RatingInput.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Focused smoke E2E from the remigration batch passed for `renders`; `npm --prefix xmlui run check:metadata` passed. |
| Redirect | renderer only unless original has protected file | router | Audit required | immediate and conditional redirect |
| ResponsiveBar | `ResponsiveBarReact.tsx`, module SCSS | layout measurement | Audit required | overflow/collapse behavior |
| RetryPolicy | original implementation file | APICall/DataSource | Audit required | retry timing and cancellation |
| ScrollViewer | `ScrollViewerReact.tsx`, module SCSS | layout, Bookmark | Audit required | scroll container behavior |
| Select | `SelectReact.tsx`, `Select.module.scss`, `Select.defaults.ts`, `Select.md`, `Select.spec.ts`, copied helper files `HiddenOption.tsx`, `MultiSelectOption.tsx`, `OptionContext.ts`, `SelectContext.tsx`, `SelectOption.tsx`, `SimpleSelect.tsx`; added `Select.runtime.spec.ts` | Option, Radix Select, FormItem, label behavior, theme variables | Complete | User approved after protected-file audit, metadata verification, live DOM comparison against original/rewrite dev servers, and focused E2E coverage. Strict copy migrated from original; copied Select React/SCSS/defaults/docs/spec/helper files remain identical and `Select.tsx` is entry-adapted. Runtime adapter fixes preserved copied source while restoring original behavior for direct-root DOM identity, Option child registration, self-closing Option labels, default and custom empty-list templates, hover/active dropdown item colors, FormItem select option wiring, Select label/labeledItem widths, authored percentage width parity, and metadata aliases. Verification passed: `node xmlui/scripts/verify-protected-component-copy.mjs Select`, `node xmlui/scripts/verify-protected-component-copy.mjs Option`, `npm --prefix xmlui run check:metadata`, focused Select/Option E2E smoke for option rendering/dynamic Items/form selection/width variants, Select label-break and width checks, hover DOM checks, and empty-list template regressions in `Select.runtime.spec.ts`. |
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
| Switch | `Switch.tsx`, `Switch.md`, `Switch.spec.ts`; current runtime temporarily reuses rewrite-native `SwitchReact.tsx`/`Switch.module.scss` until Toggle is remigrated | Toggle, label behavior, form | Complete | User approved after protected-file audit, metadata verification, and copied E2E suite. Strict copy migrated from original. `node xmlui/scripts/verify-protected-component-copy.mjs Switch` passed (`Switch.tsx` entry-adapted; copied docs/spec identical). Runtime adapter appended below copied entry; obsolete sidecar renderer removed; registries import the provider-style entry. Original Switch delegates to Toggle with `variant="switch"`, but Toggle is still separately pending remigration; the copied entry uses an import-only bridge to the existing native Switch host while preserving the original entry body for audit. Host fixes stayed outside the copied Switch body: shared label behavior owns Switch labels, compact inline label positions, inherited Form require-label mode, and explicit `labelWidth` parity for before/after positions by sizing the label element itself when a label width is authored. `npm --prefix xmlui run check:metadata` passed. Full copied suite `XMLUI_E2E_DEV_PORT=5257 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/Switch/Switch.spec.ts --workers=1` passed 101/104 with 3 original skips. |
| Table / Column | `TableReact.tsx`, module SCSS, `ColumnReact.tsx` | data, selection, pagination | Audit required | original table suite |
| TableOfContents | `TableOfContentsReact.tsx`, module SCSS | headings, Bookmark | Audit required | active section links |
| Tabs | `TabsReact.tsx`, `TabItemReact.tsx`, module SCSS | router optional, layout | Audit required | tab selection and style |
| TabsForm | `TabsFormReact.tsx` | Form, Tabs | Audit required | form sections |
| Text | `Text.tsx`, `TextReact.tsx`, `Text.module.scss`, `Text.defaults.ts`, `Text.md`, `Text.spec.ts` | theme typography, original style helper shims | Complete | User approved after protected-file audit and DOM/computed-style verification against the original dev server. `node xmlui/scripts/verify-protected-component-copy.mjs Text` passed (`Text.tsx` entry-adapted; copied React/SCSS/defaults/docs/spec identical). Manual Playwright DOM comparison against `http://localhost:5173/` and `http://127.0.0.1:5173/` for preserve-linebreaks, custom variant, and built-in variant markup returned an empty diff for the built-in variant set after host theme fixes. Text completion required host changes outside protected files: dynamic `useComponentStyle`, original Text font-size generated theme aliases, a guard against self-referential variant theme aliases, root light-theme color alignment, and multiline `value` text normalization for original NBSP indentation behavior. `npm --workspace xmlui run build` still stops on pre-existing/non-Text TypeScript failures in `compileXmluiModule.ts`, `Button.tsx`, icon helper files, and `IconProvider.tsx`. |
| TextArea | `TextArea.tsx`, `TextAreaReact.tsx`, `TextAreaResizable.tsx`, `useComposedRef.ts`, `TextArea.module.scss`, `TextArea.defaults.ts`, `TextArea.md`, `TextArea.spec.ts` | Input helpers, Form context, ConciseValidationFeedback, autosize dependency | Complete | User approved after protected-file audit and DOM/computed-style verification against the original dev server. Copied original protected files from `/Users/dotneteer/source/xmlui/xmlui/src/components/TextArea`; label remains owned by the label behavior, not the TextArea internals. Added rewrite runtime adapter and Input theme aliases below the copied `TextArea.tsx` entry, updated registries to import the entry renderer, and removed the obsolete rewrite sidecar renderer. Added original autosize package dependency `react-textarea-autosize@8.5.3` plus `@types/lodash-es@4.17.6`, and restored shared compatibility shims (`dSetValueApi`, `PropertyValueDescription`, `UpdateStateFn`, `ValidationStatus`, and legacy `wrapComponent` state/updateState option shape). Added component-scoped `TextArea.compat.module.scss` so the native textarea inherits typography like TextBox's copied `.input` class; computed style comparison for `<App><TextArea autoSize="true" /></App>` matched original font family, size, line height, padding, height, and border color after the fix. Verification passed: `node xmlui/scripts/verify-protected-component-copy.mjs TextArea` reported copied defaults/docs/SCSS/spec/React identical and `TextArea.tsx` entry-adapted; `npm --prefix xmlui run check:metadata` passed. Focused E2E was not rerun cleanly because the comparison dev server occupied the hard-coded Playwright port. `npm --prefix xmlui run build` has no TextArea diagnostics; it still stops on unrelated branch-wide type errors in `compileXmluiModule.ts`, Button, icon helper files, IconProvider, and protected TextBoxReact ARIA rest typing. |
| TextBox | `TextBox.tsx`, `TextBoxReact.tsx`, `TextBox.module.scss`, `TextBox.defaults.ts`, `TextBox.md`, `TextBox.spec.ts` | Input helpers, label behavior, Form context, ConciseValidationFeedback, Tooltip, theme aliases | Complete | User approved after protected-file audit and DOM/computed-style verification. `node xmlui/scripts/verify-protected-component-copy.mjs TextBox` reported copied defaults/docs/SCSS/spec/React identical and `TextBox.tsx` entry-adapted. `npm --prefix xmlui run check:metadata` passed. Full copied suite previously passed with `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- xmlui/src/components/TextBox/TextBox.spec.ts --workers=1`: 160 passed, 4 original skips. Follow-up DOM comparison for `<App><TextBox endIcon="email" /></App>` matched original and rewrite border variables exactly: both `--xmlui-borderColor-TextBox`, `--xmlui-borderColor-Input`, and `--xmlui-borderColor-Input-default` resolved to `hsl(204, 30.3%, 83%)`, computed border `rgb(199, 214, 225)`. Follow-up DOM comparison for `<App><TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" /></App>` matched original adornment colors: start/end wrapper, icon, and text all computed to `rgb(96, 140, 170)`. Follow-up DOM comparison for `<App><TextBox initialValue="Example text" readOnly="true" /></App>` after focusing the input matched original read-only focus visuals exactly: border `rgb(199, 214, 225)`, outline color `color(srgb 0.127574 0.42571 0.780426 / 0.5)`, width `2px`, style `solid`, offset `0px`. Follow-up DOM comparison for `<App><Button label="Trigger Focus" onClick="inputComponent.focus()" /><TextBox id="inputComponent" /></App>` matched original Button box model after fixing padding fallbacks: `padding-left/right 14px`, `padding-top/bottom 7px`, size `120.6796875 x 32.5`. A same-session E2E rerun was not completed because the user comparison dev server occupied the hard-coded component-test port; reusing it served the sample app rather than the testbed. Host fixes stayed outside copied TextBox protected source: runtime adapter and Input theme aliases appended to `TextBox.tsx`; provider-style registry imports updated; label behavior owns label/labeledItem rendering per the label behavior contract; Form/bindTo/value/validation shims added; original InputAdornment copied and adapted so nested adornment text uses the `inherit` Text variant; Tooltip/ConciseValidationFeedback compatibility exports restored; padding side fallback through horizontal/vertical theme variables, root Input border variables, and root focus outline variables added. |
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
- AutoComplete is `Complete`. The user approved it after protected-file audit,
  metadata check, focused compiler/runtime coverage, focused copied E2E
  coverage, and a live sample probe for creatable Enter behavior. Original
  protected files were recopied from
  `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete`,
  `AutoCompleteContext.tsx` was added to the protected-copy manifest, and
  rewrite runtime adapter code was appended below the copied `AutoComplete.tsx`
  entry.
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
- AutoComplete strict remigration exposed a compiler compatibility gap in the
  original component docs: `onItemCreated="item => newItems.push(item)"` must
  compile and invalidate `newItems`. The rewrite now treats allowed mutating
  method calls such as `push` on mutable XMLUI local/global state as writes for
  invalidation while preserving the method call semantics. Runtime event
  execution also emits store invalidations for those in-place mutations so
  bindings such as `newItems.join(", ")` rerender after arrow event handlers.
  Regression coverage is in `xmlui/tests/compiler/scriptSemantics.test.ts` and
  `xmlui/tests/compiler/renderingPipeline.test.ts`; the exact sample import at
  `http://127.0.0.1:5173/src/Main.xmlui?import` returned HTTP 200 after the
  compile fix, and a Playwright probe of the sample rendered
  `New items: Peter Parker` after typing a new item and pressing Enter.

## Handoff: DateInput, FileInput, Input Helpers, RadioGroup, RatingInput

- Strict protected-source copy was performed for `DateInput`, `FileInput`,
  `Input` helpers, `RadioGroup` plus `RadioItem`, and `RatingInput` from
  `/Users/dotneteer/source/xmlui/xmlui/src/components`.
- Runtime registration was moved to provider-style component entries for
  `DateInput`, `FileInput`, `RadioGroup`, `RadioItem`, and `RatingInput`;
  stale rewrite sidecar renderers for DateInput/FileInput/RatingInput were
  removed.
- Shared host/harness prerequisites added outside protected component bodies:
  original dependency packages (`date-fns`, `papaparse`, `react-dropzone`,
  `@radix-ui/react-radio-group`, `@types/papaparse`), the original
  `LoggerService` shim needed by copied FileInput, `stateful` tolerance in the
  compatibility `wrapComponent`, `FileInputDriver` fixture support, and
  FormItem host imports updated to the copied DateInput/RadioGroup exports.
- Vite runtime compatibility shims were added for copied FileInput dependency
  imports whose browser package files do not expose native ESM default exports:
  `attr-accept` aliases to `xmlui/src/compat/attrAccept.ts`, and `papaparse`
  aliases to `xmlui/src/compat/papaParse.ts` in the xmlui, production, SSR,
  standalone, and sample Vite configs. These shims keep
  `FileInputReact.tsx` protected and identical.
- Protected-copy audit passed:
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`,
  `FileInput`, `RadioGroup`, and `RatingInput` all reported copied protected
  files as `identical` with main entries `entry-adapted`.
- Metadata verification passed:
  `npm --prefix xmlui run check:metadata` generated
  `dist-metadata/xmlui-metadata.json` with 234 components and 3 examples.
- Focused smoke E2E passed:
  DateInput `renders with basic props`; FileInput `component renders with basic
  props`; RadioGroup `RadioGroup with Option elements as children` plus
  `Providing non-Option elements as children still renders`; RatingInput
  `renders`.
- Focused FileInput CSV parsing E2E passed after the PapaParse shim:
  `parses csv and emits row data`, custom delimiter, dynamic typing, headerless
  parsing, and parsed CSV data structure.
- Full FileInput E2E currently has 57 passing and 6 failing tests. The failures
  are remaining host-contract gaps (`bindTo`, theme variable propagation,
  unsupported `focus` event alias, percentage width normalization, and
  unsupported `Array.isArray` script method), not the dependency import shims.
- Full copied batch was started with DateInput/FileInput/RadioGroup/RatingInput
  specs and interrupted after DateInput exposed remaining host-contract
  failures. At interruption: 135 passed, 13 failed, 1 interrupted, 1 skipped,
  158 not run. The failures cluster around DateInput invalid initial-value
  parsing, `borderWidth-DateInput*` theme emission, `bindTo`/API value
  propagation, label behavior, percentage width normalization, and validation
  feedback/concise feedback rendering. Do not edit copied DateInput protected
  files to fix these; continue in shared label/form/theme/runtime adapter
  contracts.
- DateInput border regression follow-up: the copied SCSS references input-style
  theme variables that were not emitted by the rewrite adapter, causing the
  browser to compute no visible border. Added DateInput input theme aliases
  below the copied entry body in `DateInput.tsx`. Browser probe for
  `<DateInput initialValue="05/25/2024" />` now reports `1px solid
  rgb(199, 214, 225)`, `4px` radius, `40px` min-height, and `8px` padding.
  Verification passed: `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  focused DateInput E2E grep `applies correct border` passed 20/20.
- DateInput clearable height follow-up: the second DateInput was taller in the
  rewrite because copied clear-button icons rendered as inline SVGs. Original
  XMLUI's global reset sets media elements, including `svg`, to `display:
  block` and `vertical-align: middle`; added that reset to `xmlui/src/global.css`.
  This matched the original at `45px`, but the original still had a product
  issue where clearable DateInput was taller than non-clearable DateInput.
  Adjusted the DateInput adapter theme alias `padding-button-DateInput` to
  `1.5px 6px`, keeping copied React and SCSS files protected. Direct Playwright
  probe now reports both controls at `40px`; the clearable control has wrapper
  `153.84375 x 40` and clear button `31 x 22`. Verification passed:
  `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  focused DateInput E2E grep `clear button` passed 7/7.
- DateInput `clearToInitialValue="false"` follow-up: the copied component
  correctly emits `null` when clearing, but the rewrite runtime adapter was
  coercing `null` to `undefined` in both `updateState` and `onDidChange`; that
  made the copied component re-enter its uncontrolled `initialValue` path and
  restore the initial date in adjacent clearable instances. Updated the
  DateInput adapter shell to preserve `null` as an explicit controlled clear
  value while still treating `undefined` as uncontrolled. Added
  `DateInput.compat.spec.ts` for the side-by-side clear regression. Browser
  probe for two clearable DateInputs now keeps the first at `05/25/2024` after
  clear and clears the second to empty fields. Verification passed:
  `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  focused DateInput E2E grep `clearToInitialValue stays independent|clear
  button` passed 8/8.
- DateInput `emptyCharacter` placeholder color follow-up: copied
  `PartialInput` only sets placeholder opacity and relies on original XMLUI's
  global placeholder reset for color. Added the missing `input::placeholder`
  and `textarea::placeholder` color reset to `xmlui/src/global.css`, matching
  original `#9ca3af`. Added coverage in `DateInput.compat.spec.ts`; direct
  browser probe for `emptyCharacter="."`, `"*"`, and `"abc"` reports
  placeholder color `rgb(156, 163, 175)` and opacity `0.6`. Verification
  passed: `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  `XMLUI_E2E_DEV_PORT=5284 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/DateInput/DateInput.compat.spec.ts
  --workers=1` passed 2/2.
- DateInput disabled surface follow-up: the adapter aliases still pointed at
  legacy disabled tokens (`$backgroundColor-disabled`, `$textColor-disabled`,
  `$borderColor-disabled`) and forced disabled opacity to `0.5`. Aligned them
  with original-compatible disabled tokens used by DatePicker/TextBox:
  background `$backgroundColor`, text `$textColor--disabled`, border
  `$borderColor--disabled`, opacity `1`. Direct rewrite/original browser probes
  now match for `<DateInput enabled="false" initialValue="05/25/2024" />`:
  border `rgb(199, 214, 225)`, background `rgb(248, 250, 251)`, text
  `rgb(96, 140, 170)`, opacity `1`. Added disabled coverage to
  `DateInput.compat.spec.ts`. Verification passed:
  `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  `XMLUI_E2E_DEV_PORT=5285 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/DateInput/DateInput.compat.spec.ts
  --workers=1` passed 3/3.
- DateInput validation border follow-up: the adapter aliases used lighter
  `$color-danger-500`, `$color-warn-500`, and `$color-success-500` values,
  while original XMLUI emits the darker validation border colors already pinned
  for DatePicker. Updated only the DateInput adapter aliases to
  `hsl(356, 100%, 48%)`, `hsl(35, 100%, 42.8%)`, and
  `hsl(129.5, 58.4%, 58.1%)`. Added `DateInput.compat.spec.ts` coverage for
  `validationStatus="valid"`, `"warning"`, and `"error"` expecting
  `rgb(86, 211, 106)`, `rgb(218, 127, 0)`, and `rgb(245, 0, 16)`. Direct
  original/rewrite browser probes for the validation snippet now match those
  three border colors. Verification passed:
  `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs DateInput`;
  `XMLUI_E2E_DEV_PORT=5286 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/DateInput/DateInput.compat.spec.ts
  --workers=1` passed 4/4.
- FileInput Browse button polish follow-up: the original and rewrite both
  rendered an empty leading icon slot before the default `Browse` label when no
  browse icon glyph was available; the slot had zero width, but Button's flex
  gap shifted the label so the left visual padding looked larger than the
  right. This is an intentional new-project polish fix rather than strict
  original parity. Added a non-protected `FileInput.compat.module.scss` rule
  and applied its root class from the runtime adapter so an empty first icon
  span inside the FileInput Browse button is `display: none`; copied
  `FileInputReact.tsx` and `FileInput.module.scss` remain identical. Live DOM
  probe now reports the Browse text inset as `15px` from both left and right,
  with CSS padding still `14px` on both sides. Verification passed:
  `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs FileInput`;
  `XMLUI_E2E_DEV_PORT=5287 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/FileInput/FileInput.compat.spec.ts
  --workers=1` passed 1/1.
- RadioGroup disabled option border follow-up: copied `RadioGroup.module.scss`
  consumes `Input:borderColor-RadioGroupOption`,
  `Input:borderColor-RadioGroupOption--hover`,
  `Input:borderColor-RadioGroupOption--active`, and
  `Input:borderColor-RadioGroupOption--disabled`, but the migrated entry only
  supplied the legacy `--default` aliases. Added adapter-tail theme aliases for
  those tokens, with disabled border pointing at `$borderColor--disabled`.
  Direct original/rewrite browser probes for the disabled RadioGroup/HStack
  sample now match for all three options at `rgb(199, 214, 225)`. Added
  `RadioGroup.compat.spec.ts` coverage for the wrapped disabled options.
  Verification passed: `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs RadioGroup`;
  `XMLUI_E2E_DEV_PORT=5288 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/RadioGroup/RadioGroup.compat.spec.ts
  --workers=1` passed 1/1.
- RadioGroup validation border follow-up: copied RadioGroup correctly applies
  `error`, `warning`, and `valid` classes only to the selected option, but the
  rewrite was not emitting `borderColor-RadioGroupOption--error`,
  `--warning`, or `--success` values that resolved in the copied stylesheet.
  Added adapter-tail aliases matching the original emitted validation colors:
  `rgb(245, 0, 16)`, `rgb(218, 127, 0)`, and `rgb(86, 211, 106)`. Direct
  original/rewrite browser probes for the three validation RadioGroups now
  match: selected options use colored `2px` borders and unselected options
  remain `rgb(199, 214, 225)` at `1px`. Extended `RadioGroup.compat.spec.ts`.
  Verification passed: `npm --prefix xmlui run check:metadata`;
  `node xmlui/scripts/verify-protected-component-copy.mjs RadioGroup`;
  `XMLUI_E2E_DEV_PORT=5289 XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui
  run test:e2e -- xmlui/src/components/RadioGroup/RadioGroup.compat.spec.ts
  --workers=1` passed 2/2.

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
