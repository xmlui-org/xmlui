# XMLUI Compatibility Inventory

Status: seeded by Experiment 15  
Original baseline: `/Users/dotneteer/source/xmlui`  
Rewrite baseline: `/Users/dotneteer/source/xmlui-rs`

This inventory is the control index for the rebuild program. Each row points to
the original compatibility contract, the current rewrite surface, status, and
the rebuild-plan phase that should close the surface.

Until explicit human ownership is introduced, the `Rebuild Phase` or
`Planned Wave` column is the owner field. When a surface moves from planning
into implementation, add a specific owner note in the row or in the related
closure note.

Status labels:

- `not-started`: no meaningful rewrite implementation exists yet;
- `inventoried`: old behavior is identified, implementation is not complete;
- `tests-ported`: compatibility tests exist but behavior may still be partial;
- `implemented`: behavior exists for the current slice;
- `parity-tested`: old behavior has focused parity tests;
- `closed`: public compatibility is complete for this surface;
- `deferred`: intentionally postponed to a later rebuild phase.

## Command and Package Surfaces

| Surface | Original Anchor | Rewrite Anchor | Status | Tests | Rebuild Phase |
| --- | --- | --- | --- | --- | --- |
| Root workspace layout | `/Users/dotneteer/source/xmlui/package.json` | `/Users/dotneteer/source/xmlui-rs/package.json` | tests-ported | package infrastructure compatibility tests | Phase 1 |
| Framework package exports | `/Users/dotneteer/source/xmlui/xmlui/package.json` | `/Users/dotneteer/source/xmlui-rs/xmlui/package.json` | tests-ported | artifact compatibility tests; COMP-0002 tracks missing exports | Phase 1 |
| Framework package scripts | `/Users/dotneteer/source/xmlui/xmlui/package.json` | `/Users/dotneteer/source/xmlui-rs/xmlui/package.json` | tests-ported | package infrastructure compatibility tests | Phase 1 |
| Build XMLUI command | root `build-xmlui`, xmlui `build:xmlui` | root `build-xmlui`, xmlui `build:xmlui` | tests-ported | package infrastructure compatibility tests; `compatibility:sweep` | Phase 1 |
| Metadata command | xmlui `build:xmlui-metadata` | xmlui `build:metadata` | tests-ported | metadata artifact checks | Phase 7 |
| Docs generation | root `generate-docs`, xmlui `generate-docs` | xmlui `build:docs-reference` | inventoried | sweep command report | Phase 7 |
| VS Code extension build | root `build-vscode-extension` | root `build:vscode`, `tools/vscode` | implemented | VS Code build/test in sweep | Phase 7 |
| Extension package build | root `build-extensions` | `packages/xmlui-counter-badge` fixture | tests-ported | package build/metadata in sweep | Phase 6 |
| Integration tests | `/Users/dotneteer/source/xmlui/integration-tests` | `scripts/phase1-integration-smoke.mjs` | tests-ported | root `test-integration` smoke; COMP-0007 tracks full old integration parity | Phase 1 |
| Release workflows | `/Users/dotneteer/source/xmlui/.github/workflows` | missing | deferred | debt entry | Phase 9 |

## Language and Runtime Surfaces

