export interface TreeNode {
  uid: string;
  key: string;
  path: any[];
  displayName?: string;
  children?: TreeNode[];
  parentIds: string[];
  selectable: boolean;
  [x: string]: any;
}

export type TreeItem = {
  uid: string;
  children?: Array<TreeItem>;
  [x: string]: any;
};

export type UnPackedTreeData = {
  treeData: Array<TreeNode>;
  treeItemsById: Record<string, TreeNode>;
};

export interface FlatTreeNode extends TreeNode {
  isExpanded: boolean;
  depth: number;
  hasChildren: boolean;
}

// New interfaces for Tree component refactoring
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
  selectedId: string;        // Source data ID
  selectedItem: any;         // Full source item
  selectedNode: TreeNode;    // Internal tree node
  previousId?: string;       // Previous selection
}

export type TreeDataFormat = 'flat' | 'hierarchy';

export type DefaultExpansion = 'none' | 'all' | 'first-level' | string[];

export interface TreeNodeInfo {
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

export interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  expandedNodes: number;
  visibleNodes: number;
  rootNodes: number;
}
