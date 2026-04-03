# Send custom headers per request

Use the `headers` prop on `DataSource` or `APICall` to attach auth tokens, API keys, or custom metadata to individual requests.

Many APIs require an authorization token or a custom header on every request. Both `DataSource` and `APICall` accept a `headers` prop — a key-value object that is merged into the outgoing HTTP request. You can hard-code values or bind them to reactive expressions so the header updates when the underlying value changes.

```xmlui-pg copy display name="Attach a bearer token and a custom tenant header"
---app display {5-8}
<App var.token="{'abc-secret-token'}">
  <DataSource
    id="profile"
    url="/api/profile"
    headers="{{
      'Authorization': 'Bearer ' + token,
      'X-Tenant-Id': 'acme-corp'
    }}"
  />

  <VStack gap="$space-4" padding="$space-4">
    <Text variant="h5">User Profile</Text>

    <Card when="{profile.loaded}" padding="$space-3">
      <VStack>
        <Text>Name: {profile.value.name}</Text>
        <Text>Role: {profile.value.role}</Text>
        <Text variant="strong">Tenant: {profile.value.tenant}</Text>
      </VStack>
    </Card>

    <APICall
      id="updateRole"
      method="put"
      url="/api/profile/role"
      headers="{{
        'Authorization': 'Bearer ' + token,
        'X-Tenant-Id': 'acme-corp'
      }}"
      body="{{ role: 'admin' }}"
      completedNotificationMessage="Role updated!"
    />

    <Button
      label="Promote to Admin"
      onClick="updateRole.execute()"
      themeColor="primary"
    />
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.role = 'viewer'",
  "operations": {
    "get-profile": {
      "url": "/profile",
      "method": "get",
      "handler": "return { name: 'Alice', role: $state.role, tenant: 'acme-corp' }"
    },
    "update-role": {
      "url": "/profile/role",
      "method": "put",
      "handler": "$state.role = $requestBody.role; return { success: true }"
    }
  }
}
```

## Key points

**`headers` accepts a reactive object expression**: Wrap the value in double braces — `headers="{{ 'Key': value }}"`. When the bound variable changes (e.g., a refreshed token), subsequent requests automatically include the updated header.

**Both `DataSource` and `APICall` support `headers`**: Use the same syntax on either component. The headers are merged with any global headers defined at the app level.

**Use `credentials` for cookie-based auth**: If your API relies on cookies rather than tokens, set `credentials="include"` (or `"same-origin"`) instead of managing headers manually.

**`omitTransactionId` removes the internal tracking header**: XMLUI adds an `x-ue-client-tx-id` header to every request for tracing. If the target API has strict CORS policies that reject unknown headers, set `omitTransactionId="true"` to suppress it.

---

## See also

- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — combining headers with automatic polling
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handling auth failures and retrying
- [Download a file from an API](/docs/howto/download-a-file-from-an-api) — passing headers when downloading files
