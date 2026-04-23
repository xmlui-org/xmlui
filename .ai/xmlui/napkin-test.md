# Napkin Test: Can XMLUI Be Described in 10 Simple Rules?

**Question:** Can we describe XMLUI in 10 simple rules like Tcl ("everything is a string") or Lisp ("7 axioms")? If not, what's blocking simplicity?

**Short answer:** Yes — the core semantics fit 10 rules and the rules hold up across almost all real programs. But three systematic complications prevent the rules from being truly "napkin"-clean, and roughly 15 concepts that exist in the runtime have no clear user-facing documentation.

---

## The 10 Rules

### Rule 1 — Everything Is a Component; Every Component Is an XML Tag

The only primitive is the **component**, written as an XML tag. Text, layout, data loading, routing, forms, and invisible helpers (`DataSource`, `variable`, `event`, `method` …) are all components. Built-in and user-defined components are syntactically identical at the call site.

```xml
<App>
  <DataSource id="ds" url="/api/items" />
  <List data="{ds.value}" />
</App>
```

---

### Rule 2 — Attribute Values Are Literal Strings or `{JavaScript}` Expressions

An attribute value is a literal string (`label="Save"`), a pure expression (`value="{count + 1}"`), or an interpolated mix (`label="Step {step} of {total}"`). Object literals need double braces: `data="{{ key: 'val' }}"`. Props that accept a markup subtree instead of a value use the `<property>` child tag.

```xml
<Card>
  <property name="header">
    <HStack><Icon name="star" /><Text value="Title" /></HStack>
  </property>
</Card>
```

---

### Rule 3 — Attributes Named `on` + UppercaseLetter Are Event Handlers; All Others Are Bindings

`onClick`, `onSubmit`, `onDidChange` are event handlers — their value is JavaScript that runs asynchronously when the event fires, with full access to side effects (state mutation, API calls, navigation). All other attribute values are synchronous bindings — they must return a value immediately and cannot cause side effects. The `<event name="click">` child tag is the multi-statement equivalent of an `on*` attribute.

```xml
<!-- single expression: inline handler attribute -->
<Button label="Delete" onClick="deleteItem(item.id)" />

<!-- multiple statements: use <event> -->
<Button label="Save">
  <event name="click">
    saveItem(form.value);
    navigate("/done");
  </event>
</Button>
```

---

### Rule 4 — Every `{Expression}` in a Binding Is a Live Reactive Dependency

When any value an expression depends on changes, the expression re-evaluates automatically — no subscriptions to write. Variables are declared with `var.name="{initialValue}"` or `<variable name="..." value="..."/>`. A binding expression that returns a Promise throws; async work belongs in event handlers.

```xml
<App var.count="{0}">
  <Text value="Clicked {count} times" />
  <Button label="+" onClick="count = count + 1" />
</App>
```

---

### Rule 5 — Variables Flow Down to All Inline Nested Children; Component Declaration Files Are Not Children

A variable declared on a component is visible to every component tag nested inside it in the same markup file, at any depth. A user-defined component's declaration file (`MyCard.xmlui`) is a separate file — it is not a nested child, so parent variables do not reach it. Pass data explicitly as `$props`, or declare it with `global.`/`Globals.xs` to make it visible everywhere.

```xml
<!-- var.greeting flows into all nested built-in tags in this file -->
<App var.greeting="Hello">
  <Card><Text value="{greeting}" /></Card>
</App>

<!-- MyBadge.xmlui cannot see greeting — pass it explicitly -->
<MyBadge label="{greeting}" />
```

---

### Rule 6 — A Variable Is Visible Within Its Declaring Component Tag; Writing to an Undeclared Name Raises an Error

`var.` (or `<variable>`) scopes a name to the declaring tag and its descendants. A component `id` places a named API object in scope for siblings and ancestors. Context variables (`$item`, `$routeParams`, etc.) are injected automatically by the component that provides them. Assigning to a name that was never declared raises a visible error toast.

