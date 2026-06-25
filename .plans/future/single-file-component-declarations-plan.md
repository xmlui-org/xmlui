# Future Plan: Single-File Component Declarations

Status: proposed future work

## Purpose

Allow one XMLUI file, especially `Main.xmlui`, to contain both the primary
rendered root and user-defined component declarations referenced by that root.

Primary motivation: AI code generation. Small apps should be generatable as one
self-contained `.xmlui` file instead of requiring a multi-file project layout for
every custom component.

Example target syntax:

```xml
<App var.count="{0}">
  <CounterPanel label="Clicks" />
</App>

<Component name="CounterPanel" var.localCount="{0}">
  <VStack>
    <Text>{$props.label}: {localCount}</Text>
    <Button onClick="localCount++">Increment local</Button>
  </VStack>
</Component>
```

## Scope

Support multiple top-level XMLUI declarations in one source file:

- zero or one top-level primary/root declaration, which may be any XMLUI
  component except `<Component>`;
- zero or more top-level `<Component name="...">...</Component>` declarations;
- primary/root and component declarations may appear in any top-level order;
- local components are referenced from the primary/root declaration and from
  other local components by their declared `name`;
- local declarations use the same semantics as existing separate `.xmlui`
  component files;
- component-only files are allowed;
- sibling component files remain supported and continue to work;
- source spans, source maps, diagnostics, and runtime debug metadata continue to
  point at the single original source file.

Non-goals:

- Do not add import/export syntax.
- Do not support multiple top-level non-`Component` primary/root declarations.
- Do not support anonymous top-level components.
- Do not change user-defined component scoping, slots, events, methods, or
  `$props` semantics.
- Do not make nested `<Component>` declarations inside `<App>` or inside another
  `<Component>` special. This feature is top-level only.

## Compatibility Baseline

Current rewrite implementation points:

- `xmlui/src/parser/markup/parser.ts` currently reports multiple top-level
  elements as a single-root document error.
- `xmlui/src/compiler/parseXmlui.ts` currently picks the first root element and
  returns either one rendered document or one component document.
- `xmlui/src/compiler/compileXmluiSource.ts` builds IR for one document.
- `xmlui/src/compiler/compileXmluiModule.ts` discovers sibling `.xmlui`
  component files, imports them, and passes imported modules into
  `createXmluiModule`.
- `xmlui/src/compiler/codegen/module.ts` emits one runtime document plus an
  imported component array.
- `xmlui/src/runtime/index.tsx` already accepts a rendered document plus
  component modules through `createXmluiModule(document, components)`.
- `xmlui/src/standalone/loader.ts` already creates component modules from
  multiple component documents.

