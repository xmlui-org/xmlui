# Why "Managed React"? A Plain-Language Introduction

> If you have ten minutes and want to know what the Managed-React
> initiative is *for*, read this. For the full assessment see
> [`managed-react.md`](./managed-react.md). For the implementation
> plan see [`00-master-plan.md`](./00-master-plan.md).

---

## 1. What is a "managed" framework?

A programming framework is **managed** when it takes care of the
boring-but-dangerous parts *for you*, so whole categories of bugs
become impossible — not just unlikely.

The classic example is memory. In C you allocate and free memory
by hand; one mistake and the program crashes or gets hacked. In
Java or C# you don't allocate or free anything — the **runtime
manages memory**. Whole bug categories (use-after-free, buffer
overruns, leaks) just disappear.

But "managed" is bigger than memory. The .NET and JVM platforms
also manage:

- **Types** — the runtime refuses to load a program with broken
  type contracts.
- **Lifecycles** — `using` / `try-with-resources` guarantees a
  file or socket is closed even if your code throws.
- **Errors** — every exception has a known shape; you can
  reliably catch, retry, log, and report it.
- **Concurrency** — `async/await` plus cancellation tokens
  give you predictable, cancellable background work.
- **Sandboxing** — code from untrusted sources runs with
  restricted permissions.
- **Audit** — every important event lands in a structured log
  out of the box.

The promise: *the platform makes safety and quality the default,
not something each developer has to remember.*

---

## 2. What does this mean for XMLUI?

XMLUI is already a step towards "managed" because you write
declarative markup instead of imperative React code:

```xml
<App>
  <DataSource id="users" url="/api/users" />
  <List data="{users.value}">
    <H2>{$item.name}</H2>
  </List>
</App>
```

You did not write a single line of React state-management,
`useEffect`, error boundary, or fetch-cancellation code.
The framework manages all of that. That is the *managed React*
idea: the same shift from "do it yourself" to "the platform does
it for you" that Java did for C++ — but now for the React
ecosystem.

The 2026-04 work already turned XMLUI into a sandboxed
environment for expressions: you cannot accidentally call `eval`,
schedule a runaway timer, mutate the DOM behind React's back, or
fetch from a forbidden origin. That covers the **security** half
of the managed bargain.

The 17 plans in this directory cover the **other half** —
type contracts, lifecycle, errors, concurrency, accessibility,
i18n, theming, forms, routing, observability, versioning,
determinism, and build-time validation. Each plan turns a
*convention* into a *guarantee*.

---

## 3. Three concrete examples

The pattern is the same every time: today the markup *looks*
fine; tomorrow the framework *proves* it is fine.

### Example A — Type contracts

```xml
<!-- Today: silently coerced to 0 -->
<NumberBox value="hello" />
```

A prop typed as `number` accepts a string and silently turns it
into zero. No warning. After **#01 Verified type contracts**, the
language server highlights the line at edit time and the runtime
throws in strict mode.

### Example B — Forms validation

```xml
<!-- Today: you write the validators by hand -->
<TextBox bindTo="email" validate="{value.includes('@')}" />

<!-- After #09: built-in validators -->
<TextBox bindTo="email" validator="email" />
<NumberBox bindTo="age" validator="range" min="0" max="120" />
```

After **#09 Forms validation discipline** every common validator
ships built-in, server-side 422 errors map automatically to
per-field messages, and double-clicking Submit can no longer
fire two requests.

### Example C — Cancellation

```xml
<!-- Today: no way to cancel a slow handler -->
<Button onClick="slowApi.execute()" />

<!-- After #06: cooperative cancellation -->
<Button
  onClick="slowApi.execute()"
  handlerPolicy="dropWhileRunning" />
```

After **#06 Cooperative concurrency** the button has a documented
policy for what happens on a second click, and handlers receive a
`$cancel` token they can check.

---

## 4. Why does this matter?

Three reasons.

**For app authors.** You catch bugs at edit time instead of in
production. Your form code is shorter and safer. Your
accessibility is verified by the linter. Your traces have PII
stripped automatically.

**For component authors.** Metadata you write once
(`PropertyDef`, theme variables, deprecation flags) is enforced
everywhere — at parse time, at runtime, in the docs, in the
audit log.

**For organisations.** "Managed" is what enterprises pay for:
attestation that the codebase meets WCAG, GDPR, OWASP, etc.
XMLUI's metadata + trace pipeline is the natural foundation for
those reports — once enforcement is in place.

---

## 5. How the work is organised

- [`00-master-plan.md`](./00-master-plan.md) sequences all 17
  plans into 8 shippable waves, with risk ranking and per-step
  workflow.
- [`STATUS.md`](./STATUS.md) tracks live status — which
  dimensions are still open, in progress, or closed.
- The numbered plan files (`01-…` through `17-…`) each describe
  one dimension end-to-end: goal, phases, diagnostics, rollout.
- Every change ships behind a `strict[X]` switch defaulting
  `false`, so existing apps keep working. The switches flip to
  `true` together in the next major release.

---

## 6. The one-line summary

XMLUI already has all the right pieces — metadata, a single
fetch chokepoint, a sandboxed expression evaluator, a trace
pipeline, an `ErrorBoundary` on every component. The Managed
React initiative turns those pieces from *conventions you can
follow* into *guarantees the framework enforces*.

That is what makes a framework **managed**.
