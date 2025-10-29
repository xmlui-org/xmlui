# Splitter [#splitter]

`Splitter` component divides a container into two resizable sections. These are are identified by their names: primary and secondary. They have a draggable bar between them.

Most properties of the component focus on the primary section (e.g. sizing).

See also: [HSplitter](/components/HSplitter), [VSplitter](/components/VSplitter).

## Properties [#properties]

### `floating` (default: false) [#floating-default-false]

Toggles whether the resizer is visible (`false`) or not (`true`) when not hovered or dragged. The default value is `false`, meaning the resizer is visible all the time.

```xmlui-pg copy display name="Example: floating"
<App>
  <Splitter height="200px" floating="true">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `initialPrimarySize` (default: "50%") [#initialprimarysize-default-50-]

This optional number property sets the initial size of the primary section. The unit of the size value is in pixels or percentages.

```xmlui-pg copy display name="Example: initialPrimarySize"
<App>
  <Splitter height="200px" initialPrimarySize="40%">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `maxPrimarySize` (default: "100%") [#maxprimarysize-default-100-]

This property sets the maximum size the primary section can have. The unit of the size value is in pixels or percentages. Negative values are supported and calculate from the end of the container (e.g., "-20%" means "80% of container", "-100px" means "container size - 100px").

```xmlui-pg copy display name="Example: maxPrimarySize"
<App>
  <Splitter height="200px" maxPrimarySize="80%">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

```xmlui-pg copy display name="Example: maxPrimarySize with negative value (from end)"
<App>
  <Splitter height="200px" maxPrimarySize="-50px">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `minPrimarySize` (default: "0%") [#minprimarysize-default-0-]

This property sets the minimum size the primary section can have. The unit of the size value is in pixels or percentages.

```xmlui-pg copy display name="Example: minPrimarySize"
<App>
  <Splitter height="200px" minPrimarySize="40px">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `orientation` (default: "vertical") [#orientation-default-vertical]

Sets whether the `Splitter` divides the container horizontally and lays out the section on top of each other (`vertical`), or vertically by placing the sections next to each other (`horizontal`).

Available values: `horizontal`, `vertical` **(default)**

```xmlui-pg copy display name="Example: orientation"
<App>
  <Splitter height="200px" orientation="horizontal">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `splitterTemplate` [#splittertemplate]

The divider can be customized using XMLUI components via this property.

```xmlui-pg copy {2-4} display name="Example: splitterTemplate"
<App>
  <Splitter height="200px">
    <property name="splitterTemplate">
      <ContentSeparator backgroundColor="green" height="4px" />
    </property>
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

### `swapped` (default: false) [#swapped-default-false]

This optional booelan property indicates whether the `Splitter` sections are layed out as primary and secondary (`false`) or secondary and primary (`true`) from left to right.

```xmlui-pg copy display name="Example: swapped"
<App>
  <Splitter height="200px" swapped="true">
    <Stack backgroundColor="lightblue" height="100%" />
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

## Events [#events]

### `resize` [#resize]

This event fires when the component is resized.

```xmlui-pg copy {2} display name="Example: resize"
<App height="200px" var.counter="{0}">
  <Splitter onResize="counter++">
    <Stack backgroundColor="lightblue" height="100%">
      <Text value="Resize event called {counter} number of times" />
    </Stack>
    <Stack backgroundColor="darksalmon" height="100%" />
  </Splitter>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-resizer-Splitter | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Splitter | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Splitter | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Splitter | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Splitter | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Splitter | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Splitter | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Splitter | *none* | *none* |
| [cursor](../styles-and-themes/common-units/#cursor)-resizer-horizontal-Splitter | ew-resize | ew-resize |
| [cursor](../styles-and-themes/common-units/#cursor)-resizer-vertical-Splitter | ns-resize | ns-resize |
| [thickness](../styles-and-themes/common-units/#size)-resizer-Splitter | 5px | 5px |
