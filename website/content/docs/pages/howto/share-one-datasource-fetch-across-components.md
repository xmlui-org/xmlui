# Share one DataSource fetch across components

Two `DataSource` instances with the same `url`, `queryParams`, and `body` are one fetch and one cache entry — mount them wherever you need the data and call `refetch()` when it should change.

When two parts of an app need the same server state, the instinct is to fetch once high in the tree and thread the value down, or to hoist it into a global. Neither is necessary. `DataSource` caches by request, not by component, so mounting it twice with the same inputs calls the endpoint once and hands the same result to both consumers — no matter how far apart they sit, and across user-defined component boundaries that ordinary variables cannot cross.

In this example both cards mount their own `DataSource` against the same URL. The server counts how many times it has actually been called, so you can see that two consumers cost one request. **Refresh** calls `refetch()` on one of them and both update, because they share the entry that was invalidated.

```xmlui-pg copy display name="Two consumers, one fetch"
---app display /url="/api/status"/ /refetch()/
<App>
  <HStack gap="$space-4">
    <Card width="240px">
      <Text variant="strong">Card A</Text>
      <DataSource id="statusA" url="/api/status" />
      <Text value="queue: {statusA.value.queue}" />
      <Text variant="secondary" value="server calls: {statusA.value.calls}" />
    </Card>
    <Card width="240px">
      <Text variant="strong">Card B</Text>
      <DataSource id="statusB" url="/api/status" />
      <Text value="queue: {statusB.value.queue}" />
      <Text variant="secondary" value="server calls: {statusB.value.calls}" />
    </Card>
  </HStack>
  <Button label="Refresh" onClick="statusA.refetch()" />
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "status": {
      "url": "/status",
      "method": "get",
      "handler": "$state.calls = ($state.calls || 0) + 1; return { queue: 40 + $state.calls, calls: $state.calls };"
    }
  }
}
```

Both cards show `server calls: 1`. Press **Refresh** and both move to `2` together — one request, two consumers, still in step.

## The trap: a cache-busting parameter splits the entry

The sharing is keyed on the request. Anything that makes the requests differ opts you out of it, and the most common way to do that by accident is a per-component refresh tick appended to the URL:

```xmlui
<!-- Card A, somewhere in the tree -->
<DataSource id="statusA" url="/api/status?t={tickA}" />

<!-- Card B, somewhere else -->
<DataSource id="statusB" url="/api/status?t={tickB}" />
```

This reads like shared state and is not. Query parameters written into the URL are normalized into the cache key — deliberately, so that `?a=1` in the URL and `queryParams="{{ a: 1 }}"` agree — which means the tick is part of the key rather than decoration. Two ticks that advance independently are two cache entries, and they drift apart the moment each component refreshes on its own trigger.

Worse, it **looks correct at first**. Both ticks start at the same value, so the two URLs are identical on load and the cards really do share one fetch. The split happens on the first *independent* refresh — which is exactly the moment nobody is looking, long after the code was reviewed and shipped.

Nothing warns you at any point. Both components render plausible values, and the disagreement only surfaces when someone compares them.

Try it: both cards start in step, then **Refresh A** advances only A's tick and they part company.

```xmlui-pg copy display name="The anti-pattern: per-component ticks"
---app display /url="/api/status?t={tickA}"/ /url="/api/status?t={tickB}"/
<App var.tickA="{1}" var.tickB="{1}">
  <HStack gap="$space-4">
    <Card width="240px">
      <Text variant="strong">Card A</Text>
      <DataSource id="statusA" url="/api/status?t={tickA}" />
      <Text value="queue: {statusA.value.queue}" />
      <Text variant="secondary" value="server calls: {statusA.value.calls}" />
      <Button label="Refresh A" onClick="tickA = tickA + 1" />
    </Card>
    <Card width="240px">
      <Text variant="strong">Card B</Text>
      <DataSource id="statusB" url="/api/status?t={tickB}" />
      <Text value="queue: {statusB.value.queue}" />
      <Text variant="secondary" value="server calls: {statusB.value.calls}" />
      <Button label="Refresh B" onClick="tickB = tickB + 1" />
    </Card>
  </HStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "status": {
      "url": "/status",
      "method": "get",
      "handler": "$state.calls = ($state.calls || 0) + 1; return { queue: 40 + $state.calls, calls: $state.calls };"
    }
  }
}
```

The fix is to delete the tick and call `refetch()` instead — the first example. That is strictly less markup than the version that breaks.

## Key points

**The cache key is the request, not the component**: identical `url`, `queryParams`, and `body` means one entry. Where the `DataSource` sits in the tree is irrelevant, which is what lets two components share server state across a user-defined component boundary without a shared variable.

**`refetch()` refreshes every consumer**: it invalidates the shared entry, so all bound components re-render with the new value. Call it on any one of them.

**A tick, nonce, or timestamp in the URL is a key difference**: URL query parameters are folded into the cache key, so `?t=…` splits the entry as surely as a different path would. If you want a refresh, use `refetch()`; if you want polling, use `pollIntervalInSeconds`.

**Server state does not need a shared variable**: [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) and globals are the right tools for *app* state. When the thing being shared is a server response, `DataSource` already shares it, and adding a variable on top gives you a second copy to keep in sync.

**After a write, prefer invalidation**: an `APICall` that changes the data can refresh readers through [`invalidates`](/docs/howto/control-cache-invalidation) rather than each consumer polling or ticking.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — refetching a reader after a write completes
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — declarative cache control with `invalidates`
- [Delay a DataSource until another is ready](/docs/howto/delay-a-datasource-until-another-datasource-is-ready) — chaining dependent requests
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — the shared-variable pattern, for app state rather than server state
