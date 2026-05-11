---
"xmlui": patch
---

`DataSource`: add an `onFetch` event handler that fully replaces the default
network fetch while preserving caching, polling, `refetch()`, the `loaded`
and `error` events, `resultSelector`, and `transformResult`. The handler
receives the resolved request properties as `$url`, `$method`,
`$queryParams`, `$requestBody`, `$requestHeaders`, and `$pageParams`. This
is the `DataSource` counterpart of `APICall`'s `mockExecute`.