```xml
<App>
  <TextBox id="query" />
  <!-- query.value is in scope for siblings because of id= -->
  <Button label="Search" onClick="navigate('/search?q=' + query.value)" />
</App>
```

---

### Rule 7 — `DataSource` Fetches Automatically; `APICall` Fires on Demand

`DataSource` fetches on mount and re-fetches whenever its URL expressions change; access the result as `{ds.value}`. `APICall` only fires when triggered: either by calling `id.execute()` from a handler, or by placing it inline inside an `<event>` block. Omitting `invalidates` on an `APICall` invalidates the entire app data cache after the call.

```xml
<!-- fetches automatically; result at users.value -->
<DataSource id="users" url="/api/users" />
<List data="{users.value}" />

<!-- fires only on button click; invalidates= re-fetches users -->
<APICall id="del" url="/api/users/{selectedId}" method="DELETE" invalidates="users" />
<Button label="Delete" onClick="del.execute()" />
```

---

### Rule 8 — User-Defined Components Receive Data via `$props` and Send It Back via `emitEvent()`

A `.xmlui` component file receives data only through `$props` (read-only snapshot) and emits data back with `emitEvent('name', value)`, which fires the parent's `onName` attribute. Parent-to-child imperative calls go through exported `<method>` tags. Slot content is written by the parent but evaluated in the parent's scope and rendered inside the component's layout; named slot props must end with `Template`.

```xml
<!-- RatingBadge.xmlui -->
<component>
  <Text value="{$props.label}: {$props.score}" />
  <Button label="Upvote" onClick="emitEvent('vote', $props.id)" />
</component>

<!-- parent -->
<RatingBadge label="Quality" score="{item.score}" id="{item.id}" onVote="submitVote($event)" />
```

---

### Rule 9 — Styling Uses Layout Props (Instance) or Theme Tokens (Shared)

Layout props (`width`, `padding`, `color`, `gap`, …) set values for one instance only. Theme tokens set shared design values; override them per-instance with themed prop names, or for a subtree with `<Theme>`. Star sizing (`width="2*"`) distributes remaining space proportionally; responsive props (`width-sm="…"`) apply from a breakpoint upward.

```xml
<!-- layout prop: this instance only -->
<Button label="Save" width="200" marginTop="16" />

<!-- <Theme> overrides tokens for the whole subtree -->
<Theme backgroundColor--Button="green">
  <Button label="Go" /><Button label="Cancel" />
</Theme>

<!-- star sizing: TextBox takes all remaining width -->
<HStack><Text value="Name:" width="80" /><TextBox width="1*" /></HStack>
```

---

### Rule 10 — Scripting Is a Sandboxed, Interpreted Subset of JavaScript

XMLUI scripting covers everyday JavaScript (expressions, arrow functions, array/object literals, most standard library methods) but runs in a sandbox interpreter. Key differences: `obj.prop` on `null`/`undefined` returns `undefined` instead of throwing; `var` at component scope is reactive; `async`/`await` and `class` are unsupported; `setTimeout`/`fetch`/`setInterval` are not available (use `delay()` and `DataSource`); synchronous expressions time out at 1000 ms to prevent UI freeze. `let`/`const` are non-reactive and available only in handlers.

```xml
<!-- null-safe: returns undefined instead of throwing if address is null -->
<Text value="{user.address.city ?? 'Unknown'}" />

<!-- var is reactive; let/const are not (handler-only) -->
<App var.count="{0}">
  <Button onClick="let n = count + 1; count = n" />
</App>
```

---

## What Blocks Simplicity: Three Complications

### Complication 1 — The Scope Rule Requires Two Sentences, Not One

Rule 5 and Rule 8 describe the same thing from two angles: scope flows downward into all nested built-in components, but stops at user-defined component file boundaries. These two rules are logically one rule, but they cannot be collapsed into a single clean sentence without the exception-clause making it long.

