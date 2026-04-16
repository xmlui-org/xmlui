# Documentation Guidelines

Guidelines and learnings for writing XMLUI developer documentation. This is a living document — update it as new patterns emerge.

---

## Dual Documentation Principle

Every topic produces two documents:

| Variant | Location | Audience | Format |
|---------|----------|----------|--------|
| **AI doc** | `.ai/xmlui/<topic>.md` | LLM-assisted development | Bullet points, tables, code snippets. No prose. Minimal tokens, maximum signal. |
| **Human doc** | `xmlui/dev-docs/guide/NN-<topic>.md` | Human developers | Conceptual flow, short explanations, diagram placeholders, key takeaways. |

Both docs cover the same facts. They differ in density and readability.

---

## AI Doc Format

- Lead with facts and rules, not explanations
- Use tables for enums, config options, mappings, file inventories
- Use bullet points for sequences and decision trees
- Code snippets: minimal but complete — show real types and real function names
- Include a **Key Files** table at the bottom mapping concepts to source paths
- Include an **Anti-patterns** section where relevant
- No introductory paragraphs, no "why this matters", no conclusions
- Target length: 200–600 lines
- File naming: `kebab-case.md` (e.g., `mental-model.md`, `rendering-pipeline.md`)

## Human Doc Format

- Start with a short "what and why" paragraph (2–3 sentences)
- Use a conceptual flow: overview → how it works → details → examples
- Mark diagram insertion points with `<!-- DIAGRAM: short description -->`
- Use code examples drawn from real framework code, not toy examples
- Cross-reference related docs with relative markdown links
- End with a **Key Takeaways** section (numbered list, 4–6 items)
- Target length: 300–1000 lines
- File naming: `NN-kebab-case.md` where `NN` is the priority rank (e.g., `01-mental-model.md`)

---

## Writing Rules

### Accuracy over elegance
- Every technical claim must be verified against source code before writing
- Use real type names, real function names, real file paths
- If a detail is uncertain, omit it rather than guess

### Conciseness
- One idea per paragraph (human docs) or per bullet (AI docs)
- Avoid filler: "it is important to note that", "as mentioned earlier", "in other words"
- Prefer tables over prose for structured information

### Naming consistency
- Use the exact names from the codebase: `renderChild`, `ComponentWrapper`, `StateContainer` — not paraphrases
- Use backtick formatting for all code identifiers: `renderChild()`, `ContainerActionKind`, `STATE_PART_CHANGED`
- Component names are PascalCase: `DataSource`, `FormItem`, `TextBox`
- File names include extension: `reducer.ts`, `AppRoot.tsx`

### Cross-referencing
- AI docs: reference key files by path in a table
- Human docs: link to related guide docs and to AI docs where deeper detail lives
- Never duplicate large sections across docs — link instead

---

## Diagram Conventions (for future)

Human docs include placeholder markers for diagrams. When adding actual diagrams:

- Use SVG for all diagrams (scalable, versionable)
- Store in `xmlui/dev-docs/images/guide/`
- Name to match the doc: `01-mental-model-lifecycle.svg`, `01-mental-model-providers.svg`
- Marker format: `<!-- DIAGRAM: description of what the diagram should show -->`

---

## Process

1. Read the topic's section in `dev-docs-plan.md` for scope and current-state assessment
2. Read the relevant source code — verify every claim
3. Read existing docs that cover overlapping material (noted in plan)
4. Write the AI doc first (forces precision; easier to expand than to compress)
5. Write the human doc second (expand AI doc into readable narrative with flow and examples)
6. Self-check: does every technical statement match the source code?

---

## Learnings Log

Record lessons learned here as we write documentation. These help maintain consistency across topics.

### From Topic 1: Mental Model & Request Lifecycle

- **Two-pass variable resolution** is subtle and easy to miss when skimming source; always call it out explicitly.
- **`ComponentWrapper` routing** (`isContainerLike` → `ContainerWrapper` vs `ComponentAdapter`) is the key architectural fork — worth emphasising in both docs.
- **`StateContainer` vs `Container`**: keep their roles clearly separated — "what is state?" vs "what do I render?". The human doc needs both; the AI doc needs at least a two-line summary.
- **Mutation routing** (`statePartChanged`) has four branches; `uses` acts as a bubbling boundary. Prose alone is hard to follow — diagram or decision tree is the right format.
- **Variable examples near `uses` prop**: avoid names that look like `uses` (e.g. `users`); reader confusion is real.
- **Human doc should include a short code example** for any non-obvious mechanism (e.g. forward-reference resolution). AI doc intentionally skips examples.
- The provider stack is 12+ levels deep. Listing every provider is useful for AI docs but overwhelming for human docs. Human docs should show the grouped hierarchy; AI docs should list every provider with its purpose.
- immer's `produce()` is used in the reducer but this is invisible to most developers. Mention it once; don't over-explain.
- Real function names from the source (`createEventHandlers`, `createEventHandlerCache`, `createActionLookup`, `createChildRenderer`) are more useful than abstract descriptions. AI docs should always use the real names.

### From Topic 2: Rendering Pipeline

- **Verify interface method names from source** before writing — `canAttach`/`attach`, not `shouldApply`/`apply`. One wrong name misleads developers for a long time.
- **Behavior registration order ≠ intuitive order** — the last registered behavior is the outermost wrapper. State this explicitly with the table; prose alone will be misread.
- **`when` vs `displayWhen` is a critical distinction** worth a dedicated subsection in both docs. Stating the mechanism (unmount vs CSS hide) plus the consequence (state lost vs preserved) is necessary; one without the other is insufficient.
- **Compound components never get behaviors** — this is an easy mistake to make when building user-defined components. Flag it as a rule in the AI doc and a callout in the human doc.
- **Adding a summary table** to "at a glance" sections pays off immediately — the ASCII tree gives structure; the table gives quick scannable reference. Include both when the pipeline has more than 3 steps.
- **Part-specific overrides vs responsive variants** look syntactically identical (`fontSize-label` vs `padding-md`). Document both clearly so they aren't confused.
- **`ErrorBoundary` auto-reset on `node` prop change** is not obvious and has real debugging implications. Worth a sentence even in the AI doc.

### From Topic 3: Container & State System

