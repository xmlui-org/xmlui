export interface TreeNode {
  uid: string;
  key: string;
  path: any[];
  subPath?: string;
  displayName?: string;
  children?: TreeNode[];
  parentIds: string[];
  selectable: boolean;
  groupKey?: string;
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
