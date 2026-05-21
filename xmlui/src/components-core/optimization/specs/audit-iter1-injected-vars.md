# Iteration 1 — Authoritative Injected Vars Audit

| Component | Event key (in metadata) | Runtime-injected vars |
|---|---|---|
| DataLoader | fetch | $url, $method, $queryParams, $requestBody, $requestHeaders, $pageParams |
| DataSource | fetch | $url, $method, $queryParams, $requestBody, $requestHeaders, $pageParams |
| APICall | mockExecute | $pathParams, $queryParams, $requestBody, $cookies, $requestHeaders, $param, $params |

## Implementation Path Decision

**Path B was chosen** (passing `metadataLookup` as an explicit parameter to `computeUsesForTree` /
`computeUsesInternal`).

**Why Path A is not applicable.** Path A proposed extending the existing `contextVars` propagation
mechanism to cover event-injected vars. Investigation shows that `node.contextVars` in `ComponentDef`
is populated directly from XML markup at parse time — it is never automatically copied from component
metadata. The `contextVars` field in `createMetadata(...)` (e.g. `ItemsMd.contextVars`) is a
render-time contract consumed by `wrapComponent`; there is no parse-time or prepare-time step that
mirrors it onto `ComponentDef` nodes. Extending Path A would require a new prepare pass with access
to the metadata registry — effectively the same complexity as Path B with additional coupling.

**Path B implementation.** An explicit `metadataLookup?: (type: string) => ComponentMetadata | undefined`
parameter was added to `computeUsesInternal`, `computeUsesForSubtree`, and `computeUsesForTree`.

- In `StandaloneApp.tsx` (standalone/runtime mode): a `resolveOptimizerMetadata` function combines
  `DataLoaderMd` (from `components-core/loader/DataLoader`) and `collectedComponentMetadata`. It is
  passed to both `computeUsesForTree` callsites, covering both the entry-point tree and each compound
  component's tree.

- In `xmlui-parser.ts` (Vite plugin / build-time path): `computeUsesForTree` is called **without** a
  metadata lookup. This is an intentional safe-degradation trade-off: `DataLoader.tsx` contains React
  hooks (`useCallback`, `useEffect`, etc.) and cannot be safely imported in the Node.js Vite plugin
  context. The result is over-subscription (DataSource fetch handlers keep `$queryParams` as a
  parent dep), not under-subscription — reactive correctness is preserved, only the optimization is
  partially inactive for Vite-built apps. This limitation is tracked for Iteration 2.
