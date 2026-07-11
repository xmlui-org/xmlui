# Strict Component Remigration Plan

Primary original source: `/Users/dotneteer/source/xmlui/xmlui/src/components`
Primary extension source: `/Users/dotneteer/source/xmlui/packages`
Rewrite component target: `/Users/dotneteer/source/xmlui-rs/xmlui/src/components`
Rewrite extension target: `/Users/dotneteer/source/xmlui-rs/packages`

## Why This Plan Exists

This document is the active migration contract. It exists to keep migrated
components and extension packages auditable against the original XMLUI
framework, with copied implementation files left intact and host adaptation
kept outside protected source.

## Scope

Migrate XMLUI built-in components from the original framework into this rewrite
while preserving user-visible behavior, DOM shape, styling, theming,
accessibility, routing, data behavior, and documented APIs.

This plan covers built-in component source transfer, extension package source
transfer, protected-file rules, verification, package infrastructure, and status
tracking. It does not cover broad runtime redesigns except where they are
required to host the original components and extension packages unchanged.

## Non-Goals

- Do not redesign component DOM structure.
- Do not restyle components by hand.
- Do not simplify original component internals during migration.
- Do not replace original CSS module styles with new inline styles.
- Do not mark a component complete because it merely looks close in one
  screenshot.

## Non-Negotiable Protected-File Rule

For migrated built-in components and extension package components, the
following files are protected:

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
- copied component E2E specs, especially component-folder `*.spec.ts` files,
  until a specific copied test case qualifies for the E2E test-case edit
  exception below.
- extension package source files, package metadata, package docs, package demos,
  and package tests that are copied from `/Users/dotneteer/source/xmlui/packages`.

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
  import/export rewrites, unless a specific test case qualifies for the E2E
  test-case edit exception below.

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
- extension package build, metadata, demo, and loader infrastructure;
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

Copied component-folder E2E specs must be copied from the original source.
Imports, exports, and harness entry points may be rewritten so the tests run in
this repository, and the shared E2E testing infrastructure may be updated when
needed. A specific copied E2E test case may also be edited after two attempted
fixes still leave that test case failing, provided the edit preserves the
original semantics and the scenario the test case is meant to check. Record the
failed attempts and the reason the final edit preserves the original scenario in
the component notes before marking the component complete. Additional regression
coverage is allowed, but it must live in a separate `*.spec.ts` file in the same
component folder so the copied original suite remains auditable.

When a visual mismatch appears, first audit whether protected files drifted. If
they did not, fix the surrounding runtime, theme, layout, or adapter contract.

## Required Drift Audit

Every migrated component or extension package component must pass a
protected-file drift audit before it can be marked complete.

The audit compares the original file and the rewrite file after normalizing only
allowed import/export path differences. Any non-import difference is a failure.

Use and extend the reusable helper:

```text
xmlui/scripts/verify-protected-component-copy.mjs
```

The helper must:

- accept a component name;
- find original and rewrite protected files;
- normalize import/export path lines only;
- fail on any remaining diff;
- print each protected file as `identical`, `import-only`, `missing`, or
  `entry-adapted`, `missing`, or `drifted`;
- exit non-zero for `missing` or `drifted`;
- support a manifest for helper files whose names do not follow `*React.tsx`;
- support extension-package source/target roots before extension package
  migrations are marked complete.

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
7. Port original tests from the copied original `*.spec.ts` files. Start with
   only import/export or harness-entry changes; if a particular test case still
   fails after two fix attempts, it may be edited while preserving the original
   semantics and scenario, and the attempts plus rationale must be recorded in
   the component notes.
8. Run the protected-file drift audit.
9. Run all copied component-folder E2E tests, any added component-specific E2E
   tests, focused tests, and metadata checks.
10. Compare old and new behavior only after the audit is clean.
11. Ask the user to approve the component before marking it complete.
12. Update the relevant status summary and inventory table.

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
- If a copied original E2E test case needs edits beyond import/export or
  harness-entry rewrites, first try to fix the E2E infrastructure or host
  contract. After two failed attempts for that particular test case, the test
  case source may be changed only when the original semantics and scenario are
  preserved and the rationale is recorded.
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


## Built-In Status Summary

A built-in component can be `Complete` only after the protected-file audit and
the required verification pass in this branch, followed by user approval.

| State | Meaning | Count |
| --- | --- | ---: |
| Not started | No strict migration work has been performed under this plan. | 0 |
| Audit required | Component exists in the rewrite but has not passed the new protected-file audit. | 0 |
| Blocked | Known prerequisite missing before strict migration can finish. | 0 |
| In review | Audit and tests passed; waiting for user approval. | 0 |
| Complete | User approved after audit and verification. | 112 |

These counts are derived from the built-in component inventory below. Update them
whenever a component changes state.

When a component or family changes state, update this status summary and the
built-in component inventory in the same plan edit.

