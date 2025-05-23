# Layout

An XMLUI app is a **hierarchical component tree** where parent components nest their children. While displaying children, each component arranges them with a particular strategy. For example, it puts children from in the same row horizontally, providing some gap among them.

Some components' only role is to arrange their nested children in a particular layout. We call them **layout components**. They can nest other layout components in arbitrary depths. This arrangement allows the creation of complex app and component layouts.

In this article, you will learn the basics of the XMLUI layout system and get acquainted with the fundamental layout components.

## Layout Terminology

We use a few terms to help us understand the topics quickly when discussing layout.

### Viewport

<Callout type="info" emoji="💡">
Each component has a rectangular UI patch for rendering its content (and nested children). **This is the component's viewport**. The component decides (according to its rendering strategy) how it places its contents into the viewport. It may fill that partially, stretch the content for the entire viewport, or even overflow it vertically and horizontally.
</Callout>

The following app contains two components, an `App`, and a `Text`:

```xmlui copy
<App>
  <Text>Hello from XMLUI</Text>
</App>
```

<Playground
  name="Component viewports"
  horizontal={true}
  app={`
    <App border="2px dotted red">
      <Text border="2px dotted green">Hello from XMLUI</Text>
    </App>
  `}
/>

The borders mark the viewport boundaries of the components:

- `App`: The dotted red border is the app's viewport boundary. An `App` has the entire browser window as its viewport; however, it reserves some space to the left and right for scrollbars (to avoid viewport resizing when a vertical scrollbar appears or gets removed).
- `Text`: The dotted green border is the text's viewport boundary. Its parent, `App`, uses some padding around its children.

### Orientation

<Callout type="info" emoji="💡">
When rendering its children, a component may render them with vertical or horizontal orientation.
</Callout>

- Vertical orientation: Each child enters a new row when its parent displays it.
- Horizontal orientation: Each child gets to the same row as its previous sibling. The component can decide when to enter a child component into a new row. For example, when the child does not fit into the remaining part of the row, the parent may enter it into a new row.

`App` uses vertical orientation, while `HStack` (horizontal stack) applies horizontal orientation.

```xmlui copy
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

<Playground
  name="Orientation"
  horizontal={true}
  app={`
    <App>
      <Text>First item</Text>
      <HStack>
        <Text>Second item</Text>
        <Text>Third item</Text>
        <Text>Fourth item</Text>
      </HStack>
      <Text>Fifth item</Text>
    </App>
  `}
/>

### Direction

<Callout type="info" emoji="💡">
Some languages (such as Hebrew and Arabic) are read from right to left. XMLUI components use this information to change their children's rendering direction.
</Callout>

This example shows what happens when the browser uses right-to-left direction:

```xmlui copy /direction="rtl"/
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

<Playground
  name="Right-to-left direction"
  horizontal={true}
  app={`
    <App direction="rtl">
      <Text>First item</Text>
      <HStack>
        <Text>Second item</Text>
        <Text>Third item</Text>
        <Text>Fourth item</Text>
      </HStack>
      <Text>Fifth item</Text>
    </App>
  `}
/>

### Paddings and Gaps

<Callout type="info" emoji="💡">
Each component may apply padding and constrain the viewport its children can use. They can also add gaps between adjacent children.
</Callout>

The following sample demonstrates it:

```xmlui copy
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

<Playground
  name="Paddings and gaps"
  height={200}
  horizontal={true}
  app={`
    <App border="2px dotted red">
      <Text border="2px dotted green">First item</Text>
      <HStack border="2px dotted green">
        <Text border="2px dotted purple">Second item</Text>
        <Text border="2px dotted purple">Third item</Text>
        <Text border="2px dotted purple">Fourth item</Text>
      </HStack>
      <Text border="2px dotted green">Fifth item</Text>
    </App>
  `}
/>

- `App` applies vertical and horizontal padding, which is why the top left corner of the red border and the green border do not meet. It also adds gaps, which are the spaces between the green border areas.
- `HStack` uses zero paddings; thus, the top-left corner of its green border and the first item's top-left corner (the purple border) meet. Similarly to `App`, `HStack` adds gaps, which are the spaces between the purple border areas.

### Margins

<Callout type="info" emoji="💡">
Most web and desktop UI frameworks use another concept of spacing  (margins) when establishing the layout. **XMLUI layout components do not use margins**; they only use paddings and gaps.
</Callout>

<Callout type="warning" emoji="💡">
Using both margins and paddings complicates layout arrangements due to side effects (such as margin collapse applied by HTML). Though you can use margins when creating your components, use them as a last resort. For most layouts, paddings must be enough.
</Callout>

### Dimensions

<Callout type="info" emoji="💡">
Each component has a strategy for determining its contents' dimensions (height and width). You can change the component dimensions if this default strategy is unsuitable for your particular layout.
</Callout>

By default, the VStack component determines its dimensions according to its content. However, if we want to display a 40px high and 60px wide orange-red box with empty content, we must explicitly set dimensions (and background color), as the default strategy won't work.

```xmlui copy
<App>
  <VStack height="40px" width="60px" backgroundColor="orangered" />
