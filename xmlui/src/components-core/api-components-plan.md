# API Components — Design Plan (Draft for Review)

> Status: **proposal / planning**, not yet implemented.
> Owner: framework team. Reviewers: please use the *Open Questions* section at the bottom.

## 1. Motivation

XMLUI already lets users describe HTTP traffic with [`DataSource`](../components/DataSource/DataSource.tsx) (read / cache) and [`APICall`](../components/APICall/APICall.tsx) (mutate). Each of those components carries the **entire** request shape — `url`, `method`, `headers`, `body`, `queryParams`, transforms — in markup, repeated at every call site. There is no first-class way to:

- describe a backend API **once** and reuse its endpoints everywhere;
- give the call sites a stable, *named* operation (e.g. `users.getById`) instead of raw URL strings;
- separate **API surface** (what the backend offers) from **app intent** (when to fetch and what to do with the result);
- expose mocks, base URLs, auth headers, retry policy, response transforms as a coherent unit;
- provide IntelliSense / LSP hints for endpoints.

The proposal: an **API Component** — a special flavour of user-defined component that *only* exposes typed, parameterised endpoint methods. A consumer either calls them imperatively (`myApi.getData({...})`) or wires them into a reactive `DataSource` / `APICall`.

```xml
<!-- Components/GoogleDocsApi.xmlui -->
<Component name="GoogleDocsApi" role="api">
  <ApiEndpoint name="getDocument"
               method="get"
               url="/documents/{$params.docId}"
               headers="{ { Authorization: 'Bearer ' + $props.token } }" />

  <ApiEndpoint name="updateDocument"
               method="patch"
               url="/documents/{$params.docId}"
               body="{ $params.patch }" />
</Component>

<!-- Main.xmlui -->
<App>
  <GoogleDocsApi id="docs" token="{appGlobals.gdocsToken}" />

  <DataSource id="doc"
              sourceApi="{docs.getDocument}"
              apiParameters="{ { docId: $routeParams.id } }" />

  <APICall id="saveDoc"
           sourceApi="{docs.updateDocument}"
           apiParameters="{ { docId: $routeParams.id, patch: $form.value } }"
           invalidates="{docs.getDocument}" />

  <Button label="Save" onClick="saveDoc.execute()" />
</App>
```

`<APICall>` can also be used inline inside an event handler, without a top-level `id`, when no external reference to the call is needed:

```xml
<App>
  <GoogleDocsApi id="docs" token="{appGlobals.gdocsToken}" />

  <DataSource id="doc"
              sourceApi="{docs.getDocument}"
              apiParameters="{ { docId: $routeParams.id } }" />

  <Button label="Save (2)">
    <event name="click">
      <APICall sourceApi="{docs.updateDocument}"
               apiParameters="{ { docId: $routeParams.id, patch: $form.value } }"
               invalidates="{docs.getDocument}" />
    </event>
  </Button>
</App>
```

## 2. What already exists (and what does *not*)

Findings from a code audit performed before writing this plan. Each claim below is grounded in a file reference so reviewers can verify.

### 2.1 Compound components already expose methods

A user-defined component can already declare methods that callers invoke through its `id`:

