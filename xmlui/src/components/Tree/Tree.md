%-DESC-START

**Key features:**
- **Flat and hierarchical data structures**: You can select the most convenient data format to represent the tree. A set of properties enables you to map your data structure to the visual representation of the tree.
- **Flexible expand/collapse**: You have several properties to represent the expanded and collapsed state of tree nodes. You can also specify several options that determine which tree items are collapsed initially. 
- **Tree API**: Several exposed methods allow you to manage the tree's view state imperatively.

## Specifying Data

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

## Expanding and collapsing tree nodes

You can use the `defaultExpanded` property to specify what nodes you want to see expanded initially. You can set this property to a list of node IDs or a string. When you specify IDs, the component expands the hierarchy to reveal the specified nodes. When the value is a string, you can use these options:
- `none`: all nodes are collapsed (default)
- `first-level`: all first-level nodes are expanded
- `all`: all nodes are expanded
## Expanding and collapsing tree nodes

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

## Item templates

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



%-DESC-END