</App>
```

<Playground
  name="Dimensions"
  height={100}
  horizontal={true}
  app={`
    <App>
      <VStack height="40px" width="60px" backgroundColor="orangered" />
    </App>
  `}
/>

### Alignment

<Callout type="info" emoji="💡">
Components can align their children in the viewport both vertically and horizontally.
</Callout>

The following sample demonstrates it:

<Playground
  name="Alignment"
  horizontal={true}
  app={`
    <App>
      <HStack>
        <VStack width="50%" border="2px dotted red" height="200px" horizontalAlignment="end">
          <Text>Item #1</Text>
          <Text>Item #2</Text>
          <Text>Item #3</Text>
        </VStack>
        <VStack width="50%" border="2px dotted green" height="200px" verticalAlignment="center">
          <Text>Item #1</Text>
          <Text>Item #2</Text>
          <Text>Item #3</Text>
        </VStack>
      </HStack>
    </App>
  `}
/>

The component with the red border aligns its children vertically to the start and horizontally to the end. The green-bordered component aligns its children vertically to the center and horizontally to the start.

<Callout type="info" emoji="📔">
Later in this article, you will learn how to establish the markup for such a layout.
</Callout>

## Fundamental Layout Containers

<Callout type="info" emoji="💡">
XMLUI uses only two fundamental layout containers, `Stack`, and `FlowLayout`. All other container-like components (such as `Card`, `List`, and others) apply these to establish more sophisticated layout arrangements.
</Callout>

`Stack` is a layout container that uses a particular orientation (vertical or horizontal) to render its children in a single column or row. If the children do not fit into the viewport, they overflow. `Stack` has two specialized variants, `HStack` (horizontal stack) and `VStack` (vertical stack), the orientation of which is suggested by their names.

`FlowLayout` is a layout container that renders its children horizontally while they fit into the current row; otherwise, the child enters a new row. If the children do not fit into the viewport, they overflow.

<Callout type="info" emoji="📔">
Your application markup must have a single root component. The browser window is an implicit `VStack` layout container with that root element as its single child.
</Callout>

There are two other components used frequently with these layout containers, `SpaceFiller`, and `Splitter`. In this article, you will learn how to use them.

### Dimension Units [#dimension-units]

<Callout type="info" emoji="💡">
Layout containers use a particular strategy to render their child components; they calculate their children's dimensions.
</Callout>

In specific layouts, you want to set a child's dimensions explicitly (and not determined by the content of the particular child). You can set one or more of these component properties to set a particular <SmartLink href={LAYOUT_PROPERTIES_COMPONENT_WIDTH_HEIGHT}>dimension</SmartLink>: `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, and `maxHeight`.

A child can declare one of these kind of <SmartLink href={COMMON_VISUAL_PROPERTY_UNITS_SIZE}>values</SmartLink> for a specific dimension:

- **No value**. The layout container determines the default size of the child element according to its strategy.
- **Container-independent size value**. All sizes except percentage (`%`) and star sizes (`*`) belong to this category. The container respects the child's requested size.
- **Percentage size**. The container calculates the child's requested size as a percentage of the viewport's corresponding dimension.
- **Star size**. The child provides a weight the parent container utilizes when distributing the _remaining space_ among its children. The remaining space is the parent viewport's size minus the sum sizes of child components within the first two categories (no value, container-independent size value).

<Callout type="info" emoji="📔">
  The article includes examples of these dimension value categories in the sections discussing a particular layout container.
</Callout>

While rendering the child components within the parent's viewport, specific components may overflow the provided viewport size. The layout container's strategy determines how to display (or hide) the exceeding child components.

### Gaps

All fundamental layout containers apply a default gap, ensuring that child components have some space between them.

The following sample shows how a `HStack` renders button children:

```xmlui copy
<App>
  <HStack>
    <Button>First button</Button>
    <Button>Second button</Button>
    <Button>Third button</Button>
  </HStack>
</App>
```

