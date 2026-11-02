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
