# Fetch Lifecycle

XMLUI manages the lifecycle of every HTTP request a data-bound component
issues. Requests are deduplicated, cached, and — crucially — cancelled when
they are no longer relevant. You never have to write an `AbortController`,
a "is component still mounted?" check, or a race-condition guard yourself.

## What problems this prevents

- A stale response from an earlier request can no longer overwrite the
  result of a newer one when a key (such as a query parameter or selected
  row) changes mid-flight.
- A request that was in flight when the user navigated away does not
  resolve into a component that no longer exists, eliminating a common
  source of "Cannot update unmounted component" warnings.
- Two components that ask for the same resource at the same time produce
  one network request, not two.
- Re-renders triggered by unrelated state changes do not refire requests
  that have already been satisfied.

## How it works

XMLUI's data layer is built on React Query plus the framework's request
proxy. Each `DataSource` and `APICall` has a stable key derived from its
URL and parameters; results are cached against that key. When the key
changes or the component unmounts, the framework calls
`AbortController.abort()` on the in-flight request so the previous fetch
is cancelled before a new one starts. Cached entries are reused across
components that share the same key.

This behaviour is always on. There is no opt-out flag, because returning
to manual lifecycle management would re-introduce the very bugs the
managed lifecycle prevents.

## Related

- [DataSource](/docs/components/DataSource)
- [APICall](/docs/components/APICall)
- [Centralized HTTP](/docs/managed-react/http-centralization)
- [Managed React Overview](/docs/managed-react/overview)