- **`id` + API registration mechanism** is non-obvious: `id` does NOT create a container but enables API access via `Symbol.description` → string key in `mergeComponentApis`. Omitting this leaves developers confused about how `myInput.focus()` works. Document it in the "When is a container created?" section.
- **Layer count matters for cross-doc consistency** — the source code has 7 internal processing steps but 6 conceptual layers (the 7th is post-processing). Pick the user-facing count (6), use it everywhere, and describe the post-processing step separately. Diverging counts across docs create unnecessary confusion.
- **Always annotate non-obvious layers** — layers 2, 3, 4, 6 are straightforward but it still helps to add a brief lead-in saying so. Silently skipping layers makes readers wonder what was omitted.
- **Avoid using internal component names** (`Container` as an XMLUI component) that are not part of the public API and are candidates for removal. Describe the observable behaviour (`uses` prop) instead.
- **`ForEach`/`List` are wrong component names** — XMLUI uses `Items` for iteration. Verify component names in source or the component registry before writing any reference to iteration.
- **Variable re-evaluation rule** ("re-evaluates every render but reducer value shadows expression") is counterintuitive and easy to state wrong. Include it explicitly; don't assume readers will infer it.
- **Live references (`__liveApiRef__` sentinels)** are an internal detail worth a short note in the human doc (so developers understand why assigning a DataSource to a variable "just works") but should not dominate the layer discussion. One paragraph is enough.

### From Topic 4: Component Architecture (Two-File Pattern)

- **The renderer is a plain function, not a React component** — this is the most important rule. Putting hooks in the renderer causes silent, hard-to-debug errors. State this first, in both docs.
- **`extractValue` is mandatory for every `node.props.*` access** — raw prop values may be binding ASTs, not plain values. Accessing them directly is a common mistake; make this non-negotiable in the anti-patterns table.
- **`defaultProps` is the single source of truth for defaults** — it should be exported from the native file and referenced by both the metadata (`defaultValue: defaultProps.x`) and the native component destructuring (`x = defaultProps.x`). The renderer passes `undefined` when a prop is absent and lets the native component apply the default. Duplicating defaults in multiple places is an anti-pattern.
- **`registerComponentApi` replaces `useImperativeHandle`** — this is not obvious to React developers. The method map passed to `registerComponentApi` becomes accessible in markup via the component's `id`. Explain the full chain: `id="myComp"` → `registerComponentApi` → `mergeComponentApis` → string key in state → `myComp.focus()` in markup.
- **`classes` vs `className`** — `classes?.["-component"]` is the preferred way to apply theme CSS to the root element; it includes responsive rules that `className` alone misses. `classes?.[partName]` targets named sub-elements. Use both alongside SCSS module classes via `classnames()`.
- **`wrapComponent` is an alternative renderer path, actively replacing `createComponentRenderer`** — the codebase is progressively migrating renderer functions to `wrapComponent`. Topic 4 establishes the baseline (`createComponentRenderer`); Topic 5 covers `wrapComponent` fully. When reading existing components, both patterns appear.
- **Theme variable naming: full positional order matters** — `parseLayoutProperty` classifies segments by first-letter case (uppercase = ComponentName, lowercase = partName/variantName). The full order is `property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName...]`. Screen sizes and part names come BEFORE ComponentName, not after. State names use `--` double-dash, not single `-`. Variant and part names are camelCase (lowercase start); writing `Primary` is rejected as a second ComponentName.
- **Memo wrapping is always required** — `memo(forwardRef(...))` not just `forwardRef(...)`. Without `memo`, XMLUI's reactive state updates cause cascading re-renders that bypass the optimization. Omitting `memo` is an invisible performance issue.
- **Tree-shaking guards are a production concern** — the `process.env.VITE_USED_COMPONENTS_X !== "false"` guard in `ComponentProvider.tsx` enables bundle optimization. Mention it in the registration section; it's the reason the registration pattern looks unusual.

### From Topic 5: wrapComponent

- **`d()` shorthand produces no `valueType`** — the most common migration mistake. Props declared with `d("description")` fall through to raw `extractValue()` in `wrapComponent`. Always use the full `{ description: "...", valueType: "string" }` form for typed props. Document this prominently in both docs.
- **`type` vs `valueType` confusion** — some legacy metadata uses `type: "boolean"` instead of `valueType: "boolean"`. `wrapComponent` only reads `valueType`. Check this when migrating.
- **Layout props must not appear in native component Props interfaces** — `wrapComponent` blocks them from forwarding (they go through the layout resolver to CSS class). Defining `width?: string` in the native Props interface creates silent mismatch: the prop is defined but never receives a value.
- **`stateful` is auto-detected** — if metadata has `initialValue` in props or `didChange` in events, `isStateful` is true. Setting `stateful: false` explicitly can override this, but the common case needs no config.
- **`templates` vs `renderers`** — the distinction is re-render behaviour. Templates render once on each renderer evaluation (static ReactNode). Renderers create render-prop callbacks with `MemoizedItem` to only re-render the item when context variables change. Use templates for slot-type content; renderers for per-item iteration templates.
- **`customRender` skips auto children rendering** — when `customRender` is provided, `wrapComponent` does not automatically call `renderChild(node.children)`. The `customRender` function must handle children explicitly if they need to appear.
- **`wrapCompound` solves the stale-closure problem** — it uses a `CallbackSync` (outer, unmemoized) + `MemoizedInner` split to keep React event handlers stable while XMLUI's renderer recreates new closures every evaluation. This pattern is worth understanding for complex controlled inputs, but most components should use `wrapComponent`, not `wrapCompound`.
- **`captureNativeEvents` only activates in verbose mode** — even when set to `true` in config, the `onNativeEvent` callback is only wired when `appContext.appGlobals.xsVerbose === true`. It's safe to set it always for tracing-capable components.
- **Events auto-detected from metadata** — explicit `events` config extends the auto-detected set, it doesn't replace it. All keys in `metadata.events` are wired automatically with the `on` + capitalize convention. Only use the explicit form when the React prop name is non-standard.

### From Topic 6: Expression Evaluation & Scripting

