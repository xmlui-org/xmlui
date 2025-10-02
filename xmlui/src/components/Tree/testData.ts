export const flatTreeData = [
  { id: 1, name: "Root Item 1", parentId: null },
  { id: 2, name: "Child Item 1.1", parentId: 1 },
  { id: 3, name: "Child Item 1.2", parentId: 1 },
  { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
];

export const hierarchyTreeData = [
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
export const customFieldsData1 = [
  { nodeId: "A1", title: "Root Item 1", parent: null },
  { nodeId: "A2", title: "Child Item 1.1", parent: "A1" },
  { nodeId: "A3", title: "Child Item 1.2", parent: "A1" },
  { nodeId: "A4", title: "Grandchild Item 1.1.1", parent: "A2" },
];

export const customFieldsData2 = [
  { id: 100, displayName: "Root Item 1", parentId: null },
  { id: 101, displayName: "Child Item 1.1", parentId: 100 },
  { id: 102, displayName: "Child Item 1.2", parentId: 100 },
  { id: 103, displayName: "Grandchild Item 1.1.1", parentId: 101 },
];

export const databaseStyleData = [
  { pk: "root-1", label: "Root Item 1", parent_id: null },
  { pk: "child-1", label: "Child Item 1.1", parent_id: "root-1" },
  { pk: "child-2", label: "Child Item 1.2", parent_id: "root-1" },
  { pk: "grandchild-1", label: "Grandchild Item 1.1.1", parent_id: "child-1" },
];

export const apiStyleData = [
  { key: "item1", text: "Root Item 1", parentKey: undefined },
  { key: "item2", text: "Child Item 1.1", parentKey: "item1" },
  { key: "item3", text: "Child Item 1.2", parentKey: "item1" },
  { key: "item4", text: "Grandchild Item 1.1.1", parentKey: "item2" },
];

// Test data with multiple independent branches for comprehensive defaultExpanded testing
export const multiBranchTreeData = [
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
export const flatDataWithIcons = [
  { id: 1, name: "Documents", icon: "folder", parentId: null },
  { id: 2, name: "Report.pdf", icon: "file-pdf", parentId: 1 },
  { id: 3, name: "Images", icon: "folder", parentId: null },
  { id: 4, name: "Photo.jpg", icon: "file-image", parentId: 3 },
];

export const customIconFieldData = [
  { nodeId: "A1", title: "Project", iconType: "project-folder", parent: null },
  { nodeId: "A2", title: "Source", iconType: "code-folder", parent: "A1" },
  { nodeId: "A3", title: "App.tsx", iconType: "typescript-file", parent: "A2" },
  { nodeId: "A4", title: "Utils.ts", iconType: "typescript-file", parent: "A2" },
];

export const dataWithStateIcons = [
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
export const customFieldsHierarchy1 = [
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

export const customFieldsHierarchy2 = [
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

export const databaseStyleHierarchy = [
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

export const apiStyleHierarchy = [
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
export const hierarchyDataWithIcons = [
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

export const customIconFieldHierarchy = [
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

export const hierarchyWithStateIcons = [
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

export const dynamicTreeData = [
  {
    id: 1,
    name: "Normal Node",
    children: [{ id: 2, name: "Child Node", children: [] }],
  },
  {
    id: 3,
    name: "Dynamic Node (no children)",
    dynamic: true,
    children: [],
  },
  {
    id: 4,
    name: "Regular Leaf Node",
    children: [],
  },
];

export const customDynamicTreeData = [
  {
    id: 1,
    name: "Normal Node",
    children: [{ id: 2, name: "Child Node", children: [] }],
  },
  {
    id: 3,
    name: "Dynamic Node (no children)",
    canLoadMore: true,
    children: [],
  },
  {
    id: 4,
    name: "Regular Leaf Node",
    children: [],
  },
];

export const dynamicFlatData = [
  {
    id: 1,
    name: "Normal Node",
    parentId: null,
  },
  {
    id: 2,
    name: "Child Node",
    parentId: 1,
  },
  {
    id: 3,
    name: "Dynamic Node (no children)",
    dynamic: true,
  },
  {
    id: 4,
    name: "Regular Leaf Node",
    parentId: null,
  },
];
