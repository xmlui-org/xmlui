# Tree Component Refactoring Plan

## Overview
Simplify the Tree component's data structure by supporting three data formats while maintaining backwards compatibility with the current complex `UnPackedTreeData` format.

## New Component API Specification

### Data Format Types

#### Native Format (Current)
```typescript
{
  treeData: TreeNode[];
  treeItemsById: Record<string, TreeNode>;
}
```

#### Flat Format (New)
```typescript
Array<{
  [idField]: string;                // Unique identifier
  [labelField]: string;             // Display text
  [iconField]?: string;             // Icon identifier (optional)
  [iconExpandedField]?: string;     // Expanded state icon (optional)
  [iconCollapsedField]?: string;    // Collapsed state icon (optional)
  [parentField]?: string;           // Parent ID (optional, null = root)
  // ...additional properties for itemTemplate
}>
```

#### Hierarchy Format (New)  
```typescript
{
  [idField]: string;                // Unique identifier
  [labelField]: string;             // Display text
  [iconField]?: string;             // Icon identifier (optional)
  [iconExpandedField]?: string;     // Expanded state icon (optional)
  [iconCollapsedField]?: string;    // Collapsed state icon (optional)
  [childrenField]?: Array<T>;       // Nested children (optional)
  // ...additional properties for itemTemplate
} | Array<T>
```

### New Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataFormat` | `"native" \| "flat" \| "hierarchy"` | `"native"` | Input data structure format |
| `idField` | `string` | `"id"` | Property name for unique identifiers |
| `labelField` | `string` | `"name"` | Property name for display text |
| `iconField` | `string` | `"icon"` | Property name for icon identifiers |
| `iconExpandedField` | `string` | `"iconExpanded"` | Property name for expanded state icons |
| `iconCollapsedField` | `string` | `"iconCollapsed"` | Property name for collapsed state icons |
| `parentField` | `string` | `"parentId"` | Property name for parent relationships (flat format) |
| `childrenField` | `string` | `"children"` | Property name for child arrays (hierarchy format) |
| `selectedValue` | `string` | `undefined` | Selected item ID in source data format |
| `expandedValues` | `string[]` | `[]` | Array of expanded item IDs in source data format |
| `defaultExpanded` | `"none" \| "all" \| "first-level" \| string[]` | `"none"` | Initial expansion state |
| `autoExpandToSelection` | `boolean` | `true` | Auto-expand path to selected item |
| `expandOnItemClick` | `boolean` | `false` | Enable expansion/collapse by clicking anywhere on the item |

### Deprecated Properties (Backwards Compatibility)

| Property | Replacement | Migration |
|----------|-------------|-----------|
| `selectedUid` | `selectedValue` | Maps to internal UID → source ID |
| `data` (UnPackedTreeData) | `data` with `dataFormat="native"` | No change required |

### New Events

#### selectionChanged
```typescript
interface TreeSelectionEvent {
  type: 'selection';
  selectedId: string;        // Source data ID
  selectedItem: any;         // Full source item
  selectedNode: TreeNode;    // Internal tree node
  previousId?: string;       // Previous selection
}
```

> **Future Consideration**: Multiple selection support will be added in a future iteration with `selectedValues: string[]` and enhanced event structure.

### Enhanced Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$item` | `any` | Current tree item (source data) |
| `$node` | `TreeNode` | Internal tree node representation |
| `$depth` | `number` | Nesting depth (0-based) |
| `$isExpanded` | `boolean` | Whether item is expanded |
| `$hasChildren` | `boolean` | Whether item has children |
| `$isSelected` | `boolean` | Whether item is selected |
| `$path` | `any[]` | Full path to item (source IDs) |
| `$icon` | `string` | Current appropriate icon (base/expanded/collapsed) |

### Exposed Methods API

Following the pattern from Queue component, Tree exposes these methods for programmatic control:

```typescript
// Node Expansion/Collapse Control
expandNode(nodeId: string): void                    // Expand a specific node by source ID
collapseNode(nodeId: string): void                  // Collapse a specific node by source ID
toggleNode(nodeId: string): void                    // Toggle expansion state of a node
expandAll(): void                                   // Expand all nodes in the tree
collapseAll(): void                                 // Collapse all nodes in the tree
expandToLevel(level: number): void                  // Expand nodes up to specified depth level

// Node Information & State Queries  
getNodeById(nodeId: string): TreeNodeInfo | null   // Get full node information by source ID
isNodeExpanded(nodeId: string): boolean             // Check if a node is currently expanded
hasChildren(nodeId: string): boolean                // Check if a node has children
getNodeDepth(nodeId: string): number                // Get the depth level of a node
getNodePath(nodeId: string): string[]               // Get the path from root to node (source IDs)
getParentId(nodeId: string): string | null          // Get the parent ID of a node
getChildrenIds(nodeId: string): string[]            // Get array of direct children IDs

// Selection Control
selectNode(nodeId: string): void                    // Programmatically select a node
clearSelection(): void                              // Clear current selection
getSelectedNode(): TreeNodeInfo | null              // Get currently selected node info

// Tree Structure Queries
getRootNodes(): TreeNodeInfo[]                      // Get all root-level nodes
getAllNodes(): TreeNodeInfo[]                       // Get all nodes in the tree
getVisibleNodes(): TreeNodeInfo[]                   // Get currently visible (not collapsed) nodes
findNodes(predicate: (node: any) => boolean): TreeNodeInfo[]  // Find nodes matching criteria

// Utility Methods
refreshTree(): void                                 // Force refresh of tree structure
getTreeStats(): TreeStats                          // Get tree statistics (total nodes, depth, etc.)
```

