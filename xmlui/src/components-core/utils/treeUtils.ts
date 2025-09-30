import {
  FlatTreeNode,
  TreeItem,
  TreeNode,
  UnPackedTreeData,
  TreeFieldConfig,
} from "../abstractions/treeAbstractions";

export function flattenNode(
  node: TreeNode,
  depth: number,
  result: FlatTreeNode[],
  openedIds: (string | number)[],
) {
  const { children, key } = node;
  const isExpanded = openedIds.includes(key);
  result.push({
    ...node,
    hasChildren: !!children && children.length > 0,
    depth,
    isExpanded,
    // Ensure key is preserved (in case it was overwritten by ...node spread)
    key: key || node.key || node.id,
  });

  if (isExpanded && children) {
    for (let child of children) {
      flattenNode(child, depth + 1, result, openedIds);
    }
  }
}

export function toFlatTree(treeData: TreeNode[], openedIds: (string | number)[]) {
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
  parentPath: Array<number> = [],
): UnPackedTreeData {
  const treeData: Array<TreeNode> = [];
  let treeItemsById: Record<string, TreeNode> = {};

  items.forEach((item, index) => {
    const path = [...parentPath, index];
    const id = item.id || item.cid;
    const childTree = unPackTree(item.children, [...parentIds, id], path);
    const treeItem: TreeNode = {
      ...item,
      id: id,
      key: id,
      parentIds,
      path,
      children: childTree.treeData,
      selectable: item.selectable,
    };
    treeData.push(treeItem);
    treeItemsById[id] = treeItem;
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

/**
 * Transforms flat array data with parent-child relationships into UnPackedTreeData format
 * @param flatData Array of flat objects with id and parentId relationships
 * @param fieldConfig Configuration for mapping object fields to tree properties
 * @returns UnPackedTreeData structure suitable for Tree component
 */
export function flatToNative(
  flatData: any[],
  fieldConfig: TreeFieldConfig
): UnPackedTreeData {
  if (!flatData || flatData.length === 0) {
    return { treeData: [], treeItemsById: {} };
  }

  // Build parent-to-children map for efficient lookup
  const childrenMap = new Map<string, any[]>();
  const itemsById = new Map<string, any>();
  const rootItems: any[] = [];

  // First pass: organize items and build relationships
  flatData.forEach(item => {
    const id = item[fieldConfig.idField];
    const parentId = item[fieldConfig.parentField || 'parentId'];
    
    // Store item for lookup
    itemsById.set(id, item);
    
    if (parentId && parentId !== '') {
      // Has parent - add to children map
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(item);
    } else {
      // Root item
      rootItems.push(item);
    }
  });

  // Generate unique IDs for internal tree structure
  let idCounter = 1;
  const sourceIdToId = new Map<string, string>();
  
  const getOrCreateId = (sourceId: string): string => {
    if (!sourceIdToId.has(sourceId)) {
      sourceIdToId.set(sourceId, `flat_${idCounter++}`);
    }
    return sourceIdToId.get(sourceId)!;
  };

  // Recursive function to build TreeNode structure
  const buildTreeNode = (
    item: any, 
    parentIds: string[] = [], 
    pathSegments: string[] = []
  ): TreeNode => {
    const sourceId = item[fieldConfig.idField];
    const id = getOrCreateId(sourceId);
    const displayName = item[fieldConfig.labelField] || sourceId;
    const currentPath = [...pathSegments, displayName];
    
    // Get children for this item
    const childItems = childrenMap.get(sourceId) || [];
    const children: TreeNode[] = childItems.map(childItem => 
      buildTreeNode(childItem, [...parentIds, sourceId], currentPath)
    );

    // Build the TreeNode
    const treeNode: TreeNode = {
      id,
      key: sourceId, // Use source ID as key for expansion state
      path: currentPath,
      displayName,
      parentIds,
      selectable: true,
      children,
      // Preserve original item properties
      ...item,
      // Add icon properties if configured
      ...(fieldConfig.iconField && item[fieldConfig.iconField] && {
        icon: item[fieldConfig.iconField]
      }),
      ...(fieldConfig.iconExpandedField && item[fieldConfig.iconExpandedField] && {
        iconExpanded: item[fieldConfig.iconExpandedField]
      }),
      ...(fieldConfig.iconCollapsedField && item[fieldConfig.iconCollapsedField] && {
        iconCollapsed: item[fieldConfig.iconCollapsedField]
      })
    };

    return treeNode;
  };

  // Build tree structure from root items
  const treeData: TreeNode[] = rootItems.map(rootItem => 
    buildTreeNode(rootItem)
  );

  // Build lookup map by ID
  const treeItemsById: Record<string, TreeNode> = {};
  const collectNodes = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      treeItemsById[node.id] = node;
      if (node.children) {
        collectNodes(node.children);
      }
    });
  };
  collectNodes(treeData);

  return {
    treeData,
    treeItemsById,
  };
}

