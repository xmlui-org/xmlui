# Tree [#tree]

The `Tree` component is a virtualized tree component that displays hierarchical data with support for flat and hierarchy data formats.

**Key features:**
- **Flat and hierarchical data structures**: You can select the most convenient data format to represent the tree. A set of properties enables you to map your data structure to the visual representation of the tree.
- **Flexible expand/collapse**: You have several properties to represent the expanded and collapsed state of tree nodes. You can also specify several options that determine which tree items are collapsed initially.
- **Dynamic (lazy) loading**: Load tree node children asynchronously on demand, with support for auto-reload thresholds and loading state feedback.
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
- `dynamic`: Indicates if the node's children should be loaded asynchronously. When set to `true`, the node shows an expand indicator and triggers the `onLoadChildren` event when expanded.

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
- `loadedField` (default: `loaded`)

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

## Async Loading (Lazy Loading) [#async-loading-lazy-loading]

The Tree component supports asynchronous loading of child nodes, useful for large datasets or data fetched from a server.

### Basic Concept [#basic-concept]

When a node has `dynamic: true`, the tree displays an expand icon even if the node has no children yet. When the user expands the node, the `onLoadChildren` event fires, and the returned data becomes the node's children.

```xmlui-pg height="180px" name="Example: Basic async loading"
---app display copy /dynamic: true/ /onLoadChildren/
<App var.loadCount="{0}">
  <Tree
    testId="tree"
    itemClickExpands
    data='{[
      { id: 1, name: "Projects", parentId: null, dynamic: true },
      { id: 2, name: "Documents", parentId: null },
    ]}'
    onLoadChildren="(node) => {
      // Load only the 'Projects' node
      if (node.id !== 1) return;
      loadCount++;
      delay(500);
      return [
        { id: 3, name: `Project A (load #${loadCount})`, parentId: node.id },
        { id: 4, name: `Project B (load #${loadCount})`, parentId: node.id },
      ];
    }">
  </Tree>
</App>
---desc
When you expand the Projects node for the first time, its children will load (delayed for demonstration). The next time you collapse and then extend this node, no reload happens.
```

> [!INFO] You can use the component's `dynamic` property to set all nodes to be dynamic by default. However, in this case, even nodes without children will display the expand indicator.

### Loading State Feedback [#loading-state-feedback]

Use the `$item.loadingState` context variable to display loading indicators. The state can be "unloaded", "loading", or "loaded".

```xmlui-pg display copy height="180px" /$item.loadingState/ name="Example: Loading state visual feedback"
<App var.loadCount="{0}">
  <Tree
    testId="tree"
    itemClickExpands
    data='{[
      { id: 1, name: "Root", parentId: null, loaded: false },
    ]}'
    onLoadChildren="(node) => {
      loadCount++;
      delay(1000);
      return [
        { id: 2, name: `Child 1 (load #${loadCount})`, parentId: node.id },
        { id: 3, name: `Child 2 (load #${loadCount})`, parentId: node.id },
      ];
    }">
    <property name="itemTemplate">
      <HStack testId="{$item.id}" gap="$space-2">
        <Icon name="{$item.loadingState === 'loaded' 
          ? 'folder' 
          : 'folder-outline'}" 
        />
        <Text>{$item.name}</Text>
        <Badge when="{$item.loadingState === 'loading'}" color="blue">
          Loading...
        </Badge>
        <Badge when="{$item.loadingState === 'loaded'}" color="green">
          Loaded
        </Badge>
      </HStack>
    </property>
  </Tree>
</App>
```

### Reloading Children [#reloading-children]

Use the `markNodeUnloaded` API method to mark a node as unloaded. The next time the node is expanded, children will be loaded again.

```xmlui-pg display copy height="200px" /markNodeUnloaded/ name="Example: Reload children"
<App var.loadCount="{0}">
  <Tree
    id="tree"
    testId="tree"
    itemClickExpands
    data='{[
      { id: 1, name: "Data Source", parentId: null, loaded: false },
    ]}'
    onLoadChildren="(node) => {
      loadCount++;
      delay(500);
      return [
        { id: `item-${loadCount}-1`, 
          name: `Item ${loadCount}.1`, 
          parentId: node.id
        },
        { 
          id: `item-${loadCount}-2`, 
          name: `Item ${loadCount}.2`, 
          parentId: node.id 
        },
      ];
    }">
  </Tree>
  <Button onClick="tree.markNodeUnloaded(1)">Reload Data</Button>
</App>
```

### Auto-Reload After Time [#auto-reload-after-time]

Set `autoLoadAfter` to automatically reload children after a specified time when a node is collapsed and re-expanded.

```xmlui-pg display copy height="180px" /autoLoadAfter/ name="Example: Auto-reload after time"
<App var.loadCount="{0}">
  <VStack gap="$space-2">
    <Text>
      Expand the node, collapse it, wait 3 seconds, 
      and expand again to see auto-reload.
    </Text>
    <Tree
      testId="tree"
      itemClickExpands
      autoLoadAfter="3000"
      data='{[
        { id: 1, name: "Live Data", parentId: null, dynamic: true },
      ]}'
      onLoadChildren="(node) => {
        loadCount++;
        delay(500);
        return [
          { 
              id: `ts-${getDate()}`, 
              name: `Loaded at ${formatDateTime(getDate())} (${loadCount})`, 
              parentId: node.id 
          },
        ];
      }">
    </Tree>
  </VStack>
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

