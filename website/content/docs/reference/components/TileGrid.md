# TileGrid [#tilegrid]

`TileGrid` renders a data array as a responsive, virtualized tile grid. It auto-calculates the number of columns based on the container width, tile width, and gap, and only renders visible rows — making it suitable for large datasets.

**Key features:**
- **Responsive layout**: Automatically calculates the number of columns from available width, tile width, and gap
- **Virtualization**: Only renders visible rows for smooth performance with large datasets
- **Tile selection**: Optional single or multi-tile selection with per-tile checkboxes
- **Keyboard shortcuts**: Built-in Ctrl/Cmd+A (select all), Delete, Cut, Copy, and Paste key bindings
- **State sync**: Keep selection synchronized with a global variable via `syncWithVar`

Use `TileGrid` as a direct child of a container that provides an explicit height to enable virtualization.

In the following sections the examples use data with the structure outlined below:

| Id | Name       | Category   |
|:---|:-----------|:-----------|
| 1  | Apples     | fruits     |
| 2  | Bananas    | fruits     |
| 3  | Carrots    | vegetables |
| 4  | Spinach    | vegetables |
| 5  | Milk       | dairy      |
| 6  | Cheese     | dairy      |

The data is provided inline. In source code samples, the `data="{[...]}"` declaration represents the data above.

All samples use a tile template with the following definition unless noted otherwise
(the `...` nested into `<TileGrid>` represents this template definition):

```xmlui copy
<TileGrid data="{[...]}" itemWidth="120px" itemHeight="80px">
  <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
    <Text fontWeight="bold">{$item.name}</Text>
    <Text color="gray">{$item.category}</Text>
  </VStack>
</TileGrid>
```

**Context variables available during execution:**

- `$isFirst`: `true` when this is the first item in the `data` array.
- `$isLast`: `true` when this is the last item in the `data` array.
- `$item`: The current data item.
- `$itemIndex`: The zero-based index of the current item in the full `data` array.
- `$selected`: `true` when this tile is currently selected.

## Use children as Content Template [#use-children-as-content-template]

