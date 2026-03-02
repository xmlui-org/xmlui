# Option [#option]

`Option` defines selectable items for choice-based components, providing both the underlying value and display text for selection interfaces. It serves as a non-visual data structure that describes individual choices within [Select](/components/Select), [AutoComplete](/components/AutoComplete), and other selection components.

**Key features:**
- **Value and label separation**: Define what gets stored (value) separately from what users see (label)
- **Automatic fallbacks**: Uses label as value or value as label when only one is provided
- **Custom templates**: Support for rich content via optionTemplate property or child components
- **State management**: Built-in enabled/disabled states for individual options
- **Data integration**: Works seamlessly with Items components for dynamic option lists

## Using `Option` [#using-option]

### With `AutoComplete` [#with-autocomplete]

```xmlui-pg copy {4-6} display name="Example: Option in a AutoComplete" height="275px"
<App>
  <Text value="Selected ID: {myComp.value}"/>
  <AutoComplete id="myComp">
    <Option label="John, Smith" value="john" />
    <Option label="Jane, Clint" value="jane" disabled="true" />
    <Option label="Herbert, Frank" value="herbert" />
  </AutoComplete>
</App>
```

### With `Select` [#with-select]

```xmlui-pg copy {4-6} display name="Example: Option in a Select" height="275px"
<App>
  <Text value="Selected ID: {mySelect.value}"/>
  <Select id="mySelect">
    <Option label="John, Smith" value="john" />
    <Option label="Jane, Clint" value="jane" />
    <Option label="Herbert, Frank" value="herbert" />
  </Select>
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property indicates whether the option is enabled or disabled.

### `keywords` [#keywords]

An array of keywords that can be used for searching and filtering the option. These keywords are not displayed but help users find the option through search.

### `label` [#label]

This property defines the text to display for the option. If `label` is not defined, `Option` will use the `value` as the label.

>[!INFO]
> If `Option` does not define any of the `label` or `value` properties, the option will not be rendered.

```xmlui-pg copy display name="Example: Using label" height="275px"
<App>
  <Text value="Selected ID: {mySelect.value}"/>
  <Select id="mySelect">
    <Option />
    <Option label="Vanilla" value="van"/>
    <Option label="Chocolate" value="choc" />
    <Option value="pist" />
  </Select>
</App>
```

### `value` [#value]

This property defines the value of the option. If `value` is not defined, `Option` will use the `label` as the value. If neither is defined, the option is not displayed.

>[!INFO]
> If `Option` does not define any of the `label` or `value` properties, the option will not be rendered.

```xmlui-pg copy display name="Example: Using value" height="275px"
<App>
  <Text value="Selected ID: {mySelect.value}"/>
  <Select id="mySelect">
    <Option />
    <Option label="Vanilla" />
    <Option label="Chocolate" value="chocolate" />
    <Option label="Pistachio" value="pistachio" />
  </Select>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
