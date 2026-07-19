# Inline Component Definitions in Main.xmlui

## Goal

Allow the entrypoint markup (`Main.xmlui`, and equivalent nested/playground app source strings) to contain zero, one, or many top-level `<Component>` definitions together with the main app markup in the same source string or file.

Rules:

- Top-level `<Component>` elements in an entrypoint source declare user-defined components.
- All other top-level elements are considered the main app.
- If the entrypoint has no non-`Component` top-level element, render an empty app as if the source contained only `<Fragment />`, and log a warning with browser warning severity.
- If the entrypoint has multiple top-level non-`Component` elements, report an error.
- Do not allow this mixed-file feature in component files under `components/`; component files remain a single reusable component definition.
- Do not change the internal app representation consumed by rendering: entrypoint remains `ComponentDef`, reusable components remain `CompoundComponentDef[]`.
- `xmlui-pg` Markdown playground fences should accept the same inline entrypoint format.
- When an inline component and a component file define the same component name, the component file wins.
- Inline `<Component codeBehind="...">` is supported and resolves relative to the entrypoint file (`Main.xmlui`).
- No alternate entrypoint filename is supported; `Main.xmlui` is the entrypoint.
- `IncludeMarkup` should continue to work as it does now; do not broaden its parsing mode as part of this feature.

## Current Shape

- `xmlui/src/parsers/xmlui-parser/parser.ts`
  - `parseXmlUiMarkup(text)` always validates a single root via `validateSingleRootElement`.
  - The root AST is a `ContentListNode` whose children are top-level nodes plus EOF.
  - `<Component>` validation is syntactic only; it does not know whether the file is an entrypoint or a component file.
- `xmlui/src/parsers/xmlui-parser/transform.ts`
  - `nodeToComponentDef()` transforms only `node.children![0]`.
  - Top-level `<Component>` becomes `CompoundComponentDef`; any other top-level element becomes `ComponentDef`.
  - Compound bodies already use `Fragment` when they contain multiple nested components or local variables.
- `xmlui/src/components-core/xmlui-parser.ts`
  - `xmlUiMarkupToComponent()` is the common public parse helper used by Vite, standalone, nested apps, tests, LSP diagnostics, analyzer, and utilities.
  - Return shape has only one `component`, so it cannot currently return both the entrypoint and inline component definitions.
- `xmlui/src/abstractions/scripting/Compilation.ts`
  - `EntrypointCompilation.definition` is `ComponentDef`.
  - `ComponentCompilation.definition` is `CompoundComponentDef`.
  - This type split is good; keep it.
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
  - Transforms every `.xmlui` file the same way.
  - Later `StandaloneApp.tsx` decides whether a compiled module is an entrypoint (`Main` or `App`) or component file (`components` folder).
  - Analyzer, reactive-cycle, a11y, and type-contract passes unwrap compound components locally.
- `xmlui/src/components-core/StandaloneApp.tsx`
  - Runtime fetching parses `Main.xmlui` via `parseComponentMarkupResponse()` and parses component files with the same helper.
  - The Vite-mode assembly code merges compiled entrypoint and component modules after import glob collection.
- `xmlui/src/components/Markdown/utils.ts`
  - `parsePlaygroundPattern()` parses `xmlui-pg` into an app segment and optional `---comp` segments using text splitting.
  - `convertPlaygroundPatternToMarkdown()` serializes `pgContent.app` and `pgContent.components`.
- `xmlui/src/components/NestedApp/NestedAppReact.tsx`
  - Parses `app` as the playground entrypoint and each `components[]` item as a component file.
  - Builds `ProjectCompilation` from that split.
- `xmlui/src/language-server/base/text-document.ts`
  - `document.parse()` calls `createXmlUiParser()` with no file role.
- `xmlui/src/language-server/services/diagnostic.ts`
  - Uses both low-level parse diagnostics and repeated `xmlUiMarkupToComponent()` calls for analyzer, cycles, a11y, types, versioning.