```typescript
// Supporting interfaces
interface TreeNodeInfo {
  id: string;           // Source data ID
  item: any;           // Original source item
  depth: number;       // Nesting depth (0-based)
  isExpanded: boolean; // Current expansion state
  hasChildren: boolean;// Whether node has children
  isSelected: boolean; // Whether node is selected
  path: string[];      // Path from root (source IDs)
  parentId?: string;   // Parent node ID (if any)
  childrenIds: string[]; // Direct children IDs
}

interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  expandedNodes: number;
  visibleNodes: number;
  rootNodes: number;
}
```

### Internal Utility Functions

```typescript
// Data transformation
flatToNative(flatData: any[], fieldConfig: FieldConfig): UnPackedTreeData
hierarchyToNative(hierarchyData: any, fieldConfig: FieldConfig): UnPackedTreeData
buildItemPath(item: any, fieldConfig: FieldConfig): any[]

// Validation and mapping  
validateDataFormat(data: any, format: string): ValidationResult
createSourceItemsMap(data: any, fieldConfig: FieldConfig): Map<string, any>
createBidirectionalMapping(sourceData: any, nativeData: UnPackedTreeData): IDMapping
```

## Usage Examples

### Example 1: Flat Format with State Icons
```xml
<Tree 
  dataFormat="flat"
  idField="id"
  labelField="name" 
  iconField="icon"
  iconExpandedField="iconExpanded"
  iconCollapsedField="iconCollapsed"
  parentField="parentId"
  expandOnItemClick="true"
  data="[
    { 
      id: '1', 
      name: 'Documents', 
      icon: 'folder', 
      iconExpanded: 'folder-open',
      iconCollapsed: 'folder'
    },
    { id: '2', name: 'Report.pdf', icon: 'file-pdf', parentId: '1' },
    { 
      id: '3', 
      name: 'Images', 
      icon: 'folder',
      iconExpanded: 'folder-open', 
      iconCollapsed: 'folder'
    },
    { id: '4', name: 'Photo.jpg', icon: 'file-image', parentId: '3' }
  ]"
  selectedValue="2"
  defaultExpanded="first-level"
  selectionChanged="handleTreeSelection">
  
  <property name="itemTemplate">
    <HStack spacing="small">
      <Icon name="{$icon}" size="16px" />
      <Text value="{$item.name}" weight="{$hasChildren ? 'bold' : 'normal'}" />
    </HStack>
  </property>
</Tree>
```

### Example 2: Hierarchy Format with Chevron-Only Expansion
```xml
<Tree 
  dataFormat="hierarchy"
  idField="uid"
  labelField="title"
  iconField="type"
  childrenField="items"
  expandOnItemClick="false"
  data="{[
    {
      uid: 'root',
      title: 'Project',
      type: 'project',
      items: [
        {
          uid: 'src', 
          title: 'Source',
          type: 'folder',
          items: [
            { uid: 'app', title: 'App.tsx', type: 'typescript' },
            { uid: 'index', title: 'index.ts', type: 'typescript' }
          ]
        }
      ]
    }
  ]}"
  selectedValue="app"
  expandedValues="['root', 'src']">
  
  <property name="itemTemplate">
    <HStack spacing="small">
      <Icon name="{$icon}" size="16px" />
      <Text value="{$item.title}" />
      <Text value="(click chevron to expand)" variant="secondary" visible="{$hasChildren}" />
    </HStack>
  </property>
</Tree>
```

### Example 3: Custom Field Mapping with State-Specific Icons
```xml
<Tree 
  dataFormat="flat"
  idField="nodeId"
  labelField="displayName"
  iconField="iconType"
  iconExpandedField="openIcon"
  iconCollapsedField="closedIcon"
  parentField="parent"
  expandOnItemClick="true"
  data="{existingApiData}"
  selectedValue="{selectedNodeId}"
  selectionChanged="handleNodeSelection">
  
  <property name="itemTemplate">
    <HStack>
      <Icon name="{$icon}" />
      <Text value="{$item.displayName}" />
      <Badge text="{$depth}" visible="{$depth > 0}" />
      <Text 
        value="{expandOnItemClick ? 'Click anywhere' : 'Click chevron'}" 
        variant="caption" />
    </HStack>
  </property>
</Tree>
```

