/**
 * Test Data for Step 3a: Flat to Native Transformation
 * This file contains test data structures for validating the flat data format
 * conversion to UnPackedTreeData format.
 */

// Test Case 1: Simple 2-level hierarchy
export const simpleFlatData = [
  { id: '1', name: 'Documents', icon: 'folder' },
  { id: '2', name: 'File.txt', icon: 'file', parentId: '1' },
  { id: '3', name: 'Photo.jpg', icon: 'image', parentId: '1' }
];

// Test Case 2: Multi-level hierarchy with mixed icons
export const multiLevelFlatData = [
  { id: 'root', name: 'Project', icon: 'folder' },
  { id: 'src', name: 'Source Code', icon: 'folder', parentId: 'root' },
  { id: 'docs', name: 'Documentation', icon: 'folder', parentId: 'root' },
  { id: 'app', name: 'App.tsx', icon: 'code', parentId: 'src' },
  { id: 'utils', name: 'Utils.ts', icon: 'code', parentId: 'src' },
  { id: 'readme', name: 'README.md', icon: 'markdown', parentId: 'docs' },
  { id: 'api', name: 'API.md', icon: 'markdown', parentId: 'docs' }
];

// Test Case 3: Deep nesting (4 levels)
export const deepFlatData = [
  { id: '1', name: 'Level 1', icon: 'folder' },
  { id: '2', name: 'Level 2', icon: 'folder', parentId: '1' },
  { id: '3', name: 'Level 3', icon: 'folder', parentId: '2' },
  { id: '4', name: 'Level 4 File', icon: 'file', parentId: '3' }
];

// Test Case 4: Multiple root nodes
export const multipleRootFlatData = [
  { id: 'root1', name: 'Root One', icon: 'folder' },
  { id: 'root2', name: 'Root Two', icon: 'folder' },
  { id: 'child1', name: 'Child of Root 1', icon: 'file', parentId: 'root1' },
  { id: 'child2', name: 'Child of Root 2', icon: 'file', parentId: 'root2' }
];

// Test Case 5: Custom field mapping
export const customFieldFlatData = [
  { uuid: 'A', title: 'Custom Root', type: 'directory' },
  { uuid: 'B', title: 'Custom Child', type: 'document', parent: 'A' }
];

// Test Case 6: Edge case - orphaned nodes (parentId references missing parent)
export const orphanedFlatData = [
  { id: '1', name: 'Valid Root', icon: 'folder' },
  { id: '2', name: 'Valid Child', icon: 'file', parentId: '1' },
  { id: '3', name: 'Orphaned Node', icon: 'file', parentId: 'missing-parent' }
];

// Test Case 7: Icon state properties (expanded/collapsed icons)
export const iconStateFlatData = [
  { 
    id: '1', 
    name: 'Expandable Folder', 
    icon: 'folder',
    iconExpanded: 'folder-open',
    iconCollapsed: 'folder-closed'
  },
  { 
    id: '2', 
    name: 'Nested Folder', 
    icon: 'folder',
    iconExpanded: 'folder-open',
    iconCollapsed: 'folder-closed',
    parentId: '1'
  },
  { id: '3', name: 'File in nested', icon: 'file', parentId: '2' }
];

// === Step 3b: Hierarchy Data Format Test Cases ===

// Test Case 1: Simple hierarchy structure 
export const simpleHierarchyData = {
  id: 'root',
  name: 'Project Root',
  icon: 'folder',
  children: [
    { id: 'file1', name: 'README.md', icon: 'code' },
    { id: 'file2', name: 'package.json', icon: 'code' }
  ]
};

// Test Case 2: Multi-level hierarchy
export const multiLevelHierarchyData = {
  id: 'workspace',
  name: 'Workspace',
  icon: 'folder',
  children: [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: 'folder',
      children: [
        {
          id: 'src',
          name: 'src',
          icon: 'folder',
          children: [
            { id: 'app', name: 'App.tsx', icon: 'code' },
            { id: 'index', name: 'index.ts', icon: 'code' }
          ]
        },
        { id: 'package', name: 'package.json', icon: 'code' }
      ]
    },
    {
      id: 'backend',
      name: 'Backend', 
      icon: 'folder',
      children: [
        { id: 'server', name: 'server.js', icon: 'code' }
      ]
    }
  ]
};

