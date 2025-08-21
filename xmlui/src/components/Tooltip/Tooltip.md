%-DESC-START

## Using Tooltip

You rarely need to use the Tooltip component directly, as visual components support three properties, `tootip`, `tooltipMarkdown`, and `tooltipOptions` respectively. When you utilize the `tooltip` property with a visual component, hovering over that component displays the associated text.

### The `tooltip` property

```xmlui-pg display copy height="180px" /tooltip/ name="Example: using the tooltip property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm hovered!"
    >
    </Button>
  </CHStack>
</App>
```

### The `tooltipMarkdown` property

The `tooltipMarkdown` property allows you to use the tooltip with markdown syntax.

```xmlui-pg display copy /tooltipMarkdown/ name="Example: using the tooltipMarkdown property"
<App>
  <VStack height="80px" width="fit-content">
    <Card
      title="Tooltip with markdown"
      tooltipMarkdown="This *example* uses `toolTipMarkdown`"
      tooltipOptions="right"
    />
  </VStack>
</App>
```

### The `tooltipOptions` property

The tooltip provides several options (see the properties of this component), influencing its behavior and appearance. You can set the `tooltipOptions` property to define these options.

For example, the following example positions the tooltip to the right, making it appear somewhat distant from the component.

```xmlui-pg display copy height="180px" /tooltipOptions/ name="Example: using the tooltipOptions property"
<App>
  <CHStack height="100px" verticalAlignment="center" >
    <Button
      label="Hover the mouse over me!"
      tooltip="I'm hovered"
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

### Using the Tooltip component

Instead of using the tooltip-related properties, you can wrap the component into a `Tooltip`:

```xmlui-pg display copy height="260px" name="Example: Using the Tooltip component"
<App>
  <VStack height="100px" horizontalAlignment="center">
    <Tooltip side="bottom" markdown="This *example* uses a `Tooltip` component">
      <Stack>
        <Card title="Card 1: within a Tooltip" />
        <Card title="Card 2: within the same Tooltip" />
      </Stack>
    </Tooltip>
  </VStack>
</App>
```

### Using a Tooltip template

You can specify tooltips that you could not otherwise do with the `text` or `markdown` properties.

```xmlui-pg display copy height="200px" name="Example: Using a tooltipTemplate" /tooltipTemplate/
<App>
  <VStack height="100px" horizontalAlignment="center">
    <Tooltip side="bottom">
      <property name="tooltipTemplate">
        <HStack>
          <Stack width="24px" height="24px" backgroundColor="purple" />
          <H2>This is a tooltip</H2>
        </HStack>
      </property>
      <Card title="I have a templated Tooltip!" />
    </Tooltip>
  </VStack>
</App>
```

A `tooltipTemplate` may be able to use the `$tooltip` context variable.

```xmlui-pg display copy height="600px" name="Example: tooltipTemplate with $tooltip context variable"
<App
    var.starData="{[
      { star_date: '2025-02-11T00:00:00Z', xmlui_stars: 0, xmlui_test_server_stars: 0, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-18T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 0, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-19T00:00:00Z', xmlui_stars: 4, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-20T00:00:00Z', xmlui_stars: 48, xmlui_test_server_stars: 5, xmlui_invoice_stars: 2, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-21T00:00:00Z', xmlui_stars: 62, xmlui_test_server_stars: 8, xmlui_invoice_stars: 3, xmlui_mcp_stars: 2 },
      { star_date: '2025-07-22T00:00:00Z', xmlui_stars: 16, xmlui_test_server_stars: 3, xmlui_invoice_stars: 1, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-23T00:00:00Z', xmlui_stars: 6, xmlui_test_server_stars: 2, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-24T00:00:00Z', xmlui_stars: 3, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-25T00:00:00Z', xmlui_stars: 10, xmlui_test_server_stars: 2, xmlui_invoice_stars: 1, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-26T00:00:00Z', xmlui_stars: 2, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-27T00:00:00Z', xmlui_stars: 3, xmlui_test_server_stars: 1, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-28T00:00:00Z', xmlui_stars: 4, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-29T00:00:00Z', xmlui_stars: 4, xmlui_test_server_stars: 2, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-07-30T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 0, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 },
      { star_date: '2025-07-31T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-01T00:00:00Z', xmlui_stars: 2, xmlui_test_server_stars: 0, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-05T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-07T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 0, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 },
      { star_date: '2025-08-08T00:00:00Z', xmlui_stars: 3, xmlui_test_server_stars: 1, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-12T00:00:00Z', xmlui_stars: 2, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 },
      { star_date: '2025-08-14T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 0, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-15T00:00:00Z', xmlui_stars: 2, xmlui_test_server_stars: 1, xmlui_invoice_stars: 0, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-18T00:00:00Z', xmlui_stars: 2, xmlui_test_server_stars: 0, xmlui_invoice_stars: 1, xmlui_mcp_stars: 1 },
      { star_date: '2025-08-19T00:00:00Z', xmlui_stars: 3, xmlui_test_server_stars: 1, xmlui_invoice_stars: 1, xmlui_mcp_stars: 0 },
      { star_date: '2025-08-20T00:00:00Z', xmlui_stars: 1, xmlui_test_server_stars: 0, xmlui_invoice_stars: 0, xmlui_mcp_stars: 1 }
    ]}"
  >

    <VStack padding="$space-4" gap="$space-4">
      <Text fontSize="$fontSize-xl" fontWeight="$fontWeight-semibold">
        XMLUI Stars Over Time
      </Text>

      <Card height="400px">
        <LineChart
          data="{starData}"
          dataKeys="{['xmlui_stars', 'xmlui_test_server_stars', 'xmlui_invoice_stars', 'xmlui_mcp_stars']}"
          nameKey="star_date"
          showLegend="true"
          tickFormatterX="{formatDateWithoutYear}">
          <property name="tooltipTemplate">
            <Theme
              border-cell-Table="none"
              padding-cell-Table="0">
              <VStack
                gap="0"
                width="16rem"
                borderRadius="$borderRadius"
                boxShadow="$boxShadow-md"
                backgroundColor="$color-surface-100">
                <Text>
                  {formatDate($tooltip.label)}
                </Text>
                <Table
                  lineHeight="$lineHeight-tight"
                  data="{$tooltip.payload}"
                  hideHeader="true"
                  noBottomBorder="true">
                  <Column width="3*">
                    <HStack gap="$space-2" verticalAlignment="center">
                      <Stack
                        width="8px"
                        height="8px"
                        backgroundColor="{$item.color}" />
                      <Text fontSize="$fontSize-smaller">
                        {$item.dataKey}
                      </Text>
                    </HStack>
                  </Column>
                  <Column>
                    <Text fontSize="$fontSize-smaller">
                      {$item.value}
                    </Text>
                  </Column>
                </Table>
              </VStack>
            </Theme>
          </property>
        </LineChart>
      </Card>
    </VStack>
</App>
```


%-DESC-END