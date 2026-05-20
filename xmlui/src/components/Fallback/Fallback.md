%-DESC-START

`Fallback` is a declarative wrapper that swaps to an alternative UI when
a descendant fails. It composes with `RetryPolicy`: retries happen first,
then — if the policy is exhausted — the error propagates to the nearest
`Fallback`.

```xmlui-pg copy display name="Example: fallback for a failed DataSource"
<App>
  <Fallback>
    <property name="errorTemplate">
      <Text>Could not load: { $error.message } ({ $error.category })</Text>
    </property>
    <DataSource id="orders" url="/api/orders"/>
    <Text>Orders loaded.</Text>
  </Fallback>
</App>
```

### Decision tree

| Scenario                                  | Recommended construct |
| ----------------------------------------- | --------------------- |
| Inline error rendering at a single field  | `$error` in markup    |
| Subtree-wide alternative UI on failure    | `Fallback`            |
| App-wide unhandled error sink (telemetry) | `App onError`         |
| Transparent retry of transient failures   | `RetryPolicy`         |

### Slots / templates

- `errorTemplate` — rendered when any descendant `DataSource` / `APICall`
  fails or a descendant throws during render. `$error` is the
  `AppError`.
- `loadingTemplate` — rendered while `isLoading` is `true`.

%-DESC-END