<Playground
  name="Example: Layout containers use default gaps"
  horizontal={true}
  app={`
    <App>
      <HStack>
        <Button>First button</Button>
        <Button>Second button</Button>
        <Button>Third button</Button>
      </HStack>
    </App>
  `}
/>

You can remove the gaps if you intend to omit them entirely:

```xmlui copy /gap="0"/
<App>
  <HStack gap="0">
    <Button>First button</Button>
    <Button>Second button</Button>
    <Button>Third button</Button>
  </HStack>
</App>
```

<Playground
  name="Example: Layout containers with no gaps"
  horizontal={true}
  app={`
    <App>
      <HStack gap="0">
        <Button>First button</Button>
        <Button>Second button</Button>
        <Button>Third button</Button>
      </HStack>
    </App>
  `}
/>

XMLUI offers several predefined gap values. Instead of inline literals (such as "16px", "0.5rem", etc.), use these values, as they can be themed, and it ensures a consistent design. You can learn about them <SmartLink href={THEME_VARIABLES_SPACING_IN_LAYOUT_CONTAINERS}>here</SmartLink>.

The following sample demonstrated using them:

```xmlui copy /gap="$gap-tight"/ /gap="$gap-loose"/
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

<Playground
  name="Example: Layout containers with theme-controlled gaps"
  horizontal={true}
  app={`
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
  `}
/>


### Rendering Children

All layout container renders their children in declaration order; they consider the current page direction (left-to-right or right-to-left).

<Callout type="info" emoji="📔">
  You should know a few additional layout-related things about <SmartLink href={REUSABLE_COMPONENTS + "#reusable-components-in-layout-containers"}>reusable components</SmartLink>.
</Callout>

Let's see a few samples to see how they work! The samples use the following code (replacing `Some_Container`) with a particular layout container:

```xmlui copy /Some_Container/ /width="80%"/
<App>
  <Some_Container>
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="80%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
    <Stack height="20px" width="20%" backgroundColor="orangered" />
  </Some_Container>
</App>
```

This markup displays five boxes; the third is four times wider than the others.

**Vertical stack**: Each child takes a new row.

<Playground
  name="Example: Vertical stack (VStack)"
  horizontal={true}
  app={`
    <App>
      <VStack>
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="80%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
      </VStack>
    </App>
  `}
/>

**Horizontal stack**: All children take a single row.

Observe that the content overflows the width of a single row, and the app displays a horizontal scrollbar.

<Playground
  name="Example: Horizontal stack (HStack)"
  horizontal={true}
  app={`
    <App>
      <HStack>
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="80%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
      </HStack>
    </App>
  `}
/>

**FlowLayout**: The component breaks a child into a new row when it does not fit into the remaining part of the row.

<Playground
  name="Example: FlowLayout"
  horizontal={true}
  app={`
    <App>
      <FlowLayout>
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="80%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
        <Stack height="20px" width="20%" backgroundColor="orangered" />
      </FlowLayout>
    </App>
  `}
/>

### Container Height

<Callout type="info" emoji="💡">
If you set an explicit height (with the `height` layout property), the layout container will use that height; otherwise, it accommodates its content (children) height.
</Callout>

Check these examples:

```xmlui copy
<VStack
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

<Playground
  name="Example: VStack with implicit height"
  app={`
    <VStack
      backgroundColor="cyan"
      horizontalAlignment="center"
      verticalAlignment="center">
      This is some text within a VStack
    </VStack>
  `}
/>

```xmlui copy /height="160px"/
<VStack
  height="160px"
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

<Playground
  name="Example: VStack with *explicit* height"
  app={`
    <VStack
      height="160px"
      backgroundColor="cyan"
      horizontalAlignment="center"
      verticalAlignment="center">
      This is some text within a Stack
    </VStack>
  `}
/>

Check how the stack height changed (the cyan background) between the two examples!

When you explicitly set the height of a layout container, and the content is taller, that will overflow from the container:

```xmlui copy /height="40px"/
<VStack height="40px" backgroundColor="cyan">
  <Text fontSize="3rem">This is some text within a Stack</Text>
</VStack>
```

<Playground
  name="Example: VStack with vertical content overflow"
  height={120}
  app={`
    <VStack height="40px" backgroundColor="cyan">
      <Text fontSize="3rem">This is some text within a Stack</Text>
    </VStack>
  `}
/>

### Container Width

<Callout type="info" emoji="💡">
Unless you use an explicit width, a layout container uses the entire width of its viewport.
</Callout>

Check these examples:

```xmlui copy
<VStack
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

<Playground
  name="Example: VStack with implicit width"
  app={`
    <VStack
      backgroundColor="cyan"
      horizontalAlignment="center"
      verticalAlignment="center">
      This is some text within a VStack
    </VStack>
  `}
