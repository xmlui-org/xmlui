# Behaviors

XMLUI provides a simple mechanism for attaching a specific behavior to components using attributes, just as you set properties, layout settings, and events for a component. For example, with the `tooltip` attribute, you can display a tooltip to every visible component:

```xmlui-pg display copy /tooltip/ name="Example: using the tooltip behavior"
<App>
    <Button label="Hover the mouse over me!" tooltip="I'm hovered!" />
    <Card title="Tooltip with markdown" tooltip="I'm hovered too!" />
    <Avatar name="XML UI" size="md" tooltip="I am an Avatar!"/>
</App>
```

Another attribute, `animation`, can be used to attach animations to components. Moreover, it can add options to the applied animation:

```xmlui-pg display copy /animation/ /animationOptions/ name="Example: using the animation behavior"
<App>
  <Stack 
    width="4em" 
    height="4em" 
    backgroundColor="lightcoral" 
    animation="zoomin"
    animationOptions="{{ duration: 800, reverse: true, loop: true }}"
    />
</App>
```

## Using a behavior

When you add an attribute to a component that XMLUI recognizes as a "trigger" attribute for a behavior, the framework checks whether the behavior can decorate the component. If so, the behavior is applied; otherwise, the framework ignores it.

For example, the tooltip behavior cannot leverage non-visual components.

The following table summarizes the currently supported XMLUI behaviors.

| Behavior | Description | Trigger Properties |
|---|---|---|
| `Animation` | Applies visual animations to components with configurable duration, timing, and looping options. | `animation` |
| `Bookmark` | Adds navigation anchors and table of contents integration to visual components. | `bookmark` |
| `FormBinding` | Binds input components directly to form data without requiring a FormItem wrapper. | `bindTo` |
| `Label` | Wraps components with a label element for form inputs and other labeled content. | `label` |
| `Tooltip` | Displays informational text or markdown content when hovering over visual components. | `tooltip`, `tooltipMarkdown` |
| `Validation` | Provides validation logic and feedback for form input components. | `bindTo` (with validation props) |
| `Variant` | Applies custom theme-aware styling for non-predefined variant values. | `variant` |

## Animation

With this behavior, you can add visual animations to components with configurable duration, timing, and looping options.

**Trigger Properties**

| Name | Description |
|---|---|
| `animation` | The name of a predefined animation to apply |

You can use these built-in animations: `fadein`, `fadeout`, `slidein`, `slideout`, `popin`, `popout`, `flipin`, `flipout`, `rotatein`, `rotateout`, `zoomin`,  and `zoomout`.

**Additional Properties**

| Name | Description |
|---|---|
| `animationOptions` | The animation provides several options that influence its behavior and appearance. You can set this property to define these options. |

These are the display options you can use with an animation:
- `animateWhenInView`: Indicates whether the animation should start when the component is in view.
- `duration`: The duration of the animation in milliseconds.
- `once`: Indicates whether the animation should only run once (default: false).
- `reverse`: Indicates whether the animation should run in reverse after the normal animation completes.
- `loop`: Indicates whether the animation should loop (default: false).
- `delay`: The delay before the animation starts in milliseconds.

You can define `animationOptions` as a string or as an object. In the latter case, the object declares name and value pairs describing the visual options:

```xmlui-pg display copy /animationOptions/ name="Example: animationOptions as an object"
<App>
  <Stack 
    width="24em" 
    height="4em" 
    backgroundColor="lightcoral" 
    animation="slidein"
    animationOptions="{{ duration: 2000, delay: 200 }}"
    />
</App>
```

The string form of `animationOptions` is composed of names or name and value pairs separated by semicolons. The properties that allow enumerations (such as `side` or `align`) can be set with a name representing a single value. Properties with boolean values can use the property name to represent the `true` value, or the property name prefixed with an exclamation mark to signify a `false` value. Numeric values are separated from the property name by a colon, and they do not use units. Here are a few examples:

```xmlui-pg display copy /animationOptions/ name="Example: animationOptions as a string"
<App>
  <Stack 
    width="24em" 
    height="4em" 
    backgroundColor="lightcoral" 
    animation="slidein"
    animationOptions="animateWhenInView; duration: 2000;"
    />
</App>
```


## Bookmark

*TBD*

## FormBinding

*TBD*

## Label

*TBD*

## Tooltip

This behavior displays informational text or markdown content when hovering over visual components.

**Trigger Properties**

| Name | Description |
|---|---|
| `tooltip` | Plain text to be displayed as the tooltip for the host component |
| `tooltipMarkdown` | Markdown text to be displayed as the tooltip for the host component |

**Additional Properties**

| Name | Description |
|---|---|
| `tooltipOptions` | The tooltip provides several options that influence its behavior and appearance. You can set this property to define these options. |

These are the display options you can use with a tooltip:
- `delayDuration`: The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms).
- `skipDelayDuration`: How much time a user has to enter another trigger without incurring a delay again (in ms).
- `defaultOpen`: The open state of the tooltip when it is initially rendered (default: false). Default: 700.
- `showArrow`: Whether to show the arrow pointing to the trigger element (default: false). Default: 300.
- `side`: The preferred side of the trigger to render against when open ("top", "right", "bottom", or "left"). Default: "top".
- `align`: The preferred alignment against the host component ("start", "center", or "end"). Default: "center".
- `sideOffset`: The distance in pixels from the trigger (default: 4)
- `alignOffset`: An offset in pixels from the "start" or "end" alignment options (default: 0).
- `avoidCollisions`: When true, overrides the side and align preferences to prevent collisions with boundary edges (default: true).

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

## Validation

*TBD*

## Variant

*TBD*