## Built-In Component Inventory

States are plan-local. `Audit required` means the folder currently exists in the
rewrite and must be checked against the original before any trust is placed in
it. Historical verification logs do not belong in this table; keep only source
scope, dependencies, and state.

| Component / family | Protected source to copy or audit | Key dependencies | State |
| --- | --- | --- | --- |
| APICall | `APICall.tsx`, `APICallReact.tsx`, `APICall.defaults.ts`, `APICall.md`, `APICall.spec.ts`, `deferred.md` | app context, RetryPolicy, fetch service | Complete |
| Accordion | `Accordion.tsx`, `AccordionItem.tsx`, `AccordionReact.tsx`, `AccordionItemReact.tsx`, `AccordionContext.tsx`, `Accordion.module.scss`, `Accordion.defaults.ts`, `AccordionItem.defaults.ts`, `Accordion.md`, `Accordion.spec.ts` | Radix Accordion, Stack, Icon, Part host attributes | Complete |
| Animation | `AnimationReact.tsx`, `Animation.defaults.ts` | lifecycle timing | Complete |
| App | `AppReact.tsx`, `App.module.scss`; added `App.foundation.spec.ts` | router, app shell, theme, globals, locale | Complete |
| AppHeader | `AppHeaderReact.tsx`, `AppHeader.module.scss` | Logo, NavPanel context | Complete |
| AppState | `AppState.tsx`, `AppStateReact.tsx`, `AppState.defaults.ts`, `AppState.md`, `AppState.spec.ts` | runtime state registry, framework-level `id`/`ref`/`testId` props, compiled reference API calls, static component-id binding | Complete |
| AutoComplete | `AutoCompleteReact.tsx`, `AutoComplete.module.scss`, `AutoComplete.defaults.ts`, `AutoComplete.md`, `AutoComplete.spec.ts`, `AutoCompleteContext.tsx` | Input, Option, popover, event mutation invalidation | Complete |
| Avatar | `Avatar.tsx`, `AvatarReact.tsx`, `Avatar.module.scss`, `Avatar.defaults.ts`, `Avatar.md`, `Avatar.spec.ts` | image/icon fallback, border theme precedence | Complete |
| Badge | `Badge.tsx`, `BadgeReact.tsx`, `Badge.module.scss`, `Badge.defaults.ts`, `Badge.md`, `Badge.spec.ts` | theme variants | Complete |
| Bookmark | `Bookmark.tsx`, `BookmarkReact.tsx`, `Bookmark.module.scss`, `Bookmark.defaults.ts`, `Bookmark.md`, `Bookmark.spec.ts`; added `Bookmark.foundation.spec.ts` | router/hash scroll container, Link runtime navigation, App scroll restoration | Complete |
| Br | `Br.tsx`, `Br.spec.ts` | renderer text flow, original `PropsTrasform` helper typo shim | Complete |
| Button | `Button.tsx`, `ButtonReact.tsx`, `Button.module.scss`, `Button.defaults.ts`, `Button.md`, `Button.spec.ts`, `Button-style.spec.ts`; added `Button.compat.spec.ts` | Icon, event handler, theme, test resources | Complete |
| Card | `Card.tsx`, `CardReact.tsx`, `Card.module.scss`, `Card.defaults.ts`, `Card.md`, `Card.spec.ts`; added `Card.foundation.spec.ts` | layout props, Avatar/Link/Part host shims | Complete |
| ChangeListener | `ChangeListener.tsx`, `ChangeListenerReact.tsx`, `ChangeListener.defaults.ts`, `ChangeListener.md`, `ChangeListener.spec.ts` | reactive state graph, compiled event handlers, debounce/throttle timing | Complete |
| Checkbox | `Checkbox.tsx`, `Checkbox.md`, `Checkbox.spec.ts`; current runtime temporarily reuses rewrite-native `CheckboxReact.tsx`/`Checkbox.module.scss` until Toggle is remigrated; added `Checkbox.foundation.spec.ts` | Toggle, label behavior, form | Complete |
| CodeBlock | `CodeBlock.tsx`, `CodeBlockReact.tsx`, `CodeBlock.module.scss`, `CodeBlock.spec.ts`, `highlight-code.ts`; shared `base64-utils.ts` | Markdown/highlight metadata, Part host attributes, encoded brace compatibility | Complete |
| ColorPicker | `ColorPicker.tsx`, `ColorPickerReact.tsx`, `ColorPicker.module.scss`, `ColorPicker.defaults.ts`, `ColorPicker.md`, `ColorPicker.spec.ts` | label behavior, input, form binding, shared Input theme aliases | Complete |
| Column | `ColumnReact.tsx` | Table | Complete |
| ConciseValidationFeedback | `ConciseValidationFeedbackReact.tsx`, module SCSS | FormItem | Complete |
| ContentSeparator | `ContentSeparator.tsx`, `ContentSeparatorReact.tsx`, `ContentSeparator.module.scss`, `ContentSeparator.defaults.ts`, `ContentSeparator.md`, `ContentSeparator.spec.ts`, `test-padding.xmlui`; added `ContentSeparator.compat.spec.ts` | theme | Complete |
| ContextMenu | `ContextMenu.tsx`, `ContextMenuReact.tsx`, `ContextMenu.module.scss`, `ContextMenu.md`, `ContextMenu.spec.ts`; added `ContextMenu.foundation.spec.ts` | menu, portal, focus | Complete |
| DataSource | `DataSource.tsx`, `DataSource.md`, `DataSource.spec.ts` | APICall, cache, data state | Complete |
| DateInput | `DateInputReact.tsx`, module SCSS; added `DateInput.compat.spec.ts`, `DateInput.foundation.spec.ts` | Input, date utils | Complete |
| DatePicker | `DatePickerReact.tsx`, module SCSS; added `DatePicker.compat.spec.ts` | DateInput, popover/calendar | Complete |
| Drawer | `Drawer.tsx`, `DrawerReact.tsx`, `Drawer.module.scss`, `Drawer.defaults.ts`, `Drawer.md`, `Drawer.spec.ts`; added `Drawer.foundation.spec.ts` | portal, layer stack, focus, Radix Dialog, theme portal root | Complete |
| DropdownMenu | `DropdownMenu.tsx`, `DropdownMenuReact.tsx`, `DropdownMenu.module.scss`, `DropdownMenu.md`, `MenuItem.md`, `SubMenuItem.md`, `DropdownMenu.spec.ts`; added `DropdownMenu.foundation.spec.ts` | menu, portal, focus, Select/ModalDialog popup layering | Complete |
| EventSource | `EventSource.tsx`, `EventSourceReact.tsx`, `EventSource.defaults.ts` | stream service, data ops | Complete |
| ExpandableItem | `ExpandableItem.tsx`, `ExpandableItemReact.tsx`, `ExpandableItem.module.scss`, `ExpandableItem.md`, `ExpandableItem.spec.ts`; added `ExpandableItem.foundation.spec.ts` | Icon, layout, Toggle compatibility, CSS module class-name compatibility, Stack gap fallback compatibility, label behavior compact sizing/theme/layout context | Complete |
| Fallback | `Fallback.tsx`, `FallbackReact.tsx`, `Fallback.defaults.ts`, `Fallback.md` | APICall/DataSource loading contract | Complete |
| FileInput | `FileInputReact.tsx`, module SCSS; added `FileInput.compat.spec.ts` and `FileInput.compat.module.scss` | input, form | Complete |
| FileUploadDropZone | `FileUploadDropZone.tsx`, `FileUploadDropZoneReact.tsx`, `FileUploadDropZone.module.scss`, `FileUploadDropZone.defaults.ts`, `FileUploadDropZone.md`, `FileUploadDropZone.spec.ts`; added `FileUploadDropZone.foundation.spec.ts` | drag/drop, FileInput, react-dropzone, Icon, original runtime border-color default | Complete |
| FlowLayout | `FlowLayout.tsx`, `FlowLayoutReact.tsx`, `FlowLayout.module.scss`, `FlowLayout.defaults.ts`, `FlowLayout.md`, `FlowLayout.spec.ts`, `flow-layout-utils.ts`; added `FlowLayout.foundation.spec.ts` | layout props, ScrollViewer, dynamic style registry, non-visual/opaque child host contract | Complete |
| FocusScope | `FocusScope.tsx`, `FocusScopeReact.tsx`, `FocusScope.defaults.ts`, `FocusScope.md`, `FocusScope.spec.ts`; added `FocusScope.foundation.spec.ts` | focus manager, CDATA parser compatibility, layout-context passthrough for nested controls | Complete |
| Footer | `FooterReact.tsx`, module SCSS | App shell | Complete |
| Form | `FormReact.tsx`, module SCSS; added `Form.defaults.ts`, `FormValidator.tsx`, `formActions.ts`, focused regressions in `Form.spec.ts` | FormItem, validation, data submit | Complete |
| FormItem | `FormItemReact.tsx`, module SCSS; copied/added `FormItem.defaults.ts`, `ItemWithLabel.tsx`, `ItemWithLabel.defaults.ts`, `FormBindingWrapper.tsx`, `ValidationWrapper.tsx`, `Validations.ts`, `HelperText.tsx`, `HelperText.module.scss`, `FormItemUtils.ts` | label behavior, validation | Complete |
| FormSegment | `FormSegment.tsx`, `FormSegmentReact.tsx`, `FormSegment.spec.ts`; rewrite adapter `FormSegment.renderer.tsx` | Form | Complete |
| Fragment | `Fragment.tsx`, `Fragment.spec.ts` | renderer | Complete |
| Heading family | `Heading.tsx`, `HeadingReact.tsx`, `Heading.module.scss`, `Heading.defaults.ts`, `Heading.md`, `H1.md` ... `H6.md`, `Heading.spec.ts`, `HeadingShortcuts.spec.ts` | theme text styles, old app/TOC/context helper shims | Complete |
| HtmlTags | `HtmlTags.tsx`, `HtmlTags.module.scss`, `HtmlTags.spec.ts` | native tag bridge, legacy wrapper resource URLs, runtime root markers | Complete |
| I18n | `I18n.tsx`, `I18n.md`; rewrite existing `I18n.spec.ts` retained | runtime i18n service, App locale bundle bridge, inline translated slots | Complete |
| IFrame | `IFrame.tsx`, `IFrameReact.tsx`, `IFrame.module.scss`, `IFrame.md`, `IFrame.spec.ts`; added `IFrame.foundation.spec.ts`; changed `sample/package.json` dev host and sample app | iframe API registration, resource URLs, load event payload, layout/theme props, documented `title` prop contract, native iframe DOM parity, sample localhost origin, escaped braces in `srcdoc` | Complete |
| Icon | `Icon.tsx`, `IconReact.tsx`, `Icon.module.scss`, `Icon.md`, `Icon.spec.ts`, original helper icon TSX files, icon module SCSS files, `Icon/svg/*`, `IconProvider.tsx`, `IconRegistryContext.tsx`, `icons-abstractions.ts` | original icon provider/registry, SVG React transform, theme resource lookup | Complete |
| Image | `Image.tsx`, `ImageReact.tsx`, `Image.module.scss`, `Image.defaults.ts`, `Image.md`, `Image.spec.ts` | resource URLs | Complete |
| IncludeMarkup | `IncludeMarkup.tsx`, `IncludeMarkupReact.tsx`, `IncludeMarkup.md`, `IncludeMarkup.spec.ts` | markup loader/compiler | Complete |
| Input helpers | `InputAdornment.tsx`, `InputDivider.tsx`, `InputLabel.tsx`, `PartialInput.tsx`, module SCSS | TextBox, NumberBox, ColorPicker | Complete |
| InspectButton / Inspector | `InspectButton.tsx`, `InspectButton.module.scss`, `Inspector.tsx`, `InspectorReact.tsx`, `Inspector.module.scss`, `Inspector.defaults.ts`; removed obsolete global SCSS | dev tools state, debug bridge, InspectorContext host shim | Complete |
| Items | `Items.tsx`, `ItemsReact.tsx`, `Items.defaults.ts`, `Items.md`, `Items.spec.ts`; added `Items.compat.spec.ts` | renderer collection, original `orderedKeys` helper, anonymous DataSource property values | Complete |
| Lifecycle | `Lifecycle.tsx`, `LifecycleReact.tsx`, `Lifecycle.defaults.ts`, `Lifecycle.md` | renderer lifecycle | Complete |
| Link | `Link.tsx`, `LinkReact.tsx`, `Link.module.scss`, `Link.defaults.ts`, `Link.md`, `Link.spec.ts` | router/hash behavior, theme variants, Part host attributes | Complete |
| List | `ListReact.tsx`, module SCSS | Items, layout, compiler event-expression spread assignment support | Complete |
| LiveRegion | `LiveRegion.tsx`, `LiveRegionReact.tsx`, `LiveRegion.defaults.ts`, `LiveRegion.md`, `LiveRegion.spec.ts` | accessibility | Complete |
| Logo | `Logo.tsx`, `LogoReact.tsx`, `Logo.defaults.ts`, `Logo.md`; added `Logo.compat.spec.ts` | AppHeader, Image host shim | Complete |
| Markdown | `Markdown.tsx`, `MarkdownReact.tsx`, `Markdown.renderer.tsx`, `Markdown.defaults.ts`, `Markdown.md`, `markdown-styles.md`, `parse-binding-expr.ts`, `utils.ts`, `CodeText.tsx`, `CodeText.module.scss`, `Markdown.module.scss`, `Markdown.spec.ts`; added `CodeText.spec.ts` | markdown renderer, raw HTML/GFM support, binding-expression parsing, `xmlui-pg` playground fences, nested code fences, codefence typography and padding parity, raw HTML table border-collapse parity, CJS dependency interop shims for Markdown dependencies | Complete |
| Menu family | `Menu.module.scss` plus DropdownMenu-owned `MenuItem`, `MenuSeparator`, and `SubMenuItem` metadata/runtime adapters | DropdownMenu, ContextMenu, NavGroup | Complete |
| MessageListener | `MessageListener.tsx`, `MessageListenerReact.tsx`, `MessageListener.defaults.ts`, `MessageListener.md`, `MessageListener.spec.ts` | browser messaging | Complete |
| ModalDialog | `ModalDialog.tsx`, `ModalDialogReact.tsx`, `ModalDialog.module.scss`, `ModalDialog.defaults.ts`, `ModalDialog.md`, `ModalDialog.spec.ts`, copied helper files `Dialog.tsx`, `Dialog.module.scss`, `ConfirmationModalContextProvider.tsx`; added `ModalDialog.compat.spec.ts` | portal, focus, layer stack, tooltip behavior, direct child vars | Complete |
| NavGroup | `NavGroupReact.tsx`, module SCSS | Menu, NavPanel, portal | Complete |
| NavLink | `NavLinkReact.tsx`, module SCSS | router, Icon | Complete |
| NavPanel | `NavPanelReact.tsx`, module SCSS | App shell, NavGroup/NavLink | Complete |
| NavPanelCollapseButton | `NavPanelCollapseButton.tsx`; added `NavPanelCollapseButton.foundation.spec.ts` | App layout context, NavPanel footer | Complete |
| NestedApp | `NestedApp.tsx`, `NestedAppReact.tsx`, `NestedApp.renderer.tsx`, `NestedApp.defaults.ts`, `NestedApp.module.scss`, `NestedApp.spec.ts`, `AppWithCodeView.tsx`, `AppWithCodeViewReact.tsx`, `AppWithCodeView.module.scss`, `Tooltip.tsx`, `Tooltip.module.scss`, `logo.svg`, `utils.ts` | app context nesting, `xmlui-pg` frame rendering, nested app compilation, isolated routing/state, reset/remount behavior, inherited themes/config globals, old/new local-server computed-style parity for playground frame, header, code display, and unframed inner app placeholder/root structure | Complete |
| NoResult | `NoResult.tsx`, `NoResultReact.tsx`, `NoResult.module.scss`, `NoResult.defaults.ts`, `NoResult.md`, `NoResult.spec.ts` | Icon | Complete |
| NumberBox | `NumberBox.tsx`, `NumberBoxReact.tsx`, `NumberBox.module.scss`, `NumberBox.defaults.ts`, `NumberBox.md`, `NumberBox.spec.ts`, `numberbox-abstractions.ts` | Input helpers, Form context, ConciseValidationFeedback, Button/Icon | Complete |
| Option | `OptionReact.tsx` | Select, RadioGroup | Complete |
| PageMetaTitle | `PageMetaTitle.tsx`, `PageMetaTitleReact.tsx`, `PageMetaTitle.defaults.ts`, `PageMetaTitle.md`, `PageMetaTitle.spec.ts` | document title | Complete |
| Pages / Page | `Pages.tsx`, `PagesReact.tsx`, `Pages.module.scss`, `Pages.defaults.ts`, `Pages.md`, `Page.md`, `Pages.spec.ts` | router | Complete |
| Pagination | `Pagination.tsx`, `PaginationReact.tsx`, `Pagination.module.scss`, `Pagination.defaults.ts`, `Pagination.md`, `Pagination.spec.ts`; added `Pagination.compat.spec.ts` | Button, Icon, Select, Part, shared behavior props, script array spread | Complete |
| Part / Slot | `Part.tsx`, `Slot.ts`, `Slot.md`, `Slot.spec.ts`; added `Slot.foundation.spec.ts` | component composition | Complete |
| ProfileMenu | `ProfileMenu.tsx`, `ProfileMenu.module.scss`; added `ProfileMenu.foundation.spec.ts` | App shell, menu | Complete |
| ProgressBar | `ProgressBar.tsx`, `ProgressBarReact.tsx`, `ProgressBar.module.scss`, `ProgressBar.defaults.ts`, `ProgressBar.md`, `ProgressBar.spec.ts` | theme variants, single-file metadata/renderer entry | Complete |
| QRCode | `QRCode.tsx`, `QRCodeReact.tsx`, `QRCode.module.scss`, `QRCode.defaults.ts`, `QRCode.md`, `QRCode.spec.ts` | QR library/runtime | Complete |
| Queue | `Queue.tsx`, `QueueReact.tsx`, `Queue.defaults.ts`, `queueActions.ts`, `Queue.md`, `Queue.spec.ts`; added `Queue.compat.spec.ts` | async orchestration, `react-hot-toast`, script parser parity, AppContext `confirm` | Complete |
| RadioGroup | `RadioGroupReact.tsx`, `RadioItemReact.tsx`, module SCSS; added `RadioGroup.compat.spec.ts` | Option, FormItem | Complete |
| RatingInput | `RatingInputReact.tsx`, module SCSS | input/form | Complete |
| Redirect | `Redirect.tsx`, `Redirect.defaults.ts`, `Redirect.md`, `Redirect.spec.ts` | router | Complete |
| ResponsiveBar | `ResponsiveBar.tsx`, `ResponsiveBarReact.tsx`, `ResponsiveBarItem.tsx`, module SCSS, docs, copied spec with documented visible-locator test exception | layout measurement, DropdownMenu, `$overflow` context | Complete |
| RetryPolicy | `RetryPolicy.tsx`, `RetryPolicyReact.tsx`, `RetryPolicy.defaults.ts`, `RetryPolicy.md` | APICall/DataSource | Complete |
| ScrollViewer | `ScrollViewer.tsx`, `ScrollViewerReact.tsx`, `Scroller.tsx`, `ScrollViewer.defaults.ts`, `ScrollViewer.module.scss`, `ScrollViewer.md`, `ScrollViewer.spec.ts`; added `ScrollViewer.foundation.spec.ts` | layout, Bookmark, original overlay scrollbar dependencies | Complete |
| Select | `SelectReact.tsx`, `Select.module.scss`, `Select.defaults.ts`, `Select.md`, `Select.spec.ts`, copied helper files `HiddenOption.tsx`, `MultiSelectOption.tsx`, `OptionContext.ts`, `SelectContext.tsx`, `SelectOption.tsx`, `SimpleSelect.tsx`; added `Select.runtime.spec.ts` | Option, Radix Select, FormItem, label behavior, theme variables | Complete |
| SelectionStore | `SelectionStore.tsx`, `SelectionStoreReact.tsx`, `SelectionStore.defaults.ts`, `SelectionStore.md`; added `SelectionStore.foundation.spec.ts` | Table/List/Tree | Complete |
| SkipLink | `SkipLink.tsx`, `SkipLinkReact.tsx`, `SkipLink.defaults.ts`, `SkipLink.md`, `SkipLink.spec.ts` | accessibility | Complete |
| Slider | `SliderReact.tsx`, module SCSS | input/form, Tooltip trigger compatibility | Complete |
| SpaceFiller | `SpaceFillerReact.tsx`, module SCSS | flex layout | Complete |
| Spinner | `SpinnerReact.tsx`, module SCSS | theme | Complete |
| Splitter | `Splitter.tsx`, `SplitterReact.tsx`, `Splitter.module.scss`, `Splitter.defaults.ts`, `Splitter.md`, `HSplitter.md`, `VSplitter.md`, `Splitter.spec.ts`, `HSplitter.spec.ts`, `VSplitter.spec.ts`, `utils.ts`; added `Splitter.foundation.spec.ts` | layout/star sizing | Complete |
| Stack family | `StackReact.tsx`, `Stack.module.scss`, `Stack.defaults.ts`, `Stack.md`, `HStack.md`, `VStack.md`, `CHStack.md`, `CVStack.md`, `Stack.spec.ts`, `HStack.spec.ts`, `VStack.spec.ts`, `CHStack.spec.ts`, `CVStack.spec.ts` | layout props, star sizing, original ScrollViewer fade/scroll host contract, boolean attribute parsing | Complete |
| Stepper | `Stepper.tsx`, `Step.tsx`, `StepperReact.tsx`, `StepReact.tsx`, `StepperContext.tsx`, `Stepper.defaults.ts`, `Stepper.module.scss`, `Stepper.spec.ts` | Form, Tabs-like state | Complete |
| StepperForm | `StepperForm.tsx`, `StepperForm.spec.ts` | Form, Stepper | Complete |
| StickyBox | `StickyBox.tsx`, `StickyBoxReact.tsx`, `StickyBox.defaults.ts`, `StickyBox.module.scss`, `StickyBox.md`; updated `StickySection.foundation.spec.ts` | scroll containers, original sticky dependency | Complete |
| StickySection | `StickySection.tsx`, `StickySectionReact.tsx`, `StickySection.defaults.ts`, `StickySection.module.scss`, `StickySection.md`, `StickySection.spec.ts`; added `StickySection.foundation.spec.ts` | scroll containers | Complete |
| Switch | `Switch.tsx`, `Switch.md`, `Switch.spec.ts`; current runtime temporarily reuses rewrite-native `SwitchReact.tsx`/`Switch.module.scss` until Toggle is remigrated | Toggle, label behavior, form | Complete |
| Table / Column | `TableReact.tsx`, module SCSS, `ColumnReact.tsx` | data, selection, pagination | Complete |
| TableOfContents | `TableOfContentsReact.tsx`, module SCSS | headings, Bookmark | Complete |
| Tabs | `Tabs.tsx`, `TabItem.tsx`, `TabsReact.tsx`, `TabItemReact.tsx`, `TabContext.tsx`, `Tabs.module.scss`, `Tabs.defaults.ts`, `Tabs.md`, `TabItem.md`, `Tabs.spec.ts` | Radix Tabs, template children, layout | Complete |
| TabsForm | `TabsFormReact.tsx` | Form, Tabs | Complete |
| Text | `Text.tsx`, `TextReact.tsx`, `Text.module.scss`, `Text.defaults.ts`, `Text.md`, `Text.spec.ts` | theme typography, original style helper shims | Complete |
| TextArea | `TextArea.tsx`, `TextAreaReact.tsx`, `TextAreaResizable.tsx`, `useComposedRef.ts`, `TextArea.module.scss`, `TextArea.defaults.ts`, `TextArea.md`, `TextArea.spec.ts` | Input helpers, Form context, ConciseValidationFeedback, autosize dependency | Complete |
| TextBox | `TextBox.tsx`, `TextBoxReact.tsx`, `TextBox.module.scss`, `TextBox.defaults.ts`, `TextBox.md`, `TextBox.spec.ts` | Input helpers, label behavior, Form context, ConciseValidationFeedback, Tooltip, theme aliases | Complete |
| Theme | `Theme.tsx`, `ThemeReact.tsx`, `NotificationToast.tsx`, `Theme.module.scss`, `Theme.defaults.ts`, `Theme.md`, `Theme.spec.ts`; added `Theme.foundation.spec.ts` | generated CSS variables, runtime theme context, tone-specific semantic color aliases, hierarchical theme-var fallback, built-in XMLUI theme definitions | Complete |
| TileGrid | `TileGridReact.tsx`, module SCSS; added `TileGrid.foundation.spec.ts` | FlowLayout/items, SelectionStore, Checkbox | Complete |
| TimeInput | `TimeInput.tsx`, `TimeInputReact.tsx`, `TimeInput.defaults.ts`, `TimeInput.module.scss`, `TimeInput.md`, `TimeInput.spec.ts`, `utils.ts`; added `TimeInput.foundation.spec.ts` | Input helpers, Form context, label behavior, locale parsing | Complete |
| Timer | `Timer.tsx`, `TimerReact.tsx`, `Timer.defaults.ts`, `Timer.md`, `Timer.spec.ts`; added `Timer.foundation.spec.ts` | scheduling, Switch API references | Complete |
| Toast | `Toast.tsx`, `ToastReact.tsx`, `Toast.spec.ts` | app globals, notifications, react-hot-toast | Complete |
| Toggle | original implementation file | Switch/Button semantics | Complete |
| ToneChangerButton | `ToneChangerButton.tsx`, `ToneChangerButton.defaults.ts`, `ToneChangerButton.md`, `ToneChangerButton.spec.ts` | theme tone, App context `activeThemeTone`, root test attrs | Complete |
| ToneSwitch | `ToneSwitch.tsx`, `ToneSwitchReact.tsx`, `ToneSwitch.module.scss`, `ToneSwitch.defaults.ts`, `ToneSwitch.md`, `ToneSwitch.spec.ts` | theme tone, Toggle inputRenderer compatibility | Complete |
| Tooltip | `Tooltip.tsx`, `TooltipReact.tsx`, `Tooltip.module.scss`, `Tooltip.defaults.ts`, `Tooltip.md`, `Tooltip.spec.ts` | portal, focus/hover, Markdown, Radix tooltip | Complete |
| Tree | `Tree.tsx`, `TreeReact.tsx`, `TreeComponent.module.scss`, `Tree.defaults.ts`, `Tree.md`, copied `Tree*.spec.ts`, `testData.ts` | data loading, selection, virtualization, ScrollViewer, tree abstractions | Complete |
| TreeDisplay | `TreeDisplayReact.tsx`, module SCSS | Tree data display | Complete |
| ValidationSummary | `ValidationSummaryReact.tsx`, module SCSS | Form | Complete |
| WebSocket | `WebSocket.tsx`, `WebSocketReact.tsx`, `WebSocket.defaults.ts` | data/event service | Complete |


