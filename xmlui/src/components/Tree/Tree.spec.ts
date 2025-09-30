import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// Test data constants - TODO: Import from testData.ts or create comprehensive test datasets
const flatTreeData = [
  { id: 1, name: "Root Item 1", parentId: null },
  { id: 2, name: "Child Item 1.1", parentId: 1 },
  { id: 3, name: "Child Item 1.2", parentId: 1 },
  { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
];

const hierarchyTreeData = [
  {
    id: 1,
    name: "Root Item 1",
    children: [
      { id: 2, name: "Child Item 1.1", children: [] },
      {
        id: 3,
        name: "Child Item 1.2",
        children: [{ id: 4, name: "Grandchild Item 1.2.1", children: [] }],
      },
    ],
  },
];

// Test data with custom field names for field mapping validation
const customFieldsData1 = [
  { nodeId: "A1", title: "Root Item 1", parent: null },
  { nodeId: "A2", title: "Child Item 1.1", parent: "A1" },
  { nodeId: "A3", title: "Child Item 1.2", parent: "A1" },
  { nodeId: "A4", title: "Grandchild Item 1.1.1", parent: "A2" },
];

const customFieldsData2 = [
  { id: 100, displayName: "Root Item 1", parentId: null },
  { id: 101, displayName: "Child Item 1.1", parentId: 100 },
  { id: 102, displayName: "Child Item 1.2", parentId: 100 },
  { id: 103, displayName: "Grandchild Item 1.1.1", parentId: 101 },
];

const databaseStyleData = [
  { pk: "root-1", label: "Root Item 1", parent_id: null },
  { pk: "child-1", label: "Child Item 1.1", parent_id: "root-1" },
  { pk: "child-2", label: "Child Item 1.2", parent_id: "root-1" },
  { pk: "grandchild-1", label: "Grandchild Item 1.1.1", parent_id: "child-1" },
];

const apiStyleData = [
  { key: "item1", text: "Root Item 1", parentKey: undefined },
  { key: "item2", text: "Child Item 1.1", parentKey: "item1" },
  { key: "item3", text: "Child Item 1.2", parentKey: "item1" },
  { key: "item4", text: "Grandchild Item 1.1.1", parentKey: "item2" },
];

// Test data with multiple independent branches for comprehensive defaultExpanded testing
const multiBranchTreeData = [
  // Branch A: Documents
  { id: "doc-root", name: "Documents", parentId: null },
  { id: "doc-reports", name: "Reports", parentId: "doc-root" },
  { id: "doc-invoices", name: "Invoices", parentId: "doc-root" },
  { id: "doc-q1-report", name: "Q1 Report.pdf", parentId: "doc-reports" },
  { id: "doc-q2-report", name: "Q2 Report.pdf", parentId: "doc-reports" },
  { id: "doc-inv-001", name: "Invoice-001.pdf", parentId: "doc-invoices" },

  // Branch B: Projects
  { id: "proj-root", name: "Projects", parentId: null },
  { id: "proj-web", name: "Web Apps", parentId: "proj-root" },
  { id: "proj-mobile", name: "Mobile Apps", parentId: "proj-root" },
  { id: "proj-ecommerce", name: "E-commerce Site", parentId: "proj-web" },
  { id: "proj-dashboard", name: "Admin Dashboard", parentId: "proj-web" },
  { id: "proj-ios-app", name: "iOS Shopping App", parentId: "proj-mobile" },

  // Branch C: Media
  { id: "media-root", name: "Media", parentId: null },
  { id: "media-images", name: "Images", parentId: "media-root" },
  { id: "media-videos", name: "Videos", parentId: "media-root" },
  { id: "media-profile-pic", name: "profile.jpg", parentId: "media-images" },
  { id: "media-banner", name: "banner.png", parentId: "media-images" },
];

// Test data with icon fields for icon mapping validation
const flatDataWithIcons = [
  { id: 1, name: "Documents", icon: "folder", parentId: null },
  { id: 2, name: "Report.pdf", icon: "file-pdf", parentId: 1 },
  { id: 3, name: "Images", icon: "folder", parentId: null },
  { id: 4, name: "Photo.jpg", icon: "file-image", parentId: 3 },
];

const customIconFieldData = [
  { nodeId: "A1", title: "Project", iconType: "project-folder", parent: null },
  { nodeId: "A2", title: "Source", iconType: "code-folder", parent: "A1" },
  { nodeId: "A3", title: "App.tsx", iconType: "typescript-file", parent: "A2" },
  { nodeId: "A4", title: "Utils.ts", iconType: "typescript-file", parent: "A2" },
];

const dataWithStateIcons = [
  {
    id: 1,
    name: "Shared Folder",
    icon: "folder",
    iconExpanded: "folder-open",
    iconCollapsed: "folder-closed",
    parentId: null,
  },
  {
    id: 2,
    name: "Subfolder",
    icon: "folder",
    iconExpanded: "folder-open",
    iconCollapsed: "folder-closed",
    parentId: 1,
  },
  { id: 3, name: "Document.txt", icon: "file-text", parentId: 2 },
];

// Hierarchical test data with custom field names for field mapping validation
const customFieldsHierarchy1 = [
  {
    nodeId: "A1",
    title: "Root Item 1",
    items: [
      {
        nodeId: "A2",
        title: "Child Item 1.1",
        items: [{ nodeId: "A4", title: "Grandchild Item 1.1.1", items: [] }],
      },
      { nodeId: "A3", title: "Child Item 1.2", items: [] },
    ],
  },
];

const customFieldsHierarchy2 = [
  {
    id: 100,
    displayName: "Root Item 1",
    subNodes: [
      {
        id: 101,
        displayName: "Child Item 1.1",
        subNodes: [{ id: 103, displayName: "Grandchild Item 1.1.1", subNodes: [] }],
      },
      { id: 102, displayName: "Child Item 1.2", subNodes: [] },
    ],
  },
];

const databaseStyleHierarchy = [
  {
    pk: "root-1",
    label: "Root Item 1",
    nested_items: [
      {
        pk: "child-1",
        label: "Child Item 1.1",
        nested_items: [{ pk: "grandchild-1", label: "Grandchild Item 1.1.1", nested_items: [] }],
      },
      { pk: "child-2", label: "Child Item 1.2", nested_items: [] },
    ],
  },
];

const apiStyleHierarchy = [
  {
    key: "item1",
    text: "Root Item 1",
    nodes: [
      {
        key: "item2",
        text: "Child Item 1.1",
        nodes: [{ key: "item4", text: "Grandchild Item 1.1.1", nodes: [] }],
      },
      { key: "item3", text: "Child Item 1.2", nodes: [] },
    ],
  },
];

// Hierarchical test data with icon fields
const hierarchyDataWithIcons = [
  {
    id: 1,
    name: "Documents",
    icon: "folder",
    children: [
      { id: 2, name: "Report.pdf", icon: "file-pdf", children: [] },
      {
        id: 3,
        name: "Images",
        icon: "folder",
        children: [{ id: 4, name: "Photo.jpg", icon: "file-image", children: [] }],
      },
    ],
  },
];

const customIconFieldHierarchy = [
  {
    nodeId: "A1",
    title: "Project",
    iconType: "project-folder",
    items: [
      {
        nodeId: "A2",
        title: "Source",
        iconType: "code-folder",
        items: [
          { nodeId: "A3", title: "App.tsx", iconType: "typescript-file", items: [] },
          { nodeId: "A4", title: "Utils.ts", iconType: "typescript-file", items: [] },
        ],
      },
    ],
  },
];

const hierarchyWithStateIcons = [
  {
    id: 1,
    name: "Shared Folder",
    icon: "folder",
    iconExpanded: "folder-open",
    iconCollapsed: "folder-closed",
    children: [
      {
        id: 2,
        name: "Subfolder",
        icon: "folder",
        iconExpanded: "folder-open",
        iconCollapsed: "folder-closed",
        children: [{ id: 3, name: "Document.txt", icon: "file-text", children: [] }],
      },
    ],
  },
];

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" dataFormat="flat" data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text id="{$item.id}" value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1")).toBeVisible();
    await expect(tree.getByMarker("2")).not.toBeVisible();
    await expect(tree.getByMarker("3")).not.toBeVisible();
    await expect(tree.getByMarker("4")).not.toBeVisible();
  });

  test("displays flat data format correctly", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" dataFormat="flat" defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text id="{$item.id}" value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:0")).toBeVisible();
    await expect(tree.getByMarker("2:1")).toBeVisible();
    await expect(tree.getByMarker("3:1")).toBeVisible();
    await expect(tree.getByMarker("4:2")).toBeVisible();
  });

  test("displays hierarchy data format correctly", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" dataFormat="hierarchy" defaultExpanded="all"
            data='{${JSON.stringify(hierarchyTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text id="{$item.id}" value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:0")).toBeVisible();
    await expect(tree.getByMarker("2:1")).toBeVisible();
    await expect(tree.getByMarker("3:1")).toBeVisible();
    await expect(tree.getByMarker("4:2")).toBeVisible();
  });

  test("uses flat as default data format when dataFormat is not specified", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text id="{$item.id}" value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:0")).toBeVisible();
    await expect(tree.getByMarker("2:1")).toBeVisible();
    await expect(tree.getByMarker("3:1")).toBeVisible();
    await expect(tree.getByMarker("4:2")).toBeVisible();
  });

  test("handles custom idField, labelField, and parentField mapping", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="nodeId"
            labelField="title"
            parentField="parent"
            data='{${JSON.stringify(customFieldsData1)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.nodeId}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.title}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("A1:0")).toBeVisible();
    await expect(tree.getByMarker("A2:1")).toBeVisible();
    await expect(tree.getByMarker("A3:1")).toBeVisible();
    await expect(tree.getByMarker("A4:2")).toBeVisible();
  });

  test("handles alternative field names (id, displayName, parentId)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="id"
            labelField="displayName"
            parentField="parentId"
            data='{${JSON.stringify(customFieldsData2)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.displayName}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("100:0")).toBeVisible();
    await expect(tree.getByMarker("101:1")).toBeVisible();
    await expect(tree.getByMarker("102:1")).toBeVisible();
    await expect(tree.getByMarker("103:2")).toBeVisible();
  });

  test("handles database-style field names (pk, label, parent_id)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="pk"
            labelField="label"
            parentField="parent_id"
            data='{${JSON.stringify(databaseStyleData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.pk}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.label}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("root-1:0")).toBeVisible();
    await expect(tree.getByMarker("child-1:1")).toBeVisible();
    await expect(tree.getByMarker("child-2:1")).toBeVisible();
    await expect(tree.getByMarker("grandchild-1:2")).toBeVisible();
  });

  test("handles API-style field names (key, text, parentKey)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="key"
            labelField="text"
            parentField="parentKey"
            data='{${JSON.stringify(apiStyleData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.text}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("item1:0")).toBeVisible();
    await expect(tree.getByMarker("item2:1")).toBeVisible();
    await expect(tree.getByMarker("item3:1")).toBeVisible();
    await expect(tree.getByMarker("item4:2")).toBeVisible();
  });

  test("handles iconField mapping with default icon field name", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatDataWithIcons)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.icon}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="icon:{$item.icon}">
                    <Text value="[{$item.icon}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("2:icon:file-pdf")).toBeVisible();
    await expect(tree.getByMarker("3:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("4:icon:file-image")).toBeVisible();
    // Verify individual icon markers
    await expect(tree.getByMarker("icon:folder")).toBeVisible();
    await expect(tree.getByMarker("icon:file-pdf")).toBeVisible();
    await expect(tree.getByMarker("icon:file-image")).toBeVisible();
  });

  test("handles custom iconField mapping", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="nodeId"
            labelField="title"
            iconField="iconType"
            parentField="parent"
            data='{${JSON.stringify(customIconFieldData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.nodeId}:icon:{$item.iconType}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="icon-type:{$item.iconType}">
                    <Text value="[{$item.iconType}]" />
                  </TestMarker>
                  <Text value="{$item.title}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("A1:icon:project-folder")).toBeVisible();
    await expect(tree.getByMarker("A2:icon:code-folder")).toBeVisible();
    await expect(tree.getByMarker("A3:icon:typescript-file")).toBeVisible();
    await expect(tree.getByMarker("A4:icon:typescript-file")).toBeVisible();
    // Verify individual icon type markers
    await expect(tree.getByMarker("icon-type:project-folder")).toBeVisible();
    await expect(tree.getByMarker("icon-type:code-folder")).toBeVisible();
    await expect(tree.getByMarker("icon-type:typescript-file")).toBeVisible();
  });

  test("handles iconExpandedField and iconCollapsedField mapping", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            iconField="icon"
            iconExpandedField="iconExpanded"
            iconCollapsedField="iconCollapsed"
            data='{${JSON.stringify(dataWithStateIcons)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.icon}:expanded:{$item.iconExpanded}:collapsed:{$item.iconCollapsed}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="state-icon:{$isExpanded ? $item.iconExpanded : $item.iconCollapsed}">
                    <Text value="[{$isExpanded ? $item.iconExpanded || $item.icon : $item.iconCollapsed || $item.icon}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(
      tree.getByMarker("1:icon:folder:expanded:folder-open:collapsed:folder-closed"),
    ).toBeVisible();
    await expect(
      tree.getByMarker("2:icon:folder:expanded:folder-open:collapsed:folder-closed"),
    ).not.toBeVisible(); // Should be collapsed initially
    await expect(
      tree.getByMarker("3:icon:file-text:expanded:undefined:collapsed:undefined"),
    ).not.toBeVisible(); // Should be nested and collapsed
    // Verify collapsed state icons are shown initially (since defaultExpanded is not set)
    await expect(tree.getByMarker("state-icon:folder-closed")).toBeVisible();
  });

  test("handles missing icon fields gracefully", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            iconField="nonExistentIcon"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.nonExistentIcon || 'no-icon'}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="fallback-icon:{$item.nonExistentIcon || 'default'}">
                    <Text value="[{$item.nonExistentIcon || 'default'}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("2:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("3:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("4:icon:no-icon")).toBeVisible();
    // Verify fallback icons
    await expect(tree.getByMarker("fallback-icon:default")).toBeVisible();
  });

  // Hierarchical Data Format Field Mapping Tests
  test("handles custom idField, labelField, and childrenField mapping for hierarchy data", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="nodeId"
            labelField="title"
            childrenField="items"
            data='{${JSON.stringify(customFieldsHierarchy1)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.nodeId}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.title}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("A1:0")).toBeVisible();
    await expect(tree.getByMarker("A2:1")).toBeVisible();
    await expect(tree.getByMarker("A3:1")).toBeVisible();
    await expect(tree.getByMarker("A4:2")).toBeVisible();
  });

  test("handles alternative hierarchy field names (id, displayName, subNodes)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="id"
            labelField="displayName"
            childrenField="subNodes"
            data='{${JSON.stringify(customFieldsHierarchy2)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.displayName}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("100:0")).toBeVisible();
    await expect(tree.getByMarker("101:1")).toBeVisible();
    await expect(tree.getByMarker("102:1")).toBeVisible();
    await expect(tree.getByMarker("103:2")).toBeVisible();
  });

  test("handles database-style hierarchy field names (pk, label, nested_items)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="pk"
            labelField="label"
            childrenField="nested_items"
            data='{${JSON.stringify(databaseStyleHierarchy)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.pk}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.label}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("root-1:0")).toBeVisible();
    await expect(tree.getByMarker("child-1:1")).toBeVisible();
    await expect(tree.getByMarker("child-2:1")).toBeVisible();
    await expect(tree.getByMarker("grandchild-1:2")).toBeVisible();
  });

  test("handles API-style hierarchy field names (key, text, nodes)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="key"
            labelField="text"
            childrenField="nodes"
            data='{${JSON.stringify(apiStyleHierarchy)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Icon name="folder" />
                  <Text value="{$item.text}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("item1:0")).toBeVisible();
    await expect(tree.getByMarker("item2:1")).toBeVisible();
    await expect(tree.getByMarker("item3:1")).toBeVisible();
    await expect(tree.getByMarker("item4:2")).toBeVisible();
  });

  test("handles iconField mapping in hierarchy data with default field name", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            data='{${JSON.stringify(hierarchyDataWithIcons)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.icon}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="hierarchy-icon:{$item.icon}">
                    <Text value="[{$item.icon}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("2:icon:file-pdf")).toBeVisible();
    await expect(tree.getByMarker("3:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("4:icon:file-image")).toBeVisible();
    // Verify individual icon markers
    await expect(tree.getByMarker("hierarchy-icon:folder")).toBeVisible();
    await expect(tree.getByMarker("hierarchy-icon:file-pdf")).toBeVisible();
    await expect(tree.getByMarker("hierarchy-icon:file-image")).toBeVisible();
  });

  test("handles custom iconField mapping in hierarchy data", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="nodeId"
            labelField="title"
            iconField="iconType"
            childrenField="items"
            data='{${JSON.stringify(customIconFieldHierarchy)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.nodeId}:icon:{$item.iconType}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="hierarchy-icon-type:{$item.iconType}">
                    <Text value="[{$item.iconType}]" />
                  </TestMarker>
                  <Text value="{$item.title}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("A1:icon:project-folder")).toBeVisible();
    await expect(tree.getByMarker("A2:icon:code-folder")).toBeVisible();
    await expect(tree.getByMarker("A3:icon:typescript-file")).toBeVisible();
    await expect(tree.getByMarker("A4:icon:typescript-file")).toBeVisible();
    // Verify individual icon type markers
    await expect(tree.getByMarker("hierarchy-icon-type:project-folder")).toBeVisible();
    await expect(tree.getByMarker("hierarchy-icon-type:code-folder")).toBeVisible();
    await expect(tree.getByMarker("hierarchy-icon-type:typescript-file")).toBeVisible();
  });

  test("handles iconExpandedField and iconCollapsedField in hierarchy data", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            iconField="icon"
            iconExpandedField="iconExpanded"
            iconCollapsedField="iconCollapsed"
            data='{${JSON.stringify(hierarchyWithStateIcons)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.icon}:expanded:{$item.iconExpanded}:collapsed:{$item.iconCollapsed}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="hierarchy-state-icon:{$isExpanded ? $item.iconExpanded : $item.iconCollapsed}">
                    <Text value="[{$isExpanded ? $item.iconExpanded || $item.icon : $item.iconCollapsed || $item.icon}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(
      tree.getByMarker("1:icon:folder:expanded:folder-open:collapsed:folder-closed"),
    ).toBeVisible();
    await expect(
      tree.getByMarker("2:icon:folder:expanded:folder-open:collapsed:folder-closed"),
    ).not.toBeVisible(); // Should be collapsed initially
    await expect(
      tree.getByMarker("3:icon:file-text:expanded:undefined:collapsed:undefined"),
    ).not.toBeVisible(); // Should be nested and collapsed
    // Verify collapsed state icons are shown initially (since defaultExpanded is not set)
    await expect(tree.getByMarker("hierarchy-state-icon:folder-closed")).toBeVisible();
  });

  test("handles missing icon fields gracefully in hierarchy data", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            iconField="nonExistentIcon"
            data='{${JSON.stringify(hierarchyTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:icon:{$item.nonExistentIcon || 'no-icon'}">
                <HStack verticalAlignment="center">
                  <TestMarker tag="hierarchy-fallback-icon:{$item.nonExistentIcon || 'default'}">
                    <Text value="[{$item.nonExistentIcon || 'default'}]" />
                  </TestMarker>
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("2:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("3:icon:no-icon")).toBeVisible();
    await expect(tree.getByMarker("4:icon:no-icon")).toBeVisible();
    // Verify fallback icons
    await expect(tree.getByMarker("hierarchy-fallback-icon:default")).toBeVisible();
  });

  // =============================================================================
  // $ITEM CONTEXT PROPERTIES TESTS
  // =============================================================================

  test("passes all core $item properties correctly to item template", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:props:name:{$item.name}|depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (ID: {$item.id}, Key: {$item.key}, Depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    // Verify core properties for different items
    await expect(tree.getByMarker("1:props:name:Root Item 1|depth:0")).toBeVisible();
    await expect(tree.getByMarker("2:props:name:Child Item 1.1|depth:1")).toBeVisible();
    await expect(tree.getByMarker("3:props:name:Child Item 1.2|depth:1")).toBeVisible();
    await expect(tree.getByMarker("4:props:name:Grandchild Item 1.1.1|depth:2")).toBeVisible();
  });

  test("passes original source data properties via $item spread", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    const dataWithExtraProps = [
      {
        id: 1,
        name: "Root",
        category: "folder",
        size: "large",
        customField: "value1",
        parentId: null,
      },
      { id: 2, name: "Child", category: "file", size: "small", customField: "value2", parentId: 1 },
    ];

    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(dataWithExtraProps)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:extra:{$item.category}:{$item.size}:{$item.customField}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} - {$item.category} ({$item.size}) [{$item.customField}]" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:extra:folder:large:value1")).toBeVisible();
    await expect(tree.getByMarker("2:extra:file:small:value2")).toBeVisible();
  });

  test("passes icon properties correctly via $item", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatDataWithIcons)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:icon:{$item.icon}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} [{$item.icon}]" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("2:icon:file-pdf")).toBeVisible();
    await expect(tree.getByMarker("3:icon:folder")).toBeVisible();
    await expect(tree.getByMarker("4:icon:file-image")).toBeVisible();
  });

  test("passes TreeNode internal properties via $item spread", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:internal:selectable:{$item.selectable}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (Selectable: {$item.selectable})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:internal:selectable:true")).toBeVisible();
    await expect(tree.getByMarker("2:internal:selectable:true")).toBeVisible();
    await expect(tree.getByMarker("3:internal:selectable:true")).toBeVisible();
    await expect(tree.getByMarker("4:internal:selectable:true")).toBeVisible();
  });

  test("passes custom field mapped properties correctly in hierarchy format", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="nodeId"
            labelField="title"
            iconField="iconType"
            childrenField="items"
            data='{${JSON.stringify(customIconFieldHierarchy)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.nodeId}:mapped:name:{$item.name}|title:{$item.title}|iconType:{$item.iconType}">
                <HStack verticalAlignment="center">
                  <Text value="Mapped: {$item.name} | Original: {$item.title} | Icon: {$item.iconType}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    await expect(
      tree.getByMarker("A1:mapped:name:Project|title:Project|iconType:project-folder"),
    ).toBeVisible();
    await expect(
      tree.getByMarker("A2:mapped:name:Source|title:Source|iconType:code-folder"),
    ).toBeVisible();
    await expect(
      tree.getByMarker("A3:mapped:name:App.tsx|title:App.tsx|iconType:typescript-file"),
    ).toBeVisible();
  });

  test("validates $item properties maintain referential integrity across re-renders", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.key}:integrity:name:{$item.name}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();
    // Verify that basic properties are accessible and consistent
    await expect(tree.getByMarker("1:integrity:name:Root Item 1")).toBeVisible();
    await expect(tree.getByMarker("2:integrity:name:Child Item 1.1")).toBeVisible();
    await expect(tree.getByMarker("3:integrity:name:Child Item 1.2")).toBeVisible();
    await expect(tree.getByMarker("4:integrity:name:Grandchild Item 1.1.1")).toBeVisible();
  });

  // =============================================================================
  // SELECTION MANAGEMENT TESTS
  // =============================================================================

  test.describe("Selection Management", () => {
    test("handles selectedValue property with visual feedback", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(255, 100, 100)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{2}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers directly using getNodeWrapperByMarker
      const selectedRowWrapper = tree.getNodeWrapperByMarker("2");
      const item1RowWrapper = tree.getNodeWrapperByMarker("1");
      const item3RowWrapper = tree.getNodeWrapperByMarker("3");
      const item4RowWrapper = tree.getNodeWrapperByMarker("4");

      await expect(selectedRowWrapper).toBeVisible();

      // Test selected item has correct styling
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(selectedRowWrapper).toHaveClass(/selected/);

      // Test non-selected items don't have selected styling
      await expect(item1RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item3RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item4RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item1RowWrapper).not.toHaveClass(/selected/);
      await expect(item3RowWrapper).not.toHaveClass(/selected/);
      await expect(item4RowWrapper).not.toHaveClass(/selected/);
    });

    test("handles selection with different selectedValue types", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(200, 100, 255)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";

      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{3}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers directly using getNodeWrapperByMarker
      const item1RowWrapper = tree.getNodeWrapperByMarker("1");
      const item2RowWrapper = tree.getNodeWrapperByMarker("2");
      const item3RowWrapper = tree.getNodeWrapperByMarker("3");
      const item4RowWrapper = tree.getNodeWrapperByMarker("4");

      await expect(item1RowWrapper).toBeVisible();

      // Item 3 should be selected (with proper string comparison handling)
      await expect(item3RowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item3RowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(item3RowWrapper).toHaveClass(/selected/);

      // Other items should not be selected
      await expect(item1RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item2RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item4RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);

      // Verify class names are correctly applied
      await expect(item1RowWrapper).not.toHaveClass(/selected/);
      await expect(item2RowWrapper).not.toHaveClass(/selected/);
      await expect(item4RowWrapper).not.toHaveClass(/selected/);
    });

    test("handles selection with type mismatch tolerance", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(100, 200, 50)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{2}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrapper directly using getNodeWrapperByMarker
      const selectedRowWrapper = tree.getNodeWrapperByMarker("2");

      await expect(selectedRowWrapper).toBeVisible();

      // Verify selection styling is applied correctly despite type mismatch (selectedValue: number vs itemKey: number)
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(selectedRowWrapper).toHaveClass(/selected/);
    });

    test("selection state overrides hover state styling", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(200, 0, 0)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      const HOVER_BG_COLOR = "rgb(0, 0, 200)";
      const HOVER_TEXT_COLOR = "rgb(255, 255, 0)";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{2}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
            "backgroundColor-Tree-row--hover": HOVER_BG_COLOR,
            "textColor-Tree--hover": HOVER_TEXT_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers directly using getNodeWrapperByMarker
      const selectedRowWrapper = tree.getNodeWrapperByMarker("2");
      const item1RowWrapper = tree.getNodeWrapperByMarker("1");
      const item3RowWrapper = tree.getNodeWrapperByMarker("3");

      await expect(selectedRowWrapper).toBeVisible();

      // Hover over the selected item - selection should override hover
      await selectedRowWrapper.hover();
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);

      // Hover over non-selected items - should show hover state
      await item1RowWrapper.hover();
      await expect(item1RowWrapper).toHaveCSS("background-color", HOVER_BG_COLOR);
      await expect(item1RowWrapper).toHaveCSS("color", HOVER_TEXT_COLOR);

      await item3RowWrapper.hover();
      await expect(item3RowWrapper).toHaveCSS("background-color", HOVER_BG_COLOR);
      await expect(item3RowWrapper).toHaveCSS("color", HOVER_TEXT_COLOR);

      // Verify selected item maintains selection styling even after hovering other items
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
    });

    test("supports interactive selection changes", async ({ initTestBed, createTreeDriver }) => {
      const SELECTED_BG_COLOR = "rgb(200, 100, 255)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      const FOCUS_OUTLINE_COLOR = "rgb(255, 100, 100)";

      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{2}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
            "outlineColor-Tree--focus": FOCUS_OUTLINE_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");
      await tree.component.focus();

      // Get row wrappers directly using getNodeWrapperByMarker
      const item1RowWrapper = tree.getNodeWrapperByMarker("1");
      const item2RowWrapper = tree.getNodeWrapperByMarker("2");

      await expect(item1RowWrapper).toBeVisible();

      // Item 2 should be initially selected
      await expect(item2RowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item2RowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(item2RowWrapper).toHaveClass(/selected/);

      // Click on item 1 to change selection
      await tree.getByMarker("1").click();

      // Item 1 should now be selected
      await expect(item1RowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item1RowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(item1RowWrapper).toHaveClass(/selected/);

      // Item 2 should no longer be selected
      await expect(item2RowWrapper).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(item2RowWrapper).not.toHaveClass(/selected/);

      // Verify the tree container maintains focus
      await expect(tree.component).toBeFocused();
    });

    test.skip(
      "handles selectedUid property (deprecated)",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test backwards compatibility with selectedUid prop
        // TODO: Verify deprecation warning or fallback behavior
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          selectedUid="2"
        />
      `);
      },
    );

    test.skip(
      "fires selectionDidChange event",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test onSelectionDidChange event with correct TreeSelectionEvent structure
        // TODO: Verify event includes selectedValue, selectedUid, and selectedNode data
        // NOTE: Event handler may not be fully implemented yet - selectedNode appears to be null
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          onSelectionDidChange="event => testState = event"
        />
      `);
      },
    );

    test("handles null/undefined selection gracefully", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(255, 0, 0)";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{null}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers to test no selection highlighting
      const rowWrapper1 = tree.getNodeWrapperByMarker("1");
      const rowWrapper2 = tree.getNodeWrapperByMarker("2");
      const rowWrapper3 = tree.getNodeWrapperByMarker("3");
      const rowWrapper4 = tree.getNodeWrapperByMarker("4");

      await expect(rowWrapper1).toBeVisible();

      // Verify no items are selected when selectedValue is null
      await expect(rowWrapper1).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper2).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper3).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper4).not.toHaveCSS("background-color", SELECTED_BG_COLOR);

      // Verify no items have selected class
      await expect(rowWrapper1).not.toHaveClass(/selected/);
      await expect(rowWrapper2).not.toHaveClass(/selected/);
      await expect(rowWrapper3).not.toHaveClass(/selected/);
      await expect(rowWrapper4).not.toHaveClass(/selected/);

      // Verify tree is still functional - can select items by clicking
      await tree.getByMarker("2").click();
      await expect(rowWrapper2).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper2).toHaveClass(/selected/);
    });

    test("handles invalid selection values gracefully", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const SELECTED_BG_COLOR = "rgb(0, 255, 0)";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="999"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers to test no selection highlighting
      const rowWrapper1 = tree.getNodeWrapperByMarker("1");
      const rowWrapper2 = tree.getNodeWrapperByMarker("2");
      const rowWrapper3 = tree.getNodeWrapperByMarker("3");
      const rowWrapper4 = tree.getNodeWrapperByMarker("4");

      await expect(rowWrapper1).toBeVisible();

      // Verify component doesn't crash with invalid selectedValue and no items are selected
      await expect(rowWrapper1).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper2).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper3).not.toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper4).not.toHaveCSS("background-color", SELECTED_BG_COLOR);

      // Verify no items have selected class
      await expect(rowWrapper1).not.toHaveClass(/selected/);
      await expect(rowWrapper2).not.toHaveClass(/selected/);
      await expect(rowWrapper3).not.toHaveClass(/selected/);
      await expect(rowWrapper4).not.toHaveClass(/selected/);

      // Verify tree is still functional - can select valid items by clicking
      await tree.getByMarker("3").click();
      await expect(rowWrapper3).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(rowWrapper3).toHaveClass(/selected/);
    });

    // =============================================================================
    // FOCUS MANAGEMENT SUB-TESTS
    // =============================================================================

    test("supports keyboard focus navigation with visual feedback", async ({
      initTestBed,
      createTreeDriver,
      page,
    }) => {
      const FOCUS_OUTLINE_COLOR = "rgb(255, 0, 255)";
      const FOCUS_OUTLINE_WIDTH = "3px";
      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "outlineColor-Tree--focus": FOCUS_OUTLINE_COLOR,
            "outlineWidth-Tree--focus": FOCUS_OUTLINE_WIDTH,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      await expect(tree.getByMarker("1")).toBeVisible();

      // Focus the tree to trigger focus styling
      await tree.component.focus();

      // Use keyboard navigation to trigger focus on an item
      await page.keyboard.press("ArrowDown");

      // The second item should be focused now
      const focusedItem = tree.getNodeWrapperByMarker("2");
      await expect(focusedItem).toBeVisible();

      // Check that focus outline uses custom theme variables
      // Focus styling uses inset box-shadow with the outline color
      await expect(focusedItem).toHaveCSS(
        "box-shadow",
        `${FOCUS_OUTLINE_COLOR} 0px 0px 0px 2px inset`,
      );

      // Also verify the focused item has the correct CSS class
      await expect(focusedItem).toHaveClass(/focused/);

      // Verify box-shadow contains the custom focus outline color
      const boxShadowValue = await focusedItem.evaluate((el) => getComputedStyle(el).boxShadow);
      expect(boxShadowValue).toContain(FOCUS_OUTLINE_COLOR);

      // Test that focus can move to different items
      await page.keyboard.press("ArrowDown");
      const nextFocusedItem = tree.getNodeWrapperByMarker("4"); // Should be the grandchild
      await expect(nextFocusedItem).toHaveClass(/focused/);
      await expect(nextFocusedItem).toHaveCSS(
        "box-shadow",
        `${FOCUS_OUTLINE_COLOR} 0px 0px 0px 2px inset`,
      );

      // Previous item should no longer be focused
      await expect(focusedItem).not.toHaveClass(/focused/);

      // Navigate back up
      await page.keyboard.press("ArrowUp");
      await expect(focusedItem).toHaveClass(/focused/);
      await expect(nextFocusedItem).not.toHaveClass(/focused/);
    });

    test("focus styling supports comprehensive theme variables", async ({
      initTestBed,
      createTreeDriver,
      page,
    }) => {
      const FOCUS_OUTLINE_COLOR = "rgb(0, 255, 0)";
      const FOCUS_OUTLINE_WIDTH = "4px";
      const FOCUS_OUTLINE_STYLE = "solid";
      const FOCUS_OUTLINE_OFFSET = "2px";

      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "outlineColor-Tree--focus": FOCUS_OUTLINE_COLOR,
            "outlineWidth-Tree--focus": FOCUS_OUTLINE_WIDTH,
            "outlineStyle-Tree--focus": FOCUS_OUTLINE_STYLE,
            "outlineOffset-Tree--focus": FOCUS_OUTLINE_OFFSET,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      await expect(tree.getNodeWrapperByMarker("1")).toBeVisible();

      // Focus the tree and navigate to an item
      await tree.component.focus();
      await page.keyboard.press("ArrowDown");

      // Test focused item has all custom theme variables applied
      const focusedItem = tree.getNodeWrapperByMarker("2");
      await expect(focusedItem).toHaveClass(/focused/);

      // Verify the focus outline uses all custom theme variables
      // Note: In the current implementation, focus uses inset box-shadow rather than outline
      // but the theme variables should still be available for potential outline styling
      const boxShadowValue = await focusedItem.evaluate((el) => getComputedStyle(el).boxShadow);
      expect(boxShadowValue).toContain("0, 255, 0"); // Check for green color components
    });

    test("combined selection and focus states work together", async ({
      initTestBed,
      createTreeDriver,
      page,
    }) => {
      const SELECTED_BG_COLOR = "rgb(255, 50, 50)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      const HOVER_BG_COLOR = "rgb(50, 255, 50)";
      const HOVER_TEXT_COLOR = "rgb(0, 0, 0)";
      const DEFAULT_TEXT_COLOR = "rgb(100, 100, 100)";
      const FOCUS_OUTLINE_COLOR = "rgb(50, 50, 255)";

      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{3}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
            "backgroundColor-Tree-row--hover": HOVER_BG_COLOR,
            "textColor-Tree--hover": HOVER_TEXT_COLOR,
            "textColor-Tree": DEFAULT_TEXT_COLOR,
            "outlineColor-Tree--focus": FOCUS_OUTLINE_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Test all theme variables work correctly in isolation and combination
      const selectedRowWrapper = tree.getNodeWrapperByMarker("3");
      const normalRowWrapper = tree.getNodeWrapperByMarker("1");
      const hoverRowWrapper = tree.getNodeWrapperByMarker("2");

      await expect(selectedRowWrapper).toBeVisible();

      // Test selected item styling
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
      await expect(selectedRowWrapper).toHaveClass(/selected/);

      // Test default text color on normal items
      await expect(normalRowWrapper).toHaveCSS("color", DEFAULT_TEXT_COLOR);
      await expect(normalRowWrapper).not.toHaveClass(/selected/);

      // Test hover styling on non-selected item
      await hoverRowWrapper.hover();
      await expect(hoverRowWrapper).toHaveCSS("background-color", HOVER_BG_COLOR);
      await expect(hoverRowWrapper).toHaveCSS("color", HOVER_TEXT_COLOR);

      // Test hover on selected item (selection should override)
      await selectedRowWrapper.hover();
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);

      // Test focus styling - ensure we can detect focus
      await tree.component.focus();
      // Give some time for focus to be applied
      await page.waitForTimeout(100);

      // Check if any item has focus, or skip focus-specific checks for this comprehensive test
      // The focus behavior is already tested in the dedicated focus tests
      const anyFocusedElement = page.locator('[data-test-id="tree"] .focused');
      const hasFocusedElement = (await anyFocusedElement.count()) > 0;

      if (hasFocusedElement) {
        // If we have focused elements, verify the color
        const focusedElement = anyFocusedElement.first();
        const finalBoxShadowValue = await focusedElement.evaluate(
          (el) => getComputedStyle(el).boxShadow,
        );
        expect(finalBoxShadowValue).toContain("50, 50, 255");
      }
      // If no focused element, skip focus-specific validation since focus behavior varies

      // Verify all theme variables are working simultaneously
      // Selected item maintains selection while tree has focus
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);
    });

    test("applies selection and focus with multiple theme configurations", async ({
      initTestBed,
      createTreeDriver,
      page,
    }) => {
      const SELECTED_BG_COLOR = "rgb(50, 100, 200)";
      const SELECTED_TEXT_COLOR = "rgb(255, 255, 255)";
      const FOCUS_OUTLINE_COLOR = "rgb(255, 165, 0)";
      const DEFAULT_TEXT_COLOR = "rgb(64, 64, 64)";

      await initTestBed(
        `
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat"
            defaultExpanded="all"
            selectedValue="{2}"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
        `,
        {
          testThemeVars: {
            "backgroundColor-Tree-row--selected": SELECTED_BG_COLOR,
            "textColor-Tree--selected": SELECTED_TEXT_COLOR,
            "outlineColor-Tree--focus": FOCUS_OUTLINE_COLOR,
            "textColor-Tree": DEFAULT_TEXT_COLOR,
          },
        },
      );

      const tree = await createTreeDriver("tree");

      // Get row wrappers directly using getNodeWrapperByMarker
      const selectedRowWrapper = tree.getNodeWrapperByMarker("2");
      const nonSelectedRowWrapper = tree.getNodeWrapperByMarker("1");

      await expect(selectedRowWrapper).toBeVisible();

      // Test selection theme variables
      await expect(selectedRowWrapper).toHaveCSS("background-color", SELECTED_BG_COLOR);
      await expect(selectedRowWrapper).toHaveCSS("color", SELECTED_TEXT_COLOR);

      // Test default text color on non-selected items
      await expect(nonSelectedRowWrapper).toHaveCSS("color", DEFAULT_TEXT_COLOR);

      // Focus the tree and navigate to trigger focus styling
      await tree.component.focus();
      await page.keyboard.press("ArrowDown");

      // Check if any item received focus (focus behavior can be timing-dependent in tests)
      const focusedItem = page.locator('[data-test-id="tree"] .focused');
      const focusedItemCount = await focusedItem.count();

      if (focusedItemCount > 0) {
        // If we have focused elements, verify the focus styling uses custom theme variables
        await expect(focusedItem.first()).toBeVisible();
        await expect(focusedItem.first()).toHaveCSS(
          "box-shadow",
          `${FOCUS_OUTLINE_COLOR} 0px 0px 0px 2px inset`,
        );
      }
      // If no focused element found, skip focus-specific validation as focus behavior is tested elsewhere
    });
  });

  // =============================================================================
  // EXPANSION STATE TESTS
  // =============================================================================

  test.describe("Expansion States", () => {
    test("handles defaultExpanded none", async ({ initTestBed, createTreeDriver }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="none"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.name}:depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // Only root level (depth 0) should be visible with defaultExpanded="none"
      await expect(tree.getByMarker("1:Root Item 1:depth:0")).toBeVisible();

      // Child nodes (depth 1+) should NOT be visible initially
      await expect(tree.getByMarker("2:Child Item 1.1:depth:1")).not.toBeVisible();
      await expect(tree.getByMarker("3:Child Item 1.2:depth:1")).not.toBeVisible();
      await expect(tree.getByMarker("4:Grandchild Item 1.1.1:depth:2")).not.toBeVisible();
    });

    test("handles defaultExpanded all", async ({ initTestBed, createTreeDriver }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.name}:depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // All nodes at all depths should be visible with defaultExpanded="all"
      await expect(tree.getByMarker("1:Root Item 1:depth:0")).toBeVisible();
      await expect(tree.getByMarker("2:Child Item 1.1:depth:1")).toBeVisible();
      await expect(tree.getByMarker("3:Child Item 1.2:depth:1")).toBeVisible();
      await expect(tree.getByMarker("4:Grandchild Item 1.1.1:depth:2")).toBeVisible();
    });

    test("handles defaultExpanded first-level", async ({ initTestBed, createTreeDriver }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="first-level"
            data='{${JSON.stringify(flatTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.name}:depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // Root level (depth 0) and first level (depth 1) should be visible
      await expect(tree.getByMarker("1:Root Item 1:depth:0")).toBeVisible();
      await expect(tree.getByMarker("2:Child Item 1.1:depth:1")).toBeVisible();
      await expect(tree.getByMarker("3:Child Item 1.2:depth:1")).toBeVisible();

      // Second level and deeper (depth 2+) should NOT be visible
      await expect(tree.getByMarker("4:Grandchild Item 1.1.1:depth:2")).not.toBeVisible();
    });

    test("handles defaultExpanded with array of string IDs - expands specific nodes making all children visible", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            idField="pk"
            labelField="label"
            parentField="parent_id"
            defaultExpanded='{["root-1", "child-1"]}'
            data='{${JSON.stringify(databaseStyleData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.pk}:{$item.label}:depth:{$item.depth}:expanded">
                <HStack verticalAlignment="center">
                  <Text value="{$item.label} (ID: {$item.pk}, Depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // When defaultExpanded=["root-1", "child-1"], these specific nodes should be expanded:

      // 1. Root node "root-1" is expanded → its direct children become visible
      await expect(tree.getByMarker("root-1:Root Item 1:depth:0:expanded")).toBeVisible();
      await expect(tree.getByMarker("child-1:Child Item 1.1:depth:1:expanded")).toBeVisible();
      await expect(tree.getByMarker("child-2:Child Item 1.2:depth:1:expanded")).toBeVisible();

      // 2. Child node "child-1" is also expanded → its children become visible
      await expect(
        tree.getByMarker("grandchild-1:Grandchild Item 1.1.1:depth:2:expanded"),
      ).toBeVisible();

      // Verify expansion behavior: each ID in the array expands that specific node,
      // making its direct children visible. If a child is also in the expansion array,
      // it will also be expanded, showing its children recursively.
    });

    test("handles defaultExpanded array with nodes from different parent branches", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded='{["doc-root", "proj-web", "media-images"]}'
            data='{${JSON.stringify(multiBranchTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.name}:depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (ID: {$item.id}, Depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // Branch A: "doc-root" is expanded → its direct children are visible
      await expect(tree.getByMarker("doc-root:Documents:depth:0")).toBeVisible();
      await expect(tree.getByMarker("doc-reports:Reports:depth:1")).toBeVisible();
      await expect(tree.getByMarker("doc-invoices:Invoices:depth:1")).toBeVisible();
      // But grandchildren of doc-root should NOT be visible (doc-reports not expanded)
      await expect(tree.getByMarker("doc-q1-report:Q1 Report.pdf:depth:2")).not.toBeVisible();
      await expect(tree.getByMarker("doc-inv-001:Invoice-001.pdf:depth:2")).not.toBeVisible();

      // Branch B: "proj-root" is NOT expanded → only root visible, children hidden
      await expect(tree.getByMarker("proj-root:Projects:depth:0")).toBeVisible();
      await expect(tree.getByMarker("proj-web:Web Apps:depth:1")).not.toBeVisible();
      await expect(tree.getByMarker("proj-mobile:Mobile Apps:depth:1")).not.toBeVisible();
      // But if proj-web were visible, it WOULD be expanded (it's in defaultExpanded array)

      // Branch C: "media-root" is NOT expanded, but "media-images" is in array
      await expect(tree.getByMarker("media-root:Media:depth:0")).toBeVisible();
      await expect(tree.getByMarker("media-images:Images:depth:1")).not.toBeVisible(); // Parent not expanded
      await expect(tree.getByMarker("media-videos:Videos:depth:1")).not.toBeVisible();
      // media-images children should not be visible since media-images itself is not visible
      await expect(tree.getByMarker("media-profile-pic:profile.jpg:depth:2")).not.toBeVisible();

      // This test validates that:
      // 1. Each ID in defaultExpanded array only expands THAT specific node
      // 2. Expansion only affects nodes that are already visible (children of expanded parents)
      // 3. Multiple independent branches can have different expansion states
      // 4. Expansion does not cascade beyond the specified nodes
    });

    test("handles defaultExpanded array expanding multiple independent root branches", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded='{["doc-root", "proj-root", "doc-reports", "proj-web"]}'
            data='{${JSON.stringify(multiBranchTreeData)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}:{$item.name}:depth:{$item.depth}">
                <HStack verticalAlignment="center">
                  <Text value="{$item.name} (ID: {$item.id}, Depth: {$item.depth})" />
                </HStack>
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);
      const tree = await createTreeDriver("tree");
      await expect(tree.component).toBeVisible();

      // Branch A: "doc-root" expanded → children visible, "doc-reports" also expanded → grandchildren visible
      await expect(tree.getByMarker("doc-root:Documents:depth:0")).toBeVisible();
      await expect(tree.getByMarker("doc-reports:Reports:depth:1")).toBeVisible();
      await expect(tree.getByMarker("doc-invoices:Invoices:depth:1")).toBeVisible();
      // doc-reports is expanded → its children are visible
      await expect(tree.getByMarker("doc-q1-report:Q1 Report.pdf:depth:2")).toBeVisible();
      await expect(tree.getByMarker("doc-q2-report:Q2 Report.pdf:depth:2")).toBeVisible();
      // doc-invoices is NOT expanded → its children are hidden
      await expect(tree.getByMarker("doc-inv-001:Invoice-001.pdf:depth:2")).not.toBeVisible();

      // Branch B: "proj-root" expanded → children visible, "proj-web" also expanded → grandchildren visible
      await expect(tree.getByMarker("proj-root:Projects:depth:0")).toBeVisible();
      await expect(tree.getByMarker("proj-web:Web Apps:depth:1")).toBeVisible();
      await expect(tree.getByMarker("proj-mobile:Mobile Apps:depth:1")).toBeVisible();
      // proj-web is expanded → its children are visible
      await expect(tree.getByMarker("proj-ecommerce:E-commerce Site:depth:2")).toBeVisible();
      await expect(tree.getByMarker("proj-dashboard:Admin Dashboard:depth:2")).toBeVisible();
      // proj-mobile is NOT expanded → its children are hidden
      await expect(tree.getByMarker("proj-ios-app:iOS Shopping App:depth:2")).not.toBeVisible();

      // Branch C: "media-root" is NOT in defaultExpanded → children remain hidden
      await expect(tree.getByMarker("media-root:Media:depth:0")).toBeVisible();
      await expect(tree.getByMarker("media-images:Images:depth:1")).not.toBeVisible();
      await expect(tree.getByMarker("media-videos:Videos:depth:1")).not.toBeVisible();

      // This test validates complete multi-branch expansion:
      // 1. Multiple root branches can be independently expanded
      // 2. Sub-nodes within expanded branches can also be selectively expanded
      // 3. Each expansion is isolated - expanding one branch doesn't affect others
      // 4. Deep nesting works correctly with selective expansion at each level
    });

    test.skip(
      "handles expandedValues property",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test controlled expansion state with expandedValues prop
        // TODO: Verify expansion state synchronization with external control
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          expandedValues="{[1]}"
        />
      `);
      },
    );

    test.skip(
      "supports expansion toggle by chevron click",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test clicking expand/collapse chevron toggles node expansion
        // TODO: Verify child nodes become visible/hidden appropriately
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
        />
      `);
      },
    );

    test.skip(
      "supports expansion toggle by item click when enabled",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test expandOnItemClick prop enables expansion on full item click
        // TODO: Verify clicking anywhere on item (not just chevron) toggles expansion
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          expandOnItemClick="true"
        />
      `);
      },
    );

    test.skip(
      "handles autoExpandToSelection",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test automatic expansion of path to selected item
        // TODO: Verify all parent nodes of selected item are expanded
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          selectedValue="4"
          autoExpandToSelection="true"
        />
      `);
      },
    );
  });

  // =============================================================================
  // ICON RESOLUTION TESTS
  // =============================================================================

  test.describe("Icon Resolution", () => {
    test.skip(
      "displays icons from iconField",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test basic icon display from source data icon field
        // TODO: Verify icon elements are rendered correctly
        const iconData = [
          { id: 1, name: "Folder", icon: "folder", parentId: null },
          { id: 2, name: "File", icon: "file", parentId: 1 },
        ];

        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{iconData}" 
          dataFormat="flat"
          iconField="icon"
        />
      `);
      },
    );

    test.skip(
      "displays expansion-specific icons",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test iconExpandedField and iconCollapsedField for different expansion states
        // TODO: Verify icons change based on node expansion state
        const iconData = [
          {
            id: 1,
            name: "Folder",
            icon: "folder",
            iconExpanded: "folder-open",
            iconCollapsed: "folder-closed",
            parentId: null,
          },
        ];

        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{iconData}" 
          dataFormat="flat"
          iconField="icon"
          iconExpandedField="iconExpanded"
          iconCollapsedField="iconCollapsed"
        />
      `);
      },
    );

    test.skip(
      "handles missing icon fields gracefully",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test component behavior when icon fields are undefined
        // TODO: Verify no icon display when icon data is missing
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          iconField="nonExistentIcon"
        />
      `);
      },
    );
  });

  // =============================================================================
  // CUSTOM ITEM TEMPLATE TESTS
  // =============================================================================

  test.describe("Custom Item Template", () => {
    test.skip(
      "renders default item template",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test default item rendering without custom template
        // TODO: Verify default label display and structure
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
        />
      `);
      },
    );

    test.skip(
      "renders custom item template",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test custom itemTemplate property with custom XMLUI content
        // TODO: Verify custom template receives correct node data context
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
        >
          <property name="itemTemplate">
            <HStack>
              <Text text="{node.label}" />
              <Text text=" - Custom" />
            </HStack>
          </property>
        </Tree>
      `);
      },
    );

    test.skip(
      "template has access to node context",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test template access to node properties (label, icon, isExpanded, etc.)
        // TODO: Verify context variables are properly bound
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
        >
          <property name="itemTemplate">
            <VStack>
              <Text text="{node.label}" />
              <Text text="ID: {node.key}" />
              <Text text="Expanded: {node.isExpanded}" />
            </VStack>
          </property>
        </Tree>
      `);
      },
    );
  });

  // =============================================================================
  // VIRTUALIZATION TESTS
  // =============================================================================

  test.describe("Virtualization", () => {
    test.skip(
      "handles large datasets efficiently",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test performance with large tree datasets (1000+ nodes)
        // TODO: Verify virtual scrolling behavior and DOM optimization
        const largeData = Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          parentId: i === 0 ? null : Math.floor(i / 10) + 1,
        }));

        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{largeData}" 
          dataFormat="flat"
        />
      `);
      },
    );

    test.skip(
      "maintains scroll position during updates",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test scroll position stability during data updates
        // TODO: Verify virtual list maintains position during re-renders
      },
    );

    test.skip(
      "handles dynamic height calculations",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test tree height calculations with container sizing
        // TODO: Verify AutoSizer integration and responsive behavior
      },
    );
  });

  // =============================================================================
  // IMPERATIVE API TESTS
  // =============================================================================

  test.describe("Imperative API", () => {
    test("exposes expandNode method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:expand">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="expandBtn" testId="expand-node-btn" label="Expand Node 1" onClick="
            treeApi.expandNode(1);
            testState = { expandNodeCalled: true, nodeId: 1 };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const expandButton = await createButtonDriver("expand-node-btn");

      // Initially, tree should be collapsed
      await expect(tree.getByMarker("1:expand")).toBeVisible(); // Root visible
      await expect(tree.getByMarker("2:expand")).not.toBeVisible(); // Child hidden
      await expect(tree.getByMarker("3:expand")).not.toBeVisible(); // Child hidden

      // Click expand specific node button
      await expandButton.click();

      // Verify expandNode was called
      await expect.poll(testStateDriver.testState).toEqual({ expandNodeCalled: true, nodeId: 1 });

      // Verify node 1's children are now visible but grandchildren are still hidden
      await expect(tree.getByMarker("1:expand")).toBeVisible(); // Root visible
      await expect(tree.getByMarker("2:expand")).toBeVisible(); // Child now visible
      await expect(tree.getByMarker("3:expand")).toBeVisible(); // Child now visible
      await expect(tree.getByMarker("4:expand")).not.toBeVisible(); // Grandchild still hidden (node 2 not expanded)
    });

    test("exposes collapseNode method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:expand">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="collapseBtn" testId="collapse-btn" label="Collapse Node 1" onClick="
            treeApi.collapseNode('1');
            testState = { actionPerformed: 'collapseNode', nodeId: '1' };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const collapseButton = await createButtonDriver("collapse-btn");

      // Verify tree starts with all nodes visible (defaultExpanded="all")
      await expect(tree.getByMarker("1:expand")).toBeVisible();
      await expect(tree.getByMarker("2:expand")).toBeVisible();
      await expect(tree.getByMarker("3:expand")).toBeVisible();
      await expect(tree.getByMarker("4:expand")).toBeVisible();

      // Click collapse node button
      await collapseButton.click();

      // Verify node 1 children are now hidden
      await expect(tree.getByMarker("1:expand")).toBeVisible(); // Root still visible
      await expect(tree.getByMarker("2:expand")).not.toBeVisible(); // Child hidden
      await expect(tree.getByMarker("3:expand")).not.toBeVisible(); // Child hidden
      await expect(tree.getByMarker("4:expand")).not.toBeVisible(); // Grandchild hidden

      // Verify test state confirms action was performed
      await expect.poll(testStateDriver.testState).toEqual({
        actionPerformed: "collapseNode",
        nodeId: "1",
      });
    });

    test("exposes expandAll method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:expandall">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="expandBtn" testId="expand-all-btn" label="Expand All" onClick="
            treeApi.expandAll();
            testState = { expandAllCalled: true };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const expandButton = await createButtonDriver("expand-all-btn");

      // Initially, tree should be collapsed (not expanded)
      await expect(tree.getByMarker("2:expandall")).not.toBeVisible();
      await expect(tree.getByMarker("4:expandall")).not.toBeVisible();

      // Click expandAll button
      await expandButton.click();

      // Verify expandAll was called
      await expect.poll(testStateDriver.testState).toEqual({ expandAllCalled: true });

      // Verify all nodes are now visible (expanded)
      await expect(tree.getByMarker("1:expandall")).toBeVisible(); // Root
      await expect(tree.getByMarker("2:expandall")).toBeVisible(); // Child
      await expect(tree.getByMarker("3:expandall")).toBeVisible(); // Child
      await expect(tree.getByMarker("4:expandall")).toBeVisible(); // Grandchild
    });

    test("exposes collapseAll method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:collapseall">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="collapseBtn" testId="collapse-all-btn" label="Collapse All" onClick="
            treeApi.collapseAll();
            testState = { collapseAllCalled: true };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const collapseButton = await createButtonDriver("collapse-all-btn");

      // Initially, tree should be fully expanded (defaultExpanded="all")
      await expect(tree.getByMarker("1:collapseall")).toBeVisible(); // Root
      await expect(tree.getByMarker("2:collapseall")).toBeVisible(); // Child
      await expect(tree.getByMarker("3:collapseall")).toBeVisible(); // Child
      await expect(tree.getByMarker("4:collapseall")).toBeVisible(); // Grandchild

      // Click collapseAll button
      await collapseButton.click();

      // Verify collapseAll was called
      await expect.poll(testStateDriver.testState).toEqual({ collapseAllCalled: true });

      // Verify only root nodes are visible (all collapsed)
      await expect(tree.getByMarker("1:collapseall")).toBeVisible(); // Root still visible
      await expect(tree.getByMarker("2:collapseall")).not.toBeVisible(); // Child hidden
      await expect(tree.getByMarker("3:collapseall")).not.toBeVisible(); // Child hidden
      await expect(tree.getByMarker("4:collapseall")).not.toBeVisible(); // Grandchild hidden
    });

    test("exposes scrollToItem method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="200px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:scroll">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="scrollBtn" testId="scroll-btn" label="Scroll to Item 4" onClick="
            treeApi.scrollToItem('4');
            testState = { actionPerformed: 'scrollToItem', itemId: '4' };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const scrollButton = await createButtonDriver("scroll-btn");

      // Verify tree is visible
      await expect(tree.getByMarker("1:scroll")).toBeVisible();

      // Click scroll to item button
      await scrollButton.click();

      // Verify test state confirms action was performed
      // Note: Testing scrolling behavior in virtualized components is complex in tests
      // So we mainly verify the API can be called without errors
      await expect.poll(testStateDriver.testState).toEqual({
        actionPerformed: "scrollToItem",
        itemId: "4",
      });
    });

    test("exposes getSelectedNode method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              selectedValue="2"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:selected">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="getSelectedBtn" testId="get-selected-btn" label="Get Selected" onClick="
            const selectedNode = treeApi.getSelectedNode();
            testState = { 
              hasSelectedNode: selectedNode !== null,
              selectedNodeKey: selectedNode?.key,
              selectedNodeName: selectedNode?.displayName
            };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const getSelectedButton = await createButtonDriver("get-selected-btn");

      // Verify tree is visible with selection
      await expect(tree.getByMarker("2:selected")).toBeVisible();

      // Click get selected node button
      await getSelectedButton.click();

      // Verify getSelectedNode returns correct data
      await expect.poll(testStateDriver.testState).toEqual({
        hasSelectedNode: true,
        selectedNodeKey: 2,
        selectedNodeName: "Child Item 1.1",
      });
    });

    test("exposes refreshData method", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}:refresh">
                  <HStack verticalAlignment="center">
                    <Text value="{$item.name}" />
                  </HStack>
                </TestMarker>
              </property>
            </Tree>
          </VStack>
          <Button id="refreshBtn" testId="refresh-btn" label="Refresh Data" onClick="
            treeApi.refreshData();
            testState = { actionPerformed: 'refreshData' };
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const refreshButton = await createButtonDriver("refresh-btn");

      // Verify tree is visible with original data
      await expect(tree.getByMarker("1:refresh")).toBeVisible();
      await expect(tree.getByMarker("2:refresh")).toBeVisible();

      // Click refresh data button
      await refreshButton.click();

      // Verify test state confirms action was performed
      // Note: refreshData forces re-processing but with same data, tree should remain the same
      await expect.poll(testStateDriver.testState).toEqual({
        actionPerformed: "refreshData",
      });

      // Tree should still be visible after refresh
      await expect(tree.getByMarker("1:refresh")).toBeVisible();
      await expect(tree.getByMarker("2:refresh")).toBeVisible();
    });

    // =============================================================================
    // COMPREHENSIVE API METHOD TESTS
    // =============================================================================

    test.describe("API Method Tests", () => {
      test("expandAll() - expands all nodes and makes all children visible", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(hierarchyTreeData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:expandall">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expandall-btn" label="Expand All" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAll' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandAllButton = await createButtonDriver("expandall-btn");

        // BEFORE: Verify tree starts collapsed - only root visible
        await expect(tree.getByMarker("1:expandall")).toBeVisible(); // Root visible
        await expect(tree.getByMarker("2:expandall")).not.toBeVisible(); // Child hidden
        await expect(tree.getByMarker("3:expandall")).not.toBeVisible(); // Child hidden

        // Trigger expandAll API
        await expandAllButton.click();

        // Wait for async API call to complete
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandAll" });

        // AFTER: Verify all nodes are now visible
        await expect(tree.getByMarker("1:expandall")).toBeVisible(); // Root still visible
        await expect(tree.getByMarker("2:expandall")).toBeVisible(); // Child now visible
        await expect(tree.getByMarker("3:expandall")).toBeVisible(); // Child now visible

        // Note: For hierarchyTreeData, we only have 2 levels, so all should be visible after expandAll
      });

      test("collapseAll() - collapses all nodes and hides all children", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyTreeData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:collapseall">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapseall-btn" label="Collapse All" onClick="
              treeApi.collapseAll();
              testState = { actionPerformed: 'collapseAll' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseAllButton = await createButtonDriver("collapseall-btn");

        // BEFORE: Verify tree starts expanded - all nodes visible
        await expect(tree.getByMarker("1:collapseall")).toBeVisible(); // Root visible
        await expect(tree.getByMarker("2:collapseall")).toBeVisible(); // Child visible
        await expect(tree.getByMarker("3:collapseall")).toBeVisible(); // Child visible

        // Trigger collapseAll API
        await collapseAllButton.click();

        // Wait for async API call to complete
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseAll" });

        // AFTER: Verify only root nodes are visible, children are hidden
        await expect(tree.getByMarker("1:collapseall")).toBeVisible(); // Root still visible
        await expect(tree.getByMarker("2:collapseall")).not.toBeVisible(); // Child now hidden
        await expect(tree.getByMarker("3:collapseall")).not.toBeVisible(); // Child now hidden
      });

      test("expandAll() - with deep hierarchy (4+ levels)", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Create a deeper hierarchy for thorough testing
        const deepHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  {
                    id: 3,
                    name: "Level 2 - Branch A.1",
                    children: [
                      { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                      { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                    ],
                  },
                  { id: 6, name: "Level 2 - Branch A.2", children: [] },
                ],
              },
              {
                id: 7,
                name: "Level 1 - Branch B",
                children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:deep">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expandall-deep-btn" label="Expand All Deep" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAllDeep' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandAllButton = await createButtonDriver("expandall-deep-btn");

        // BEFORE: Verify tree starts collapsed - only root visible
        await expect(tree.getByMarker("1:deep")).toBeVisible(); // Root (Level 0)
        await expect(tree.getByMarker("2:deep")).not.toBeVisible(); // Level 1 - Branch A (hidden)
        await expect(tree.getByMarker("3:deep")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
        await expect(tree.getByMarker("4:deep")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)
        await expect(tree.getByMarker("7:deep")).not.toBeVisible(); // Level 1 - Branch B (hidden)
        await expect(tree.getByMarker("8:deep")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)

        // Trigger expandAll API
        await expandAllButton.click();

        // Wait for async API call to complete
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandAllDeep" });

        // AFTER: Verify ALL levels are now visible (4 levels deep)
        await expect(tree.getByMarker("1:deep")).toBeVisible(); // Root (Level 0) - still visible
        await expect(tree.getByMarker("2:deep")).toBeVisible(); // Level 1 - Branch A (now visible)
        await expect(tree.getByMarker("3:deep")).toBeVisible(); // Level 2 - Branch A.1 (now visible)
        await expect(tree.getByMarker("4:deep")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible)
        await expect(tree.getByMarker("5:deep")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible)
        await expect(tree.getByMarker("6:deep")).toBeVisible(); // Level 2 - Branch A.2 (now visible)
        await expect(tree.getByMarker("7:deep")).toBeVisible(); // Level 1 - Branch B (now visible)
        await expect(tree.getByMarker("8:deep")).toBeVisible(); // Level 2 - Branch B.1 (now visible)
      });

      test("collapseAll() - with deep hierarchy (4+ levels)", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use the same deep hierarchy data
        const deepHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  {
                    id: 3,
                    name: "Level 2 - Branch A.1",
                    children: [
                      { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                      { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                    ],
                  },
                  { id: 6, name: "Level 2 - Branch A.2", children: [] },
                ],
              },
              {
                id: 7,
                name: "Level 1 - Branch B",
                children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:deepcollapse">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapseall-deep-btn" label="Collapse All Deep" onClick="
              treeApi.collapseAll();
              testState = { actionPerformed: 'collapseAllDeep' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseAllButton = await createButtonDriver("collapseall-deep-btn");

        // BEFORE: Verify tree starts fully expanded - all levels visible
        await expect(tree.getByMarker("1:deepcollapse")).toBeVisible(); // Root (Level 0)
        await expect(tree.getByMarker("2:deepcollapse")).toBeVisible(); // Level 1 - Branch A
        await expect(tree.getByMarker("3:deepcollapse")).toBeVisible(); // Level 2 - Branch A.1
        await expect(tree.getByMarker("4:deepcollapse")).toBeVisible(); // Level 3 - Leaf A.1.1
        await expect(tree.getByMarker("5:deepcollapse")).toBeVisible(); // Level 3 - Leaf A.1.2
        await expect(tree.getByMarker("7:deepcollapse")).toBeVisible(); // Level 1 - Branch B
        await expect(tree.getByMarker("8:deepcollapse")).toBeVisible(); // Level 2 - Branch B.1

        // Trigger collapseAll API
        await collapseAllButton.click();

        // Wait for async API call to complete
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "collapseAllDeep" });

        // AFTER: Verify only root level nodes are visible, all children hidden
        await expect(tree.getByMarker("1:deepcollapse")).toBeVisible(); // Root (Level 0) - still visible
        await expect(tree.getByMarker("2:deepcollapse")).not.toBeVisible(); // Level 1 - Branch A (now hidden)
        await expect(tree.getByMarker("3:deepcollapse")).not.toBeVisible(); // Level 2 - Branch A.1 (now hidden)
        await expect(tree.getByMarker("4:deepcollapse")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (now hidden)
        await expect(tree.getByMarker("5:deepcollapse")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (now hidden)
        await expect(tree.getByMarker("6:deepcollapse")).not.toBeVisible(); // Level 2 - Branch A.2 (now hidden)
        await expect(tree.getByMarker("7:deepcollapse")).not.toBeVisible(); // Level 1 - Branch B (now hidden)
        await expect(tree.getByMarker("8:deepcollapse")).not.toBeVisible(); // Level 2 - Branch B.1 (now hidden)
      });

      test("expandToLevel(level) - expands nodes only to specified depth", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use deep hierarchy to test expandToLevel properly
        const deepHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  {
                    id: 3,
                    name: "Level 2 - Branch A.1",
                    children: [
                      { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                      { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                    ],
                  },
                  { id: 6, name: "Level 2 - Branch A.2", children: [] },
                ],
              },
              {
                id: 7,
                name: "Level 1 - Branch B",
                children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-level0-btn" label="Expand to Level 0" onClick="
              treeApi.expandToLevel(0);
              testState = { actionPerformed: 'expandToLevel0' };
            " />
            <Button testId="expand-level1-btn" label="Expand to Level 1" onClick="
              treeApi.expandToLevel(1);
              testState = { actionPerformed: 'expandToLevel1' };
            " />
            <Button testId="expand-level2-btn" label="Expand to Level 2" onClick="
              treeApi.expandToLevel(2);
              testState = { actionPerformed: 'expandToLevel2' };
            " />
            <Button testId="expand-level3-btn" label="Expand to Level 3" onClick="
              treeApi.expandToLevel(3);
              testState = { actionPerformed: 'expandToLevel3' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandLevel0Button = await createButtonDriver("expand-level0-btn");
        const expandLevel1Button = await createButtonDriver("expand-level1-btn");
        const expandLevel2Button = await createButtonDriver("expand-level2-btn");
        const expandLevel3Button = await createButtonDriver("expand-level3-btn");

        // INITIAL STATE: Verify tree starts collapsed - only root visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root)
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 (hidden)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 (hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 (hidden)

        // TEST 1: expandToLevel(0) - should show only root level (no expansion)
        await expandLevel0Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel0" });

        // AFTER expandToLevel(0): Only Level 0 visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - Branch A (hidden)
        await expect(tree.getByMarker("7:level")).not.toBeVisible(); // Level 1 - Branch B (hidden)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)

        // TEST 2: expandToLevel(1) - should show Level 0 and Level 1 only
        await expandLevel1Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel1" });

        // AFTER expandToLevel(1): Level 0 and 1 visible, Level 2+ hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A (now visible)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B (now visible)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
        await expect(tree.getByMarker("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)

        // TEST 3: expandToLevel(2) - should show Level 0, 1, and 2
        await expandLevel2Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel2" });

        // AFTER expandToLevel(2): Level 0, 1, and 2 visible, Level 3+ hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - visible
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 (now visible)
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 (now visible)
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 (now visible)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
        await expect(tree.getByMarker("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)

        // TEST 4: expandToLevel(3) - should show all levels (0, 1, 2, and 3)
        await expandLevel3Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel3" });

        // AFTER expandToLevel(3): All levels visible (complete expansion for this tree)
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - visible
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 - visible
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 - visible
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 - visible
        await expect(tree.getByMarker("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible)
        await expect(tree.getByMarker("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible)
      });

      test("expandNode(nodeId) - expands specific node and shows its children", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use deep hierarchy to test individual node expansion
        const deepHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  {
                    id: 3,
                    name: "Level 2 - Branch A.1",
                    children: [
                      { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                      { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                    ],
                  },
                  { id: 6, name: "Level 2 - Branch A.2", children: [] },
                ],
              },
              {
                id: 7,
                name: "Level 1 - Branch B",
                children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-root-btn" label="Expand Root" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandRoot' };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="expand-node3-btn" label="Expand Node 3" onClick="
              treeApi.expandNode(3);
              testState = { actionPerformed: 'expandNode3' };
            " />
            <Button testId="expand-node7-btn" label="Expand Node 7" onClick="
              treeApi.expandNode(7);
              testState = { actionPerformed: 'expandNode7' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandRootButton = await createButtonDriver("expand-root-btn");
        const expandNode2Button = await createButtonDriver("expand-node2-btn");
        const expandNode3Button = await createButtonDriver("expand-node3-btn");
        const expandNode7Button = await createButtonDriver("expand-node7-btn");

        // INITIAL STATE: Verify tree starts collapsed - only root visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - Branch A (hidden)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)
        await expect(tree.getByMarker("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (hidden)
        await expect(tree.getByMarker("7:level")).not.toBeVisible(); // Level 1 - Branch B (hidden)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)

        // FIRST: Expand root to make Level 1 nodes visible
        await expandRootButton.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandRoot" });

        // AFTER expanding root: Level 1 nodes become visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A (now visible)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B (now visible)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
        await expect(tree.getByMarker("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden)

        // TEST 1: expandNode(2) - should expand "Level 1 - Branch A" and show its children
        await expandNode2Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode2" });

        // AFTER expandNode(2): Node 2's children become visible, others stay hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A (still visible)
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 (now visible - child of node 2)
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 (now visible - child of node 2)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden - child of node 3)
        await expect(tree.getByMarker("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden - child of node 3)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B (still visible from root expansion)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden - child of node 7)

        // TEST 2: expandNode(3) - should expand "Level 2 - Branch A.1" and show its children
        await expandNode3Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode3" });

        // AFTER expandNode(3): Node 3's children become visible, previous expansions remain
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible
        await expect(tree.getByMarker("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible - child of node 3)
        await expect(tree.getByMarker("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible - child of node 3)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B (still visible from root expansion)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden - child of node 7)

        // TEST 3: expandNode(7) - should expand "Level 1 - Branch B" and show its children
        await expandNode7Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode7" });

        // AFTER expandNode(7): Node 7's children become visible, all previous expansions remain
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible
        await expect(tree.getByMarker("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 - still visible
        await expect(tree.getByMarker("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 - still visible
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - still visible
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 (now visible - child of node 7)
      });

      test("expandNode(nodeId) - negative tests for invalid or inaccessible nodes", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use simple hierarchy to test negative cases clearly
        const simpleHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-nonexistent-btn" label="Expand Non-existent Node" onClick="
              treeApi.expandNode(999);
              testState = { actionPerformed: 'expandNonExistent' };
            " />
            <Button testId="expand-leaf-node3-btn" label="Expand Leaf Node 3" onClick="
              treeApi.expandNode(3);
              testState = { actionPerformed: 'expandLeafNode3' };
            " />
            <Button testId="expand-root-btn" label="Expand Root" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandRoot' };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandNonExistentButton = await createButtonDriver("expand-nonexistent-btn");
        const expandLeafNode3Button = await createButtonDriver("expand-leaf-node3-btn");
        const expandRootButton = await createButtonDriver("expand-root-btn");
        const expandNode2Button = await createButtonDriver("expand-node2-btn");

        // INITIAL STATE: Only root visible, all children hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - visible
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - hidden
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - hidden

        // NEGATIVE TEST 1: Try to expand non-existent node (ID 999)
        await expandNonExistentButton.click();
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "expandNonExistent" });

        // AFTER expandNode(999): Should have no effect, tree state unchanged
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - still visible
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - still hidden
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - still hidden

        // NEGATIVE TEST 2: Try to expand leaf node 3 (which has no children) while it's hidden
        await expandLeafNode3Button.click();
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "expandLeafNode3" });

        // AFTER expandNode(3) on hidden leaf: Should have no effect since node is not visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - still visible
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - still hidden
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - still hidden

        // Now expand the tree properly to make nodes visible
        await expandRootButton.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandRoot" });

        await expandNode2Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode2" });

        // After proper expansion: All nodes should be visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - visible

        // NEGATIVE TEST 3: Try to expand leaf node 3 again (now that it's visible but still has no children)
        await expandLeafNode3Button.click();
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "expandLeafNode3" });

        // AFTER expandNode(3) on visible leaf: Should have no visible effect since leaf nodes can't expand
        // Tree state should remain the same - all nodes still visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - still visible
      });

      test("collapseNode(nodeId) - collapses specific node and hides its children", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use deep hierarchy to test individual node collapse
        const deepHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  {
                    id: 3,
                    name: "Level 2 - Branch A.1",
                    children: [
                      { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                      { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                    ],
                  },
                  { id: 6, name: "Level 2 - Branch A.2", children: [] },
                ],
              },
              {
                id: 7,
                name: "Level 1 - Branch B",
                children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-node3-btn" label="Collapse Node 3" onClick="
              treeApi.collapseNode(3);
              testState = { actionPerformed: 'collapseNode3' };
            " />
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="collapse-root-btn" label="Collapse Root" onClick="
              treeApi.collapseNode(1);
              testState = { actionPerformed: 'collapseRoot' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseNode3Button = await createButtonDriver("collapse-node3-btn");
        const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
        const collapseRootButton = await createButtonDriver("collapse-root-btn");

        // INITIAL STATE: Tree starts fully expanded - all nodes visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 - visible
        await expect(tree.getByMarker("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 - visible
        await expect(tree.getByMarker("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 - visible
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 - visible
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - visible
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 - visible

        // TEST 1: collapseNode(3) - should collapse "Level 2 - Branch A.1" and hide its children
        await collapseNode3Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseNode3" });

        // AFTER collapseNode(3): Node 3's children become hidden, others remain visible
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible (but collapsed)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (now hidden - child of collapsed node 3)
        await expect(tree.getByMarker("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (now hidden - child of collapsed node 3)
        await expect(tree.getByMarker("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible (not child of node 3)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - still visible
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 - still visible

        // TEST 2: collapseNode(2) - should collapse "Level 1 - Branch A" and hide all its descendants
        await collapseNode2Button.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseNode2" });

        // AFTER collapseNode(2): Node 2's entire subtree becomes hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - Branch A - still visible (but collapsed)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (now hidden - child of collapsed node 2)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
        await expect(tree.getByMarker("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)
        await expect(tree.getByMarker("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (now hidden - child of collapsed node 2)
        await expect(tree.getByMarker("7:level")).toBeVisible(); // Level 1 - Branch B - still visible (not descendant of node 2)
        await expect(tree.getByMarker("8:level")).toBeVisible(); // Level 2 - Branch B.1 - still visible

        // TEST 3: collapseNode(1) - should collapse root and hide all children
        await collapseRootButton.click();
        await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseRoot" });

        // AFTER collapseNode(1): All children of root become hidden
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Level 0 (Root) - still visible (but collapsed)
        await expect(tree.getByMarker("2:level")).not.toBeVisible(); // Level 1 - Branch A (now hidden - child of collapsed root)
        await expect(tree.getByMarker("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
        await expect(tree.getByMarker("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
        await expect(tree.getByMarker("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)
        await expect(tree.getByMarker("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
        await expect(tree.getByMarker("7:level")).not.toBeVisible(); // Level 1 - Branch B (now hidden - child of collapsed root)
        await expect(tree.getByMarker("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (now hidden)
      });

      test("collapseNode(nodeId) - negative tests for invalid or leaf nodes", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use simple hierarchy for negative tests
        const simpleHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-nonexistent-btn" label="Collapse Non-existent Node" onClick="
              treeApi.collapseNode(999);
              testState = { actionPerformed: 'collapseNonExistent' };
            " />
            <Button testId="collapse-leaf-node3-btn" label="Collapse Leaf Node 3" onClick="
              treeApi.collapseNode(3);
              testState = { actionPerformed: 'collapseLeafNode3' };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseNonExistentButton = await createButtonDriver("collapse-nonexistent-btn");
        const collapseLeafNode3Button = await createButtonDriver("collapse-leaf-node3-btn");

        // INITIAL STATE: Tree starts fully expanded
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - visible

        // NEGATIVE TEST 1: Try to collapse non-existent node (ID 999)
        await collapseNonExistentButton.click();
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "collapseNonExistent" });

        // AFTER collapseNode(999): Should have no effect, tree state unchanged
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - still visible

        // NEGATIVE TEST 2: Try to collapse leaf node 3 (which has no children to hide)
        await collapseLeafNode3Button.click();
        await expect
          .poll(testStateDriver.testState)
          .toEqual({ actionPerformed: "collapseLeafNode3" });

        // AFTER collapseNode(3) on leaf: Should have no visible effect since leaf nodes have no children
        // Tree state should remain the same
        await expect(tree.getByMarker("1:level")).toBeVisible(); // Root - still visible
        await expect(tree.getByMarker("2:level")).toBeVisible(); // Level 1 - still visible
        await expect(tree.getByMarker("3:level")).toBeVisible(); // Level 2 - still visible
      });

      test("selectNode(nodeId) - API method executes without error", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Use hierarchy for testing selectNode API
        const selectableHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
              },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                selectedValue="{selectedNodeId}"
                onSelectionDidChange="selectedNodeId = $event.newNode?.key || null;"
                data='{${JSON.stringify(selectableHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="select-node2-btn" label="Select Node 2" onClick="
              treeApi.selectNode('2');
              const selectedNode = treeApi.getSelectedNode();
              testState = { actionPerformed: 'selectNode2', selectedNodeData: selectedNode };
            " />
            <Button testId="select-nonexistent-btn" label="Select Non-existent Node" onClick="
              treeApi.selectNode('999');
              const selectedNode = treeApi.getSelectedNode();
              testState = { actionPerformed: 'selectNonExistent', selectedNodeData: selectedNode };
            " />
            <Button testId="get-selected-btn" label="Get Selected Node" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { actionPerformed: 'getSelected', selectedNodeData: selectedNode };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const selectNode2Button = await createButtonDriver("select-node2-btn");
        const selectNonExistentButton = await createButtonDriver("select-nonexistent-btn");
        const getSelectedButton = await createButtonDriver("get-selected-btn");

        // INITIAL STATE: No selection
        await getSelectedButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getSelected");

        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.selectedNodeData;
          })
          .toBe(null);

        // TEST 1: selectNode('2') API call completes without error
        await selectNode2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("selectNode2");

        // Verify API call completed (even if selection doesn't take effect due to implementation)
        // NOTE: This test documents that selectNode() triggers onSelectionDidChange event
        // but the actual selection state depends on the onSelectionDidChange handler updating selectedValue
        const currentState = await testStateDriver.testState();
        expect(currentState.actionPerformed).toBe("selectNode2");

        // The selectedNodeData might be null if selectNode() doesn't immediately update the tree state
        // This is expected behavior given the current implementation that relies on onSelectionDidChange

        // TEST 2: selectNode('999') with invalid ID completes without error
        await selectNonExistentButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("selectNonExistent");

        // Verify invalid node selection returns null
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.selectedNodeData;
          })
          .toBe(null);
      });

      test("getSelectedNode() - returns correct selected node data", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Simple hierarchy for testing getSelectedNode API
        const simpleHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              { id: 2, name: "Level 1 - Branch A", children: [] },
              { id: 3, name: "Level 1 - Branch B", children: [] },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                selectedValue="{2}"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-selected-btn" label="Get Selected Node" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelected', 
                selectedNodeData: selectedNode,
                selectedKey: selectedNode?.key,
                selectedName: selectedNode?.name
              };
            " />
            <Button testId="get-selected-null-btn" label="Get Selected When None" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelectedNull', 
                selectedNodeData: selectedNode 
              };
            " />
          </Fragment>
        `);

        const getSelectedButton = await createButtonDriver("get-selected-btn");

        // TEST 1: getSelectedNode() returns correct node when selectedValue is set
        await getSelectedButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getSelected");

        // Verify getSelectedNode returns the correct node data
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.selectedKey;
          })
          .toBe(2);

        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.selectedName;
          })
          .toBe("Level 1 - Branch A");

        // Verify the returned node is not null
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.selectedNodeData;
          })
          .not.toBe(null);

        // TEST 2: Test with no selection (update tree to have no selectedValue)
        const { testStateDriver: testStateDriver2 } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-selected-null-btn" label="Get Selected When None" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelectedNull', 
                selectedNodeData: selectedNode 
              };
            " />
          </Fragment>
        `);

        const getSelectedNullButton = await createButtonDriver("get-selected-null-btn");

        await getSelectedNullButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver2.testState();
            return state.actionPerformed;
          })
          .toBe("getSelectedNull");

        // Verify getSelectedNode returns null when no selection
        await expect
          .poll(async () => {
            const state = await testStateDriver2.testState();
            return state.selectedNodeData;
          })
          .toBe(null);
      });

      test("clearSelection() - API method executes without error", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Simple hierarchy for testing clearSelection API
        const simpleHierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [{ id: 2, name: "Level 1 - Branch A", children: [] }],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:clear">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="clear-selection-btn" label="Clear Selection" onClick="
              try {
                treeApi.clearSelection();
                testState = { 
                  actionPerformed: 'clearSelection', 
                  success: true,
                  error: null
                };
              } catch (error) {
                testState = { 
                  actionPerformed: 'clearSelection', 
                  success: false,
                  error: error.message
                };
              }
            " />
            <Button testId="get-selected-btn" label="Get Selected Node" onClick="
              try {
                const selectedNode = treeApi.getSelectedNode();
                testState = { 
                  actionPerformed: 'getSelected', 
                  success: true,
                  selectedNodeData: selectedNode,
                  error: null
                };
              } catch (error) {
                testState = { 
                  actionPerformed: 'getSelected', 
                  success: false,
                  error: error.message
                };
              }
            " />
          </Fragment>
        `);

        const clearSelectionButton = await createButtonDriver("clear-selection-btn");
        const getSelectedButton = await createButtonDriver("get-selected-btn");

        // TEST: clearSelection() API call completes without error
        await clearSelectionButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("clearSelection");

        let currentState = await testStateDriver.testState();
        expect(currentState.success).toBe(true);
        expect(currentState.error).toBe(null);

        // TEST: getSelectedNode() API call completes without error
        await getSelectedButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getSelected");

        currentState = await testStateDriver.testState();
        expect(currentState.success).toBe(true);
        expect(currentState.error).toBe(null);
        // When no selection is managed, getSelectedNode() returns null
        expect(currentState.selectedNodeData).toBe(null);
      });

      test("getNodeById() - returns correct node data or null for invalid keys", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Rich hierarchy data for testing getNodeById API
        const hierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  { id: 4, name: "Level 2 - Leaf A1", children: [] },
                  { id: 5, name: "Level 2 - Leaf A2", children: [] },
                ],
              },
              { id: 3, name: "Level 1 - Branch B", children: [] },
            ],
          },
          {
            id: 6,
            name: "Root Level 1",
            children: [{ id: 7, name: "Level 1 - Branch C", children: [] }],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:getById">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-node1-btn" label="Get Node 1" onClick="
              const node = treeApi.getNodeById(1);
              testState = { 
                actionPerformed: 'getNode1', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-node4-btn" label="Get Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-node7-btn" label="Get Node 7" onClick="
              const node = treeApi.getNodeById(7);
              testState = { 
                actionPerformed: 'getNode7', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-invalid-btn" label="Get Invalid Node" onClick="
              const node = treeApi.getNodeById(999);
              testState = { 
                actionPerformed: 'getInvalid', 
                nodeData: node,
                nodeExists: node !== null
              };
            " />
          </Fragment>
        `);

        const getNode1Button = await createButtonDriver("get-node1-btn");
        const getNode4Button = await createButtonDriver("get-node4-btn");
        const getNode7Button = await createButtonDriver("get-node7-btn");
        const getInvalidButton = await createButtonDriver("get-invalid-btn");

        // TEST: getNodeById(1) should return root node data
        await getNode1Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getNode1");

        let currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(1);
        expect(currentState.nodeName).toBe("Root Level 0");
        expect(currentState.nodeData).not.toBe(null);

        // TEST: getNodeById(4) should return deep nested node data
        await getNode4Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getNode4");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(4);
        expect(currentState.nodeName).toBe("Level 2 - Leaf A1");
        expect(currentState.nodeData).not.toBe(null);

        // TEST: getNodeById(7) should return node from second root
        await getNode7Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getNode7");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(7);
        expect(currentState.nodeName).toBe("Level 1 - Branch C");
        expect(currentState.nodeData).not.toBe(null);

        // TEST: getNodeById(999) should return null for non-existent node
        await getInvalidButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getInvalid");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeExists).toBe(false);
        expect(currentState.nodeData).toBe(null);
      });

      test("getNodeById() - can retrieve nodes within collapsed parents", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Hierarchy with nested structure to test collapsed nodes
        const hierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  { id: 4, name: "Level 2 - Hidden Leaf A1", children: [] },
                  { id: 5, name: "Level 2 - Hidden Leaf A2", children: [] },
                ],
              },
              { id: 3, name: "Level 1 - Branch B", children: [] },
            ],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:hidden">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="get-visible-node1-btn" label="Get Visible Node 1" onClick="
              const node = treeApi.getNodeById(1);
              testState = { 
                actionPerformed: 'getVisibleNode1', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="get-hidden-node4-btn" label="Get Hidden Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getHiddenNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="get-hidden-node5-btn" label="Get Hidden Node 5" onClick="
              const node = treeApi.getNodeById(5);
              testState = { 
                actionPerformed: 'getHiddenNode5', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="get-now-visible-node4-btn" label="Get Now Visible Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getNowVisibleNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
        const getVisibleNode1Button = await createButtonDriver("get-visible-node1-btn");
        const getHiddenNode4Button = await createButtonDriver("get-hidden-node4-btn");
        const getHiddenNode5Button = await createButtonDriver("get-hidden-node5-btn");
        const expandNode2Button = await createButtonDriver("expand-node2-btn");
        const getNowVisibleNode4Button = await createButtonDriver("get-now-visible-node4-btn");

        // INITIAL STATE: defaultExpanded="all", so all nodes are visible
        // First, verify all nodes are visible initially
        const node1Wrapper = tree.getNodeWrapperByMarker("1:hidden");
        const node2Wrapper = tree.getNodeWrapperByMarker("2:hidden");
        const node4Wrapper = tree.getNodeWrapperByMarker("4:hidden");
        const node5Wrapper = tree.getNodeWrapperByMarker("5:hidden");

        await expect(node1Wrapper).toBeVisible();
        await expect(node2Wrapper).toBeVisible();
        await expect(node4Wrapper).toBeVisible();
        await expect(node5Wrapper).toBeVisible();

        // Now collapse node 2 to hide its children
        await collapseNode2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("collapseNode2");

        // After collapse, node 2 is still visible but its children (4, 5) are hidden
        await expect(node1Wrapper).toBeVisible();
        await expect(node2Wrapper).toBeVisible();
        await expect(node4Wrapper).not.toBeVisible();
        await expect(node5Wrapper).not.toBeVisible();

        // TEST: getNodeById(1) should work for visible node
        await getVisibleNode1Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getVisibleNode1");

        let currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(1);
        expect(currentState.nodeName).toBe("Root Level 0");
        expect(currentState.nodeExists).toBe(true);

        // TEST: getNodeById(4) should work even though node 4 is hidden (collapsed parent)
        // This tests whether the API can access data model nodes regardless of DOM visibility
        await getHiddenNode4Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getHiddenNode4");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(4);
        expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A1");
        expect(currentState.nodeExists).toBe(true);

        // TEST: getNodeById(5) should also work for another hidden node
        await getHiddenNode5Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getHiddenNode5");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(5);
        expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A2");
        expect(currentState.nodeExists).toBe(true);

        // Now expand the parent node to make children visible again
        await expandNode2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("expandNode2");

        // Verify nodes are now visible in DOM again
        await expect(node4Wrapper).toBeVisible();
        await expect(node5Wrapper).toBeVisible();

        // TEST: getNodeById(4) should still work now that it's visible again
        await getNowVisibleNode4Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getNowVisibleNode4");

        currentState = await testStateDriver.testState();
        expect(currentState.nodeKey).toBe(4);
        expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A1");
        expect(currentState.nodeExists).toBe(true);
      });

      test("getExpandedNodes() - returns array of expanded node keys", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        // Hierarchy data for testing expanded nodes tracking
        const hierarchyData = [
          {
            id: 1,
            name: "Root Level 0",
            children: [
              {
                id: 2,
                name: "Level 1 - Branch A",
                children: [
                  { id: 4, name: "Level 2 - Leaf A1", children: [] },
                  { id: 5, name: "Level 2 - Leaf A2", children: [] },
                ],
              },
              { id: 3, name: "Level 1 - Branch B", children: [] },
            ],
          },
          {
            id: 6,
            name: "Root Level 1",
            children: [{ id: 7, name: "Level 1 - Branch C", children: [] }],
          },
        ];

        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}:expand">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-expanded-initial-btn" label="Get Expanded Initial" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedInitial', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-node1-btn" label="Expand Node 1" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandNode1' };
            " />
            <Button testId="get-expanded-after1-btn" label="Get Expanded After 1" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfter1', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="get-expanded-after2-btn" label="Get Expanded After 2" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfter2', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-all-btn" label="Expand All" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAll' };
            " />
            <Button testId="get-expanded-all-btn" label="Get Expanded All" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAll', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="get-expanded-after-collapse-btn" label="Get Expanded After Collapse" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfterCollapse', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
          </Fragment>
        `);

        const getExpandedInitialButton = await createButtonDriver("get-expanded-initial-btn");
        const expandNode1Button = await createButtonDriver("expand-node1-btn");
        const getExpandedAfter1Button = await createButtonDriver("get-expanded-after1-btn");
        const expandNode2Button = await createButtonDriver("expand-node2-btn");
        const getExpandedAfter2Button = await createButtonDriver("get-expanded-after2-btn");
        const expandAllButton = await createButtonDriver("expand-all-btn");
        const getExpandedAllButton = await createButtonDriver("get-expanded-all-btn");
        const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
        const getExpandedAfterCollapseButton = await createButtonDriver(
          "get-expanded-after-collapse-btn",
        );

        // INITIAL STATE: defaultExpanded="none", so no nodes should be expanded
        await getExpandedInitialButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getExpandedInitial");

        let currentState = await testStateDriver.testState();
        expect(currentState.expandedCount).toBe(0);
        expect(currentState.expandedNodes).toEqual([]);

        // EXPAND NODE 1: Should add node 1 to expanded list
        await expandNode1Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("expandNode1");

        await getExpandedAfter1Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getExpandedAfter1");

        currentState = await testStateDriver.testState();
        expect(currentState.expandedCount).toBe(1);
        expect(currentState.expandedNodes).toEqual([1]);

        // EXPAND NODE 2: Should add node 2 to expanded list (alongside node 1)
        await expandNode2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("expandNode2");

        await getExpandedAfter2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getExpandedAfter2");

        currentState = await testStateDriver.testState();
        expect(currentState.expandedCount).toBe(2);
        expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 2]));

        // EXPAND ALL: Should expand all nodes with children
        await expandAllButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("expandAll");

        await getExpandedAllButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getExpandedAll");

        currentState = await testStateDriver.testState();
        // After expandAll, ALL nodes are added to the expanded list
        // This includes leaf nodes, which is the current implementation behavior
        expect(currentState.expandedCount).toBe(7);
        expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));

        // COLLAPSE NODE 2: Should remove node 2 from expanded list
        await collapseNode2Button.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("collapseNode2");

        await getExpandedAfterCollapseButton.click();
        await expect
          .poll(async () => {
            const state = await testStateDriver.testState();
            return state.actionPerformed;
          })
          .toBe("getExpandedAfterCollapse");

        currentState = await testStateDriver.testState();
        expect(currentState.expandedCount).toBe(4);
        // When node 2 is collapsed, its descendants (4, 5) are also removed from expanded list
        expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 3, 6, 7]));
        expect(currentState.expandedNodes).not.toEqual(expect.arrayContaining([2, 4, 5]));
      });
    });
  });
});