### `animateExpand` [#animateexpand]

> [!DEF]  default: **false**

When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).

### `autoExpandToSelection` [#autoexpandtoselection]

> [!DEF]  default: **true**

Automatically expand the path to the selected item.

### `autoLoadAfter` [#autoloadafter]

Default number of milliseconds after which dynamic tree nodes should automatically reload their children when collapsed and then re-expanded. Only applies to nodes that were loaded via the loadChildren event. Can be overridden per-node using setAutoLoadAfter API. Pass undefined to disable auto-loading by default.

The `autoLoadAfter` property sets a time threshold (in milliseconds) for automatically reloading children when a node is collapsed and then re-expanded after the specified time.

```xmlui-pg display copy height="320px" /autoLoadAfter/ name="Example: Auto-reload threshold"
<App var.reloadCount="{0}">
  <VStack gap="$space-2">
    <Text variant="strong">Instructions:</Text>
    <Text>1. Expand a node to load its children</Text>
    <Text>2. Collapse the node</Text>
    <Text>3. Wait 2 seconds, then expand again to see fresh data</Text>
    <Tree
      testId="tree"
      itemClickExpands
      autoLoadAfter="2000"
      data='{[
        { id: 1, name: "Server Data", parentId: null, loaded: false },
        { id: 2, name: "Database Records", parentId: null, loaded: false },
      ]}'
      onLoadChildren="(node) => {
        reloadCount++;
        delay(400);
        const timestamp = Date().toLocaleTimeString();
        return [
          { id: `${node.id}-${Date.now()}`, name: `Data loaded at ${timestamp} (#${reloadCount})`, parentId: node.id },
        ];
      }">
    </Tree>
  </VStack>
</App>
```

### `autoLoadAfterField` [#autoloadafterfield]

> [!DEF]  default: **"autoLoadAfter"**

The property name in source data for per-node autoLoadAfter values (default: 'autoLoadAfter'). Allows reading node-specific reload thresholds from data. Node-level values take priority over the component-level autoLoadAfter prop.

The `autoLoadAfterField` property allows setting different auto-reload thresholds for individual nodes via a field in the node data.

```xmlui-pg display copy height="340px" /autoLoadAfterField/ name="Example: Per-node auto-reload"
<App var.fastReloads="{0}" var.slowReloads="{0}">
  <VStack gap="$space-2">
    <Text>Fast node reloads after 1 second, slow node after 5 seconds</Text>
    <Tree
      testId="tree"
      itemClickExpands
      autoLoadAfterField="reloadDelay"
      data='{[
        { id: 1, name: "Fast Updates (1s)", parentId: null, loaded: false, reloadDelay: 1000 },
        { id: 2, name: "Slow Updates (5s)", parentId: null, loaded: false, reloadDelay: 5000 },
      ]}'
      onLoadChildren="(node) => {
        if (node.id === 1) fastReloads++;
        if (node.id === 2) slowReloads++;
        delay(300);
        const count = node.id === 1 ? fastReloads : slowReloads;
        return [
          { id: `${node.id}-${Date.now()}`, name: `Load #${count} at ${Date().toLocaleTimeString()}`, parentId: node.id },
        ];
      }">
    </Tree>
  </VStack>
</App>
```

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

The `dynamic` property sets the default behavior for all tree nodes. When `true`, all nodes will load their children asynchronously via the `onLoadChildren` event.

```xmlui-pg display copy height="240px" /dynamic="true"/ name="Example: Dynamic tree"
<App var.count="{0}">
  <Tree
    testId="tree"
    dynamic="true"
    itemClickExpands
    data='{[
      { id: 1, name: "Folder 1", parentId: null },
      { id: 2, name: "Folder 2", parentId: null },
    ]}'
    onLoadChildren="(node) => {
      count++;
      delay(300);
      return [
        { id: `${node.id}-a`, name: `Item ${node.id}A (${count})`, parentId: node.id },
        { id: `${node.id}-b`, name: `Item ${node.id}B (${count})`, parentId: node.id },
      ];
    }">
  </Tree>
</App>
```

### `dynamicField` [#dynamicfield]

> [!DEF]  default: **"dynamic"**

The property name in source data for dynamic state (default: 'dynamic'). When true, the node's children should be dynamically loaded via loadChildren event. When false, the node uses static children from data. Ignored if loadChildren handler is not provided.

The `dynamicField` property allows individual nodes to override the tree's default `dynamic` behavior by setting a field in the node data.

```xmlui-pg display copy height="280px" /dynamicField="loadAsync"/ name="Example: Per-node dynamic control"
<App var.count="{0}">
  <Tree
    testId="tree"
    dynamic="false"
    dynamicField="loadAsync"
    itemClickExpands
    data='{[
      { id: 1, name: "Static Folder", parentId: null },
      { id: 2, name: "Static Item", parentId: 1 },
      { id: 3, name: "Dynamic Folder", parentId: null, loadAsync: true },
    ]}'
    onLoadChildren="(node) => {
      count++;
      delay(300);
      return [
        { id: `${node.id}-child`, name: `Loaded child (${count})`, parentId: node.id },
      ];
    }">
  </Tree>