## Extension Package Migration

Extension packages are part of the XMLUI compatibility surface. Migrate them
after the built-in component host contracts they depend on are stable, but plan
the infrastructure before copying individual package components.

Extension migration rules:

- Preserve the current package folder structure after migration:
  `packages/<package>/package.json`, package root `index.ts` when present,
  `src/`, `meta/`, `demo/`, package tests, `tsconfig.json`, and package
  build outputs or metadata output conventions.
- Build the extension-package infrastructure first: workspace/package discovery,
  package-level TypeScript config, public `xmlui` type shims, Vite extension
  build support, metadata generation, package demo hosting, package test
  harnesses, and extension loading from built artifacts.
- Extend the protected-copy verifier so it accepts package names and compares
  `/Users/dotneteer/source/xmlui/packages/<package>` to
  `/Users/dotneteer/source/xmlui-rs/packages/<package>` with the same
  import-only normalization rules.
- Treat package source files, module SCSS, defaults, docs, package metadata,
  demos, and copied specs as protected. Runtime adaptation belongs in package
  host shims, package build infrastructure, or extension loader glue.
- Preserve each package's public extension shape from `src/index.tsx` or
  `src/index.ts`: namespace, theme namespace prefix, exported functions,
  themes, and component renderer list.
- Verify each package with the closest original command shape available:
  `build:extension`, `build:meta` or `build:metadata`, package tests, demo
  smoke checks, and a consumer check that loads the built extension into an
  XMLUI app.