Original XMLUI source to re-check before implementation:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/xmlui-parser.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/parser.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/transform.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/user-defined-components.md`
- `/Users/dotneteer/source/xmlui/integration-tests/tests/integration.spec.ts`

## Design

Represent a parsed source file as a bundle of top-level declarations, then lower
each declaration through the existing app/component pipeline.

Add a new internal shape:

```ts
type XmluiSourceBundle = {
  kind: "bundle";
  sourceId: string;
  root?: XmluiDocument & { kind: "app" };
  components: Array<XmluiDocument & { kind: "component" }>;
};
```

Keep the existing public `parseXmlui` behavior for single-document callers if
possible, and add a new API such as `parseXmluiBundle` for multi-declaration
files. If keeping one parser API is simpler, let `parseXmlui` return a bundle
and update all callers deliberately.

Compilation should:

- parse all top-level declarations;
- validate that there is at most one primary/root declaration for app entry
  files;
- extract local component names before validating references;
- compile the primary/root declaration and each local component into normal
  runtime documents;
- pass local component modules before or along with sibling imported component
  modules to `createXmluiModule`.

Runtime should not need new component semantics. It should receive local
component documents as ordinary component modules.

## Name Resolution Rules

- Local top-level component declarations are known components for the
  primary/root declaration and for all local components in the same file.
- Local component names must be unique within the file.
- A local component name conflicting with an extension component should produce a
  clear diagnostic unless existing XMLUI compatibility requires local shadowing.
  Prefer explicit diagnostic for now.
- A local component name conflicting with a sibling component file should produce
  a compiler warning. The local component declaration overrides the sibling file.
- A top-level `<Component name="Button">` or any built-in component name should
  be rejected unless the existing framework intentionally allows overriding
  built-ins. Prefer rejecting to protect generated apps from surprising shadowing.
- Component declarations may reference components declared later in the same
  file.
- Components may reference each other recursively only if existing runtime
  behavior safely supports it. Otherwise detect direct self-recursion and simple
  cycles as future hardening.

## Planned Code Modifications

1. Parser top-level behavior.
   - Update `xmlui/src/parser/markup/parser.ts` so scanner/CST parsing can return
     multiple top-level `Element` nodes without treating the CST as invalid.
   - Move the "single root element" rule out of the low-level markup parser and
     into XMLUI document/bundle validation.
   - Preserve an error for stray top-level text that is not whitespace/comment.
   - Keep trivia on top-level declarations for LSP and formatting.

2. XMLUI transform APIs.
   - Add `parseXmluiBundle(source, options)` in `xmlui/src/compiler/parseXmlui.ts`.
   - Implement declaration extraction from the top-level `ContentList`.
   - Transform the single top-level non-`Component` declaration into the bundle
     primary/root document. This root may be `<App>`, `<Fragment>`, `<Stack>`,
     `<Text>`, or any other non-`Component` component accepted as an XMLUI root.
   - Transform top-level `<Component name="...">` by reusing the existing
     `stripInternalRoot` path.
   - Reject a second non-`Component` top-level element with a diagnostic like:
     `Only one top-level rendered root declaration is allowed.`
   - Reject missing component names with the existing `<Component> requires a
     name attribute.` diagnostic.
   - Analyze scripts separately for each document:
     - primary/root: `allowImplicitGlobals: false`;
     - components: `allowImplicitGlobals: true`, matching current component-file
       behavior.

3. Compiler source API.
   - Add `compileXmluiSourceBundle` or extend `compileXmluiSource` to expose:
     - the primary/root document, when present;
     - local component documents;
     - primary/root compiler IR, when present;
     - local component compiler IRs;
     - combined referenced component list;
     - combined diagnostics.
   - Preserve `compileXmluiSource` for callers that compile one component file.
   - Build the known component set from:
     - local component declarations;
     - sibling component imports;
     - extension component contracts;
     - current component name when compiling a standalone component file.

4. IR/codegen.
   - Extend `CompiledXmluiSource` or add a bundle-specific result containing
     `rootIr` and `localComponentIrs`.
   - Update `xmlui/src/compiler/codegen/module.ts` to emit local component
     documents as in-module constants:
     - `const localComponent_CounterPanel = createXmluiModule({...});`
     - pass them in `createXmluiModule(rootDocument, [localComponent_CounterPanel,
       ...importedComponents])`.
   - Reuse `emitRuntimeDocumentFromIr` for local components so generated
     expression/event functions, methods, slots, and source maps stay consistent.
   - Include local component IRs in source-map mapping collection, not only the
     primary/root declaration.
   - Ensure shared yield helper emission considers event handlers in both the
     primary/root declaration and local component declarations.

5. Module compilation.
   - Update `xmlui/src/compiler/compileXmluiModule.ts`:
     - first pass parses the bundle and collects local component names;
     - sibling component imports are still discovered;
     - known components include local and sibling names;
     - duplicate local/sibling names produce warnings before emitting imports;
     - local components are registered ahead of sibling imports so they override
       sibling components with the same name;
     - generated module includes local component constants and sibling imports.
   - Keep separate `.xmlui` component-file compilation working unchanged.

6. Runtime and standalone loader.
   - Prefer no runtime changes if codegen emits local declarations as normal
     component modules.
   - Update `xmlui/src/standalone/loader.ts` if it parses raw source directly,
     so a standalone `Main.xmlui` bundle can load without separate component
     files.
   - Ensure production build, standalone mode, Vite plugin mode, and SSG all use
     the same bundle-aware compiler path.

7. Docs and examples.
   - Add `xmlui/src/examples/single-file-components/Main.xmlui`.
   - Document the pattern in user-defined component docs after implementation.
   - Include AI-friendly guidance: put top-level component declarations first,
     then the primary/root declaration. The compiler should support either order.
     Keep small generated apps in one file, and split into files only when
     components become reusable or large.

## Diagnostics

Add or reuse diagnostics for:

- no primary/root declaration in an app entry file should not fail compilation if
  the file is component-only; when such a file is used as the main app file,
  display a console warning that no top-level rendered root is used;
- multiple top-level non-`Component` declarations;
- top-level component missing `name`;
- duplicate local component name;
- local component name conflicts with sibling component file; warning only, local
  declaration overrides sibling file;
- local component name conflicts with built-in or extension component;
- unknown component still reports the same existing unknown-component diagnostic
  when not found in local, sibling, extension, or built-in registries;
- malformed top-level declaration preserves parser recovery and reports the
  nearest useful source span.

## Unit Test Titles

Parser and transform tests:

- `parseMarkup allows rendered root followed by top-level Component declarations without single-root CST diagnostic`
- `parseXmluiBundle extracts one rendered root and one following Component declaration from Main.xmlui`
- `parseXmluiBundle extracts Component declarations before rendered root when declarations appear first`
- `parseXmluiBundle accepts Fragment, Stack, Text, or App as the top-level rendered root`
- `parseXmluiBundle accepts component-only files without a rendered root`
- `parseXmluiBundle rejects multiple top-level rendered root declarations`
- `parseXmluiBundle rejects top-level Component without name`
- `parseXmluiBundle reports duplicate local Component names with both source locations`
- `parseXmluiBundle preserves source ranges for rendered root and local component declarations in the same file`
- `parseXmluiBundle analyzes rendered root globals with root rules and component globals with component rules`

Compiler/codegen tests:

- `compileXmluiModule emits a local component module constant for a Component declared in Main.xmlui`
- `compileXmluiModule registers local component declarations before sibling component imports`
- `compileXmluiModule validates references to local components declared after the rendered root`
- `compileXmluiModule validates references from one local component to another local component`
- `compileXmluiModule warns when local component names conflict with sibling component files and local wins`
- `compileXmluiModule warns when a component-only file is used as the main app file`
- `compileXmluiModule source map includes generated bindings from local component declarations`
- `compileXmluiModule shared yield helper is emitted when only a local component has async handlers`
- `compileXmluiModule preserves separate component-file entry compilation`
- `compileXmluiSource reports referenced components excluding components declared locally`

Runtime/component tests:

- `single-file local component renders from the primary/root declaration without a sibling import`
- `single-file local component receives props through $props`
- `single-file local component maintains private local state independently per instance`
- `single-file local component renders projected default children in caller scope`
- `single-file local component named template slot receives slot context and updates parent state`
- `single-file local component emits custom events handled by the primary/root declaration`
- `single-file local component exposes methods callable through an id reference from the primary/root declaration`

## E2E Test Case Titles

- `single-file Main.xmlui renders a non-App root that references a local Component declared after the root`
- `single-file Main.xmlui renders a root that references a local Component declared before the root`
- `single-file local component receives props and updates its own private state on click`
- `single-file local component projects default children that mutate app state`
- `single-file local component named slot passes context into parent-authored template content`
- `single-file local component emits a custom event that increments app state`
- `single-file local component exposes a method called by the primary/root declaration through component id`
- `single-file local components can reference each other in the same Main.xmlui`
- `single-file duplicate local component names show a compile overlay with a duplicate-name diagnostic`
- `single-file local component with same name as sibling file logs warning and overrides sibling file`
- `component-only Main.xmlui logs warning when used as the main app file`
- `single-file unknown component still shows the existing unknown-component diagnostic`
- `standalone single-file app loads local component declarations without sibling files`
- `production build includes single-file local components and hydrates their interactive state`

## Verification Commands

Focused checks:

```sh
npm --workspace xmlui test -- xmlui/tests/compiler/parser/markupParser.test.ts
npm --workspace xmlui test -- xmlui/tests/compiler/parseXmlui.test.ts
npm --workspace xmlui test -- xmlui/tests/compiler/compileXmluiModule.test.ts
npx playwright test xmlui/tests/e2e/single-file-components.spec.ts --config xmlui/playwright.config.ts
```

Regression slice:

```sh
npm --workspace xmlui test -- xmlui/tests/compiler
npx playwright test xmlui/tests/e2e/udc-composition.spec.ts xmlui/tests/e2e/standalone-runtime.spec.ts xmlui/tests/e2e/production-build.spec.ts --config xmlui/playwright.config.ts
```

## Resolved Decisions

- The top-level rendered root may be any component except `<Component>`, such as
  `<Fragment>`, `<Stack>`, `<Text>`, or `<App>`.
- Component-only files are allowed. If a component-only file is used as the main
  app file, display a console warning that no top-level rendered root is used.
- If a local component name conflicts with a sibling component file, issue a
  warning and let the local component override the component from another file.
- Documentation should recommend top-level component declarations first. The
  compiler must support both declaration-before-root and root-before-declaration
  order.
