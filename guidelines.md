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
