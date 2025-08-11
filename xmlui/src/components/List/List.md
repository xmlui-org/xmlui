%-DESC-START

**Key features:**
- **Virtualization**: Renders only visible items for optimal performance with large datasets
- **Advanced grouping**: Group data by any field with customizable headers and footers
- **Built-in sorting**: Sort by any data field in ascending or descending order
- **Visual formatting**: Pre-styled list appearance with borders, spacing, and layout
- **Pagination support**: Handle large datasets with built-in pagination controls
- **Empty state handling**: Customizable templates for when no data is available

**List vs Items:**
Use `List` for complex data presentation requiring performance optimization, grouping, sorting, or visual formatting. Use `Items` for simple data iteration without layout requirements.

In the following examples all use the same list of data which looks like so:

| Id   | Name    | Quantity | Unit   | Category   | Key  |
| :--- | :------ | :------- | :----- | :--------- | :--- |
| 0    | Apples  | 5        | pieces | fruits     | 5    |
| 1    | Bananas | 6        | pieces | fruits     | 4    |
| 2    | Carrots | 100      | grams  | vegetables | 3    |
| 3    | Spinach | 1        | bunch  | vegetables | 2    |
| 4    | Milk    | 10       | liter  | diary      | 1    |
| 5    | Cheese  | 200      | grams  | diary      | 0    |

The data is provided as JSON.

%-DESC-END

%-PROP-START data