| Surface | Original Anchor | Rewrite Anchor | Status | Tests | Rebuild Phase |
| --- | --- | --- | --- | --- | --- |
| XMLUI markup parser | `xmlui/src/parsers` | `xmlui/src/parser/markup` | tests-ported | compiler parser tests, compatibility smoke | Phase 2 |
| Expression parser/compiler | `xmlui/src/components-core/script-runner` and parser sources | `xmlui/src/parser/script`, `xmlui/src/compiler` | tests-ported | compiler tests, perf baseline | Phase 2 |
| Event handler execution | scripting docs and script-runner sources | `xmlui/src/compiler/scriptSemantics.ts`, runtime scope | tests-ported | async handlers, event-tag tests, compatibility smoke | Phase 2 |
| State and scopes | runtime/state sources | `xmlui/src/runtime/state` | tests-ported | runtime state tests, E2E mutation | Phase 2 |
| Reactive graph | runtime invalidation behavior | `xmlui/src/runtime/rendering/reactive.tsx` | tests-ported | reactive derived tests | Phase 2 |
| Rendering pipeline | managed React runtime | `xmlui/src/runtime/rendering` | tests-ported | rendering pipeline tests, E2E | Phase 2 |
| User-defined components | component runtime and docs | compiler/runtime UDC support | tests-ported | UDC E2E | Phase 2 |
| Diagnostics and source locations | parser/analyzer/language server | parser/compiler/metadata diagnostics | tests-ported | metadata and VS Code tests | Phase 2 |
| Event tag syntax | `/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md` | `xmlui/src/compiler/parseXmlui.ts` | tests-ported | parser test and `event-tags` E2E | Phase 2 |
| Code-behind modules | `/Users/dotneteer/source/xmlui/xmlui/src/parsers/scripting`, `Globals.xs` docs | missing | debt entry COMP-0013 | Phase 2 |
| App config loading | `/Users/dotneteer/source/xmlui/website/content/docs/pages/xmlui-config.md` | partial local config-free runtime | debt entry COMP-0014 | Phase 2 / Phase 4 / Phase 7 |

## Data, Routing, Styling, Tooling

| Surface | Original Anchor | Rewrite Anchor | Status | Tests | Rebuild Phase |
| --- | --- | --- | --- | --- | --- |
| Theming/layout/style props | `xmlui/src/components-core/theming`, component SCSS/defaults | runtime rendering/theme and styling compiler | tests-ported | theming/layout E2E; style artifact report; embedded theme-token unit coverage | Phase 3 |
| Data operations | `DataSource`, `APICall`, `Actions` sources | `xmlui/src/runtime/data` | tests-ported | data E2E and compiler tests | Phase 4 |
| Forms | `Form`, `FormItem`, validators | missing/minimal input slices | deferred | debt entry | Phase 4 |
| Routing/app shell | `App`, `Pages`, `Page`, navigation sources | runtime routing and app-shell slice | tests-ported | routing E2E, SSG tests | Phase 4 |
| Runtime services | toast/confirm/modal/lifecycle/runtime docs and sources | `xmlui/src/runtime/services`, app root service wiring | tests-ported | runtime service unit tests; `runtimeToast` E2E; runtime artifact report | Phase 4 |
| Standalone runtime | old standalone build/startup | `xmlui/src/standalone` | tests-ported | standalone E2E | Phase 1 |
| Production build | old Vite/package build | `vite.production.config.ts`, production scripts | tests-ported | production E2E and artifact checks | Phase 1 |
| SSG/hydration | `tools/preview-ssg`, SSG docs/sources | `build:ssg`, `preview:ssg` | tests-ported | SSG E2E and artifact checks | Phase 1 |
| Metadata/docs reference | old metadata and docs scripts | `xmlui/src/metadata`, docs-reference script | tests-ported | metadata tests, artifact checks | Phase 7 |
| VS Code language support | `/tools/vscode` | `/tools/vscode` | tests-ported | VS Code tests | Phase 7 |
| Create app utility | `/tools/create-app` | missing | deferred | debt entry | Phase 7 |
| Preview SSG tool | `/tools/preview-ssg` | local preview script only | deferred | debt entry | Phase 7 |
| Playground | `/playground` | missing | deferred | debt entry | Phase 7 |
| Website | `/website` | missing | deferred | debt entry | Phase 7 |
| AI integrations | `/tools/xmlui-claude`, `/tools/xmlui-codex` | missing | deferred | debt entry | Phase 7 |
| Extension packages | `/packages/*` | `packages/xmlui-counter-badge` fixture | tests-ported | package tests/builds/E2E | Phase 6 |

## Phase 1 Command Alias Inventory

Old root command names now present in the rewrite:

| Old Command | Rewrite Command | Status | Debt |
| --- | --- | --- | --- |
| `setup` | `npm install` | implemented | |
| `build-xmlui` | `npm --workspace xmlui run build` | implemented | |
| `build-vscode-extension` | `npm --workspace xmlui-vscode run build:vsix` | implemented | |
| `build-extensions` | `xmlui-counter-badge` build + metadata fixture | partial | COMP-0009 |
| `build-docs` | `npm --workspace xmlui run build:docs-reference` | partial | COMP-0005 |
| `build-playground` | debt-backed placeholder | blocked | COMP-0006 |
| `generate-docs` | `npm --workspace xmlui run build:docs-reference` | partial | COMP-0005 |
| `test` | `npm --workspace xmlui run test` | implemented for current subset | COMP-0001 |
| `test-smoke` | `npm --workspace xmlui run test:e2e` | partial | COMP-0007 |
| `test-integration` | `node scripts/phase1-integration-smoke.mjs` | partial | COMP-0007 |

