# Layout

An XMLUI app is a hierarchical component tree in which parent components nest their children. Components like `HStack`, `VStack`, and `FlowLayout` use specialized layout strategies to arrange their children.

## Viewport

Each component has a rectangular UI patch for rendering its content (and nested children). This is the component's **viewport**. The component decides (according to its rendering strategy) how it places its contents into the viewport. It may fill it partially, stretch the content to fill the entire viewport, or even overflow it vertically and/or horizontally.

The following app contains two components, an `App`, and a `Text`:

```xmlui-pg display name="Example: viewport"
<App border="2px dotted red">
  <Text width="30%" border="2px dotted green">Hello from XMLUI</Text>
</App>
```

The borders mark the viewport boundaries of the components:

- `App`: The dotted red border is the app's viewport boundary. An `App` has the entire browser window as its viewport; however, it reserves some space to the left and right for scrollbars (to avoid viewport resizing when a vertical scrollbar appears or gets removed).
- `Text`: The dotted green border is the text's viewport boundary. Its parent, `App`, uses some padding around its children.

## Orientation

When rendering its children, a component may render them with vertical or horizontal orientation.

- Vertical orientation: Each child begins a new row when its parent displays it.
- Horizontal orientation: Each child appears in the same row as its previous sibling. In case of overflow the component can decide to push the child to a new row.

`App` uses vertical orientation by default; `HStack` (horizontal stack) uses horizontal orientation.


```xmlui-pg display name="Example: orientation"
<App>
  <Text>First item</Text>
  <HStack>
    <Text>Second item</Text>
    <Text>Third item</Text>
    <Text>Fourth item</Text>
  </HStack>
  <Text>Fifth item</Text>
</App>
```

## Direction

Some languages (such as Hebrew and Arabic) are read from right to left. XMLUI components use this information to change their children's rendering direction. This example shows right-to-left.

```xmlui-pg copy display name="Example: direction" /direction="rtl"/
<App direction="rtl">
  <Text>First item</Text>
  <HStack>
    <Text>Second item</Text>
    <Text>Third item</Text>
    <Text>Fourth item</Text>
  </HStack>
  <Text>Fifth item</Text>
</App>
```

## Paddings and gaps

Each component may adjust the padding around children and gaps between adjacent children.


```xmlui-pg display name="Example: paddings and gaps"
<App border="2px dotted red">
  <Text border="2px dotted green">First item</Text>
  <HStack border="2px dotted green">
    <Text border="2px dotted purple">Second item</Text>
    <Text border="2px dotted purple">Third item</Text>
    <Text border="2px dotted purple">Fourth item</Text>
  </HStack>
  <Text border="2px dotted green">Fifth item</Text>
</App>
```

- `App` applies vertical and horizontal padding, which is why the top left corner of the red border and the green border do not meet. It also adds gaps, which are the spaces between the green border areas.
- `HStack` uses no paddings so the top left corner of its green border and the first item's top-left corner (the purple border) meet. Like `App`, `HStack` adds gaps, here shown as spaces between the purple border areas.

> [!INFO]
> Web and desktop UI frameworks typically use margins to establish layout. XMLUI layout components do not use margins, they only use paddings and gaps. Although you can use margins, they tend to complicate layouts so use them as a last resort.

## Dimensions

Each component has a default strategy for determining the dimensions (height and width) of its children.
`VStack` determines its dimensions according to its content. If we want to display a 40px by 60px orange box with nothing in it and 60px wide orange-red box with empty content, we must explicitly set dimensions (and background color).

```xmlui-pg display name="Example: dimensions"
<App>
  <VStack height="40px" width="60px" backgroundColor="orangered" />
</App>
```

## Alignment

Components can align their children in the viewport both vertically and horizontally.

```xmlui-pg display name="Example: alignment" /horizontalAlignment/ /verticalAlignment/
<App>
  <HStack>
    <VStack 
      width="50%" 
      border="2px dotted red" 
      height="200px" 
      horizontalAlignment="end"
    >
      <Text>Item #1</Text>
      <Text>Item #2</Text>
      <Text>Item #3</Text>
    </VStack>
    <VStack
      width="50%" 
      border="2px 
      dotted green" 
      height="200px" 
      verticalAlignment="center"
    >
      <Text>Item #1</Text>
      <Text>Item #2</Text>
      <Text>Item #3</Text>
    </VStack>
  </HStack>
</App>
```

