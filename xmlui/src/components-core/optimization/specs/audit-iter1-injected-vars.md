# Iteration 1 — Authoritative Injected Vars Audit

| Component | Event key (in metadata) | Runtime-injected vars |
|---|---|---|
| DataSource | fetch | $url, $method, $queryParams, $requestBody, $requestHeaders, $pageParams |
| APICall | mockExecute | $pathParams, $queryParams, $requestBody, $cookies, $requestHeaders, $param, $params |

## Implementation Path Decision
Path B is required. The investigation revealed that `node.contextVars` is never automatically populated from component metadata during parsing or preparation. The optimizer currently only sees `node.contextVars` if manually provided. Because there is no existing propagation mechanism to extend, we must use Path B: use the global `collectedComponentMetadata` registry inside `computeUsesInternal` so it can look up `events[eventName].injectedVars` on demand.