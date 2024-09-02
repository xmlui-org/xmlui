import { FlatTreeNode, TreeItem, TreeNode, UnPackedTreeData } from "@components-core/abstractions/treeAbstractions";

export function flattenNode(node: TreeNode, depth: number, result: FlatTreeNode[], openedIds: string[]) {
  const { children, uid } = node;
  const isExpanded = openedIds.includes(uid);
  result.push({
    ...node,
    hasChildren: !!children && children.length > 0,
    depth,
    isExpanded,
  });

  if (isExpanded && children) {
    for (let child of children) {
      flattenNode(child, depth + 1, result, openedIds);
    }
  }
}

export function toFlatTree(treeData: TreeNode[], openedIds: string[]) {
  const ret: FlatTreeNode[] = [];

  treeData.forEach((node) => {
    flattenNode(node, 0, ret, openedIds);
  });

  return ret;
}

export function walkTree(treeData: TreeNode[], visit: (node: TreeNode) => void) {
  treeData.forEach((node) => {
    visit(node);
    walkTree(node.children || [], visit);
  });
}

export function unPackTree(
  items: Array<TreeItem> = [],
  parentIds: Array<string> = [],
  parentPath: Array<number> = []
): UnPackedTreeData {
  const treeData: Array<TreeNode> = [];
  let treeItemsById: Record<string, TreeNode> = {};

  items.forEach((item, index) => {
    const path = [...parentPath, index];
    const uid = item.uid || item.cid;
    const childTree = unPackTree(item.children, [...parentIds, uid], path);
    const treeItem: TreeNode = {
      ...item,
      uid: uid,
      key: uid,
      parentIds,
      path,
      children: childTree.treeData,
      selectable: item.selectable,
    };
    treeData.push(treeItem);
    treeItemsById[uid] = treeItem;
    treeItemsById = {
      ...treeItemsById,
      ...childTree.treeItemsById,
    };
  });

  return {
    treeData,
    treeItemsById,
  };
}
