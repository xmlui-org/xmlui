# Developer Documentation Plan

## Goal

Create **dual developer documentation** for the XMLUI framework:

- **AI Docs** — Hyper-concise reference optimized for LLM-assisted development. Minimal tokens, maximum signal. Facts, rules, patterns, code snippets. No prose, no figures. Lives in `.ai/xmlui/`.
- **Human Docs** — Concise but readable documentation for human developers grasping the architecture. Short explanations, diagrams (to be added later), conceptual flow. Lives in `xmlui/dev-docs/`.

Both documentation sets cover the same topics but differ in format and density. Every topic below should have entries in both sets.

---

## Current State Assessment

### What exists today

| Location | Files | Strengths | Weaknesses |
|----------|-------|-----------|------------|
| `.ai/xmlui/` | 13 files | Good component authoring patterns, markup syntax, data patterns, testing conventions | No coverage of core internals (rendering pipeline, containers, expression evaluation, actions). Focused on "how to write components" but not "how the framework works". |
| `xmlui/dev-docs/` | 31 files | Deep dives on containers, theming, forms, standalone app, user-defined components | Uneven depth — some topics are thorough, others are stubs or issue trackers. No clear reading order beyond index.md. Several docs are dated or track issues rather than explain architecture. Missing: extension system, inspector, error handling, action model, wrapComponent API, language server. |

### Key gaps in current docs

1. **No unified mental model** — No single doc that explains the full request lifecycle (markup → parse → resolve → state → render → event → state update → re-render)
2. **Rendering pipeline details** — `renderChild`, `ComponentWrapper`, how behaviors are applied in sequence
3. **wrapComponent full API** — The most-used integration pattern has only a dated lessons-learned doc
4. **Expression evaluation** — How `{expressions}` are parsed, evaluated (sync/async), and how dependencies are tracked
5. **Action execution model** — How actions are defined, looked up, nested, and executed
6. **ApiBoundComponent** — Critical event handler bridge, zero documentation
7. **Extension system** — How to build, register, and publish extension packages
8. **Inspector/debugging** — Trace architecture, verbose mode, custom logging
9. **Error handling strategy** — Where ErrorBoundaries are placed, how errors propagate
10. **Language Server** — Full LSP implementation with no developer guide
11. **Component registration flow** — End-to-end from `createComponentRenderer` to rendering
12. **Routing internals** — How Pages/Page map to react-router, URL patterns, fallback behavior

---

## Topic Plan (Priority Order)

Topics are ordered by importance: a new developer should read from top to bottom. Each topic lists what the documentation should cover and its current documentation status.

---

### 1. Framework Mental Model & Request Lifecycle

**Priority: Critical — read first**

The single most important document. Provides the conceptual map that makes everything else make sense. A developer who reads only one doc should read this one.

- What XMLUI is: declarative-reactive XML framework compiled to React
- The full lifecycle: `.xmlui` file → XML parse → component tree → container wrapping → state composition (6 layers) → expression evaluation → React element tree → DOM → user event → event handler → state mutation → re-render
- Key abstractions and how they connect: ComponentDef, Container, StateContainer, renderChild, AppContext
- The two deployment modes (standalone/buildless vs Vite/built) and where they diverge
- How reactivity works without manual wiring (proxy-based mutation tracking, dependency collection)

**Current state:** Partially covered across `xmlui-uder-the-hood.md`, `containers-explained.md`, and `standalone-app.md`, but no single unified lifecycle doc. `.ai/xmlui/overview.md` covers user perspective only.

---

### 2. Rendering Pipeline

**Priority: Critical — core engine**

How XMLUI markup becomes pixels on screen. This is the engine room of the framework.

