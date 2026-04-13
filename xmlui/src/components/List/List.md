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

`groupBy` accepts either a **string** (the name of the item field to group by) or a **function** that receives each list item and returns the grouping key.

**String usage** — group by a field name directly:

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

**Function usage** — compute the grouping key from each item:

```xmlui copy {3}
<App>
  <List
    data='{[...]}'
    groupBy="{(item) => item.name[0]}">
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

```xmlui-pg name="Example: groupBy (function)" height="400px"
<App>
  <List
    data='{[
  { id: 0, name: "Apples" },
  { id: 1, name: "Avocado" },
  { id: 2, name: "Bananas" },
  { id: 3, name: "Carrots" },
  { id: 4, name: "Cheese" },
  { id: 5, name: "Cherries" },
  { id: 6, name: "Milk" },
]}'
    groupBy="{(item) => item.name[0]}">
    <property name="groupHeaderTemplate">
      <VStack>
        <Text variant="subtitle" value="{$group.key}" />
      </VStack>
    </property>
    <Text value="{$item.name}" />
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
  <List scrollAnchor="bottom" data='{[...]}' height="300px" />
</App>
```

```xmlui-pg name="Example: scrollAnchor" height="380px"
<App>
  <List scrollAnchor="bottom" height="300px" data='{[
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
    <List 
      data="{[...]}"
      groupBy="category" 
      borderCollapse="false" 
      width="$space-64"
    >
      <property name="groupHeaderTemplate">
        <Stack>
          <Text variant="subtitle" value="{$group.key}" />
        </Stack>
      </property>
    </List>
    <List 
      data="{[...]}" 
      groupBy="category" 
      borderCollapse="true" 
      width="$space-64"
    >
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
  groupBy="category" borderCollapse="false" width="$space-64">
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
      groupBy="category" borderCollapse="true" width="$space-64">
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

%-PROP-START enableMultiRowSelection

```xmlui copy /enableMultiRowSelection="false"/
<App>
  <List data='{[...]}' rowsSelectable="true" enableMultiRowSelection="false">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: enableMultiRowSelection"
<App>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}' rowsSelectable="true" enableMultiRowSelection="false">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START hideSelectionCheckboxes

The default value is `false`. When set to `true`, the selection checkboxes are hidden while
selection via click, keyboard, and the programmatic API still work as expected.

```xmlui copy /hideSelectionCheckboxes="true"/
<App>
  <List 
    data='{[...]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="true" 
    hideSelectionCheckboxes="true"
  >
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: hideSelectionCheckboxes"
<App>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START selectionCheckboxPosition