- `xmlui/src/language-server/services/definition.ts`
  - Go-to-definition finds component files by name; it has no concept of inline top-level component definitions in `Main.xmlui`.
- `xmlui/src/components-core/analyzer/walker.ts`
  - Parses each source independently and unwraps a `CompoundComponentDef` if needed.
- `xmlui/src/nodejs/discoverRoutes.ts`
  - Parses `Main.xmlui` to find `Pages`, then scans all `*.xmlui` files as fallback.
- Parser tests live in `xmlui/tests/parsers/xmlui/`.
- Component-core parse tests live in `xmlui/tests/components-core/xmluiMarkupToComponent.test.ts`.
- Markdown playground tests live in `xmlui/src/components/Markdown/Markdown.spec.ts`.

## Design

Introduce explicit parse roles:

```ts
type XmluiFileRole = "entrypoint" | "component";
```

Add a higher-level entrypoint splitter/transformer while keeping the existing internal representation:

```ts
type EntryPointParseResult = {
  entrypoint: ComponentDef | null;
  inlineComponents: CompoundComponentDef[];
};
```

Recommended parsing contract:

- Low-level scanner/parser still produces a `ContentListNode`.
- Single-root validation becomes role-aware:
  - `component`: current strict behavior.
  - `entrypoint`: allow multiple top-level `<Component>` elements and zero or one top-level app element.
- Transformation becomes role-aware:
  - `component`: require exactly one top-level `<Component>` and return `CompoundComponentDef`.
  - `entrypoint`: collect top-level `<Component>` elements into `inlineComponents`; transform the single non-`Component` app node directly; when no app node exists, synthesize an empty `Fragment` and log a warning.
- Main app `global.*` and `<global>` declarations remain allowed only on the transformed app root. Top-level `<Component>` declarations must keep existing global-in-component errors.
- Namespace handling on generated empty fragments is trivial; still verify namespaced inline components and namespaced app roots continue to parse normally.
- Existing `nodeToComponentDef()` can be preserved for compatibility and delegated through a new role-aware wrapper to minimize blast radius.

## Step Plan

### 1. Parser Role and Top-Level Classification - Completed

Files:

- `xmlui/src/parsers/xmlui-parser/parser.ts`
- `xmlui/src/parsers/xmlui-parser/diagnostics.ts`
- `xmlui/tests/parsers/xmlui/parser.test.ts`

Tasks:

- Add parser options to `createXmlUiParser()` and `parseXmlUiMarkup()`, with default role preserving current behavior.
- Replace unconditional `validateSingleRootElement()` with role-aware validation.
- For `entrypoint`, ignore whitespace/text/comment trivia, allow zero or more top-level `<Component>` elements and zero or one app element, and flag multiple top-level non-`Component` app elements.
- Keep `component` behavior strict: multiple top-level elements still emit `U035`.
- Add tests:
  - Entry point accepts `<Component name="X">...</Component><App />`.
  - Entry point accepts `<App /><Component name="X">...</Component>`.
  - Entry point accepts only `<Component>` declarations and does not emit a parser error.
  - Entry point rejects multiple non-`Component` app roots.
  - Component role still rejects multiple top-level roots.
  - Component role still rejects a `Component` plus app root in one file.

Verification:

```bash
npx vitest run xmlui/tests/parsers/xmlui/parser.test.ts
```

### 2. Role-Aware Transform Without Representation Changes - Completed

Files:

- `xmlui/src/parsers/xmlui-parser/transform.ts`
- `xmlui/src/components-core/xmlui-parser.ts`
- `xmlui/tests/parsers/xmlui/transform.element.test.ts`
- `xmlui/tests/components-core/xmluiMarkupToComponent.test.ts`

Tasks:

- Add a role-aware transform API, for example `nodeToXmluiAppParts()`.
- For entrypoints, transform top-level `<Component>` nodes with existing `collectCompoundComponent()` logic.
- For entrypoints, transform app nodes into:
  - the single app `ComponentDef`, or
  - a generated empty `Fragment` when there is no app node.