## Implementation Roadmap

### Phase 1: Foundation & Types (Steps 1-2)

#### Step 1: Enhanced Metadata Design
**File**: `TreeComponent.tsx`
- Update `TreeMd` with new properties table above
- Add `selectionChanged` event to metadata
- Include proper TypeScript interfaces for field configuration
- Add deprecation notice for `selectedUid`

#### Step 2: Create Type Definitions  
**File**: `treeAbstractions.ts`
```typescript
export interface TreeFieldConfig {
  idField: string;
  labelField: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentField?: string;
  childrenField?: string;
}

export interface TreeSelectionEvent {
  type: 'selection';
  selectedId: string;
  selectedItem: any;
  selectedNode: TreeNode;
  previousId?: string;
}

export type TreeDataFormat = 'native' | 'flat' | 'hierarchy';
export type DefaultExpansion = 'none' | 'all' | 'first-level' | string[];
```

### Phase 2: Data Transformation (Steps 3-4)

#### Step 3a: Flat to Native Transformation
**File**: `treeUtils.ts`

**Implementation Plan**:
```typescript
// Main transformation function
export function flatToNative(flatData: any[], config: TreeFieldConfig): UnPackedTreeData

// Helper functions
function createParentChildMap(flatData: any[], config: TreeFieldConfig): Map<string, string[]>
function generateTreeNodeFromFlat(item: any, config: TreeFieldConfig): TreeNode
function buildTreeHierarchy(flatData: any[], parentChildMap: Map<string, string[]>, config: TreeFieldConfig): TreeNode[]
function createTreeItemsById(treeNodes: TreeNode[]): Record<string, TreeNode>
```

**Algorithm**:
1. Create parent-child relationship map for O(1) lookups
2. Identify root nodes (no parent or parent not found)
3. Recursively build tree structure for each root
4. Generate proper TreeNode objects with uid, key, path, parentIds
5. Create treeItemsById lookup map
6. Return UnPackedTreeData structure

**Key Features**:
- Handle orphaned nodes gracefully
- Generate unique UIDs for internal use
- Build proper path arrays for navigation
- Maintain parentIds for expansion logic

---

#### Step 3b: Hierarchy to Native Transformation  
**File**: `treeUtils.ts`

**Implementation Plan**:
```typescript
// Main transformation function
export function hierarchyToNative(hierarchyData: any | any[], config: TreeFieldConfig): UnPackedTreeData

// Helper functions
function flattenHierarchy(hierarchyData: any | any[], config: TreeFieldConfig): any[]
function processHierarchicalNode(node: any, parentPath: string[], config: TreeFieldConfig): TreeNode
function collectAllNodes(treeData: TreeNode[]): TreeNode[]
```

**Algorithm**:
1. Normalize input (handle single object or array)
2. Recursively traverse hierarchy structure
3. Generate TreeNode objects during traversal
4. Track parent-child relationships and paths
5. Collect all nodes into flat array for treeItemsById
6. Return UnPackedTreeData structure

**Key Features**:
- Handle nested children arrays
- Generate proper parent-child relationships
- Support deep nesting levels
- Circular reference detection

---

#### Supporting Utilities (Both Steps)
```typescript
// Shared helper functions
export function generateUniqueId(prefix?: string): string
export function buildNodePath(item: any, config: TreeFieldConfig, parentPath?: string[]): string[]
export function validateFieldConfig(data: any, config: TreeFieldConfig): ValidationResult
export function createSourceItemsMap(data: any, config: TreeFieldConfig): Map<string, any>
```

#### Step 4: Data Processing Logic
**File**: `TreeNative.tsx`
- Add data transformation pipeline with memoization
- Implement selection/expansion mapping between source and native formats
- Add validation and error handling
- Maintain bidirectional ID mapping for events
- Implement exposed methods API for programmatic tree control
- Add imperative handle for method exposure via forwardRef pattern
- Add icon resolution logic for base/expanded/collapsed states
- Implement `expandOnItemClick` behavior with proper event handling

### Phase 3: Component Integration (Steps 5-6)

#### Step 5: Renderer Updates
**File**: `TreeComponent.tsx`
- Update `treeComponentRenderer` to handle new props
- Add event handler mapping with `lookupEventHandler("selectionChanged")`
- Enhance context variables: `$depth`, `$isExpanded`, `$hasChildren`, `$isSelected`, `$path`, `$icon`
- Add validation for field configuration including new icon fields
- Add `expandOnItemClick` prop handling and validation

#### Step 6: Backwards Compatibility
- Keep `selectedUid` working with deprecation warning
- Ensure existing `UnPackedTreeData` usage continues working
- Add automatic prop migration logic
- Test with existing examples