/>

```xmlui copy /width="400px"/
<VStack
  width="400px"
  backgroundColor="cyan"
  horizontalAlignment="center"
  verticalAlignment="center">
  This is some text within a VStack
</VStack>
```

<Playground
  name="Example: VStack with *explicit* width"
  app={`
    <VStack
      width="400px"
      backgroundColor="cyan"
      horizontalAlignment="center"
      verticalAlignment="center">
      This is some text within a Stack
    </VStack>
  `}
/>

Check how the stack width changed (the cyan background) between the two examples!

When you explicitly set the width of a layout container, and the content is wider, that will either break or overflow from the container.

For example, when you use text, the content can be broken into multiple lines, like in the following example:

```xmlui copy /width="400px"/
<VStack width="400px" backgroundColor="cyan">
  <Text fontSize="2rem">This is some text within a Stack</Text>
</VStack>
```

<Playground
  name="Example: VStack and text with *explicit* width"
  app={`
    <VStack width="300px" backgroundColor="cyan">
      <Text fontSize="2rem">This is some text within a Stack</Text>
    </VStack>
  `}
/>

Other components, such as a box, may overflow horizontally:

```xmlui copy /width="300px"/ /width="400px"/
<VStack width="300px" backgroundColor="cyan">
  <HStack height="40px" border="2px solid red" width="400px"/>
</VStack>
```

<Playground
  name="Example: HStack with *explicit* width"
  app={`
    <VStack width="300px" backgroundColor="cyan">
      <HStack height="40px" border="2px solid red" width="400px"/>
    </VStack>
  `}
/>

## Stack

The `Stack` component is an essential layout container. It renders its child items horizontally or vertically according to its `orientation` property, optionally providing some gap between child components.

You can assign the `horizontal` or `vertical` values to the `Stack` component's `orientation` property to declare its rendering orientation. The default value is `vertical`.

<Callout type="info" emoji="📔">
Use the Stack component when its `orientation` property comes from an expression evaluated run time. If the orientation is static (it does not change run time), use `VStack` (equivalent with `<Stack orientation="vertical">`) and `HStack` (`<Stack orientation="horizontal">`). This style is straightforward and concise.
</Callout>

### Content Alignment

<Callout type="info" emoji="💡">
With the `horizontalAlignment` and `verticalAlignment` properties, you can define the corresponding alignment of children within a stack.
</Callout>

You can find more information about the values of `horizontalAlignment` and `verticalAlignment` <SmartLink href={COMMON_VISUAL_PROPERTY_UNITS_ALIGNMENT}>here</SmartLink>.

Here are a few samples. The following aligns the children of an `HStack` horizontally in the center:

```xmlui copy /horizontalAlignment="center"/
<HStack horizontalAlignment="center">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</HStack>
```

<Playground
  name="HStack with centered contents"
  horizontal={true}
  app={`
    <HStack horizontalAlignment="center">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </HStack>
  `}
/>

This sample aligns the children of a `VStack` horizontally to the end (right edge):

```xmlui copy /horizontalAlignment="end"/
<VStack  horizontalAlignment="end">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</VStack>
```

<Playground

  name="VStack with right-aligned contents"
  horizontal={true}
  app={`
    <VStack  horizontalAlignment="end">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </VStack>
  `}
/>

This sample aligns the children of an `HStack` vertically in the center:

```xmlui copy /verticalAlignment="center"/
<HStack verticalAlignment="center">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="72px" width="36px" />
  <Stack backgroundColor="blue" height="48px" width="36px" />
</HStack>
```

<Playground

  name="HStack with vertically centered contents"
  horizontal={true}
  app={`
    <HStack verticalAlignment="center">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="72px" width="36px" />
      <Stack backgroundColor="blue" height="48px" width="36px" />
    </HStack>
  `}
/>

### Reverse Child Order

<Callout type="info" emoji="💡">
`Stack` has a property, `reverse`, which you can use to reverse the rendering order.
</Callout>

With this flag set, a `HStack` renders its items in the opposite reading order of the current (for example, instead of left-to-right, it uses right-to-left). `VStack` starts rendering the last items and moves toward the first.

See the following example for `HStack`:

```xmlui copy /reverse="true"/
<HStack reverse="true">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</HStack>
```

<Playground
  name="Horizontal Stack with the reverse flag"
  horizontal={true}
  app={`
    <HStack reverse="true">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </HStack>
  `}
/>

This example uses a `VStack`:

```xmlui copy /reverse="true"/

```xmlui copy /reverse="true"/
<VStack reverse="true">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</VStack>
```

<Playground
  name="Vertical Stack with the reverse flag"
  horizontal={true}
  app={`
    <VStack reverse="true">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </VStack>
  `}
/>

## VStack

<Callout type="info" emoji="💡">
A `VStack` component displays each of its children in a new row. If a child has no explicit (or component-specific) width, the `VStack` stretches the component to the entire viewport width. `VStack` keeps the child components' heights intact.
</Callout>

Here is an example:

```xmlui copy
<VStack>
  <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
  <Button>I'm a button</Button>
</VStack>
```

The `H2` component has no explicit size, so its width is set to the width of the text content (as the background color indicates). Though the `Button` component has no explicit size, it has a component-specific one (according to its content), so it is not stretched horizontally. The button is taller than the `VStack`, so its height determines the `VStack` height, and the text height is stretched to that.

<Playground
  name="Example: VStack children width"
  app={`
    <VStack>
      <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
      <Button>I'm a button</Button>
    </VStack>
  `}
/>

### VStack with Percentage Height

<Callout type="info" emoji="💡">
When you use a `VStack` child with percentage height, the effective height is calculated from the entire stack height.
</Callout>

Such a setup may cause overflow if the sum of percentages equals 100%, as the gaps between children are also included in the stack height. The following example demonstrates an overflow:

```xmlui copy
<VStack height="200px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="50%" />
  <Stack backgroundColor="orangered" height="50%" />
</VStack>
```

<Playground
  name="Example: VStack with percentage height (with gaps)"
  app={`
    <VStack height="200px" border="4px dotted green">
      <Stack backgroundColor="cyan" height="50%" />
      <Stack backgroundColor="orangered" height="50%" />
    </VStack>
  `}
/>

When the stack does not apply gaps, there is no overflow:

```xmlui copy /gap="0"/
<VStack gap="0" height="200px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="50%" />
  <Stack backgroundColor="orangered" height="50%" />
</VStack>
```

<Playground
  name="Example: VStack with percentage height (no gaps)"
  app={`
    <VStack gap="0" height="200px" border="4px dotted green">
      <Stack backgroundColor="cyan" height="50%" />
      <Stack backgroundColor="orangered" height="50%" />
    </VStack>
  `}
/>

### VStack with Star Height

<Callout type="info" emoji="💡">
When you use a `VStack` child height with star-sizing, the effective height is calculated from the remaining height of the entire stack after subtracting the heights of explicitly sized children and gaps.
</Callout>

Such a configuration will not cause overflow. Here is a sample:

```xmlui copy
<VStack height="240px" border="4px dotted green">
  <Stack backgroundColor="cyan" height="*" />
  <H3>I'm a heading</H3>
  <Stack backgroundColor="orangered" height="2*" />
</VStack>
```

<Playground
  name="Example: VStack with percentage height (with gaps)"
  app={`
    <VStack height="240px" border="4px dotted green">
      <Stack backgroundColor="cyan" height="*" />
      <H3>I'm a heading</H3>
      <Stack backgroundColor="orangered" height="2*" />
    </VStack>
  `}
/>

## HStack

<Callout type="info" emoji="💡">
A `HStack` component displays each of its children in a single row. If a child has no explicit (or component-specific) width, the `HStack` fits the component width to its content. `HStack` sets the child components' heights to the stack's viewport height.
</Callout>

Here is an example:

```xmlui copy
<HStack>
  <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
  <Button>I'm a button</Button>
</HStack>
```

The `H2` component has no explicit size, so it's stretched to the viewport width (as the background color indicates). Though `Button` has no explicit size, it has a component-specific one (according to its content), so it is not stretched.

<Playground
  name="Example: HStack children width"
  app={`
    <HStack>
      <H2 backgroundColor="orangered">I'm a heading with colored background</H2>
      <Button>I'm a button</Button>
    </HStack>
  `}
/>

### HStack with Percentage Width

<Callout type="info" emoji="💡">
When you use a `HStack` child with percentage width, the effective width is calculated from the stack's viewport width.
</Callout>

Such a setup may cause horizontal overflow if the sum of percentages equals 100%, as the gaps between children are also included in the stack height. The following example demonstrates this effect:

```xmlui copy
<HStack border="4px dotted green" height="200px">
  <Stack backgroundColor="cyan" width="50%" />
  <Stack backgroundColor="orangered" width="50%" />
