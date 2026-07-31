# Create a two-handle range slider

Give a `Slider` two handles (dual thumbs) by initializing it with an array of two values; it then reports a `[low, high]` range instead of a single number.

A range slider is the natural control for "between X and Y" filters: price bands, date windows, size limits. `Slider` switches to two handles when its `initialValue` is a two-element array, and `minStepsBetweenThumbs` keeps the handles from crossing or crowding each other.

```xmlui-pg copy display name="Two-handle range slider" height="380px"
<App
  var.priceRange="{[20, 80]}"
  var.products="{[
    { name: 'Notebook', price: 12 },
    { name: 'Backpack', price: 45 },
    { name: 'Headphones', price: 65 },
    { name: 'Keyboard', price: 85 },
    { name: 'Monitor', price: 95 }
  ]}">
  <VStack gap="$space-4" padding="$space-4">
    <Slider
      label="Price range"
      minValue="{0}"
      maxValue="{100}"
      step="{5}"
      minStepsBetweenThumbs="{2}"
      initialValue="{priceRange}"
      onDidChange="(val) => { priceRange = val }"
      valueFormat="{(value) => '$' + value}"
    />
    <Text>Showing products from ${priceRange[0]} to ${priceRange[1]}</Text>
    <Items data="{products.filter(p =>
        p.price >= priceRange[0] && p.price <= priceRange[1])}">
      <HStack gap="$space-2">
        <Text width="120px">{$item.name}</Text>
        <Text variant="strong">${$item.price}</Text>
      </HStack>
    </Items>
  </VStack>
</App>
```

## Key points

**A two-element array creates the second handle**: `initialValue="{[20, 80]}"` is what makes this a range slider rather than a single-value one. From then on the component's value — in `onDidChange`, in `slider.value`, and in form submission — is the array `[low, high]`.

**React to the array value**: the `didChange` handler receives the full array on every drag of either handle. Read the ends with `val[0]` and `val[1]`, or store the whole array in a component variable as this example does with `priceRange`.

**`minStepsBetweenThumbs` is measured in steps, not units**: with `step="{5}"` and `minStepsBetweenThumbs="{2}"`, the handles stay at least 10 units apart. The default of 1 already prevents the two thumbs from occupying the same value.

**`valueFormat` labels both thumbs**: the formatting function is applied to each handle's value independently, so one function covers both ends of the range.

---

## See also

- [Slider component reference](/components/Slider) - all Slider properties, events, and theme variables
- [Filter and transform data from an API](/docs/howto/filter-and-transform-data-from-an-api) - apply the selected range to fetched data
- [Debounce with ChangeListener](/docs/howto/debounce-with-changelistener) - avoid reacting to every intermediate drag value
