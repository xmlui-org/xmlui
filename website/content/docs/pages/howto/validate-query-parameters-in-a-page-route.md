# Validate query parameters in a page route

Use `Page queryParams` to validate, coerce, and default query-string state.

Query parameters often drive list views and filters. Defended routing lets the page reject invalid values before content renders, while accepted parameters arrive in `$queryParams` with the constrained types.

```xmlui-pg copy display name="Validate ticket list query parameters" id="validate-ticket-list-query-parameters" height="360px"
---app display /\$pathname/ /\$queryParams/
<App scrollWholePage="false">
  <Pages fallbackPath="/tickets/help">
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Ticket links</Text>
        <HStack>
          <Button
            label="Open active tickets"
            onClick="navigate('/tickets?status=open&page=2')"
          />
          <Button
            label="Open invalid status"
            onClick="navigate('/tickets?status=archived&page=2')"
          />
          <Button
            label="Open invalid page"
            onClick="navigate('/tickets?status=open&page=0')"
          />
        </HStack>
      </VStack>
    </Page>

    <Page
      url="/tickets"
      queryParams="status:enum(open,closed)?,page:int(min=1)?">
      <VStack gap="$space-2">
        <Text variant="strong">Tickets accepted</Text>
        <Text>Status: {$queryParams.status ?? 'open'}</Text>
        <Text>Page: {$queryParams.page ?? 1}</Text>
        <Text>Page type: {typeof ($queryParams.page ?? 1)}</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>

    <Page url="/tickets/help">
      <VStack gap="$space-2">
        <Text variant="strong">Ticket URL rejected</Text>
        <Text>Use status open or closed, and page 1 or higher.</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**Constrain only public URL state**: Put filter, sort, and pagination contracts in `queryParams`, where they are enforced for direct links, buttons, and pasted URLs.

**Mark optional values with `?`**: `status:enum(open,closed)?` and `page:int(min=1)?` allow the page to provide defaults when parameters are absent.

**Use typed values after validation**: `$queryParams.page` is a number when present, so pagination logic can use it without ad hoc parsing.

**Reject bad combinations early**: Invalid query values redirect to `fallbackPath` and emit a `constraint-rejected` navigation diagnostic.

---

## See also

- [Constrain route parameters](/docs/howto/constrain-route-parameters) — validate path segments
- [Deep-link to a tab or section](/docs/howto/deep-link-to-a-tab-or-section) — keep visible UI state in the query string
- [Defended Routing](/docs/managed-react/defended-routing) — query constraints and diagnostics