- `renderChild()` — the recursive heart: resolves `when` conditions, handles TextNode/CData, renders Slots, delegates to ComponentWrapper
- `ComponentWrapper` — prop extraction, theme class application, behavior wrapping, renderer invocation
- The behavior application sequence: DisplayWhen → Variant → Animation → Bookmark → PubSub → FormBinding → Validation → Label → Tooltip (order matters)
- `StateContainer` → `Container` → `renderChild` loop: how state flows into rendering
- How user-defined (compound) components are resolved and rendered differently from built-in components
- `ErrorBoundary` placement: wraps each component to isolate render failures

**Current state:** `standalone-app.md` covers bootstrap and provider stack well. Behavior application is documented in `component-behaviors.md`. But no doc covers the full render loop from `renderChild` through `ComponentWrapper` through behavior chain in a single narrative. `.ai/xmlui/components/renderer.md` covers renderer authoring but not the pipeline itself.

---

### 3. Container & State System

**Priority: Critical — reactivity foundation**

How state is managed, composed, and flows through the component tree. Without understanding containers, nothing else makes sense.

- Container fundamentals: automatic wrapping, instance isolation, hierarchical scoping
- The 6-layer state composition: parent state → component vars (`uses`) → loader results → implicit component state → code-behind script state → context variables
- Proxy-based mutation tracking: how writing to a variable routes the change to the owning container
- Variable resolution: lookup order, shadowing rules, global variables
- The reducer pattern: `ContainerActionKind` enum (LOADER_LOADED, LOADER_ERROR, STATE_PART_CHANGED, EVENT_HANDLER_STARTED, etc.)
- Explicit vs implicit containers: when XMLUI creates a container automatically vs when you declare one
- How `updateState` from native components flows back into the container

**Current state:** Well-documented in `containers.md` and `containers-explained.md`. The 6-layer model is explained. Gap: reducer action types and mutation routing internals could be more explicit for AI docs.

---

### 4. Component Architecture (The Two-File Pattern)

**Priority: Critical — daily development task**

How to build and modify XMLUI components. The most common development activity.

- The two-file pattern: `Component.tsx` (metadata + renderer) and `ComponentNative.tsx` (React implementation)
- Metadata via `createMetadata`: props, events, APIs, context variables, theme variables, parts
- The renderer function: created with `createComponentRenderer`, NOT a React component (no hooks), receives `RendererContext` with `node.props`, `state`, `extractValue`, `renderChild`, `lookupEventHandler`
- Native component: `forwardRef` + `memo`, receives infrastructure props (`updateState`, `registerComponentApi`), applies layout CSS via `style` prop
- `defaultProps` exported from Native, imported into metadata for `defaultValue` fields
- Registration in `ComponentProvider.tsx`
- Value extraction helpers: `asString`, `asBoolean`, `asNumber`, `asDisplayText`, `asArray`

**Current state:** Best-documented area. `.ai/xmlui/components/` has 9 focused files covering every aspect. `dev-docs/next/component-dev-guide.md` provides a walkthrough. The QA checklist is excellent. Gap: no concise "quick start" that chains the steps together end-to-end in one page.

---

### 5. wrapComponent — The Integration Workhorse

**Priority: High — most common pattern**

`wrapComponent` is the declarative bridge that makes a React component XMLUI-aware. Most components use it. Understanding its full config API is essential.

- What it does: takes a React component + a config object, returns an XMLUI-aware component with automatic prop extraction, event binding, theming, state management
- Config API reference:
  - `booleans`, `numbers`, `strings` — auto-extract typed props via `extractValue`
  - `events` — map XMLUI event names to React handler props (array or object form)
  - `callbacks` — props that execute inline JS expressions via `lookupSyncCallback()`
  - `templates` — render `ComponentDef` props via `renderChild()` (e.g., header/footer templates)
  - `renderers` — convert templates to render-prop callbacks with memoization
  - `resourceUrls` — auto-resolve logical URLs to physical paths
  - `initialValue` / `updateState` — state binding for controlled components
  - `registerComponentApi` — expose imperative APIs to markup
  - `captureNativeEvents` — capture native DOM events (mousedown, etc.)
  - `themeVars` — theme class integration via `useComponentThemeClass()`