The gap that makes this worse: the `scoping.md` user-facing article demonstrates the two cases well but does not open with a compact summary rule. A reader has to infer the unified principle from the examples.

**Suggestion:** Add a brief introductory paragraph to `website/content/docs/pages/scoping.md` that states both sides as one mental model before the examples begin: *"Variables declared on a component flow downward through all nested components in the same file. They stop at the boundary of a user-defined component file — pass them explicitly as props, or declare them as `global.` variables if they are needed everywhere."*

---

### Complication 2 — `var` Has Three Different Behaviors Depending on Where It Appears

- `var.x="{expr}"` in markup: reactive — re-evaluates when `expr`'s dependencies change, **but once the variable is explicitly assigned, the initializer expression stops being tracked**
- `var x = expr` in a code-behind `.xs` file: reactive — same shadowing rule applies
- `let x = expr` / `const x = expr` in event handlers: non-reactive, ordinary local variables

The shadowing behavior is the critical undocumented case: `var.items="{apiResult.value}"` behaves as a reactive binding until the user writes `items = someEditedList`. After that first assignment, `items` is decoupled from `apiResult.value` and will not update when the API data refreshes. This is intentional (it models "the user has taken manual control"), but it is invisible from reading the code and surprises developers.

**Suggestion:** Add a subsection to `website/content/docs/pages/markup.md`, in the Variables section, titled **"When does a variable stop following its initial value?"**. Explain the shadowing rule with a before/after code example. This is the most impactful single documentation addition to close the gap between what the 10-rule summary says and what developers actually experience.

---

### Complication 3 — The Sandbox Differences Are Invisible Until Runtime

The restrictions in Rule 10 are not visible in syntax — code that looks like valid JavaScript may behave differently or fail at runtime. A developer who knows JavaScript will write `async function loadData()` and get a runtime error. The optional-chain-by-default silently masks null-reference bugs that would have surfaced as TypeErrors. The unavailable globals are discovered only when the code runs.

**Suggestion:** Extend `website/content/docs/pages/scripting.md` with a dedicated section **"Differences from standard JavaScript"** containing the full differences table from Rule 10, an explanation of each behavioral difference (especially the `var`-is-reactive rule and the null-safe property access), and notes for developers coming from JavaScript. This is the natural home for this material since `scripting.md` is already where users go to understand the scripting model.

---

## Documentation Gaps

The following concepts exist in the runtime but are absent or insufficiently explained in user-facing documentation (`website/content/docs/`). Each row includes a concrete suggestion for where to fix it.

