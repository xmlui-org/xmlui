# Defended Routing

XMLUI treats the URL as an untrusted boundary. Instead of accepting any
string a user types and parsing it inside your page, you declare a
contract on the `<Page>` itself — types, ranges, enums, custom
validators — and the framework rejects bad URLs before your markup ever
renders. The same contract powers `$routeParams` and `$queryParams`, so
the values your expressions see are already coerced and validated.
Navigation guards observe every entry path (programmatic, link, form,
back-button, direct URL), and URL canonicalisation keeps the visible
address consistent.

## What problems this prevents

- A user typing `/users/abc` no longer reaches a page that assumed
  `$routeParams.id` was numeric — the route is rejected before render.
- `?page=-1` and `?sort=random` no longer slip through — query
  constraints validate and coerce.
- A `willNavigate` guard that "protects unsaved changes" no longer
  silently fails on browser back/forward — pop-state navigations fire
  the guard and revert when rejected.
- Raw `<a href>` clicks in user content no longer bypass your guards —
  opt in to interception and same-origin anchors route through
  `navigate()`.
- `/Users/`, `/users`, and `/users/?sort=name&page=1` no longer hit
  three different cache keys — canonicalisation collapses them.
- "Did the user really come from the link, or did the URL change under
  us?" no longer requires custom tracing — every navigation event emits
  a `kind:"navigate"` diagnostic with a precise `code`.

## How it works

Three small pieces work together. The **constraint compiler** parses
`<Page url>` and `queryParams` declarations into a validator + coercer
table; built-in names (`string`, `int`, `number`, `enum`) plus any
validator you registered via `App.registerValidator()` are honoured. The
**guard dispatcher** runs `willNavigate` and per-page `guard` for every
trigger — programmatic `navigate()`, React-Router links, pop-state, and
(opt-in) raw anchors/forms. The **canonicaliser** rewrites or warns when
the incoming URL differs from the canonical form defined on `<App>`.
Every rejection emits a `pushXsLog({ kind: "navigate", code, ... })`
diagnostic that Inspector and `<App onError>` can observe.

## Route constraints

Attach a constraint after a dynamic segment:

```xmlui copy
<App>
  <Page url="/users/:id:int(min=1)">
    <Text value="User id is a positive integer: {$routeParams.id}" />
  </Page>

  <Page url="/settings/:tab:enum(profile,billing,security)">
    <Text value="Tab: {$routeParams.tab}" />
  </Page>
</App>
```

Built-in constraint names: `string`, `int`, `number`, `enum(...)`.
Numeric constraints accept `min` and `max`. Coerced values land in
`$routeParams` — `:id:int` gives you a `number`, not a `string`.

### Custom constraints

Any unknown name resolves through the **forms validator registry** —
the same registry that powers `<Field validation>`. Register once,
reuse anywhere:

```xmlui copy
<App>
  <script>
    App.registerValidator("hex6", (value) => /^[0-9a-f]{6}$/i.test(String(value)));
  </script>
  <Page url="/swatch/:colour:hex6">
    <Text value="Swatch: #{$routeParams.colour}" />
  </Page>
</App>
```

Custom validators must be **synchronous**. A returned `Promise` or
thrown exception is treated as a rejection. Parameters inside
parentheses (`:name(arg1,arg2)`) are forwarded as the validator's
`params.args` array. If no registry entry exists, the segment falls
back to unconstrained `string` and a `code:"unknown-constraint"`
diagnostic is emitted.

## Query constraints

Use `Page queryParams` to validate the query string:

```xmlui copy
<Page
  url="/search"
  queryParams="q:string,page:int(min=1)?,sort:enum(asc,desc)?">
  <Text value="Page {$queryParams.page ?? 1}" />
</Page>
```

`?` marks a query parameter as optional; everything else is required.

## Page guards

`Page guard` runs after constraints pass and before the page renders.
It receives `to` and `from` navigation snapshots. Return values:

| Return | Effect |
|---|---|
| `true`, `undefined`, `null` | Allow navigation |
| `false` | Reject; redirect to `fallbackPath` or `/` |
| `"/path"` | Redirect to that path |
| `{ redirect: "/path" }` | Redirect to that path |

Rejected guards emit `code:"guard-bypass-attempt"`.

## Pop-state and external navigation

By default, the global `willNavigate` handler is invoked for **every**
navigation, including browser back/forward and direct URL entry. If a
guard rejects a pop-state navigation, the user-agent URL is reverted.
To opt out (e.g. for legacy apps), set `appGlobals.guardOnPopState: false`.

Raw `<a href>` clicks and form submissions bypass routing by default.
Opt in to interception in `config.json`:

```jsonc
{
  "appGlobals": { "interceptExternalNavigation": true }
}
```

When enabled, same-origin anchor clicks and GET form submissions route
through `appContext.navigate()`. The interceptor deliberately ignores
cross-origin URLs, modifier-key clicks (cmd/ctrl/shift/alt), `target`
other than `_self`, `download` anchors, `rel="external"`, non-GET
forms, and any element with `data-xmlui-bypass-router`.

## URL canonicalisation

Declare your canonical URL shape on `<App>`:

```xmlui copy
<App
  urlCase="lower"
  urlTrailingSlash="never"
  urlQueryParamOrder="alphabetical"
  nonCanonicalUrl="rewrite">
  <!-- pages -->
</App>
```

| Prop | Values | Effect |
|---|---|---|
| `urlCase` | `preserve` (default), `lower` | Lowercase the path before matching. |
| `urlTrailingSlash` | `preserve` (default), `always`, `never` | Normalize trailing slash. |
| `urlQueryParamOrder` | `preserve` (default), `alphabetical` | Sort query parameters. |
| `nonCanonicalUrl` | `warn` (default), `rewrite`, `redirect` | What to do when the URL differs. |

`warn` only logs. `rewrite` and `redirect` both replace the visible URL
with the canonical form.

## Diagnostic codes

Every routing event flows through `pushXsLog({ kind: "navigate", code,
... })`. Inspector surfaces them in the navigation timeline, and
`<App onError>` can observe them for telemetry.

| Code | Meaning |
|---|---|
| `constraint-rejected` | A route or query constraint refused the incoming value. |
| `unknown-constraint` | The constraint name is neither built-in nor registered; segment falls back to `string`. |
| `duplicate-constraint` | Two route constraints disagree on the same segment name. |
| `non-canonical-url` | The URL differs from the canonical form; action depends on `nonCanonicalUrl`. |
| `guard-bypass-attempt` | `willNavigate` or a `Page guard` rejected a navigation; state was reverted. |

## Strict mode

Strict mode is **on by default**. `appGlobals.strictRouting` defaults to
`true`, which escalates routing diagnostics from warnings to errors and
flips `nonCanonicalUrl` defaults to `"redirect"`. To opt out for a
legacy app that needs pre-1.0 warn-only behaviour:

```jsonc
{ "appGlobals": { "strictRouting": false } }
```

## Related

- The full reference is in the [Routing](../routing) chapter.
- For per-page guards across asynchronous boundaries, see
  [Structured Exception Model](./structured-exception-model.md)
  and the `<Fallback>` pattern.