- When to use `wrapComponent` vs writing a custom renderer
- Common patterns and gotchas (from `wrapComponent-integration.md` lessons learned)

**Current state:** `wrapComponent-integration.md` exists but is a lessons-learned doc, not a reference. No complete API guide. This is one of the most impactful missing docs.

---

### 6. Expression Evaluation & Scripting

**Priority: High — core reactivity mechanism**

How `{expressions}` in markup are parsed, evaluated, and how they trigger re-renders.

- Expression syntax: `{variable}`, `{obj.prop}`, `{fn(arg)}`, `{condition ? a : b}`
- The scripting language: JavaScript subset with limitations (no destructuring, no classes, no generators)
- Parser pipeline: XML attribute → `AttributeValueParser` → AST → `eval-tree-sync`/`eval-tree-async`
- Sync vs async evaluation: when each is used (attribute binding vs event handlers)
- `BindingTreeEvaluationContext`: how state, appContext, and functions are available during evaluation
- Dependency collection via tree visitors: how the framework knows which expressions to re-evaluate when state changes
- `ScriptingSourceTree` AST node types
- Code-behind scripts: how `<script>` blocks are parsed and evaluated

**Current state:** `.ai/xmlui/markup.md` covers expression syntax and scoping rules from a user perspective. No dev-docs explain the evaluation internals: parser pipeline, AST structure, sync/async evaluation, dependency tracking. This is a significant gap.

---

### 7. Theming & Styling

**Priority: High — visual customization**

The complete theming system from theme definitions through CSS variable generation to runtime switching.

- Theme structure: hierarchical definitions with inheritance chains
- Tone management: light/dark modes, `ToneSwitch`/`ToneChangerButton`
- CSS variable generation: how SCSS theme variables become CSS custom properties
- `createThemeVar` + `parseScssVar` + `:export { themeVars }` boilerplate in SCSS modules
- Theme variable naming conventions: `property-ComponentName[-VariantName]`
- `useComponentThemeClass()` hook: how components get their themed CSS class
- Theme composition: base theme → component overrides → user overrides
- Runtime theme switching via `ThemeContext` and `useTheme()`
- Responsive layout: breakpoint system, `layout-resolver.ts`

**Current state:** ✅ **DONE.** AI doc: `.ai/xmlui/theming-styling.md`. Human doc: `xmlui/dev-docs/guide/07-theming-styling.md`. Existing SCSS patterns in `.ai/xmlui/components/styling.md`. Key learnings in `guidelines.md` (Topic 7 section).

---

### 8. Data Operations & Loaders

**Priority: High — data-driven apps**

How XMLUI fetches, caches, and provides data to components.

- `DataSource` and `APICall` components: declarative data fetching in markup
- Loader lifecycle: how loaders are created, how they integrate with container state via reducer actions (`LOADER_LOADED`, `LOADER_ERROR`)
- React Query integration: `QueryClient`, cache keys, invalidation via `invalidates` prop
- Context variables from loaders: `$data`, `$result`, `$error`, `$loading`
- Dependent queries: how one DataSource depends on another's result
- Polling, refetching, transformation, result selection
- `createLoaderRenderer()` factory
- File operations: `FileUpload`, `FileDownload` action components

**Current state:** ✅ **DONE.** AI doc: `.ai/xmlui/data-operations.md` (internal architecture). User-facing markup patterns remain in `.ai/xmlui/data.md`. Human doc: `xmlui/dev-docs/guide/08-data-operations.md`. Key learnings in `guidelines.md` (Topic 8 section).

---

### 9. Behaviors System ✅ DONE

**Priority: High — cross-cutting concerns**

Auto-attached behaviors that wrap components based on their props.

- The `Behavior` interface: `name`, `shouldApply()`, `apply()`, `metadata`
- How behaviors are attached: checked in sequence during rendering, wrapping the component if `shouldApply()` returns true
- The 9 framework behaviors and their trigger conditions:
  - `DisplayWhen` — `when` prop → conditional rendering
  - `Variant` — `variant` prop → CSS class addition
  - `Animation` — `animation` prop → CSS animation wrapping
  - `Bookmark` — `bookmark` prop → URL hash management