// Test Case 3: Array of hierarchy objects (multiple roots)
export const multiRootHierarchyData = [
  {
    id: 'proj1',
    name: 'Project Alpha',
    icon: 'folder',
    children: [
      { id: 'alpha1', name: 'alpha.js', icon: 'code' }
    ]
  },
  {
    id: 'proj2',
    name: 'Project Beta',
    icon: 'folder',
    children: [
      { id: 'beta1', name: 'beta.js', icon: 'code' }
    ]
  }
];

// Test Case 4: Custom field names in hierarchy
export const customHierarchyData = {
  uuid: 'root',
  title: 'Custom Hierarchy',
  type: 'folder',
  items: [
    { 
      uuid: 'child1', 
      title: 'Child Item', 
      type: 'code',
      items: [
        { uuid: 'grandchild', title: 'Grandchild', type: 'email' }
      ]
    }
  ]
};

// Expected output structure for validation
export const expectedSimpleOutput = {
  treeData: [
    {
      uid: 'flat_1',
      key: '1',
      path: ['Documents'],
      displayName: 'Documents',
      parentIds: [],
      selectable: true,
      icon: 'folder',
      children: [
        {
          uid: 'flat_2',
          key: '2',
          path: ['Documents', 'File.txt'],
          displayName: 'File.txt',
          parentIds: ['1'],
          selectable: true,
          icon: 'file',
          children: []
        },
        {
          uid: 'flat_3',
          key: '3',
          path: ['Documents', 'Photo.jpg'],
          displayName: 'Photo.jpg',
          parentIds: ['1'],
          selectable: true,
          icon: 'image',
          children: []
        }
      ]
    }
  ]
};

// Field configurations for testing
export const standardFieldConfig = {
  idField: 'id',
  labelField: 'name',
  iconField: 'icon',
  parentField: 'parentId'
};

export const customFieldConfig = {
  idField: 'uuid',
  labelField: 'title',
  iconField: 'type',
  parentField: 'parent'
};

export const iconStateFieldConfig = {
  idField: 'id',
  labelField: 'name',
  iconField: 'icon',
  iconExpandedField: 'iconExpanded',
  iconCollapsedField: 'iconCollapsed',
  parentField: 'parentId'
};

// Field configurations for hierarchy data
export const hierarchyFieldConfig = {
  idField: 'id',
  labelField: 'name',
  iconField: 'icon',
  childrenField: 'children'
};

export const customHierarchyFieldConfig = {
  idField: 'uuid',
  labelField: 'title',
  iconField: 'type',
  childrenField: 'items'
};

// Test scenarios for manual validation
export const testScenarios = [
  {
    name: 'Simple 2-level hierarchy',
    data: simpleFlatData,
    fieldConfig: standardFieldConfig,
    expectedNodes: 3,
    expectedRoots: 1,
    expectedMaxDepth: 2
  },
  {
    name: 'Multi-level with 3 depths',
    data: multiLevelFlatData,
    fieldConfig: standardFieldConfig,
    expectedNodes: 7,
    expectedRoots: 1,
    expectedMaxDepth: 3
  },
  {
    name: 'Deep nesting (4 levels)',
    data: deepFlatData,
    fieldConfig: standardFieldConfig,
    expectedNodes: 4,
    expectedRoots: 1,
    expectedMaxDepth: 4
  },
  {
    name: 'Multiple root nodes',
    data: multipleRootFlatData,
    fieldConfig: standardFieldConfig,
    expectedNodes: 4,
    expectedRoots: 2,
    expectedMaxDepth: 2
  },
  {
    name: 'Custom field mapping',
    data: customFieldFlatData,
    fieldConfig: customFieldConfig,
    expectedNodes: 2,
    expectedRoots: 1,
    expectedMaxDepth: 2
  },
  {
    name: 'Icon state properties',
    data: iconStateFlatData,
    fieldConfig: iconStateFieldConfig,
    expectedNodes: 3,
    expectedRoots: 1,
    expectedMaxDepth: 3
  }
];