/**
 * Transforms hierarchical nested object data into UnPackedTreeData format
 * @param hierarchyData Single object or array of objects with nested children structure
 * @param fieldConfig Configuration for mapping object fields to tree properties
 * @returns UnPackedTreeData structure suitable for Tree component
 */
export function hierarchyToNative(
  hierarchyData: any,
  fieldConfig: TreeFieldConfig
): UnPackedTreeData {
  if (!hierarchyData) {
    return { treeData: [], treeItemsById: {} };
  }

  // Ensure we're working with an array
  const rootItems = Array.isArray(hierarchyData) ? hierarchyData : [hierarchyData];
  
  if (rootItems.length === 0) {
    return { treeData: [], treeItemsById: {} };
  }

  // Generate unique IDs for internal tree structure
  let idCounter = 1;
  const sourceIdToId = new Map<string, string>();
  
  const getOrCreateId = (sourceId: string): string => {
    if (!sourceIdToId.has(sourceId)) {
      sourceIdToId.set(sourceId, `hierarchy_${idCounter++}`);
    }
    return sourceIdToId.get(sourceId)!;
  };

  // Set to track visited nodes for circular reference detection
  const visitedIds = new Set<string>();

  // Recursive function to build TreeNode structure from hierarchical data
  const buildTreeNode = (
    item: any, 
    parentIds: string[] = [], 
    pathSegments: string[] = []
  ): TreeNode => {
    const sourceId = item[fieldConfig.idField];
    const displayName = item[fieldConfig.labelField] || sourceId;
    
    // Circular reference detection
    if (visitedIds.has(sourceId)) {
      // Return a simple node without children to break the cycle
      const id = getOrCreateId(sourceId);
      return {
        id,
        key: sourceId,
        path: [...pathSegments, displayName],
        displayName,
        parentIds,
        selectable: true,
        children: [],
        ...item,
        ...(fieldConfig.iconField && item[fieldConfig.iconField] && {
          icon: item[fieldConfig.iconField]
        })
      };
    }

    // Mark as visited
    visitedIds.add(sourceId);

    const id = getOrCreateId(sourceId);
    const currentPath = [...pathSegments, displayName];
    
    // Get children from the specified children field
    const childrenField = fieldConfig.childrenField || 'children';
    const childItems = item[childrenField] || [];
    
    // Recursively build children
    const children: TreeNode[] = childItems.map((childItem: any) => 
      buildTreeNode(childItem, [...parentIds, sourceId], currentPath)
    );

    // Unmark as visited after processing (for depth-first traversal)
    visitedIds.delete(sourceId);

    // Build the TreeNode
    const treeNode: TreeNode = {
      id,
      path: currentPath,
      displayName,
      parentIds,
      selectable: true,
      // Preserve original item properties (excluding children to avoid overwriting)
      ...item,
      // Add icon properties if configured
      ...(fieldConfig.iconField && item[fieldConfig.iconField] && {
        icon: item[fieldConfig.iconField]
      }),
      ...(fieldConfig.iconExpandedField && item[fieldConfig.iconExpandedField] && {
        iconExpanded: item[fieldConfig.iconExpandedField]
      }),
      ...(fieldConfig.iconCollapsedField && item[fieldConfig.iconCollapsedField] && {
        iconCollapsed: item[fieldConfig.iconCollapsedField]
      }),
      // Set TreeNode-specific properties AFTER spreading item to ensure they're not overwritten
      children, // Use our transformed children, not the original item's children
      key: sourceId, // Use source ID as key for expansion state
    };

    return treeNode;
  };

  // Build tree structure from root items
  const treeData: TreeNode[] = rootItems.map(rootItem => 
    buildTreeNode(rootItem)
  );

  // Build lookup map by ID
  const treeItemsById: Record<string, TreeNode> = {};
  const collectNodes = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      treeItemsById[node.id] = node;
      if (node.children) {
        collectNodes(node.children);
      }
    });
  };
  collectNodes(treeData);

  return {
    treeData,
    treeItemsById,
  };
}