| # | Gap | Risk | Suggested fix |
|---|-----|------|---------------|
| G2 | **Undeclared name assignment raises an error toast** — this behavior is correct and visible, but undocumented; developers encountering the error toast for the first time have no reference that explains it or tells them they need to declare the variable first | Medium — correct behavior, undocumented | Add a callout to `scoping.md` in the Variables section that explains the error and shows the declare-before-assign pattern |
| G3 | **`var` initializer shadowing** — `var.foo="{expr}"` stops reacting to `expr` after the first explicit assignment to `foo` | High — confusing reactivity | New subsection in `markup.md` Variables section: "When does a variable stop following its initial value?" (see Complication 2 above) |
| G4 | **`when=false` lifecycle clarification** — when `when` starts as `false`, `onInit` does **not** fire at mount; it fires the first time `when` transitions `false`→`true`. The original claim ("fires once even when `when` is initially false") is **incorrect** — verified in `ComponentAdapter.tsx` lines 497–540: `shouldCallInit` requires `currentWhenValue` to be truthy | Medium — **original claim was wrong** | Extend the "when and lifecycle events" subsection in `visibility.md` to state explicitly: if `when` starts as `false`, `onInit` fires the first time `when` becomes `true`, not at initial mount |
| G6 | **`APICall` without `invalidates` invalidates the entire app cache** — omitting the prop causes every `DataSource` in the app to refetch after the call completes | High — performance/correctness | Add a warning callout with an example to `website/content/docs/reference/components/APICall.md` in the `invalidates` property description |
| G7 | **Dependent `DataSource` fetches eagerly with `undefined`** — without a `when` guard, a `DataSource` whose URL references another DataSource's value fires immediately with the unresolved value interpolated as the string `"undefined"` | Medium | Extend `reactive-intro.md` with a "Chaining data sources" section that explains the `when` guard and shows both the broken and correct patterns |
| G8 | **Code-behind file restrictions** — `.xmlui.xs` files allow only top-level `var`/`function` declarations and named imports; `let`, `const`, `class`, control flow, and expression statements at module level are compile errors | Medium | Add a "Code-behind files" section to `scripting.md`, as part of the broader "Differences from standard JavaScript" section suggested for Complication 3 |
| G9 | **Slot data projection pattern** — `<Slot name="itemTemplate" item="{$item}" />` lets a component pass data into the slot content provided by its parent; this is how reusable components expose per-item context to their callers | Medium | Add a "Passing data into slot content" section to `user-defined-components.md` with a worked example |
| G10 | **`$self` for internal method access** — a UDC can call its own exported methods from within its own markup using the `$self` name | Low | Add a note to the Methods section of `user-defined-components.md` |
| G11 | **`method:` attribute prefix shorthand** — `<Component method:getRows="rows.filter(r => r.selected)">` is equivalent to using a `<method>` child tag; undocumented | Low | Add to the Methods section of `user-defined-components.md` alongside the existing `<method>` tag examples |
| G12 | **Polling props on `APICall`** — `pollUrl`, `maxPollAttemptsBeforeFail`, `completionCondition`, `$attempts`, `$polling`, `$progress`, `$statusData` enable polling a job-status endpoint after an initial API call; the props exist in the reference but are not explained with a usage pattern | Medium | Add a "Deferred / long-running operations" section to `APICall.md` with a minimal polling workflow example |
| G13 | **`$params` (plural) in `APICall`** — `$param` (first argument to `execute()`) is in `context-variables.md`; `$params` (all arguments as an array, accessed as `$params[0]`, `$params[1]`, etc.) is not | Low — **verify first**: `$params` is already documented in `APICall.md` (top-level context variables list and `mockExecute` table); check whether `context-variables.md` specifically is missing it before adding | Add `$params` row to `context-variables.md` in the Event handlers section only if missing there |
| G14 | **Responsive layout shorthand props** — `paddingHorizontal`, `paddingVertical`, `marginHorizontal`, `marginVertical`, `borderHorizontal`, `borderVertical` expand to their directional equivalents but are not listed in `layout.md` | Low | Add a "Shorthand spacing properties" row or table to `layout.md` |
| G15 | **Sync expression timeout** — expressions that take more than 1000ms throw; configurable via `appGlobals.syncExecutionTimeout`; no user-facing documentation of the limit or how to raise it | Low | Add a note to `scripting.md` (or `scripting-js-differences.md`) in a "Execution limits" section |

---

## Verdict

XMLUI can be summarized in 10 rules and those rules correctly predict behavior in the vast majority of programs. The framework is notably more regular than React or Angular.

The simplicity blockers are not architectural — the core design is coherent. They are:

1. **The scope rule needs two sentences** (variables stop at UDC file boundaries — one rule, but it requires a carve-out clause)
2. **`var` has a shadowing behavior after first mutation** that is invisible to readers and undocumented
3. **The sandbox restrictions are invisible until runtime** — code that looks like valid JavaScript may fail or behave differently

The documentation gaps (G2–G15) are the larger practical problem. Several high-risk gaps (G3, G5, G6) describe behaviors that fail silently or in ways that look like bugs in user code. The two highest-priority additions are: (a) documenting `var` shadowing in `markup.md` (G3), and (b) extending `scripting.md` with a "Differences from standard JavaScript" section (Complication 3 + G8 + G15 in one place).

