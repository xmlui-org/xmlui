# List [#list]

`List` is a high-performance, virtualized container for rendering large datasets with built-in grouping, sorting, and visual formatting. It only renders visible items in the viewport, making it ideal for displaying thousands of records while maintaining smooth scrolling performance.

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

**Context variables available during execution:**

- `$group`: Group information when using `groupBy` (available in group templates)
- `$isFirst`: Boolean indicating if this is the first item
- `$isLast`: Boolean indicating if this is the last item
- `$item`: Current data item being rendered
- `$itemIndex`: Zero-based index of current item

## Use children as Content Template [#use-children-as-content-template]

The [itemTemplate](#itemtemplate) property can be replaced by setting the item template component directly as the List's child.
In the following example, the two List are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <List>
    <property name="itemTemplate">
      <Text>Template</Text>
    </property>
  </List>
  <!-- As this -->
  <List>
    <Text>Template</Text>
  </List>
</App>
```

## Properties [#properties]

### `availableGroups` [#availablegroups]

This property is an array of group names that the `List` will display. If not set, all groups in the data are displayed.

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

### `borderCollapse` (default: true) [#bordercollapse-default-true]

Collapse items borders

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

### `data` [#data]

The component receives data via this property. The `data` property is a list of items that the `List` can display.

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

### `defaultGroups` [#defaultgroups]

This property adds an optional list of default groups for the `List` and displays the group headers in the specified order. If the data contains group headers not in this list, those headers are also displayed (after the ones in this list); however, their order is not deterministic.

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

### `emptyListTemplate` [#emptylisttemplate]

This property defines the template to display when the list is empty.

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

### `groupBy` [#groupby]

This property sets which data item property is used to group the list items. If not set, no grouping is done.

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

### `groupFooterTemplate` [#groupfootertemplate]

Enables the customization of how the the footer of each group is displayed. Combine with [`groupHeaderTemplate`](#groupHeaderTemplate) to customize sections. You can use the `$item` context variable to access an item group and map its individual attributes.

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

### `groupHeaderTemplate` [#groupheadertemplate]

Enables the customization of how the groups are displayed, similarly to the [`itemTemplate`](#itemtemplate). You can use the `$item` context variable to access an item group and map its individual attributes.

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

### `groupsInitiallyExpanded` (default: true) [#groupsinitiallyexpanded-default-true]

This Boolean property defines whether the list groups are initially expanded.

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

### `hideEmptyGroups` (default: true) [#hideemptygroups-default-true]

This boolean property indicates if empty groups should be hidden (no header and footer are displayed).

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

### `idKey` (default: "id") [#idkey-default-id]

Denotes which attribute of an item acts as the ID or key of the item

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

### `itemTemplate` [#itemtemplate]

This property allows the customization of mapping data items to components. You can use the `$item` context variable to access an item and map its individual attributes.

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

### `limit` [#limit]

This property limits the number of items displayed in the `List`. If not set, all items are displayed.

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

### `loading` [#loading]

This property delays the rendering of children until it is set to `false`, or the component receives usable list items via the [`data`](#data) property.

```xmlui-pg copy display name="Example: loading" height="120px"
<App>
  <List loading="true" />
</App>
```

### `orderBy` [#orderby]

This optioanl property enables the ordering of list items by specifying an attribute in the data.

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

### `pageInfo` [#pageinfo]

This property contains the current page information. Setting this property also enures the `List` uses pagination.

It contains the following boolean attributes:

| Attribute            | Description                          |
| :------------------- | :------------------------------------|
| `hasPrevPage`        | Does the list have a previous page   |
| `hasNextPage`        | Does the list have a next page       |
| `isFetchingPrevPage` | _TBD_                                |
| `isFetchingNextPage` | _TBD_                                |

### `scrollAnchor` (default: "top") [#scrollanchor-default-top]

This property pins the scroll position to a specified location of the list. Available values are shown below.

Available values: `top` **(default)**, `bottom`

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

This method scrolls the list to the bottom.

**Signature**: `scrollToBottom(): void`
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

### `scrollToId` [#scrolltoid]

This method scrolls the list to a specific item. The method accepts an item ID as a parameter.

**Signature**: `scrollToId(id: string): void`
- `id`: The ID of the item to scroll to.

See the [`scrollToBottom`](#scrolltobottom) example.

### `scrollToIndex` [#scrolltoindex]

This method scrolls the list to a specific index. The method accepts an index as a parameter.

**Signature**: `scrollToIndex(index: number): void`
- `index`: The index to scroll to.

See the [`scrollToBottom`](#scrolltobottom) example.

### `scrollToTop` [#scrolltotop]

This method scrolls the list to the top.

**Signature**: `scrollToTop(): void`
See the [`scrollToBottom`](#scrolltobottom) example.

## Styling [#styling]

`List` is a layout container; its purpose is to render nested child components.
`List` has no theme variables to change its visual appearance.
