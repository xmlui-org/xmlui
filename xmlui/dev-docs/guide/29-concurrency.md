# Cooperative Concurrency and Cancellation

This chapter describes the cooperative concurrency model XMLUI exposes
to handler authors. The framework gives every async event handler a
**cancellation token**, four **handler policies** that decide how
overlapping invocations behave, a **bounded handler lifetime**, and an
opt-in **transactional state-write** wrapper.

The default behaviour is unchanged from earlier releases — handlers
run in parallel, never time out beyond 30 s, and write to container
state live. Apps opt in to the stronger guarantees one prop at a
time.

---

## 1. The `$cancel` Token

Every async handler receives a `$cancel` variable in its evaluation
scope. The token is `AbortSignal`-shaped:

```ts
{
  aborted: boolean;
  reason?: "user" | "supersede" | "timeout" | "unmount";
  throwIfAborted(): void;
  onAbort(cb: () => void): void;
  signal: AbortSignal; // pass to App.fetch / native APIs
}
```

The token is aborted by the dispatcher when one of:

- The component unmounts mid-handler (`reason: "unmount"`).
- A `single-flight` policy supersedes the running invocation
  (`reason: "supersede"`).
- The per-handler timeout fires (`reason: "timeout"`).
- The user calls `App.cancel()` (`reason: "user"`).

Handlers cooperate by checking `$cancel.aborted` in long loops, by
passing `$cancel.signal` to `App.fetch`, or by listening through
`$cancel.onAbort()`.

Example — abortable long-running loop:

```xmlui
<Button onClick="
  for (const id of ids) {
    if ($cancel.aborted) return;
    await App.fetch('/api/process/' + id, { signal: $cancel.signal });
  }
" />
```

`App.fetch` already inherits `$cancel.signal` when invoked from a
handler without an explicit `init.signal`, so the common case is
zero-config.

---

## 2. `App.cancel()`

`App.cancel()` aborts running handlers from script:

| Call | Effect |
|---|---|
| `App.cancel()` | Aborts every tracked handler in the page (`reason: "user"`). |
| `App.cancel("u1")` | Aborts every event handler on component `u1`. |
| `App.cancel("u1", "click")` | Aborts only `u1.onClick`. |

`parallel` handlers are not tracked by the coordinator and are
unaffected — they must observe `$cancel` cooperatively, or rely on
the per-component unmount abort.

---

## 3. Handler Policy

Every component accepts a `handlerPolicy` prop that controls how
overlapping handler invocations are coordinated. Per-event overrides
use `handlerPolicy:<eventName>`.

| Policy | Behaviour |
|---|---|
| `parallel` (default) | Every invocation runs concurrently. No coordination. |
| `single-flight` | A new invocation aborts the running one (`reason: "supersede"`) and starts. |
| `queue` | New invocations wait FIFO; none overlap. |
| `drop-while-running` | New invocations are ignored while one is running; a `concurrency-handler-dropped` trace fires. |

```xmlui
<!-- Form submit — every click is the latest intent. -->
<Button handlerPolicy:onClick="single-flight" onClick="saveForm()" />

<!-- Background sync — process every request, in order. -->
<Timer handlerPolicy="queue" onTick="sync()" />

<!-- Click-spam guard — ignore extra clicks while busy. -->
<Button handlerPolicy:onClick="drop-while-running" onClick="purchase()" />
```

### Decision Tree

| Use case | Policy |
|---|---|
| Form submit, search-as-you-type | `single-flight` |
| Background sync, message queue | `queue` |
| Idempotent click guard | `drop-while-running` |
| Independent telemetry beacons | `parallel` (default) |

---

## 4. Handler Timeout

Handlers are bounded by `appGlobals.defaultHandlerTimeoutMs` (default
`30000`). Per-handler overrides via `handlerTimeoutMs:<eventName>`.
`0` disables the timeout for long-poll patterns.

When the budget elapses, the `$cancel` token aborts with
`reason: "timeout"` and a `kind:"concurrency"` /
`code:"concurrency-handler-timeout"` trace fires.

- `appGlobals.strictConcurrency === false` (default): the trace is
  `warn` and stays inside the Inspector.
- `appGlobals.strictConcurrency === true`: the trace escalates to
  `error`, the runtime emits `console.error`, and the timeout routes
  through `App.signError` so it surfaces on the global error channel.

```xmlui
<!-- Long-polling handler that must not auto-cancel. -->
<Sse handlerTimeoutMs:onMessage="0" onMessage="appendLog(msg)" />
```

---

## 5. Transactional Writes

A handler marked `transactional` (or `transactional:<eventName>`)
buffers every container-state write and replays them in a single
reducer dispatch when the handler resolves. On cancellation, timeout,
or error the buffer is discarded.

This restores a happens-before contract between handlers — without it,
two parallel handlers writing to the same key can interleave and the
last write wins.

Trade-off: one extra dispatch per handler, plus other handlers see
the snapshot rather than in-flight writes. Use it for handlers that
mutate multiple keys atomically (e.g. optimistic counters, cart
updates).

```xmlui
<Button transactional:onClick="true" onClick="
  state.cart.items.push(item);
  state.cart.total = computeTotal();
  state.cart.lastChange = Date.now();
" />
```

---

## 6. Cancellation Reasons

`$cancel.reason` lets handlers branch on the cancellation source:

```xmlui
<Button onClick="
  try {
    await save();
  } catch (e) {
    if ($cancel.reason === 'supersede' || $cancel.reason === 'unmount') {
      // expected — silent
      return;
    }
    toast.error('Save failed: ' + e.message);
  }
" />
```

---

## 7. Diagnostics

All concurrency diagnostics carry `kind: "concurrency"` and a
`ConcurrencyCode`:

| Code | Severity (default / strict) | Origin |
|---|---|---|
| `concurrency-handler-cancelled` | info | `App.cancel()` |
| `concurrency-handler-superseded` | info | `single-flight` |
| `concurrency-handler-dropped` | info | `drop-while-running` |
| `concurrency-handler-timeout` | warn / error | timeout |
| `concurrency-transactional-conflict` | warn / error | transactional commit |

Cancellation, supersession, and drop are *expected outcomes* of the
policies — they stay info-level even in strict mode.

---

## 8. `appGlobals` Reference

| Key | Default | Meaning |
|---|---|---|
| `strictConcurrency` | `false` | Escalate timeout and conflict diagnostics to errors + console + global error channel. |
| `defaultHandlerTimeoutMs` | `30000` | Ambient handler lifetime; `0` disables. |

---

## 9. See also

- [`.ai/xmlui/concurrency.md`](../../.ai/xmlui/concurrency.md) — AI reference
- [`xmlui/dev-docs/guide/15-app-context.md`](./15-app-context.md) — `App.*` global functions
- [`xmlui/dev-docs/guide/17-error-handling.md`](./17-error-handling.md) — `signError` pipeline
