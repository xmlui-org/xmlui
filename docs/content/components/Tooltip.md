# Tooltip [#tooltip]

A tooltip component that displays text when hovering over trigger content.

## Using Tooltip [#using-tooltip]

You rarely need to use the Tooltip component directly, as visual components support two properties, `tootip`, and `tooltipOptions` respectively. When you utilize the `tooltip` property with a visual component, hovering over that component displays the associated text.

```xmlui-pg display copy height="180px" /tooltip/ name="Example: using the tooltip property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm a special button"
    >
    </Button>
  </CHStack>
</App>
```

The tooltip provides several options (see the properties of this component), influencing its behavior and appearance. You can set the `tooltipOptions` property to define these options.

For example, the following example positions the tooltip to the right, making it appear somewhat distant from the component.

```xmlui-pg display copy height="180px" /tooltipOptions/ name="Example: using the tooltipOptions property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm a special button"
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

### `showArrow` (default: true) [#showarrow-default-true]

Whether to show the arrow pointing to the trigger element

### `side` (default: "top") [#side-default-top]

The preferred side of the trigger to render against when open

Available values: `top` **(default)**, `right`, `bottom`, `left`

### `sideOffset` (default: 4) [#sideoffset-default-4]

The distance in pixels from the trigger

### `skipDelayDuration` (default: 300) [#skipdelayduration-default-300]

How much time a user has to enter another trigger without incurring a delay again (in ms)

### `text` (required) [#text-required]

The text content to display in the tooltip

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| animationDuration-Tooltip | 400ms | 400ms |
| animationTimingFunction-Tooltip | cubic-bezier(0.16, 1, 0.3, 1) | cubic-bezier(0.16, 1, 0.3, 1) |
| arrowFill-Tooltip | #222 | #333 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tooltip | #222 | #333 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Tooltip | 4px | 4px |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Tooltip | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px | hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px |
| [fontSize](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [lineHeight](../styles-and-themes/common-units/#size)-Tooltip | 1 | 1 |
| [padding](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Tooltip | 10px | 10px |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [paddingRight](../styles-and-themes/common-units/#size)-Tooltip | 15px | 15px |
| [paddingTop](../styles-and-themes/common-units/#size)-Tooltip | 10px | 10px |
| [paddingVertical](../styles-and-themes/common-units/#size)-Tooltip | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Tooltip | white | #f0f0f0 |