**Docs:** `.ai/xmlui/behaviors.md` (AI) · `xmlui/dev-docs/guide/09-behaviors.md` (guide)
  - `PubSub` — `onMessage`/`publishMessage` → inter-component messaging
  - `FormBinding` — inside a Form → two-way value binding
  - `Validation` — `validationState`/`required`/`pattern` → input validation
  - `Label` — `label` prop → label wrapping (compact inline mode for form inputs)
  - `Tooltip` — `tooltip` prop → tooltip wrapping
- Application order matters: behaviors compose from outer to inner
- Extension packages can register custom behaviors via `ContributesDefinition`

**Current state:** Well-covered in both `component-behaviors.md` (dev-docs, architecture) and `.ai/xmlui/components/behaviors.md` (patterns). Minor gap: how external behaviors are registered.

---

### 10. Action Execution Model ✅ DONE

**Priority: Medium-High — event handling core**

How user interactions become side effects.

- Action definitions: `ActionRendererDef` with `actionName` and `actionFn`
- `ActionExecutionContext`: uid, state, appContext, lookupAction, navigate
- Built-in actions: APICall, FileUpload, FileDownload, Navigate, TimedAction
- Action lookup and resolution: `LookupActionOptions` with caching, error signaling, logging
- `ApiBoundComponent`: the critical bridge that converts declarative action definitions to React event handlers
  - How it generates event handlers for FileUpload, FileDownload, APICall
  - Nested actions with `success`, `error`, `progress` handlers
  - `invalidates` for cache busting
  - Form vs raw body handling
- How actions integrate with the inspector/trace system

**Docs:** `.ai/xmlui/action-execution.md` (AI) · `xmlui/dev-docs/guide/10-action-execution.md` (guide)

---

### 11. User-Defined Components ✅ DONE

**Priority: Medium — extensibility model**

How app developers create reusable components in `.xmlui` files.

- Component definition in `.xmlui` files: `<component name="MyComponent">`
- Template composition: default slot, named slots, `<Slot>` component
- Slot properties for bidirectional data flow
- Compound component rendering: how UDCs are resolved and rendered differently from built-in components
- Context variable propagation through slots
- `createUserDefinedComponentRenderer()` factory

**Docs:** `.ai/xmlui/user-defined-components.md` (AI) · `xmlui/dev-docs/guide/11-user-defined-components.md` (guide)

---

### 12. Form Infrastructure ✅ DONE

**Priority: Medium-High — complex subsystem**

Forms, validation, and data submission.

- `Form` → `FormItem` → input component hierarchy
- FormState structure: field tracking, dirty state, validation results, submission state
- Validation timing strategies: onChange, onBlur, onSubmit
- The reducer pattern for form state transitions
- Interaction flags: `isDirty`, `isTouched`, `isSubmitting`, `isValid`
- `FormWithContextVar` → `Form` → `FormItem` pipeline
- Known issues and code smells (from `form-infrastructure-issues.md`)
- Async validation and race conditions

**Docs:** `.ai/xmlui/form-infrastructure.md` (AI) · `xmlui/dev-docs/guide/12-form-infrastructure.md` (guide)

---

### 13. Routing ✅ DONE

**Priority: Medium — navigation infrastructure**

How XMLUI handles page navigation and URL mapping.

- `Pages` component: routing coordinator, wraps children in `TableOfContentsProvider`
- `Page` component: URL pattern matching via `url` prop, `navLabel` metadata
- Integration with `react-router-dom`: `BrowserRouter`/`HashRouter` selection
- `fallbackPath` for unmatched routes
- `defaultScrollRestoration` behavior
- Navigation via `navigate()` global function
- How `NavPanel`, `NavGroup`, `NavLink` integrate with routing

