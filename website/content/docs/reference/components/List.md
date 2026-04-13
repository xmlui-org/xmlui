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
- `$isSelected`: Boolean indicating if this item is currently selected
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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

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

### `borderCollapse` [#bordercollapse]

> [!DEF]  default: **true**

Collapse items borders

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

### `enableMultiRowSelection` [#enablemultirowselection]

> [!DEF]  default: **true**

This boolean property indicates whether you can select multiple rows in the list. This property only has an effect when the rowsSelectable property is set. Setting it to `false` limits selection to a single row.

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

### `fixedItemSize` [#fixeditemsize]

> [!DEF]  default: **false**

When set to `true`, the list will measure the height of the first item and use that as a fixed size hint for all items. This improves scroll performance when all items have the same height. If items have varying heights, leave this as `false`.

### `groupBy` [#groupby]

This property sets which data item property is used to group the list items. Accepts a field name string or a function that receives an item and returns the group key. If not set, no grouping is done.

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

### `groupsInitiallyExpanded` [#groupsinitiallyexpanded]

> [!DEF]  default: **true**

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

### `hideEmptyGroups` [#hideemptygroups]

> [!DEF]  default: **true**

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

### `hideSelectionCheckboxes` [#hideselectioncheckboxes]

> [!DEF]  default: **false**

If true, hides selection checkboxes. Selection logic still works via API and keyboard.

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

### `idKey` [#idkey]

> [!DEF]  default: **"id"**

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

### `initiallySelected` [#initiallyselected]

An array of IDs that should be initially selected when the list is rendered. This property only has an effect when the rowsSelectable property is set to `true`.

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

### `keyBindings` [#keybindings]

This property defines keyboard shortcuts for list actions. Provide an object with action names as keys and keyboard shortcut strings as values. Available actions: `selectAll`, `cut`, `copy`, `paste`, `delete`. If not provided, default shortcuts are used.

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

### `refreshOn` [#refreshon]

Bind this property to a global variable (or expression) whose change should force all visible list items to re-render and pick up the latest reactive state. When not set, items re-render on every XMLUI reactive cycle (safe but less optimal). When set, items only re-render when the bound value changes, which eliminates spurious re-renders from unrelated global-variable updates (e.g. focus events).

### `rowsSelectable` [#rowsselectable]

Indicates whether the rows are selectable (`true`) or not (`false`).

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

### `rowUnselectablePredicate` [#rowunselectablepredicate]

This property defines a predicate function with a return value that determines if the row should be unselectable. The function retrieves the item to display and should return a Boolean-like value. This property only has an effect when the `rowsSelectable` property is set to `true`.

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

### `scrollAnchor` [#scrollanchor]

> [!DEF]  default: **"top"**

This property pins the scroll position to a specified location of the list. Available values are shown below.

Available values: `top` **(default)**, `bottom`

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

### `selectionCheckboxAnchor` [#selectioncheckboxanchor]

> [!DEF]  default: **"left-center"**

The corner of the item that the overlay checkbox is anchored to. Only applies when `selectionCheckboxPosition` is `"overlay"`. Offsets are measured inward from the chosen corner.

