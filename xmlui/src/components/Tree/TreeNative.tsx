import {
  type CSSProperties,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  forwardRef,
} from "react";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import classnames from "classnames";

import styles from "./TreeComponent.module.scss";

import type {
  FlatTreeNode,
  TreeNode,
  UnPackedTreeData,
  TreeFieldConfig,
  TreeSelectionEvent,
  TreeDataFormat,
  DefaultExpansion,
} from "../../components-core/abstractions/treeAbstractions";
import { toFlatTree, flatToNative, hierarchyToNative } from "../../components-core/utils/treeUtils";

type TreeRowProps = {
  index: number;
  style: CSSProperties;
  data: RowContext;
};

/**
 * Describes the data attached to a particular tree row
 */
interface RowContext {
  nodes: FlatTreeNode[];
  toggleNode: (node: FlatTreeNode) => void;
  selectedUid?: string;
  itemRenderer: (item: any) => ReactNode;
  expandOnItemClick: boolean;
  onItemClick?: (node: FlatTreeNode) => void;
  onSelection: (node: FlatTreeNode) => void;
}

const TreeRow = memo(({ index, style, data }: ListChildComponentProps<RowContext>) => {
  const { nodes, toggleNode, selectedUid, itemRenderer, expandOnItemClick, onItemClick, onSelection } = data;
  const treeItem = nodes[index];

  const onToggleNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleNode(treeItem);
    },
    [toggleNode, treeItem],
  );

  const onItemClickHandler = useCallback(
    (e: React.MouseEvent) => {
      // Always handle selection for selectable items
      if (treeItem.selectable) {
        onSelection(treeItem);
      }
      
      // Call optional onItemClick callback
      if (onItemClick) {
        onItemClick(treeItem);
      }
      
      // If expandOnItemClick is enabled and item has children, also toggle
      if (expandOnItemClick && treeItem.hasChildren) {
        toggleNode(treeItem);
      }
    },
    [onSelection, onItemClick, expandOnItemClick, treeItem, toggleNode],
  );

  return (
    <div style={{ ...style, width: "auto", minWidth: "100%", display: "flex" }}>
      <div
        className={classnames(styles.rowWrapper, {
          [styles.selected]: selectedUid === treeItem.key,
        })}
      >
        <div onClick={onToggleNode} className={styles.gutter}>
          <div style={{ width: treeItem.depth * 10 }} className={styles.depthPlaceholder} />
          <div
            className={classnames(styles.toggleWrapper, {
              [styles.expanded]: treeItem.isExpanded,
              [styles.hidden]: !treeItem.hasChildren,
            })}
          />
        </div>
        <div
          className={styles.labelWrapper}
          onClick={onItemClickHandler}
          style={{ cursor: "pointer" }}
        >
          {itemRenderer(treeItem)}
        </div>
      </div>
    </div>
  );
});

const emptyTreeData: UnPackedTreeData = {
  treeData: [],
  treeItemsById: {},
};

// Imperative API for programmatic tree control
export interface TreeRef {
  // Expansion methods
  expandAll(): void;
  collapseAll(): void;
  expandToLevel(level: number): void;
  expandNode(nodeId: string): void;
  collapseNode(nodeId: string): void;
  
  // Selection methods  
  selectNode(nodeId: string): void;
  clearSelection(): void;
  
  // Utility methods
  getNodeById(nodeId: string): TreeNode | null;
  getExpandedNodes(): string[];
  getSelectedNode(): TreeNode | null;
}

interface TreeComponentProps {
  data?: UnPackedTreeData | any;
  dataFormat?: TreeDataFormat;
  idField?: string;
  labelField?: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentField?: string;
  childrenField?: string;
  selectedValue?: string;
  selectedUid?: string;
  expandedValues?: string[];
  defaultExpanded?: DefaultExpansion;
  autoExpandToSelection?: boolean;
  expandOnItemClick?: boolean;
  onItemClick?: (node: FlatTreeNode) => void;
  onSelectionChanged?: (event: TreeSelectionEvent) => void;
  itemRenderer: (item: any) => ReactNode;
  className?: string;
}