- Surface multiple non-`Component` app roots as an error before transform proceeds.
- Preserve source locations as much as possible. Generated empty `Fragment` can use a synthetic debug marker.
- Keep old `nodeToComponentDef()` behavior for existing direct callers, or update callers deliberately.
- Extend `ParserResult` with `inlineComponents?: CompoundComponentDef[]` while preserving `component` for the entrypoint.
- Ensure `computeUsesForTree()` runs for the entrypoint root and for each inline component body.
- Add a console warning hook or warning collection path so all-component entrypoints emit the required browser warning without making Node/test output noisy.
- Add tests:
  - Entry source with app plus inline component returns `component.type === "App"` and `inlineComponents[0].name`.
  - Entry source with only inline components returns `component.type === "Fragment"` with no children and records/logs a warning.
  - Entry source with two app roots returns an error.
  - Inline component with invalid component attrs still reports existing parser/transform errors.
  - Component role returns only one `CompoundComponentDef`.

Verification:

```bash
npx vitest run xmlui/tests/parsers/xmlui/transform.element.test.ts
npx vitest run xmlui/tests/components-core/xmluiMarkupToComponent.test.ts
```

Optional manual tests:

- In a tiny local app, put only top-level `<Component>` declarations in `Main.xmlui`; confirm the rendered page is empty, not broken, and the browser console shows the intended warning once.
- Add one valid inline component and one app root that uses it; inspect the runtime with XMLUI Inspector/devtools and confirm the app root is still a normal `ComponentDef` and the inline component appears as a reusable component, not as a child of the app root.
- Add two non-`Component` top-level app roots and confirm the error points to the second app root clearly enough for an app author to fix it.

### 3. Vite Mode Compilation - Completed

Files:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/components-core/StandaloneApp.tsx`
- `xmlui/src/abstractions/scripting/Compilation.ts`
- `xmlui/tests/bin/vite-plugin-import.test.ts`

Tasks:

- In the Vite plugin, determine role from normalized file path:
  - files matching `Main.xmlui` outside `components/` use `entrypoint`.
  - files under `components/` use `component`.
  - other `.xmlui` files should preserve current behavior unless already treated as app entrypoints by templates/config.
- Include `inlineComponents` in the module payload for entrypoint files.
- In Vite-mode `StandaloneApp.tsx` assembly, append inline components from the entrypoint module to `projectCompilation.components` and `componentsByFileName`.
- Use stable synthetic filenames such as `${entrypointKey}#components/${Name}.xmlui` or `/__inline__/Name.xmlui` for inspector/project compilation source tracking.
- Enforce duplicate-name precedence: explicit `components/Name.xmlui` wins over inline `Name`; emit a warning for duplicate names.
- Keep `Main.xmlui.xs` attached to the app root.
- Resolve inline `<Component codeBehind="...">` relative to the entrypoint file (`Main.xmlui`) and attach it to that inline component's body.
- Update analyzer/reactive/a11y/type-contract build passes so they run over entrypoint root and inline component bodies.
- Serialize Vite transform warnings into entrypoint modules and emit them with `console.warn` when the compiled module is evaluated in the browser.

Verification:

```bash
npx vitest run xmlui/tests/bin/vite-plugin-import.test.ts
npx tsc --noEmit -p xmlui/tsconfig.json
```

Optional manual tests:

- Run a Vite-mode starter/docs app with an inline component in `src/Main.xmlui`; confirm initial render, refresh, and HMR edits to both the app markup and the inline component update correctly.
- Add `src/components/Dupe.xmlui` and an inline `<Component name="Dupe">` in `Main.xmlui`; confirm the file-backed component renders and a duplicate-name warning is visible.
- Add inline `<Component name="WithCodeBehind" codeBehind="WithCodeBehind.xs">` plus a same-folder code-behind file; confirm the method/vars from that code-behind are available to the inline component.
- Open XMLUI Inspector/devtools and confirm synthetic inline component filenames are readable enough for debugging.
- Use an entrypoint containing only inline `<Component>` definitions; confirm both the host terminal and browser console show the empty-Fragment warning.