- **Optional chaining is the default, not opt-in** — `evalContext.options.defaultToOptionalMemberAccess` defaults to `true`. This means `obj.prop`, `obj[key]`, and `fn()` all use optional chaining semantics. `null.foo` returns `undefined` instead of throwing. This is the single most impactful difference from JavaScript and affects every expression. Document it first in both docs.
- **Two evaluation tracks with different rules** — sync (bindings) rejects Promises; async (events/code-behind) resolves them. Always specify which track a rule applies to. Don't say "the evaluator does X" without qualifying which one.
- **`async`/`await` parsed but rejected at runtime** — the parser accepts all async syntax (for forward compatibility), but `evalArrow()`, `processStatement()`, and the `T_AWAIT_EXPRESSION` case all throw. This is a deliberate design: the async evaluator handles Promises without syntax.
- **Banned functions are runtime-checked, not parse-time** — `isBannedFunction()` compares the resolved function object against 12 entries. The parser doesn't know about banned functions. This means `setTimeout` passes parsing and only fails at invocation.
- **`new` allows 4 constructors but error message lists 3** — `allowedNewConstructors` includes `String`, `Date`, `Blob`, `Error`, but the runtime error message says "Only String, Date, and Blob are allowed." The `Error` constructor is the 4th allowed but missing from the error text. Document the actual map, not the error message. Also note in docs: this whitelist will be extended in future releases for additional safe constructors.
- **`var` is reactive and restricted** — not JavaScript `var`. Main thread only, mandatory initialization, `$` prefix banned. `let`/`const` are standard block-scoped. This semantic overloading is the #1 source of confusion for developers coming from JavaScript.
- **Array method async proxies differ in execution strategy** — `map` and `forEach` are sequential (order-preserving); `filter`, `every`, `some`, `find`, `findIndex`, `flatMap` are parallel (`Promise.all`). This matters for side-effecting predicates.
- **1000ms sync timeout is a hard constant** — `SYNC_EVAL_TIMEOUT = 1000` in `process-statement-sync.ts`. Not configurable. The async timeout IS configurable via `evalContext.timeout`.
- **`::` operator is XMLUI-specific** — bypasses the entire scope chain and resolves directly from `globalThis`. Not available in JavaScript. Useful for `::console.log()` or `::Math.PI` when local scope shadows global names.
- **Dependency tracking is static, not runtime** — `collectVariableDependencies()` walks the AST at parse time to find external variable names. It doesn't use Proxy-based tracking. This means dynamically computed property names in member access are not tracked as dependencies.

### From Topic 7: Theming & Styling

- **Theme compilation is a 5-step pipeline** — inheritance chain → tone overlay → derived token generation → `$ref` resolution → CSS variable injection. Understanding the order matters: derived tokens are generated from already-merged base+tone values, and `$references` resolve last. Changing the order would break cascading.
- **The `:export` block in SCSS is load-bearing** — without `themeVars: t.json-stringify($themeVars)` in the SCSS `:export`, `parseScssVar()` returns an empty map and no theme variables reach the component at runtime. This is the most common cause of "theme vars not applying" bugs.
- **Variable naming is position-sensitive, not delimiter-sensitive** — the parser uses case conventions (PascalCase = component, camelCase = property/part/variant) and position to disambiguate segments. A PascalCase segment in position 2 is always a component name. Naming a variant `Primary` instead of `primary` silently misroutes it.
- **`--` is exclusively for state names** — `backgroundColor-Button--hover` has state `hover`. Using `--` for other purposes (e.g., BEM-style `block--modifier`) will be misinterpreted as a state separator.
- **Derived token generation is automatic and voluminous** — `transformThemeVars()` generates hundreds of tokens from seed values (`space-base`, `fontSize`, color families). When debugging theme issues, check whether the expected token exists as a derived token rather than assuming it must be explicitly defined. Spacing tokens use underscores for fractional steps: `space-0_5`, `space-1_5` (not dots).
- **There are 7 color families, not 9** — `primary`, `secondary`, `info`, `success`, `warn`, `danger`, `surface`. Each generates 13 tones (0, 50, 100, ..., 950, 1000) as `const-color-{family}-{tone}`. There is no `accent` or `neutral` family in the core theme system.
- **Star sizing (`N*`) converts to flex, not percentage** — `width="2*"` becomes `flex: 2; flex-shrink: 1`, not `width: 66%`. This only works inside flex containers (HStack, VStack). Using `*` on a non-flex child has no visible effect.
- **Nested `<Theme>` elements use a 3-layer filtering system** — (1) `needsCompiledVars` gate: if no tone/id change and no base vars, zero compiled vars are injected (only explicit overrides); (2) component-based filtering via `parseHVar()` + component registry: base vars pass, compound component vars pass, special built-ins (Input/Heading/Footer) pass, template-referenced vars pass, other native component vars are filtered out; (3) explicit `themeVars` prop values always pass regardless. This prevents CSS variable shadowing that breaks tone-switching in nested scenarios.
- **Responsive properties use mobile-first breakpoints** — the base property applies from `xs` (0px) up; `-sm`, `-md`, etc. add `@media (min-width: Npx)` overrides. There is no max-width breakpoint — all are min-width only.
- **ThemedX wrapper pattern is not optional** — `wrapComponent` expects the Themed wrapper, not the bare native component. The wrapper calls `useComponentThemeClass(descriptor)` to inject theme variables as a className. Passing the native component directly means no theme variables are applied.
- **No circular reference detection** — `$color-primary-500` resolving to `var(--xmlui-color-primary-500)` is a simple string replacement. If variable A references B and B references A, the output is valid CSS syntax but with unresolvable `var()` calls. The framework does not warn about this.
- **`useStyles()` deduplicates by hash** — identical style objects across component instances share a single `<style>` element with reference counting. This means 100 Buttons with the same theme vars produce one injected style block, not 100.

### From Topic 8: Data Operations & Loaders

- **`ApiBoundComponent` is the invisible transform layer** — every component with a DataSource prop or APICall/FileUpload/FileDownload event is silently wrapped in `ApiBoundComponent`. It rewrites DataSource props to reactive expressions and generates event handler code strings for mutations. This wrapping happens at render time, not at parse time. Never pass a DataSource definition directly to a component prop expecting data — it won't work without this layer.
- **`loaded = true` means "fetch attempted", not "fetch succeeded"** — both `LOADER_LOADED` and `LOADER_ERROR` set `loaded = true`. Always check `error !== null` separately when you need to distinguish success from failure.
- **Dependent queries are implicit via URL expressions** — there is no `dependsOn` prop. A DataSource whose URL contains `{otherLoader.value.id}` will refetch automatically when the dependency changes, because the React Query cache key changes. Corollary: a DataSource with `undefined` in its URL will still attempt to fetch — use `when="{!!dependency.loaded}"` to prevent premature requests.
- **`invalidates` without a URL resets the entire cache** — `<APICall invalidates="/api/users" />` invalidates only queries whose key starts with `/api/users`; omitting `invalidates` entirely invalidates ALL queries. This global reset is occasionally intentional but usually a bug. Always specify the URL pattern.
- **Polling is implemented with `setInterval`, not React Query's `refetchInterval`** — XMLUI uses its own interval in `Loader.tsx`. Manual `refetch()` calls do not reset the poll interval. Cleanup happens in the `useEffect` return, so unmounting the DataSource stops polling.
- **`resultSelector` and `transformResult` are layered, not alternative** — they run in sequence: selector extracts a subtree first, then `transformResult` receives the already-selected data. Both can be set simultaneously.
- **FileDownload strategy depends on the request type** — GET with no custom headers → iframe (browser native, shows OS progress bar); anything else (POST, custom headers, mocked) → fetch + `URL.createObjectURL` + anchor click. The difference matters if you expect browser download UI.
- **`byId` index requires `$id` on array items** — `state[uid].byId` is only populated when the response is an array and each item has a `.$id` property. Without `$id`, `byId` is `undefined`.
- **`ContainerActionKind` enum members are string constants** — the `const enum` values are inlined at compile time. Do not compare against these strings at runtime via reflection; always use the enum members in source code.
- **React Query `retry: false` is set globally for all loaders** — XMLUI does not retry failed requests automatically. Error handling is the application's responsibility via `error` events or `$error` context variables.