When `"overlay"` is active, use
[`selectionCheckboxAnchor`](#selectionCheckboxAnchor),
[`selectionCheckboxOffsetX`](#selectionCheckboxOffsetX), and
[`selectionCheckboxOffsetY`](#selectionCheckboxOffsetY) to fine-tune the position.

```xmlui copy /selectionCheckboxPosition="overlay"/
<App>
  <List data='{[...]}' rowsSelectable="true" selectionCheckboxPosition="overlay">
    <Card paddingLeft="40px">{$item.name}</Card>
  </List>
</App>
```

```xmlui-pg name="Example: selectionCheckboxPosition overlay"
<App>
  <List
    enableMultiRowSelection="true"
    data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    selectionCheckboxPosition="overlay"
  >
    <Card paddingLeft="40px">
      {$item.name} — {$item.category}
    </Card>
  </List>
</App>
```

%-PROP-END

%-PROP-START selectionCheckboxAnchor

Use `"center-left"` or `"center-right"` to vertically center the checkbox regardless of
row height — ideal for card-style layouts.

```xmlui copy /selectionCheckboxAnchor="bottom-left"/
<App>
  <List data='{[...]}' 
    rowsSelectable="true"
    selectionCheckboxPosition="overlay"
    selectionCheckboxAnchor="bottom-left">
    <Card paddingLeft="40px">{$item.name}</Card>
  </List>
</App>
```

```xmlui-pg name="Example: selectionCheckboxAnchor"
<App>
    <List
      enableMultiRowSelection="true"
      data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
      rowsSelectable="true"
      selectionCheckboxPosition="overlay"
      selectionCheckboxAnchor="bottom-left"
    >
      <Card paddingLeft="36px" minHeight="50px">
        {$item.name}
      </Card>
    </List>
</App>
```

%-PROP-END

%-PROP-START selectionCheckboxSize

Sets the width and height of the checkbox element. Accepts any CSS length value such as
`"16px"` or `"20px"`. When not set the browser default size is used. Applies in both
`"before"` and `"overlay"` modes.

```xmlui copy /selectionCheckboxSize="20px"/
<App>
  <List data='{[...]}' rowsSelectable="true" selectionCheckboxSize="20px">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: selectionCheckboxSize"
<App>
  <List
    enableMultiRowSelection="true"
    data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    selectionCheckboxSize="20px"
  >
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START initiallySelected

The following example pre-selects the first and third items (IDs `0` and `2`) when the list renders:

```xmlui copy /initiallySelected="{[0, 2]}"/
<App>
  <List data='{[...]}' rowsSelectable="true" initiallySelected="{[0, 2]}">
    <Text>{$isSelected ? '✓ ' : ''}{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: initiallySelected"
<App>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}' rowsSelectable="true" initiallySelected="{[0, 2]}">
    <Text>{$isSelected ? "✓ " : ""}{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START keyBindings

This property uses the following default key bindings:

```json
{ 
  "selectAll": "CmdOrCtrl+A", 
  "cut": "CmdOrCtrl+X", 
  "copy": "CmdOrCtrl+C", 
  "paste": "CmdOrCtrl+V", 
  "delete": "Delete"
}
```

You can use these accelerator key names:
- `CmdOrCtrl`: Command on macOS, Ctrl on Windows/Linux
- `Alt`: Alt/Option
- `Shift`: Shift
- `Super`: Command on macOS, Windows key on Windows/Linux
- `Ctrl`: Control key
- `Cmd`: Command key (macOS only)

%-PROP-END

%-PROP-START rowsSelectable

The default value is `false`. When enabled, clicking a row selects it and highlights it.
The current selection state is exposed to the item template via the `$isSelected` context variable.

```xmlui copy /rowsSelectable="true"/ /$isSelected/
<App>
  <List data='{[...]}' rowsSelectable="true">
    <Text color="{$isSelected ? '$color-primary' : 'inherit'}">{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: rowsSelectable"
<App>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}' rowsSelectable="true">
    <Text color="{$isSelected ? '$color-primary' : 'inherit'}">{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START rowUnselectablePredicate

Rows matching this predicate cannot be selected and are excluded from select-all operations.
The selection checkbox is automatically displayed as disabled for these rows, providing visual feedback to users.

```xmlui copy {4}
<App>
  <List data='{[...]}'
    rowsSelectable="true"
    rowUnselectablePredicate="{(item) => item.category === 'vegetables'}">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: rowUnselectablePredicate"
<App>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    rowUnselectablePredicate="{(item) => item.category === 'vegetables'}">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-PROP-END

%-PROP-START syncWithVar

The following example demonstrates two independent `MyList` components sharing selection state
through a global variable. Selecting a row in either list immediately reflects in the other:

>[!INFO]
> `syncWithVar` works with both global and local variables. When using local variables, ensure all Lists in the sync have that variable in their scope.

```xmlui-pg
---app copy display /global.selState/ filename="Main.xmlui"
<App global.selState="{{}}">
  <MyList />
  <Text>Selection: {JSON.stringify(selState)}</Text>
  <MyList />
</App>
---comp copy display /syncWithVar="selState"/ filename="MyList.xmlui"
<Component name="MyList">
  <List
    syncWithVar="selState"
    data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
  >
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</Component>
---desc
Change the selection in one of the lists and check how it is synced.
```

%-PROP-END

%-EVENT-START selectionDidChange

The handler receives an array of the selected items. If multi-row selection is disabled,
the array will contain zero or one item.

```xmlui copy {4}
<App var.selection="">
  <Text>Selected: {selection}</Text>
  <List data='{[...]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(items) => selection = items.map(i => i.name).join(', ')">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: selectionDidChange"
<App var.selection="">
  <Text>Selected: {selection || "(none)"}</Text>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(items) => selection = items.map(i => i.name).join(', ')">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-EVENT-END

%-EVENT-START rowDoubleClick

This event is triggered when a list row is double-clicked. The handler receives the row's data
item as its only argument.

```xmlui copy {3}
<App var.lastClicked="">
  <Text>Double-clicked: {lastClicked}</Text>
  <List data='{[...]}' onRowDoubleClick="(item) => lastClicked = item.name">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: rowDoubleClick"
<App var.lastClicked="">
  <Text>Double-clicked: {lastClicked || "(none)"}</Text>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}' onRowDoubleClick="(item) => lastClicked = item.name">
    <Card>{$item.name} — {$item.category}</Card>
  </List>
</App>
```

%-EVENT-END

%-EVENT-START selectAllAction

```xmlui copy {4}
<App var.log="">
  <Text>{log}</Text>
  <List 
    data='{[...]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="true"
    onSelectAllAction="(row, items, ids) => 
      log = 'Selected all: ' + ids.join(', ')
    ">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: selectAllAction"
<App var.log="">
  <Text>{log || "Press Ctrl+A / Cmd+A after clicking a row"}</Text>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectAllAction="(row, items, ids) => log = 'Selected ' + ids.length + ' items: ' + ids.join(', ')">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-EVENT-END

%-EVENT-START cutAction

See also [`copyAction`](#copyaction), [`pasteAction`](#pasteaction), and [`deleteAction`](#deleteaction) for the other keyboard-triggered events.

%-EVENT-END

%-EVENT-START copyAction

```xmlui copy {4}
<App var.log="">
  <Text>{log}</Text>
  <List data='{[...]}' rowsSelectable="true"
    onCopyAction="(row, items, ids) => log = 'Copied: ' + ids.join(', ')">
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: copyAction"
<App var.log="">
  <Text>{log || "Select a row then press Ctrl+C / Cmd+C"}</Text>
  <List data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onCopyAction="(row, items, ids) => log = 'Copied IDs: ' + ids.join(', ')">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-EVENT-END

%-EVENT-START pasteAction

See [`copyAction`](#copyaction) for a similar example.

%-EVENT-END

%-EVENT-START deleteAction

See [`copyAction`](#copyaction) for a similar example.

%-EVENT-END

%-STYLE-START

`List` supports the following theme variables for customizing selection colors and the
appearance of selection checkboxes.

**Selection colors:**

| Theme variable | Default |
| :--- | :--- |
| `backgroundColor-List` | `$backgroundColor` |
| `backgroundColor-selected-List` | `$color-primary-100` |
| `backgroundColor-selected-List--hover` | `$color-primary-100` |
| `backgroundColor-row-List--hover` | `$color-primary-50` |

**Selection checkbox appearance** — each variable falls back to the equivalent `Checkbox`
component theme variable when not explicitly set, so the checkboxes automatically
follow your form input styling:

| Theme variable | Fallback |
| :--- | :--- |
| `borderRadius-selectionCheckbox-List` | `borderRadius-Checkbox` |
| `borderColor-selectionCheckbox-List` | `borderColor-Checkbox` |
| `backgroundColor-selectionCheckbox-List` | `backgroundColor-Checkbox` |
| `borderColor-checked-selectionCheckbox-List` | `borderColor-checked-Checkbox` |
| `backgroundColor-checked-selectionCheckbox-List` | `backgroundColor-checked-Checkbox` |
| `backgroundColor-indicator-selectionCheckbox-List` | `backgroundColor-indicator-Checkbox` |
| `outlineWidth-selectionCheckbox-List--focus` | `outlineWidth-Checkbox--focus` |
| `outlineColor-selectionCheckbox-List--focus` | `outlineColor-Checkbox--focus` |
| `outlineStyle-selectionCheckbox-List--focus` | `outlineStyle-Checkbox--focus` |
| `outlineOffset-selectionCheckbox-List--focus` | `outlineOffset-Checkbox--focus` |

%-STYLE-END

%-API-START scrollToBottom

The following example demonstrates `scrollToBottom` and all the other scroll methods:

```xmlui-pg copy display name="Example: data API Call" height="400px"
<App layout="condensed-sticky" scrollWholePage="false">
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
    height="*"
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

%-API-START clearSelection

The following example demonstrates `clearSelection` and the other selection API methods:

```xmlui copy /clearSelection()/ /selectId([0, 2])/ /selectAll()/
<App>
  <HStack>
    <Button label="Select all" onClick="list.selectAll()" />
    <Button label="Select 0, 2" onClick="list.selectId([0, 2])" />
    <Button label="Clear" onClick="list.clearSelection()" />
  </HStack>
  <List 
    id="list" 
    data='{[...]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="true"
    onSelectionDidChange="(items) => selection = items.map(i => i.id).join(', ')"
  >
    <Text>{$item.name}</Text>
  </List>
</App>
```

```xmlui-pg name="Example: clearSelection"
<App var.selection="">
  <Text>Selected IDs: {selection || "(none)"}</Text>
  <HStack>
    <Button label="Select all" onClick="list.selectAll()" />
    <Button label="Select 0, 2" onClick="list.selectId([0, 2])" />
    <Button label="Clear" onClick="list.clearSelection()" />
  </HStack>
  <List id="list" data='{[
  { id: 0, name: "Apples", category: "fruits" },
  { id: 1, name: "Bananas", category: "fruits" },
  { id: 2, name: "Carrots", category: "vegetables" },
  { id: 3, name: "Spinach", category: "vegetables" }
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(items) => selection = items.map(i => i.id).join(', ')">
    <Text>{$item.name} — {$item.category}</Text>
  </List>
</App>
```

%-API-END

%-API-START getSelectedIds

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START getSelectedItems

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectAll

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectId

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END