### 4. Standalone Buildless Runtime - Completed

Files:

- `xmlui/src/components-core/StandaloneApp.tsx`
- `xmlui/tests/components-core/standalone-import-resolution.test.ts`

Tasks:

- Parse fetched `Main.xmlui` with role `entrypoint`.
- Add `inlineComponents` from `Main.xmlui` to the component registry assembly before missing-component discovery.
- Record inline component synthetic sources in `sources` and `projectCompilation.components`.
- Keep component file fetching strict by parsing fetched `components/*.xmlui` with role `component`.
- Ensure `collectMissingComponents()` sees inline components as already contributed.
- Add tests for standalone missing-component resolution:
  - `<MyInline />` defined by a top-level `<Component name="MyInline">` in `Main.xmlui` does not trigger a fetch of `components/MyInline.xmlui`.
  - A referenced component not declared inline still fetches from `components/`.
  - `components/MyInline.xmlui` wins over an inline `<Component name="MyInline">`.
  - Inline `<Component codeBehind="...">` fetches the code-behind path relative to the entrypoint file.

Verification:

```bash
npx vitest run xmlui/tests/components-core/standalone-import-resolution.test.ts
```

Optional manual tests:

- Serve a buildless app statically with `Main.xmlui` containing an inline component; confirm the runtime renders it, and note that buildless mode may probe `components/<InlineName>.xmlui` so an existing component file can take precedence.
- Add both an inline component and `components/<SameName>.xmlui`; confirm the component file wins and the warning is shown.
- Add an inline component with `codeBehind` resolved beside `Main.xmlui`; confirm the browser fetches the expected URL and the component behavior uses the code-behind declarations.
- Add a missing component reference unrelated to inline components; confirm the runtime still requests `components/<Missing>.xmlui` and reports the same style of error as today.

### 5. Markdown `xmlui-pg` and NestedApp - Completed

Files:

- `xmlui/src/components/Markdown/utils.ts`
- `xmlui/src/components/NestedApp/NestedAppReact.tsx`
- `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`
- `xmlui/src/components/Markdown/Markdown.spec.ts`

Tasks:

- Let `NestedAppReact` parse `app` with role `entrypoint`.
- Merge returned `inlineComponents` into the existing `components` array before rendering.
- Preserve the source shown/copied by `AppWithCodeViewReact`: the app code block should remain the original single-string entrypoint source.
- In `convertPlaygroundPatternToMarkdown()`, no textual splitting is strictly required if `NestedAppReact` handles inline components. Only update it if pop-out export needs explicit `components` population.
- Update playground pop-out export in `AppWithCodeViewReact` so inline components are available to the remote playground. Prefer exporting the original combined app string if the playground understands the new entrypoint format; otherwise split only for export while leaving display/copy source unchanged.
- Add Markdown E2E tests:
  - `xmlui-pg` with inline `<Component name="HelloButton">...</Component>` and app usage renders.
  - `xmlui-pg` with zero inline components still works.
  - `xmlui-pg` with only inline `<Component>` declarations renders an empty app and emits the warning.
  - `xmlui-pg` with multiple non-`Component` app roots renders a parse error.
  - `xmlui-pg` with `---comp` segments plus inline components works.
  - Component-file-like invalid inline component errors render in the playground.

Verification:

```bash
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts --reporter=line
```

Optional manual tests:

- Open a docs page containing an `xmlui-pg` fence with an inline component; confirm the rendered playground works, the code tab/source display still shows the combined single-string app, and copy output is unchanged.
- Try an `xmlui-pg` fence with only inline components; confirm the playground frame is empty and the warning appears in the browser console without an ugly in-frame error.
- Try an `xmlui-pg` fence with two app roots; confirm the in-frame parse error is readable and points to the extra app root.
- Use an `xmlui-pg` fence with both inline components and `---comp` segments; confirm both kinds of components can be referenced.
- Use the pop-out button from the docs page; confirm the external playground receives enough data to render the same inline-component example.