**Artifacts:**
- AI doc: `.ai/xmlui/routing.md`
- Human doc: `xmlui/dev-docs/guide/13-routing.md`

---

### 14. Extension Packages ✅ DONE

**Priority: Medium — ecosystem growth**

How to build, register, and publish XMLUI extension packages.

- The `Extension` interface: `namespace`, `components`, `themes`, `functions`
- `StandaloneExtensionManager`: `registerExtension()`, subscription pattern
- How extension components are registered alongside core components
- How extension themes are merged
- How extension functions are added to `appGlobals`
- Package structure conventions (from existing packages in `packages/`)
- Build configuration for extensions (`xmlui build-lib`)

**Artifacts:**
- AI doc: `.ai/xmlui/extension-packages.md`
- Human doc: `xmlui/dev-docs/guide/14-extension-packages.md`

---

### 15. Global Context & Utilities (AppContext) ✅ DONE

**Priority: Medium — everyday usage**

The global functions and utilities available in expressions and event handlers.

- `AppContextObject` interface: ~50+ utility methods
- `Actions` namespace: programmatic action invocation
- Navigation: `navigate()`, `confirm()`, `toast()`
- Date utilities: `formatDate`, `getDate`, `smartFormatDate`, etc.
- Math utilities: `avg`, `min`, `max`, `sum`
- LocalStorage: `getLocalStorage`, `setLocalStorage`
- Environment info: `isStandalone`, media breakpoints, version
- API interceptor access
- How `appGlobals` from extensions are merged in

**Current state:** `.ai/xmlui/overview.md` lists available functions from user perspective. No dev-docs on the internal implementation, how to add new global functions, or the interceptor system.

**Artifacts:**
- AI doc: `.ai/xmlui/app-context.md`
- Human doc: `xmlui/dev-docs/guide/15-app-context.md`
- Guidelines: `guidelines.md` — "From Topic 15: Global Context & Utilities"

---

### 16. Option-Based Components ✅ DONE

**Priority: Medium — common pattern**

Shared architecture for selectable-choice components.

- The `Option` type and `OptionContext`/`OptionTypeProvider` pattern
- Components using this pattern: Select, AutoComplete, RadioGroup, Pagination
- Search and filtering implementation
- How options render differently per component type
- How to extend or customize option rendering

**Current state:** Documented in `components-with-options.md`. Solid architecture doc. Needs only light updates.

**Artifacts:**
- AI doc: `.ai/xmlui/option-components.md`
- Human doc: `xmlui/dev-docs/guide/16-option-components.md`
- Guidelines: `guidelines.md` — "From Topic 16: Option-Based Components"

---

### 17. Error Handling Strategy

**Priority: Medium — reliability**

How XMLUI handles runtime errors gracefully.

- `ErrorBoundary` component: React class component, catches render errors
- Placement strategy: wraps each component individually for isolation
- Auto-reset behavior when `node` prop changes
- Fallback UI rendering with error message
- Integration with inspector tracing (`pushXsLog()`)
- Error propagation: how errors in expressions, event handlers, and loaders are handled differently
- Loader error state: `LOADER_ERROR` reducer action, `$error` context variable

**Current state:** Zero documentation. No doc explains the error handling strategy, ErrorBoundary placement, or how different error types propagate.

---

### 18. Parsers

**Priority: Medium-Low — rarely modified**

The parsing infrastructure that converts text to ASTs.

- XMLUI XML parser (`xmlui-parser/`): scanner → parser → syntax tree → transform → lint → diagnostics
- Scripting parser (`scripting/`): Lexer → Parser → ModuleLoader → ModuleResolver → ModuleValidator → circular dependency detection
- Style parser (`style-parser/`): StyleLexer → StyleParser (for SCSS module parsing)
- Keybinding parser: keyboard shortcut parsing
- How parsers integrate: XML parser extracts expressions → scripting parser handles `{...}` → style parser handles SCSS

**Current state:** No documentation. Parsers are complex but rarely modified. Low priority for human docs, but AI docs should cover the key interfaces and data structures for when modifications are needed.