</HStack>
```

<Playground
  name="Example: HStack with percentage height (with gaps)"
  height={240}
  app={`
    <HStack border="4px dotted green" height="200px">
      <Stack backgroundColor="cyan" width="50%" />
      <Stack backgroundColor="orangered" width="50%" />
    </HStack>
  `}
/>

When the stack does not apply gaps, there is no overflow:

```xmlui copy /gap="0"/
<HStack gap="0" border="4px dotted green" height="200px">
  <Stack backgroundColor="cyan" width="50%" />
  <Stack backgroundColor="orangered" width="50%" />
</HStack>
```

<Playground
  name="Example: HStack with percentage height (no gaps)"
  app={`
    <HStack gap="0" border="4px dotted green" height="200px">
      <Stack backgroundColor="cyan" width="50%" />
      <Stack backgroundColor="orangered" width="50%" />
    </HStack>
  `}
/>

### HStack with Star Width

<Callout type="info" emoji="💡">
When you use a `HStack` child width with star-sizing, the effective height is calculated from the remaining width of the stack's viewport width after subtracting the widths of explicitly sized children and gaps.
</Callout>

Such a configuration will not cause overflow. Here is a sample:

```xmlui copy
<HStack height="60px" border="4px dotted green">
  <Stack backgroundColor="cyan" width="*" />
  <H3>I'm a heading</H3>
  <Stack backgroundColor="orangered" width="2*" />
</HStack>
```

<Playground
  name="Example: VStack with percentage height (with gaps)"
  app={`
    <HStack height="60px" border="4px dotted green">
      <Stack backgroundColor="cyan" width="*" />
      <H3>I'm a heading</H3>
      <Stack backgroundColor="orangered" width="2*" />
    </HStack>
  `}
/>

### Content Wrapping

<Callout type="info" emoji="💡">
`HStack` has a `wrapContent` property. If you set it to `true`, the engine starts a new line (or column) when the subsequent child to render would overflow in the current line.
</Callout>

In the following example, the fourth child does not fit in the first line entirely, so it overflows:

```xmlui copy {2}
<HStack>
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="40%" />
  <Stack backgroundColor="blue" height="36px" width="20%" />
  <Stack backgroundColor="purple" height="36px" width="30%" />
</HStack>
```

<Playground
  name="Horizontal stack with overflow"
  horizontal={true}
  app={`
    <HStack>
      <Stack backgroundColor="red" height="36px" width="25%" />
      <Stack backgroundColor="green" height="36px" width="40%" />
      <Stack backgroundColor="blue" height="36px" width="20%" />
      <Stack backgroundColor="purple" height="36px" width="30%" />
    </HStack>
  `}
/>

By setting the `wrapContent` flag, the forth child gets into a new line:

```xmlui copy {2} /wrapContent="true"/
<HStack wrapContent="true">
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="40%" />
  <Stack backgroundColor="blue" height="36px" width="20%" />
  <Stack backgroundColor="purple" height="36px" width="30%" />
</HStack>
```

<Playground
  name="Horizontal Stack with content wrapping"
  horizontal={true}
  app={`
    <HStack wrapContent="true">
      <Stack backgroundColor="red" height="36px" width="25%" />
      <Stack backgroundColor="green" height="36px" width="40%" />
      <Stack backgroundColor="blue" height="36px" width="20%" />
      <Stack backgroundColor="purple" height="36px" width="30%" />
    </HStack>
  `}
/>

### Rendering Direction

<Callout type="info" emoji="💡">
The `HStack` component respects the reading direction set in the browser and renders its children accordingly.
</Callout>

The following example shows how a the right-to-left reading direction renders the Stack:

```xmlui copy {2} /direction="rtl"/
<HStack direction="rtl">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</HStack>
```

<Playground
  name="Horizontal Stack with right-to-left reading direction"
  horizontal={true}
  app={`
    <HStack direction="rtl">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </HStack>
  `}
/>

The Stack has a property, `reverse`, which you can use to reverse the rendering order suggested by the current reading direction. While the `direction` value affects only the horizontal stack, the `reverse` value affects the vertical one, too.

```xmlui copy {2}
<HStack padding="1rem" gap="1rem" reverse="true">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</HStack>
```

<Playground
  name="Horizontal Stack with the reverse flag"
  horizontal={true}
  app={`
    <HStack padding="1rem" gap="1rem"
      reverse="true">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </HStack>
  `}
/>

```xmlui copy {2}
<VStack padding="1rem" gap="1rem" reverse="true">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="36px" />
  <Stack backgroundColor="blue" height="36px" width="36px" />
