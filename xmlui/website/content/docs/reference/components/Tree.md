# Tree [#tree]

The `Tree` component is a virtualized tree component that displays hierarchical data with support for flat and hierarchy data formats.

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

### `animateExpand` [#animateexpand]

> [!DEF]  default: **false**

When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).

### `autoExpandToSelection` [#autoexpandtoselection]

> [!DEF]  default: **true**

Automatically expand the path to the selected item.

### `autoLoadAfter` [#autoloadafter]

Default number of milliseconds after which dynamic tree nodes should automatically reload their children when collapsed and then re-expanded. Only applies to nodes that were loaded via the loadChildren event. Can be overridden per-node using setAutoLoadAfter API. Pass undefined to disable auto-loading by default.

### `autoLoadAfterField` [#autoloadafterfield]

> [!DEF]  default: **"autoLoadAfter"**

The property name in source data for per-node autoLoadAfter values (default: 'autoLoadAfter'). Allows reading node-specific reload thresholds from data. Node-level values take priority over the component-level autoLoadAfter prop.

### `childrenField` [#childrenfield]

> [!DEF]  default: **"children"**

The property name in source data for child arrays (used in hierarchy format).

### `data` [#data]

> [!DEF]  This property is required.

The data source of the tree. Format depends on the dataFormat property.

### `dataFormat` [#dataformat]

> [!DEF]  default: **"flat"**

The input data structure format: "flat" (array with parent relationships) or "hierarchy" (nested objects).

### `defaultExpanded` [#defaultexpanded]

> [!DEF]  default: **"none"**

Initial expansion state: "none", "all", "first-level", or array of specific IDs.

### `dynamic` [#dynamic]

> [!DEF]  default: **false**

Default value for whether tree nodes should load children dynamically (default: false). If true, nodes will load children via the loadChildren event. If false, nodes use static children from data. Can be overridden per-node in source data using the dynamicField property. Ignored if loadChildren handler is not provided.

### `dynamicField` [#dynamicfield]

> [!DEF]  default: **"dynamic"**

The property name in source data for dynamic state (default: 'dynamic'). When true, the node's children should be dynamically loaded via loadChildren event. When false, the node uses static children from data. Ignored if loadChildren handler is not provided.

### `expandRotation` [#expandrotation]

> [!DEF]  default: **90**

The number of degrees to rotate the collapsed icon when expanded in animate mode (default: 90).

### `fixedItemSize` [#fixeditemsize]

> [!DEF]  default: **false**

When set to `true`, the tree will measure the height of the first item and use that as a fixed size hint for all items. This improves scroll performance when all items have the same height. If items have varying heights, leave this as `false`.

### `iconCollapsed` [#iconcollapsed]

> [!DEF]  default: **"chevronright"**

The icon name to use for collapsed nodes (default: "chevronright").

### `iconCollapsedField` [#iconcollapsedfield]

> [!DEF]  default: **"iconCollapsed"**

The property name in source data for collapsed state icons.

### `iconExpanded` [#iconexpanded]

> [!DEF]  default: **"chevrondown"**

The icon name to use for expanded nodes (default: "chevrondown").

### `iconExpandedField` [#iconexpandedfield]

> [!DEF]  default: **"iconExpanded"**

The property name in source data for expanded state icons.

### `iconField` [#iconfield]

> [!DEF]  default: **"icon"**

The property name in source data for icon identifiers.

### `iconSize` [#iconsize]

> [!DEF]  default: **"16"**

The size of the expand/collapse icons (default: "16").

### `idField` [#idfield]

> [!DEF]  default: **"id"**

The property name in source data for unique identifiers.

### `itemClickExpands` [#itemclickexpands]

> [!DEF]  default: **false**

Whether clicking anywhere on a tree item should expand/collapse the node, not just the expand/collapse icon.

### `itemHeight` [#itemheight]

> [!DEF]  default: **32**

The height of each tree row in pixels (default: 32).

