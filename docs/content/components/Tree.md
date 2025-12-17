# Tree [#tree]

The `Tree` component is a virtualized tree component that displays hierarchical data with support for flat and hierarchy data formats.

**Key features:**
- **Flat and hierarchical data structures**: You can select the most convenient data format to represent the tree. A set of properties enables you to map your data structure to the visual representation of the tree.
- **Flexible expand/collapse**: You have several properties to represent the expanded and collapsed state of tree nodes. You can also specify several options that determine which tree items are collapsed initially. 
- **Tree API**: Several exposed methods allow you to manage the tree's view state imperatively.

## Specifying Data [#specifying-data]

With the `dataFormat` property, you can select between "flat" or "hierarchy" formats. The component transforms the data according to the value of this property into a visual representation.

The "flat" and "hierarchy" data structures both use these fields for a particular tree node:
- `id`: Unique ID of tree node
- `name`: The field to be used as the display label
- `icon`: An optional icon identifier. If specified, this icon is displayed with the tree item.
- `iconExpanded`: An optional icon identifier. This icon is displayed when the field is expanded.
- `iconCollapsed`: An optional icon identifier. This icon is displayed when the field is collapsed.
- `selectable`: Indicates if the node can be selected.

The "flat" structure refers to its direct parent node via the `parentId` property, which contains the ID of the node it is referring to.

The "hierarchy" structure uses a `children` property, which is an array of nested child nodes (using the common node property set above).

This example demonstrates the use of the "flat" data mode:

```xmlui-pg display copy height="220px" /"flat"/ /parentId/ name="Example: flat data format"
<App>
  <Tree
    testId="tree"
    dataFormat="flat"
    defaultExpanded="all"
    data='{[
      { id: 1, icon:"folder", name: "Root Item 1", parentId: null },
      { id: 2, icon:"folder", name: "Child Item 1.1", parentId: 1 },
      { id: 3, icon: "code", name: "Child Item 1.2", parentId: 1 },
      { id: 4, icon: "code", name: "Grandchild Item 1.1.1", parentId: 2 },
    ]}'>
  </Tree>
</App>
```

This example demonstrates the use of the "hiearchy" data mode:

```xmlui-pg display copy height="220px" /"flat"/ /children/ name="Example: hierarchical data format"
<App>
  <Tree
    testId="tree"
    dataFormat="hierarchy"
    defaultExpanded="all"
    data='{[
      {
        id: 1, icon: "folder", name: "Root Item 1",
        children: [
          { id: 2, icon: "code", name: "Child Item 1.1" },
          { id: 3, icon: "folder", name: "Child Item 1.2",
            children: [
              { id: 4, icon: "code", name: "Grandchild Item 1.2.1"}
            ],
          }
        ],
      },
    ]}'>
  </Tree>
</App>
```

When you use data (for example, retrieved from a backend), those structures may use different property names. The `Tree` component allows mapping data field names through these properties: 
- `idField` (default: `id`)
- `nameField` (default: `name`)
- `iconField`  (default: `icon`)
- `iconExpandedField` (default: `iconExpanded`)
- `iconCollapsedField` (default: `iconCollapsed`)
- `parentIdField` (default: `parentId`)
- `childrenField` (default: `children`)
- `selectableField` (default: `selectable`)

The following example uses the `idField`, `nameField`, and `parentIdField` mapping properties:

```xmlui-pg display copy height="220px" /idField/ /nameField/ /parentIdField/ /uid/ /label/ /parent/ name="Example: mapping data fields"
<App>
  <Tree
    testId="tree"
    dataFormat="flat"
    defaultExpanded="all"
    idField="uid"
    nameField="label"
    parentIdField="parent"
    data='{[
      { uid: 1, icon:"folder", label: "Root Item 1", parent: null },
      { uid: 2, icon:"folder", label: "Child Item 1.1", parent: 1 },
      { uid: 3, icon: "code", label: "Child Item 1.2", parent: 1 },
      { uid: 4, icon: "code", label: "Grandchild Item 1.1.1", parent: 2 },
    ]}'>
  </Tree>
</App>
```

## Expanding and collapsing tree nodes [#expanding-and-collapsing-tree-nodes]

By default, when you click a tree node outside of its expand/collapse icon,  the specified item is selected. With the `expandOnItemClick` property (using the `true` value), you can change this behavior to expand or collapse the item when clicking its surface anywhere.