---

### 19. Inspector & Debugging

**Priority: Medium-Low — developer tooling**

The built-in debugging and tracing system.

- Inspector component: clickable icon opening trace modal
- `pushXsLog()`, `createLogEntry()`, `pushTrace()`, `popTrace()` utilities
- Trace entry structure: timestamps, traceId, kind (interaction/error/state/etc.), details
- `window._xsLogs` storage when verbose mode (`_xsVerbose`) is enabled
- `window._xsDebugView` for component highlighting
- State logging, variable logging, handler logging modules
- How to add custom trace entries in new code

**Current state:** Zero documentation. The tracing system is non-trivial but there's no entry point for developers.

---

### 20. Language Server (LSP)

**Priority: Low — specialized subsystem**

The VS Code language server providing IDE support for `.xmlui` files.

- LSP capabilities: completion, hover, definition, formatting, diagnostics, folding
- `MetadataProvider`: hydrated from `xmlui-metadata-generated.js`
- Document management and project scanning
- How component metadata drives completions and hover docs
- Adding new language features (diagnostic rules, completions)

**Current state:** Zero documentation. Very high complexity but rarely touched. Should have at least an architecture overview for when changes are needed.

---

### 21. Build System & Deployment

**Priority: Low — infrastructure**

How XMLUI apps and the framework itself are built.

- Two app modes: standalone (buildless, runtime parsing) vs Vite (compiled, HMR)
- Framework build: multiple entry points (lib, standalone, metadata), SCSS handling
- CLI commands: `xmlui start`, `xmlui build`, `xmlui preview`, `xmlui build-lib`
- Extension package build configuration
- ESM migration details

**Current state:** Well-covered in `build-system.md` and `build-xmlui.md`. Needs only minor updates.

---

### 22. Monorepo Structure & Tooling

**Priority: Low — onboarding**

Repository layout, workspace configuration, and CI/CD.

- npm workspaces + Turborepo 2.x orchestration
- Package categories: core framework, extension packages, docs, tools
- Build orchestration: task dependencies, caching
- CI/CD: Changesets, automated releases, beta/stable workflow
- Development setup across IDEs

**Current state:** Covered in `xmlui-repo.md` and `release-method.md`. `dev-docs/next/working-with-code.md` and `dev-docs/next/project-structure.md` exist in draft. Adequate for current needs.

---

### 23. Testing Conventions

**Priority: Low — reference material**

E2E and unit testing patterns and infrastructure.

- E2E: Playwright + custom fixtures, `initTestBed`, test categories, `testState` polling
- Unit: Vitest + React Testing Library, mock setup, component-internal logic focus
- What to test vs what NOT to test
- Test file organization and naming
- Running tests: commands, worker settings, CI considerations

**Current state:** Well-covered in `.ai/xmlui/testing/e2e.md` and `.ai/xmlui/testing/unit.md`. Needs only minor updates.

---

### 24. Accessibility

**Priority: Low — ongoing improvement**

Current a11y status and patterns.

- Semantic HTML, ARIA roles, keyboard navigation, focus management
- Per-component accessibility audit findings
- Testing tools and methodology
- Parts pattern and its role in accessible component structure

**Current state:** Documented in `accessibility.md` with audit findings. Adequate but will need updates as components are fixed.

---

### 25. Component Catalog Reference

**Priority: Low — auto-generatable**

Reference for all ~90+ built-in components.

- Categorization by purpose: Layout, Input/Form, Logic, Actions, Display, Data
- Per-component: props, events, APIs, context variables, theme variables, parts
- This should largely be auto-generated from metadata

**Current state:** `component-categorization.md` provides rough taxonomy. `component-metadata.md` has auto-extracted stats. Individual component metadata is the source of truth. A comprehensive catalog should be generated, not hand-written.

---

## File Organization

### Decision: Subdirectory inside `dev-docs/`