Available values: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center-left`, `center-right`

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

### `selectionCheckboxOffsetX` [#selectioncheckboxoffsetx]

> [!DEF]  default: **"$space-2"**

Horizontal distance of the overlay checkbox from its anchor corner. Accepts any CSS length value (e.g. `"8px"`, `"1rem"`). Only applies when `selectionCheckboxPosition` is `"overlay"`.

### `selectionCheckboxOffsetY` [#selectioncheckboxoffsety]

> [!DEF]  default: **"$space-2"**

Vertical distance of the overlay checkbox from its anchor corner. Accepts any CSS length value (e.g. `"8px"`, `"1rem"`). Only applies when `selectionCheckboxPosition` is `"overlay"`.

### `selectionCheckboxPosition` [#selectioncheckboxposition]

> [!DEF]  default: **"before"**

Controls the placement mode of selection checkboxes. `"before"` (default) renders the checkbox inline before the item content. `"overlay"` renders the checkbox absolutely positioned inside the item's bounding box, overlapping the content. Use `selectionCheckboxAnchor`, `selectionCheckboxOffsetX`, and `selectionCheckboxOffsetY` to control the overlay position.

Available values: `before` **(default)**, `overlay`

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

### `selectionCheckboxSize` [#selectioncheckboxsize]

CSS size of the checkbox (e.g. `"16px"`, `"20px"`). When not set the browser default size is used. Applies in both `"before"` and `"overlay"` modes.

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

### `syncWithVar` [#syncwithvar]

The name of a global variable to synchronize the list's selection state with. The named variable must reference an object; the list will read from and write to its 'selectedIds' property. When provided, this takes precedence over `initiallySelected`.

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

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the List is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `copyAction` [#copyaction]

This event is triggered when the user presses the copy keyboard shortcut (default: Ctrl+C/Cmd+C) and `rowsSelectable` is set to `true`.

**Signature**: `copy(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

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

### `cutAction` [#cutaction]

This event is triggered when the user presses the cut keyboard shortcut (default: Ctrl+X/Cmd+X) and `rowsSelectable` is set to `true`.

**Signature**: `cut(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

See also [`copyAction`](#copyaction), [`pasteAction`](#pasteaction), and [`deleteAction`](#deleteaction) for the other keyboard-triggered events.

### `deleteAction` [#deleteaction]

This event is triggered when the user presses the delete keyboard shortcut (default: Delete key) and `rowsSelectable` is set to `true`.

**Signature**: `delete(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

See [`copyAction`](#copyaction) for a similar example.

### `pasteAction` [#pasteaction]

This event is triggered when the user presses the paste keyboard shortcut (default: Ctrl+V/Cmd+V) and `rowsSelectable` is set to `true`.

**Signature**: `paste(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

See [`copyAction`](#copyaction) for a similar example.

### `rowDoubleClick` [#rowdoubleclick]

This event is fired when the user double-clicks a list row. The handler receives the clicked row item as its only argument.

**Signature**: `rowDoubleClick(item: any): void`

- `item`: The clicked list row item.

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

### `selectAllAction` [#selectallaction]

This event is triggered when the user presses the select all keyboard shortcut (default: Ctrl+A/Cmd+A) and `rowsSelectable` is set to `true`. The component automatically selects all rows before invoking this handler.

**Signature**: `selectAll(row: ListRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of all selected row items.
- `selectedIds`: Array of all selected row IDs (as strings).

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

### `selectionDidChange` [#selectiondidchange]

This event is triggered when the list's current selection changes. Its parameter is an array of the selected list row items.

**Signature**: `selectionDidChange(selectedItems: any[]): void`

- `selectedItems`: An array of the selected list row items.

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

## Exposed Methods [#exposed-methods]

### `clearSelection` [#clearselection]

This method clears the list of currently selected list rows.

**Signature**: `clearSelection(): void`

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

### `getSelectedIds` [#getselectedids]

This method returns the list of currently selected list row IDs.

**Signature**: `getSelectedIds(): Array<string>`

(See the [example](#clearselection) at the `clearSelection` method)

### `getSelectedItems` [#getselecteditems]

This method returns the list of currently selected list row items.

**Signature**: `getSelectedItems(): Array<any>`

(See the [example](#clearselection) at the `clearSelection` method)

### `scrollToBottom` [#scrolltobottom]

This method scrolls the list to the bottom.

**Signature**: `scrollToBottom(): void`

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

### `selectAll` [#selectall]

This method selects all the rows in the list. This method has no effect if the rowsSelectable property is set to `false`.

**Signature**: `selectAll(): void`

(See the [example](#clearselection) at the `clearSelection` method)

### `selectId` [#selectid]

This method selects the row with the specified ID. This method has no effect if the `rowsSelectable` property is set to `false`. The method argument can be a single id or an array of them.

**Signature**: `selectId(id: string | Array<string>): void`

- `id`: The ID of the row to select, or an array of IDs to select multiple rows.

(See the [example](#clearselection) at the `clearSelection` method)

## Styling [#styling]

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

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-selectionCheckbox-List | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-selectionCheckbox-List | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-List | $backgroundColor | $backgroundColor |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-row-List--hover | $color-primary-50 | $color-primary-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-selected-List | $color-primary-100 | $color-primary-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-selected-List--hover | $color-primary-100 | $color-primary-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-selectionCheckbox-List | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-selectionCheckbox-List | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selectionCheckbox-List | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-selectionCheckbox-List | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-selectionCheckbox-List--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-selectionCheckbox-List--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-selectionCheckbox-List--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-selectionCheckbox-List--focus | *none* | *none* |
