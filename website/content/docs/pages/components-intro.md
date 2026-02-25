# Components

We've already seen a number of XMLUI components in action: [DataSource](/docs/reference/components/DataSource), [Items](/docs/reference/components/Items), [List](/docs/reference/components/List), [Markdown](/docs/reference/components/Markdown), [Select](/docs/reference/components/Select), [Option](/docs/reference/components/Option), and [Table](/docs/reference/components/Table).

## Built-in components

As an XMLUI developer you'll create user interfaces by combining these with others in the [core library](/docs/reference/components/_overview), drawing from these categories:

**Data**: [AppState](/docs/reference/components/AppState),
[DataSource](/docs/reference/components/DataSource),
[APICall](/docs/reference/components/APICall) ...

**Display**: [Avatar](/docs/reference/docs/reference/components/Avatar),
[Card](/docs/reference/docs/reference/components/Card), [Heading](/docs/reference/docs/reference/components/Heading), [Image](/docs/reference/docs/reference/components/Image),
[Icon](/docs/reference/components/Icon),
[Markdown](/docs/reference/components/Markdown),
[Text](/docs/reference/components/Text),
[Table](/docs/reference/components/Table) ...

**Input**: [Checkbox](/docs/reference/components/Checkbox),
[DatePicker](/docs/reference/components/DatePicker), [Form](/docs/reference/components/Form),
[FormItem](/docs/reference/components/FormItem),
[FileInput](/docs/reference/components/FileInput),
[NumberBox](/docs/reference/components/NumberBox),
[Select](/docs/reference/components/Select),
[TextArea](/docs/reference/components/TextArea),
[TextBox](/docs/reference/components/TextBox) ...

**Layout**: [FlowLayout](/docs/reference/components/FlowLayout), [HStack](/docs/reference/components/HStack), [VStack](/docs/reference/components/VStack) ...

**Navigation**: [DropdownMenu](/docs/reference/components/DropdownMenu),
[MenuItem](/docs/reference/components/MenuItem),
[NavLink](/docs/reference/components/NavLink),
[NavPanel](/docs/reference/components/NavPanel),
[Tabs](/docs/reference/components/Tabs),
[TabItem](/docs/reference/components/TabItem) ...

## User-defined components

You'll also create your own components to combine and extend the built-ins. For example, here's a component that represents the stops on a London tube line.

```xmlui-pg
---app display /line/
<App>
  <TubeStops line="Bakerloo"/>
</App>
---comp display /line/
<Component name="TubeStops">
  <DataSource
    id="stops"
    when="{$props.line}"
    url="https://api.tfl.gov.uk/Line/{$props.line}/StopPoints"
    transformResult="{transformStops}"
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
    transformResult="{transformStops}"
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

**Lives in the `components` folder**. The full path is `components/TubeStops.xmlui`.

**Can handle any properties passed in the `$props` [context variable](/context-variables)**. A calling component can send one or more `name="value"` pairs like `line="Bakerloo"`.

**Defines a dynamic data source**. When this page embeds `<TubeStops line="Bakerloo"/>`, the `TubeStops` component receives a `line` property used to form the URL that fetches data.

**Transforms data**. When API responses are complex, the expressions needed to unpack them can clutter your XMLUI markup. In this case the  component offloads that work to the `transformStops` function so it can work with a simplified structure. The `transformStops` function is defined in a `<script>` tag in `index.html`. See [Scripting](https://docs.xmlui.org/scripting) for more on how to use JavaScript in XMLUI.

<details>
  <summary>view the transformStops function</summary>
<pre>
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
</pre>
</details>


**Enriches data**. The transformed data has `yes`/`no` values for `wifi` and `toilets`. `TubeStops` uses [Fragment](/docs/reference/components/Fragment) to display an [Icon](/docs/reference/components/Icon) only for `yes` values.


When you use custom components to access, transform, and present data, your XMLUI markup stays clean, readable, and easy to read and maintain.

Another way to keep your markup clean: rely on XMLUI's layout and style engine to make your app look good and behave gracefully by default. You can adjust the (many!) settings that define an XMLUI [Theme](/docs/reference/components/Theme), but you'll rarely need to. The next chapter explains why.