The component with the red border aligns its children vertically to the start and horizontally to the end. The green-bordered component aligns its children vertically to the center and horizontally to the start.

## Layout containers

XMLUI uses only two fundamental layout containers, `Stack`, and `FlowLayout`. All other container-like components (such as `Card`, `List`, and others) apply these to establish more sophisticated layout arrangements.

`Stack` is a layout container that uses a particular orientation (vertical or horizontal) to render its children in a single column or row. If the children do not fit into the viewport, they overflow. `Stack` has two specialized variants, `HStack` (horizontal stack) and `VStack` (vertical stack).

`FlowLayout` is a layout container that renders its children horizontally while they fit into the current row; otherwise, the child enters a new row. If the children do not fit into the viewport, they overflow.

> [!INFO]
> Your application markup must have a single root component. The browser window is an implicit `VStack` layout container with that root element as its single child.

## Dimension units

To explicitly control a child's dimensions, instead of it being determined by its content, you can set one or more of these [properties](/styles-and-themes/layout-props): `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, and `maxHeight` using several kinds of values.

- **No value**. The layout container determines the default size of the child element according to its strategy.
- **Container-independent size value**. All sizes except percentage (`%`) and star sizes (`*`) belong to this category. The container respects the child's requested size.
- **Percentage size**. The container calculates the child's requested size as a percentage of the viewport's corresponding dimension.
- **Star size**. The child provides a weight the parent container utilizes when distributing the _remaining space_ among its children. The remaining space is the parent viewport's size minus the sum sizes of child components within the first two categories (no value, container-independent size value).

## Gaps

The fundamental layout containers apply a default gap ensuring that children have some space between them.

```xmlui-pg copy display name="Example: default gaps"
<App>
  <HStack>
    <Button>First button</Button>
    <Button>Second button</Button>
    <Button>Third button</Button>
  </HStack>
</App>
```

You can remove the gaps.

```xmlui-pg copy display /gap="0"/ name="Example: default gaps removed"
<App>
  <HStack gap="0">
    <Button>First button</Button>
    <Button>Second button</Button>
    <Button>Third button</Button>
  </HStack>
</App>
```


