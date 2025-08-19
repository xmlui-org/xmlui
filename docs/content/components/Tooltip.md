# Tooltip [#tooltip]

A tooltip component that displays text when hovering over trigger content.

## Using Tooltip [#using-tooltip]

You rarely need to use the Tooltip component directly, as visual components support three properties, `tootip`, `tooltipMarkdown`, and `tooltipOptions` respectively. When you utilize the `tooltip` property with a visual component, hovering over that component displays the associated text.

### The `tooltip` property [#the-tooltip-property]

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

### The `tooltipMarkdown` property [#the-tooltipmarkdown-property]

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

### The `tooltipOptions` property [#the-tooltipoptions-property]

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

### Using the Tooltip component [#using-the-tooltip-component]

Instead of using the tooltip-related properties, you can wrap the component into a `Tooltip`:

```xmlui-pg display copy height="260px" name="Example: Using the Tooltip component"
<App>
  <VStack height="100px" horizontalAlignment="center">
    <Tooltip side="bottom" markdown="This *example* uses a `Tooltip` component">
      <Card title="Card 1: within a Tooltip" />
      <Card title="Card 2: within the same Tooltip" />
    </Tooltip>
  </VStack>
</App>
```

### Using a Tooltip template [#using-a-tooltip-template]

You can specify tooltips that you could not otherwise do with the `text` or `markdown` properties.

```xmlui-pg display copy height="200px" name="Example: Using a tooltipTemplate" /tooltipTemplate/
<App>
  <VStack height="100px" horizontalAlignment="center">
    <Tooltip side="bottom">
      <property name="tooltipTemplate">
        <HStack>
          <Stack width="24px" height="24px" backgroundColor="purple" />
          <H2>This is a tooltip</H2>
        </HStack>
      </property>
      <Card title="I have a templated Tooltip!" />
    </Tooltip>
  </VStack>
</App>
```

## Properties [#properties]

### `align` (default: "center") [#align-default-center]

The preferred alignment against the trigger

Available values: `start`, `center` **(default)**, `end`

### `alignOffset` (default: 0) [#alignoffset-default-0]

An offset in pixels from the 'start' or 'end' alignment options

### `avoidCollisions` (default: true) [#avoidcollisions-default-true]

When true, overrides the side and align preferences to prevent collisions with boundary edges

### `defaultOpen` (default: false) [#defaultopen-default-false]

The open state of the tooltip when it is initially rendered

### `delayDuration` (default: 700) [#delayduration-default-700]

The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms)

### `markdown` [#markdown]

The markdown content to display in the tooltip

### `showArrow` (default: false) [#showarrow-default-false]

Whether to show the arrow pointing to the trigger element

### `side` (default: "top") [#side-default-top]

The preferred side of the trigger to render against when open

Available values: `top` **(default)**, `right`, `bottom`, `left`

### `sideOffset` (default: 4) [#sideoffset-default-4]

The distance in pixels from the trigger

### `skipDelayDuration` (default: 300) [#skipdelayduration-default-300]

How much time a user has to enter another trigger without incurring a delay again (in ms)

### `text` [#text]

The text content to display in the tooltip

### `tooltipTemplate` [#tooltiptemplate]

The template for the tooltip content

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [animation](../styles-and-themes/layout-props/#animation)-Tooltip | cubic-bezier(0.16, 1, 0.3, 1) | cubic-bezier(0.16, 1, 0.3, 1) |
| [animationDuration](../styles-and-themes/layout-props/#animationDuration)-Tooltip | 400ms | 400ms |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tooltip | $color-surface-200 | $color-surface-200 |
| [border](../styles-and-themes/common-units/#border)-Tooltip | none | none |
| [borderBottom](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | 4px | 4px |
| [borderRight](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Tooltip | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px |
| [fill](../styles-and-themes/common-units/#color)-arrow-Tooltip | $color-surface-200 | $color-surface-200 |
| [fontSize](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [lineHeight](../styles-and-themes/common-units/#size)-Tooltip | 1 | 1 |
| [padding](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Tooltip | 10px | 10px |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [paddingRight](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [paddingTop](../styles-and-themes/common-units/#size)-Tooltip | 10px | 10px |
| [paddingVertical](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [stroke](../styles-and-themes/common-units/#color)-arrow-Tooltip | $color-surface-200 | $color-surface-200 |
| [strokeWidth](../styles-and-themes/common-units/#size)-arrow-Tooltip | 0 | 0 |
| [textColor](../styles-and-themes/common-units/#color)-Tooltip | $textcolor-primary | $textcolor-primary |
