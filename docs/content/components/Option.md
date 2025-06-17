# Option [#option]

`Option` is a non-visual component describing a selection option. Other components (such as `Select`, `AutoComplete`, and others) may use nested `Option` instances from which the user can select.

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

## Use children as Content Template [#use-children-as-content-template]

The [optionTemplate](#optiontemplate) property can be replaced by setting the item template component directly as the Option's child.
In the following example, the two Option are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Option>
    <property name="optionTemplate">
      <Text>Template</Text>
    </property>
  </Option>
  <!-- As this -->
  <Option>
    <Text>Template</Text>
  </Option>
</App>
```

## Properties [#properties]

### `enabled (default: true)` [#enabled-default-true]

This boolean property indicates whether the option is enabled or disabled.

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

### `optionTemplate` [#optiontemplate]

This property is used to define a custom option template

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