- The original root extension build command is
  `build-extensions: turbo run build:extension`, with package-level
  `build:extension` scripts running `xmlui build-lib`. This rewrite preserves
  that Turbo command shape with `build-extensions: turbo run build:extension
  --filter='./packages/*'`, scoped to extension packages and package-style
  workspaces.
- The root regression command for migration work is `npm run check:regression`;
  it first builds the XMLUI core artifacts currently supported by this rewrite
  (`build:core`, metadata plus standalone) and extension packages through
  Turbo, then runs XMLUI unit tests, XMLUI e2e tests, and extension package e2e
  tests. The stricter `build:xmlui`/`npm run build` target remains a separate
  migration target because it currently gates on full TypeScript/app-build
  parity.
- Do not flatten extension package components into `xmlui/src/components`. They
  must remain extension package components under `packages/<package>/src`.

### Extension Package Status Summary

The original package inventory currently exposes 51 public component renderer
entries across 16 extension package folders with source indexes. All are
`Audit required` until package infrastructure, protected-copy audits, metadata
builds, and package-level verification pass in this rewrite.

| State | Meaning | Public component entries |
| --- | --- | ---: |
| Audit required | Original extension component exists and must be audited or copied into the matching package structure. | 51 |
| Blocked | Missing extension-package infrastructure or dependency prevents audit/verification. | 0 |
| In review | Audit and tests passed; waiting for user approval. | 0 |
| Complete | User approved after audit and verification. | 0 |

