# Set the Width of an Input Field in an HStack

When placing items, particularly input fields, in an `HStack` or a `Stack` with a horizontal layout, you need to explicitly set the `width` of each component. Otherwise, by default, the first component will take all the horizontal space available and push the rest outside the layout or to a new line, or squash them, if its width is also constrained.

Without the `width` property set:

```xmlui-pg copy display
<App>
  <HStack>
    <TextBox initialValue="First" />
    <TextBox initialValue="Second" />
  </HStack>
</App>
```

With the property set:

```xmlui-pg copy display /width="*"/
<App>
  <HStack>
    <TextBox initialValue="First" width="*" />
    <TextBox initialValue="Second" width="*" />
  </HStack>
</App>
```

You can set the width of all items at the `HStack` level:

```xmlui-pg copy display /width="*"/
<App>
  <HStack itemWidth="*">
    <TextBox initialValue="First" />
    <TextBox initialValue="Second" />
  </HStack>
</App>
```

## Key points

**Without `width`, the first field claims the entire row**: Input components stretch to fill their container by default. In an `HStack` this means the first field consumes all horizontal space, leaving nothing for its siblings.

**`width="*"` divides available space equally**: The star unit means "take a proportional share of the remaining space". Two sibling fields both set to `width="*"` each get half the row; three fields each get a third.

**Mix star and fixed widths for unequal columns**: A fixed pixel or percentage width on one field reserves that exact amount, and any `width="*"` sibling fills whatever space remains:

```xmlui
<HStack>
  <TextBox label="City" width="*" />
  <TextBox label="Postcode" width="160px" />
</HStack>
```

**`itemWidth` on `HStack` is a shorthand for all children**: Setting `itemWidth="*"` on the container applies that width to every direct child, so you don't have to repeat `width="*"` on each field. A child that sets its own `width` explicitly overrides the parent's `itemWidth`.

---

## See also

- [HStack component](/docs/reference/components/HStack) — `itemWidth`, `gap`
- [TextBox component](/docs/reference/components/TextBox) — `width`
- [Arrange form fields side by side](/docs/howto/arrange-form-fields-side-by-side) — using `HStack` with labels inside a `Form`