The [itemTemplate](#itemtemplate) property can be replaced by setting the item template component directly as the TileGrid's child.
In the following example, the two TileGrid are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <TileGrid>
    <property name="itemTemplate">
      <Text>Template</Text>
    </property>
  </TileGrid>
  <!-- As this -->
  <TileGrid>
    <Text>Template</Text>
  </TileGrid>
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `checkboxPosition` [#checkboxposition]

> [!DEF]  default: **"topStart"**

Controls the position of the per-tile selection checkbox relative to the tile, respecting the current writing direction.

Available values:

| Value | Description |
| --- | --- |
| `topStart` | Top of the tile, writing-direction start edge. **(default)** |
| `topEnd` | Top of the tile, writing-direction end edge. |
| `bottomStart` | Bottom of the tile, writing-direction start edge. |
| `bottomEnd` | Bottom of the tile, writing-direction end edge. |

Controls where the per-tile selection checkbox is placed relative to the tile corner.
The position respects the current writing direction (`inset-inline-start` / `inset-inline-end`).

Available values: `topStart` (default), `topEnd`, `bottomStart`, `bottomEnd`.

```xmlui copy /checkboxPosition="bottomEnd"/
<App>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    checkboxPosition="bottomEnd"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: checkboxPosition"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    checkboxPosition="bottomEnd"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `data` [#data]

The array of items to render as tiles. Each item is exposed as [`$item`](#item) inside the tile template.

The `data` property accepts a static array of objects or a URL that resolves to a JSON array.
Each element of the array becomes a tile rendered by the `itemTemplate`.

```xmlui copy /data="{[...]}"/
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples'},
      {id: 2, name: 'Bananas'},
      {id: 3, name: 'Carrots'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: data"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `enableMultiSelection` [#enablemultiselection]

> [!DEF]  default: **true**

When `true` (default), multiple tiles can be selected using Ctrl/Cmd+Click or Shift+Click. When `false`, only a single tile can be selected at a time.

Controls whether multiple tiles can be selected simultaneously.
When `false`, clicking a tile deselects any previously selected tile.
This property only has an effect when `itemsSelectable` is `true`.

```xmlui copy /enableMultiSelection="false"/
<App>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    enableMultiSelection="false"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: enableMultiSelection"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    enableMultiSelection="false"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `gap` [#gap]

> [!DEF]  default: **"8px"**

Gap between tiles, e.g. `"8px"` or a theme variable like `"$gap-normal"`.

Specifies the space between tiles both horizontally and vertically.
Accepts any valid CSS length (e.g. `"8px"`) or a theme variable (e.g. `"$gap-normal"`).

```xmlui copy /gap="16px"/
<App>
  <TileGrid data="{[...]}" itemWidth="120px" itemHeight="80px" gap="16px">
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: gap"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    gap="16px"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `hideSelectionCheckboxes` [#hideselectioncheckboxes]

> [!DEF]  default: **false**

If `true`, hides selection checkboxes. Selection logic still works via click, API, and keyboard.

If `true`, hides the per-tile selection checkboxes while keeping all selection logic intact.
Tiles can still be selected by clicking, via the API (`selectId`, `selectAll`), or with keyboard shortcuts.

This is useful when you want click-based selection without the visual checkbox overlay.

```xmlui copy /hideSelectionCheckboxes="true"/
<App>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    hideSelectionCheckboxes="true"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: hideSelectionCheckboxes"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    hideSelectionCheckboxes="true"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `idKey` [#idkey]

> [!DEF]  default: **"id"**

The property name used as the unique identifier for each item. Used to track selection state.

The property name used as the unique identifier for each data item.
Used to track and restore selection state. Defaults to `"id"`.

```xmlui copy /idKey="key"/
<App>
  <TileGrid
    idKey="key"
    itemsSelectable="true"
    data="{[
      {key: 'a', name: 'Alpha'},
      {key: 'b', name: 'Beta'},
      {key: 'c', name: 'Gamma'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

### `itemHeight` [#itemheight]

> [!DEF]  default: **"140px"**

Fixed height of each tile, e.g. `"140px"`.

Specifies the fixed height of each tile as a CSS size value (e.g. `"140px"`).
This value is also used as the virtualized row height, so it must be an explicit pixel value.

```xmlui copy /itemHeight="120px"/
<App>
  <TileGrid data="{[...]}" itemWidth="120px" itemHeight="120px">
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: itemHeight"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="120px"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `itemsSelectable` [#itemsselectable]

> [!DEF]  default: **false**

Enables selection mode. When `true`, tiles can be selected by clicking on them.

Enables selection mode. When `true`, each tile shows a checkbox and can be selected by clicking.
The `$selected` context variable reflects the tile's selection state inside the template.

```xmlui copy /itemsSelectable="true"/
<App>
  <TileGrid data="{[...]}" itemWidth="120px" itemHeight="80px" itemsSelectable="true">
    <VStack
      padding="8px"
      horizontalAlignment="center"
      verticalAlignment="center"
      backgroundColor="{$selected ? '$color-primary-100' : 'transparent'}"
    >
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: itemsSelectable"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
  >
    <VStack
      padding="8px"
      horizontalAlignment="center"
      verticalAlignment="center"
      backgroundColor="{$selected ? '$color-primary-100' : 'transparent'}"
    >
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `itemTemplate` [#itemtemplate]

The template used to render each tile. Use the [`$item`](#item) context variable to access the current data item, [`$itemIndex`](#itemIndex) for the zero-based index, and [`$selected`](#selected) to respond to the tile's selection state.

### `itemUserSelect` [#itemuserselect]

> [!DEF]  default: **"none"**

This property controls whether users can select text within tiles.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected **(default)** |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

Controls whether users can select text within tiles.

Available values: `auto` (default text selection behavior), `text` (text can be selected), `none` (text cannot be selected), `contain` (selection is contained within this element), `all` (entire element content is selected as one unit).

```xmlui copy /itemUserSelect="text"/
<App>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemUserSelect="text"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: itemUserSelect"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemUserSelect="text"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `itemWidth` [#itemwidth]

> [!DEF]  default: **"120px"**

Fixed width of each tile, e.g. `"120px"`.

Specifies the fixed width of each tile as a CSS size value (e.g. `"120px"`).
The number of columns is derived from this value, the available container width, and the `gap`.

```xmlui copy /itemWidth="160px"/
<App>
  <TileGrid data="{[...]}" itemWidth="160px" itemHeight="80px">
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: itemWidth"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="160px"
    itemHeight="80px"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `loading` [#loading]

> [!DEF]  default: **false**

When `true`, the grid shows a placeholder loading state instead of tile content.

When `true`, the grid hides all tile content and shows an empty placeholder.
Use this while data is being fetched to prevent a layout flash.

```xmlui-pg copy display name="Example: loading"
<App>
  <TileGrid
    loading="true"
    itemWidth="120px"
    itemHeight="80px"
  >
    <Text>{$item.name}</Text>
  </TileGrid>
</App>
```

### `refreshOn` [#refreshon]

An optional value that, when changed, forces all visible tiles to re-render so their XMLUI event-handler closures pick up the latest reactive state. Bind to any global variable whose change should invalidate tile closures (e.g. `"{selectMode}"`). If not provided, tiles re-render on every XMLUI reactive cycle.

### `stretchItems` [#stretchitems]

> [!DEF]  default: **false**

When `true`, tiles in each row grow to fill the full container width. `itemWidth` becomes the minimum tile width; the actual width is distributed evenly.

When `true`, tiles grow to fill the full container width.
The number of columns is still derived from `itemWidth`, but each tile's actual width is distributed evenly across the available space, eliminating trailing horizontal gaps.
`itemWidth` acts as the minimum tile width that determines the column count.

```xmlui copy /stretchItems="true"/
<App>
  <TileGrid data="{[...]}" itemWidth="120px" itemHeight="80px" stretchItems="true">
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: stretchItems"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    stretchItems="true"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `syncWithVar` [#syncwithvar]

The name of a global variable to synchronize the grid's selection state with. The named variable must reference an object; the grid will read from and write to its `selectedIds` property. A runtime error is signalled if the value is not a valid JavaScript variable name.

The following example demonstrates two `TileGrid` components sharing selection state through a global variable.
Selecting a tile in either grid immediately reflects in the other:

>[!INFO]
> `syncWithVar` works with both global and local variables. When using local variables, ensure all TileGrids in the sync have that variable in scope.

```xmlui-pg
---app copy display /global.selState/ filename="Main.xmlui"
<App global.selState="{{}}">
  <MyGrid />
  <Text>Selection: {JSON.stringify(selState)}</Text>
  <MyGrid />
</App>
---comp copy display /syncWithVar="selState"/ filename="MyGrid.xmlui"
<Component name="MyGrid">
  <TileGrid
    syncWithVar="selState"
    itemsSelectable="true"
    data="{[
      {id: 1, name: 'Apples'},
      {id: 2, name: 'Bananas'},
      {id: 3, name: 'Carrots'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</Component>
---desc
Change the selection in one of the grids and check how it is synced.
```

### `toggleSelectionOnClick` [#toggleselectiononclick]

> [!DEF]  default: **false**

When `true`, a plain click toggles the tile's selection state instead of replacing the current selection. Ctrl+Click and Shift+Click behavior is unchanged. Only has an effect when `itemsSelectable` is `true`.

When `true`, a plain click toggles the tile's selection state (adds it if not selected, removes it if already selected) instead of replacing the current selection.
This property only has an effect when `itemsSelectable` is `true`. Ctrl+Click and Shift+Click behavior is unchanged.

The default value is `false`.

```xmlui copy /toggleSelectionOnClick="true"/
<App>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    toggleSelectionOnClick="true"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
    </VStack>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: toggleSelectionOnClick"
<App>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    toggleSelectionOnClick="true"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

## Events [#events]

### `contextMenu` [#contextmenu]

Fired when a tile is right-clicked. Receives the tile data item as `$item` and its zero-based index as `$itemIndex`.

Fired when a tile is right-clicked. Receives the tile data item as `$item` and its zero-based index as `$itemIndex`.

```xmlui copy /onContextMenu="testState = $item.name"/
<App var.testState="">
  <TileGrid
    data="{[
      {id: 1, name: 'Apples'},
      {id: 2, name: 'Bananas'},
      {id: 3, name: 'Carrots'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    onContextMenu="testState = $item.name"
  >
    <Text>{$item.name}</Text>
  </TileGrid>
  <Text>Right-clicked: {testState}</Text>
</App>
```

### `copyAction` [#copyaction]

Fired when the user presses Ctrl/Cmd+C. Receives `(focusedItem, selectedItems, selectedIds)`.

Fired when the user presses Ctrl/Cmd+C while the grid is focused and `itemsSelectable` is `true`.
The handler receives `(focusedItem, selectedItems, selectedIds)`.

(See the [deleteAction](#deleteaction) event for the general pattern.)

### `cutAction` [#cutaction]

Fired when the user presses Ctrl/Cmd+X. Receives `(focusedItem, selectedItems, selectedIds)`.

Fired when the user presses Ctrl/Cmd+X while the grid is focused and `itemsSelectable` is `true`.
The handler receives `(focusedItem, selectedItems, selectedIds)`.

(See the [deleteAction](#deleteaction) event for the general pattern.)

### `deleteAction` [#deleteaction]

Fired when the user presses the Delete key. Receives `(focusedItem, selectedItems, selectedIds)`.

Fired when the user presses the Delete key while the grid is focused and `itemsSelectable` is `true`.
The handler receives `(focusedItem, selectedItems, selectedIds)`.
The component does **not** remove items automatically — the handler must implement the removal.

```xmlui-pg copy display name="Example: deleteAction"
<App var.msg="">
  <Text>{msg}</Text>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples'},
      {id: 2, name: 'Bananas'},
      {id: 3, name: 'Carrots'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    onDeleteAction="(focused, items, ids) => msg = 'Delete pressed for: ' + ids.join(', ')"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

### `itemDoubleClick` [#itemdoubleclick]

Fired when a tile is double-clicked. Receives the data item.

Fired when a tile is double-clicked. The handler receives the tile's data item.

```xmlui copy /onItemDoubleClick/
<App var.last="">
  <Text>Last double-clicked: {last}</Text>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    onItemDoubleClick="(item) => last = item.name"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: itemDoubleClick"
<App var.last="">
  <Text>Last double-clicked: {last}</Text>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    onItemDoubleClick="(item) => last = item.name"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

### `pasteAction` [#pasteaction]

Fired when the user presses Ctrl/Cmd+V. Receives `(focusedItem, selectedItems, selectedIds)`.

Fired when the user presses Ctrl/Cmd+V while the grid is focused and `itemsSelectable` is `true`.
The handler receives `(focusedItem, selectedItems, selectedIds)`.

(See the [deleteAction](#deleteaction) event for the general pattern.)

### `selectAllAction` [#selectallaction]

Fired when the user presses Ctrl/Cmd+A. Receives `(selectedItems, selectedIds)`.

Fired when the user presses Ctrl/Cmd+A while the grid is focused and `itemsSelectable` is `true`.
The component automatically selects all tiles before invoking this handler.
The handler receives `(selectedItems, selectedIds)`.

```xmlui-pg copy display name="Example: selectAllAction"
<App var.msg="">
  <Text>{msg}</Text>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples'},
      {id: 2, name: 'Bananas'},
      {id: 3, name: 'Carrots'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    onSelectAllAction="(items, ids) => msg = 'Selected all: ' + ids.join(', ')"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

### `selectionDidChange` [#selectiondidchange]

Fired when the selection changes. Receives the array of currently selected items.

Fired when the set of selected tiles changes.
The handler receives an array of the currently selected data items.

```xmlui copy {5}
<App var.selected="">
  <Text>Selected: {selected}</Text>
  <TileGrid
    data="{[...]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    onSelectionDidChange="(items) => selected = items.map(i => i.name).join(', ')"
  >
    <Text fontWeight="bold">{$item.name}</Text>
  </TileGrid>
</App>
```

```xmlui-pg name="Example: selectionDidChange"
<App var.selected="">
  <Text>Selected: {selected}</Text>
  <TileGrid
    data="{[
      {id: 1, name: 'Apples', category: 'fruits'},
      {id: 2, name: 'Bananas', category: 'fruits'},
      {id: 3, name: 'Carrots', category: 'vegetables'},
      {id: 4, name: 'Spinach', category: 'vegetables'},
      {id: 5, name: 'Milk', category: 'dairy'},
      {id: 6, name: 'Cheese', category: 'dairy'}
    ]}"
    itemWidth="120px"
    itemHeight="80px"
    itemsSelectable="true"
    onSelectionDidChange="(items) => selected = items.map(i => i.name).join(', ')"
  >
    <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
      <Text fontWeight="bold">{$item.name}</Text>
      <Text color="gray">{$item.category}</Text>
    </VStack>
  </TileGrid>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The visual appearance of `TileGrid` can be customized through theme variables. These control layout, spacing, and typography for tiles and their selection controls.

| Theme variable | Description |
|:---|:---|
| `fontSize-checkbox-TileGrid` | Font size of the checkbox label used for tile selection. |

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TileGrid | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TileGrid--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TileGrid--selected | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TileGrid--selected--hover | $color-primary-100 | $color-primary-100 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-item-TileGrid | $borderRadius | $borderRadius |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-checkbox-TileGrid | $fontSize | $fontSize |
| [offset](/docs/styles-and-themes/common-units/#size-values)Horizontal-checkbox-TileGrid | 4px | 4px |
| [offset](/docs/styles-and-themes/common-units/#size-values)Vertical-checkbox-TileGrid | 4px | 4px |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-item-TileGrid--focus | $color-primary-500 | $color-primary-500 |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-item-TileGrid--focus | -2px | -2px |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-item-TileGrid--focus | solid | solid |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-item-TileGrid--focus | 2px | 2px |
| userSelect-item-TileGrid | none | none |