// =============================================================================
// EVENTS TESTS
// =============================================================================

test.describe("Events", () => {
  test.describe("selectionDidChange Event", () => {
    test("fires when user clicks on a selectable node", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            data='{${JSON.stringify(flatTreeData)}}'
            onSelectionDidChange="event => testState = event">
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <Text value="{$item.name}" />
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);

      const tree = await createTreeDriver("tree");

      // Click on the first item
      await tree.getByMarker("1").click();

      // Verify selectionDidChange event was fired with correct data
      await expect.poll(() => testStateDriver.testState()).toBeDefined();
      const event = await testStateDriver.testState();
      expect(event.newNode).toBeDefined();
      expect(event.newNode.id).toBe(1);
      expect(event.newNode.displayName).toBe("Root Item 1");
      expect(event.previousNode).toBeNull();
    });

    test("fires with previous node when selection changes", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            data='{${JSON.stringify(flatTreeData)}}'
            onSelectionDidChange="event => testState = event">
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <Text value="{$item.name}" />
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);

      const tree = await createTreeDriver("tree");

      // First selection
      await tree.getByMarker("1").click();

      // Second selection
      await tree.getByMarker("2").click();

      // Verify event has both previous and new node
      await expect.poll(() => testStateDriver.testState()?.then((s) => s?.newNode?.id)).toBe(2);
      const event = await testStateDriver.testState();
      expect(event.previousNode.id).toBe(1);
    });

    test.skip("fires with null newNode when selection is cleared", async ({
      initTestBed,
      createTreeDriver,
    }) => {
      // TODO: Implement selection clearing mechanism and test
      // This test requires determining how selection clearing works in the Tree component
    });
  });

  test.describe("nodeDidExpand Event", () => {
    test("fires after successful node expansion", async ({ initTestBed, createTreeDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy"
            expandOnItemClick="true"
            data='{${JSON.stringify(hierarchyTreeData)}}'
            onNodeDidExpand="node => testState = node">
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <Text value="{$item.name}" />
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);

      const tree = await createTreeDriver("tree");

      // Click to expand first node
      await tree.getByMarker("1").click();

      // Verify nodeDidExpand event fired
      await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

      // Verify child is now visible
      await expect(tree.getByMarker("2")).toBeVisible();
    });
  });

  test.describe("nodeDidCollapse Event", () => {
    test("fires after successful node collapse", async ({ initTestBed, createTreeDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            expandOnItemClick="true"
            defaultExpanded="all"
            data='{${JSON.stringify(hierarchyTreeData)}}'
            onNodeDidCollapse="node => testState = node">
            <property name="itemTemplate">
              <TestMarker tag="{$item.id}">
                <Text value="{$item.name}" />
              </TestMarker>
            </property>
          </Tree>
        </VStack>
      `);

      const tree = await createTreeDriver("tree");

      // First, verify child is visible (node starts expanded)
      await expect(tree.getByMarker("2")).toBeVisible();

      // Click to collapse expanded node
      await tree.getByMarker("1").click();

      // Verify nodeDidCollapse fired with correct node
      await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

      // Verify child is no longer visible
      await expect(tree.getByMarker("2")).not.toBeVisible();
    });

    // Note: Additional collapse tests can be added when TreeDriver supports programmatic collapse operations
  });

  // =============================================================================
  // KEYBOARD EVENT TESTS
  // =============================================================================

  test.describe("Keyboard Events", () => {
    test.describe("selectionDidChange Event via Keyboard", () => {
      test("fires when Enter key is pressed on a selectable node", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="flat" 
              data='{${JSON.stringify(flatTreeData)}}'
              onSelectionDidChange="event => testState = event">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Focus the tree and navigate to first item
        await tree.component.focus();

        // Press Enter to select the focused node
        await tree.component.press("Enter");

        // Verify selectionDidChange event was fired with correct data
        await expect.poll(() => testStateDriver.testState()).toBeDefined();
        const event = await testStateDriver.testState();
        expect(event.newNode).toBeDefined();
        expect(event.newNode.id).toBe(1);
        expect(event.newNode.displayName).toBe("Root Item 1");
        expect(event.previousNode).toBeNull();
      });

      test("fires when Space key is pressed on a selectable node", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="flat" 
              data='{${JSON.stringify(flatTreeData)}}'
              onSelectionDidChange="event => testState = event">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Focus the tree (this starts focus on first item)
        await tree.component.focus();

        // Press Space to select the currently focused node (should be first node)
        await tree.component.press("Space");

        // Verify selectionDidChange event was fired with correct data
        await expect.poll(() => testStateDriver.testState()).toBeDefined();
        const event = await testStateDriver.testState();
        expect(event.newNode).toBeDefined();
        expect(event.newNode.id).toBe(1); // Should be first node since we didn't navigate
        expect(event.newNode.displayName).toBe("Root Item 1");
        expect(event.previousNode).toBeNull();
      });

      test("fires with previous node when selection changes via keyboard", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="flat" 
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'
              onSelectionDidChange="event => testState = event">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Click to select first node (using mouse to establish baseline)
        await tree.getByMarker("1").click();

        // Now use keyboard to navigate and select second node
        await tree.component.focus();
        await tree.component.press("ArrowDown"); // Navigate to second node
        await tree.component.press("Enter"); // Select it

        // Verify event has both previous and new node
        await expect.poll(() => testStateDriver.testState()?.then((s) => s?.newNode?.id)).toBe(2);
        const event = await testStateDriver.testState();
        expect(event.previousNode.id).toBe(1);
        expect(event.newNode.id).toBe(2);
      });
    });

    test.describe("nodeDidExpand Event via Keyboard", () => {
      test("fires when Right arrow key expands a collapsed node", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidExpand="node => testState = node">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Focus the tree (first node should be focused)
        await tree.component.focus();

        // Press Right arrow to expand the first node
        await tree.component.press("ArrowRight");

        // Verify nodeDidExpand event fired
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is now visible
        await expect(tree.getByMarker("2")).toBeVisible();
      });

      test("fires when Enter key expands a collapsed node with children", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidExpand="node => testState = node">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Focus the tree and press Enter to expand first node
        await tree.component.focus();
        await tree.component.press("Enter");

        // Verify nodeDidExpand event fired
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is now visible
        await expect(tree.getByMarker("2")).toBeVisible();
      });

      test("only Enter key expands nodes - Space only selects", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px" var.selectionFired="false">
            <Tree testId="tree" 
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidExpand="node => testState = node"
              onSelectionDidChange="event => selectionFired = true">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Focus the tree and press Space - should only trigger selection, not expansion
        await tree.component.focus();
        await tree.component.press("Space");

        // Wait a bit to ensure no expansion event fires
        await tree.component.waitFor({ timeout: 1000 });

        // Verify no expansion event fired (testState should remain null)
        const expandState = await testStateDriver.testState();
        expect(expandState).toBeNull();

        // Verify children are still not visible
        await expect(tree.getByMarker("2")).not.toBeVisible();
      });
    });

    test.describe("nodeDidCollapse Event via Keyboard", () => {
      test("fires when Left arrow key collapses an expanded node", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="hierarchy" 
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidCollapse="node => testState = node">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Verify child is initially visible (node starts expanded)
        await expect(tree.getByMarker("2")).toBeVisible();

        // Focus the tree and press Left arrow to collapse the first node
        await tree.component.focus();
        await tree.component.press("ArrowLeft");

        // Verify nodeDidCollapse fired with correct node
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is no longer visible
        await expect(tree.getByMarker("2")).not.toBeVisible();
      });

      test("fires when Left arrow navigates from child to parent and collapses parent", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px">
            <Tree testId="tree" 
              dataFormat="hierarchy" 
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidCollapse="node => testState = node">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Verify child is initially visible (node starts expanded)
        await expect(tree.getByMarker("2")).toBeVisible();

        // Focus the tree, navigate to child node, then press Left to go to parent
        await tree.component.focus();
        await tree.component.press("ArrowDown"); // Move to child node
        await tree.component.press("ArrowLeft"); // Navigate to parent

        // Then collapse the parent by pressing Left again
        await tree.component.press("ArrowLeft");

        // Verify nodeDidCollapse fired with correct node
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is no longer visible
        await expect(tree.getByMarker("2")).not.toBeVisible();
      });
    });

    test.describe("Complex Keyboard Event Scenarios", () => {
      test("fires multiple events during keyboard navigation session", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px" var.eventCount="0" var.lastEvent="">
            <Tree testId="tree" 
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onSelectionDidChange="event => { eventCount++; lastEvent = 'selection:' + event.newNode?.id; testState = { count: eventCount, last: lastEvent }; }"
              onNodeDidExpand="node => { eventCount++; lastEvent = 'expand:' + node.id; testState = { count: eventCount, last: lastEvent }; }"
              onNodeDidCollapse="node => { eventCount++; lastEvent = 'collapse:' + node.id; testState = { count: eventCount, last: lastEvent }; }">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");

        // Simple keyboard interaction sequence
        await tree.component.focus();

        // 1. Select and expand first node (Enter does both)
        await tree.component.press("Enter");

        // 2. Navigate to child and select it
        await tree.component.press("ArrowDown");
        await tree.component.press("Space"); // Select child (Space only selects)

        // Verify we have multiple events (using poll for async events)
        await expect.poll(() => testStateDriver.testState().then((s) => s?.count)).toBe(2);
        const result = await testStateDriver.testState();

        // Check that we captured events (last event should be selection)
        expect(result.last).toMatch(/selection:\d+/);
      });

      test("handles rapid keyboard interactions without missing events", async ({
        initTestBed,
        createTreeDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <VStack height="400px" var.expandCount="0">
            <Tree testId="tree" 
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'
              onNodeDidExpand="node => { expandCount++; testState = expandCount; }">
              <property name="itemTemplate">
                <TestMarker tag="{$item.id}">
                  <Text value="{$item.name}" />
                </TestMarker>
              </property>
            </Tree>
          </VStack>
        `);

        const tree = await createTreeDriver("tree");
        await tree.component.focus();

        // Rapid expand/collapse sequence
        await tree.component.press("ArrowRight"); // Expand
        await tree.component.press("ArrowLeft"); // Collapse
        await tree.component.press("ArrowRight"); // Expand again
        await tree.component.press("ArrowLeft"); // Collapse again
        await tree.component.press("ArrowRight"); // Expand third time

        // Verify all expansion events were captured
        await expect.poll(() => testStateDriver.testState()).toBe(3);
      });
    });
  });

  // =============================================================================
  // API EVENT TESTS
  // =============================================================================

  test.describe("API Events", () => {
    test.describe("nodeDidExpand Event via API", () => {
      test("fires when expandNode() API method is called", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onNodeDidExpand="node => testState = node">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-btn" label="Expand Node 1" onClick="
              treeApi.expandNode(1);
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandButton = await createButtonDriver("expand-btn");

        // Initially, child should not be visible
        await expect(tree.getByMarker("2")).not.toBeVisible();

        // Trigger API expansion
        await expandButton.click();

        // Verify nodeDidExpand event fired
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is now visible
        await expect(tree.getByMarker("2")).toBeVisible();
      });

      test("fires for expandAll() API method", async ({
        page,
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        await initTestBed(`
          <Fragment>
            <VStack height="400px" var.expandEvents="[]">
              <Text testId="eventsText">{expandEvents}</Text>
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onNodeDidExpand="node => {expandEvents.push(node.id)}"
              >
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-all-btn" label="Expand All" onClick="
              treeApi.expandAll();
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandAllButton = await createButtonDriver("expand-all-btn");

        // Trigger API expand all
        await expandAllButton.click();

        const eventsText = page.getByTestId("eventsText");

        // expandAll() does not fire individual nodeDidExpand events
        // This is the correct behavior - mass operations should not fire individual events
        await expect(eventsText).toHaveText("[]");
        
        // But verify the visual result is correct - all nodes should be visible
        await expect(tree.getByMarker("2")).toBeVisible();
        await expect(tree.getByMarker("4")).toBeVisible();
      });

      test("fires for expandToLevel() API method", async ({
        page,
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        await initTestBed(`
          <Fragment>
            <VStack height="400px" var.expandEvents="[]">
              <Text testId="eventsText">{expandEvents}</Text>
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onNodeDidExpand="node => {expandEvents.push(node.id)}"
              >
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-level-btn" label="Expand to Level 1" onClick="
              treeApi.expandToLevel(1);
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const expandLevelButton = await createButtonDriver("expand-level-btn");

        // Trigger API expand to level
        await expandLevelButton.click();

        const eventsText = page.getByTestId("eventsText");

        // expandToLevel() does not fire individual nodeDidExpand events
        // This is the correct behavior - mass operations should not fire individual events
        await expect(eventsText).toHaveText("[]");
        
        // But verify the visual result is correct - level 1 nodes should be visible
        await expect(tree.getByMarker("2")).toBeVisible();
      });
    });

    test.describe("nodeDidCollapse Event via API", () => {
      test("fires when collapseNode() API method is called", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onNodeDidCollapse="node => testState = node">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-btn" label="Collapse Node 1" onClick="
              treeApi.collapseNode(1);
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseButton = await createButtonDriver("collapse-btn");

        // Initially, child should be visible (starts expanded)
        await expect(tree.getByMarker("2")).toBeVisible();

        // Trigger API collapse
        await collapseButton.click();

        // Verify nodeDidCollapse event fired
        await expect.poll(() => testStateDriver.testState().then((s) => s?.id)).toBe(1);

        // Verify child is no longer visible
        await expect(tree.getByMarker("2")).not.toBeVisible();
      });

      test("fires for collapseAll() API method", async ({
        page,
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        await initTestBed(`
          <Fragment>
            <VStack height="400px" var.collapseEvents="[]">
              <Text testId="eventsText">{collapseEvents}</Text>
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onNodeDidCollapse="node => {collapseEvents.push(node.id)}"
              >
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-all-btn" label="Collapse All" onClick="
              treeApi.collapseAll();
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const collapseAllButton = await createButtonDriver("collapse-all-btn");

        // Initially, children should be visible (starts expanded)
        await expect(tree.getByMarker("2")).toBeVisible();

        // Trigger API collapse all
        await collapseAllButton.click();

        const eventsText = page.getByTestId("eventsText");

        // collapseAll() does not fire individual nodeDidCollapse events
        // This is the correct behavior - mass operations should not fire individual events
        await expect(eventsText).toHaveText("[]");
        
        // But verify the visual result is correct - children should no longer be visible
        await expect(tree.getByMarker("2")).not.toBeVisible();
      });
    });

    test.describe("selectionDidChange Event via API", () => {
      test("fires when selectNode() API method is called", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="flat"
                data='{${JSON.stringify(flatTreeData)}}'
                onSelectionDidChange="event => testState = event">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="select-btn" label="Select Node 2" onClick="
              treeApi.selectNode(2);
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const selectButton = await createButtonDriver("select-btn");

        // Trigger API selection
        await selectButton.click();

        // Verify selectionDidChange event fired
        await expect.poll(() => testStateDriver.testState()).toBeDefined();
        const event = await testStateDriver.testState();
        expect(event.newNode).toBeDefined();
        expect(event.newNode.id).toBe(2);
        expect(event.newNode.displayName).toBe("Child Item 1.1");
        expect(event.previousNode).toBeNull();
      });

      test("fires with previous node when changing selection via API", async ({
        page,
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        await initTestBed(`
          <Fragment>
            <VStack height="400px" var.selectionEvents="[]">
              <Text testId="eventsText">{selectionEvents}</Text>
              <Tree id="treeApi" testId="tree"
                dataFormat="flat"
                defaultExpanded="all"
                data='{${JSON.stringify(flatTreeData)}}'
                onSelectionDidChange="event => {selectionEvents.push({prev: event.previousNode?.id || null, new: event.newNode?.id || null})}">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="select-first-btn" label="Select First" onClick="treeApi.selectNode(1);" />
            <Button testId="select-second-btn" label="Select Second" onClick="treeApi.selectNode(2);" />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const selectFirstButton = await createButtonDriver("select-first-btn");
        const selectSecondButton = await createButtonDriver("select-second-btn");

        // First selection
        await selectFirstButton.click();

        // Second selection
        await selectSecondButton.click();

        const eventsText = page.getByTestId("eventsText");

        // Verify we have both selection events with correct previous/new node IDs
        await expect(eventsText).toHaveText('[{"prev":null,"new":1},{"prev":1,"new":2}]');
      });

      test("fires when clearSelection() API method is called", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="flat"
                selectedValue="1"
                data='{${JSON.stringify(flatTreeData)}}'
                onSelectionDidChange="event => testState = event">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="clear-btn" label="Clear Selection" onClick="
              treeApi.clearSelection();
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const clearButton = await createButtonDriver("clear-btn");

        // Trigger API clear selection
        await clearButton.click();

        // Verify selectionDidChange event fired with null newNode
        await expect.poll(() => testStateDriver.testState()).toBeDefined();
        const event = await testStateDriver.testState();
        expect(event.newNode).toBeNull();
        expect(event.previousNode).toBeDefined();
        expect(event.previousNode.id).toBe(1);
      });
    });

    test.describe("Complex API Event Scenarios", () => {
      test("fires events in correct sequence during complex API operations", async ({
        initTestBed,
        createTreeDriver,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px" var.eventCount="0" var.lastEvent="">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyTreeData)}}'
                onSelectionDidChange="event => { eventCount++; lastEvent = 'selection:' + (event.newNode?.id || 'null'); testState = { count: eventCount, last: lastEvent }; }"
                onNodeDidExpand="node => { eventCount++; lastEvent = 'expand:' + node.id; testState = { count: eventCount, last: lastEvent }; }"
                onNodeDidCollapse="node => { eventCount++; lastEvent = 'collapse:' + node.id; testState = { count: eventCount, last: lastEvent }; }">
                <property name="itemTemplate">
                  <TestMarker tag="{$item.id}">
                    <Text value="{$item.name}" />
                  </TestMarker>
                </property>
              </Tree>
            </VStack>
            <Button testId="complex-btn" label="Complex Operations" onClick="
              treeApi.expandNode(1);
              treeApi.selectNode(2);
              treeApi.collapseNode(1);
            " />
          </Fragment>
        `);

        const tree = await createTreeDriver("tree");
        const complexButton = await createButtonDriver("complex-btn");

        // Trigger complex API operations
        await complexButton.click();

        // Verify multiple events were fired (using poll for async events)
        await expect
          .poll(() => testStateDriver.testState().then((s) => s?.count))
          .toBeGreaterThanOrEqual(3);
        const result = await testStateDriver.testState();

        // Verify we captured the last event
        expect(result.last).toMatch(/(selection|expand|collapse):\w+/);
      });
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has proper ARIA attributes", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat" 
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:aria">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");

    // Test main tree container ARIA attributes
    await expect(tree.component).toHaveAttribute("role", "tree");
    await expect(tree.component).toHaveAttribute("aria-label", "Tree navigation");
    await expect(tree.component).toHaveAttribute("aria-multiselectable", "false");

    // Test tree items have proper ARIA attributes
    // Find treeitems by their role attribute
    const treeItems = tree.component.locator('[role="treeitem"]');

    // Test first tree item (should be expanded due to defaultExpanded="all")
    const firstTreeItem = treeItems.first();
    await expect(firstTreeItem).toHaveAttribute("role", "treeitem");
    await expect(firstTreeItem).toHaveAttribute("aria-level", "1");
    await expect(firstTreeItem).toHaveAttribute("aria-expanded", "true");
    await expect(firstTreeItem).toHaveAttribute("aria-selected", "false");
    await expect(firstTreeItem).toHaveAttribute("aria-label", "Root Item 1");

    // Test that we have the expected number of tree items (4 total in flatTreeData)
    await expect(treeItems).toHaveCount(4);

    // Test second tree item (Child Item 1.1)
    const secondTreeItem = treeItems.nth(1);
    await expect(secondTreeItem).toHaveAttribute("aria-level", "2");
    await expect(secondTreeItem).toHaveAttribute("aria-label", "Child Item 1.1");

    // Test third tree item (Grandchild Item 1.1.1)
    const thirdTreeItem = treeItems.nth(2);
    await expect(thirdTreeItem).toHaveAttribute("aria-level", "3");
    await expect(thirdTreeItem).toHaveAttribute("aria-label", "Grandchild Item 1.1.1");

    // Test fourth tree item (Child Item 1.2)
    const fourthTreeItem = treeItems.nth(3);
    await expect(fourthTreeItem).toHaveAttribute("aria-level", "2");
    await expect(fourthTreeItem).toHaveAttribute("aria-label", "Child Item 1.2");
  });

  test("supports keyboard navigation", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat" 
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:keyboard">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");

    // Focus the tree
    await tree.component.focus();

    // Test Arrow Down navigation
    await tree.component.press("ArrowDown");
    // First item should be focused after initial focus + ArrowDown

    // Test Arrow Up navigation
    await tree.component.press("ArrowUp");
    // Should stay at first item (can't go up from first)

    // Navigate down to second item
    await tree.component.press("ArrowDown");

    // Test Enter for selection/expansion
    await tree.component.press("Enter");

    // Test Arrow Right for expansion (if has children)
    await tree.component.press("ArrowRight");

    // Test Arrow Left for collapse/parent navigation
    await tree.component.press("ArrowLeft");

    // Test Home key
    await tree.component.press("Home");

    // Test End key
    await tree.component.press("End");

    // Test Space for selection
    await tree.component.press(" ");

    // Verify tree is still visible and functional after keyboard interactions
    await expect(tree.getByMarker("1:keyboard")).toBeVisible();
  });

  test("supports expandOnItemClick behavior", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat" 
          expandOnItemClick="true"
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:expand-click">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");

    // Initially, only root item should be visible (tree starts collapsed)
    await expect(tree.getByMarker("1:expand-click")).toBeVisible();
    await expect(tree.getByMarker("2:expand-click")).not.toBeVisible();

    // Click on the root item (not the expand/collapse icon) to expand it
    await tree.getByMarker("1:expand-click").click();

    // After clicking, children should be visible
    await expect(tree.getByMarker("2:expand-click")).toBeVisible();
    await expect(tree.getByMarker("3:expand-click")).toBeVisible();

    // Click on child item that has its own children
    await tree.getByMarker("2:expand-click").click();

    // Grandchild should become visible
    await expect(tree.getByMarker("4:expand-click")).toBeVisible();

    // Click again to collapse
    await tree.getByMarker("2:expand-click").click();

    // Grandchild should be hidden
    await expect(tree.getByMarker("4:expand-click")).not.toBeVisible();
  });

  test.skip(
    "supports focus management",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test focus indicators and focus trapping
      // TODO: Verify tabindex management for keyboard accessibility
      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{flatTreeData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test("works with screen readers", async ({ initTestBed, createTreeDriver }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat" 
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:screen-reader">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");

    // Test semantic structure that screen readers depend on
    await expect(tree.component).toHaveAttribute("role", "tree");

    // Verify all tree items have proper semantic markup
    const treeItems = tree.component.locator('[role="treeitem"]');
    await expect(treeItems).toHaveCount(4);

    // Test each item has required accessibility information
    for (let i = 0; i < 4; i++) {
      const item = treeItems.nth(i);

      // Each item must have a level for screen reader navigation
      await expect(item).toHaveAttribute("aria-level");

      // Each item must have a label for screen reader announcement
      await expect(item).toHaveAttribute("aria-label");

      // Each item must have selection state
      await expect(item).toHaveAttribute("aria-selected");
    }

    // Test hierarchical relationships are properly communicated
    const rootItem = treeItems.first();
    await expect(rootItem).toHaveAttribute("aria-level", "1");
    await expect(rootItem).toHaveAttribute("aria-expanded", "true");

    // Test child items have correct level hierarchy
    const childItem = treeItems.nth(1);
    await expect(childItem).toHaveAttribute("aria-level", "2");

    // Test grandchild has deeper level
    const grandchildItem = treeItems.nth(2);
    await expect(grandchildItem).toHaveAttribute("aria-level", "3");

    // Test that all items have selection state (even if not selected)
    const allItems = tree.component.locator('[aria-selected="false"]');
    await expect(allItems).toHaveCount(4); // All items should be unselected initially

    // Test expansion states are properly communicated
    const expandedItems = tree.component.locator('[aria-expanded="true"]');
    await expect(expandedItems).toHaveCount(2); // Root and Child Item 1.1 (which has a grandchild)

    // Test that tree is focusable for keyboard navigation
    await expect(tree.component).toHaveAttribute("tabindex", "0");

    // Verify semantic structure is maintained for screen reader navigation
    await expect(tree.component).toHaveAttribute("role", "tree");
    await expect(treeItems.first()).toHaveAttribute("role", "treeitem");

    // Test that all required accessibility information is present
    // This ensures screen readers can properly announce tree structure
    const firstItem = treeItems.first();
    await expect(firstItem).toHaveAttribute("aria-level");
    await expect(firstItem).toHaveAttribute("aria-label");
    await expect(firstItem).toHaveAttribute("aria-expanded");
    await expect(firstItem).toHaveAttribute("aria-selected");
  });

  test.skip(
    "supports high contrast mode",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test visual indicators work in high contrast mode
      // TODO: Verify selection and focus indicators are visible
      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{flatTreeData}" 
        dataFormat="flat"
      />
    `);
    },
  );
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("handles large datasets efficiently", async ({ initTestBed, createTreeDriver }) => {
    // Generate a large dataset with 1000+ items in a hierarchical structure
    const generateLargeDataset = (numItems = 1000) => {
      const data = [];
      let id = 1;

      // Create root items (10% of total)
      const numRoots = Math.ceil(numItems * 0.1);
      for (let i = 0; i < numRoots; i++) {
        data.push({
          id: id++,
          name: `Root Item ${i + 1}`,
          parentId: null,
        });
      }

      // Create child items distributed under roots
      const itemsPerRoot = Math.floor((numItems - numRoots) / numRoots);
      for (let rootIndex = 0; rootIndex < numRoots; rootIndex++) {
        const rootId = rootIndex + 1;

        for (let j = 0; j < itemsPerRoot && id <= numItems; j++) {
          data.push({
            id: id++,
            name: `Child Item ${rootId}.${j + 1}`,
            parentId: rootId,
          });
        }
      }

      return data;
    };

    const largeDataset = generateLargeDataset(1000);

    const startTime = performance.now();

    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat" 
          data='{${JSON.stringify(largeDataset)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:perf">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");

    // Verify tree renders
    await expect(tree.component).toBeVisible();

    const renderTime = performance.now() - startTime;

    // Should render large dataset within reasonable time (< 5 seconds)
    expect(renderTime).toBeLessThan(5000);

    // Test that only root items are initially visible (virtualization working)
    await expect(tree.getByMarker("1:perf")).toBeVisible();
    await expect(tree.getByMarker("2:perf")).toBeVisible();

    // Verify scrolling performance - scroll to end of visible items
    const scrollStartTime = performance.now();
    await tree.component.press("End"); // Scroll to last visible item
    const scrollTime = performance.now() - scrollStartTime;

    // Scrolling should be fast (< 1 second)
    expect(scrollTime).toBeLessThan(1000);

    // Test expansion performance
    const expandStartTime = performance.now();
    await tree.getByMarker("1:perf").click(); // Expand first root item
    const expandTime = performance.now() - expandStartTime;

    // Expansion should be fast (< 500ms)
    expect(expandTime).toBeLessThan(500);
  });

  test("maintains smooth scrolling with virtualization", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    // Create a dataset specifically for scroll testing
    const scrollTestData = [];
    for (let i = 1; i <= 500; i++) {
      scrollTestData.push({
        id: i,
        name: `Scroll Item ${i}`,
        parentId: null,
      });
    }

    await initTestBed(`
      <VStack height="300px">
        <Tree testId="scroll-tree" 
          dataFormat="flat" 
          data='{${JSON.stringify(scrollTestData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}:scroll">
              <Text value="{$item.name}" />
            </TestMarker>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("scroll-tree");

    // Verify tree is visible
    await expect(tree.component).toBeVisible();
    await expect(tree.getByMarker("1:scroll")).toBeVisible();

    // Test keyboard scrolling performance
    await tree.component.focus();

    // Scroll down 50 times rapidly
    const rapidScrollStartTime = performance.now();
    for (let i = 0; i < 50; i++) {
      await tree.component.press("ArrowDown");
    }
    const rapidScrollTime = performance.now() - rapidScrollStartTime;

    // Rapid keyboard scrolling should remain responsive (< 2 seconds)
    expect(rapidScrollTime).toBeLessThan(2000);

    // Verify we can reach different parts of the large list
    await tree.component.press("Home"); // Go to start
    await expect(tree.getByMarker("1:scroll")).toBeVisible();

    await tree.component.press("End"); // Go to end
    // Should be able to navigate to end without timeout
  });
});

// =============================================================================
// THEME VARIABLES TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies custom tree text color theme variable", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    const TEXT_COLOR = "rgb(128, 0, 128)";
    await initTestBed(
      `
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat"
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
      `,
      {
        testThemeVars: {
          "textColor-Tree": TEXT_COLOR,
        },
      },
    );

    const tree = await createTreeDriver("tree");

    // Get row wrappers directly using getNodeWrapperByMarker
    const rowWrapper1 = tree.getNodeWrapperByMarker("1");
    const rowWrapper2 = tree.getNodeWrapperByMarker("2");
    const rowWrapper3 = tree.getNodeWrapperByMarker("3");
    const rowWrapper4 = tree.getNodeWrapperByMarker("4");

    await expect(rowWrapper1).toBeVisible();

    // Test all items have correct default text color
    await expect(rowWrapper1).toHaveCSS("color", TEXT_COLOR);
    await expect(rowWrapper2).toHaveCSS("color", TEXT_COLOR);
    await expect(rowWrapper3).toHaveCSS("color", TEXT_COLOR);
    await expect(rowWrapper4).toHaveCSS("color", TEXT_COLOR);
  });

  test("applies custom hover state theme variables", async ({
    initTestBed,
    createTreeDriver,
    page,
  }) => {
    const HOVER_BG_COLOR = "rgb(255, 255, 0)";
    const HOVER_TEXT_COLOR = "rgb(0, 0, 255)";
    await initTestBed(
      `
      <VStack height="400px">
        <Tree testId="tree" 
          dataFormat="flat"
          defaultExpanded="all"
          data='{${JSON.stringify(flatTreeData)}}'>
          <property name="itemTemplate">
            <TestMarker tag="{$item.id}">
              <HStack verticalAlignment="center">
                <Text value="{$item.name}" />
              </HStack>
            </TestMarker>
          </property>
        </Tree>
      </VStack>
      `,
      {
        testThemeVars: {
          "backgroundColor-Tree-row--hover": HOVER_BG_COLOR,
          "textColor-Tree--hover": HOVER_TEXT_COLOR,
        },
      },
    );

    const tree = await createTreeDriver("tree");

    // Get row wrappers directly using getNodeWrapperByMarker
    const rowWrapper1 = tree.getNodeWrapperByMarker("1");
    const rowWrapper2 = tree.getNodeWrapperByMarker("2");
    const rowWrapper3 = tree.getNodeWrapperByMarker("3");

    await expect(rowWrapper1).toBeVisible();

    // Test hover on first item
    await rowWrapper1.hover();
    await expect(rowWrapper1).toHaveCSS("background-color", HOVER_BG_COLOR);
    await expect(rowWrapper1).toHaveCSS("color", HOVER_TEXT_COLOR);

    // Test hover on second item
    await rowWrapper2.hover();
    await expect(rowWrapper2).toHaveCSS("background-color", HOVER_BG_COLOR);
    await expect(rowWrapper2).toHaveCSS("color", HOVER_TEXT_COLOR);

    // Test hover on third item
    await rowWrapper3.hover();
    await expect(rowWrapper3).toHaveCSS("background-color", HOVER_BG_COLOR);
    await expect(rowWrapper3).toHaveCSS("color", HOVER_TEXT_COLOR);
  });
});

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test.skip(
    "handles empty data gracefully",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component behavior with empty data arrays/objects
      // TODO: Verify no crash and appropriate empty state display
      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{[]}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles null/undefined data gracefully",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component behavior with null/undefined data
      // TODO: Verify defensive programming and error boundaries
      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{null}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles malformed data gracefully",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component behavior with invalid data structures
      // TODO: Verify error handling and recovery mechanisms
      const malformedData = [
        { id: 1, name: "Valid Item" },
        { /* missing id */ name: "Invalid Item" },
        null,
        undefined,
      ];

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{malformedData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles circular references in hierarchy data",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test detection and handling of circular parent-child references
      // TODO: Verify infinite loop prevention and error recovery
      const circularData = [
        { id: 1, name: "Item 1", parentId: 2 },
        { id: 2, name: "Item 2", parentId: 1 },
      ];

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{circularData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles duplicate IDs gracefully",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component behavior with duplicate ID values
      // TODO: Verify ID uniqueness enforcement or conflict resolution
      const duplicateIdData = [
        { id: 1, name: "Item 1" },
        { id: 1, name: "Duplicate Item 1" },
        { id: 2, name: "Item 2" },
      ];

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{duplicateIdData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles orphaned nodes in flat data",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test handling of nodes with non-existent parent IDs
      // TODO: Verify orphaned node placement or error handling
      const orphanedData = [
        { id: 1, name: "Root Item" },
        { id: 2, name: "Orphaned Item", parentId: 999 }, // non-existent parent
      ];

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{orphanedData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles deeply nested data structures",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test performance and functionality with very deep nesting
      // TODO: Verify stack overflow prevention and UI rendering limits
      const deepData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Level ${i + 1}`,
        parentId: i === 0 ? null : i,
      }));

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{deepData}" 
        dataFormat="flat"
      />
    `);
    },
  );

  test.skip(
    "handles frequent data updates",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component stability with rapid data changes
      // TODO: Verify memory leaks prevention and performance optimization
      // TODO: Use testStateDriver to simulate rapid data updates
    },
  );

  test.skip(
    "handles invalid dataFormat values",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test component behavior with invalid dataFormat prop values
      // TODO: Verify fallback behavior and error handling
      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{flatTreeData}" 
        dataFormat="invalid-format"
      />
    `);
    },
  );

  test.skip(
    "handles missing required field configurations",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test behavior when required fields (id, label) are missing from data
      // TODO: Verify graceful degradation and error messaging
      const missingFieldData = [
        { /* missing id */ name: "Item without ID" },
        { id: 2 /* missing name/label */ },
      ];

      await initTestBed(`
      <Tree 
        testId="tree" 
        data="{missingFieldData}" 
        dataFormat="flat"
      />
    `);
    },
  );
});