### Phase 4: Testing & Documentation (Steps 7-8)

#### Step 7: Comprehensive Testing
- Unit tests for all transformation utilities
- Integration tests for each data format
- Performance tests with large datasets
- Backwards compatibility verification

#### Step 8: Validation & Error Handling
- Runtime validation for data format consistency
- Field existence validation
- Circular reference detection
- Helpful error messages with troubleshooting guidance
- Performance warnings for large datasets

- **Method signature stability**: Follow Queue component patterns for consistent API design

## E2E Testing Infrastructure Notes (Playwright)

### Testing Framework Overview

The Tree component uses **Playwright** for end-to-end testing with a custom XMLUI testing infrastructure that provides:

- **Test Fixtures**: Located in `/src/testing/fixtures.ts` - provides `initTestBed` and component-specific driver factory functions
- **Component Drivers**: Located in `/src/testing/drivers/` - page object models for interacting with components
- **Test Helpers**: Located in `/src/testing/component-test-helpers.ts` - utilities for test setup and common patterns

### Key Testing Patterns

#### 1. Test Structure
```typescript
test("test description", async ({ initTestBed, createTreeDriver }) => {
  // Setup test environment with XMLUI markup
  await initTestBed(`
    <Tree testId="tree" dataFormat="flat" data='{${JSON.stringify(testData)}}'>
      <property name="itemTemplate">
        <TestMarker tag="{$item.id}">
          <Text value="{$item.name}" />
        </TestMarker>
      </property>
    </Tree>
  `);
  
  // Create driver for component interaction
  const tree = await createTreeDriver("tree");
  
  // Assertions using playwright expect
  await expect(tree.component).toBeVisible();
});
```

#### 2. TestMarker Pattern for Component Testing
**Critical Pattern**: Use `<TestMarker tag="{uniqueValue}">` in itemTemplate to create reliable test selectors:

```xml
<property name="itemTemplate">
  <TestMarker tag="{$item.id}:{$item.depth}">
    <HStack verticalAlignment="center">
      <Icon name="folder" />
      <Text value="{$item.name}" />
    </HStack>
  </TestMarker>
</property>
```

Then access in tests with: `await expect(tree.getByMarker("1:0")).toBeVisible();`

#### 3. TreeDriver Implementation (Current)
Located in `/src/testing/drivers/TreeDriver.ts`:
```typescript
export class TreeDriver extends ComponentDriver {
  getNodeById(nodeId: string): Locator {
    return this.component.locator(`[data-tree-node-id="${nodeId}"]`).first();
  }
}
```

**TODO**: Expand TreeDriver with methods for:
- `getByMarker(tag: string): Locator` - Access TestMarker elements
- `getChevron(nodeId: string): Locator` - Access expand/collapse chevron
- `getNodeByDepth(depth: number): Locator[]` - Get nodes at specific nesting level
- `isNodeExpanded(nodeId: string): Promise<boolean>` - Check expansion state
- `isNodeSelected(nodeId: string): Promise<boolean>` - Check selection state
- `expandNode(nodeId: string): Promise<void>` - Programmatically expand node
- `selectNode(nodeId: string): Promise<void>` - Programmatically select node

### Test Organization

#### Current Test Coverage Status
The Tree.spec.ts file contains comprehensive test placeholders organized into:

1. **Basic Functionality** ✅ (3 working tests)
   - ✅ Component renders with default props 
   - ✅ Displays flat data format correctly
   - ✅ Displays hierarchy data format correctly
   - 🚧 Custom field configuration (skipped - TO_BE_IMPLEMENTED)

2. **Selection Management** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - selectedValue property handling
   - selectedUid backwards compatibility 
   - Programmatic selection changes
   - selectionChanged event firing
   - Null/undefined selection handling
   - Invalid selection values handling

3. **Expansion States** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - defaultExpanded: "none", "all", "first-level", array of IDs
   - expandedValues controlled property
   - Chevron click expansion toggle
   - expandOnItemClick behavior
   - autoExpandToSelection functionality

4. **Icon Resolution** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - Basic icon display from iconField
   - Expansion-specific icons (iconExpandedField/iconCollapsedField)
   - Missing icon field handling

5. **Custom Item Template** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - Default template rendering
   - Custom template rendering
   - Template context variable access ($item, $node, etc.)

6. **Virtualization** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - Large dataset performance (1000+ nodes)
   - Scroll position maintenance
   - Dynamic height calculations with AutoSizer

7. **Imperative API** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - expand/collapse/expandAll/collapseAll methods
   - scrollToItem method
   - getSelectedNode method
   - refreshData method

8. **Accessibility** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - ARIA attributes (role, aria-expanded, aria-selected)
   - Keyboard navigation (Arrow keys, Enter/Space, Home/End)
   - Focus management and indicators
   - Screen reader compatibility
   - High contrast mode support