### From Topic 9: Behaviors System

- **Registration order = application order = innermost wrapping** — behaviors register as `label → animation → tooltip → variant → bookmark → formBinding → validation → displayWhen`. Earlier = closer to the component in the DOM; later = further out. `displayWhen` is deliberately last so it is always the outermost wrapper.
- **The label metadata rule is the single most important authoring rule** — declare `label` in a component's metadata `props` if the component renders its own label (Checkbox, Radio). Absence of the declaration means the label behavior will auto-attach. Getting this wrong causes double labels in the rendered output.
- **`displayWhen` is not a synonym for `when`** — `when=false` unmounts the subtree; `displayWhen=false` hides it with `display:none` while keeping it mounted. Use `displayWhen` for multi-step wizard forms so hidden-step fields stay registered with the enclosing Form.
- **`formBindingBehavior` owns label rendering when it attaches** — when a component has `bindTo` + value/setValue APIs, `formBindingBehavior` attaches AND handles label rendering. `labelBehavior` explicitly skips in this case. Never rely on both attaching simultaneously.
- **The `Behavior` interface uses `canAttach`/`attach`, not `shouldApply`/`apply`** — the actual method names are `canAttach()` and `attach()`. The plan description used different names; the source is authoritative.
- **`PubSubBehavior.tsx` exists but is not registered** — the file is in `components-core/behaviors/` but is never passed to `registerBehavior`. It is not active in the current framework.
- **External behaviors append after `displayWhen` by default** — `contributes.behaviors` entries are pushed after all 8 framework behaviors. Use positioned registration (`registerBehavior(b, "before", "animation")`) to insert earlier.
- **The variant behavior uses a CSS variable fallback chain** — `var(--xmlui-prop-Component-variantName, var(--xmlui-prop-Component))`. Themes only need to define the variant-specific variable; the component's base styling automatically serves as fallback.
- **Compound and non-visual components never receive behaviors** — user-defined XMLUI components (`.xmlui` files, `isCompoundComponent: true`) and components with `nonVisual: true` in metadata are always skipped, regardless of what props they have.
- **`attach()` reads config from `context.node.props`, not from the `node` ReactNode** — when implementing a behavior, the `node` argument to `attach()` is the rendered React output. To read prop values, use `context.node.props` (the parsed XML definition) and resolve them with `context.extractValue()`.

### From Topic 10: Action Execution Model

- **All XMLUI event handlers are async** — every handler runs through the scripting engine's AST interpreter (not `eval()` or `new Function()`). Even simple one-liners like `navigate('/')` execute asynchronously. The framework has its own parser and statement-by-statement executor.
- **`preventDefault()` and `stopPropagation()` happen synchronously before user code** — for mouse events, the framework locks down the DOM event before invoking the async handler. User code cannot conditionally allow event propagation — it's already stopped by the time the `onClick` expression starts executing.
- **Mouse event handlers are fire-and-forget** — the `Promise` returned by the handler is never awaited. Errors become unhandled promise rejections, not caught exceptions. Return values are discarded.
- **State changes are visible between statements** — the scripting engine dispatches state mutations and `await`s React's `startTransition` commit after each statement. Statement N+1 sees changes from statement N. This differs from raw React where `setState` batches.
- **Form handlers (`onSubmit`, `onWillSubmit`, `onSuccess`) are the exception** — they are awaited and their return values control the submission flow. `onWillSubmit` returning `false` cancels submission; returning an object replaces the submitted data.
- **`bubbleEvents` is the experimental escape hatch** — when a component sets `bubbleEvents={["click"]}`, the framework skips `stopPropagation` and `preventDefault` for that event name, allowing it to bubble to parent listeners.
- **`ApiBoundComponent` is pure code generation** — it never executes HTTP requests itself. It generates JavaScript strings (event handler source code) at render time; the scripting engine evaluates them at event time. The actual execution is performed by `Actions.callApi(...)`, `Actions.upload(...)`, etc.
- **All action config is serialized as JSON literals into the generated handler string** — when `ApiBoundComponent` emits a handler, every prop (`url`, `method`, `body`, `invalidates`, ...) is embedded as a JSON literal. Expression evaluation (`{id}` in a URL, `$result.name` in `onSuccess`) happens later at event time, not during code generation.
- **`callApi`'s cache invalidation is a macrotask (deferred via `setTimeout(0)`)** — code that depends on the React Query cache being updated synchronously after `callApi` returns will not work. The deferral exists so that synchronous `navigate()` calls in `onSuccess` can unmount DataSources before the invalidation fires.
- **`onSuccess` returning `false` is the invalidation escape hatch** — explicitly returning `false` from `onSuccess` skips cache invalidation entirely. Use this when navigating away after a successful action, where the DataSource will unmount before a re-fetch would be useful.
- **Omitting `invalidates` invalidates the entire React Query cache** — `invalidateQueries()` with no predicate resets everything. If `updates` is also omitted, a bare `<APICall>` with no `invalidates` will clear all cached data on success. Always provide an `invalidates` URL pattern.
- **`state` is a snapshot; `getCurrentState()` is live** — in async action code, `state` (from `ActionExecutionContext`) reflects the state at call time. After any `await`, use `getCurrentState()` to read current values. Container state may have changed during the async operation.
- **Nested action handlers are embedded recursively** — `success`, `error`, `progress`, `beforeRequest`, and `mockExecute` children of an `APICall` are each processed by `generateEventHandler()` and embedded inline in the generated string. This means deeply nested action chains are fully serialized into a single handler string.
- **`onBeforeRequest` can abort `callApi`** — if the `onBeforeRequest` handler returns `false` (boolean, not falsy), the HTTP request is cancelled before it fires. This is the correct hook for async pre-flight checks (e.g., validating form state before submission).

### From Topic 11: User-Defined Components

