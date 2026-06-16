# Register a custom route constraint

Use `App.registerValidator` when a route parameter has an app-specific shape.

Custom routing constraints reuse the forms validator registry. Register the validator once, then reference it from `Page url` or `Page queryParams`. Routing validators must be synchronous because navigation needs an immediate allow or reject decision.

```xmlui-pg copy display name="Register and use a customer-code route constraint" id="register-and-use-a-customer-code-route-constraint" height="360px"
---app display /\$pathname/ /\$routeParams/
<App scrollWholePage="false">
  <script>
    App.registerValidator({
      name: "customerCode",
      fn: (value) =>
        new RegExp("^CUST-[0-9]{4}$").test(String(value))
          ? null
          : "Customer codes look like CUST-1234",
      defaultMessage: "Customer codes look like CUST-1234"
    });
  </script>

  <Pages fallbackPath="/customers/help">
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Customer lookup</Text>
        <HStack>
          <Button
            label="Open customer CUST-1042"
            onClick="navigate('/customers/CUST-1042')"
          />
          <Button
            label="Open rejected customer URL"
            onClick="navigate('/customers/help')"
          />
        </HStack>
      </VStack>
    </Page>

    <Page url="/customers/:code:customerCode">
      <VStack gap="$space-2">
        <Text variant="strong">Customer accepted</Text>
        <Text>Customer code: {$routeParams.code}</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>

    <Page url="/customers/help">
      <VStack gap="$space-2">
        <Text variant="strong">Customer URL rejected</Text>
        <Text>Customer codes must start with CUST- and four digits.</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**Register before the route is compiled**: Place the `App.registerValidator` call before the `Pages` block that references the custom constraint.

**Return `null` for valid values**: The validator follows the forms contract: `null` or `undefined` means valid; a string means invalid.

**Keep routing validators synchronous**: Returning a `Promise` rejects the route. Use a loader inside the page for server-side checks that need I/O.

**Reuse the same names in forms and routes**: A registered validator can validate a `FormItem` and defend a route, which keeps business-specific formats in one place.

**Make rejected-route outcomes reachable**: The example includes the same page you would use as the fallback for rejected customer-code URLs, so readers can inspect the recovery content directly.

**Register custom validators at startup for rejection behavior**: In full apps, register custom validators from startup code before the route table compiles. If a route compiles before the validator is present, XMLUI emits `unknown-constraint` and treats the segment as a string.

---

## See also

- [Constrain route parameters](/docs/howto/constrain-route-parameters) — built-in route constraints
- [Validate query parameters in a page route](/docs/howto/validate-query-parameters-in-a-page-route) — custom validators also work in `queryParams`
- [Defended Routing](/docs/managed-react/defended-routing) — custom constraint behavior