XMLUI offers several [predefined gap values](/styles-and-themes/theme-variables#spacing-in-layout-containers). Use these instead of inline literals like "16px" or "0.5rem" to enable theming and consistent design.

```xmlui-pg copy /gap="$gap-tight"/ /gap="$gap-loose"/ name="Example: predefined gap values"
<App>
  <VStack>
    <HStack gap="$gap-tight">
      <Button>First button</Button>
      <Button>Second button</Button>
      <Button>Third button</Button>
    </HStack>
    <HStack gap="$gap-loose">
      <Button>First button</Button>
      <Button>Second button</Button>
      <Button>Third button</Button>
    </HStack>
  </VStack>
</App>
```

## Rendering children

Layout containers render their children in declaration order, subject to the current page direction (left-to-right or right-to-left).

This markup displays five boxes; the third is wider than the others.

```xmlui-pg name="Example: VStack"
---app display copy 
<App>
  <VStack>
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="80%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
  </VStack>
</App>
---desc
In a `VStack` each child takes a new row.
```


```xmlui-pg name="Example: HStack"
---app copy display
<App>
  <HStack>
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="80%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
  </HStack>
</App>
---desc
In an `HStack` they occupy one row. The app provides a horizontal scrollbar to accommodate overflow.
```


```xmlui-pg name="Example: HStack"
---app copy display
<App>
  <FlowLayout>
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="80%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
  </FlowLayout>
</App>
---desc
In a `FlowLayout` the children occupy new rows as needed.
```

If you set an explicit `height` the layout container will use that height; otherwise, it accommodates the height of its children. This example uses the natural height of the content.

```xmlui-pg copy display name="Example: Text in VStack"
<VStack
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

This example increases the height.

```xmlui-pg copy display name="Example: VStack with explicit height"
<VStack
  height="160px"
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

## Container width

Unless you use an explicit width, a layout container uses the entire width of its viewport. This example uses implicit width.

```xmlui-pg copy display name="Example: default container width"
<VStack
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

This one uses explicit width.

```xmlui-pg copy display /width="400px"/ name="Example: explicit container width"
<VStack
  width="400px"
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

When you explicitly set the width of a layout container and the content is wider, it will break or overflow.

## Stack

`Stack` renders its child items horizontally or vertically according to its `orientation` property, optionally providing some gap between child components.

You can assign the `horizontal` or `vertical` values to the `Stack` component's `orientation` property to declare its rendering orientation. The default value is `vertical`.

> [!INFO]
> Use `Stack` when the `orientation` property can vary as the result of an expression. If the orientation is static, use `VStack` (equivalent to `<Stack orientation="vertical">`) or `HStack` (`<Stack orientation="horizontal">`).

### Alignment

The `horizontalAlignment` and `verticalAlignment` properties govern alignment within a stack, using values like `start`, `end`, and `center`. See the full list of values [here](/docs/styles-and-themes/common-units#alignment)

This markup aligns the children of an `HStack` horizontally in the center:

```xmlui-pg copy display /horizontalAlignment="center"/ name="Example: horizontally centered content in a HStack"
<HStack horizontalAlignment="center">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</HStack>
```

This markup aligns the children of a `VStack` horizontally to the end (right edge):

```xmlui-pg copy display /horizontalAlignment="end"/ name="Example: horizontally centered content in a VStack"
<VStack  horizontalAlignment="end">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</VStack>
```

This markup aligns the children of an `HStack` vertically in the center:

```xmlui-pg copy display /verticalAlignment="center"/ name="Exmaple: vertically centered text in a HStack"
<HStack verticalAlignment="center">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="72px" width="36px" />
  <Stack backgroundColor="blue" height="48px" width="36px" />
</HStack>
```

## VStack

A `VStack` component displays each of its children in a new row. If a child has no explicit (or component-specific) width, the `VStack` stretches the component to the entire viewport width. `VStack` keeps the child components' heights intact.

```xmlui-pg copy display name="Example: rendering children in a VStack "
<VStack>
  <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
  <Button>I'm a button</Button>
</VStack>
```

The `H2` component has no explicit size, so its width is set to the width of the text content (as the background color indicates). Though the `Button` component has no explicit size, it has a component-specific one (according to its content), so it is not stretched horizontally. The button is taller than the `VStack`, so its height determines the `VStack` height, and the text height is stretched to that.

When you use a `VStack` child with percentage height, the effective height is calculated from the entire stack height. Such a setup may cause overflow if the sum of percentages equals 100%, as the gaps between children are also included in the stack height. This example demonstrates an overflow.

```xmlui-pg copy display name="Example: VStack with percentage height (overflow)"
<VStack height="200px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="50%" />
  <Stack backgroundColor="orangered" height="50%" />
</VStack>
```

There is no overflow when the stack does not apply gaps.

```xmlui-pg copy display /gap="0"/ name="Example: VStack with percentage height (no overflow)"
<VStack gap="0" height="200px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="50%" />
  <Stack backgroundColor="orangered" height="50%" />
</VStack>
```

When you use a `VStack` child height with star sizing, the effective height is calculated from the remaining height of the entire stack after subtracting the heights of explicitly-sized children and gaps.
Such a configuration will not cause overflow.

```xmlui-pg copy display name="Example: VStack with star-sized height"
<VStack height="240px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="*" />
  <H3>I'm a heading</H3>
  <Stack backgroundColor="orangered" height="5*" />
</VStack>
```

## HStack

An `HStack` component displays each of its children in a single row. If a child has no explicit (or component-specific) width, the `HStack` fits the component width to its content. `HStack` sets the child components' heights to the stack's viewport height.

```xmlui-pg copy display name="Example: rendering children in a HStack"
<HStack>
  <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
  <Button>I'm a button</Button>
</HStack>
```

The `H2` component has no explicit size, so it's stretched to the viewport width (as the background color indicates). Though `Button` has no explicit size, it has a component-specific one (according to its content), so it is not stretched.

When you use a `HStack` child with percentage width, the effective width is calculated from the stack's viewport width. Such a setup may cause horizontal overflow if the sum of percentages equals 100%, as the gaps between children are also included in the stack height.

```xmlui-pg copy display name="Example: HStack with percentage width (overflow)"
<HStack border="4px dotted green" height="200px">
  <Stack backgroundColor="cyan" width="50%" />
  <Stack backgroundColor="orangered" width="50%" />
</HStack>
```


When the stack does not apply gaps, there is no overflow:

```xmlui-pg copy display /gap="0"/ name="Example: HStack with percentage width (no overflow)"
<HStack gap="0" border="4px dotted green" height="200px">
  <Stack backgroundColor="cyan" width="50%" />
  <Stack backgroundColor="orangered" width="50%" />
</HStack>
```

When you use a `HStack` child with star sizing, the effective width is calculated from the remaining width of the stack's viewport width after subtracting the widths of explicitly sized children and gaps. Such a configuration will not cause overflow.

```xmlui-pg copy display name="Example: HStack with star-sized width"
<HStack height="60px" border="4px dotted green">
  <Stack backgroundColor="cyan" width="*" />
  <H3>I'm a heading</H3>
  <Stack backgroundColor="orangered" width="2*" />
</HStack>
```

## CHStack

`CHStack` is a shorthand version of `Stack` with a horizontal orientation and centered contents.

```xmlui-pg copy display name="Example: CHStack"
<CHStack height="100px" width="200px" backgroundColor="lightgray">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="72px" width="36px" />
  <Stack backgroundColor="blue" height="48px" width="36px" />
</CHStack>
```

## CVStack

`CVStack` is a shorthand version of `Stack` with a vertical orientation and centered contents.

```xmlui-pg display copy name="Example: CVStack"
<CVStack height="200px" width="100px" backgroundColor="lightgray">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="72px" />
  <Stack backgroundColor="blue" height="36px" width="48px" />
</CVStack>
```

## FlowLayout

`FlowLayout` component is effectively a horizontal stack with content wrapping. Though it implements the same behavior, it has extra features:

- **Percentage sizing**: `FlowLayout` considers the gaps between child elements when using percentage sizing, unlike `Stack`.
- **Responsiveness**: `FlowLayout` resizes percentage-sized children on mobile devices.

When you use an `HStack` with percentage sizing and the sum width of children is 100%, an overflow will occur because gaps require extra space.

```xmlui-pg copy display name="Example: HStack with overflow"
<HStack>
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</HStack>
```

`FlowLayout` handles this sizing issue by adjusting the child component dimensions, accounting for the gaps.

```xmlui-pg copy display name="Example: FlowLayout"
<FlowLayout>
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</FlowLayout>
```

`FlowLayout` caps the size of items exceeding the available width. Here the red box is too wide but `FlowLayout` trims it back to 100% width.

```xmlui-pg copy display /width="1000000px"/ name="Example: FlowLayout with size capping"
<FlowLayout>
  <Stack backgroundColor="red" height="36px" width="1000000px" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</FlowLayout>
```


Note how the extreme width of the first child is capped to the space available for the `FlowLayout`, while the other children's sizes remain unmodified:

## SpaceFiller

`SpaceFiller` fills unused space in layout containers. Its behavior depends on the layout container in which it is used. In a `Stack`, it pushes the children following it to the other end of the container.

```xmlui-pg copy display name="Example: SpaceFiller in a HStack"
<HStack>
  <Stack width="36px" height="36px" backgroundColor="red" />
  <SpaceFiller />
  <Stack width="36px" height="36px" backgroundColor="blue" />
</HStack>
```

In a `FlowLayout`, it acts as a line break for a row. The children following the `SpaceFiller` begin a new line.

```xmlui-pg copy display name="Example: SpaceFiller in a FlowLayout"
<FlowLayout>
  <Stack width="20%" height="36px" backgroundColor="red" />
  <SpaceFiller />
  <Stack width="20%" height="36px" backgroundColor="green" />
  <Stack width="20%" height="36px" backgroundColor="blue" />
</FlowLayout>
```

## Splitter

`Splitter` divides a container into two resizable sections (a primary and a secondary) and puts a draggable bar between them. It has two specialized variants, `HSplitter` and `VSplitter`, which separate the two sections vertically and horizontally.

Here's a horizontal splitter that sets some constraints on the size of the primary section.

```xmlui-pg copy display height="200px" name="Example: Splitter"
<HSplitter
  height="100%"
  minPrimarySize="15%"
  maxPrimarySize="85%">
  <CVStack backgroundColor="lightblue" height="100%">Primary</CVStack>
  <CVStack backgroundColor="darksalmon" height="100%">Secondary</CVStack>
</HSplitter>
```

Try dragging the splitter bar between the sections to see how it works.

