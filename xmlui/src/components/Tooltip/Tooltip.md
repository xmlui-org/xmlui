%-DESC-START

## Using Tooltip

You rarely need to use the Tooltip component directly, as visual components support three properties, `tootip`, `tooltipMarkdown`, and `tooltipOptions` respectively. When you utilize the `tooltip` property with a visual component, hovering over that component displays the associated text.

### The `tooltip` property

```xmlui-pg display copy height="180px" /tooltip/ name="Example: using the tooltip property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm a hovered!"
    >
    </Button>
  </CHStack>
</App>
```

### The `tooltipMarkdown` property

The `tooltipMarkdown` property allows you to use the tooltip with markdown syntax.

```xmlui-pg display copy /tooltipMarkdown/ name="Example: using the tooltipMarkdown property"
<App>
  <VStack height="80px" width="fit-content">
    <Card
      title="Tooltip with markdown"
      tooltipMarkdown="This *example* uses `toolTipMarkdown`"
      tooltipOptions="right"
    />
  </VStack>
</App>
```

### The `tooltipOptions` property

The tooltip provides several options (see the properties of this component), influencing its behavior and appearance. You can set the `tooltipOptions` property to define these options.

For example, the following example positions the tooltip to the right, making it appear somewhat distant from the component.

```xmlui-pg display copy height="180px" /tooltipOptions/ name="Example: using the tooltipOptions property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm hovered"
      tooltipOptions="right; sideOffset: 32"
    >
    </Button>
  </CHStack>
</App>
```

You can define `tooltipOptions` as a string or as an object. In the latter case, the object declares name and value pairs describing the visual options:

```xmlui-pg display copy height="180px" /tooltipOptions/ name="Example: tooltipOptions as an object"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="My options use an object"
      tooltipOptions="{{ showArrow: false, side: 'bottom', align: 'start' }}"
    >
    </Button>
  </CHStack>
</App>
```

The string form of `tooltipOptions` is composed of names or name and value pairs separated by semicolons. The properties that allow enumerations (such as `side` or `align`) can be set with a name representing a single value. Properties with boolean values can use the property name to represent the `true` value, or the property name prefixed with an exclamation mark to signify a `false` value. Numeric values are separated from the property name by a colon, and they do not use units. Here are a few examples:

```xmlui-pg display copy height="300px" /tooltipOptions/ name="Example: tooltipOptions as a string"
<App>
  <VStack height="100px" horizontalAlignment="center" gap="3rem">
    <Card
      title="Tooltip to the left with 800ms delay"
      tooltip="I'm a Tooltip"
      tooltipOptions="left; delayDuration: 800; !showArrow" />
    <HStack>
      <Icon
        name="email"
        width="48px"
        height="48px"
        tooltipMarkdown="**Tooltip** to the bottom with no arrows, aligned left"
        tooltipOptions="bottom; !showArrow; start" />
      <Icon
        name="phone"
        width="48px"
        height="48px"
        tooltipMarkdown="*Tooltip* to the bottom with arrows, 28 pixels away"
        tooltipOptions="bottom; showArrow; sideOffset: 28" />
    </HStack>
  </VStack>
</App>
```

### Using the Tooltip component

Instead of using the tooltip-related properties, you can wrap the component into a `Tooltip`:

```xmlui-pg display copy height="300px" name="Example: Using the Tooltip component"
<App>
  <VStack height="100px" horizontalAlignment="center">
    <Tooltip side="bottom" markdown="This *example* uses a `Tooltip` component">
      <Card title="Card 1: within a Tooltip" />
      <Card title="Card 2: within the same Tooltip" />
    </Tooltip>
  </VStack>
</App>
```

%-DESC-END