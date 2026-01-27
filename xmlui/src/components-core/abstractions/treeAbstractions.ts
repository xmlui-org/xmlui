export interface TreeNode {
  id: string | number;
  key: string | number;
  path: any[];
  displayName?: string;
  children?: TreeNode[];
  parentIds: (string | number)[];
  selectable: boolean;
  loaded?: boolean;
  [x: string]: any;
}

export type TreeItem = {
  id: string | number;
  children?: Array<TreeItem>;
  [x: string]: any;
};

export type UnPackedTreeData = {
  treeData: Array<TreeNode>;
  treeItemsById: Record<string | number, TreeNode>;
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
  selectableField?: string;
  loadedField?: string;
}

export interface TreeSelectionEvent {
  previousNode: FlatTreeNode | null;
  newNode: FlatTreeNode | null;
}

export type TreeDataFormat = 'flat' | 'hierarchy';

export type DefaultExpansion = 'none' | 'all' | 'first-level' | (string | number)[];

// Node loading states for dynamic node handling
export type NodeLoadingState = 'unloaded' | 'loading' | 'loaded';

// Extended FlatTreeNode with loading state information
export interface FlatTreeNodeWithState extends FlatTreeNode {
  loadingState: NodeLoadingState;
}

export interface TreeNodeInfo {
  id: string | number;           // Source data ID
  item: any;           // Original source item
  depth: number;       // Nesting depth (0-based)
  isExpanded: boolean; // Current expansion state
  hasChildren: boolean;// Whether node has children
  isSelected: boolean; // Whether node is selected
  path: (string | number)[];      // Path from root (source IDs)
  parentId?: string | number;   // Parent node ID (if any)
  childrenIds: (string | number)[]; // Direct children IDs
}

export interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  expandedNodes: number;
  visibleNodes: number;
  rootNodes: number;
}