Note how the `List` infers the given data and provides a simple layout for it.
To tweak what data and how it is displayed, see the [`itemTemplate` section](#itemtemplate).

```xmlui copy
<App>
  <List data='{[...]}' />
</App>
```

```xmlui-pg name="Example: data" height="400px"
<App>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

You can also provide the `List` with data directly from an API via this property.

In the example below, the `List` also uses the `itemTemplate` property to access the data attributes as well.
See the [itemTemplate section](#itemtemplate).

```xmlui-pg copy name="Example: data API Call" height="400px"
<App>
  <List data='https://api.spacexdata.com/v3/rockets'>
    <property name="itemTemplate">
      <Card>
        <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        <Text value="{$item.country}" />
        <Text value="{$item.company}" variant="strong" />
      </Card>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START defaultGroups

>[!INFO]
> For the `defaultGroups` property to work, the data must be sectioned using the [`groupBy`](#groupBy) property, and either a [`groupHeaderTemplate`](#groupHeaderTemplate) or a [`groupFooterTemplate`](#groupFooterTemplate) needs to be provided.

```xmlui copy {4}
<App>
  <List
    data='{[...]}'
    defaultGroups="{['dairy', 'meat', 'vegetables']}"
    groupBy="category" >
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
  </List>
</App>
```

```xmlui-pg name="Example: defaultGroups" height="400px"
<App>
  <List
    data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    defaultGroups="{['dairy', 'meat', 'vegetables']}"
    groupBy="category">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START emptyListTemplate

```xmlui-pg copy display name="Example: emptyListTemplate" height="140px"
<App>
  <List>
    <property name="emptyListTemplate">
      <VStack horizontalAlignment="center">
        <Text variant="strong" value="Empty..." />
      </VStack>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START idKey

```xmlui /idKey="key"/
<App>
  <List idKey="key" data='{[...]}' />
</App>
```

```xmlui-pg name="Example: idKey" height="400px"
<App>
  <List idKey="key" data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

%-PROP-END

%-PROP-START itemTemplate

Note how in the example below the `$item` is used to access the `name`, `quantity` and `unit` attributes.

```xmlui copy {3-14}
<App>
  <List data='{[...]}'>
    <property name="itemTemplate">
      <Card>
        <HStack verticalAlignment="center">
          <Icon name="info" />
          <Text value="{$item.name}" variant="strong" />
        </HStack>
        <HStack>
          <Text value="{$item.quantity}" />
          <Text value="{$item.unit}" variant="em" />
        </HStack>
      </Card>
    </property>
  </List>
</App>
```

```xmlui-pg name="Example: itemTemplate" height="400px"
<App>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'>
    <property name="itemTemplate">
      <Card>
        <HStack verticalAlignment="center">
          <Icon name="info" />
          <Text value="{$item.name}" variant="strong" />
        </HStack>
        <HStack>
          <Text value="{$item.quantity}" />
          <Text value="{$item.unit}" variant="em" />
        </HStack>
      </Card>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START limit

```xmlui /limit="4"/
<App>
  <List limit="3" data='{[...]}' />
</App>
```

```xmlui-pg name="Example: limit" height="400px"
<App>
  <List limit="3" data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

%-PROP-END

%-PROP-START loading

```xmlui-pg copy display name="Example: loading" height="120px"
<App>
  <List loading="true" />
</App>
```

%-PROP-END

%-PROP-START orderBy

```xmlui /orderBy="{{ field: 'quantity', direction: 'desc' }}"/
<App>
  <List orderBy="{{ field: 'quantity', direction: 'desc' }}" data='{[...]}' />
</App>
```

```xmlui-pg name="Example: orderBy" height="400px"
<App>
  <List 
    orderBy="{{ field: 'quantity', direction: 'desc' }}" 
    data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

%-PROP-END

%-PROP-START pageInfo

It contains the following boolean attributes:

| Attribute            | Description                          |
| :------------------- | :------------------------------------|
| `hasPrevPage`        | Does the list have a previous page   |
| `hasNextPage`        | Does the list have a next page       |
| `isFetchingPrevPage` | _TBD_                                |
| `isFetchingNextPage` | _TBD_                                |

%-PROP-END

%-PROP-START groupBy

>[!INFO]
> For the `groupBy` property to work, either a [`groupHeaderTemplate`](#groupHeaderTemplate)
> or a [`groupFooterTemplate`](#groupFooterTemplate) needs to be provided.

```xmlui copy {3}
<App>
  <List
    data='{[...]}'
    groupBy="category">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
  </List>
</App>
```

```xmlui-pg name="Example: groupBy" height="400px"
<App>
  <List
    data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    groupBy="category">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START groupFooterTemplate

The structure of `$group` in a `groupFooterTemplate` is the following:

| Attribute | Description                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| id        | Unique identifier for the section. It is commonly generated from the attribute name provided via `groupBy`.   |
| items     | The items filtered from the original data list that fall into this section.                                   |
| key       | The attribute name to section by provided via `groupBy`                                                       |

This example displays a separator line in the groups' footer:

```xmlui copy {8-12}
<App>
  <List data='{[...]}' groupBy="category">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
    <property name="groupFooterTemplate">
      <VStack paddingVertical="$space-normal">
        <ContentSeparator/>
      </VStack>
    </property>
  </List>
</App>
```

```xmlui-pg name="Example: groupFooterTemplate" height="400px"
<App>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
groupBy="category">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
    <property name="groupFooterTemplate">
      <VStack paddingVertical="$space-normal">
        <ContentSeparator/>
      </VStack>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START groupHeaderTemplate

The structure of `$group` in a `groupHeaderTemplate` is the following:

| Attribute | Description                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| id        | Unique identifier for the section. It is commonly generated from the attribute name provided via `groupBy`.   |
| items     | The items filtered from the original data list that fall into this section.                                   |
| key       | The attribute name to section by provided via `groupBy`                                                       |

```xmlui copy {3-7}
<App>
  <List data='{[...]}' groupBy="category">
    <property name="groupHeaderTemplate">
      <Stack padding="$space-2">
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>
  </List>
</App>
```

```xmlui-pg copy name="Example: groupHeaderTemplate" height="400px"
<App>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
  groupBy="category">
    <property name="groupHeaderTemplate">
      <Stack padding="$space-2">
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>
  </List>
</App>
```

%-PROP-END

%-PROP-START selectedIndex

```xmlui /selectedIndex="5"/
<App>
  <List selectedIndex="5" data='{[...]}' />
</App>
```

```xmlui-pg name="Example: selectedIndex" height="400px"
<App>
  <List selectedIndex="5" data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

%-PROP-END

%-PROP-START scrollAnchor

```xmlui /scrollAnchor="bottom"/
<App>
  <List scrollAnchor="bottom" data='{[...]}' />
</App>
```

```xmlui-pg name="Example: scrollAnchor" height="400px"
<App>
  <List scrollAnchor="bottom" data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' />
</App>
```

%-PROP-END

%-PROP-START availableGroups

```xmlui {5}
<App>
  <List
    data="{[...]}"
    groupBy="category"
    availableGroups="{['fruits', 'vegetables']}">
    <property name="groupHeaderTemplate">
      <Stack>
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>  
  </List>
</App>
```

```xmlui-pg name="Example: availableGroups" height="400px"
<App>
  <List availableGroups="{['fruits', 'vegetables']}" groupBy="category" 
  data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'>
    <property name="groupHeaderTemplate">
      <Stack>
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>  
  </List>
</App>
```

%-PROP-END

%-PROP-START borderCollapse

Note how the `List` on the right has different borders:

```xmlui /borderCollapse/
<App>
  <HStack>
    <List data="{[...]}" groupBy="category" borderCollapse="false" width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
    <List data="{[...]}" groupBy="category" borderCollapse="true" width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

```xmlui-pg name="Example: borderCollapse" height="400px"
<App>
  <HStack>
    <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
  groupBy="category" borderCollapse="false" width="$space-48">
    <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
    <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
      groupBy="category" borderCollapse="true" width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

%-PROP-END

%-PROP-START groupsInitiallyExpanded

Note how the groups in the right `List` are expanded by default:

```xmlui /groupsInitiallyExpanded/
<App>
  <HStack gap="$space-2">
    <List data="{[...]}" 
      groupBy="category" 
      groupsInitiallyExpanded="false" 
      width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
    <List data="{[...]}" 
      groupBy="category" 
      groupsInitiallyExpanded="true" 
      width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

```xmlui-pg name="Example: groupsInitiallyExpanded" height="400px"
<App>
  <HStack gap="$space-2"> 
    <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
  groupBy="category" groupsInitiallyExpanded="false" width="$space-48">
    <property name="groupHeaderTemplate">
      <Stack>
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>
  </List>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
      groupBy="category" groupsInitiallyExpanded="true" width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

%-PROP-END

%-PROP-START hideEmptyGroups

Note how the `meats` category is not displayed in the right `List`:

```xmlui {7, 19}
<App>
  <HStack gap="$space-2">
    <List
      data="{[...]}"
      defaultGroups="{['meats']}"
      groupBy="category"
      hideEmptyGroups="false"
      width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
    <List
      data="{[...]}"
      defaultGroups="{['meats']}"
      groupBy="category"
      hideEmptyGroups="true"
      width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

```xmlui-pg name="Example: hideEmptyGroups" height="400px"
<App>
  <HStack gap="$space-2">
    <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
  defaultGroups="{['meats']}" groupBy="category" hideEmptyGroups="false" width="$space-48">
    <property name="groupHeaderTemplate">
      <Stack>
        <Text variant="subtitle" value="{$group.key}" />
      </Stack>
    </property>
  </List>
  <List data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
      defaultGroups="{['meats']}" groupBy="category" hideEmptyGroups="true" width="$space-48">
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
  </HStack>
</App>
```

%-PROP-END

%-STYLE-START

`List` is a layout container; its purpose is to render nested child components.
`List` has no theme variables to change its visual appearance.

%-STYLE-END

%-API-START scrollToBottom

The following example demonstrates `scrollToBottom` and all the other scroll methods:

```xmlui-pg copy display name="Example: data API Call" height="400px"
<App layout="condensed-sticky">
  <AppHeader>
    <HStack>
      <Button onClick="myList.scrollToBottom()">Scroll to Bottom</Button>
      <Button onClick="myList.scrollToTop()">Scroll to Top</Button>
      <Button onClick="myList.scrollToIndex(25)">Scroll to #25</Button>
      <Button onClick="myList.scrollToId('item-40')">Scroll to ID 'item-40'</Button>
    </HStack>
  </AppHeader>
  <List 
    id="myList" 
    data="{
      Array.from({ length: 100 })
      .map((_, i) => ({id: 'item-' + i, value: 'Item #' + i}))
    }">
    <property name="itemTemplate">
      <Card>
        <Text value="{$item.value}" />
      </Card>
    </property>
  </List>
</App>
```

%-API-END

%-API-START scrollToTop

See the [`scrollToBottom`](#scrolltobottom) example.

%-API-END

%-API-START scrollToIndex

See the [`scrollToBottom`](#scrolltobottom) example.

%-API-END

%-API-START scrollToId

See the [`scrollToBottom`](#scrolltobottom) example.

%-API-END