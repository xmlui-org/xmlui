%-DESC-START

**Key features:**
- **Dynamic orientation**: Switch between horizontal and vertical layouts programmatically
- **Comprehensive alignment**: Precise control over both horizontal and vertical child positioning
- **Flexible spacing**: Configurable gaps between elements with theme-aware sizing
- **Content wrapping**: Automatic wrapping when space constraints require it
- **Order control**: Reverse child element order with the reverse property
- **Dock layout**: Anchor children to edges or fill remaining space using the `dock` prop
- **Foundation for variants**: Powers HStack, VStack, CHStack, and CVStack specialized components

For common scenarios, consider the specialized variants: [HStack](/docs/reference/components/HStack) (horizontal), [VStack](/docs/reference/components/VStack) (vertical), [CHStack](/docs/reference/components/CHStack) (centered horizontal), and [CVStack](/docs/reference/components/CVStack) (centered vertical).

## Dock Layout

Setting the `dock` prop on any direct child of a `Stack` switches the parent into **DockPanel layout mode**. Children are anchored to the edges of the parent in declaration order, with the remainder of the space filled by the `stretch` child.

| `dock` value | Behavior |
|---|---|
| `"top"` | Anchored to the top edge, full width, respects its own `height` |
| `"bottom"` | Anchored to the bottom edge, full width, respects its own `height` |
| `"left"` | Anchored to the left of the middle row, respects its own `width` |
| `"right"` | Anchored to the right of the middle row, respects its own `width` |
| `"stretch"` | Fills all remaining space in the middle row; its `width` and `height` are ignored |

Children without a `dock` prop participate as undocked items in the middle row alongside any `stretch` child.

> [!NOTE]
> The parent `Stack` must have a defined `height` for `dock="bottom"` children to anchor to the bottom edge. Without a bounded height the outer flex column has no fixed size and bottom items follow immediately after top items.

```xmlui-pg copy display name="Example: dock layout"
<App>
  <Stack height="300px" width="400px" gap="0">
    <Stack dock="top" height="50px" backgroundColor="coral">
      <Text>Top</Text>
    </Stack>
    <Stack dock="bottom" height="50px" backgroundColor="cornflowerblue">
      <Text>Bottom</Text>
    </Stack>
    <Stack dock="left" width="30%" backgroundColor="lightgreen">
      <Text>Left</Text>
    </Stack>
    <Stack dock="stretch" backgroundColor="lightyellow">
      <Text>Stretch</Text>
    </Stack>
  </Stack>
</App>
```

## Auto-Spacing Based on Nesting Context

`Stack` automatically adjusts its spacing when it detects it is rendered inside an existing layout
context (i.e., nested inside another `Stack`, `Card`, or any other layout container).

These adjustments apply only when no explicit prop is set — explicit props always take precedence.

### Experiment 1: Auto-tight gap in nested Stacks

A top-level `Stack` uses the standard `$gap-normal` spacing between its children. When a `Stack`
is nested inside another layout, it automatically switches to `$gap-tight` so sub-groups naturally
appear more compact without any explicit `gap` setting.

The outer `VStack` below uses normal gap between the two `Card` sections. The inner `VStack` inside
each card automatically uses tight gap between its items.

```xmlui-pg copy display name="Example: auto-tight gap in nested Stacks"
<App>
  <VStack>
    <Card>
      <Text variant="strong">Team Members</Text>
      <VStack>
        <Text value="Alice Johnson" />
        <Text value="Bob Smith" />
        <Text value="Carol Williams" />
      </VStack>
    </Card>
    <Card>
      <Text variant="strong">Recent Activity</Text>
      <VStack>
        <Text value="Pull request merged" />
        <Text value="Issue closed" />
        <Text value="Comment added" />
      </VStack>
    </Card>
  </VStack>
</App>
```

To override the auto-tight gap and use normal spacing inside a nested `Stack`, set `gap` explicitly:

```xmlui-pg copy display name="Example: override auto-tight gap"
<App>
  <VStack>
    <Card>
      <Text variant="strong">Sections with explicit spacing</Text>
      <VStack gap="$gap-normal">
        <Text value="Item A — normal gap overrides the auto-tight default" />
        <Text value="Item B" />
        <Text value="Item C" />
      </VStack>
    </Card>
  </VStack>
</App>
```