</App>
```

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

The `loadedField` property specifies which field in node data indicates whether children have been loaded. This is useful when node data uses a different field name.

```xmlui-pg display copy height="240px" /loadedField="hasLoadedChildren"/ name="Example: Custom loaded field"
<App>
  <Tree
    testId="tree"
    itemClickExpands
    loadedField="hasLoadedChildren"
    data='{[
      { id: 1, name: "Loaded Node", parentId: null, hasLoadedChildren: true },
      { id: 2, name: "Unloaded Node", parentId: null, hasLoadedChildren: false },
    ]}'
    onLoadChildren="(node) => {
      delay(300);
      return [
        { id: `${node.id}-child`, name: `Child of ${node.id}`, parentId: node.id },
      ];
    }">
  </Tree>
</App>
```

### `nameField` [#namefield]

> [!DEF]  default: **"name"**

The property name in source data for display text.

### `parentIdField` [#parentidfield]

> [!DEF]  default: **"parentId"**

The property name in source data for parent relationships (used in flat format).

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

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

The `spinnerDelay` property controls how long to wait before showing a loading spinner, preventing flicker for fast-loading nodes.

```xmlui-pg display copy height="300px" /spinnerDelay/ name="Example: Spinner delay"
<App>
  <VStack gap="$space-3">
    <VStack gap="$space-1">
      <Text variant="strong">No delay (instant spinner)</Text>
      <Tree
        testId="tree1"
        dynamic
        autoLoadAfter="0"
        itemClickExpands
        spinnerDelay="0"
        data='{[{ id: 1, name: "Fast Load (200ms)", parentId: null }]}'
        onLoadChildren="() => { 
          delay(200); 
          return [{ id: 2, name: 'Child', parentId: 1, dynamic: false }]; 
        }">
      </Tree>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">500ms delay (no flicker for fast loads)</Text>
      <Tree
        testId="tree2"
        dynamic
        autoLoadAfter="0"
        itemClickExpands
        spinnerDelay="500"
        data='{[{ id: 3, name: "Fast Load (200ms)", parentId: null }]}'
        onLoadChildren="() => { 
          delay(200); 
          return [{ id: 4, name: 'Child', parentId: 3, dynamic: false }]; 
        }">
      </Tree>
    </VStack>
  </VStack>
</App>
```

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

The `replaceChildren(nodeId, newChildren)` method replaces all children of a node with the specified new children array.

```xmlui-pg display copy height="220px" /replaceChildren/ name="Example: Replace node children"
<App var.version="{1}">
  <VStack gap="$space-2">
    <Tree
      id="tree"
      testId="tree"
      defaultExpanded="all"
      itemClickExpands
      data='{[
        { id: 1, name: "Task List", parentId: null },
        { id: 2, name: "Task A", parentId: 1 },
        { id: 3, name: "Task B", parentId: 1 },
      ]}'>
    </Tree>
    <Button onClick="
      version++;
      tree.replaceChildren(1, [
        { id: `task-${version}-1`, name: `New Task ${version}.1`, parentId: 1 },
        { id: `task-${version}-2`, name: `New Task ${version}.2`, parentId: 1 },
        { id: `task-${version}-3`, name: `New Task ${version}.3`, parentId: 1 },
      ]);
      tree.expandNode(1);
    ">
      Refresh Tasks
    </Button>
  </VStack>
</App>
```

### `replaceNode` [#replacenode]

Replace a node's properties with new data using merge semantics. Properties not specified in nodeData are kept from the original node. Children are only replaced if nodeData specifies them.

**Signature**: `replaceNode(nodeId: string | number, nodeData: any): void`

- `nodeId`: The ID of the node to update
- `nodeData`: The node data object with properties to merge. Uses the format specified in dataFormat and field properties.

```xmlui-pg display copy height="200px" /replaceNode/ name="Example: Update node properties"
<App>
  <VStack gap="$space-2">
    <Tree
      id="tree"
      testId="tree"
      defaultExpanded="all"
      data='{[
        { id: 1, name: "Project Files", parentId: null, icon: "folder" },
        { id: 2, name: "draft.txt", parentId: 1, icon: "warning", status: "draft" },
        { id: 3, name: "notes.txt", parentId: 1, icon: "list" },
      ]}'>
      <property name="itemTemplate">
        <HStack testId="{$item.id}" gap="$space-2">
          <Icon name="{$item.icon}" />
          <Text>{$item.name}</Text>
          <Badge when="{$item.status}">{$item.status}</Badge>
        </HStack>
      </property>
    </Tree>
    <Button onClick="tree.replaceNode(2, { 
      name: 'final.txt', 
      icon: 'checkmark', 
      status: 'published' 
    })">
      Publish Draft
    </Button>
  </VStack>
</App>
```

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