- **Behaviors skip compound components** — `ComponentAdapter` checks `isCompoundComponent` and skips the entire behavior chain (DisplayWhen, Variant, Tooltip, Label, etc.). Behaviors apply only to built-in components inside the UDC's implementation. If you add a new behavior, it will automatically be excluded from UDC wrappers.
- **Named slots must end with `Template` suffix** — `slotRenderer()` validates this at runtime and renders `InvalidComponent` with an error message if the name doesn't match. This is not just a convention — it's enforced.
- **Slot content renders in parent scope, not component scope** — `parentRenderContext.renderChild` carries the parent's render function. Expressions like `{userName}` in a parent's template resolve in the parent's scope even though the template physically renders inside the component's layout. This is the most common source of confusion.
- **Code-behind overrides inline on name conflicts** — `createUserDefinedComponentRenderer()` merges code-behind via spread: `{ ...inlineVars, ...codeBehindVars }`. If both define `query`, the code-behind version wins.
- **`$props` is a snapshot, not a live binding** — resolved in parent scope via `extractValue`, shallow-memoized via `useShallowCompareMemoize`. Mutations to `$props` inside the component do not propagate back. Use `emitEvent()` to communicate changes to the parent.
- **`emitEvent` naming convention strips `on` prefix** — `emitEvent('valueChanged')` looks up the `valueChanged` event, which was parsed from the parent's `onValueChanged` attribute. The parser strips `on` and lowercases the first character: `onValueChanged` → `"valueChanged"`.
- **Auto-generated metadata discovers props by walking `$props` references** — `generateUdComponentMetadata()` introspects the component tree at registration time, collecting every `$props.<member>` access. Explicit metadata merges on top. This means unused props won't appear in completions.
- **Parent render context is lazy** — only created when parent provides templates or children. `hasTemplateProps` uses a heuristic (name ends with `Template`, or value has `type` field) rather than scanning all props.
- **Component name must match filename in standalone mode** — `ActionBar.xmlui` must contain `<Component name="ActionBar">`. Built mode does not enforce this, which can cause subtle bugs when switching modes.

### From Topic 12: Form Infrastructure

- **Form owns ALL state — FormItems are stateless** — the entire form is a single `useReducer` with Immer. FormItems dispatch actions and subscribe to context slices. Never add field-level state to FormItem.
- **`useFormContextPart` is the critical optimization** — uses `use-context-selector` so each FormItem subscribes only to its specific data slice. Without this, every keystroke re-renders all fields (O(n) per character). Always use `useFormContextPart` instead of raw `useContext(FormContext)`.
- **Lodash `set()` is only safe inside Immer** — the reducer uses `set(state.subject, path, value)` which mutates in place. Outside of `produce()`, this corrupts state. Never use Lodash `set()` on FormState outside the reducer.
- **`partial: true` bridges sync and async validation** — sync validators return immediately with `partial: true` if `onValidate` exists. The Save button shows "Validating..." and disables until `partial` becomes `false`. Always dispatch the partial result first, then the complete result.
- **Form event handlers are the awaited exception** — `onWillSubmit`, `onSubmit`, `onSuccess` are all `await`ed with return values observed. `onWillSubmit` returning `false` cancels submission; returning an object replaces the data. This differs from all other XMLUI event handlers which are fire-and-forget.
- **`resetVersion` forces React re-mount** — Form renders with `key={resetVersion}`. Incrementing it unmounts/remounts everything, clearing uncontrolled input state. This is intentional, not a hack.
- **Backend errors require `GenericBackendError` shape** — the catch block only parses structured errors with `errorCategory: "GenericBackendError"` and `details.issues[]`. Other error shapes become a generic "Couldn't save the form" message.
- **`cleanUpSubject` vs `cleanUpSubjectForWillSubmit`** — `onSubmit` receives cleaned data (no unbound/noSubmit fields). `onWillSubmit` receives both cleaned AND full data, enabling cross-field validation involving excluded fields.
- **InteractionFlags implement "late error" UX** — seven boolean flags per field drive sophisticated display timing. The default `errorLate` mode shows errors only after the first blur post-edit, then continues updating per keystroke. Don't simplify these flags without understanding the UX implications.

### From Topic 13: Routing

- **`Pages` = `<Routes>`, `Page` = `<Route>`** — XMLUI routing is a thin declarative wrapper over react-router-dom v6. Never manipulate the router directly; use `Pages`/`Page` in markup and `navigate()` in scripts.
- **HashRouter is the default** — `useHashBasedRouting` defaults to `true`, producing `/#/path` URLs that work on any static host. BrowserRouter requires server-side fallback routing to prevent 404s on direct URL access.
- **`$routeParams`, `$queryParams`, `$pathname` are Layer 6 state** — injected by `useRoutingParams()` into every component's expression context automatically. They're reactive: expressions re-evaluate on navigation. Never use `window.location` or `useParams()` directly in component code.
- **`RouteWrapper` is the bridge between react-router and XMLUI state** — it wraps each Page's children in an implicit container (`vars: {}`), calling `useParams()` and making results available as `$routeParams`. Changing a Page's `url` prop remounts the wrapper via `key`.
- **`willNavigate` only fires for `navigate()` calls** — it does NOT fire for `<Link>` clicks or browser back/forward. If you need navigation guards, replace `<Link>` with a `<Button onClick="navigate(...)">` and put the guard logic in the `willNavigate` handler.
- **`$linkInfo` is populated by NavPanel, not by Pages** — `LinkInfoContext` builds a map from NavGroup/NavLink children. `$linkInfo` gives breadcrumbs, prev/next links, and page metadata. Pages with no matching NavLink entry see `$linkInfo` as `{}`.
- **`TableOfContentsContext` is for in-page anchors, not URL routing** — each Page wraps children in `<TableOfContentsProvider>` for heading-level TOC support. This is completely separate from react-router and does not affect URL-based navigation.
- **MemoryRouter is used for preview/embed and SSR** — if `previewMode` is set or `window` is undefined (SSR), the app falls back to MemoryRouter automatically. No URL changes occur.

### From Topic 14: Extension Packages