9. **Theme Variables** 🚧 (all skipped - TO_BE_IMPLEMENTED)
   - Tree background theme variables
   - Tree item theme variables (selected, hover, text color)
   - Indentation spacing theme variables
   - Icon size and color theme variables

10. **Edge Cases** 🚧 (all skipped - TO_BE_IMPLEMENTED)
    - Empty/null/undefined data handling
    - Malformed data structures
    - Circular references in hierarchy data
    - Duplicate IDs handling
    - Orphaned nodes in flat data
    - Deeply nested structures (performance limits)
    - Frequent data updates (memory leak prevention)
    - Invalid dataFormat values
    - Missing required field configurations

### Test Data Management

#### Test Data Location
- **testData.ts**: Contains comprehensive test datasets for different scenarios
- **Inline test data**: Simple datasets defined directly in spec files for basic tests

#### Key Test Datasets Available
- `simpleFlatData`: 2-level hierarchy with 3 items
- `multiLevelFlatData`: Multi-level project structure with 7 items  
- `deepFlatData`: 4-level deep nesting test
- `multipleRootFlatData`: Multiple root nodes scenario
- `customFieldFlatData`: Custom field mapping test
- `orphanedFlatData`: Edge case with missing parent references
- **TODO**: Import and use these datasets instead of inline data

### Testing Priorities for Next Steps

#### Immediate Testing Goals (Step 4 Validation)
1. **Expand TreeDriver** - Add missing driver methods for comprehensive component interaction
2. **Selection Management Tests** - Validate selectedValue/selectedUid handling and selectionChanged events  
3. **Expansion State Tests** - Verify defaultExpanded and expandedValues behavior
4. **Data Format Tests** - Comprehensive validation of flat vs hierarchy format handling
5. **Icon Resolution Tests** - Validate icon field mapping and state-specific icons

#### Test Execution Commands
- `npm run test:e2e-ui` - Run Playwright tests with UI interface
- `npm run test:e2e-smoke` - Run smoke tests
- `npm run test:e2e-non-smoke` - Run comprehensive test suite
- **Tree-specific tests**: `npx playwright test src/components/Tree/Tree.spec.ts --reporter=line`
- **Filter Tree tests**: Use `--grep "Tree"` or similar patterns in test commands

#### Current Test Status (Last Run: Sept 27, 2025)
```bash
cd /Users/dotneteer/source/xmlui/xmlui && npx playwright test src/components/Tree/Tree.spec.ts --reporter=line
Running 53 tests using 7 workers
  50 skipped
  3 passed (2.0s)
```

**Results Summary:**
- ✅ **3 tests passing** - Basic functionality working correctly
  - Component renders with default props (flat format)
  - Displays flat data format correctly with defaultExpanded="all"  
  - Displays hierarchy data format correctly with defaultExpanded="all"
- 🚧 **50 tests skipped** - All marked `TO_BE_IMPLEMENTED` for comprehensive validation
- ⚡ **Fast execution** - 2.0 seconds for focused Tree component testing
- 🎯 **Efficient testing** - Use specific file path to avoid running entire test suite

### Testing Best Practices Observed

1. **Use TestMarker extensively** for reliable element selection in dynamic content
2. **Test with realistic data** reflecting real-world usage patterns
3. **Validate both visual state and internal state** using driver methods and expect assertions
4. **Test accessibility** including keyboard navigation and ARIA attributes
5. **Include edge cases** for robust component behavior validation
6. **Performance testing** with large datasets to validate virtualization
7. **Theme variable testing** to ensure proper CSS custom property integration

### Test Implementation Notes

- **Current Status**: Only 3 basic tests are implemented and passing
- **Native data format dropped**: Tests focus on flat and hierarchy formats only
- **Driver needs expansion**: TreeDriver currently minimal, needs comprehensive method suite
- **Comprehensive test suite exists**: All test scenarios planned but marked as `test.skip` with `TO_BE_IMPLEMENTED` 
- **TestMarker integration works**: Basic pattern validated in working tests

## API Usage Examples

### Example: Programmatic Tree Control
```xml
<VStack spacing="medium">
  <HStack spacing="small">
    <Button label="Expand All" onClick="{fileTree.expandAll()}" />
    <Button label="Collapse All" onClick="{fileTree.collapseAll()}" />
    <Button label="Expand to Level 2" onClick="{fileTree.expandToLevel(2)}" />
  </HStack>
  
  <HStack spacing="small">
    <Button label="Select Root" onClick="{fileTree.selectNode('root')}" />
    <Button label="Clear Selection" onClick="{fileTree.clearSelection()}" />
    <Button label="Get Node Info" onClick="console.log(fileTree.getNodeById('src'))" />
  </HStack>
  
  <Tree 
    id="fileTree"
    dataFormat="flat"
    data="{fileSystemData}"
    selectedValue="{currentSelection}"
    selectionChanged="handleFileSelection">
    
    <property name="itemTemplate">
      <HStack>
        <Icon name="{$item.icon}" />
        <Text value="{$item.name}" />
        <Text value="(depth: {$depth})" variant="secondary" />
      </HStack>
    </property>
  </Tree>
</VStack>
```

