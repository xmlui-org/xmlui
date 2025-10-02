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
- `iconExpanded`. An optional icon identifier. This icon is displayed when the field is expanded.
- `iconCollapsed`. An optional icon identifier. This icon is displayed when the field is collapsed.
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

You can use the `defaultExpanded` property to specify what nodes you want to see expanded initially. You can set this property to a list of node IDs or a string. When you specify IDs, the component expands the hierarchy to reveal the specified nodes. When the value is a string, you can use these options:
- `none`: all nodes are collapsed (default)
- `first-level`: all first-level nodes are expanded
- `all`: all nodes are expanded
## Expanding and collapsing tree nodes [#expanding-and-collapsing-tree-nodes]

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

## Properties [#properties]

### `animateExpand` [#animateexpand]

When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).

### `autoExpandToSelection` [#autoexpandtoselection]

Automatically expand the path to the selected item.

### `childrenField` [#childrenfield]

The property name in source data for child arrays (used in hierarchy format).

### `data` [#data]

The data source of the tree. Format depends on the dataFormat property.

### `dataFormat` [#dataformat]

The input data structure format: "flat" (array with parent relationships) or "hierarchy" (nested objects).

### `defaultExpanded` [#defaultexpanded]

Initial expansion state: "none", "all", "first-level", or array of specific IDs.

### `expandOnItemClick` [#expandonitemclick]

Enable expansion/collapse by clicking anywhere on the item (not just the chevron).

### `expandRotation` [#expandrotation]

The number of degrees to rotate the collapsed icon when expanded in animate mode (default: 90).

### `iconCollapsed` [#iconcollapsed]

The icon name to use for collapsed nodes (default: "chevronright").

### `iconCollapsedField` [#iconcollapsedfield]

The property name in source data for collapsed state icons.

### `iconExpanded` [#iconexpanded]

The icon name to use for expanded nodes (default: "chevrondown").

### `iconExpandedField` [#iconexpandedfield]

The property name in source data for expanded state icons.

### `iconField` [#iconfield]

The property name in source data for icon identifiers.

### `iconSize` [#iconsize]

The size of the expand/collapse icons (default: "16").

### `idField` [#idfield]

The property name in source data for unique identifiers.

### `itemHeight` [#itemheight]

The height of each tree row in pixels (default: 35).

### `itemTemplate` [#itemtemplate]

The template for each item in the tree.

### `nameField` [#namefield]

The property name in source data for display text.

### `parentIdField` [#parentidfield]

The property name in source data for parent relationships (used in flat format).

### `selectableField` [#selectablefield]

The property name in source data for selectable state (default: "selectable").

### `selectedValue` [#selectedvalue]

The selected item ID in source data format.

## Events [#events]

### `nodeDidCollapse` [#nodedidcollapse]

Fired when a tree node is collapsed.

### `nodeDidExpand` [#nodedidexpand]

Fired when a tree node is expanded.

### `selectionDidChange` [#selectiondidchange]

Fired when the tree selection changes.

## Exposed Methods [#exposed-methods]

### `clearSelection` [#clearselection]

Clear the current selection.

**Signature**: `clearSelection(): void`

### `collapseAll` [#collapseall]

Collapse all nodes in the tree.

**Signature**: `collapseAll(): void`

### `collapseNode` [#collapsenode]

Collapse a specific node by its source data ID.

**Signature**: `collapseNode(nodeId: string): void`

- `nodeId`: The ID of the node to collapse (source data format)

### `expandAll` [#expandall]

Expand all nodes in the tree.

**Signature**: `expandAll(): void`

### `expandNode` [#expandnode]

Expand a specific node by its source data ID.

**Signature**: `expandNode(nodeId: string): void`

- `nodeId`: The ID of the node to expand (source data format)

### `expandToLevel` [#expandtolevel]

Expand nodes up to the specified depth level (0-based).

**Signature**: `expandToLevel(level: number): void`

- `level`: The maximum depth level to expand (0 = root level only)

### `getExpandedNodes` [#getexpandednodes]

Get an array of currently expanded node IDs in source data format.

**Signature**: `getExpandedNodes(): string[]`

### `getNodeById` [#getnodebyid]

Get a tree node by its source data ID.

**Signature**: `getNodeById(nodeId: string): TreeNode | null`

- `nodeId`: The ID of the node to retrieve (source data format)

### `getSelectedNode` [#getselectednode]

Get the currently selected tree node.

**Signature**: `getSelectedNode(): TreeNode | null`

### `selectNode` [#selectnode]

Programmatically select a node by its source data ID.

**Signature**: `selectNode(nodeId: string): void`

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
