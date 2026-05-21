# Iteration 1 — Authoritative Injected Vars Audit

| Component | Event key (in metadata) | Runtime-injected vars |
|---|---|---|
| DataSource | fetch | $url, $method, $queryParams, $requestBody, $requestHeaders, $pageParams |
| APICall | mockExecute | $pathParams, $queryParams, $requestBody, $cookies, $requestHeaders, $param, $params |