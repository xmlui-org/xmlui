# Constrain route parameters

Use constraints in `Page url` to reject malformed route parameters before the page renders.

When a page expects a numeric id, declare that expectation on the route instead of parsing inside the page. XMLUI coerces accepted values into `$routeParams` and redirects rejected values to the `Pages fallbackPath`.

```xmlui-pg copy display name="Constrain an order id route parameter" id="constrain-an-order-id-route-parameter" height="330px"
---app display /\$pathname/ /\$routeParams/
<App scrollWholePage="false">
  <Pages fallbackPath="/not-found">
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Orders home</Text>
        <HStack>
          <Button label="Open order 101" onClick="navigate('/orders/101')" />
          <Button label="Open invalid order" onClick="navigate('/orders/0')" />
        </HStack>
      </VStack>
    </Page>

    <Page url="/orders/:id:int(min=1)">
      <VStack gap="$space-2">
        <Text variant="strong">Order accepted</Text>
        <Text>Order id: {$routeParams.id}</Text>
        <Text>Route id type: {typeof $routeParams.id}</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>

    <Page url="/not-found">
      <VStack gap="$space-2">
        <Text variant="strong">Route rejected</Text>
        <Text>The order route only accepts positive integer ids.</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**Declare the contract in the route**: `:id:int(min=1)` accepts positive integer values and rejects values like `0`, `abc`, or an empty segment.

**Use the coerced value directly**: After validation, `$routeParams.id` is a number, so the page does not need `Number(...)` guards around every use.

**Give rejected URLs a safe destination**: `Pages fallbackPath` decides where users land when a route constraint fails. Pick a page that explains the problem or helps them recover.

**Expect diagnostics for rejected URLs**: A rejected route emits a `constraint-rejected` navigation diagnostic, which Inspector can surface while you debug routing contracts.

---

## See also

- [Validate query parameters in a page route](/docs/howto/validate-query-parameters-in-a-page-route) — constrain values after `?`
- [Register a custom route constraint](/docs/howto/register-a-custom-route-constraint) — reuse app-specific validators in routes
- [Defended Routing](/docs/managed-react/defended-routing) — full managed routing vocabulary