### Example: Dynamic Tree Operations
```xml
<Tree 
  id="projectTree"
  dataFormat="hierarchy"
  data="{projectStructure}"
  selectionChanged="node => {
    // Auto-expand children when selecting a folder
    if (projectTree.hasChildren(node.selectedId)) {
      projectTree.expandNode(node.selectedId);
    }
    
    // Update breadcrumb navigation
    breadcrumbPath = projectTree.getNodePath(node.selectedId);
    
    // Log tree statistics
    console.log('Tree stats:', projectTree.getTreeStats());
  }">
  
  <property name="itemTemplate">
    <HStack>
      <Icon name="{$item.type === 'folder' ? 'folder' : 'file'}" />
      <Text value="{$item.name}" />
      <Badge 
        text="{projectTree.getChildrenIds($item.id).length}" 
        visible="{$hasChildren}" />
    </HStack>
  </property>
</Tree>
```

### Example: Search and Filter Integration
```xml
<VStack>
  <TextInput 
    placeholder="Search files..."
    value="{searchQuery}"
    onChange="query => {
      searchQuery = query;
      if (query) {
        // Find matching nodes and expand their paths
        const matches = codeTree.findNodes(node => 
          node.name.toLowerCase().includes(query.toLowerCase())
        );
        matches.forEach(match => {
          const path = codeTree.getNodePath(match.id);
          path.forEach(nodeId => codeTree.expandNode(nodeId));
        });
      }
    }" />
    
  <Tree 
    id="codeTree"
    dataFormat="flat"
    data="{filteredCodeData}"
    selectedValue="{selectedFile}">
    
    <property name="itemTemplate">
      <HStack>
        <Icon name="{$item.icon}" />
        <Text 
          value="{$item.name}" 
          weight="{searchQuery && $item.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bold' : 'normal'}" />
      </HStack>
    </property>
  </Tree>
</VStack>
```

## Benefits & Risk Mitigation

### Expected Benefits
- **90% less boilerplate**: Simple arrays instead of complex nested objects
- **Better performance**: Optimized transformations with Map-based lookups
- **API compatibility**: Field mapping works with any existing data structure
- **Enhanced events**: Rich selection events with source data context
- **Comprehensive API**: 20+ methods for programmatic tree control and querying
- **Future-ready**: Architecture prepared for multiple selection support
- **No migration needed**: Component not yet in production use

### Risk Mitigation Strategy
- **Phase-based rollout**: Implement in discrete phases to catch issues early
- **Comprehensive testing**: Unit, integration, and performance tests for all formats
- **Validation layer**: Runtime validation prevents silent failures
- **Internal consistency**: Keep `UnPackedTreeData` as internal format to minimize changes
- **Performance monitoring**: Console warnings for large datasets and inefficient usage
- **API testing**: Extensive testing of all 20+ exposed methods for edge cases
- **Method signature stability**: Follow Queue component patterns for consistent API design

## Testing Examples

### Phase 1 Testing: Foundation & Types (Steps 1-2)

#### After Step 1: Enhanced Metadata Design
**Test File**: `TreeComponent.tsx`

**Test Example**: Verify new props are accepted without errors
```xml
<Tree 
  dataFormat="native"
  idField="id"
  labelField="name"
  iconField="icon"
  iconExpandedField="iconExpanded"
  iconCollapsedField="iconCollapsed"
  parentField="parentId"
  childrenField="children"
  selectedValue="test"
  expandedValues="['test1', 'test2']"
  defaultExpanded="none"
  autoExpandToSelection="true"
  expandOnItemClick="false"
  data="{{}}"
  selectionChanged="console.log">
  
  <property name="itemTemplate">
    <Text value="Test Item" />
  </property>
</Tree>
```

**Manual Test Checklist**:
1. ✅ Component renders without TypeScript errors
2. ✅ All new props are accepted by the component
3. ✅ VS Code shows proper IntelliSense for new properties
4. ✅ No console errors when component mounts
5. ✅ Component metadata includes all new properties with descriptions
6. ✅ `selectionChanged` event is properly registered in metadata

**Expected Console Output**: No errors, component should render with empty tree

---

#### After Step 2: Type Definitions
**Test File**: `treeAbstractions.ts`

