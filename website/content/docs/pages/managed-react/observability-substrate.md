# Observability Substrate

XMLUI captures every state change, navigation, API call, and sandbox event
into a single, structured trace. The same pipeline drives the Inspector
overlay you use during development and the audit trail you can ship to a
backend in production — there is no second instrumentation layer to set up.

## What problems this prevents

- Diagnosing a reactive cascade no longer requires sprinkling `console.log`
  statements through your markup; the trace already shows which variable,
  loader, or handler fired and in what order.
- A failing API call, a navigation, or a sandbox warning is recorded with
  enough structure (kind, source location, timing) to reproduce the
  problem without re-running the user's session.
- Production incidents can be replayed from the trace stream instead of
  reconstructed from screenshots and stack traces.
- Security-relevant events — banned DOM access, fetch attempts to
  disallowed origins, clipboard writes, navigations — are visible in one
  place rather than scattered across the browser console.

## How it works

The framework writes structured entries into a circular in-memory buffer
through a single internal `pushXsLog()` call. Every interesting event has
a well-known `kind` value (for example `app:fetch`, `navigate`,
`clipboard:copy`, `ws:connect`, `sandbox:warn`, `log:info`,
`reactive-cycle`). The Inspector overlay renders the buffer live during
development. The audit pipeline can sample and forward the same entries
to an OTLP/JSON sink in production.

Trace entries are emitted by the framework itself — you do not annotate
your components to participate. New trace kinds are added as new managed
features ship, so the audit surface grows automatically with the
framework.

## Using the Inspector

Open the Inspector overlay in development to watch the trace stream as
your app runs. Each entry shows its kind, timestamp, source location (if
known), and structured payload. Filtering by `kind` is the fastest way to
focus on a specific subsystem — for example showing only `app:fetch`
entries while debugging a network problem.

## Render passes

With `xsVerbose` on, the trace records a `render:pass` entry each time a
container re-renders. A container is `App`, a user-defined component, or an
explicit `<Container>`. The entry says why the container re-rendered, and how
long it took.

A **pass** is one render of one container: from the start of its render to
the moment its whole subtree is committed. Components that aren't containers,
such as `Text`, `Button` or `Stack`, get no entry of their own; their render
time is included in their container's pass, and they are counted in its
`rendered` field. A container that has a `var.`,
and each row of `Items` or `List`, renders inside its owner's pass. It is
counted there (`implicitContainers`, `folded`) rather than given its own
entry, unless it re-renders on its own.

| Field | Meaning |
|---|---|
| `passId`, `parentPassId` | This pass, and the pass it rendered inside, if any |
| `component`, `uid`, `udc` | The user-defined component's name, `App`, or the container's type |
| `startMs`, `durationMs` | `performance.now()` at render start; time to commit, including the subtree |
| `traceId` | The trace of the handler whose change caused the pass, when there was one |
| `cause` | Why the pass happened: one or more of the entries below |
| `implicitContainers`, `folded` | Containers rendered inside this pass, grouped by component and cause, with a count |
| `rendered`, `renderedCount` | Components rendered in this pass, counted by type, and their total. A nested container's components are counted in its own entry, not here |
| `renderedOutsidePass` | Components that rendered while no pass was open, counted by type and reported with the next pass. Omitted when there were none |
| `necessary` | `true` if the pass is a mount or any cause changed something the container's bindings read; `false` if no cause did. Omitted when a cause can't be judged |

**Reading `rendered`.** A component is counted when XMLUI re-evaluates it. A
component skipped because its inputs didn't change is not counted. So
`renderedCount` measures how far one change spread. To count everything
rendered for one change, add up `renderedCount` over a top-level pass and
every pass whose `parentPassId` leads back to it.

Each `cause` entry is one of:

- `state` with `keys`: the container's own variables changed.
- `componentState` with `uid` and `fields`: a component's state or API changed (a `MediaPlayer`'s `ended`, an event handler's `…InProgress` flag).
- `loader` with `uid` and `fields`: a `DataSource` or `APICall` changed.
- `props` with `names`: a user-defined component's props changed. `sameSourceNewIdentity` lists function props whose markup is unchanged but whose value is new.
- `parent` with `passId`, `inputs` and `keys`: the parent re-rendered and passed down something new.
- `mount`: the first render.
- `unknown`: nothing the container receives changed. Usually a React context did.

A `componentState` or `loader` cause marked `identityOnly` means the entry was
replaced by one with equal values. The pass did no useful work.

**Reading `read` and `necessary`.** Each `state`, `componentState`, `loader`,
`props` and `parent` cause also says whether the container's bindings read
what it changed:

- `read: true` means a binding reads the changed path, or a path above or below it. A binding on `ds.value.length` reads a change to `ds.value`, and a binding on `ds` reads every field of `ds`.
- `read: false` means no binding does. `readPaths` then lists what the bindings do read under the same name, for example `["ds.value"]` when `ds.inProgress` changed.
- An `identityOnly` cause is never read: nothing changed.
- A component's own state counts as read by that component. Controls such as `Select` and `Slider` display their value from it, so a `componentState` cause whose `ownState` lists changed fields is `read: true` even when no binding reads them. A change to a component's registered API only (`fields` without `ownState`) is judged against the bindings.

The paths come from the container's markup and code-behind: props, vars,
`when`, loader props and templates, anywhere under the container. Event
handlers are left out, because they read state when they run, not when the
container renders. A binding behind a `when` that is false still counts, so
`read: false` is certain and `read: true` may overstate.

A pass with `necessary: false` changed nothing its container's bindings read.
To see how much of an app's rendering that is, sum the top-level passes:

```js
(() => {
  const P = (window._xsLogs ?? []).filter((e) => e.kind === "render:pass");
  const ids = new Set(P.map((e) => e.passId));
  const top = P.filter((e) => !ids.has(e.parentPassId));
  const ms = (list) => Math.round(list.reduce((s, e) => s + e.durationMs, 0));
  const unneeded = top.filter((e) => e.necessary === false);
  console.log(`${unneeded.length} of ${top.length} top-level passes, ` +
    `${ms(unneeded)} of ${ms(top)} ms, changed nothing a binding reads`);
})();
```

**Reading durations.** A pass's duration includes every pass rendered inside
it, so add up only passes with no `parentPassId`. Durations are upper bounds:
anything React does between render and commit is counted too. React may merge
quick successive changes into one pass, so one assignment can produce at most
one pass, not exactly one.

Raise the trace size with `xsVerboseLogMax` in `xmluiConfig`; a single
interaction in a large app can produce hundreds of entries.

## Related

- [Managed React Overview](/docs/managed-react/overview)
- [DOM API Isolation](/docs/managed-react/dom-api-isolation)
- [Centralized HTTP](/docs/managed-react/http-centralization)
