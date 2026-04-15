# Derive a value from multiple sources

Write an expression that combines two or more variables; it re-evaluates automatically whenever any of its inputs change.

XMLUI expressions are reactive: every `{expression}` in markup re-runs whenever any variable it references changes value. You never need an event handler to keep derived values in sync. A quantity and a unit price are enough to reactively compute a subtotal, a tax amount, and an order total — all in one expression each.

```xmlui-pg copy display name="Reactive order calculator"
---app display /quantity/ /unitPrice/ /taxRate/
<App var.quantity="{1}" var.unitPrice="{49.99}" var.taxRate="{0.08}">
  <VStack gap="$space-4" padding="$space-4">
    <Text variant="h5">Order Calculator</Text>

    <HStack gap="$space-4">
      <NumberBox 
        label="Quantity" 
        value="{quantity}" 
        onDidChange="(v) => quantity = v" 
        minValue="1" 
      />
      <NumberBox 
        label="Unit price ($)" 
        value="{unitPrice}" 
        onDidChange="(v) => unitPrice = v" 
        minValue="0" 
      />
      <NumberBox 
        label="Tax rate (%)" 
        value="{taxRate * 100}" 
        onDidChange="(v) => taxRate = v / 100"
        minValue="0" 
        maxValue="100" 
      />
    </HStack>

    <Card padding="$space-3">
      <VStack gap="$space-1">
        <HStack>
          <Text>Subtotal</Text>
          <SpaceFiller />
          <Text>${(quantity * unitPrice).toFixed(2)}</Text>
        </HStack>
        <HStack>
          <Text>Tax ({(taxRate * 100).toFixed(0)}%)</Text>
          <SpaceFiller />
          <Text>${(quantity * unitPrice * taxRate).toFixed(2)}</Text>
        </HStack>
        <HStack>
          <Text variant="strong">Total</Text>
          <SpaceFiller />
          <Text variant="strong">
            ${(quantity * unitPrice * (1 + taxRate)).toFixed(2)}
          </Text>
        </HStack>
      </VStack>
    </Card>
  </VStack>
</App>
```

## Key points

**Expressions are the reactivity primitive**: Any `{expression}` in a prop or child text re-evaluates when any variable it references changes. No `onDidChange` handler or manual update is needed.

**Derived values do not need their own variables**: Instead of storing `subtotal` in a `var.subtotal`, compute it inline — `{quantity * unitPrice}`. This keeps state minimal and eliminates the risk of stale copies.

**Multiple sources are tracked automatically**: If an expression reads from `quantity`, `unitPrice`, and `taxRate`, XMLUI subscribes to all three. Changing any one of them triggers a re-render with the fresh result.

**JavaScript expressions are fully supported**: `.toFixed()`, `.toLocaleString()`, ternary operators, array methods — any valid JavaScript expression works inside `{}`. Keep expressions concise; move complex logic to a `<script>` function when they grow long.

---

## See also

- [Use accessors for complex expressions](/docs/howto/use-accessors-to-simplify-complex-expressions) — extract a repeated nested expression into a named local variable
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects when a derived or input value changes
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — share reactive variables across the component tree