### Experiment 2: Auto-center vertical alignment in nested horizontal Stacks

A nested `HStack` automatically applies `verticalAlignment="center"` when it has no explicit
`verticalAlignment` set. This is the most common requirement for toolbar rows, list item rows,
and button groups where icons, text, and buttons of different heights need to line up.

The rows below mix a `Badge` (small) with a multi-line description `VStack` and a `Button`. Without
the auto-center, the items would default to `stretch` alignment and look misaligned.

```xmlui-pg copy display name="Example: auto-center vertical alignment in nested HStack"
<App>
  <VStack>
    <Card>
      <HStack>
        <Badge value="NEW" />
        <VStack>
          <Text variant="strong">Dark mode support</Text>
          <Text>Automatically follows your system preference</Text>
        </VStack>
        <SpaceFiller />
        <Button label="Enable" />
      </HStack>
      <HStack>
        <Badge value="FIX" />
        <VStack>
          <Text variant="strong">Layout engine update</Text>
          <Text>Improved nesting depth detection</Text>
        </VStack>
        <SpaceFiller />
        <Button label="View" />
      </HStack>
    </Card>
  </VStack>
</App>
```

To opt out of the auto-centering and use the default `stretch` alignment, set `verticalAlignment`
explicitly:

```xmlui-pg copy display name="Example: override auto-center with explicit verticalAlignment"
<App>
  <VStack>
    <Card>
      <HStack verticalAlignment="start">
        <Badge value="1" />
        <VStack>
          <Text variant="strong">Items stretch to top</Text>
          <Text>verticalAlignment="start" overrides the auto-center default</Text>
        </VStack>
        <SpaceFiller />
        <Button label="OK" />
      </HStack>
    </Card>
  </VStack>
</App>
```

### Real-life example: Two-column address form

The following example shows both experiments in action simultaneously.

The outer `HStack` (Billing + Shipping columns) is not nested inside any layout context, so it keeps
the default `$gap-normal` spacing between the two columns. Each column is a `VStack` nested inside
the `HStack` — so both automatically receive `$gap-tight` spacing for their form rows without any
explicit `gap` prop.

Within the Shipping column header, the `HStack` containing the section title and the copy button is
also nested, so its items (of different heights) are automatically vertically centered — the icon
and the label text line up without `verticalAlignment="center"`.

```xmlui-pg copy display name="Example: two-column address form"
<App>
  <Form>
    <HStack>
      <VStack width="1*">
        <Text variant="strong">Billing Address</Text>
        <TextBox label="Attention" labelPosition="start" placeholder="Attention to" bindTo="billingAttention" />
        <TextBox label="Address" labelPosition="start" placeholder="Street address" bindTo="billingAddress" />
        <TextBox label="Address Line 2" labelPosition="start" placeholder="Apartment, suite, unit, etc." bindTo="billingAddress2" />
        <TextBox label="City" labelPosition="start" placeholder="City" bindTo="billingCity" />
        <TextBox label="State" labelPosition="start" placeholder="State/Province" bindTo="billingState" />
        <TextBox label="Zip" labelPosition="start" placeholder="Postal code" bindTo="billingZip" />
        <TextBox label="Country" labelPosition="start" placeholder="Country" bindTo="billingCountry" />
      </VStack>
      <VStack width="1*">
        <HStack>
          <Text variant="strong">Shipping Address</Text>
          <SpaceFiller />
          <Icon name="copy" />
          <Text>Same as Billing address</Text>
        </HStack>
        <TextBox label="Attention" labelPosition="start" placeholder="Attention to" bindTo="shippingAttention" />
        <TextBox label="Address" labelPosition="start" placeholder="Street address" bindTo="shippingAddress" />
        <TextBox label="Address Line 2" labelPosition="start" placeholder="Apartment, suite, unit, etc." bindTo="shippingAddress2" />
        <TextBox label="City" labelPosition="start" placeholder="City" bindTo="shippingCity" />
        <TextBox label="State" labelPosition="start" placeholder="State/Province" bindTo="shippingState" />
        <TextBox label="Zip" labelPosition="start" placeholder="Postal code" bindTo="shippingZip" />
        <TextBox label="Country" labelPosition="start" placeholder="Country" bindTo="shippingCountry" />
      </VStack>
    </HStack>
  </Form>
</App>
```