export const TreeComponent = forwardRef<TreeRef, TreeComponentProps>(({
  data = emptyTreeData,
  dataFormat = "native",
  idField = "id",
  labelField = "name",
  iconField = "icon",
  iconExpandedField = "iconExpanded",
  iconCollapsedField = "iconCollapsed",
  parentField = "parentId",
  childrenField = "children",
  selectedValue,
  selectedUid,
  expandedValues = [],
  defaultExpanded = "none",
  autoExpandToSelection = true,
  expandOnItemClick = false,
  onItemClick,
  onSelectionChanged,
  itemRenderer,
  className,
}, ref) => {
  // Internal selection state for uncontrolled usage
  const [internalSelectedUid, setInternalSelectedUid] = useState<string>('');

  // Steps 3a & 3b: Transform data based on format
  // Enhanced data transformation pipeline with validation and error handling
  const transformedData = useMemo(() => {
    // Return empty data if no data provided
    if (!data) {
      return emptyTreeData;
    }

    // Build field configuration with validation
    const fieldConfig: TreeFieldConfig = {
      idField: idField || "id",
      labelField: labelField || "name", 
      iconField,
      iconExpandedField,
      iconCollapsedField,
      parentField,
      childrenField,
    };

    try {
      if (dataFormat === "flat") {
        // Validation: Flat format requires array
        if (!Array.isArray(data)) {
          throw new Error(`TreeComponent: dataFormat='flat' requires array data, received: ${typeof data}`);
        }

        // Validation: Check for required fields in sample data
        if (data.length > 0) {
          const sampleItem = data[0];
          if (typeof sampleItem !== "object" || sampleItem === null) {
            throw new Error("TreeComponent: Flat data items must be objects");
          }
          if (!(fieldConfig.idField in sampleItem)) {
            throw new Error(`TreeComponent: Required field '${fieldConfig.idField}' not found in flat data items`);
          }
          if (!(fieldConfig.labelField in sampleItem)) {
            throw new Error(`TreeComponent: Required field '${fieldConfig.labelField}' not found in flat data items`);
          }
        }

        return flatToNative(data, fieldConfig);
        
      } else if (dataFormat === "hierarchy") {
        // Validation: Hierarchy format requires object or array
        if (!data || (typeof data !== "object")) {
          throw new Error(`TreeComponent: dataFormat='hierarchy' requires object or array data, received: ${typeof data}`);
        }

        // Validation: Check for required fields in hierarchy data
        const checkHierarchyData = (item: any): void => {
          if (typeof item !== "object" || item === null) {
            throw new Error("TreeComponent: Hierarchy data items must be objects");
          }
          if (!(fieldConfig.idField in item)) {
            throw new Error(`TreeComponent: Required field '${fieldConfig.idField}' not found in hierarchy data`);
          }
          if (!(fieldConfig.labelField in item)) {
            throw new Error(`TreeComponent: Required field '${fieldConfig.labelField}' not found in hierarchy data`);
          }
        };

        if (Array.isArray(data)) {
          if (data.length > 0) {
            checkHierarchyData(data[0]);
          }
        } else {
          checkHierarchyData(data);
        }

        return hierarchyToNative(data, fieldConfig);
        
      } else {
        // Native format (existing behavior)
        if (data && typeof data === "object" && "treeData" in data) {
          // Validation: Check native format structure
          const nativeData = data as any;
          if (!Array.isArray(nativeData.treeData)) {
            throw new Error("TreeComponent: Native format requires 'treeData' to be an array");
          }
          if (!nativeData.treeItemsById || typeof nativeData.treeItemsById !== "object") {
            throw new Error("TreeComponent: Native format requires 'treeItemsById' to be an object");
          }
          return data as UnPackedTreeData;
        } else {
          throw new Error("TreeComponent: dataFormat='native' requires UnPackedTreeData format with 'treeData' and 'treeItemsById' properties");
        }
      }
    } catch (error) {
      console.error("TreeComponent: Data transformation error:", error);
      // Return empty data on error to prevent crashes
      return emptyTreeData;
    }
  }, [data, dataFormat, idField, labelField, iconField, iconExpandedField, iconCollapsedField, parentField, childrenField]);

  const { treeData, treeItemsById } = transformedData;

  // Bidirectional ID mapping between source IDs and internal UIDs
  const idMappings = useMemo(() => {
    const sourceToUid = new Map<string, string>();
    const uidToSource = new Map<string, string>();
    
    const collectMappings = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        // For transformed data, map key (source ID) to uid (internal ID)
        if (node.key !== node.uid) {
          sourceToUid.set(node.key, node.uid);
          uidToSource.set(node.uid, node.key);
        }
        if (node.children) {
          collectMappings(node.children);
        }
      });
    };
    
    collectMappings(treeData);
    
    return { sourceToUid, uidToSource };
  }, [treeData]);
  
  // Use selectedValue (source ID) directly since TreeNode.key is the source ID
  const mappedSelectedUid = useMemo(() => {
    if (selectedValue) {
      // For flat/hierarchy formats, selectedValue is already the source ID (matches TreeNode.key)
      return selectedValue;
    }
    return selectedUid;
  }, [selectedValue, selectedUid]);
  
  // Use mapped selectedValue/selectedUid if provided, otherwise use internal state
  const effectiveSelectedUid = mappedSelectedUid !== undefined ? mappedSelectedUid : internalSelectedUid;

  // Selection handler that manages both internal state and external callback
  const handleSelection = useCallback((node: FlatTreeNode) => {
    // Use node.key as the source ID (this matches the original data ID)
    const sourceId = node.key;
    
    // Update internal state if not controlled
    if (selectedUid === undefined) {
      setInternalSelectedUid(node.key);
    }
    
    // Call external callback if provided
    if (onSelectionChanged) {
      onSelectionChanged({
        type: 'selection',
        selectedId: sourceId,
        selectedItem: node,
        selectedNode: node,
        previousId: effectiveSelectedUid,
      });
    }
  }, [selectedUid, effectiveSelectedUid, onSelectionChanged]);
  
  // Initialize expanded IDs based on defaultExpanded prop
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    if (defaultExpanded === "first-level") {
      return treeData.map(node => node.key);
    } else if (defaultExpanded === "all") {
      const allIds: string[] = [];
      const collectIds = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          allIds.push(node.key);
          if (node.children) {
            collectIds(node.children);
          }
        });
      };
      collectIds(treeData);
      return allIds;
    } else if (Array.isArray(defaultExpanded)) {
      return defaultExpanded;
    }
    return [];
  });

  // Icon resolution logic for base/expanded/collapsed states
  const resolveIcon = useCallback((node: TreeNode, isExpanded: boolean, hasChildren: boolean) => {
    // Priority: expanded/collapsed state icons > base icon > default
    if (hasChildren) {
      if (isExpanded && node.iconExpanded) {
        return node.iconExpanded;
      } else if (!isExpanded && node.iconCollapsed) {
        return node.iconCollapsed;
      }
    }
    
    // Fall back to base icon or default folder/file icons
    if (node.icon) {
      return node.icon;
    }
    
    // Default icons based on node type
    return hasChildren ? 'folder' : 'code';
  }, []);
  
  const flatTreeData = useMemo(() => {
    return toFlatTree(treeData, expandedIds);
  }, [expandedIds, treeData]);

  /**
   * ensure the selected item's parents are expanded when selection changes
   */
  useEffect(() => {
    if (autoExpandToSelection && effectiveSelectedUid) {
      // Find node by key (source ID) since treeItemsById is indexed by uid
      const treeItem = Object.values(treeItemsById).find(node => node.key === effectiveSelectedUid);
      if (treeItem) {
        setExpandedIds((prev) => [...prev, ...treeItem.parentIds]);
      }
    }
  }, [autoExpandToSelection, effectiveSelectedUid, treeItemsById]);

  const toggleNode = useCallback((node: FlatTreeNode) => {
    if (!node.isExpanded) {
      setExpandedIds((prev) => [...prev, node.key]);
    } else {
      setExpandedIds((prev) => prev.filter((id) => id !== node.key));
    }
  }, []);

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedUid: effectiveSelectedUid,
      itemRenderer,
      expandOnItemClick,
      onItemClick,
      onSelection: handleSelection,
    };
  }, [flatTreeData, toggleNode, effectiveSelectedUid, itemRenderer, expandOnItemClick, onItemClick, handleSelection]);

  const getItemKey = useCallback((index: number, data: RowContext) => {
    const node = data.nodes[index];
    return node?.key || node?.uid || `fallback-${index}`;
  }, []);

  // Expose imperative API methods via ref
  useImperativeHandle(ref, () => ({
    // Expansion methods
    expandAll: () => {
      const allIds: string[] = [];
      const collectIds = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          allIds.push(node.key);
          if (node.children) {
            collectIds(node.children);
          }
        });
      };
      collectIds(treeData);
      setExpandedIds(allIds);
    },
    
    collapseAll: () => {
      setExpandedIds([]);
    },
    
    expandToLevel: (level: number) => {
      const levelIds: string[] = [];
      const collectIdsToLevel = (nodes: TreeNode[], currentLevel: number = 0) => {
        if (currentLevel >= level) return;
        nodes.forEach(node => {
          levelIds.push(node.key);
          if (node.children && currentLevel < level - 1) {
            collectIdsToLevel(node.children, currentLevel + 1);
          }
        });
      };
      collectIdsToLevel(treeData);
      setExpandedIds(levelIds);
    },
    
    expandNode: (nodeId: string) => {
      // nodeId is source ID, which matches TreeNode.key
      setExpandedIds(prev => prev.includes(nodeId) ? prev : [...prev, nodeId]);
    },
    
    collapseNode: (nodeId: string) => {
      // nodeId is source ID, which matches TreeNode.key
      setExpandedIds(prev => prev.filter(id => id !== nodeId));
    },

    // Selection methods
    selectNode: (nodeId: string) => {
      // Find node by key (source ID) since nodeId is source ID
      const node = Object.values(treeItemsById).find(n => n.key === nodeId);
      if (node && onSelectionChanged) {
        onSelectionChanged({
          type: 'selection',
          selectedId: nodeId,
          selectedItem: node, // Using the full node as the item
          selectedNode: node,
          previousId: selectedValue,
        });
      }
    },
    
    clearSelection: () => {
      if (onSelectionChanged) {
        onSelectionChanged({
          type: 'selection',
          selectedId: '',
          selectedItem: null,
          selectedNode: null as any,
          previousId: selectedValue,
        });
      }
    },

    // Utility methods
    getNodeById: (nodeId: string) => {
      // Find node by key (source ID)
      return Object.values(treeItemsById).find(n => n.key === nodeId) || null;
    },
    
    getExpandedNodes: () => {
      // expandedIds already contains source IDs (keys)
      return expandedIds;
    },
    
    getSelectedNode: () => {
      return selectedUid ? treeItemsById[selectedUid] || null : null;
    },
  }), [treeData, treeItemsById, expandedIds, selectedUid, onSelectionChanged]);

  return (
    <div className={classnames(styles.wrapper, className)}>
      <AutoSizer>
        {({ width, height }) => (
          <FixedSizeList
            height={height}
            itemCount={itemData.nodes.length}
            itemData={itemData}
            itemSize={35}
            itemKey={getItemKey}
            width={width}
          >
            {TreeRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
});
