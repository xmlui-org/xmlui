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