- **Extension = default export object with `namespace`, `components`, `themes`, `functions`** — that is the entire public API of an extension package. The rest is build tooling and registration wiring.
- **Three namespace pools: core, app, extensions** — lookup order is core first, then app, then extensions. Core components always win. Extension components cannot shadow built-in names. The default `"XMLUIExtensions"` namespace allows unqualified component names in markup.
- **Vite mode: import and bundle; standalone mode: UMD self-registers** — in Vite mode, list extensions in `extensions.ts` and import them. In standalone mode, load UMD scripts before the runtime; `build-lib` auto-injects the registration footer.
- **`subscribeToRegistrations()` fires immediately for already-registered extensions** — the `StandaloneExtensionManager` replays all stored extensions to any late subscriber. Registration order doesn't matter as long as everything registers before first render.
- **Theme variables from extension components are merged automatically** — when a component renderer with `metadata.themeVars` is registered, its vars go into the global `themeVars` set. No extra wiring needed.
- **Functions merge with first-write-wins** — extension `functions` become global expression utilities. If a name collides with a built-in or another extension, the first-registered wins silently. Use distinctive names.
- **Behaviors can only be contributed via `ContributesDefinition`, not `Extension`** — the `Extension` interface has no `behaviors` field. Custom behaviors belong in the app's `ContributesDefinition` entry-point config.
- **`xmlui build-lib` produces UMD + ESM; `--mode=metadata` produces IDE support files** — react, react-dom, and xmlui are always externals. Third-party deps the extension uses are bundled.
- **Never bundle react into an extension** — declare react/react-dom as peer dependencies, not regular dependencies. Two React instances break hooks silently.

### From Topic 15: Global Context & Utilities

- **`AppContextObject` is a flat evaluation scope, not a state layer** — it is merged into each component's expression context alongside the 6 state composition layers, but it is NOT one of those layers. It does not participate in `initialState` or `$root` traversal.
- **Only `avg` and `sum` exist as math utilities** — `min` and `max` are NOT in AppContext. Use `Math.min(...arr)` and `Math.max(...arr)` for those. Declaring otherwise in documentation is incorrect.
- **localStorage uses dot-path semantics** — the key `"prefs.theme.tone"` reads `localStorage["prefs"]` then uses lodash `get` for the sub-path `theme.tone`. The first segment is always the root entry name; the rest is a lodash path into the parsed JSON value.
- **`storageTimestamp` is the reactive trigger for storage changes** — it increments after every `writeLocalStorage`, `deleteLocalStorage`, or `clearLocalStorage` call. Pair it with `<ChangeListener listenTo="{storageTimestamp}">` to react to any storage mutation.
- **`confirm()` is async — always `await` it** — it returns `Promise<boolean>`. Calling it without `await` discards the result. Event handlers that use `confirm` must be declared `async`.
- **Extension `functions` land in `globalVars`, NOT in AppContext** — they are merged during `StandaloneApp` initialization, before the first render. Both paths make functions callable from expressions, but through different injection mechanisms. First-write-wins applies to `globalVars` (extension functions); AppContext wins over nothing since it's always present.
- **`appGlobals` is for static config, not callable functions** — it mirrors the contents of `config.json` or `App` props. Access as `appGlobals.myKey`. Do NOT place function references there.
- **`Actions` namespace uses the ComponentRegistry action pipeline** — `Actions.myAction()` is different from calling a JavaScript function directly. It runs through the full async pipeline with success/error handling and inspector tracing.
- **`mediaSize.size` is a breakpoint string (`"xs"` through `"xxl"`)** — boolean shorthand exists (`mediaSize.phone`, `mediaSize.desktop`, etc.) but `mediaSize.sizeIndex` (0–5) enables numeric comparisons for column counts and threshold logic.
- **Never import `date-fns` directly in component code** — use the AppContext date functions instead. They apply system locale and the XMLUI-standard formatting choices automatically.
- **`toast.promise()` is the cleanest async feedback pattern** — it handles loading/success/error transitions in one call and avoids manual ID-tracking for dismiss.

### From Topic 16: Option-Based Components

- **Two contexts, two concerns** — `OptionTypeProvider` controls *how* Options render (which React component handles them); `OptionContext` controls *data collection* (what options exist). They are independent — a component may need both, one, or neither.
- **`OptionNative` has zero rendering logic** — it purely delegates to whatever `OptionTypeProvider` has specified. If no provider exists, it renders nothing. Never add rendering logic to `OptionNative`.
- **`HiddenOption` enables filterable option lists** — in Select advanced mode and AutoComplete, `<Option>` elements render as invisible `HiddenOption` components that register into a `Set<Option>`. The visible dropdown items are generated from that Set, not from the React tree. This is why `<Option>` children are invisible in searchable/multi-select mode.
- **RadioGroup deliberately skips both option contexts** — it uses `RadioGroupStatusContext` instead, because all options are always visible and no collection/filtering phase is needed. This is correct design, not an oversight.
- **Option `value` must be a scalar** — `convertOptionValue` normalizes objects, arrays, and NaN to `""`. Only `string`, `number`, `boolean`, and `null` are valid option values.
- **`keywords` is free search coverage** — any option can carry a `keywords` string array. The Select filter concatenates `value + label + keywords.join(" ")` before matching. Use this for abbreviations, alternate names, and synonyms.
- **`groupBy` uses extra Option fields** — pass any extra field on your `<Option>` elements (e.g., `department="Engineering"`) and set `groupBy="department"` on Select. Options without the named field land in "Ungrouped" (shown first).
- **Pagination generates options with `OptionNative` directly** — it bypasses XMLUI markup and constructs `<OptionNative>` elements programmatically. This is an internal pattern; application developers don't write `<OptionNative>` in markup.
- **Custom rendering priority** — children (complex React nodes) → per-option `optionRenderer` function → component-level `optionRenderer` prop → plain `label` string. Later items are fallbacks only.
- **For a new filterable selection component** — use `OptionContext` + `HiddenOption` for collection, then render your visible items from the collected `Set<Option>`. For always-visible options (no filtering), use RadioGroup-style direct context instead.

### From Topic 24: Accessibility

- **Semantic HTML before ARIA** — use `<button>`, `<nav>`, `<header>`, `<main>`, `<footer>` before reaching for `role="button"` etc. Sites with custom ARIA roles have 34% more a11y errors.
- **Every interactive element needs keyboard support** — `Tab` to reach, `Enter`/`Space` to activate, arrow keys for composite widgets (menus, tabs, radio groups), `Escape` to dismiss overlays.
- **ARIA state attributes must stay synchronized** — `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled` must update in sync with visual state. A stale ARIA attribute is worse than no attribute.
- **Icon-only elements require `aria-label`** — when a Button or trigger has no visible text, add `aria-label` on the container and `aria-hidden="true"` on the icon.
- **Hint and error text need `aria-describedby`** — give the hint element an `id="hint-{input-id}"` and add `aria-describedby="hint-{input-id}"` to the input. This is currently missing from FormItem/TextBox.
- **Link component has critical a11y failures** — it is not keyboard-focusable and does not respond to Enter/Space. Treat as a known debt item; do not build navigation features relying on its accessibility.
- **Add `test.describe("Accessibility")` to every component spec** — test attribute presence, correct ARIA role, state transitions on interaction, and keyboard operability. Use `page.getByRole()` locators; they double as ARIA correctness checks.
- **Touch targets ≥ 44×44px** — required for mobile; 24×24px is acceptable for pointer-only interfaces. Check bounding box in tests when in doubt.

