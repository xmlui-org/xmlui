# Components

We've already seen a number of XMLUI components in action: [DataSource](/components/DataSource),

[Items](/components/Items),
[List](/components/List),
[Markdown](/components/Markdown),
[Select](/components/Select),
[Option](/components/Option),
[Table](/components/Table).

## Built-in components

As an XMLUI developer you'll create user interfaces by combining these with others in the [core library](/components/_overview), drawing from these categories:

**Data**: [AppState](/components/AppState),
[DataSource](/components/DataSource),
[APICall](/components/APICall) ...

**Display**: [Avatar](/components/Avatar),
[Card](/components/Card), [Heading](/components/Heading), [Image](/components/Image),
[Icon](/components/Icon),
[Markdown](/components/Markdown),
[Text](/components/Text),
[Table](/components/Table) ...

**Input**: [Checkbox](/components/Checkbox),
[DatePicker](/components/DatePicker), [Form](/components/Form),
[FormItem](/components/FormItem),
[FileInput](/components/FileInput),
[NumberBox](/components/NumberBox),
[Select](/components/Select),
[TextArea](/components/TextArea),
[TextBox](/components/TextBox) ...

**Layout**: [FlowLayout](/components/FlowLayout), [HStack](/components/HStack), [VStack](/components/VStack) ...

**Navigation**: [DropdownMenu](/components/DropdownMenu),
[MenuItem](/components/MenuItem),
[NavLink](/components/NavLink),
[NavPanel](/components/NavPanel),
[Tabs](/components/Tabs),
[TabItem](/components/TabItem) ...

## Custom components

You'll also create your own components to combine and extend the built-ins. For example, here's a component that represents the stops on a London tube line.

```xmlui-pg
---app display
<App>
  <TubeStops line="Bakerloo"/>
</App>
---comp display
<Component name="TubeStops">
  <DataSource
    id="stops"
    when="{$props.line}"
    url="https://api.tfl.gov.uk/Line/{$props.line}/StopPoints"
    transformResult="{window.transformStops}"
  />
  <Text variant="strong">{$props.line}</Text>

  <Table data="{stops}">
    <Column width="3*" bindTo="name" />
    <Column bindTo="zone" />
    <Column bindTo="wifi" >
      <Fragment when="{$item.wifi === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
    <Column bindTo="toilets" >
      <Fragment when="{$item.toilets === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
  </Table>

</Component>
```

```javascript
window.transformStops = function(stops) {
  return stops.map(function(stop) {
  // Helper to extract a value from additionalProperties by key
    function getProp(key) {
      if (!stop.additionalProperties) return '';
      var propObj = stop.additionalProperties.find(function(p) {
        return p.key === key;
      });
      return propObj ? propObj.value : '';
    }
    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines
        ? stop.lines.map(function(line) { return line.name; }).join(', ')
        : ''
    };
  });
}
```

An instance of `TubeStops` extracts details for a given tube line. Multiple instances can be arranged on the display using layout components. For example, here's a two-column layout.

```xmlui-pg display
---app display
<App>
    <FlowLayout>
      <Stack width="*">
        <TubeStops line="victoria"/>
      </Stack>
      <Stack width="*">
        <TubeStops line="waterloo-city"/>
      </Stack>
    </FlowLayout>
</App>
---comp
<Component name="TubeStops">
  <DataSource
    id="stops"
    when="{$props.line}"
    url="https://api.tfl.gov.uk/Line/{$props.line}/StopPoints"
    transformResult="{window.transformStops}"
  />
  <Text variant="strong">{$props.line}</Text>

  <Table data="{stops}">
    <Column width="3*" bindTo="name" />
    <Column bindTo="zone" />
    <Column bindTo="wifi" >
      <Fragment when="{$item.wifi === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
    <Column bindTo="toilets" >
      <Fragment when="{$item.toilets === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
  </Table>

</Component>
```


The `TubeStops` component:

- **Lives in the `components` folder**. The full path is `components/TubeStops.xmlui`.
- **Can handle any properties passed in the `$props` [context variable](/context-variables)**. A calling component can send one or more `name="value"` pairs like `line="Bakerloo"`.
- **Defines a dynamic data source**. When this page embeds `<TubeStops line="Bakerloo"/>`, the `TubeStops` component receives a `line` property used to form the URL that fetches data.
- **Transforms data**. When API responses are complex, the expressions needed to unpack them can clutter your XMLUI markup. In this case the  component offloads that work to the `transformStops` function so it can work with a simplified structure.
- **Enriches data**. The transformed data has `yes`/`no` values for `wifi` and `toilets`. `TubeStops` uses [Fragment](/components/Fragment) to display an [Icon](/components/Icon) only for `yes` values.

When you use custom components to access, transform, and present data, your XMLUI markup stays clean, readable, and easy to read and maintain.

Another way to keep your markup clean: rely on XMLUI's layout and style engine to make your app look good and behave gracefully by default. You can adjust the (many!) settings that define an XMLUI [Theme](/components/Theme), but you'll rarely need to. The next chapter explains why.