- The transform collects every attribute whose start-segment is `method` (e.g. `method.addValues="..."`) **and** every `<method name="...">…</method>` helper element. See [transform.ts](../parsers/xmlui-parser/transform.ts#L127-L138) and [transform.ts](../parsers/xmlui-parser/transform.ts#L386-L398). They land on `CompoundComponentDef.api` as parsed event sources (`Record<string, ParsedEvent>`).
- At render time, `CompoundComponent` forwards that `api` map to the inner `Container`. See [CompoundComponent.tsx](./CompoundComponent.tsx#L100-L130).
- The container converts each entry into a callable via `lookupAction` and registers it with the **parent** container under `node.containerUid` (which is the compound instance's id). See [Container.tsx](./rendering/Container.tsx#L237-L266).
- Therefore `<MyCompound id="x" /> ... x.foo(1,2,3)` works *today* with no new infrastructure, as long as `<method name="foo">(a,b,c) => ...</method>` is declared inside `<Component name="MyCompound">`.

**Implication:** the "imperative" half of the proposal is largely a UX wrapper over existing plumbing. We do **not** need a new runtime concept just to expose methods.

### 2.2 What's missing for true "API endpoints"

- The `api` slot only stores **script source**, not **request metadata**. A consumer that wants to *introspect* an endpoint (HTTP method, URL template, body schema, response transform) has nothing to read.
- `DataSource.url` and `APICall.url` are *required string* props ([DataSource.tsx](../components/DataSource/DataSource.tsx#L28-L34), [APICall.tsx](../components/APICall/APICall.tsx#L48-L54)). There is **no existing indirection** like `sourceApi="..."`. They are resolved by `RestApiProxy.resolveUrl` → `generateFullApiUrl` against `appGlobals.apiUrl` ([RestApiProxy.ts](./RestApiProxy.ts#L490-L505)).
- There is **no notion of a parameter schema** on either component. Today everything is built ad-hoc with `extractParam`.
- A compound component has **no implicit access to its outer scope**. The only inbound channels are (a) its declared properties, exposed inside the template as the implicit `$props` object, and (b) the outbound `emitEvent(name, ...args)` mechanism that lets the template signal back to the consumer ([CompoundComponent.tsx](./CompoundComponent.tsx#L155-L175)). It can keep its *own* internal state through `<variable name="…">` declarations, but those are not inherited from anywhere. There is **no registry of endpoint metadata** that downstream `DataSource`/`APICall` instances could look up by dotted name.

### 2.3 Pieces we can reuse verbatim

| Need | Existing piece |
|------|----------------|
| Build and dispatch the HTTP request | [`RestApiProxy.execute`](./RestApiProxy.ts#L209-L240) — already handles URL templating, headers, credentials, traceparent injection, x-ue-client-tx-id, error parsing, abort. |
| Cached reactive fetches with `value` / `loaded` / `inProgress` / `refetch` | [`DataLoader`](./loader/DataLoader.tsx) (React Query backed), driven through [`loader-rendering`](./container/loader-rendering.tsx). |
| Imperative one-shot calls with confirm / optimistic / invalidates | [`callApi` action](./action/APICall.tsx#L380-L580). |
| Method exposure | The `api` mechanism described in §2.1. |
| Endpoint as a callable loader function | [`ExternalDataLoader`](./loader/ExternalDataLoader.tsx) — a `Loader` driven by an arbitrary async `loaderFn`. |
| Cross-component imperative invocation | `registerComponentApi` chain ([Container.tsx](./rendering/Container.tsx#L237-L266), [ContainerWrapper](./rendering/ContainerWrapper.tsx#L237-L260)). |

The plan below intentionally reuses these primitives rather than introducing a parallel stack.

## 3. Conceptual model

An **API Component** is a user-defined component that:

1. has at least one `<ApiEndpoint>` declaration in its template;
2. is normally non-visual (renders nothing or just slot content);
3. exposes one *callable* per endpoint on its `id` (`docs.getDocument(...)`);
4. publishes an **endpoint registry** alongside its callables so that `DataSource` / `APICall` can resolve `sourceApi="{docs.getDocument}"` to a full request template;
5. may declare instance-level configuration (`baseUrl`, default `headers`, `mock`, retry / backoff) through ordinary `var.*` / `prop` attributes.

An API Component is **not** a new component subtype with a separate renderer. It is a *convention layered over `CompoundComponentDef`*: any compound with `apiEndpoints` populated is treated as one. This keeps the framework surface area small.

### 3.1 An endpoint definition

A single endpoint carries roughly the same shape as `ApiOperationDef` ([RestApiProxy.ts](./RestApiProxy.ts#L44-L53)) plus a few extras for ergonomics and reactivity:

```ts
type ApiEndpointDef = {
  name: string;                            // "getDocument"
  method: HttpMethod;                      // "get" | "post" | ...
  url: string;                             // "/documents/{$params.docId}"  (binding expressions allowed)
  queryParams?: Record<string, any>;       // values may be binding expressions referring to $params
  headers?: Record<string, any>;
  body?: any;
  rawBody?: any;
  payloadType?: "json" | "form" | "multipart-form";
  credentials?: "omit" | "same-origin" | "include";

  // Reactive / shaping concerns (mostly for DataSource consumers)
  resultSelector?: string;
  transformResult?: ArrowExpression;       // (data) => ...
  errorTransform?: ArrowExpression;

  // Typed contract (validation, LSP, docs, OpenAPI round-trip)
  parameters?: Record<string, ApiTypeSpec>;   // request inputs ($params.*)
  returns?: ApiTypeSpec;                      // expected response shape

  // Per-endpoint overrides
  mock?: ArrowExpression;                  // ($params) => mock data
  invalidates?: string | string[];         // for mutations
};

// A schema node deliberately kept as a subset of an OpenAPI 3.1 Schema
// Object so the two formats can round-trip losslessly for the supported
// constructs.
type ApiTypeSpec = {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null" | "any";
  format?: string;                         // "date-time", "uuid", "email", …
  required?: boolean;                      // shorthand for object props
  nullable?: boolean;
  enum?: any[];
  defaultValue?: any;
  description?: string;
  example?: any;

  // Composite shapes
  properties?: Record<string, ApiTypeSpec>; // for type: "object"
  items?: ApiTypeSpec;                      // for type: "array"
  ref?: string;                             // "#/components/schemas/User"

  // Where the value travels in the HTTP request (parameters only)
  in?: "query" | "path" | "header" | "body" | "cookie";
};
```

Binding expressions in `url`, `queryParams.*`, `headers.*`, `body` see exactly the context that endpoints are declared in — the inside of the api-component's template. Concretely they may reference:

- `$params` — the caller's argument bundle (the imperative call argument, or the resolved `apiParameters` value when invoked through a `DataSource` / `APICall`);
- `$props` — the api-component instance's own properties (e.g. a `token` or `baseUrl` passed as `<GoogleDocsApi token="…" />`);
- the api-component's internal variables declared with `<variable name="…">` (referenced by bare name);
- `appGlobals` — same as anywhere else in XMLUI.

We reuse the existing `extractParam` evaluator so the substitution rules are identical to today's `DataSource` / `APICall`.

### 3.2 Calling convention

```ts
docs.getDocument({ docId: "abc" })          // returns Promise<result>
docs.getDocument({ docId: "abc" }, { signal })
```

The single-object-argument form is the canonical one — it maps cleanly to `$params` inside the endpoint definition. The optional second argument accepts a `signal` — a standard [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) obtained from an `AbortController`. Passing it lets the caller cancel the in-flight HTTP request (e.g. when a component unmounts or React Query discards a stale query). The framework passes this signal automatically when invoking an endpoint on behalf of a `DataSource`; imperative callers that need cancellation can pass their own. We also generate a positional variant when `parameters` lists an ordered schema, so `myApi.addValues(1, 2, 3)` works (it becomes `{ args: [1,2,3] }` exposed as both `$params.args` and `...$params.args`).

### 3.3 Typed shapes for parameters and return values

Every `<ApiEndpoint>` may declare a `parameters` map and a `returns` schema using `ApiTypeSpec`. These serve four distinct purposes:

1. **Runtime validation.** Before sending the request the endpoint runner verifies `$params` against `parameters` (required keys, primitive types, enum membership). Mismatches become diagnostics in dev mode and hard errors in production for `required: true` fields. After the response arrives, `returns` can be used to validate the payload shape (opt-in, off by default for performance).
2. **LSP / completion.** The language server reads the schemas to offer property completion on `$params.…` inside the endpoint definition, on the imperative call site (`docs.getDocument({ docI│ })`), and on consumers of the result (`doc.value.│`).
3. **Documentation.** The doc generator emits a table of parameters and a sample response shape per endpoint in the components reference.
4. **OpenAPI round-trip.** `ApiTypeSpec` is a deliberate subset of an OpenAPI 3.1 Schema Object — see §9.

In markup, schemas can be declared inline (compact, JSON-ish) or with helper child elements when they grow:

```xml
<ApiEndpoint name="getDocument"
             method="get"
             url="/documents/{$params.docId}"
             parameters="{ {
               docId: { type: 'string', required: true, in: 'path' },
               include: { type: 'array', items: { type: 'string', enum: ['comments','revisions'] }, in: 'query' }
             } }"
             returns="{ {
               type: 'object',
               properties: {
                 id: { type: 'string' },
                 title: { type: 'string' },
                 updatedAt: { type: 'string', format: 'date-time' }
               }
             } }" />
```

For large or shared schemas, lift them into a `<Schema name="…">` helper at the top of the api-component and reference them by `ref`:

```xml
<Component name="GoogleDocsApi" role="api">
  <Schema name="Document">
    <Field name="id" type="string" />
    <Field name="title" type="string" />
    <Field name="updatedAt" type="string" format="date-time" />
  </Schema>

  <ApiEndpoint name="getDocument"
               method="get"
               url="/documents/{$params.docId}"
               parameters="{ { docId: { type: 'string', required: true } } }"
               returns="{ { ref: '#/Document' } }" />
</Component>
```

`<Schema>` and `<Field>` are themselves `role="api"` helper elements: they produce no runtime UI, they only contribute named entries to `CompoundComponentDef.apiSchemas`.

## 4. Markup surface

Endpoints are declared with the `<ApiEndpoint>` helper element inside a `<Component role="api">` definition.

```xml
<Component name="SpaceXApi" role="api">
  <variable name="baseUrl" value="{$props.baseUrl ?? 'https://api.spacexdata.com/v4'}" />

  <ApiEndpoint name="getLaunches" method="get"
               url="{baseUrl}/launches"
               queryParams="{ { limit: $params.limit ?? 10 } }"
               resultSelector="docs" />

  <ApiEndpoint name="getLaunch" method="get"
               url="{baseUrl}/launches/{$params.id}" />

  <ApiEndpoint name="createLaunch" method="post"
               url="{baseUrl}/launches"
               body="{ $params }"
               invalidates="getLaunches" />
</Component>
```

- Natural XMLUI feel — every endpoint is its own visible element, easy to read and to diff.
- Each endpoint can host children (e.g. a `<Mock>` child with custom logic, or an `<OnError>` child).
- Plays well with LSP discovery (`<ApiEndpoint name="…"` is trivial to index).
- `<ApiEndpoint>` is only legal inside `<Component role="api">` definitions; the transform extracts it during the prepare phase and **drops it from the children list** so it never reaches the renderer.

> **`role` as a general stereotype mechanism.** The `role` attribute on `<Component>` is designed to be open-ended — `"api"` is the first defined value, but the same attribute can serve as the extension point for future stereotypes. One candidate is `role="entity"` for components that describe database entities (fields, relationships, validation rules), analogous to how JPA annotations or ActiveRecord models capture the shape of a data model without rendering UI. Other stereotypes may emerge as the framework grows. The transform and the prepare pipeline can branch on `role` to apply stereotype-specific processing (endpoint extraction for `"api"`, schema extraction for `"entity"`, etc.) while keeping all compound-component machinery shared.

## 5. Compile-time pipeline

All `<ApiEndpoint>` discovery happens during the existing prepare phase, so renders pay no extra cost.

```
xmlui source
  │
  ▼
parser (parsers/xmlui-parser/transform.ts)
  │   ─ recognises <ApiEndpoint> only inside CompoundComponent definitions
  │   ─ extracts: name, method, url, queryParams, headers, body, parameters, mock, …
  │   ─ removes those elements from the rendered children
  ▼
CompoundComponentDef {
  ...,
  apiEndpoints: Record<string, ApiEndpointDef>
}
  │
  ▼
prepareComponentDef (components-core/prepare-component-def.ts)
  │   ─ existing computeCompoundComponentMetadata enriches with
  │       derivedProps / derivedEvents / usesSlots
  │   ─ NEW computeApiEndpointMetadata:
  │       · validates each ApiEndpointDef (url present, method known, etc.)
  │       · pre-parses binding expressions
  │       · synthesises a `__endpoint_<name>` entry in `api`
  │         whose body is "(args) => Actions.callApi({...resolvedOperation})"
  │
  ▼
ContainerWrapper / Container
  │   ─ existing path picks up `api` and calls
  │       parentRegisterComponentApi(containerUid, api)
  │   ─ NEW: also publishes `__apiEndpoints` (the raw ApiEndpointDef map)
  │     on the same registry entry so DataSource / APICall can introspect.
  ▼
runtime
  ─ caller invokes `docs.getLaunches({...})` → executes synthesised method
  ─ DataSource with sourceApi="docs.getLaunches" reads `docs.__apiEndpoints.getLaunches`
```

### 5.1 Parsing changes (`transform.ts`)

- Add `"ApiEndpoint"` to the recognised helper node names (similar to how `method`, `variable`, `loaders`, `uses` are handled in [transform.ts](../parsers/xmlui-parser/transform.ts#L370-L400)).
- Only allow it inside a `CompoundComponent` template. Outside, emit a `diagApiEndpointOnlyInComponent` diagnostic.
- For each occurrence, attach a fully-parsed `ApiEndpointDef` to `CompoundComponentDef.apiEndpoints`.
- Strip the element from the rendered template tree so it produces no UI.

### 5.2 New file: `components-core/api-component/prepare-api-endpoints.ts`

Pure function:

```ts
export function computeApiEndpointMetadata(def: CompoundComponentDef): void
```

Responsibilities:

1. Normalise each `ApiEndpointDef`: lower-case method, default `payloadType=json`, default `credentials=same-origin`, etc.
2. Pre-parse binding expressions (url, query, headers, body) using the existing `Parser`, store the AST in a `__parsed` cache so we don't reparse per call.
3. Emit `def.api[name] = synthesisedMethodSource(endpoint)` so the existing `Container` API-registration path picks it up automatically.
4. Emit `def.api.__getEndpoint = "(name) => __endpointTable[name]"` (or attach the table directly to the registered api object — see §5.3) so consumers can introspect.

### 5.3 Runtime registration (`Container.tsx`)

Inside the `useEffect` that registers `api` ([Container.tsx](./rendering/Container.tsx#L237-L266)):

```ts
if (node.apiEndpoints) {
  api.__apiEndpoints = node.apiEndpoints;          // raw def map
  api.__apiInstanceUid = node.containerUid;        // for diagnostics
}
parentRegisterComponentApi(node.containerUid, api);
```

That single attachment is enough for DataSource / APICall to resolve `myApi.someMethod` via:

```ts
const target = lookupComponentApi("docs");          // existing helper
const endpoint = target?.__apiEndpoints?.["getLaunches"];
```

## 6. Consumer-side: `sourceApi` on `DataSource` / `APICall`

### 6.1 New props (both components)

| Prop | Type | Meaning |
|------|------|---------|
| `sourceApi` | `string` (dotted `componentId.endpointName`) | Bind this loader / mutator to an endpoint on an API component. Mutually exclusive with `url`. |
| `apiParameters` | `any` (usually object literal) | Becomes `$params` when the endpoint template is resolved. |
| `apiOverrides` | `object`, optional | Per-call overrides: `headers`, `queryParams`, `transformResult`, etc. Merged on top of the endpoint def. |

When `sourceApi` is set, `url`, `method`, `body`, `headers`, `queryParams`, `payloadType`, `credentials` on the call site are ignored unless explicitly given inside `apiOverrides`. Validation rule emitted at prepare time.

### 6.2 Wiring inside `DataSource`

Today `DataSource` is normalised into a `<DataLoader>` by `ApiBoundComponent`. We add a new branch:

```
if (props.sourceApi) {
  emit a <ApiBoundDataLoader sourceApi=… apiParameters=… />
} else {
  emit a <DataLoader url=… method=… ... />     // existing
}
```

`ApiBoundDataLoader` is implemented exactly like `ExternalDataLoader` ([ExternalDataLoader.tsx](./loader/ExternalDataLoader.tsx)) but its `doLoad` resolves the endpoint via the registry and delegates to `RestApiProxy.execute`:

```ts
const doLoad = useCallback(async () => {
  const [apiId, methodName] = sourceApi.split(".");
  const target = lookupComponentApi(apiId);
  if (!target?.__apiEndpoints?.[methodName]) {
    throw new Error(`Unknown endpoint: ${sourceApi}`);
  }
  const endpoint = target.__apiEndpoints[methodName];
  const operation = buildOperation(endpoint, apiParameters, apiOverrides);
  return await new RestApiProxy(appContext).execute({ operation, params: apiParameters });
}, [sourceApi, apiParameters, apiOverrides, lookupComponentApi]);
```

This keeps caching (React Query) intact: the **query key** is derived from `sourceApi + resolvedUrl + apiParameters` (mirroring the existing `DataLoaderQueryKeyGenerator`).

### 6.3 Wiring inside `APICall`

Symmetric. The existing `callApi` action builds an `ApiOperationDef` from props. We add: if `sourceApi` is set, build the operation from the resolved endpoint instead. All other features (`confirmTitle`, `invalidates`, `getOptimisticValue`, `deferredMode`, etc.) continue to work because they operate on the operation envelope, not its source.

### 6.4 Invalidation across the new boundary

`invalidates="getLaunches"` (a method name) should invalidate every DataSource that targets the same `apiId.getLaunches`. Implementation: when an `ApiBoundDataLoader` registers its React Query key, it also tags it with `sourceApi`. The invalidator gains a code path that matches by `sourceApi` tag in addition to URL.

## 7. Imperative invocation details

### 7.1 The synthesised method body

`prepare-api-endpoints.ts` produces source like:

```js
($params, $callOptions) => Actions.callApi({
  uid: __apiEndpointUid,
  method: __endpoint.method,
  url:    __endpoint.url,
  headers:__endpoint.headers,
  queryParams: __endpoint.queryParams,
  body:   __endpoint.body,
  payloadType: __endpoint.payloadType,
  credentials: __endpoint.credentials,
  invalidates: __endpoint.invalidates,
  params: { $params: $params },
  ...$callOptions,
}, { resolveBindingExpressions: true });
```

Note that the synthesised method *runs inside the api-component's own container*, so `$props` and the component's internal variables are already in scope when `Actions.callApi` resolves the endpoint's binding expressions — no special-case evaluator, and no extra parameter plumbing for them. The only fresh value the wrapper has to inject is `$params`.

### 7.2 Return value

Imperative calls return a Promise resolving to the **transformed** result (i.e. after `resultSelector` + `transformResult`). On error, the Promise rejects with a `GenericBackendError`. The caller may handle it inline; no toast is emitted unless the endpoint set `inProgressNotificationMessage` / `errorNotificationMessage`.

### 7.3 Mocks

If `endpoint.mock` is defined, `RestApiProxy.execute` is bypassed and the mock arrow expression is invoked with the resolved `$params`. This matches the existing `onMockExecute` behaviour in [APICall action](./action/APICall.tsx#L395-L416) but is declared once at endpoint level rather than at every call site.

## 8. Configuration & inheritance

API components leverage what compound components already provide:

| Need | How |
|------|-----|
| Per-instance configuration (token, baseUrl, …) | Standard compound props: `<GoogleDocsApi token="…" baseUrl="…" />`. Inside endpoint definitions they are read through `$props.token`, `$props.baseUrl`. |
| Derived / cached values | `<variable name="baseUrl" value="{$props.baseUrl ?? appGlobals.apiUrl}" />` inside `<Component>`; referenced as `{baseUrl}` in endpoint URLs. |
| Default headers (auth) | Either set on each `<ApiEndpoint headers="…">` referencing `$props.token`, or hoisted to a `defaults` slot (see §13). |
| Multiple instances | Each id has its own state container and its own `$props`. The endpoint table is registered per instance, so two `<GoogleDocsApi>` instances with different tokens stay isolated. |

## 9. OpenAPI interoperability

OpenAPI round-trip is a **v1 goal**, not a future add-on. An api-component should be both *generatable from* and *exportable to* an [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) document, with no loss for the constructs the framework actually models.

### 9.1 Why first-class, not deferred

- Most teams already have an OpenAPI document for the backend they consume. Hand-writing a parallel api-component is wasteful and drifts over time.
- Exporting back lets XMLUI api-components serve as a *single source of truth* for the front-end's view of an API — the exported document can drive client codegen in other languages or be uploaded to a contract registry.
- The constraint of "must round-trip" forces our schema model (`ApiTypeSpec`) to stay aligned with a well-understood standard, which reduces bikeshedding on type shapes.

### 9.2 Mapping table

| OpenAPI 3.1 concept | XMLUI api-component equivalent |
|---|---|
| `info.title`, `info.version` | `<Component name="...">` + props (e.g. `version="…"`) |
| `servers[0].url` | `$props.baseUrl` on the api-component instance (or a `<variable name="baseUrl">`) |
| `paths.<path>.<method>` | One `<ApiEndpoint method="…" url="…">` per operation |
| `operationId` | `<ApiEndpoint name="…">` |
| `parameters[]` (path / query / header / cookie) | Entries in `parameters` with `in: "path" \| "query" \| "header" \| "cookie"` |
| `requestBody.content.application/json.schema` | Entry in `parameters` with `in: "body"` |
| `responses."200".content.application/json.schema` | `returns` |
| `components.schemas.<Name>` | `<Schema name="Name">` helper at the top of the api-component |
| `$ref: "#/components/schemas/Foo"` | `ref: "#/Foo"` in an `ApiTypeSpec` |
| `security` / `securitySchemes` | `$props.token` + endpoint `headers`; bearer / api-key schemes round-trip, OAuth flows are a v2 concern |
| `tags` | `tags` array on `<ApiEndpoint>` (informational; used by docs generator) |

Constructs *outside* this subset (callbacks, links, OAuth flows, XML payloads, `oneOf`/`anyOf` polymorphism beyond simple union-with-discriminator) are preserved during a round-trip via an opaque `x-xmlui-passthrough` extension so importers don't lose data they don't yet understand.

### 9.3 Tooling

Two CLI commands ship alongside the existing `xmlui` CLI:

- `xmlui openapi import <spec.yaml> --out Components/<Name>.xmlui` — reads a YAML/JSON OpenAPI 3.1 document and emits a `<Component role="api">` definition with one `<ApiEndpoint>` per operation and one `<Schema>` per reusable component schema.
- `xmlui openapi export Components/<Name>.xmlui --out <spec.yaml>` — reverse direction. Reads the prepared `CompoundComponentDef.apiEndpoints` and `apiSchemas`, and serialises them back to OpenAPI 3.1.

Both commands are pure transformations over the already-parsed component metadata, so they live in a separate package (`packages/xmlui-openapi`) and depend only on `xmlui-parser` + a YAML library. The importer reuses the existing diagnostics infrastructure to flag unsupported constructs as warnings (not errors) so partial imports remain useful.

A pair of golden-file tests guarantees the round-trip: for each fixture spec, `import → export` produces a document equivalent to the original (modulo formatting and `x-xmlui-passthrough` round-tripping of unsupported keys).

## 10. Diagnostics, validation, errors

- **Prepare-time**
  - `<ApiEndpoint>` outside a `<Component>` → error.
  - Duplicate endpoint `name` within the same component → error.
  - `method` not in `httpMethodNames` → error.
  - `url` missing **and** no `mock` provided → error.
- **Call-site**
  - `sourceApi` set together with `url` → warning, `url` wins is forbidden; or vice-versa.
  - `sourceApi` references unknown component / unknown endpoint → run-time error surfaced as the loader's `error` event (no crash).
- **Type contract** (when `endpoint.parameters` is declared)
  - Required parameter missing → run-time error before sending the request.
  - Type mismatch → warning in dev mode, ignored in production.

## 11. Worked example: GitHub REST API

A small but realistic api-component that wraps a subset of the [GitHub REST API v3](https://docs.github.com/en/rest), chosen because it's familiar to most developers and exercises every concept introduced above: path / query / header / body parameters, schemas with `$ref`, mutating endpoints with `invalidates`, derived `<variable>`s, instance props for auth, and both imperative + reactive consumers.

### 11.1 The api-component definition

```xml
<!-- Components/GitHubApi.xmlui -->
<Component name="GitHubApi" role="api">
  <variable name="baseUrl" value="{$props.baseUrl ?? 'https://api.github.com'}" />
  <variable name="authHeader" value="{$props.token ? 'Bearer ' + $props.token : null}" />

  <!-- ===== Reusable schemas ===== -->
  <Schema name="User">
    <Field name="login" type="string" required="true" />
    <Field name="id" type="integer" required="true" />
    <Field name="avatar_url" type="string" format="uri" />
    <Field name="html_url" type="string" format="uri" />
    <Field name="name" type="string" nullable="true" />
    <Field name="company" type="string" nullable="true" />
  </Schema>

  <Schema name="Repository">
    <Field name="id" type="integer" required="true" />
    <Field name="name" type="string" required="true" />
    <Field name="full_name" type="string" required="true" />
    <Field name="private" type="boolean" required="true" />
    <Field name="description" type="string" nullable="true" />
    <Field name="stargazers_count" type="integer" />
    <Field name="language" type="string" nullable="true" />
    <Field name="owner" ref="#/User" />
  </Schema>

  <Schema name="Issue">
    <Field name="id" type="integer" required="true" />
    <Field name="number" type="integer" required="true" />
    <Field name="title" type="string" required="true" />
    <Field name="state" type="string" enum="{ ['open', 'closed'] }" required="true" />
    <Field name="body" type="string" nullable="true" />
    <Field name="user" ref="#/User" />
    <Field name="created_at" type="string" format="date-time" />
    <Field name="updated_at" type="string" format="date-time" />
  </Schema>

  <!-- ===== Read endpoints ===== -->
  <ApiEndpoint name="getAuthenticatedUser"
               method="get"
               url="{baseUrl}/user"
               headers="{ { Authorization: authHeader, Accept: 'application/vnd.github+json' } }"
               returns="{ { ref: '#/User' } }" />

  <ApiEndpoint name="listUserRepos"
               method="get"
               url="{baseUrl}/users/{$params.username}/repos"
               headers="{ { Accept: 'application/vnd.github+json' } }"
               parameters="{ {
                 username: { type: 'string', required: true, in: 'path' },
                 type:     { type: 'string', enum: ['all','owner','member'], in: 'query' },
                 sort:     { type: 'string', enum: ['created','updated','pushed','full_name'], in: 'query' },
                 per_page: { type: 'integer', defaultValue: 30, in: 'query' }
               } }"
               queryParams="{ { type: $params.type, sort: $params.sort, per_page: $params.per_page } }"
               returns="{ { type: 'array', items: { ref: '#/Repository' } } }" />

  <ApiEndpoint name="getRepo"
               method="get"
               url="{baseUrl}/repos/{$params.owner}/{$params.repo}"
               headers="{ { Accept: 'application/vnd.github+json' } }"
               parameters="{ {
                 owner: { type: 'string', required: true, in: 'path' },
                 repo:  { type: 'string', required: true, in: 'path' }
               } }"
               returns="{ { ref: '#/Repository' } }" />

  <ApiEndpoint name="listIssues"
               method="get"
               url="{baseUrl}/repos/{$params.owner}/{$params.repo}/issues"
               headers="{ { Accept: 'application/vnd.github+json' } }"
               parameters="{ {
                 owner: { type: 'string', required: true, in: 'path' },
                 repo:  { type: 'string', required: true, in: 'path' },
                 state: { type: 'string', enum: ['open','closed','all'], defaultValue: 'open', in: 'query' }
               } }"
               queryParams="{ { state: $params.state } }"
               returns="{ { type: 'array', items: { ref: '#/Issue' } } }" />

  <!-- ===== Mutating endpoints ===== -->
  <ApiEndpoint name="createIssue"
               method="post"
               url="{baseUrl}/repos/{$params.owner}/{$params.repo}/issues"
               headers="{ { Authorization: authHeader, Accept: 'application/vnd.github+json' } }"
               parameters="{ {
                 owner:  { type: 'string', required: true, in: 'path' },
                 repo:   { type: 'string', required: true, in: 'path' },
                 title:  { type: 'string', required: true, in: 'body' },
                 body:   { type: 'string', in: 'body' },
                 labels: { type: 'array', items: { type: 'string' }, in: 'body' }
               } }"
               body="{ { title: $params.title, body: $params.body, labels: $params.labels } }"
               returns="{ { ref: '#/Issue' } }"
               invalidates="listIssues" />

  <ApiEndpoint name="updateIssue"
               method="patch"
               url="{baseUrl}/repos/{$params.owner}/{$params.repo}/issues/{$params.number}"
               headers="{ { Authorization: authHeader, Accept: 'application/vnd.github+json' } }"
               parameters="{ {
                 owner:  { type: 'string', required: true, in: 'path' },
                 repo:   { type: 'string', required: true, in: 'path' },
                 number: { type: 'integer', required: true, in: 'path' },
                 title:  { type: 'string', in: 'body' },
                 body:   { type: 'string', in: 'body' },
                 state:  { type: 'string', enum: ['open','closed'], in: 'body' }
               } }"
               body="{ { title: $params.title, body: $params.body, state: $params.state } }"
               returns="{ { ref: '#/Issue' } }"
               invalidates="listIssues" />
</Component>
```

Notice how all six concepts are visible at a glance:

- `role="api"` marks the component; no visual children are allowed.
- Two `<variable>`s derive helpers (`baseUrl`, `authHeader`) from instance props.
- `<Schema>` + `<Field>` declare reusable types; `ref: "#/User"` re-uses them.
- `parameters` declare the typed contract; `in: "path" | "query" | "body"` describes transport.
- `returns` describes the response shape (arrays of `$ref`s included).
- `invalidates="listIssues"` chains mutations to the cache invalidation of read endpoints on the same instance.

### 11.2 Consumer usage

```xml
<!-- Main.xmlui -->
<App>
  <!-- Single api-component instance, configured once -->
  <GitHubApi id="gh" token="{appGlobals.githubToken}" />

  <!-- Reactive: load the signed-in user once -->
  <DataSource id="me" sourceApi="{gh.getAuthenticatedUser}" />

  <!-- Reactive: load issues for the repo named in the route, refetches when state filter changes -->
  <variable name="stateFilter" value="open" />
  <DataSource id="issues"
              sourceApi="{gh.listIssues}"
              apiParameters="{ {
                owner: $routeParams.owner,
                repo:  $routeParams.repo,
                state: stateFilter
              } }" />

  <H1>Hello, {me.value.name ?? me.value.login}</H1>

  <Select id="stateSelect" initialValue="open" onDidChange="stateFilter = $value">
    <Option value="open" label="Open" />
    <Option value="closed" label="Closed" />
    <Option value="all" label="All" />
  </Select>

  <List items="{issues.value}">
    <Text>#{$item.number} — {$item.title} — <em>{$item.state}</em></Text>
  </List>

  <!-- Mutating: top-level APICall referenced by id -->
  <APICall id="closeIssue"
           sourceApi="{gh.updateIssue}"
           confirmTitle="Close issue?"
           confirmMessage="This will close issue #{$params.number}."
           apiParameters="{ {
             owner: $routeParams.owner,
             repo:  $routeParams.repo,
             number: $selectedIssue.number,
             state: 'closed'
           } }" />
  <Button label="Close selected" onClick="closeIssue.execute()" />

  <!-- Mutating: inline APICall inside an event handler, no top-level id -->
  <Button label="New issue">
    <event name="click">
      <APICall sourceApi="{gh.createIssue}"
               apiParameters="{ {
                 owner: $routeParams.owner,
                 repo:  $routeParams.repo,
                 title: 'Filed from XMLUI',
                 labels: ['from-xmlui']
               } }"
               invalidates="{gh.listIssues}" />
    </event>
  </Button>

  <!-- Imperative: call an endpoint from any expression -->
  <Button label="Log my repos to console"
          onClick="gh.listUserRepos({ username: me.value.login, sort: 'updated', per_page: 5 })
                     .then(repos => console.log(repos.map(r => r.full_name)))" />
</App>
```

This single page exercises every consumer pattern the framework supports:

- Reactive read with no parameters (`me`).
- Reactive read with reactive `apiParameters` driving refetch (`issues` refetches whenever `stateFilter`, `$routeParams.owner`, or `$routeParams.repo` change).
- Mutating `APICall` with confirmation, referenced by id and triggered from a button.
- Inline `APICall` inside `<event name="click">` with cross-instance-style `invalidates="{gh.listIssues}"` so the issue list refreshes after creation.
- Imperative call returning a Promise that the consumer chains.

A second `<GitHubApi id="ghPersonal" token="{appGlobals.personalToken}" />` on the same page would coexist without interference — each instance has its own React Query cache keys and its own `Authorization` header.

## 12. Open questions for reviewer

1. **Naming.** ✅ *Decided:* use **`<ApiEndpoint>`** for the endpoint helper element and **`sourceApi`** for the prop on `DataSource` / `APICall`.
2. **Marker prop vs. opt-in.** ✅ *Decided:* `role="api"` is **required**. The presence of `<ApiEndpoint>` alone is not sufficient; the author must explicitly declare the component's role. This keeps intent unambiguous and allows the transform to reject misplaced `<ApiEndpoint>` elements early with a clear diagnostic.
3. **Mutual exclusion.** ✅ *Decided:* an api-component **must not** contain any visual or layout components unrelated to the API definition. Only `<ApiEndpoint>`, `<variable>`, and future API-stereotype helper elements are legal children. The transform will emit a `diagApiComponentIllegalChild` diagnostic for any other element type.
4. **Parameter passing.** ✅ *Decided:* option **(c)** — variadic call is generated when `parameters` is declared with an ordered schema; otherwise single-object form. Concretely: `addValues(1, 2, 3)` maps to `{ args: [1,2,3] }` (exposed as `$params.args` and `...$params.args`) when `parameters` is present; `getDocument({ docId: "abc" })` is the canonical form when no schema is declared.
5. **Cross-instance discoverability.** ✅ *Decided:* use an **app-level registry**. When an api-component mounts, it registers its endpoint table in a singleton `ApiComponentRegistry` (keyed by instance id) that is accessible from anywhere in the component tree — not just from descendants. `sourceApi="{docs.getDocument}"` can therefore appear in a sibling subtree or even a different page. The registry entry is removed when the instance unmounts. The existing `lookupComponentApi` container-chain lookup remains as a fallback for locally-scoped method calls.
6. **OpenAPI / typed clients.** ✅ *Decided:* OpenAPI 3.1 round-trip is a **v1 goal**. The schema shape (`ApiTypeSpec`) is a deliberate subset of the OpenAPI Schema Object; unsupported constructs round-trip through `x-xmlui-passthrough`. See §9 for the mapping and tooling.
7. **Invalidation tags.** ✅ *Decided:* support **both** scopes:
   - A bare endpoint name (e.g. `invalidates="getLaunches"`) invalidates that endpoint on the *same* api-component instance.
   - A dotted name (e.g. `invalidates="docs.getLaunches"`) invalidates across instances via the app-level `ApiComponentRegistry`.
   Both forms can appear as a string or as an array of strings. The React Query cache key for each endpoint must therefore include the instance id so same-name endpoints on different instances never collide.
8. **`apiParameters` reactivity.** ✅ *Decided:* full consistency with `DataSource.url` behaviour. Any change to the resolved value of the `apiParameters` expression triggers a refetch (or re-execution for `APICall`) exactly as a URL change does today. The React Query key must include the serialised `apiParameters` value alongside the instance id and endpoint name so changes are reliably detected.
9. **LSP / docs surface.** ✅ *Decided:* api-components are **first-class** in both the language server and the documentation pipeline.
   - *LSP:* completion for `myApi.<endpoint>(…)` at call sites; property completion on `$params.*` inside endpoint definitions using the declared `parameters` schema; result type completion on consumers of `DataSource.value` when `returns` is declared; `sourceApi="{myApi.<endpoint>}"` completion listing available endpoints for the resolved api-component id.
   - *Docs:* each api-component gets its own entry in the components reference (generated by `generate-docs`), with a table of its endpoints, their `parameters`, and their `returns` shape. `<Schema>` types are cross-linked.

## 13. Phased delivery

The feature is delivered as **17 small steps**, grouped into 5 phases. Each step is sized to keep the blast radius small: at most one parser change, one runtime concept, or one tooling surface per step. Every step lands together with the unit and E2E tests listed under it, and the suite must be green before the next step starts.

Guiding principles:

- **Additive first.** Every step in Phases 1–3 adds new code paths gated by `role="api"`. Nothing in the existing rendering, container, or HTTP pipelines changes behaviour for components that do not opt in.
- **Reserved-name guard upfront.** Step 1.1 introduces a prepare-time warning if any existing user component is named `ApiEndpoint`, `Schema`, or `Field`, so we discover collisions before they break anyone.
- **Regression fences.** Every step that touches a shared file (`transform.ts`, `Container.tsx`, `DataSource.tsx`, `APICall.tsx`, `RestApiProxy.ts`) is preceded by a "characterisation" test that pins down current behaviour so the new code path can't silently change it.
- **Feature flag.** Steps 1.1 through 2.4 are gated behind a build-time flag `XMLUI_API_COMPONENTS` (default off). The flag is removed in step 3.5 once the suite has been green across two release cycles.

### Phase 0 — Spec freeze (docs only)

| Step | Scope | Touches |
|------|-------|---------|
| **0.1** | Land this document with all open questions closed. Add a changeset entry (`xmlui` — patch) describing the planned feature. | `xmlui/src/components-core/api-components-plan.md`, `.changeset/` |

*No code, no tests.*

### Phase 1 — Parser + prepare + imperative calls

Goal: `myApi.getDocument({ docId: "abc" })` works at runtime. No consumer-side wiring yet.

| Step | Scope | Touches |
|------|-------|---------|
| **1.1** | Add `role` attribute recognition on `<Component>`. Validate that `role="api"` is the only currently-accepted value (others reserved). Add the `XMLUI_API_COMPONENTS` build flag. | `parsers/xmlui-parser/transform.ts`, `parsers/xmlui-parser/diagnostics.ts`, build config |
| **1.2** | Parse `<ApiEndpoint>` inside `role="api"` components. Populate `CompoundComponentDef.apiEndpoints: Record<string, ApiEndpointDef>`. Strip the element from the rendered children. Reject other child element types with `diagApiComponentIllegalChild`. | `parsers/xmlui-parser/transform.ts`, `abstractions/ComponentDefs.ts` |
| **1.3** | In `prepareComponentDef`, synthesise an `api.<endpointName>` entry per endpoint whose body invokes `Actions.callApi` with the resolved operation. Carry it through `CompoundComponent.tsx` and `Container.tsx` so the endpoint becomes a callable. **An api-component is always non-visual by definition**: the prepare phase unconditionally stamps `nonVisual: true` on the synthesised metadata so that `ComponentAdapter.tsx` (line ~410), `BookmarkBehavior`, `TooltipBehavior`, the `visual`/`nonVisual` behavior condition, and the `Stack`/`FlowLayout`/`DockLayout` `wrapChild` paths all treat `role="api"` instances exactly the way `<APICall>` is treated today. Authors cannot opt out. *Risk addressed:* an api-component instance accidentally injecting wrapper `<div>`s into a layout container or attracting tooltip/bookmark behaviors. *Verified by:* `tests/components-core/api-nonvisual-metadata.test.ts` (below). | `components-core/prepare-component-def.ts`, `components-core/CompoundComponent.tsx` |
| **1.4** | Add the app-level `ApiComponentRegistry` singleton. On mount, each `role="api"` instance registers its id + endpoint table; on unmount, it unregisters. No consumer reads from it yet — this is plumbing only. | new `components-core/api-component/ApiComponentRegistry.ts`, `components-core/AppRoot.tsx` |
| **1.5** | Synthesise the variadic call wrapper when an endpoint declares `parameters` with an ordered schema (resolves Q4 option (c)). | `components-core/api-component/methodSynthesis.ts` |
| **1.6** | Add a **call-time cycle guard** to the synthesised method runner. Each top-level call opens an async-local `Set<string>` of `instanceId::endpointName` keys; re-entering a key already in the set throws `ApiEndpointReentryError` with the full call chain; the set is cleared when the top-level promise settles. *Risk addressed:* the existing `udcCycleDetection.ts` covers only static render-time recursion and cannot see endpoint-to-endpoint loops triggered through `<variable>` initialisers, `transformResult` arrow expressions, or chained `Actions.callApi` calls (e.g. `getDocument → refreshToken → getDocument`), which would otherwise stack-overflow with only a generic React Query error. *Verified by:* `tests/components-core/api-call-cycle-guard.test.ts` (below). | new `components-core/api-component/callStackGuard.ts`, `components-core/api-component/methodSynthesis.ts` |

**Unit tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tests/parsers/xmlui-parser/role-attribute.test.ts` | Characterisation: existing components without `role` still parse identically; `role="api"` is recognised; unknown role values emit a diagnostic. |
| `tests/parsers/xmlui-parser/api-endpoint-parse.test.ts` | `<ApiEndpoint>` with each combination of `method`/`url`/`queryParams`/`headers`/`body`/`payloadType`/`credentials`/`resultSelector`/`transformResult`/`errorTransform`/`invalidates` parses into the correct `ApiEndpointDef`. Illegal children (e.g. `<Button>`) emit `diagApiComponentIllegalChild`. `<ApiEndpoint>` outside `role="api"` emits `diagApiEndpointOnlyInApiComponent`. |
| `tests/components-core/prepare-api-endpoints.test.ts` | After `prepareComponentDef`, each endpoint produces a callable `api.<name>` entry; idempotence (running prepare twice yields identical output); empty `apiEndpoints` produces no synthesised entries. |
| `tests/components-core/api-component-runtime.test.ts` | Synthesised method invokes `Actions.callApi` with the correctly resolved `url`/`headers`/`queryParams`/`body` after substituting `$params`, `$props`, internal `<variable>` references, and `appGlobals`. Mocked `RestApiProxy.execute` receives the expected `ApiOperationDef`. AbortSignal threading works. |
| `tests/components-core/api-component-registry.test.ts` | Mounting two `role="api"` instances with different ids registers two entries; unmount removes them; double-mount with the same id surfaces a warning; lookup by id returns the endpoint table. |
| `tests/components-core/api-method-variadic.test.ts` | When `parameters` declares an ordered schema, `myApi.addValues(1, 2, 3)` is equivalent to `myApi.addValues({ args: [1, 2, 3] })`. When no schema is declared, only the single-object form is accepted. |
| `tests/components-core/api-call-cycle-guard.test.ts` | Direct self-recursion (`getA` whose `transformResult` calls `api.getA(...)`) throws `ApiEndpointReentryError` after one hop. Indirect cycle (`getA → getB → getA`) throws with chain `a.getA → a.getB → a.getA`. Cross-instance cycle (`a.x → b.y → a.x`) throws. Successful sequential calls (no cycle) leave the guard set empty after settling. |
| `tests/components-core/api-nonvisual-metadata.test.ts` | Synthesised metadata for any `role="api"` compound carries `nonVisual: true`; placing an api-component instance inside `<Stack>` / `<FlowLayout>` / `<DockLayout>` does not produce a wrapper `<div>` (verified via DOM snapshot); `BookmarkBehavior` and `TooltipBehavior` skip api-component nodes. |

**E2E tests added in this phase** (tagged `@xmlui-api-component`)

| Test file | What it covers |
|-----------|---------------|
| `tests-e2e/api-components/imperative-call.spec.ts` | `<Button onClick="docs.getDocument({ docId: '1' })">` fires the request; mocked backend returns a document; toast / state mutation reflects the response. |
| `tests-e2e/api-components/imperative-error.spec.ts` | Endpoint returns 4xx; Promise rejects with `GenericBackendError`; no toast unless `errorNotificationMessage` is set. |
| `tests-e2e/api-components/registry-cross-page.spec.ts` | Api-component declared on a parent page is still callable from a child page after route navigation, verifying the app-level registry works across the router boundary. |

### Phase 2 — Consumer-side wiring (`sourceApi`, `apiParameters`)

Goal: `<DataSource sourceApi="{docs.getDocument}">` and `<APICall sourceApi="{docs.updateDocument}">` work reactively.

| Step | Scope | Touches |
|------|-------|---------|
| **2.1** | Add the `sourceApi` and `apiParameters` props to `DataSource` metadata (mutually exclusive with `url`, validated at prepare time). Add the same props to `APICall`. No runtime behaviour change yet — the props are parsed but ignored. | `components/DataSource/DataSource.tsx`, `components/APICall/APICall.tsx`, `components-core/ApiBoundComponent.tsx` |
| **2.2** | Introduce `ApiBoundDataLoader` (a Loader driven by an async `loaderFn` that resolves the endpoint via `ApiComponentRegistry` and dispatches through `RestApiProxy.execute`). Wire `DataSource` to use it when `sourceApi` is present. React Query key = `[instanceId, endpointName, serialised(apiParameters)]`. *Risk addressed:* the existing `DataLoaderQueryKeyGenerator` (`(url, queryParams, apiUrl, body, rawBody)`) has **no headers component**, so two `DataSource`s bound to the same resolved URL with the same `apiParameters` but pointed at two api-component instances with different `token` props would otherwise share a React Query cache entry — a silent cross-tenant data leak. Including `instanceId` in the key makes the two instances occupy disjoint key spaces by construction; cross-instance invalidation is then opt-in via the dotted `invalidates="other.endpoint"` form (see step 2.4). The legacy URL-based key shape is left untouched so existing `DataSource(url=…)` callers see no behavioural change. *Verified by:* `tests/components-core/loader/ApiBoundDataLoader.cacheKey.test.ts` and the extended `tests-e2e/api-components/multi-instance-isolation.spec.ts` (both below). | new `components-core/loader/ApiBoundDataLoader.tsx`, `components/DataSource/DataSource.tsx` |
| **2.3** | Wire `APICall` to use the registry when `sourceApi` is present. `apiParameters` reactivity is consistent with `url` reactivity (re-execute on resolved value change). | `components/APICall/APICall.tsx`, `components-core/action/APICall.tsx` |
| **2.4** | Implement `invalidates` resolution: bare name → same instance; dotted name → registry lookup. After a successful mutation, invalidate the matching React Query keys. | `components-core/loader/ApiBoundDataLoader.tsx`, `components-core/action/APICall.tsx` |

**Unit tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tests/components/DataSource/source-api-metadata.test.ts` | Characterisation: existing `DataSource(url=…)` behaviour unchanged. `sourceApi` + `url` set together produces a `diagDataSourceMutuallyExclusiveSource` diagnostic. `sourceApi` without `apiParameters` is allowed. |
| `tests/components-core/loader/ApiBoundDataLoader.test.ts` | Loader resolves the endpoint from the registry; substitutes `apiParameters` into `$params`; emits correct React Query key (incl. instance id); refetches when `apiParameters` value changes; surfaces errors through `errorTransform`. |
| `tests/components-core/loader/ApiBoundDataLoader.cacheKey.test.ts` | Two loaders sharing every input *except* `instanceId` produce non-equal React Query keys (no cross-tenant cache collision). `invalidates="a.getRepo"` from instance A leaves instance B's matching cache entry untouched. |
| `tests/components/APICall/source-api.test.ts` | `APICall` with `sourceApi` builds the same `ApiOperationDef` an explicit-url `APICall` would. `execute()` resolves with the transformed result. |
| `tests/components-core/invalidation.test.ts` | Bare `invalidates="getLaunches"` invalidates only the same-instance React Query key; dotted `invalidates="docs.getLaunches"` invalidates the registry-located key; array form invalidates all listed names. |

**E2E tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tests-e2e/api-components/datasource-source-api.spec.ts` | `<DataSource sourceApi=…>` renders data after mount; changing the value bound to `apiParameters` triggers a refetch (mirrors existing `DataSource.spec.ts` url-change test). |
| `tests-e2e/api-components/apicall-source-api.spec.ts` | `<APICall id="save" sourceApi=…>` plus a button calling `save.execute()` mutates the backend (mocked). |
| `tests-e2e/api-components/apicall-inline.spec.ts` | Inline `<APICall>` inside `<event name="click">` works without a top-level id. |
| `tests-e2e/api-components/invalidation-cross-instance.spec.ts` | An `APICall` on api-component A with `invalidates="b.getList"` causes a sibling `DataSource` bound to `b.getList` to refetch. |
| `tests-e2e/api-components/multi-instance-isolation.spec.ts` | Two `<GoogleDocsApi>` instances with different `token` props send requests with different `Authorization` headers (asserted via mocked fetch capture) **and** occupy disjoint React Query cache entries (instance A loading `getRepo` then instance B loading `getRepo` with the same `apiParameters` produces two distinct network requests; mutations on A do not invalidate B). |

### Phase 3 — Typed shapes, mocks, diagnostics

Goal: `parameters` and `returns` are validated, `<Schema>` is usable, error UX is polished, feature flag removed.

| Step | Scope | Touches |
|------|-------|---------|
| **3.1** | Parse `<Schema>` / `<Field>` helper elements into `CompoundComponentDef.apiSchemas`. Reject illegal nesting (no `<Schema>` outside `role="api"`). | `parsers/xmlui-parser/transform.ts` |
| **3.2** | Implement `ApiTypeSpec` validators: request-side validation of `$params` against `parameters` (required, type, enum, nested), `$ref` resolution against `apiSchemas`. Dev-mode warnings, production hard errors for `required: true`. | new `components-core/api-component/validateApiParams.ts` |
| **3.3** | Opt-in response validation against `returns`. Off by default; enabled per-endpoint via `validateResponse: true` or app-globally via `appGlobals.xmlui.apiResponseValidation = "warn" \| "error"`. | `components-core/api-component/validateApiResponse.ts` |
| **3.4** | Endpoint-level `mock` arrow expression bypasses `RestApiProxy.execute` (matches the existing `onMockExecute` pattern). `<Mock>` child element is sugar for `mock`. | `components-core/api-component/mockRunner.ts` |
| **3.5** | Remove the `XMLUI_API_COMPONENTS` build flag now that two release cycles have shipped the feature. Update changeset. | build config, `.changeset/` |

**Unit tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tests/parsers/xmlui-parser/schema-parse.test.ts` | `<Schema>` with nested `<Field>` (incl. `items`, `properties`, `enum`, `format`) parses into the correct `ApiTypeSpec`. `<Schema>` outside `role="api"` is rejected. |
| `tests/components-core/api-type-spec.test.ts` | `validateApiParams` succeeds for valid inputs; fails for missing required, wrong type, out-of-enum, nested mismatches. `$ref` resolution chases `<Schema>` entries. `validateApiResponse` mirrors the same logic for outgoing data. |
| `tests/components-core/api-mock.test.ts` | When `mock` is defined, `RestApiProxy.execute` is **not** called; the mock arrow receives the resolved `$params`; its return value flows through `transformResult` like a normal response. |

**E2E tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tests-e2e/api-components/parameter-validation.spec.ts` | Calling an endpoint with a missing required parameter shows a dev-mode error overlay (or a hard error in production build). Type-mismatch produces a console warning in dev only. |
| `tests-e2e/api-components/mock-endpoint.spec.ts` | Endpoint with `mock` returns the mock payload; the network panel records zero requests. |

### Phase 4 — LSP + documentation generation

Goal: api-components are first-class in the VS Code extension and in the generated docs site.

| Step | Scope | Touches |
|------|-------|---------|
| **4.1** | Teach the LSP `MetadataProvider` to recognise `role="api"` components. Surface their endpoints and parameter shapes through the same metadata pipeline used for built-in components. | `tools/vscode/src/metadata/`, `xmlui/src/language-server/` |
| **4.2** | Completion provider: list endpoint names after `<id>.` at call sites; suggest `parameters` keys inside `$params.` expressions; suggest available endpoints inside `sourceApi="{…}"`. | `tools/vscode/src/completion/` |
| **4.3** | Hover provider: render the endpoint signature, parameter table, and `returns` shape in the hover tooltip. | `tools/vscode/src/hover/` |
| **4.4** | Diagnostics surface in the LSP for prepare-time `diagApiComponent*` warnings/errors. | `tools/vscode/src/diagnostics/` |
| **4.5** | Extend the `generate-docs` pipeline (`MetadataProcessor`) to emit a per-api-component documentation page with endpoint, parameter, and return tables. `<Schema>` entries become cross-linked type pages. | `xmlui/scripts/generate-docs/`, `docs/content/` |

**Unit tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tools/vscode/tests/metadata/api-component-metadata.test.ts` | `MetadataProvider` exposes endpoint names, parameter specs, and return specs for a `role="api"` component fixture. |
| `tools/vscode/tests/completion/api-completion.test.ts` | Completion at `docs.│` lists `getDocument`/`updateDocument`. Completion inside `$params.│` lists declared parameter keys. Completion inside `sourceApi="{docs.│}"` lists endpoint names. |
| `tools/vscode/tests/hover/api-hover.test.ts` | Hovering on `docs.getDocument` shows the signature `(docId: string) → Document` and the parameter table. |
| `xmlui/scripts/generate-docs/tests/api-component-docs.test.ts` | Running the doc generator on a fixture api-component produces a Markdown page containing one section per endpoint with parameter and return tables; `<Schema>` entries link correctly. |

**E2E tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `tools/vscode/tests-e2e/api-component-completion.spec.ts` | Open a `.xmlui` file in the extension host, trigger completion at known positions, assert returned items. |
| `tests-e2e/docs/api-component-docs-page.spec.ts` | Built docs site renders the generated api-component page; endpoint links are navigable; parameter/return tables match the fixture. |

### Phase 5 — OpenAPI tooling

Goal: full round-trip with OpenAPI 3.1 via a new package and CLI.

| Step | Scope | Touches |
|------|-------|---------|
| **5.1** | Scaffold `packages/xmlui-openapi`: package.json, tsconfig, build, README, changeset. Add to `turbo.json` task graph. | new package |
| **5.2** | Implement the **importer**: `xmlui openapi import <spec> --out <file.xmlui>`. Walks an OpenAPI 3.1 document and emits a `<Component role="api">` with `<ApiEndpoint>` per operation and `<Schema>` per reusable component schema. Unsupported keywords are preserved under `x-xmlui-passthrough`. | `packages/xmlui-openapi/src/import/` |
| **5.3** | Implement the **exporter**: `xmlui openapi export <file.xmlui> --out <spec>`. Reads the prepared `CompoundComponentDef` and serialises back to OpenAPI 3.1 YAML or JSON. Re-emits any `x-xmlui-passthrough` data verbatim. | `packages/xmlui-openapi/src/export/` |
| **5.4** | Wire the CLI commands into the existing `xmlui` CLI as subcommands (`xmlui openapi <import\|export>`). | `tools/create-app/` / shared CLI entry |
| **5.5** | Golden-file round-trip suite: for each fixture (Petstore, GitHub subset, a "kitchen sink" spec exercising every supported keyword), `import → export → diff` must be empty modulo formatting and `x-xmlui-passthrough` ordering. | `packages/xmlui-openapi/tests/` |

**Unit tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `packages/xmlui-openapi/tests/import-paths.test.ts` | OpenAPI `paths.<path>.<method>` operations map 1:1 to `<ApiEndpoint>` elements with correct `method`/`url`/`name` (`operationId`). Path/query/header/cookie parameters land in `parameters` with the right `in` field. |
| `packages/xmlui-openapi/tests/import-schemas.test.ts` | `components.schemas.<Name>` → `<Schema name="Name">`; `$ref` → `ref: "#/Name"`; nested object/array/enum/format keywords preserved. |
| `packages/xmlui-openapi/tests/import-passthrough.test.ts` | Unsupported keywords (`callbacks`, OAuth flows, `oneOf` polymorphism beyond discriminator) land under `x-xmlui-passthrough` instead of being silently dropped, and a warning diagnostic is emitted listing them. |
| `packages/xmlui-openapi/tests/export-basic.test.ts` | A hand-written api-component exports to a syntactically valid OpenAPI 3.1 document (validated against the official JSON schema for OpenAPI 3.1). |
| `packages/xmlui-openapi/tests/roundtrip.golden.test.ts` | For each fixture spec, `import → export` produces a document semantically equivalent to the input (deep-equal after canonicalisation; `x-xmlui-passthrough` re-emitted at its original location). |

**E2E tests added in this phase**

| Test file | What it covers |
|-----------|---------------|
| `packages/xmlui-openapi/tests-e2e/cli-import.spec.ts` | Running `xmlui openapi import fixtures/petstore.yaml --out tmp/Petstore.xmlui` produces a file that the parser can load and that registers the expected endpoints at runtime. |
| `packages/xmlui-openapi/tests-e2e/cli-export.spec.ts` | Running `xmlui openapi export Components/SpaceXApi.xmlui --out tmp/spacex.yaml` produces a spec consumable by an external OpenAPI validator (run via `swagger-cli validate`). |

---

## 14. Regression-prevention strategy

Beyond the targeted tests above, the implementation enforces three blanket safety nets:

1. **Existing suite must stay green at every step.** CI runs the full `xmlui` unit suite, the full E2E suite, and the existing docs build on every PR for every step. No step is mergeable that turns any pre-existing test red.
2. **Characterisation tests precede shared-file edits.** Before each step that modifies `transform.ts`, `Container.tsx`, `DataSource.tsx`, `APICall.tsx`, or `RestApiProxy.ts`, a dedicated characterisation test in the same file's test suite pins down the current behaviour the new code path must not change. These tests are listed in the per-step tables above (e.g. `role-attribute.test.ts`, `source-api-metadata.test.ts`).
3. **Feature flag during Phases 1–2.** The `XMLUI_API_COMPONENTS` build flag is off in the default build, so any unforeseen integration issue cannot affect production users until the team explicitly flips it on. The flag is removed only after the steps in Phase 3 land and the suite has been green across two release cycles.

## 15. Residual risks

The three risks identified during the design review — layout/behavior leakage from non-visual api-components, runtime endpoint-to-endpoint cycles, and cross-instance cache-key collisions — are each owned by a specific phased-delivery step with an inline *Risk addressed* / *Verified by* note:

- **Layout & behavior leakage** — step **1.3** (api-components are always non-visual by definition; the `nonVisual: true` stamp is unconditional).
- **Endpoint-to-endpoint call cycles** — step **1.6** (async-local `callStackGuard` throwing `ApiEndpointReentryError` with the full chain).
- **Cache-key collisions across instances** — step **2.2** (React Query key prefixed with `instanceId`, with disjointness asserted by both a unit test and an E2E test).

No unmitigated risks remain in scope for v1. The reserved-name collision against pre-existing user components named `ApiEndpoint`, `Schema`, or `Field` is **accepted**: the XMLUI user base is small enough that a hard parse-time error in the rare offending app, together with a clear CHANGELOG note, is the appropriate trade-off rather than building a permanent shadowing-detection apparatus.

## 16. Summary

The proposal is intentionally **conservative on framework surface**: no new component subtype, no new state container, no parallel HTTP stack. It composes three existing pieces — `CompoundComponentDef.api`, `ApiOperationDef` / `RestApiProxy`, and the `ExternalDataLoader` pattern — into a new authoring concept that lets a user describe a backend API once and consume it both imperatively and reactively. The work splits cleanly into a parser/prepare phase (low risk) and a consumer-side wiring phase (medium risk, mostly in `DataSource` / `APICall` normalisation).

Feedback on §12 *Open Questions* will determine the final syntax before any implementation begins.
