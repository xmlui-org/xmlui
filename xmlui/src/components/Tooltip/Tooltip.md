%-DESC-START

## Using Tooltip

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

The string form of `tooltipOptions` is composed of names or name and value pairs separated by semicolons. The properties that allow enumerations (such as `side` or `align`) can be set with a name representing a single value. Properties with boolean values can use the property name to represent the `true` value, or the property name prefixed with an exclamation mark to signify a `false` value. Numeric values are separated from the property name by a colon, and they do not use units. Here are a few examples:

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

%-DESC-END