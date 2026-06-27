# Branch on structured loader errors

Use a loader's `error.category` and `error.code` when different failures need different UI.

`DataSource` and other loader-backed components normalize failed requests into an `AppError`. That gives you stable fields for branching instead of parsing message text. Use `category` for user-facing decisions, `code` for precise diagnostics, and `data.statusCode` when the HTTP status itself matters.

```xmlui-pg copy display name="Show different messages for loader error categories" id="show-different-messages-for-loader-error-categories"
---app display /profile.error.category/
<App var.mode="ok">
  <VStack padding="$space-4" gap="$space-3">
    <HStack gap="$space-2">
      <Button label="No error" onClick="mode = 'ok'" />
      <Button label="Auth" onClick="mode = 'authorization'" />
      <Button label="Missing" onClick="mode = 'not-found'" />
      <Button label="Conflict" onClick="mode = 'conflict'" />
      <Button label="Server" onClick="mode = 'server'" />
    </HStack>

    <DataSource id="profile" url="/api/profile/{mode}" />

    <Card when="{mode === 'ok' && profile.value}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">No error</Text>
        <Text>Loaded profile: {profile.value.name}</Text>
      </VStack>
    </Card>

    <Card when="{mode !== 'ok' && profile.error}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Category: {profile.error.category}</Text>
        <Text>Code: {profile.error.code}</Text>
        <Text>Status: {profile.error.data.statusCode}</Text>
        <Text when="{profile.error.category === 'authorization'}">
          Please sign in before opening this profile.
        </Text>
        <Text when="{profile.error.category === 'not-found'}">
          This profile has not been provisioned yet.
        </Text>
        <Text when="{profile.error.category === 'conflict'}">
          Someone else changed the profile. Refresh before saving.
        </Text>
        <Text when="{profile.error.category === 'server'}">
          The server failed. Try again in a moment.
        </Text>
      </VStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "get-profile": {
      "url": "/profile/:mode",
      "method": "get",
      "pathParamTypes": {
        "mode": "string"
      },
      "handler": "if ($pathParams.mode === 'ok') { return { name: 'Ada Lovelace' }; } const statusByMode = { authorization: 403, 'not-found': 404, conflict: 409, server: 500 }; const status = statusByMode[$pathParams.mode] ?? 500; throw Errors.HttpError(status, { message: 'Profile request failed' });"
    }
  }
}
```

## Key points

**Branch on `category`, not message text**: Categories are stable semantic labels such as `authorization`, `not-found`, `conflict`, `rate-limit`, and `server`.

**Use `code` for diagnostics**: HTTP failures become codes like `http-403` and `http-500`. Codes are useful in logs, support tickets, and QA assertions.

**Read HTTP details from `data`**: `profile.error.data.statusCode` contains the original status code. Other response details may also be present in `data`.

**Retry only retryable categories**: Server and network failures are retryable by default; validation, authorization, not-found, and conflict failures are not.

---

## See also

- [Retry retryable loader errors](/docs/howto/retry-retryable-loader-errors) — retry only categories that can recover
- [Show section fallback from a loader error](/docs/howto/show-section-fallback-from-loader-error) — replace a failed section with recovery UI
- [Structured Exception Model](/docs/managed-react/structured-exception-model) — full `AppError` shape and category table
