# Runtime State Compatibility Closure

Implemented slice:

- Added an XMLUI-owned runtime state model under `xmlui/src/runtime/state/`.
- Added explicit state owner IDs, local/global slot keys, mutation records,
  invalidation records, store subscriptions, and slot subscriptions.
- Added lexical runtime scopes that preserve local-first lookup, parent-local
  lookup, global fallback, `$props`, and local shadowing.
- Added execution-context adapters for generated expression and event functions.
- Added initialization helpers for global/local slots from compiled bindings.
- Replaced direct React state bags in `xmlui/src/runtime/index.tsx` with the
  runtime state store and scope APIs.
- Kept rendering in the runtime. The compiler still only generates expression
  and event functions.

Compatibility preserved now:

- App globals are owned by the root store.
- `App` and component locals are owned by explicit local owners.
- Repeated user-defined component instances have isolated local stores.
- Global state is shared across component instances.
- Local variables shadow globals with the same name.
- Generated event handlers mutate state through explicit runtime helpers.
- State writes emit slot-scoped invalidation records and notify subscribers.

Intentional omissions:

- No old `StateContainer`/`Container` pair.
- No reducer action enum, immer, proxy wrapping, or action-string interpreter.
- No path-level object mutations, loaders, routing state, forms, context
  variables beyond `$props`, component APIs, slots, or `uses` boundaries.
- The React bridge currently subscribes broadly to store revisions while
  preserving slot-level invalidation metadata for the next rendering pipeline
  experiment.

Next natural experiment:

- Runtime rendering pipeline: use the slot-scoped dependency and invalidation
  data to recompute only affected bindings/subtrees while preserving the same
  generated function and state-store boundary.
