# Set the Width of an Input Field in an HStack

An `HStack` gives widthless children a default width of `fit-content`. Inputs
still have an intrinsic or minimum usable width, so several widthless fields
can overflow, wrap, or squeeze their siblings when the row is narrower than
their combined intrinsic widths. Set their widths explicitly when you want
them to divide or otherwise share the row predictably.

Without the `width` property set:

```xmlui-pg name="Set the Width of an Input Field in an HStack" copy display id="set-the-width-of-an-input-field-in-an-hstack-b6ec"
<App>
  <HStack>
    <TextBox initialValue="First" />
    <TextBox initialValue="Second" />
  </HStack>
</App>
```

With the property set:

```xmlui-pg name="Set the Width of an Input Field in an HStack 2" copy display /width="*"/
<App>
  <HStack>
    <TextBox initialValue="First" width="*" />
    <TextBox initialValue="Second" width="*" />
  </HStack>
</App>
```

You can set the width of all items at the `HStack` level:

```xmlui-pg name="Set the Width of an Input Field in an HStack 3" copy display /width="*"/
<App>
  <HStack itemWidth="*">
    <TextBox initialValue="First" />
    <TextBox initialValue="Second" />
  </HStack>
</App>
```

## Key points

**Without `width`, each field keeps its intrinsic width**: The horizontal
Stack's default `itemWidth` is `fit-content`. That does not make an input
arbitrarily narrow, so the fields may not fit in a constrained row.

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

- [What width does a Stack child get by default?](/docs/howto/what-width-does-a-stack-child-get-by-default) — content sizing and star-sized siblings

- [HStack component](/docs/reference/components/HStack) — `itemWidth`, `gap`
- [TextBox component](/docs/reference/components/TextBox) — `width`
- [Arrange form fields side by side](/docs/howto/arrange-form-fields-side-by-side) — using `HStack` with labels inside a `Form`