### From Topic 23: Testing Conventions

- **E2E for behavior, unit for logic — never mix** — full rendering, interactions, accessibility, and event firing belong in Playwright E2E. Props normalization, hook behavior, and state transformations belong in Vitest unit tests.
- **Always confirm `toBeFocused()` before pressing keys** — missing this wait is the #1 cause of parallel-execution flakiness. Never use `{ delay: X }` workarounds; find and add the correct `toBeFocused()` or `toBeVisible()` assertion.
- **Run `--workers=10` before committing E2E tests** — tests that pass at `--workers=1` but fail at `--workers=10` have a race condition. Always verify parallel stability.
- **Use `testState` + `expect.poll()` for event testing** — write to `testState` in the event handler, then `await expect.poll(testStateDriver.testState).toEqual(...)` after triggering the event. Never use `setTimeout` to wait.
- **Template properties require `<property name="...">` wrapper** — the tag-based form (`<myTemplate>`) does not work in `initTestBed` strings and fails silently. Always use the `<property>` element form.
- **Mock before import in unit tests** — `vi.mock()` must be declared before importing the module under test. Importing first causes mock configuration to be ignored for that module.
- **Always wait for visibility before clicking** — elements may not yet be in the DOM immediately after `initTestBed()`. Add `await expect(el).toBeVisible()` before `.click()`.
- **CSS pseudo-classes cannot be tested with `.toHaveCSS()`** — Playwright `.hover()` triggers JS events but not CSS `:hover`/`:focus`/`:active`. Test the functional outcome (tooltip appearing, class added by JS) instead.

### From Topic 22: Monorepo Structure & Tooling

- **Run `npm install` only at the repository root** — workspaces hoist all dependencies to root `node_modules/`. Running `npm install` inside a workspace package creates a duplicate `node_modules/` that shadows hoisted packages and causes version conflicts.
- **Use `"workspace:*"` for cross-workspace dependencies** — extension packages must list `xmlui` as `"xmlui": "workspace:*"` in `devDependencies` (or `peerDependencies`). This is replaced by the actual published version when `changeset publish` runs.
- **Create changeset files manually — never use `changeset add` in agents** — `changeset add` is interactive. Create `.changeset/<unique-name>.md` directly with the correct frontmatter. Verify with `npx changeset status`.
- **All XMLUI changes are `patch` bumps unless explicitly stated otherwise** — minor and major bumps require deliberate decision. Do not upgrade to `minor` just because a feature was added.
- **Only add changesets for user-facing changes** — internal refactors, test infrastructure, `.ai/` docs, and dev-docs do not need changesets. Changesets trigger version bumps and release notes.
- **Never remove the `^` prefix from `dependsOn` to speed up a build** — `"^build:extension"` ensures upstream packages are built first. Removing it causes downstream builds to pick up stale outputs with no error message.
- **`cache: false` in turbo.json means "always run, never replay"** — use this only for tasks that fetch external data or produce non-deterministic outputs. Setting it on a normal build task defeats the caching system.
- **Build the CLI (`npm run build:bin`) before running any other framework build command** — the `xmlui` CLI binary reads from `xmlui/dist/bin/`. If `bin/` is missing or stale, every `xmlui *` command silently uses the old behavior.

### From Topic 21: Build System & Deployment

- **Two deployment modes are mutually exclusive** — standalone (buildless UMD `<script>` tag) and Vite (compiled, npm). The choice is made at project creation. The same `.xmlui` markup works in both; switching modes requires restructuring the project.
- **Always build the CLI before running other build commands** — `npm run build:bin` must run first (from `xmlui/`). Other `xmlui *` commands use the compiled bin output; skipping this step causes confusing "command not found" or stale-code errors.
- **`vite-xmlui-plugin` must be listed in `plugins[]` for `.xmlui` files to be bundled** — without it, `.xmlui` file imports resolve as empty modules or 404s. It handles `.xmlui`, `.xmlui.xs`, and `.xmlui.xm` transformations.
- **`react`, `react-dom`, and `xmlui` are always external in extension builds** — they must be peer dependencies and never bundled. Bundling them causes duplicate React instances and `useContext` failures.
- **Use `xmlui build --prod` for production; never ship a dev build** — `--prod` enables `INLINE_ALL` bundling, `flatDist`, relative roots, and disables MSW. Dev builds include mock service workers and unminified code.
- **Metadata must be regenerated before the VS Code extension build** — the Turborepo pipeline (`gen:langserver-metadata` → `xmlui-vscode#build`) enforces this. If you bypass Turborepo, run `npm run gen:langserver-metadata` manually first.
- **Extension lib builds use `xmlui build-lib`, not `vite build`** — `xmlui build-lib` applies the correct externalization, output format, and metadata extraction pipeline. Running `vite build` directly misses these configurations.
- **`turbo.json` `^` prefix = upstream workspace ordering** — `"dependsOn": ["^build:extension"]` means all upstream `build:extension` tasks must complete before this package's task starts. Do not remove it to "speed up" a build — extension consumers will get stale outputs.

### From Topic 20: Language Server (LSP)

- **Regenerate `xmlui-metadata-generated.js` after any `createMetadata()` change** — run `npm run gen:langserver-metadata` and commit the updated file. If you skip this step, new props/events will be invisible to completions and hover.
- **Do not import framework code into the language server** — the LSP runs in Node.js without React or browser APIs. Only the parsers, metadata types, and `vscode-languageserver` packages are safe to import.
- **Do not call the XML parser directly in services** — always call `document.parse()`, which returns the cached `ParseResult`. Calling the parser directly bypasses caching and causes redundant parsing on every service request.
- **Add new diagnostic rules in the parser, not the language server** — push a `ParserDiag` to `parseResult.errors` in the XML parser or transform stage; the LSP's diagnostic service automatically forwards all parser errors to VS Code.
- **Do not modify `xmlui-metadata-generated.js` by hand** — it is a build artifact. Manual edits are overwritten by the next `npm run gen:langserver-metadata` run.
- **New LSP features require three changes** — (1) a handler function in `services/`, (2) registration via `connection.on*()` in `server-common.ts`, and (3) the capability declared in `onInitialize`. Missing any one prevents VS Code from sending the request.
- **Do not wire the lint pass as a diagnostic without performance testing** — lint is a second AST pass that checks unrecognized props. Running it on every keystroke risks causing typing lag; benchmark before enabling.
- **Implicit props (`when`, `data`, `inspect`) are injected by `ComponentMetadataProvider`** — they are not in the generated metadata file. Do not add them to the generation script; they are hardcoded in the provider intentionally.

