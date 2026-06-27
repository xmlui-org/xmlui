# Fallback [#fallback]

`Fallback` is a declarative wrapper that renders an alternative UI when a descendant loader (`DataSource`, `APICall`) fails or a descendant component throws during render. The error is exposed as the `$error` context variable to the `errorTemplate`. An optional `loadingTemplate` is rendered while the `isLoading` prop is truthy.

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

### Decision tree [#decision-tree]

| Scenario                                  | Recommended construct |
| ----------------------------------------- | --------------------- |
| Inline error rendering at a single field  | `$error` in markup    |
| Subtree-wide alternative UI on failure    | `Fallback`            |
| App-wide unhandled error sink (telemetry) | `App onError`         |
| Transparent retry of transient failures   | `RetryPolicy`         |

### Slots / templates [#slots-templates]

- `errorTemplate` — rendered when any descendant `DataSource` / `APICall`
  fails or a descendant throws during render. `$error` is the
  `AppError`.
- `loadingTemplate` — rendered while `isLoading` is `true`.

**Context variables available during execution:**

- `$error`: The error captured by this Fallback boundary.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `errorTemplate` [#errortemplate]

Template to render when a descendant produces an `AppError`. The error is available as `$error` (code, category, message, data).

### `isLoading` [#isloading]

> [!DEF]  default: **false**

When `true`, renders the `loadingTemplate` (if provided) instead of the children.

### `loadingTemplate` [#loadingtemplate]

Template to render when `isLoading` is `true` and no error has been reported yet.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
