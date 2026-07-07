# Collect global errors with App onError

Use `App`'s `onError` event for app-wide telemetry and custom top-level error status.

Unhandled handler, loader, lifecycle, and render errors flow through the app error sink as structured `AppError` objects. The handler receives the error and a cancellable event. Call `event.preventDefault()` or return `false` when your app shows the error itself and you do not want the default toast.

```xmlui-pg copy display name="Collect app errors in a global status panel" id="collect-app-errors-in-a-global-status-panel"
---app display /App.errors/
<App
  var.lastErrorMessage="No errors captured"
  onError="(error, event) => {
    event.preventDefault();
    lastErrorMessage = error.category + ': ' + error.message;
  }"
>
  <VStack padding="$space-4" gap="$space-3">
    <Button
      label="Run risky action"
      onClick="throw Error('Report export failed')"
    />

    <Card padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Global error status</Text>
        <Text>{lastErrorMessage}</Text>
        <Text>Buffered errors: {App.errors.length}</Text>
        <Text when="{App.errors.length > 0}">
          Latest code: {App.errors[App.errors.length - 1].code}
        </Text>
      </VStack>
    </Card>
  </VStack>
</App>
```

## Key points

**Use global handling for telemetry**: `App onError` is the right place to log or report unhandled errors once, without wiring every button and loader separately.

**The first argument is the structured error**: Read `error.category`, `error.code`, `error.message`, `error.retryable`, and `error.data`.

**Suppress the default toast when you replace it**: Call `event.preventDefault()` or return `false` if your app renders its own error surface.
This controls XMLUI's default error toast for the app error event; it is separate from browser DOM event default handling.

**`App.errors` keeps recent failures**: The FIFO buffer is useful for status panels and inspector-style UI. Its size is controlled by `xmluiConfig.errorBufferSize`.

---

## See also

- [Handle action errors on a component](/docs/howto/handle-action-errors-on-a-component) — recover locally instead of globally
- [Handle lifecycle errors with onError](/docs/howto/handle-lifecycle-errors-with-onerror) — lifecycle-specific error handling
- [Structured Exception Model](/docs/managed-react/structured-exception-model) — global error sink and `App.errors`
