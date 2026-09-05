# Consume an APICall's response

Bind directly to `myCall.lastResult` — no `onSuccess` handler needed to make the response show up.

The obvious things to try are `myCall.result` and `{$result}`. Both fail silently: no console error, no broken-binding marker, just an empty spot in the UI. `APICall` has no `result` property — the bindable name is `lastResult`. And `$result` is a context variable that exists only inside `completedNotificationMessage`, `errorNotificationMessage`, `statusUrl`, and `cancelUrl` templates; reading it anywhere else resolves to nothing instead of throwing.

```xmlui
<APICall id="fetchUser" url="/api/user" />
<Text>{fetchUser.result}</Text>   <!-- always empty: no such property -->
<Text>{$result}</Text>            <!-- always empty outside a notification message -->
```

## Bind directly to `lastResult`

`lastResult` holds the response from the most recent successful call, and it is a regular reactive value — any component bound to `myCall.lastResult` re-renders when a call completes. Pair it with `inProgress` and `loaded` to drive the surrounding UI state; no `onSuccess` handler is required just to display the response.

The example below binds two `Text` elements to the same `APICall`, side by side, so the working binding and the naive guess are visible at once:

```xmlui-pg copy display name="Bind to lastResult" id="bind-to-last-result" height="260px"
---app
<App>
  <APICall
    id="fetchUser"
    url="/api/user"
    method="get"
    onMockExecute="() => {
      delay(300);
      return { name: 'Ada Lovelace', role: 'Engineer' };
    }"
  />

  <VStack gap="$space-2">
    <Button
      label="Load user"
      onClick="fetchUser.execute()"
      enabled="{!fetchUser.inProgress}"
    />
    <Text when="{fetchUser.inProgress}">Loading...</Text>

    <Text variant="strong">Bound to fetchUser.lastResult:</Text>
    <Text testId="viaLastResult">
      {fetchUser.loaded ? fetchUser.lastResult.name + ' — ' + fetchUser.lastResult.role : '(nothing yet)'}
    </Text>

    <Text variant="strong">Bound to fetchUser.result — the naive guess, no such property:</Text>
    <Text testId="viaResult">
      {fetchUser.result ? fetchUser.result.name : '(nothing — silently undefined)'}
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {}
}
```

Click **Load user** and only the `lastResult`-bound line changes. The second line stays empty for the life of the component — `fetchUser.result` is `undefined` before the click and after it, because `APICall` never defines a property by that name.

`lastResult` is also not reset between calls: the `undefined` it starts with is set once, when the component mounts, not before each `execute()`. A second click updates the bound text in place — it does not flash empty first.

## Reshape or combine with `onSuccess`

Reach for `onSuccess` when the response itself isn't the value you want to bind — when it needs reshaping, combining with existing state, or triggering a side effect. Using `onSuccess` just to copy the response into a `var` that `lastResult` already exposes is unnecessary plumbing.

```xmlui-pg copy display name="Reshape the response with onSuccess" id="reshape-with-onsuccess" height="240px"
---app
<App var.totalFound="{0}" var.summary="">
  <APICall
    id="search"
    url="/api/search"
    method="get"
    onMockExecute="() => {
      delay(300);
      return { items: ['xmlui docs', 'xmlui-mcp'], tookMs: 42 };
    }"
    onSuccess="(result) => {
      totalFound += result.items.length;
      summary = result.items.length + ' result(s) in ' + result.tookMs + 'ms';
    }"
  />

  <VStack gap="$space-2">
    <Button label="Search" onClick="search.execute()" enabled="{!search.inProgress}" />
    <Text testId="summary">{summary || '(nothing yet)'}</Text>
    <Text testId="totalFound">Total results seen this session: {totalFound}</Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {}
}
```

`summary` is a formatted string the response doesn't provide on its own, and `totalFound` accumulates across calls — both are computed *from* `search.lastResult` inside `onSuccess`, not a substitute for binding to it.

## Which mechanism when

| Question | Use |
| --- | --- |
| Show this `APICall`'s own response, as-is | `lastResult` (with `inProgress` / `loaded` for surrounding state) |
| The response needs reshaping, combining, or a side effect before use | `onSuccess` |
| Other readers (a `DataSource` elsewhere on the page) should re-fetch after this write | `invalidates`, or scope it further — see [Invalidate related data after a write](/docs/howto/control-cache-invalidation) |

The third case answers a different question than the first two: it's not about consuming *this* component's response at all, it's about telling *other* components their cached data is stale.

## Trap: `$result` only exists inside notification messages

`$result` is a template variable, not a component property. It resolves inside `completedNotificationMessage`, `errorNotificationMessage`, `statusUrl`, and `cancelUrl` — because those run in a context where the just-completed result is the obvious thing to reference — and nowhere else:

```xmlui
<APICall
  id="fetchUser"
  url="/api/user"
  completedNotificationMessage="Loaded {$result.name}"
/>
```

Outside those four props, write `fetchUser.lastResult` instead.

## Trap: `loaded` stays `false` during deferred polling

In deferred mode, the initial response (typically a 202 with a status URL to poll) sets `lastResult` right away but leaves `loaded` at `false` — the operation the response describes has been *accepted*, not *finished*. If a page uses `loaded` as its readiness gate, deferred results never pass it. Poll `getStatus()` or watch the operation's own status field instead of gating on `loaded` when `deferredMode` is in play.

## See also

- [APICall component](/docs/reference/components/APICall) — full reference, including `lastResult`, `loaded`, and `mockExecute`
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — when other DataSources, not this component, need the fresh data
- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — `onSuccess` used to trigger a refetch rather than to reshape a value