### `itemTemplate` [#itemtemplate]

The template for each item in the tree.

### `loadedField` [#loadedfield]

> [!DEF]  default: **"loaded"**

The property name in source data for loaded state (default: "loaded"). When false, shows expand indicator even without children and triggers async loading.

### `nameField` [#namefield]

> [!DEF]  default: **"name"**

The property name in source data for display text.

### `overflow` [#overflow]

Overrides the overflow style of the tree scroll container. When set (e.g. "visible"), the tree renders at its natural content height without internal scrolling, allowing an outer container to handle scrolling instead.

### `parentIdField` [#parentidfield]

> [!DEF]  default: **"parentId"**

The property name in source data for parent relationships (used in flat format).

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `selectableField` [#selectablefield]

> [!DEF]  default: **"selectable"**

The property name in source data for selectable state (default: "selectable").

### `selectedValue` [#selectedvalue]

The selected item ID in source data format.

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **false**

When enabled, displays gradient fade indicators at the top and bottom edges of the tree when scrollable content extends beyond the visible area. The fade effect provides a visual cue to users that additional content is available by scrolling. The indicators automatically appear and disappear based on the scroll position. This property only works with "overlay", "whenMouseOver", and "whenScrolling" scroll styles.

### `spinnerDelay` [#spinnerdelay]

> [!DEF]  default: **0**

The delay in milliseconds before showing the loading spinner when a node is in loading state. Set to 0 to show immediately, or a higher value to prevent spinner flicker for fast-loading nodes.

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Tree is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `copyAction` [#copyaction]

This event is triggered when the user presses the copy keyboard shortcut (default: Ctrl+C/Cmd+C) while the tree has focus and a node is selected. The handler receives the focused node. The handler should implement the copy logic (e.g., using the Clipboard API to copy the node data).

**Signature**: `copy(node: FlatTreeNode): void | Promise<void>`

- `node`: The currently focused tree node.

### `cutAction` [#cutaction]

This event is triggered when the user presses the cut keyboard shortcut (default: Ctrl+X/Cmd+X) while the tree has focus and a node is selected. The handler receives the focused node. Note: The component does not automatically modify data; the handler must implement the cut logic (e.g., copying node data to clipboard and removing from the tree).

**Signature**: `cut(node: FlatTreeNode): void | Promise<void>`

- `node`: The currently focused tree node.

### `deleteAction` [#deleteaction]

This event is triggered when the user presses the delete keyboard shortcut (default: Delete key) while the tree has focus and a node is selected. The handler receives the focused node. Note: The component does not automatically remove data; the handler must implement the delete logic (e.g., removing the node from the data source).

**Signature**: `delete(node: FlatTreeNode): void | Promise<void>`

- `node`: The currently focused tree node.

### `loadChildren` [#loadchildren]

Fired when a tree node needs to load children dynamically. Should return an array of child data.

**Signature**: `loadChildren(node: FlatTreeNode): any[]`

- `node`: The tree node that needs to load its children.

### `nodeDidCollapse` [#nodedidcollapse]

Fired when a tree node is collapsed.

**Signature**: `nodeDidCollapse(node: FlatTreeNode): void`

- `node`: The tree node that was collapsed.

### `nodeDidExpand` [#nodedidexpand]

Fired when a tree node is expanded.

**Signature**: `nodeDidExpand(node: FlatTreeNode): void`

- `node`: The tree node that was expanded.

### `pasteAction` [#pasteaction]

This event is triggered when the user presses the paste keyboard shortcut (default: Ctrl+V/Cmd+V) while the tree has focus and a node is selected. The handler receives the focused node. The handler must implement the paste logic (e.g., reading from clipboard and inserting data into the tree).

**Signature**: `paste(node: FlatTreeNode): void | Promise<void>`

- `node`: The currently focused tree node.

### `selectionDidChange` [#selectiondidchange]

Fired when the tree selection changes.

**Signature**: `selectionDidChange(event: { selectedNode: FlatTreeNode | null, previousNode: FlatTreeNode | null }): void`

- `event`: An object containing selectedNode (the newly selected node) and previousNode (the previously selected node).

## Exposed Methods [#exposed-methods]

### `appendNode` [#appendnode]

Add a new node to the tree as a child of the specified parent node.

**Signature**: `appendNode(parentNodeId: string | number | null, nodeData: any): void`

- `parentNodeId`: The ID of the parent node, or null/undefined to add to root level
- `nodeData`: The node data object using the format specified in dataFormat and field properties

### `collapseAll` [#collapseall]

Collapse all nodes in the tree.

**Signature**: `collapseAll(): void`

### `expandAll` [#expandall]

Expand all nodes in the tree.

**Signature**: `expandAll(): void`

### `expandToLevel` [#expandtolevel]

Expand nodes up to the specified depth level (0-based).

**Signature**: `expandToLevel(level: number): void`

- `level`: The maximum depth level to expand (0 = root level only)

### `getNodeLoadingState` [#getnodeloadingstate]

Get the loading state of a dynamic node.

**Signature**: `getNodeLoadingState(nodeId: string | number): NodeLoadingState`

- `nodeId`: The ID of the node to check loading state for

### `insertNodeAfter` [#insertnodeafter]

Insert a new node after an existing node at the same level.

**Signature**: `insertNodeAfter(afterNodeId: string | number, nodeData: any): void`

- `afterNodeId`: The ID of the existing node after which the new node should be inserted
- `nodeData`: The node data object using the format specified in dataFormat and field properties

### `insertNodeBefore` [#insertnodebefore]

Insert a new node before an existing node at the same level.

**Signature**: `insertNodeBefore(beforeNodeId: string | number, nodeData: any): void`

- `beforeNodeId`: The ID of the existing node before which the new node should be inserted
- `nodeData`: The node data object using the format specified in dataFormat and field properties

### `markNodeLoaded` [#marknodeloaded]

Mark a dynamic node as loaded.

**Signature**: `markNodeLoaded(nodeId: string | number): void`

- `nodeId`: The ID of the node to mark as loaded

### `markNodeUnloaded` [#marknodeunloaded]

Mark a dynamic node as unloaded and collapse it.

**Signature**: `markNodeUnloaded(nodeId: string | number): void`

- `nodeId`: The ID of the node to mark as unloaded

### `removeChildren` [#removechildren]

Remove all children (descendants) of a node while keeping the node itself.

**Signature**: `removeChildren(nodeId: string | number): void`

- `nodeId`: The ID of the parent node whose children should be removed

### `removeNode` [#removenode]

Remove a node and all its descendants from the tree.

**Signature**: `removeNode(nodeId: string | number): void`

- `nodeId`: The ID of the node to remove (along with all its descendants)

### `replaceChildren` [#replacechildren]

Replace all children of a node with new child nodes.

**Signature**: `replaceChildren(nodeId: string | number, newChildren: any[]): void`

- `nodeId`: The ID of the parent node
- `newChildren`: Array of child node data objects using the format specified in dataFormat and field properties

### `replaceNode` [#replacenode]

Replace a node's properties with new data using merge semantics. Properties not specified in nodeData are kept from the original node. Children are only replaced if nodeData specifies them.

**Signature**: `replaceNode(nodeId: string | number, nodeData: any): void`

- `nodeId`: The ID of the node to update
- `nodeData`: The node data object with properties to merge. Uses the format specified in dataFormat and field properties.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tree-row--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tree-row--selected | $color-primary-50 | $color-primary-50 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Tree-row--focus | $color-primary-500 | $color-primary-500 |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Tree--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Tree--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Tree--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Tree--focus | $outlineWidth--focus | $outlineWidth--focus |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tree | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tree--hover | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tree--selected | $color-primary-900 | $color-primary-900 |
