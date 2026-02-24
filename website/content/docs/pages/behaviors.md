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
    animationOptions="{{ duration: 1800, reverse: true, loop: true }}"
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
- `delay`: The delay before the animation starts in milliseconds.
- `duration`: The duration of the animation in milliseconds.
- `loop`: Indicates whether the animation should loop (default: false).
- `once`: Indicates whether the animation should only run once (default: false).
- `reverse`: Indicates whether the animation should run in reverse after the normal animation completes.

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

You can add bookmark functionality to any visual component. Using the specified identifier, you can scroll the particular component into view.

**Trigger Properties**

| Name | Description |
|---|---|
| `bookmark` | The ID of the bookmark to create for this component |

**Additional Properties**

| Name | Description |
|---|---|
| `bookmarkLevel` | The heading level for this bookmark (used in table of contents) |
| `bookmarkOmitFromToc` | Whether to omit this bookmark from the table of contents |
| `bookmarkTitle` | The title to use for this bookmark in the table of contents. Defaults to the component's text content. |

Here is a sample with links that scroll a particular component into view using `bookmark`:

```xmlui-pg display copy /bookmark/ height="300px" name="Example: bookmark"
<App layout="vertical-full-header">
  <NavPanel padding="$padding-normal">
    <Link to="/#red">Jump to red</Link>
    <Link to="/#green">Jump to green</Link>
    <Link to="/#blue">Jump to blue</Link>
  </NavPanel>
  <VStack>
    <VStack bookmark="red" height="400px" backgroundColor="red" />
    <VStack bookmark="green" height="400px" backgroundColor="green" />
    <VStack bookmark="blue" height="400px" backgroundColor="blue" />
  </VStack>
</App>
```

## FormBinding

This behavior can put any components that handle input values directly to the XMLUI Form infrastructure, without requiring a FormItem wrapper. Any component that has a `value` API to retrieve its value and a `setValue` method to update it to a new value can be seamlessly integrated into the Form infrastructure.

**Trigger Properties**

| Name | Description |
|---|---|
| `bindTo` | The name of the form field to bind this input component to |

**Additional Properties**

| Name | Description |
|---|---|
| `initialValue` | The initial value for this form field when the form is first rendered |
| `noSubmit` | Whether to exclude this field's value from form submission |

The `TextBox` and `TextArea` components support the `value` and `setValue` APIs, so they can be used in the Form infrastructure:

```xmlui-pg display copy /bindTo/ name="Example: bindTo"
<App>
  <Form 
    data="{{ 
      firstname: 'Albert', 
      lastname: 'Einstein', 
      comments: 'e=mc^2'
    }}"
    onSubmit="d => toast.success(JSON.stringify(d, null, 2))">
    <FlowLayout >
      <TextBox label="Firstname" bindTo="firstname" width="50%"/>
      <TextBox label="Lastname" bindTo="lastname" width="50%" />
    </FlowLayout>
    <TextArea label="Comments" bindTo="comments" />
  </Form>
</App>
```


## Label

You can add a label to components using the label property. Though labels are primarily used for input components, with the label property, you can add labels to any visual component.

**Trigger Properties**

| Name | Description |
|---|---|
| `label` | The text to display as the label for the component |

**Additional Properties**

| Name | Description |
|---|---|
| `enabled` | Whether the component should indicate that it is enabled |
| `labelBreak` | Whether the label should break onto a new line |
| `labelPosition` | The position of the label relative to the input component ("top", "start", "end", or "bottom") |
| `labelWidth` | The width of the label |
| `readonly` | Whether the component should indicate that it is read-only |
| `required` | Whether the component should indicate that it is required |
| `shrinkToLabel` | Whether the component should shrink to fit the label |

```xmlui-pg display copy name="Example: label"
<App>
  <Avatar name="My Avatar" label="An avatar" labelPosition="start" />
  <Badge value="Primary" label="Use this badge:" required />
  <Icon name="home" 
    label="Welcome home!" 
    labelPosition="end"
    width="fit-content"
  />
</App>
```

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

You can add validation functionality to input components with validation-related properties to integrate any component with the XMLUI Form infrastructure. Any component that has a `value` API to retrieve its value and a `setValue` method to set a new value can be seamlessly integrated into the Form infrastructure.

**Trigger Properties**

| Name | Description |
|---|---|
| `bindTo` | The name of the form field to bind this input component to |

**Additional Properties**

| Name | Description |
|---|---|
| `lengthInvalidMessage` | Custom error message to display when input length is invalid |
| `lengthInvalidSeverity` | Severity level for length validation errors (e.g., 'error', 'warning', 'info') |
| `maxLength` | Maximum length for string inputs |
| `minLength` | Minimum length for string inputs |
| `minValue` | Minimum value for number inputs |
| `maxValue` | Maximum value for number inputs |
| `pattern` | Predefined pattern name for input validation |
| `patternInvalidMessage` | Custom error message to display when input does not match the pattern |
| `patternInvalidSeverity` | Severity level for pattern validation errors (e.g., 'error', 'warning', 'info') |
| `rangeInvalidMessage` | Custom error message to display when input value is out of range |
| `rangeInvalidSeverity` | Severity level for range validation errors (e.g., 'error', 'warning', 'info') |
| `regex` | Regex pattern for input validation |
| `regexInvalidMessage` | Custom error message to display when input does not match the regex |
| `regexInvalidSeverity` | Severity level for regex validation errors (e.g., 'error', 'warning', 'info') |
| `required` | Whether this field is required |
| `validationMode` | The mode to use for validating the input (e.g., 'onChange', 'onBlur', 'onSubmit') |
| `verboseValidationFeedback` | Whether to display verbose validation feedback (e.g., show all validation errors instead of just the first one) |

_TBD_: Add vaildation example

## Variant

This behavior applies custom variant styling to components with a `variant` property. The value of this property names a set of theme variables that you can use to override the default theme of the component.

**Trigger Properties**

| Name | Description |
|---|---|
| `variant` | The variant value to apply |

You can declare your variant-bound theme variables following this naming convention:

`<propertyName>-<part-or-aspect>-<ComponentId>-<variantName>--<state>`

XMLUI will apply theme variables where the `variantName` section is replaced with the value of the `variant` property assigned to your component. The following example defines a few custom variants for `Card`:

```xmlui-pg display copy {3-6,8-10} name="Example: Card variants"
<App>
  <Theme 
    backgroundColor-Card-fancy="lightyellow"
    backgroundColor-Card-fancy--hover="orange"
    border-Card-fancy="4px dotted purple"
    borderRadius-Card-fancy="20px"

    backgroundColor-Card-rigid="$color-surface-200"
    border-Card-rigid="2px solid $color-primary"
    borderRadius-Card-rigid="0"
  >
    <Card title="Default Card" />
    <Card title="Fancy Card #1 (hover me!)" variant="fancy" />
    <Card title="Fancy Card #2 (hover me!)" variant="fancy" />
    <Card title="Rigid Card #1" variant="rigid" />
    <Card title="Card with non-existing variant" variant="non-existing" />
  </Theme>
</App>
```

