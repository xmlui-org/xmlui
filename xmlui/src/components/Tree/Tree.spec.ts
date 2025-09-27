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
  { uid: 100, displayName: "Root Item 1", parentUid: null },
  { uid: 101, displayName: "Child Item 1.1", parentUid: 100 },
  { uid: 102, displayName: "Child Item 1.2", parentUid: 100 },
  { uid: 103, displayName: "Grandchild Item 1.1.1", parentUid: 101 },
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
    uid: 100,
    displayName: "Root Item 1",
    subNodes: [
      {
        uid: 101,
        displayName: "Child Item 1.1",
        subNodes: [{ uid: 103, displayName: "Grandchild Item 1.1.1", subNodes: [] }],
      },
      { uid: 102, displayName: "Child Item 1.2", subNodes: [] },
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

  test("handles alternative field names (uid, displayName, parentUid)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="flat" 
            defaultExpanded="all"
            idField="uid"
            labelField="displayName"
            parentField="parentUid"
            data='{${JSON.stringify(customFieldsData2)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.uid}:{$item.depth}">
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

  test("handles alternative hierarchy field names (uid, displayName, subNodes)", async ({
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
        <VStack height="400px">
          <Tree testId="tree" 
            dataFormat="hierarchy" 
            defaultExpanded="all"
            idField="uid"
            labelField="displayName"
            childrenField="subNodes"
            data='{${JSON.stringify(customFieldsHierarchy2)}}'>
            <property name="itemTemplate">
              <TestMarker tag="{$item.uid}:{$item.depth}">
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
    test.skip(
      "handles selectedValue property",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test selectedValue prop sets initial selection in source ID format
        // TODO: Verify selected item is highlighted with proper CSS classes
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          selectedValue="2"
        />
      `);
      },
    );

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
      "supports programmatic selection changes",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test changing selectedValue prop updates selection
        // TODO: Verify selection state synchronization with external control
        // TODO: Use testStateDriver to update selection value
      },
    );

    test.skip(
      "fires selectionChanged event",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test onSelectionChanged event with correct TreeSelectionEvent structure
        // TODO: Verify event includes selectedValue, selectedUid, and selectedNode data
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          onSelectionChanged="event => testState = event"
        />
      `);
      },
    );

    test.skip(
      "handles null/undefined selection gracefully",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test clearing selection with null/undefined selectedValue
        // TODO: Verify no selection highlighting when selection is cleared
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          selectedValue="{null}"
        />
      `);
      },
    );

    test.skip(
      "handles invalid selection values gracefully",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test selection with non-existent ID values
        // TODO: Verify component doesn't crash with invalid selection
        await initTestBed(`
        <Tree 
          testId="tree" 
          data="{flatTreeData}" 
          dataFormat="flat"
          selectedValue="999"
        />
      `);
      },
    );
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
    test.skip(
      "exposes expand method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative expand(id) method
        // TODO: Verify method expands specific node by ID
        // TODO: Use component ref to call imperative methods
      },
    );

    test.skip(
      "exposes collapse method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative collapse(id) method
        // TODO: Verify method collapses specific node by ID
      },
    );

    test.skip(
      "exposes expandAll method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative expandAll() method
        // TODO: Verify method expands all expandable nodes
      },
    );

    test.skip(
      "exposes collapseAll method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative collapseAll() method
        // TODO: Verify method collapses all expanded nodes
      },
    );

    test.skip(
      "exposes scrollToItem method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative scrollToItem(id) method
        // TODO: Verify method scrolls to specific item in virtual list
      },
    );

    test.skip(
      "exposes getSelectedNode method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative getSelectedNode() method
        // TODO: Verify method returns current selection data
      },
    );

    test.skip(
      "exposes refreshData method",
      SKIP_REASON.TO_BE_IMPLEMENTED(),
      async ({ initTestBed, page }) => {
        // TODO: Test imperative refreshData() method
        // TODO: Verify method forces data re-processing and re-render
      },
    );
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip(
    "has proper ARIA attributes",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test tree role, aria-expanded, aria-selected attributes
      // TODO: Verify proper ARIA labeling and descriptions
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
    "supports keyboard navigation",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test Arrow keys for navigation (Up/Down/Left/Right)
      // TODO: Test Enter/Space for selection and expansion
      // TODO: Test Home/End for first/last item navigation
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

  test.skip(
    "works with screen readers",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test ARIA live regions for dynamic content updates
      // TODO: Verify accessible names and descriptions for tree items
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
// THEME VARIABLES TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test.skip(
    "applies custom tree background theme variable",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test backgroundColor-Tree theme variable
      // TODO: Verify custom background color is applied to tree container
      await initTestBed(`<Tree testId="tree" data="{flatTreeData}" dataFormat="flat"/>`, {
        testThemeVars: {
          "backgroundColor-Tree": "rgb(240, 240, 240)",
        },
      });
    },
  );

  test.skip(
    "applies custom tree item theme variables",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test tree item specific theme variables (hover, selected, etc.)
      // TODO: Verify custom styling is applied to tree items
      await initTestBed(`<Tree testId="tree" data="{flatTreeData}" dataFormat="flat"/>`, {
        testThemeVars: {
          "backgroundColor-TreeItem-selected": "rgb(0, 120, 215)",
          "backgroundColor-TreeItem-hover": "rgb(230, 230, 230)",
          "textColor-TreeItem": "rgb(0, 0, 0)",
        },
      });
    },
  );

  test.skip(
    "applies custom indentation theme variable",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test Tree indentation/padding theme variables
      // TODO: Verify custom indentation spacing for nested levels
      await initTestBed(`<Tree testId="tree" data="{flatTreeData}" dataFormat="flat"/>`, {
        testThemeVars: {
          "padding-TreeItem-indent": "2rem",
        },
      });
    },
  );

  test.skip(
    "applies custom icon theme variables",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, page }) => {
      // TODO: Test Tree icon size and color theme variables
      // TODO: Verify custom icon styling is applied
      await initTestBed(`<Tree testId="tree" data="{flatTreeData}" dataFormat="flat"/>`, {
        testThemeVars: {
          "fontSize-TreeItem-icon": "1.2rem",
          "textColor-TreeItem-icon": "rgb(100, 100, 100)",
        },
      });
    },
  );
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