New human docs go into **`xmlui/dev-docs/guide/`**. Existing files in `xmlui/dev-docs/` are left in place and untouched until explicitly retired or consolidated (see the "Files to Retire or Consolidate" section below).

```
xmlui/dev-docs/
├── guide/                  ← NEW: structured human-readable docs
│   ├── 01-mental-model.md
│   ├── 02-rendering-pipeline.md
│   ├── 03-container-state.md
│   └── ...
├── next/                   ← existing drafts (promote into guide/ when ready)
├── images/                 ← existing SVG diagrams (reuse or expand)
├── accessibility.md        ← existing docs, untouched
├── build-system.md
└── ...
```

AI docs go into **`.ai/xmlui/`** as before, matching topic names to their `guide/` counterparts.

```
.ai/xmlui/
├── rendering-pipeline.md   ← NEW AI doc
├── container-state.md      ← NEW AI doc
├── overview.md             ← existing (keep)
├── markup.md               ← existing (keep)
└── ...
```

**Naming convention for `guide/` files:** numeric prefix (`01-`, `02-`, …) to enforce reading order, followed by the topic slug. The prefix reflects priority rank from the topic list above.

---

## Documentation Format Guidelines

### AI Docs (`.ai/xmlui/`)

```
- One topic per file, tightly scoped
- Lead with the RULE or FACT, not explanation
- Use tables for mappings, enums, config options
- Use code snippets for patterns (minimal but complete)
- No prose paragraphs — bullet points and headers only
- Include "Key files" section pointing to source locations
- Include "Anti-patterns" section where relevant
- Target: 200–600 lines per file
- Naming: kebab-case, descriptive (e.g., rendering-pipeline.md, expression-eval.md)
```

### Human Docs (`xmlui/dev-docs/`)

```
- Start with a "Why this matters" paragraph (2-3 sentences)
- Use a conceptual flow: overview → details → examples
- Include placeholder markers for future diagrams: <!-- DIAGRAM: description -->
- Use code examples that show real component code, not toy examples
- Cross-reference related docs with links
- Include "Key takeaways" summary at the end
- Target: 300–1000 lines per file
- Naming: kebab-case, descriptive (matching AI doc names where possible)
```

---

## Suggested Execution Order

Phase 1 — **Foundation** (Topics 1–3): Framework mental model, rendering pipeline, container/state system. These unlock understanding of everything else.

Phase 2 — **Daily Development** (Topics 4–7): Component architecture, wrapComponent, expression evaluation, theming. What developers touch most often.

Phase 3 — **Data & Interaction** (Topics 8–11): Data operations, behaviors, forms, action model. How apps become interactive.

Phase 4 — **Extensibility & Architecture** (Topics 12–17): User-defined components, routing, extensions, AppContext, option components, error handling.

Phase 5 — **Reference & Tooling** (Topics 18–25): Parsers, inspector, language server, build system, monorepo, testing, accessibility, component catalog.

---

## Files to Retire or Consolidate

These existing docs should be folded into the new structure rather than maintained separately:

| Existing File | Action |
|--------------|--------|
| `xmlui-uder-the-hood.md` | Fold into Topic 1 (Framework Mental Model); fix typo in filename |
| `containers-explained.md` + `containers.md` | Consolidate into Topic 3 (Container & State) |
| `wrapComponent-integration.md` | Fold into Topic 5 (wrapComponent) as "Lessons Learned" section |
| `font-size.md` | Fold into Topic 7 (Theming) as a reference table |
| `form-design.md` + `form-infrastructure-issues.md` | Keep as appendices to Topic 10 (Forms) — they track ongoing work |
| `mcp-schizophrenia.md` | Remove or archive — operational notes, not developer docs |
| `glossary.md` | Expand and maintain as a standalone reference |
| `component-metadata.md` | Fold into Topic 25 (Component Catalog) — auto-generated |
| `react-fundamentals.md` | Keep as-is — prerequisite reading, not XMLUI-specific |
| `dev-docs/next/` files | Promote to main dev-docs when topics are written |