You can use the `defaultExpanded` property to specify what nodes you want to see expanded initially. You can set this property to a list of node IDs or a string. When you specify IDs, the component expands the hierarchy to reveal the specified nodes. When the value is a string, you can use these options:
- `none`: all nodes are collapsed (default)
- `first-level`: all first-level nodes are expanded
- `all`: all nodes are expanded

The following example demonstrates the use of `defaultExpanded` with tree node IDs:

```xmlui-pg display copy height="300px" /doc-root/ /proj-web/ /media-profile-pic/ name="Example: defaultExpanded with node IDs"
<App>
  <Tree
    testId="tree"
    dataFormat="flat"
    defaultExpanded="{['doc-root', 'proj-web', 'media-profile-pic']}"
    data='{[
      // Branch A: Documents
      { id: "doc-root", name: "[Documents]", parentId: null },
      { id: "doc-reports", name: "Reports", parentId: "doc-root" },
      { id: "doc-invoices", name: "Invoices", parentId: "doc-root" },
      { id: "doc-q1-report", name: "Q1 Report.pdf", parentId: "doc-reports" },
      { id: "doc-q2-report", name: "Q2 Report.pdf", parentId: "doc-reports" },
      { id: "doc-inv-001", name: "Invoice-001.pdf", parentId: "doc-invoices" },

      // Branch B: Projects
      { id: "proj-root", name: "Projects", parentId: null },
      { id: "proj-web", name: "[Web Apps]", parentId: "proj-root" },
      { id: "proj-mobile", name: "Mobile Apps", parentId: "proj-root" },
      { id: "proj-ecommerce", name: "E-commerce Site", parentId: "proj-web" },
      { id: "proj-dashboard", name: "Admin Dashboard", parentId: "proj-web" },
      { id: "proj-ios-app", name: "iOS Shopping App", parentId: "proj-mobile" },

      // Branch C: Media
      { id: "media-root", name: "Media", parentId: null },
      { id: "media-images", name: "Images", parentId: "media-root" },
      { id: "media-videos", name: "Videos", parentId: "media-root" },
      { id: "media-profile-pic", name: "[profile.jpg]", parentId: "media-images" },
      { id: "media-banner", name: "banner.png", parentId: "media-images" },
    ]}'>
  </Tree>
</App>
```

You have several options to style the icons representing the expanded or collapsed state:
- The icons used for the expanded and collapsed states can be changed with the `iconExpanded` and `iconCollapsed` properties, respectively.
- You can specify a different size with the `iconSize` property (using only numeric values considered as pixels)
- Using a rotate animation when changing the state with the `animateExpand` flag.
The following option demonstrates the last two options:

```xmlui-pg display copy {4-5} height="220px" name="Example: expand/collapse options"
<App>
  <Tree
    testId="tree"
    iconSize="24"
    animateExpand
    dataFormat="flat"
    defaultExpanded="all"
    data='{[
      { id: 1, name: "Root Item 1", parentId: null },
      { id: 2, name: "Child Item 1.1", parentId: 1 },
      { id: 3, name: "Child Item 1.2", parentId: 1 },
      { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
    ]}'>
  </Tree>
</App>
```

## Selection [#selection]

Each tree node is selectable by default, unless the node item's data does not have a `selectable` property (or the one specified in `selectedField`).
A selectable item can be selected by clicking the mouse or pressing the Enter or Space keys when it has focus.

You can set the `selectedValue` property to define the selected tree item, ot use the `selectNode` exposed method for imperative selection.

## Item templates [#item-templates]

You can override the default template used to display a tree item with the `itemTemplate` property. The template definition can use the `$item` context variable to access the item's attributes for display. `$item` provides these properties:
- `id`: The unique node ID
- `name`: The name of the node
- `depth`: The depth level in the tree
- `isExpanded`: Indicates if the tree node is expanded
- `hasChildren`: Indicates if the tree node has children
- `children`: The children of the tree node
- `selectable`: Indicates if the node can be selected
- `parentId`: The ID of the node's parent
- `parentIds`: A list of parent IDs from the root node to the direct parent of the node
- `path`: An array with the node names following the path from the root node to the displayed node.
- `loadingState`: The current state of a dynamic node ("unloaded", "loading", or "loaded")

This example demonstrates these concepts:

```xmlui-pg display copy {20-30} height="400px" /$item.id/ /$item.name/ /$item.hasChildren/ name="Example: itemTemplate"
<App>
  <Tree
    testId="tree"
    id="tree"
    defaultExpanded="all"
    data='{[
        { id: "root", name: "My Files", parentId: null },
        { id: "doc-root", name: "Documents", parentId: "root" },
        { id: "doc-reports", name: "Reports", parentId: "doc-root" },
        { id: "doc-q1-report", name: "Q1 Report.pdf", parentId: "doc-reports" },
        { id: "doc-q2-report", name: "Q2 Report.pdf", parentId: "doc-reports" },
        { id: "proj-root", name: "Projects", parentId: "root" },
        { id: "proj-web", name: "Web Apps", parentId: "proj-root" },
        { id: "proj-ecommerce", name: "E-commerce Site", parentId: "proj-web" },
        { id: "proj-dashboard", name: "Admin Dashboard", parentId: "proj-web" },
        { id: "media-root", name: "Media", parentId: "root" },
        { id: "media-images", name: "Images", parentId: "media-root" },
        { id: "media-videos", name: "Videos", parentId: "media-root" },
      ]}'>
    <property name="itemTemplate">
      <HStack testId="{$item.id}" verticalAlignment="center" gap="$space-1">
        <Icon name="{$item.hasChildren ? 'folder' : 'code'}" />
        <Text>
          ({$item.id}):
        </Text>
        <Text variant="strong">
          {$item.name}
        </Text>
      </HStack>
    </property>
  </Tree>
</App>
```

## Dynamic tree nodes [#dynamic-tree-nodes]

When initializing the tree with its `data` property, you can set the `dynamic` property of the node to `true` (you can use a field name alias with the `dynamicField` property). When you extend a dynamic node, the tree fires the `loadChildren` event, and the nodes returned by the event handler will be the actual nodes.

By default, nodes are not dynamic.

While the child nodes are being queried, the tree node displays a spinner to indicate the loading state.

You can use the `markNodeUnloaded` exposed method to reset the state of an already loaded dynamic tree node. The next time the user expands the node, its content will be loaded again.

The following sample demonstrates this feature. Click the "Child Item 1.2" node to check how it loads its children. Click the Unload button to reload the items when the node is expanded the next time.

```xmlui-pg display copy {16-19} height="340px" /dynamic: true/ /onLoadChildren/ name="Example: dynamic nodes"
<App var.loadCount="{0}">
  <Tree
    testId="tree"
    defaultExpanded="all"
    id="tree"
    itemClickExpands
    data='{[
      { id: 1, name: "Root Item 1", parentId: null },
      { id: 2, name: "Child Item 1.1", parentId: 1 },
      { id: 3, name: "Child Item 1.2", parentId: 1, dynamic: true },
      { id: 4, name: "Child Item 1.3", parentId: 1 },
    ]}'
    onLoadChildren="(node) => {
      loadCount++;
      delay(1000); 
      return ([
        { id: 5, name: `Dynamic Item 1.2.1 (${loadCount})` },
        { id: 6, name: `Dynamic Item 2.2.2 (${loadCount})` },
      ])
    }"
    >
    <property name="itemTemplate">
      <HStack testId="{$item.id}" verticalAlignment="center" gap="$space-1">
        <Icon name="{$item.hasChildren 
          ? ($item.loadingState === 'loaded' ? 'folder' : 'folder-outline' ) 
          : 'code'}" 
        />
        <Text>{$item.name}</Text>
      </HStack>
    </property>
  </Tree>
  <Button onClick="tree.markNodeUnloaded(3)">Unload</Button>
</App>
```

## Properties [#properties]

### `animateExpand` (default: false) [#animateexpand-default-false]

When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).

### `autoExpandToSelection` (default: true) [#autoexpandtoselection-default-true]

Automatically expand the path to the selected item.

### `childrenField` (default: "children") [#childrenfield-default-children]

The property name in source data for child arrays (used in hierarchy format).

### `data` (required) [#data-required]

The data source of the tree. Format depends on the dataFormat property.

### `dataFormat` (default: "flat") [#dataformat-default-flat]

The input data structure format: "flat" (array with parent relationships) or "hierarchy" (nested objects).

### `defaultExpanded` (default: "none") [#defaultexpanded-default-none]

Initial expansion state: "none", "all", "first-level", or array of specific IDs.

### `dynamicField` (default: "dynamic") [#dynamicfield-default-dynamic]

The property name in source data for dynamic loading state (default: "dynamic").

### `expandRotation` (default: 90) [#expandrotation-default-90]

The number of degrees to rotate the collapsed icon when expanded in animate mode (default: 90).

### `iconCollapsed` (default: "chevronright") [#iconcollapsed-default-chevronright]

The icon name to use for collapsed nodes (default: "chevronright").

### `iconCollapsedField` (default: "iconCollapsed") [#iconcollapsedfield-default-iconcollapsed]