</VStack>
```

<Playground
  name="Vertical Stack with the reverse flag"
  horizontal={true}
  app={`
    <VStack padding="1rem" gap="1rem" reverse="true">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="36px" />
      <Stack backgroundColor="blue" height="36px" width="36px" />
    </VStack>
  `}
/>

### Content Wrapping

The Stack has a `wrapContent` property to start a new line (or column) when the subsequent child to render would overflow.

In the following example, the fourth child does not fit in the first line entirely, so it overflows:

```xmlui copy {2}
<HStack padding="1rem" gap="1rem">
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="40%" />
  <Stack backgroundColor="blue" height="36px" width="20%" />
  <Stack backgroundColor="purple" height="36px" width="30%" />
</HStack>
```

<Playground
  name="Horizontal Stack with overflow"
  horizontal={true}
  app={`
    <HStack padding="1rem" gap="1rem">
      <Stack backgroundColor="red" height="36px" width="25%" />
      <Stack backgroundColor="green" height="36px" width="40%" />
      <Stack backgroundColor="blue" height="36px" width="20%" />
      <Stack backgroundColor="purple" height="36px" width="30%" />
    </HStack>
  `}
/>

By setting the `wrapContent` flag, the forth child gets into a new line:

```xmlui copy {2}
<HStack padding="1rem" gap="1rem" wrapContent="true">
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="40%" />
  <Stack backgroundColor="blue" height="36px" width="20%" />
  <Stack backgroundColor="purple" height="36px" width="30%" />
</HStack>
```

<Playground
  name="Horizontal Stack with content wrapping"
  horizontal={true}
  app={`
    <HStack padding="1rem" gap="1rem" wrapContent="true">
      <Stack backgroundColor="red" height="36px" width="25%" />
      <Stack backgroundColor="green" height="36px" width="40%" />
      <Stack backgroundColor="blue" height="36px" width="20%" />
      <Stack backgroundColor="purple" height="36px" width="30%" />
    </HStack>
  `}
/>

> **Note**: Content wrapping is unavailable with the vertical stack.

## CHStack

<Callout type="info" emoji="💡">
`CHStack` is a shorthand version of `Stack` with a horizontal orientation with its contents centered.

```xmlui copy {2-4}
<Stack
  orientation="horizontal"
  verticalAlignment="center"
  horizontalAlignment="center"
/>
```
</Callout>

Here is an example:

```xmlui copy
<CHStack height="100px" width="200px" backgroundColor="lightgray">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="72px" width="36px" />
  <Stack backgroundColor="blue" height="48px" width="36px" />
</CHStack>
```

<Playground
  name="CHStack example"
  horizontal={true}
  app={`
    <CHStack height="100px" width="200px" backgroundColor="lightgray">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="72px" width="36px" />
      <Stack backgroundColor="blue" height="48px" width="36px" />
    </CHStack>
  `}
/>

## CVStack

<Callout type="info" emoji="💡">
`CVStack` is a shorthand version of `Stack` with a vertical orientation with its contents centered.

```xmlui copy {2-4}
<Stack
  orientation="vertical"
  verticalAlignment="center"
  horizontalAlignment="center"
/>
```
</Callout>

Here is an example:

```xmlui copy
<CVStack height="200px" width="100px" backgroundColor="lightgray">
  <Stack backgroundColor="red" height="36px" width="36px" />
  <Stack backgroundColor="green" height="36px" width="72px" />
  <Stack backgroundColor="blue" height="36px" width="48px" />
</CVStack>
```

<Playground
  name="CVStack example"
  horizontal={true}
  app={`
    <CVStack height="200px" width="100px" backgroundColor="lightgray">
      <Stack backgroundColor="red" height="36px" width="36px" />
      <Stack backgroundColor="green" height="36px" width="72px" />
      <Stack backgroundColor="blue" height="36px" width="48px" />
    </CVStack>
  `}
/>

## FlowLayout

The `FlowLayout` component resembles a horizontal stack with content wrapping. Though it implements the same behavior, it has extra features:

- **Percentage sizing**: `FlowLayout` considers the gaps between child elements when using percentage sizing, unlike `Stack`.
- **Responsiveness**: `FlowLayout` resizes percentage-sized children on mobile devices.

### Aligned Percentage Sizing

<Callout type="info" emoji="💡">
When you use an `HStack` with percentage sizing and the sum width of children is 100%, an overflow will occur because gaps require extra space.
</Callout>

The following sample demonstrates such a situation:

```xmlui copy
<HStack>
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</HStack>
```

<Playground
  name="HStack with percentage widths and overflow"
  height={80}
  horizontal={true}
  app={`
      <HStack>
        <Stack backgroundColor="red" height="36px" width="25%" />
        <Stack backgroundColor="green" height="36px" width="50%" />
        <Stack backgroundColor="blue" height="36px" width="25%" />
      </HStack>
    `}
/>

<Callout type="info" emoji="💡">
The `FlowLayout` component handles this sizing issue by adjusting the child component dimensions accounting for the gaps.
</Callout>

```xmlui copy
<FlowLayout>
  <Stack backgroundColor="red" height="36px" width="25%" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</FlowLayout>