**Test Example**: Import and use new types
```typescript
// Test file: testTypes.ts
import { 
  TreeFieldConfig, 
  TreeSelectionEvent, 
  TreeDataFormat, 
  DefaultExpansion 
} from '../../../components-core/abstractions/treeAbstractions';

// Test TreeFieldConfig interface
const config: TreeFieldConfig = {
  idField: 'id',
  labelField: 'name',
  iconField: 'icon',
  iconExpandedField: 'iconExpanded',
  iconCollapsedField: 'iconCollapsed',
  parentField: 'parentId',
  childrenField: 'children'
};

// Test TreeSelectionEvent interface  
const selectionEvent: TreeSelectionEvent = {
  type: 'selection',
  selectedId: 'test-id',
  selectedItem: { id: 'test', name: 'Test Item' },
  selectedNode: {} as any, // TreeNode
  previousId: 'prev-id'
};

// Test TreeDataFormat type
const format1: TreeDataFormat = 'native';
const format2: TreeDataFormat = 'flat';
const format3: TreeDataFormat = 'hierarchy';

// Test DefaultExpansion type
const expansion1: DefaultExpansion = 'none';
const expansion2: DefaultExpansion = 'all';
const expansion3: DefaultExpansion = 'first-level';
const expansion4: DefaultExpansion = ['id1', 'id2'];

console.log('All types compiled successfully', {
  config,
  selectionEvent,
  formats: [format1, format2, format3],
  expansions: [expansion1, expansion2, expansion3, expansion4]
});
```

**Manual Test Checklist**:
1. ✅ TypeScript compilation succeeds without errors
2. ✅ All new interfaces are properly exported
3. ✅ IntelliSense shows correct property types and optional fields
4. ✅ Union types (TreeDataFormat, DefaultExpansion) work correctly
5. ✅ Interfaces can be imported in other files
6. ✅ All properties have correct TypeScript types

**Expected Console Output**: "All types compiled successfully" with logged objects

---

### Phase 1 Integration Test
**Test both Step 1 and Step 2 together**

```xml
<App>
  <Tree 
    dataFormat="flat"
    idField="nodeId"
    labelField="title"
    iconField="iconName"
    iconExpandedField="openIcon"
    iconCollapsedField="closedIcon"
    parentField="parent"
    childrenField="kids"
    selectedValue="node1"
    expandedValues="['root']"
    defaultExpanded="first-level"
    autoExpandToSelection="true"
    expandOnItemClick="true"
    data="[]"
    selectionChanged="event => console.log('Selection:', event)">
    
    <property name="itemTemplate">
      <HStack>
        <Text value="Custom field mapping test" />
        <Text value="{JSON.stringify($item)}" />
      </HStack>
    </property>
  </Tree>
</App>
```

**Manual Test Checklist**:
1. ✅ Component accepts all custom field names
2. ✅ TypeScript validates prop types correctly
3. ✅ Component renders with empty data
4. ✅ No TypeScript or runtime errors
5. ✅ Event handler is properly typed
6. ✅ All enum/union values are accepted

**Expected Result**: Empty tree renders without errors, ready for Phase 2 implementation

---

### Baseline Test: Current Working Example
**Verify existing functionality remains intact during Phase 1**

```xml
<App>
  <Tree
    data="{{
      treeData: [
        {
          uid: '1',
          key: '1',
          path: ['test'],
          displayName: 'Test Node',
          parentIds: [],
          selectable: true,
          icon: 'folder',
          isFolder: true
        }
      ],
      treeItemsById: {
        '1': { 
          uid: '1', 
          key: '1', 
          path: ['test'], 
          displayName: 'Test Node', 
          parentIds: [], 
          selectable: true, 
          icon: 'folder', 
          isFolder: true 
        }
      }
    }}"
    selectedUid="1">
    
    <property name="itemTemplate">
      <HStack verticalAlignment="center">
        <Icon when="{$item.icon}" name="{$item.icon}" />
        <Text value="{$item.displayName}" />
      </HStack>
    </property>
  </Tree>
</App>
```

**Manual Test Checklist**:
1. ✅ Existing native format still works
2. ✅ `selectedUid` prop still functions
3. ✅ `$item.displayName` context variable works
4. ✅ Tree renders with folder icon and text
5. ✅ Selection highlighting works
6. ✅ No regression in existing behavior

**Expected Result**: Single "Test Node" item displays with folder icon, selected state highlighted

This baseline test ensures Phase 1 changes don't break existing functionality.

---

## Phase 1 Implementation Results

### ✅ Step 1 Completed: Enhanced Metadata Design
**Files Modified**: `TreeComponent.tsx`
- Added all new properties to TreeMd with descriptions and defaults
- Added `selectionChanged` event to metadata
- Updated renderer to pass all new props to TreeNative component
- Added deprecation notice for `selectedUid`

### ✅ Step 2 Completed: Type Definitions  
**Files Modified**: `treeAbstractions.ts`, `TreeNative.tsx`
- Created `TreeFieldConfig` interface for field mapping configuration
- Created `TreeSelectionEvent` interface for selection events
- Created `TreeDataFormat` and `DefaultExpansion` types
- Created `TreeNodeInfo` and `TreeStats` interfaces for exposed methods
- Updated TreeNative component interface to accept all new props
- Added console logging to verify prop reception

