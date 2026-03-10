# List [#list]

`List` is a high-performance, virtualized container for rendering large datasets with built-in grouping, sorting, and visual formatting. It only renders visible items in the viewport, making it ideal for displaying thousands of records while maintaining smooth scrolling performance.

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `availableGroups` [#availablegroups]

This property is an array of group names that the `List` will display. If not set, all groups in the data are displayed.

### `borderCollapse` [#bordercollapse]

> [!DEF]  default: **true**

Collapse items borders

### `data` [#data]

The component receives data via this property. The `data` property is a list of items that the `List` can display.

### `defaultGroups` [#defaultgroups]

This property adds an optional list of default groups for the `List` and displays the group headers in the specified order. If the data contains group headers not in this list, those headers are also displayed (after the ones in this list); however, their order is not deterministic.

### `emptyListTemplate` [#emptylisttemplate]

This property defines the template to display when the list is empty.

### `fixedItemSize` [#fixeditemsize]

> [!DEF]  default: **false**

When set to `true`, the list will measure the height of the first item and use that as a fixed size hint for all items. This improves scroll performance when all items have the same height. If items have varying heights, leave this as `false`.

### `groupBy` [#groupby]

This property sets which data item property is used to group the list items. If not set, no grouping is done.

### `groupFooterTemplate` [#groupfootertemplate]

Enables the customization of how the the footer of each group is displayed. Combine with [`groupHeaderTemplate`](#groupHeaderTemplate) to customize sections. You can use the `$item` context variable to access an item group and map its individual attributes.

### `groupHeaderTemplate` [#groupheadertemplate]

Enables the customization of how the groups are displayed, similarly to the [`itemTemplate`](#itemtemplate). You can use the `$item` context variable to access an item group and map its individual attributes.

### `groupsInitiallyExpanded` [#groupsinitiallyexpanded]

> [!DEF]  default: **true**

This Boolean property defines whether the list groups are initially expanded.

### `hideEmptyGroups` [#hideemptygroups]

> [!DEF]  default: **true**

This boolean property indicates if empty groups should be hidden (no header and footer are displayed).

### `idKey` [#idkey]

> [!DEF]  default: **"id"**

Denotes which attribute of an item acts as the ID or key of the item

### `itemTemplate` [#itemtemplate]

This property allows the customization of mapping data items to components. You can use the `$item` context variable to access an item and map its individual attributes.

### `limit` [#limit]

This property limits the number of items displayed in the `List`. If not set, all items are displayed.

### `loading` [#loading]

This property delays the rendering of children until it is set to `false`, or the component receives usable list items via the [`data`](#data) property.

### `orderBy` [#orderby]

This optioanl property enables the ordering of list items by specifying an attribute in the data.

### `pageInfo` [#pageinfo]

This property contains the current page information. Setting this property also enures the `List` uses pagination.

### `scrollAnchor` [#scrollanchor]

> [!DEF]  default: **"top"**

This property pins the scroll position to a specified location of the list. Available values are shown below.

Available values: `top` **(default)**, `bottom`

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the List is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

This method scrolls the list to the bottom.

**Signature**: `scrollToBottom(): void`

### `scrollToId` [#scrolltoid]

This method scrolls the list to a specific item. The method accepts an item ID as a parameter.

**Signature**: `scrollToId(id: string): void`

- `id`: The ID of the item to scroll to.

### `scrollToIndex` [#scrolltoindex]

This method scrolls the list to a specific index. The method accepts an index as a parameter.

**Signature**: `scrollToIndex(index: number): void`

- `index`: The index to scroll to.

### `scrollToTop` [#scrolltotop]

This method scrolls the list to the top.

**Signature**: `scrollToTop(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-List | $backgroundColor | $backgroundColor |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-List2 | *none* | *none* |
