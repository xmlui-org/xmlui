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
      tooltip="I'm hovered!"
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
      tooltip="Use an object"
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
      <Stack>
        <Card title="Card 1: within a Tooltip" />
        <Card title="Card 2: within the same Tooltip" />
      </Stack>
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


## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `align` [#align]

> [!DEF]  default: **"center"**

The preferred alignment against the trigger

Available values: `start`, `center` **(default)**, `end`

### `alignOffset` [#alignoffset]

> [!DEF]  default: **0**

An offset in pixels from the 'start' or 'end' alignment options

### `avoidCollisions` [#avoidcollisions]

> [!DEF]  default: **true**

When true, overrides the side and align preferences to prevent collisions with boundary edges

### `defaultOpen` [#defaultopen]

> [!DEF]  default: **false**

The open state of the tooltip when it is initially rendered

### `delayDuration` [#delayduration]

> [!DEF]  default: **700**

The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms)

### `markdown` [#markdown]

The markdown content to display in the tooltip

### `showArrow` [#showarrow]

> [!DEF]  default: **false**

Whether to show the arrow pointing to the trigger element

### `side` [#side]

> [!DEF]  default: **"top"**

The preferred side of the trigger to render against when open

Available values: `top` **(default)**, `right`, `bottom`, `left`

### `sideOffset` [#sideoffset]

> [!DEF]  default: **4**

The distance in pixels from the trigger

### `skipDelayDuration` [#skipdelayduration]

> [!DEF]  default: **300**

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
| [animation](/docs/styles-and-themes/layout-props/#animation)-Tooltip | cubic-bezier(0.16, 1, 0.3, 1) | cubic-bezier(0.16, 1, 0.3, 1) |
| [animationDuration](/docs/styles-and-themes/layout-props/#animationDuration)-Tooltip | 400ms | 400ms |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tooltip | $color-surface-0 | $color-surface-200 |
| [border](/docs/styles-and-themes/common-units/#border)-Tooltip | none | none |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tooltip | 0.25em | 0.25em |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tooltip | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Tooltip | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Tooltip | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Tooltip | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Tooltip | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px |
| [fill](/docs/styles-and-themes/common-units/#color)-arrow-Tooltip | $color-surface-200 | $color-surface-200 |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 1em | 1em |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 1 | 1 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 0.625em | 0.625em |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 0.9375em | 0.9375em |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 0.9375em | 0.9375em |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Tooltip | 0.625em | 0.625em |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Tooltip | *none* | *none* |
| [stroke](/docs/styles-and-themes/common-units/#color)-arrow-Tooltip | $color-surface-200 | $color-surface-200 |
| [strokeWidth](/docs/styles-and-themes/common-units/#size-values)-arrow-Tooltip | 0 | 0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tooltip | $textcolor-primary | $textcolor-primary |