### 🧪 Ready for Testing
The Phase 1 implementation is complete and ready for manual testing. The component should:
1. Accept all new properties without TypeScript errors
2. Compile successfully with proper type checking
3. Maintain existing functionality with native format data
4. Log new properties to console for verification

---

## Phase 2 Detailed Planning: Data Transformation (Steps 3a-3b)

### Step 3a: Flat to Native Transformation

**Input Example**:
```javascript
const flatData = [
  { id: '1', name: 'Root', icon: 'folder' },
  { id: '2', name: 'Child1', icon: 'file', parentId: '1' },
  { id: '3', name: 'Child2', icon: 'file', parentId: '1' },
  { id: '4', name: 'Grandchild', icon: 'file', parentId: '2' }
];
```

**Expected Output**:
```javascript
{
  treeData: [
    {
      uid: 'flat_1',
      key: '1',
      path: ['Root'],
      displayName: 'Root', 
      parentIds: [],
      selectable: true,
      icon: 'folder',
      children: [
        {
          uid: 'flat_2', 
          key: '2',
          path: ['Root', 'Child1'],
          displayName: 'Child1',
          parentIds: ['1'],
          selectable: true,
          icon: 'file',
          children: [...]
        }
      ]
    }
  ],
  treeItemsById: { /* flat lookup map */ }
}
```

**Implementation Focus**:
- ✅ Efficient parent-child mapping with Map<string, string[]>
- ✅ Orphaned node handling (nodes with missing parents)
- ✅ Proper path building for navigation
- ✅ Source ID to internal UID mapping

---

### Step 3b: Hierarchy to Native Transformation

**Input Example**:
```javascript
const hierarchyData = {
  id: 'root',
  name: 'Project',
  icon: 'folder',
  children: [
    {
      id: 'src',
      name: 'Source',
      icon: 'folder', 
      children: [
        { id: 'app', name: 'App.tsx', icon: 'code' }
      ]
    }
  ]
};
```

**Expected Output**: Same UnPackedTreeData structure as flat transformation

**Implementation Focus**:
- ✅ Recursive traversal of nested structures
- ✅ Parent relationship tracking during traversal
- ✅ Depth-first processing for proper path building
- ✅ Circular reference detection and prevention

---

### Testing Strategy for Phase 2

#### After Step 3a: Flat Transformation Test
```xml
<Tree 
  dataFormat="flat"
  data="[
    { id: '1', name: 'Docs', icon: 'folder' },
    { id: '2', name: 'File.txt', parentId: '1' }
  ]">
  <property name="itemTemplate">
    <Text value="{$item.name}" />
  </property>
</Tree>
```
**Expected**: 2-level tree with proper parent-child relationship

#### After Step 3b: Hierarchy Transformation Test  
```xml
<Tree 
  dataFormat="hierarchy"
  data="{
    id: 'root',
    name: 'Root',
    children: [
      { id: 'child', name: 'Child' }
    ]
  }">
  <property name="itemTemplate">
    <Text value="{$item.name}" />  
  </property>
</Tree>
```
**Expected**: Same 2-level tree structure from nested input

## End-to-End Testing Strategy

### Testing Process Overview

The Tree component testing follows a systematic approach to ensure comprehensive coverage and regression prevention:

#### Phase 1: Test Infrastructure Setup
1. **Create Test Skeleton**: Generate comprehensive test case structure covering all Tree component features, data formats, props, events, and edge cases
2. **Update Testing Infrastructure**: Enhance testing infrastructure to support Tree component validation and assertion patterns
3. **Create Reference Test**: Manually create one working test case as a template for automated test generation
4. **Pair Programming Implementation**: Collaboratively develop remaining test cases following established patterns

#### Phase 2: Test Categories

**Core Functionality Tests:**
- Data Format Transformation (flat, hierarchy, native)
- Selection Management and Event Handling  
- Expansion State Management
- Icon Resolution Logic
- Custom Field Configuration
- Imperative API Methods

**Integration Tests:**
- ExpandOnItemClick Behavior
- Auto-Expand to Selection
- Context Variable Exposure ($item, $depth, $isSelected, etc.)
- Event Payload Validation

**Edge Case & Error Handling:**
- Invalid Data Formats
- Missing Required Fields
- Malformed Data Structures
- Empty Data Sets
- Circular References
- Deep Nesting Scenarios

**Backwards Compatibility:**
- Native Format Support
- selectedUid Prop Compatibility
- Existing UnPackedTreeData Usage

#### Phase 3: Automated Regression Testing
- End-to-end test suite for automated validation
- Visual regression detection for selection highlighting
- Performance testing for large datasets
- Cross-browser compatibility validation

This testing strategy ensures complete coverage of Step 4 implementation features while providing a foundation for ongoing regression testing as new features are added.