### 6. Language Server and VS Code Extension Readiness - Completed

Files:

- `xmlui/src/language-server/base/text-document.ts`
- `xmlui/src/language-server/services/diagnostic.ts`
- `xmlui/src/language-server/services/definition.ts`
- `xmlui/src/language-server/services/completion.ts`
- `xmlui/src/language-server/services/hover.ts`
- `tools/vscode/src/extension.ts`
- `tools/vscode/src/server.ts`

Tasks:

- Add a document-role helper, probably based on URI/path:
  - `Main.xmlui` outside `components/` => `entrypoint`.
  - files under `/components/` => `component`.
  - unknown/untitled documents default to current strict behavior unless VS Code can infer they are app snippets.
- Make `TextDocument.parse()` pass the inferred role.
- Make all diagnostic reparses pass the same role. Avoid parser diagnostics accepting inline components while analyzer/type/a11y reparses reject them.
- Update analyzer calls to either receive the role or pre-parsed app parts.
- Prepare go-to-definition:
  - If the referenced component name is declared by a top-level inline `<Component name="X">` in the same entrypoint document, return that location.
  - Otherwise keep the existing component-file lookup.
- Completion and hover should continue to work for regular tags and attributes. Add tests or manual QA for top-level `<Component>` blocks in `Main.xmlui`.
- No VS Code extension UI changes are expected; extension process wiring should only need the updated language-server bundle.

Verification:

```bash
npx vitest run xmlui/tests/language-server/services/diagnostic.inline-entrypoint.test.ts xmlui/tests/language-server/services/definition.test.ts
npm --prefix tools/vscode run build
npx tsc --noEmit -p xmlui/tsconfig.json
```

Note: `tools/vscode` has no `compile` script. `npm --prefix tools/vscode run type-check`
currently fails because that package's TypeScript config type-checks linked `xmlui/src`
without DOM/JSX settings; the production esbuild path succeeds.

Optional manual tests:

- In VS Code, open `Main.xmlui` with top-level inline components and one app root; confirm no single-root diagnostic is shown.
- Add two non-`Component` top-level roots in `Main.xmlui`; confirm a diagnostic appears on the extra root.
- Open `components/Foo.xmlui` with a top-level `<Component>` plus app markup; confirm the strict component-file diagnostic still appears.
- Use completion and hover inside the inline `<Component>` body and inside the app root; confirm component and attribute metadata still appears.
- Use go-to-definition from `<MyInline />` in the app root; confirm it jumps to the inline `<Component name="MyInline">` declaration. Then add `components/MyInline.xmlui` and confirm file-backed precedence is reflected.

### 7. Secondary Tooling and Audits - Completed

Files:

- `xmlui/src/nodejs/discoverRoutes.ts`
- `xmlui/src/components-core/analyzer/walker.ts`
- `xmlui/src/components-core/utils/compound-utils.ts`
- `xmlui/scripts/cli/udc-declare.ts`
- `xmlui/scripts/cli/udc-audit.ts`
- `xmlui/scripts/check-example-tests.mjs`
- `xmlui/scripts/generate-docs/*`

Tasks:

- Update `discoverRoutes()` to parse `Main.xmlui` as an entrypoint and component files as components.
- Do not treat alternate app filenames as entrypoint synonyms; `Main.xmlui` is the only entrypoint filename.
- Update analyzer walker to use role-aware parsing or accept parsed app parts from callers.
- Keep `compoundComponentDefFromSource()` strict component-only.
- Keep UDC CLI tools strict component-only unless they explicitly operate on `Main.xmlui`.
- Keep `IncludeMarkup` behavior unchanged; it should continue using the current strict parsing behavior unless a future feature explicitly changes it.
- Confirm docs/example-test scripts do not parse `xmlui-pg` bodies as component files.
- Keep documentation changes deferred to Step 8, where the changeset and public-facing examples are handled together.