The property name in source data for collapsed state icons.

### `iconExpanded` (default: "chevrondown") [#iconexpanded-default-chevrondown]

The icon name to use for expanded nodes (default: "chevrondown").

### `iconExpandedField` (default: "iconExpanded") [#iconexpandedfield-default-iconexpanded]

The property name in source data for expanded state icons.

### `iconField` (default: "icon") [#iconfield-default-icon]

The property name in source data for icon identifiers.

### `iconSize` (default: "16") [#iconsize-default-16]

The size of the expand/collapse icons (default: "16").

### `idField` (default: "id") [#idfield-default-id]

The property name in source data for unique identifiers.

### `itemClickExpands` (default: false) [#itemclickexpands-default-false]

Whether clicking anywhere on a tree item should expand/collapse the node, not just the expand/collapse icon.

### `itemHeight` (default: 32) [#itemheight-default-32]

The height of each tree row in pixels (default: 35).

### `itemTemplate` [#itemtemplate]

The template for each item in the tree.

### `nameField` (default: "name") [#namefield-default-name]

The property name in source data for display text.

### `parentIdField` (default: "parentId") [#parentidfield-default-parentid]

The property name in source data for parent relationships (used in flat format).

### `selectableField` (default: "selectable") [#selectablefield-default-selectable]

The property name in source data for selectable state (default: "selectable").

### `selectedValue` [#selectedvalue]

The selected item ID in source data format.

## Events [#events]

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

### `clearSelection` [#clearselection]

Clear the current selection.

**Signature**: `clearSelection(): void`

### `collapseAll` [#collapseall]

Collapse all nodes in the tree.

**Signature**: `collapseAll(): void`

### `collapseNode` [#collapsenode]

Collapse a specific node by its source data ID.

**Signature**: `collapseNode(nodeId: string | number): void`

- `nodeId`: The ID of the node to collapse (source data format)

### `expandAll` [#expandall]

Expand all nodes in the tree.

**Signature**: `expandAll(): void`

### `expandNode` [#expandnode]

Expand a specific node by its source data ID.

**Signature**: `expandNode(nodeId: string | number): void`

- `nodeId`: The ID of the node to expand (source data format)

### `expandToLevel` [#expandtolevel]

Expand nodes up to the specified depth level (0-based).

**Signature**: `expandToLevel(level: number): void`

- `level`: The maximum depth level to expand (0 = root level only)

### `getExpandedNodes` [#getexpandednodes]

Get an array of currently expanded node IDs in source data format.

**Signature**: `getExpandedNodes(): (string | number)[]`

### `getNodeById` [#getnodebyid]

Get a tree node by its source data ID.

**Signature**: `getNodeById(nodeId: string | number): TreeNode | null`

- `nodeId`: The ID of the node to retrieve (source data format)

### `getNodeLoadingState` [#getnodeloadingstate]

Get the loading state of a dynamic node.

**Signature**: `getNodeLoadingState(nodeId: string | number): NodeLoadingState`

- `nodeId`: The ID of the node to check loading state for

### `getSelectedNode` [#getselectednode]

Get the currently selected tree node.

**Signature**: `getSelectedNode(): TreeNode | null`

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

### `scrollIntoView` [#scrollintoview]

Scroll to a specific node and expand parent nodes as needed to make it visible.

**Signature**: `scrollIntoView(nodeId: string | number, options?: ScrollIntoViewOptions): void`

- `nodeId`: The ID of the node to scroll to (source data format)
- `options`: Optional scroll options

### `scrollToItem` [#scrolltoitem]

Scroll to a specific node if it's currently visible in the tree.

**Signature**: `scrollToItem(nodeId: string | number): void`

- `nodeId`: The ID of the node to scroll to (source data format)

### `selectNode` [#selectnode]

Programmatically select a node by its source data ID.

**Signature**: `selectNode(nodeId: string | number): void`

- `nodeId`: The ID of the node to select (source data format)

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tree-row--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tree-row--selected | $color-primary-50 | $color-primary-50 |
| [borderColor](../styles-and-themes/common-units/#color)-Tree-row--focus | $color-primary-500 | $color-primary-500 |
| [outlineColor](../styles-and-themes/common-units/#color)-Tree--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-Tree--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](../styles-and-themes/common-units/#border)-Tree--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-Tree--focus | $outlineWidth--focus | $outlineWidth--focus |
| [textColor](../styles-and-themes/common-units/#color)-Tree | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-Tree--hover | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-Tree--selected | $color-primary-900 | $color-primary-900 |
