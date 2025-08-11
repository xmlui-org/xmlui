%-DESC-START

**Key features:**
- **Value and label separation**: Define what gets stored (value) separately from what users see (label)
- **Automatic fallbacks**: Uses label as value or value as label when only one is provided
- **Custom templates**: Support for rich content via optionTemplate property or child components
- **State management**: Built-in enabled/disabled states for individual options
- **Data integration**: Works seamlessly with Items components for dynamic option lists

## Using `Option`

### With `AutoComplete`

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

### With `Select`

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

%-DESC-END

%-PROP-START label

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

%-PROP-END

%-PROP-START value

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

%-PROP-END