### From Topic 19: Inspector & Debugging

- **Always gate trace code on `xsVerbose`** — check `appContext.appGlobals?.xsVerbose === true` before constructing any log entry or calling `pushXsLog`. The function itself is a noop when `_xsLogs` is absent, but the guard also prevents expensive object construction and JSON serialization.
- **Use `createLogEntry()` for all new entries** — it pre-fills `ts`, `perfTs`, and `traceId` automatically. Do not construct `XsLogEntry` objects by hand.
- **Always pair `pushTrace()` with `popTrace()` in a `finally` block** — a mismatched trace stack silently corrupts the `traceId` field for every subsequent event in the session. There is no error thrown; the only symptom is trace IDs pointing to the wrong interaction.
- **Pass `traceId` explicitly when starting a multi-step operation** — capture the return value of `pushTrace()`, pass it as the `traceId` field in every subsequent entry, and call `popTrace()` after the operation completes.
- **Do not pass live React or React Query objects into `pushXsLog`** — the safe-clone in `pushXsLog` handles circular references, but complex live objects may lose properties; serialize into the `text` field with `JSON.stringify` instead.
- **Every new framework subsystem should emit at least start/complete/error entries** — anything that can fail or take measurable time should have these three entry kinds so it is visible in the inspector trace. Name them `"mysubsystem:start"`, `"mysubsystem:complete"`, `"mysubsystem:error"`.
- **`kind` strings follow a `"namespace:event"` convention** — built-in kinds use `api:`, `handler:`, `state:`, `error:`, `modal:`. New subsystems should define their own namespace prefix to avoid collisions.
- **Do not add tracing to event handlers manually** — `event-handlers.ts` already wraps every `on*` handler universally. Adding trace calls inside a handler body produces duplicate entries.
- **The buffer is a circular log capped at 200 by default** — if you need more history during a debugging session, set `xsVerboseLogMax` in globals. Entries of important kinds (interactions, API calls, navigations) are preserved during trimming.

### From Topic 18: Parsers

- **Use the right parser for the right language** — XML markup → `parseXmlUiMarkup()`, JS expressions → `Parser.parseExpr()`, CSS values → `StyleParser.parseSize()/parseBorder()/parseColor()`, keyboard shortcuts → `parseKeyBinding()`. Do not attempt to parse one language with another parser.
- **Expressions are compiled lazily** — attribute values like `{count + 1}` are stored as raw strings by the XML parser and compiled by the scripting parser the first time they are evaluated. This is by design; do not attempt to pre-compile expressions during XML parsing.
- **Imported modules may only contain function declarations** — `ModuleValidator` enforces this. Any top-level statement that is not a function declaration in a `<script src>` module will produce a parse error. This is intentional to ensure modules are safe to cache and free of side effects.
- **Always use `ModuleLoader` to load script modules** — calling `parseScriptModule()` directly bypasses circular dependency detection and caching. All module loading must go through `ModuleLoader.loadModule()`.
- **The XML parser is error-recovering; the style parser is not** — the XML parser collects multiple diagnostics and continues. The style parser throws `StyleParserError` immediately on the first invalid token. Handle these differently in error reporting code.
- **`ParserDiag` includes `contextPos`/`contextEnd`** — these wider bounds are specifically for the language server to draw squiggles over the right range. Do not conflate `pos`/`end` (error location) with `contextPos`/`contextEnd` (highlight range).
- **Circular import errors include the full chain** — `CircularDependencyDetector` returns an array like `["A", "B", "A"]`. Use the entire chain in error messages so the developer can trace the loop.
- **Theme variables are first-class tokens in the style lexer** — the `xmlui-` prefix is recognized as a `ThemeId` token, not an error. When writing tests for style parsing, include theme variable inputs alongside literal value inputs.
- **Both parsers run in Vite mode and standalone mode** — the same source handles build-time and browser-runtime parsing. Do not introduce any Node.js-only or browser-only APIs into the parser modules.

### From Topic 17: Error Handling Strategy

- **Every component has its own ErrorBoundary automatically** — `StateContainer` wraps each component's `Container` in an `ErrorBoundary` with `location="container"`. A render crash in one component shows an inline red overlay; all siblings and ancestors continue working. Do NOT add manual ErrorBoundary wrappers inside component renderers.
- **ErrorBoundary auto-resets when `node` prop changes** — navigating to a new page replaces the root ComponentDef node, which triggers `componentDidUpdate` → `setState({ hasError: false })`. Error state clears on navigation without any manual intervention.
- **`signError()` is the universal error notifier** — it shows a red toast, logs `[xmlui] <message>` to console, and records to the trace system. The `[xmlui]` prefix is intentional for Playwright test capture via `page.on('console')`.
- **Event handler errors always call `signError()` by default** — the central `try/catch` in `event-handlers.ts` calls `signError()` unless `options.signError === false`. This means any unhandled exception in an `onClick`, `onSubmit`, etc. automatically surfaces as a toast.
- **Loader errors set `$error` in scope** — `LOADER_ERROR` reducer action makes `{ statusCode, message, details, response }` available as `$error` in `onError` handlers and `errorNotificationMessage` expressions. Returning `false` from `onError` suppresses the automatic toast.
- **Parse errors replace broken components, not the whole app** — `errReportComponent()`, `errReportScriptError()`, and `errReportModuleErrors()` substitute failed `.xmlui` components with inline full-page error UIs showing file/line/column. The rest of the app renders normally.
- **`pushXsLog()` is a noop in production** — all trace logging for errors (kind: `"error:boundary"`, `"error:runtime"`, `"error:handler"`) is zero-cost when `window._xsVerbose` is not set. Set it in DevTools to enable verbose trace collection.
- **`GenericBackendError` normalizes multiple server error formats** — RFC 7807, Google-style, and Microsoft-style error responses all produce the same `.statusCode`/`.message`/`.details` interface. Check `err.statusCode` for 401/403/404 special cases.
- **`ThrowStatementError` is the markup throw mechanism** — explicit `throw` in markup script produces a `ThrowStatementError`. It carries `errorObject` (whatever was thrown) and `.message` for the toast. It is caught by the event handler try/catch like any other error.
- **`data-error-boundary` attribute marks fallback elements** — use `page.locator('[data-error-boundary]')` in Playwright tests to assert an error boundary was triggered.