Old `xmlui` package command names now present in the rewrite:

| Old Command | Rewrite Command | Status | Debt |
| --- | --- | --- | --- |
| `build:xmlui` | `npm run build` | implemented for current subset | COMP-0002 |
| `build:xmlui-standalone` | `npm run build:standalone` | implemented for current subset | |
| `build:xmlui-metadata` | `npm run build:metadata` | implemented for current subset | |
| `test:unit` | `npm run test` | implemented for current subset | COMP-0001 |
| `check:metadata` | `npm run build:metadata` | partial | COMP-0002 |
| `generate-docs` | `npm run build:docs-reference` | partial | COMP-0005 |

## Original Component Inventory

The original component set below was checked against
`/Users/dotneteer/source/xmlui/xmlui/src/components`.

Current rewrite support is intentionally partial. Existing implemented slices
include `App`, headings, `Button`, `Text`, stacks, `Items`, basic inputs,
selection, data, routing, theming, and the extension fixture. Components not
implemented yet remain compatibility debt until their rebuild wave closes them.
Phase 5 Wave 0 added source-adjacent component module scaffolding for the
runtime-backed experimental slices, but those slices remain
`partial-centralized` until their implementation, metadata, docs, and tests are
fully transferred.

Phase 5 source-organization rule: component compatibility is transferred
through `xmlui/src/components/<ComponentName>/`, following the original
component folder's artifact categories: implementation, renderer/wrapper,
metadata, defaults/styles, docs, unit and E2E tests, fixtures, and
component-local helpers. Central runtime renderer files may register and
orchestrate components, but they are not the closure location for component
behavior. Existing partial centralized slices remain compatibility scaffolding
until they move behind per-component modules and satisfy the transferred-test
closure loop.

Use these additional Phase 5 status labels when useful:

- `partial-centralized`: behavior exists but is still implemented primarily in
  runtime scaffolding;
- `transferred-folder`: the component folder exists with old artifact inventory;
- `tests-transferred`: original tests have archival copies or direct
  source-adjacent references;
- `tests-ported`: runnable rewrite tests cover the transferred old behavior.

