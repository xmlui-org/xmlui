# Cooperative Concurrency

XMLUI coordinates overlapping event handlers for you. Every async handler
receives a cancellation token, you pick a policy that decides what happens
when handlers stack up, and a handler that hangs eventually times out and
unwinds. None of this requires you to manage `AbortController`s,
debouncers, or in-flight flags in your markup.

## What problems this prevents

- A user click-spams a *Save* button and your handler runs five times in
  parallel, each racing to write the form to your backend. With a
  `single-flight` or `drop-while-running` policy the framework keeps only
  the first or the last invocation, not all of them.
- A long-running handler keeps pushing state into a component that the
  user has already navigated away from. The framework aborts the handler
  with `reason: "unmount"` and your cooperative checks bail out cleanly.
- A `fetch` to a slow third-party service hangs the page indefinitely
  because nobody ever cancelled the request. Handlers now time out after
  30 seconds by default, and `App.fetch` automatically inherits the
  handler's cancellation signal, so the request aborts too.
- Two parallel handlers each write a few fields of the same object and
  the final state is a torn mixture of both. An opt-in `transactional`
  handler buffers all its writes and commits them in one batch — other
  handlers see the snapshot, not the in-flight half-writes.
- A handler that fails because the user cancelled it shows a "Save
  failed" error toast. `$cancel.reason` lets the handler branch on the
  cancellation source and stay silent for expected outcomes.

## How it works

When an async event handler runs, the framework gives it a fresh
`$cancel` token in scope and registers the invocation with a
per-component coordinator. The coordinator decides — based on the
`handlerPolicy` you declared — whether to start the handler at all, to
abort the previous one, to queue behind it, or to drop the new
invocation. While the handler runs, a timer races against the
`handlerTimeoutMs` budget; if the budget elapses, the token is aborted
with `reason: "timeout"`. When the handler returns (or throws or is
cancelled), the coordinator releases the slot for the next invocation.

## The `$cancel` token

Every async handler can read `$cancel`:

```xmlui copy
<Button onClick="
  for (const id of pendingIds) {
    if ($cancel.aborted) return;
    await App.fetch('/api/process/' + id);
  }
" />
```

`$cancel.signal` is a real `AbortSignal` — pass it to `App.fetch`,
`addEventListener`, or any web API that takes one. `App.fetch` actually
inherits `$cancel.signal` automatically when called from a handler, so
the common case is zero-config.

`$cancel.reason` reports why the handler was cancelled:

| reason | meaning |
|---|---|
| `"user"` | `App.cancel()` was invoked |
| `"supersede"` | a newer invocation took over (`single-flight`) |
| `"timeout"` | the handler exceeded its time budget |
| `"unmount"` | the component was removed mid-handler |

## Handler policies

Use the `handlerPolicy` prop to coordinate overlapping invocations. Use
`handlerPolicy:<eventName>` to scope a policy to a single event.

```xmlui copy
<!-- Form save: only the latest click matters. -->
<Button handlerPolicy:onClick="single-flight" onClick="saveForm()" />

<!-- Background sync: every tick must run, in order. -->
<Timer interval="5000" handlerPolicy="queue" onTick="sync()" />

<!-- Purchase: ignore extra clicks while one is in flight. -->
<Button handlerPolicy:onClick="drop-while-running" onClick="purchase()" />
```

| Policy | What happens when a new invocation arrives |
|---|---|
| `parallel` (default) | Every invocation runs concurrently. |
| `single-flight` | Aborts the running invocation (`reason: "supersede"`) and starts the new one. |
| `queue` | Waits FIFO for the current invocation to finish. |
| `drop-while-running` | Ignores the new invocation; emits a `concurrency-handler-dropped` trace. |

### Quick guide

| Use case | Pick |
|---|---|
| Form submit, search-as-you-type | `single-flight` |
| Background sync, polling, message queue | `queue` |
| Idempotent action behind a debounce | `drop-while-running` |
| Independent telemetry beacons | `parallel` (default) |

## `<Button busyOnClick>`

The most common pattern — "disable the button while saving, ignore extra
clicks" — is a one-line shorthand:

```xmlui copy
<Button busyOnClick="true" onClick="await save()">Save</Button>
```

`busyOnClick` implies `handlerPolicy:onClick="single-flight"`, exposes a
`$busy` context variable while the handler is in flight, and disables
the button so the user cannot superficially re-trigger the action.

## Cancelling from script

`App.cancel()` aborts running handlers with `reason: "user"`:

```xmlui copy
<Button onClick="App.cancel()">Stop everything</Button>
<Button onClick="App.cancel('saveBtn', 'click')">Stop the save</Button>
```

| Call | Scope |
|---|---|
| `App.cancel()` | every tracked handler in the page |
| `App.cancel(componentUid)` | every event on one component |
| `App.cancel(componentUid, eventName)` | a single event slot |

`parallel` handlers are not tracked by the coordinator and are
unaffected; they must observe `$cancel` cooperatively, or rely on the
unmount abort.

## Handler timeouts

A hung handler does not pin the queue forever. The ambient budget is
`xmluiConfig.defaultHandlerTimeoutMs` (default `30000` ms). Override per
handler with `handlerTimeoutMs:<eventName>`; set to `0` to disable.

```xmlui copy
<!-- A long-polling subscription that must not auto-cancel. -->
<EventSource url="/sse" handlerTimeoutMs:onMessage="0" onMessage="..." />
```

On timeout the `$cancel` token aborts with `reason: "timeout"` and a
`concurrency-handler-timeout` trace fires.

## Transactional writes

Mark a handler `transactional` (or `transactional:<eventName>`) to
buffer its container-state writes and commit them in a single batch on
success. On cancellation or error the buffer is discarded.

```xmlui copy
<Button transactional:onClick="true" onClick="
  state.cart.items.push(item);
  state.cart.total = computeTotal();
  state.cart.lastChange = Date.now();
" />
```

Trade-off: a transactional handler has slightly higher dispatch cost and
other handlers see the snapshot, not in-flight writes. Use it for
handlers that mutate multiple keys atomically.

## Reading the cancellation reason

Handlers that want to silence "operation failed" feedback for *expected*
cancellations can branch on `$cancel.reason`:

```xmlui copy
<Button onClick="
  try {
    await save();
    toast.success('Saved.');
  } catch (e) {
    if ($cancel.reason === 'supersede' || $cancel.reason === 'unmount') {
      return; // expected — silent
    }
    toast.error('Save failed: ' + e.message);
  }
" />
```

## Enabling strict mode

`xmluiConfig.strictConcurrency` defaults to `false`. When `true`, handler
timeouts escalate from a warn-level Inspector trace to:

- a `kind:"concurrency"` `code:"concurrency-handler-timeout"` *error*
  trace,
- a `console.error` with the component and event name, and
- a route through the global `App.signError` channel (so an `<App
  onError>` handler can react).

Cancellation, supersession, and drop are *expected outcomes* of the
policies and stay info-level even in strict mode.

```json
{
  "xmluiConfig": {
    "strictConcurrency": true
  }
}
```

## Related

- [Structured exception model](/docs/managed-react/structured-exception-model)
  — `<App onError>` and `App.errors` pick up timeouts that escape under
  strict mode.
- [Managed lifecycle vocabulary](/docs/managed-react/managed-lifecycle-vocabulary)
  — the `onUnmount` hook is what fires the `"unmount"` cancellation
  reason.
- [Fetch lifecycle](/docs/managed-react/fetch-lifecycle) — `App.fetch`
  inherits `$cancel.signal` automatically.