### Extension Package Inventory

| Package | Public components from original package index | Package dependencies / infrastructure | Rewrite state |
| --- | --- | --- | --- |
| `xmlui-ai-blocks` | `AiConversation` | XMLUI extension runtime, AI conversation host contracts | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-animations` | `Animation`, `FadeAnimation`, `FadeInAnimation`, `FadeOutAnimation`, `SlideInAnimation`, `ScaleAnimation` | `@react-spring/web`, animation timing and lifecycle host contracts | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-calendar` | `Calendar` / `BigCalendar` renderer | `react-big-calendar`, `dayjs`, package CSS build | Audit required. |
| `xmlui-crm-blocks` | `TableSelect` | Table/select host contracts and package demo support | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-devtools` | `DevTools` | Devtools namespace, Monaco, Radix dialog/menu/tooltip, editor export | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-docs-blocks` | `BasicLayout`, `FeaturedWithTabsLayout`, `OverviewCard`, `Breadcrumbs`, `Separator`, `LinkButton`, `DocumentLinks`, `DocumentPage`, `DocumentPageNoTOC`, `TBD`, `SectionHeader`, `Overview`, `TwoColumnCode`, `PageNotFound`, `ReleaseList`, `Blog`, `ReadingTime`, `Share` | Docs theme, docs helper functions, Shiki/highlighter utilities, XMLUI template components | Audit required. |
| `xmlui-echart` | `EChart` | `echarts`, `echarts-for-react`, CSS/module build | Audit required. |
| `xmlui-gauge` | `Gauge` | `smart-webcomponents-react`, CSS/module build | Audit required. |
| `xmlui-grid-layout` | `GridLayout` | `react-grid-layout`, extension build without original metadata script parity | Audit required. |
| `xmlui-masonry` | `Masonry` | Masonry layout behavior and package tests | Audit required. |
| `xmlui-pdf` | `Pdf` | PDF.js/react-pdf, pdf-lib, WASM setup, package unit tests and E2E | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-react-flow` | `ReactFlowCanvas` | `@xyflow/react`, canvas sizing and package CSS | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-recharts` | `AreaChart`, `BarChart`, `DonutChart`, `LabelList`, `Legend`, `LineChart`, `PieChart`, `RadarChart` | `recharts`, chart provider utilities, chart CSS/modules | Audit required; empty target package scaffold exists for future protected-source migration. |
| `xmlui-search` | `Search` | `fuse.js`, popover/search host contracts, metadata build | Audit required. |
| `xmlui-tiptap-editor` | `TiptapEditor` | Tiptap extensions, markdown serialization, editor CSS | Audit required. |
| `xmlui-website-blocks` | `HeroSection`, `ScrollToTop`, `FancyButton`, `Carousel`, `CarouselItem`, `Backdrop`, `Breakout` | `@react-spring/web`, Embla carousel, compose refs, website block demos | Audit required. |

Source package note: `xmlui-hello-world` exists in the original checkout only as
a built/dist package in this snapshot, with no `src/index` public component
source to audit. Revisit it only if source is restored or a package artifact
compatibility pass explicitly targets dist-only packages.

Rewrite-only package note: `xmlui-counter-badge` exists in the rewrite but not
in the original extension package source. Keep it outside strict source-copy
completion counts unless the user explicitly asks to preserve or migrate it as a
rewrite-only example package.

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