| Component | Old Anchor | Rewrite Status | Planned Wave |
| --- | --- | --- | --- |
| APICall | `xmlui/src/components/APICall` | partial | Phase 4 / Wave F |
| Accordion | `xmlui/src/components/Accordion` | not-started | Wave D |
| Animation | `xmlui/src/components/Animation` | not-started | Wave F |
| App | `xmlui/src/components/App` | partial | Wave A for main-content vertical stack/padding/gap layout; Wave G for app shell, routing, navigation, startup, search, page metadata, and standalone behavior |
| AppHeader | `xmlui/src/components/AppHeader` | not-started | Wave D |
| AppState | `xmlui/src/components/AppState` | not-started | Wave F |
| AutoComplete | `xmlui/src/components/AutoComplete` | not-started | Wave C |
| Avatar | `xmlui/src/components/Avatar` | not-started | Wave A |
| Badge | `xmlui/src/components/Badge` | not-started | Wave A |
| Bookmark | `xmlui/src/components/Bookmark` | not-started | Wave F |
| Br | `xmlui/src/components/Br` | not-started | Wave A |
| Button | `xmlui/src/components/Button` | partial | Wave B |
| Card | `xmlui/src/components/Card` | not-started | Wave D |
| ChangeListener | `xmlui/src/components/ChangeListener` | not-started | Wave F |
| Checkbox | `xmlui/src/components/Checkbox` | partial | Wave B |
| CodeBlock | `xmlui/src/components/CodeBlock` | not-started | Wave A |
| ColorPicker | `xmlui/src/components/ColorPicker` | implemented | Wave B |
| Column | `xmlui/src/components/Column` | not-started | Wave C |
| ConciseValidationFeedback | `xmlui/src/components/ConciseValidationFeedback` | not-started | Wave E |
| ContentSeparator | `xmlui/src/components/ContentSeparator` | not-started | Wave A |
| ContextMenu | `xmlui/src/components/ContextMenu` | not-started | Wave D |
| DataSource | `xmlui/src/components/DataSource` | partial | Phase 4 / Wave F |
| DateInput | `xmlui/src/components/DateInput` | implemented | Wave B |
| DatePicker | `xmlui/src/components/DatePicker` | implemented | Wave B |
| Drawer | `xmlui/src/components/Drawer` | not-started | Wave D |
| DropdownMenu | `xmlui/src/components/DropdownMenu` | not-started | Wave D |
| EventSource | `xmlui/src/components/EventSource` | not-started | Wave F |
| ExpandableItem | `xmlui/src/components/ExpandableItem` | not-started | Wave D |
| Fallback | `xmlui/src/components/Fallback` | not-started | Wave A |
| FileInput | `xmlui/src/components/FileInput` | not-started | Wave B |
| FileUploadDropZone | `xmlui/src/components/FileUploadDropZone` | not-started | Wave B |
| FlowLayout | `xmlui/src/components/FlowLayout` | not-started | Wave D |
| FocusScope | `xmlui/src/components/FocusScope` | not-started | Wave F |
| Footer | `xmlui/src/components/Footer` | not-started | Wave D |
| Form | `xmlui/src/components/Form` | not-started | Wave E |
| FormItem | `xmlui/src/components/FormItem` | not-started | Wave E |
| FormSegment | `xmlui/src/components/FormSegment` | not-started | Wave E |
| Fragment | `xmlui/src/components/Fragment` | not-started | Wave A |
| Heading | `xmlui/src/components/Heading` | partial | Wave A |
| HtmlTags | `xmlui/src/components/HtmlTags` | not-started | Wave A |
| I18n | `xmlui/src/components/I18n` | not-started | Wave F |
| IFrame | `xmlui/src/components/IFrame` | not-started | Wave A |
| Icon | `xmlui/src/components/Icon` | not-started | Wave A |
| Image | `xmlui/src/components/Image` | not-started | Wave A |
| IncludeMarkup | `xmlui/src/components/IncludeMarkup` | not-started | Phase 2 |
| Input | `xmlui/src/components/Input` | not-started | Wave B |
| InspectButton | `xmlui/src/components/InspectButton` | not-started | Wave F |
| Inspector | `xmlui/src/components/Inspector` | not-started | Wave F |
| Items | `xmlui/src/components/Items` | partial | Wave C |
| Lifecycle | `xmlui/src/components/Lifecycle` | not-started | Wave F |
| Link | `xmlui/src/components/Link` | not-started | Wave B |
| List | `xmlui/src/components/List` | not-started | Wave C |
| LiveRegion | `xmlui/src/components/LiveRegion` | not-started | Wave F |
| Logo | `xmlui/src/components/Logo` | not-started | Wave A |
| Markdown | `xmlui/src/components/Markdown` | not-started | Wave A |
| Menu | `xmlui/src/components/Menu` | not-started | Wave D |
| MessageListener | `xmlui/src/components/MessageListener` | not-started | Wave F |
| ModalDialog | `xmlui/src/components/ModalDialog` | not-started | Wave D |
| NavGroup | `xmlui/src/components/NavGroup` | not-started | Wave D |
| NavLink | `xmlui/src/components/NavLink` | partial | Wave G |
| NavPanel | `xmlui/src/components/NavPanel` | not-started | Wave D |
| NavPanelCollapseButton | `xmlui/src/components/NavPanelCollapseButton` | not-started | Wave D |
| NestedApp | `xmlui/src/components/NestedApp` | not-started | Wave G |
| NoResult | `xmlui/src/components/NoResult` | not-started | Wave A |
| NumberBox | `xmlui/src/components/NumberBox` | not-started | Wave B |
| Option | `xmlui/src/components/Option` | partial | Wave C |
| PageMetaTitle | `xmlui/src/components/PageMetaTitle` | not-started | Wave A |
| Pages | `xmlui/src/components/Pages` | partial | Wave G |
| Pagination | `xmlui/src/components/Pagination` | not-started | Wave C |
| Part | `xmlui/src/components/Part` | not-started | Wave F |
| ProfileMenu | `xmlui/src/components/ProfileMenu` | not-started | Wave D |
| ProgressBar | `xmlui/src/components/ProgressBar` | not-started | Wave A |
| QRCode | `xmlui/src/components/QRCode` | not-started | Wave A |
| Queue | `xmlui/src/components/Queue` | not-started | Wave F |
| RadioGroup | `xmlui/src/components/RadioGroup` | not-started | Wave C |
| RatingInput | `xmlui/src/components/RatingInput` | implemented | Wave B |
| Redirect | `xmlui/src/components/Redirect` | partial | Wave G |
| ResponsiveBar | `xmlui/src/components/ResponsiveBar` | not-started | Wave D |
| RetryPolicy | `xmlui/src/components/RetryPolicy` | not-started | Wave F |
| ScrollViewer | `xmlui/src/components/ScrollViewer` | not-started | Wave D |
| Select | `xmlui/src/components/Select` | partial | Wave C |
| SelectionStore | `xmlui/src/components/SelectionStore` | not-started | Wave C |
| SkipLink | `xmlui/src/components/SkipLink` | not-started | Wave F |
| Slider | `xmlui/src/components/Slider` | implemented | Wave B |
| Slot | `xmlui/src/components/Slot` | partial | Wave F |
| SpaceFiller | `xmlui/src/components/SpaceFiller` | not-started | Wave A |
| Spinner | `xmlui/src/components/Spinner` | not-started | Wave A |
| Splitter | `xmlui/src/components/Splitter` | not-started | Wave D |
| Stack | `xmlui/src/components/Stack` | partial | Wave D |
| Stepper | `xmlui/src/components/Stepper` | not-started | Wave D |
| StepperForm | `xmlui/src/components/StepperForm` | not-started | Wave E |
| StickyBox | `xmlui/src/components/StickyBox` | not-started | Wave D |
| StickySection | `xmlui/src/components/StickySection` | not-started | Wave D |
| Switch | `xmlui/src/components/Switch` | not-started | Wave B |
| Table | `xmlui/src/components/Table` | not-started | Wave C |
| TableOfContents | `xmlui/src/components/TableOfContents` | not-started | Wave C |
| Tabs | `xmlui/src/components/Tabs` | not-started | Wave D |
| TabsForm | `xmlui/src/components/TabsForm` | not-started | Wave E |
| Text | `xmlui/src/components/Text` | partial | Wave A |
| TextArea | `xmlui/src/components/TextArea` | not-started | Wave B |
| TextBox | `xmlui/src/components/TextBox` | partial | Wave B |
| Theme | `xmlui/src/components/Theme` | not-started | Wave F |
| TileGrid | `xmlui/src/components/TileGrid` | not-started | Wave D |
| TimeInput | `xmlui/src/components/TimeInput` | implemented | Wave B |
| Timer | `xmlui/src/components/Timer` | not-started | Wave F |
| Toast | `xmlui/src/components/Toast` | not-started | Wave F |
| Toggle | `xmlui/src/components/Toggle` | not-started | Wave B |
| ToneChangerButton | `xmlui/src/components/ToneChangerButton` | not-started | Wave F |
| ToneSwitch | `xmlui/src/components/ToneSwitch` | not-started | Wave F |
| Tooltip | `xmlui/src/components/Tooltip` | not-started | Wave D |
| Tree | `xmlui/src/components/Tree` | not-started | Wave C |
| TreeDisplay | `xmlui/src/components/TreeDisplay` | not-started | Wave C |
| ValidationSummary | `xmlui/src/components/ValidationSummary` | not-started | Wave E |
| WebSocket | `xmlui/src/components/WebSocket` | not-started | Wave F |

## Maintenance Rule

Whenever a surface moves forward, update this inventory and add or close the
matching entry in `.ai/compatibility-debt.md`.

For component work, create a closure note from
`.ai/component-compatibility-closure-template.md` before marking a component
`parity-tested` or `closed`.

For verification, use `.ai/verification-command-matrix.md` to decide which
commands must pass for the surface being changed.
