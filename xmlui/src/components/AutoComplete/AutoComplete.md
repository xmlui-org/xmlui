%-DESC-START

**Key features:**
- **Type-ahead filtering**: Users can type to narrow down options in real-time
- **Multi-select support**: Set `multi="true"` to allow selecting multiple items
- **Custom option creation**: Enable `creatable="true"` to let users add new options
- **Rich customization**: Use `optionTemplate` to create complex option layouts

## Using AutoComplete

```xmlui-pg copy display height="200px" name="Example: Using AutoComplete"
<App>
  <AutoComplete>
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" enabled="false" />
    <Option value="3" label="Diana Prince" />
  </AutoComplete>
</App>
```

%-DESC-END

%-PROP-START emptyListTemplate

```xmlui-pg copy display height="200px" name="Example: emptyListTemplate"
<App>
  <AutoComplete>
    <property name="emptyListTemplate">
      <Text>No options found</Text>
    </property>
  </AutoComplete>
</App>
```

%-PROP-END

%-PROP-START multi

```xmlui-pg copy display height="300px" name="Example: multi"
    <App>
      <AutoComplete multi="true">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
        <Option value="4" label="Barry Allen" />
        <Option value="5" label="Hal Jordan" />
      </AutoComplete>
    </App>
```

%-PROP-END

%-PROP-START optionTemplate

```xmlui-pg copy display height="300px" name="Example: optionTemplate"
<App>
  <AutoComplete multi="true">
    <property name="optionTemplate">
      <Text textAlign="center" color="red">{$item.label}</Text>
    </property>
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" />
    <Option value="3" label="Diana Prince" />
  </AutoComplete>
</App>
```

%-PROP-END

%-EVENT-START itemCreated

Add a few new items not in the options list. The following markup will display them:

```xmlui-pg copy display height="300px" name="Example: itemCreated"
<App var.newItems="{[]}">
  <AutoComplete
    id="autoComplete"
    creatable="true"
    onItemCreated="item => newItems.push(item)">
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" />
  </AutoComplete>
  <Text testId="text">
    New items: {newItems.join(", ")}
  </Text>
</App>
```

%-EVENT-END