Verification:

```bash
npx vitest run xmlui/tests/nodejs/discoverRoutes.test.ts xmlui/tests/components-core/analyzer/walker.test.ts
npx tsc --noEmit -p xmlui/tsconfig.json
npm --prefix xmlui run test:unit -- tests/components-core
```

Note: running `npx vitest run xmlui/tests/components-core` from the monorepo root does
not pick up `xmlui/vitest.config.ts`, so DOM-based tests fail with missing
`window`/`document`. Use the package script above for this suite.

Optional manual tests:

- Run the project route discovery/preview flow on an app whose `Pages` tree uses an inline component; confirm discovered routes match the equivalent separate-file app.
- Run the docs/example-test checker on docs containing the new `xmlui-pg` inline-component example; confirm it does not treat inline component declarations as separate component-file examples.
- Use `IncludeMarkup` with existing valid single-root markup and with intentionally invalid mixed entrypoint markup; confirm behavior matches the pre-feature strict path.
- Run or inspect UDC audit/declaration CLI behavior on component files to confirm it still assumes component-only files.

### 8. Release and Compatibility - Completed

Files:

- `.changeset/*.md`
- `.ai/xmlui/markup.md`
- public docs page for XMLUI markup or playground code fences

Tasks:

- Add a patch changeset because this is user-facing parser/tooling behavior.
- Document the feature with examples:
  - Main app only.
  - Main app plus one inline component.
  - Main app plus multiple inline components.
  - Only inline components, producing an empty `Fragment` plus a console warning.
  - Multiple top-level app roots as an error.
  - Component files remain strict and cannot combine app markup with definitions.
- Include one `xmlui-pg` example that uses an inline component.

Final verification:

```bash
npx changeset status
npm --prefix xmlui run check:example-tests
npx tsc --noEmit -p xmlui/tsconfig.json
npm run test:unit -w xmlui
npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts --workers=10
```

Results:

- `npx changeset status` passed and reported a patch bump for `xmlui` and dependent workspace packages.
- `npm --prefix xmlui run check:example-tests` now passes after resolving the pre-existing docs/example-test drift. The checker reports 206 scanned files, 206 OK, 0 missing specs, 0 stale specs, and 0 unnamed examples.
- `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- `npx playwright test xmlui/tests-e2e/pages/playground-and-codefence.spec.ts --workers=1` passed with 2 tests.
- `npx playwright test xmlui/tests-e2e/how-to-examples/keep-a-small-app-in-one-file.spec.ts --workers=1` passed with 2 tests after adding the new how-to article for single-file small apps.
- `PLAYWRIGHT_USE_DEV_SERVER=false xargs npx playwright test --workers=10 --reporter=line < /tmp/xmlui-affected-specs.txt` passed with 107 affected website tests when run with sandbox escalation so the static testbed server could bind to port 3211.
- `npm run test:unit -w xmlui` passed with 240 files, 10463 passed, 2 skipped, and 1 todo.
- `npx playwright test xmlui/src/components/Markdown/Markdown.spec.ts --workers=10` passed with 59 tests.

Do not run the full E2E suite without explicit user confirmation.

Optional manual tests:

- Read the new docs examples in the generated/local docs site and confirm the wording makes the component-file restriction, duplicate precedence, empty-app warning, and multiple-root error obvious.
- Create a tiny app using the documented examples and confirm each example can be copied into `Main.xmlui` without hidden setup.
- Smoke-test an existing app that uses only separate component files to confirm there is no behavioral or diagnostic change.

## Session Notes for Future AI Work

- `xmlui/scripts/check-example-tests.mjs` does not scan generated component reference docs under `xmlui/src/components/**`. It scans hand-authored website docs under `website/content/docs/pages/**` and maps named `xmlui-pg` fences to specs under `xmlui/tests-e2e/pages/**` or `xmlui/tests-e2e/how-to-examples/**`.
- A named public docs example for this feature now lives in `website/content/docs/pages/playground-and-codefence.md` with `name="Inline component in playground"`. Its matching website spec is `xmlui/tests-e2e/pages/playground-and-codefence.spec.ts`.
- A task-oriented how-to article now lives in `website/content/docs/pages/howto/keep-a-small-app-in-one-file.md` with the named/id'd example `small-task-tracker-in-one-file`. It is linked from the User-Defined Components how-to nav in `website/src/Main.xmlui`, and its matching website spec is `xmlui/tests-e2e/how-to-examples/keep-a-small-app-in-one-file.spec.ts`.
- Follow-up docs edits were applied to `user-defined-components.md`, `app-structure.md`, `markup.md`, `scoping.md`, `scripting.md`, `components-intro.md`, `howto/create-a-reusable-component.md`, `vscode.md`, and `playground-and-codefence.md`. These clarify where inline components can be declared, entry-file-only parsing rules, component boundary scoping, code-behind path resolution, VS Code support, and links to the one-file how-to.
- A later docs refinement made the ordering rule explicit: in `Main.xmlui` and `xmlui-pg` entrypoint app blocks, the main app root and top-level `<Component>` declarations can appear in any order. Documentation examples should choose app-first or component-first ordering according to the page focus.
- When converting docs examples from segmented `xmlui-pg` form (`---app`, `---comp`) to single-file inline-component form, move section-level fence options to the opening `xmlui-pg` line. This includes `display`, `copy`, and highlight selectors such as `/line/`; leaving them on removed `---app` or `---comp` lines removes source display and highlighting from the rendered docs page.
- All docs `xmlui-pg` fences should have a human-readable `name="..."` title. Do not use `name` as the durable website-test identity for newly touched examples; keep/add `id="..."` for examples that should be covered by `test.describe(...)`. The example-test checker treats `id` as stable test identity and accepts existing name-based specs only for backward compatibility.
- Marker-free `xmlui-pg` examples can be combined with later `---api`, `---config`, `---comp`, or `---desc` sections. The text before the first section marker is still the app entrypoint content. Keep `parsePlaygroundPattern()` and `extractXmluiExample()` aligned on this rule; otherwise `NestedApp` may receive `undefined` or website specs may parse inline `<Component>` declarations in component mode.
- The `Markdown` component reference page `xmlui/src/components/Markdown/Markdown.md` also documents the feature, but changes there do not affect `check:example-tests`.
- `check:example-tests` originally failed because of unrelated pre-existing docs drift: 11 missing spec files and 27 stale spec files. That drift has now been resolved by adding the missing website specs and updating stale `test.describe` titles to match the current docs examples.
- `xmlui/scripts/check-example-tests.mjs` was updated so `extractDescribeNames()` correctly handles `test.describe` titles containing a different quote character, for example the apostrophe in `Passing arguments to a component's methods`.
- `extractXmluiExample()` returns a single `app` string for marker-free `xmlui-pg` fences. For inline-entrypoint examples, `initTestBed()` must parse that string with `{ role: "entrypoint" }` and without wrapping it in a test `Fragment`, otherwise top-level `<Component>` declarations are treated as rendered markup and fail as unknown components.
- `xmlui/src/testing/fixtures.ts` now supports `TestBedDescription.parserOptions` and merges parser-returned `inlineComponents` into the test app components when no explicit `description.components` are supplied. Use `noFragmentWrapper: true` plus `parserOptions: { role: "entrypoint" }` for one-string entrypoint examples.
- The useful focused verification for this docs/example-test integration is:

```bash
npx playwright test xmlui/tests-e2e/pages/playground-and-codefence.spec.ts --workers=1
npm --prefix xmlui run check:example-tests
npx tsc --noEmit -p xmlui/tsconfig.json
```