```

<Playground
  name="FlowLayout children with 100% combined widths"
  horizontal={true}
  app={`
      <FlowLayout>
        <Stack backgroundColor="red" height="36px" width="25%" />
        <Stack backgroundColor="green" height="36px" width="50%" />
        <Stack backgroundColor="blue" height="36px" width="25%" />
      </FlowLayout>
  `}
/>

### Size Capping

<Callout type="info" emoji="💡">
The FlowLayout component caps the size of items exceeding the available width.
</Callout>

In the following sample, the red box is too wide. Nonetheless, the `FlowLayout` trims it back to 100% width:

```xmlui copy /width="1000000px"/
<FlowLayout>
  <Stack backgroundColor="red" height="36px" width="1000000px" />
  <Stack backgroundColor="green" height="36px" width="50%" />
  <Stack backgroundColor="blue" height="36px" width="25%" />
</FlowLayout>
```

Note how the extreme width of the first child is capped to the space available for the `FlowLayout`, while the other children's sizes remain unmodified:

<Playground
  name="FlowLayout with sum of 100% percentage widths"
  horizontal={true}
  app={`
      <FlowLayout>
        <Stack backgroundColor="red" height="36px" width="1000000px" />
        <Stack backgroundColor="green" height="36px" width="50%" />
        <Stack backgroundColor="blue" height="36px" width="25%" />
      </FlowLayout>
  `}
/>

## SpaceFiller

<Callout type="info" emoji="💡">
`SpaceFiller` is a component that fills the remaining (unused) space in layout containers. Its behavior depends on the layout container in which it is used.
</Callout>

In a `Stack`, `SpaceFiller` pushes the children following it to the other end of the container:

```xmlui copy {3}
<HStack>
  <Stack width="36px" height="36px" backgroundColor="red" />
  <SpaceFiller />
  <Stack width="36px" height="36px" backgroundColor="blue" />
</HStack>
```

<Playground
  name="SpaceFiller in an HStack"
  app={`
  <HStack>
    <Stack width="36px" height="36px" backgroundColor="red" />
    <SpaceFiller />
    <Stack width="36px" height="36px" backgroundColor="blue" />
  </HStack>
  `}
/>

In a `FlowLayout`, `SpaceFiller` acts as a line break for a row. The children following the `SpaceFiller` enters a new line.

```xmlui copy {3}
<FlowLayout>
  <Stack width="20%" height="36px" backgroundColor="red" />
  <SpaceFiller />
  <Stack width="20%" height="36px" backgroundColor="green" />
  <Stack width="20%" height="36px" backgroundColor="blue" />
</FlowLayout>
```

<Playground
  name="Example: in a FlowLayout"
  app={`
  <FlowLayout>
    <Stack width="20%" height="36px" backgroundColor="red" />
    <SpaceFiller />
    <Stack width="20%" height="36px" backgroundColor="green" />
    <Stack width="20%" height="36px" backgroundColor="blue" />
  </FlowLayout>
  `}
/>

## Splitter

The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections (a primary and a secondary) and puts a draggable bar between them.

`Splitter` has two specialized variants, `HSplitter` and `VSplitter`, which separate the two sections vertically and horizontally.

The following example demonstrates a horizontal splitter, which sets some constraints on the size of the primary section:

```xmlui copy /orientation="horizontal"/
<HSplitter
  height="100%"
  minPrimarySize="10%"
  maxPrimarySize="90%">
  <CVStack backgroundColor="lightblue" height="100%">Primary</CVStack>
  <CVStack backgroundColor="darksalmon" height="100%">Secondary</CVStack>
</HSplitter>
```

Try dragging the splitter bar between the sections to experience how it works.

<Playground
  height={150}
  name="HSplitter example"
  app={`
  <HSplitter
    height="100%"
    minPrimarySize="10%"
    maxPrimarySize="90%">
    <CVStack backgroundColor="lightblue" height="100%">Primary</CVStack>
    <CVStack backgroundColor="darksalmon" height="100%">Secondary</CVStack>
  </HSplitter>
  `}
/>

See the <SmartLink href={COMPONENT_SPLITTER}>Splitter reference documentation</SmartLink> to learn more about this component.
