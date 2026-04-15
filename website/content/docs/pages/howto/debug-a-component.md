# Debug a component

Inspect component state and data at runtime using `JSON.stringify`, `console.log`, and reactive `Fragment` watchers.

Debugging XMLUI components is different from debugging plain JavaScript — you cannot set breakpoints in markup. Instead, use three complementary techniques: render a data snapshot directly in the UI with `JSON.stringify`, log values to the browser console from event handlers, or attach a side-effect function to a `Fragment` so it fires every time a reactive value changes. These approaches let you inspect props, `DataSource` payloads, and variables without leaving XMLUI.

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.user_data = {
      id: 42,
      name: 'John Doe',
      preferences: { theme: 'dark', notifications: true },
      recentItems: ['item1', 'item2', 'item3']
    }",
  "operations": {
    "get_user_data": {
      "url": "/user_data",
      "method": "get",
      "handler": "console.log('API called:', $state.user_data); return $state.user_data"
    }
  }
}
---comp display
<Component name="Test"
  var.counter = "{1}"
>

  <DataSource
    id="userData"
    url="/api/user_data"
  />

  <script>
    // can customize here
    function debug(msg, data) {
      console.log(msg, data)
    };
  </script>

  <Text>Method 1: JSON.stringify with preserveLinebreaks</Text>

  <Text preserveLinebreaks="true">
    {JSON.stringify(userData.value, null, 2)}
  </Text>

  <Text>Method 2: Console.log in handler</Text>

  <Button
    label="Log to console"
    onClick="console.log(userData);console.log(userData.value)"
  />

  <Text>Method 3: Use Fragment and custom debug function to watch changes</Text>

  <Fragment when="{debug('counter', counter)}" />

  <Button
    label="Update counter"
    onClick="{counter++}"
  />

</Component>
```

## Key points

**`JSON.stringify` renders data inline**: Wrap a `DataSource` result or variable in `JSON.stringify(value, null, 2)` inside a `<Text preserveLinebreaks="true">` to display formatted JSON directly in the page — no console needed.

**`console.log` in handlers dumps to DevTools**: Call `console.log(dataSource)` or `console.log(dataSource.value)` inside `onClick` or other event handlers to inspect the full reactive wrapper or the raw payload in the browser console.

**`Fragment` with a side-effect function watches changes**: `<Fragment when="{debug('counter', counter)}" />` calls `debug()` every time `counter` changes, because the expression re-evaluates reactively. The function can log, validate, or alert — and because it returns `undefined` (falsy), the `Fragment` renders nothing.

**Custom `<script>` helpers keep debug code reusable**: Define a `debug()` function in a `<script>` block and call it from `when` expressions or handlers. Remove the script block when you ship — clean separation between debug and production code.

**Inspect `DataSource` wrapper vs. `.value`**: Logging `userData` shows the reactive wrapper object (metadata, loading state, error); logging `userData.value` shows the raw data. Check both when diagnosing data-fetching problems.

---

## See also

- [Set the page title dynamically](/docs/howto/set-the-page-title-dynamically) — `PageMetaTitle` for non-visual diagnostic components
- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — use `toast()` to surface debug info visually
- [Build a batch processing queue](/docs/howto/build-a-batch-processing-queue) — `Queue` logging patterns for async debugging