### Real-life example: Composite form row with multiple inputs

The following example shows a form where a single label ("Primary Contact") governs a row of three
inputs — a salutation dropdown, a first-name field, and a last-name field — placed side by side
inside an `HStack`.

Because the `HStack` is nested inside the `Form` layout context, **Experiment 2** kicks in
automatically: the dropdown and the two text fields are vertically centered without any
`verticalAlignment="center"` prop on the `HStack`.

```xmlui-pg copy display name="Example: composite form row with multiple inputs"
<App>
  <Form>
    <RadioGroup label="Customer Type" labelPosition="start" bindTo="customerType"
      initialValue="business" required="true">
      <HStack>
        <Option label="Business" value="business" />
        <Option label="Individual" value="individual" />
      </HStack>
    </RadioGroup>
    <FormItem label="Primary Contact" labelPosition="start" required="true">
      <HStack>
        <Select bindTo="salutation" width="100px">
          <Option value="mr" label="Mr." />
          <Option value="ms" label="Ms." />
          <Option value="dr" label="Dr." />
        </Select>
        <TextBox bindTo="contactFirstName" placeholder="Enter name" width="1*" />
        <TextBox bindTo="contactLastName" placeholder="Last name" width="1*" />
      </HStack>
    </FormItem>
  </Form>
</App>
```

%-DESC-END

%-PROP-START gap

In the following example we use pixels, characters (shorthand `ch`), and the `em` CSS unit size which is a relative size to the font size of the element (See size values).

```xmlui-pg copy {3, 10} display name="Example: gap"
<App>
  <Stack orientation="horizontal" backgroundColor="cyan"
    gap="80px">
    <Stack height="40px" width="40px" backgroundColor="red" />
    <Stack height="40px" width="40px" backgroundColor="green" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="yellow" />
  </Stack>
  <Stack orientation="horizontal" backgroundColor="cyan"
    gap="12ch">
    <Stack height="40px" width="40px" backgroundColor="red" />
    <Stack height="40px" width="40px" backgroundColor="green" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="yellow" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START horizontalAlignment

>[!INFO]
> The `start` and `end` values can be affected by i18n if the layout is in a right-to-left writing style.

```xmlui-pg copy {3} display name="Example: horizontalAlignment"
<App>
  <Stack width="100%" horizontalAlignment="center" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START reverse

Default is **false**, which indicates a left-to-right layout.

```xmlui-pg copy display name="Example: reverse"
<App>
  <Stack backgroundColor="cyan">
    <Stack gap="10px" orientation="horizontal">
      <Stack height="40px" width="40px" backgroundColor="red" />
      <Stack height="40px" width="40px" backgroundColor="green" />
      <Stack height="40px" width="40px" backgroundColor="blue" />
    </Stack>
    <Stack reverse="true" orientation="horizontal">
      <Stack height="40px" width="40px" backgroundColor="red" />
      <Stack height="40px" width="40px" backgroundColor="green" />
      <Stack height="40px" width="40px" backgroundColor="blue" />
    </Stack>
  </Stack>
</App>
```

%-PROP-END

%-PROP-START verticalAlignment

```xmlui-pg copy {2} display name="Example: verticalAlignment"
<App>
  <Stack height="100px" verticalAlignment="end" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START wrapContent

Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.

```xmlui-pg copy display name="Example: wrapContent"
<App>
  <Stack wrapContent="true" width="140px" orientation="horizontal" backgroundColor="cyan">
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
  </Stack>
</App>
```

%-PROP-END

%-EVENT-START click

Describes the logic that fires when the component is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack var.shown="{false}">
    <Stack height="40px" width="40px" backgroundColor="red" onClick="shown = !shown" />
    <Stack when="{shown}" height="40px" width="40px" backgroundColor="blue" />
  </HStack>
</App>
```

%-EVENT-END

## Styling

`Stack` is a layout container; its purpose is to render its nested child components.
`Stack` has no theme variables to change its visual appearance.
