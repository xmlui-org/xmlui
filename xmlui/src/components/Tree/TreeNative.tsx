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
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

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
  selectedUid: string | undefined;
  itemRenderer: (item: any) => ReactNode;
  expandOnItemClick: boolean;
  onItemClick?: (item: FlatTreeNode) => void;
  onSelection: (node: FlatTreeNode) => void;
  focusedIndex: number;
  lastInteractionWasKeyboard: boolean;
  setIgnoreNextBlur: (ignore: boolean) => void;
  setLastInteractionWasKeyboard: (value: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TreeRow = memo(({ index, style, data }: ListChildComponentProps<RowContext>) => {
  const { nodes, toggleNode, selectedUid, itemRenderer, expandOnItemClick, onItemClick, onSelection, focusedIndex, lastInteractionWasKeyboard, setIgnoreNextBlur, setLastInteractionWasKeyboard, onKeyDown, onFocus, onBlur } = data;
  const treeItem = nodes[index];
  const isFocused = focusedIndex === index && lastInteractionWasKeyboard;
  
  // Use string comparison to handle type mismatches between selectedUid and treeItem.key
  const isSelected = String(selectedUid) === String(treeItem.key);

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
        // Ensure tree container has focus for keyboard navigation
        const treeContainer = (e.target as HTMLElement).closest('[role="tree"]') as HTMLElement;
        if (treeContainer) {
          // Ignore the next blur event that might be caused by refocusing
          setIgnoreNextBlur(true);
          // Always focus the tree container to enable keyboard navigation
          treeContainer.focus();
        }
        
        onSelection(treeItem);
        
        // After a brief delay, enable keyboard interaction for the newly selected item
        // This allows keyboard navigation to work from the clicked position
        setTimeout(() => {
          setLastInteractionWasKeyboard(true);
        }, 100);
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
          [styles.selected]: isSelected,
          [styles.focused]: isFocused,
        })}
        role="treeitem"
        aria-level={treeItem.depth + 1}
        aria-expanded={treeItem.hasChildren ? treeItem.isExpanded : undefined}
        aria-selected={isSelected}
        aria-label={treeItem.displayName}
        tabIndex={isFocused ? 0 : -1}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
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

// Default props following XMLUI conventions
export const defaultProps = {
  dataFormat: "flat" as const,
  idField: "id",
  labelField: "name",
  iconField: "icon",
  iconExpandedField: "iconExpanded",
  iconCollapsedField: "iconCollapsed",
  parentField: "parentId",
  childrenField: "children",
  expandedValues: [] as string[],
  defaultExpanded: "none" as const,
  autoExpandToSelection: true,
  expandOnItemClick: false,
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
  registerComponentApi?: RegisterComponentApiFn;
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
  registerComponentApi,
  data = emptyTreeData,
  dataFormat = defaultProps.dataFormat,
  idField = defaultProps.idField,
  labelField = defaultProps.labelField,
  iconField = defaultProps.iconField,
  iconExpandedField = defaultProps.iconExpandedField,
  iconCollapsedField = defaultProps.iconCollapsedField,
  parentField = defaultProps.parentField,
  childrenField = defaultProps.childrenField,
  selectedValue,
  selectedUid,
  expandedValues = defaultProps.expandedValues,
  defaultExpanded = defaultProps.defaultExpanded,
  autoExpandToSelection = defaultProps.autoExpandToSelection,
  expandOnItemClick = defaultProps.expandOnItemClick,
  onItemClick,
  onSelectionChanged,
  itemRenderer,
  className,
}, ref) => {
  // Internal selection state for uncontrolled usage
  // Initialize with selectedValue if provided and no onSelectionChanged handler (uncontrolled mode)
  const [internalSelectedUid, setInternalSelectedUid] = useState<string>(() => {
    return (!onSelectionChanged && selectedValue) ? String(selectedValue) : '';
  });

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
        throw new Error(`TreeComponent: Unsupported dataFormat '${dataFormat}'. Use 'flat' or 'hierarchy'.`);
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
  
  // Use mapped selectedValue/selectedUid if provided AND onSelectionChanged exists (controlled mode),
  // otherwise use internal state (uncontrolled mode)
  const effectiveSelectedUid = (mappedSelectedUid !== undefined && onSelectionChanged) 
    ? mappedSelectedUid 
    : internalSelectedUid;


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

  // Focus management for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [treeHasFocus, setTreeHasFocus] = useState<boolean>(false);
  const [lastInteractionWasKeyboard, setLastInteractionWasKeyboard] = useState<boolean>(false);
  const [ignoreNextBlur, setIgnoreNextBlur] = useState<boolean>(false);
  
  const flatTreeData = useMemo(() => {
    return toFlatTree(treeData, expandedIds);
  }, [expandedIds, treeData]);



  // Selection handler that manages both internal state and external callback
  const handleSelection = useCallback((node: FlatTreeNode, fromKeyboard: boolean = false) => {
    // Use node.key as the source ID (this matches the original data ID)
    const sourceId = node.key;
    
    // Update internal state if:
    // 1. Not controlled by selectedUid prop, OR
    // 2. No onSelectionChanged handler is provided (allows internal management even with selectedValue)
    if (selectedUid === undefined || !onSelectionChanged) {
      setInternalSelectedUid(node.key);
    }
    
    // Always update focused index to match the selected item for both mouse and keyboard
    const nodeIndex = flatTreeData.findIndex(item => item.key === node.key);
    if (nodeIndex >= 0) {
      setFocusedIndex(nodeIndex);
    }
    
    // Set keyboard interaction flag - this controls whether focus styling is visible
    setLastInteractionWasKeyboard(fromKeyboard);
    
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
  }, [selectedUid, effectiveSelectedUid, onSelectionChanged, flatTreeData, setFocusedIndex, focusedIndex, lastInteractionWasKeyboard]);

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

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!treeHasFocus || flatTreeData.length === 0) return;

    const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
    let newIndex = currentIndex;
    let handled = false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, flatTreeData.length - 1);
        handled = true;
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        handled = true;
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex >= 0) {
          const currentNode = flatTreeData[currentIndex];
          if (currentNode.hasChildren && !currentNode.isExpanded) {
            // Expand node
            toggleNode(currentNode);
          } else if (currentNode.hasChildren && currentNode.isExpanded && currentIndex + 1 < flatTreeData.length) {
            // Move to first child
            newIndex = currentIndex + 1;
          }
        }
        handled = true;
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex >= 0) {
          const currentNode = flatTreeData[currentIndex];
          if (currentNode.hasChildren && currentNode.isExpanded) {
            // Collapse node
            toggleNode(currentNode);
          } else if (currentNode.depth > 0) {
            // Move to parent - find previous node with smaller depth
            for (let i = currentIndex - 1; i >= 0; i--) {
              if (flatTreeData[i].depth < currentNode.depth) {
                newIndex = i;
                break;
              }
            }
          }
        }
        handled = true;
        break;
        
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        handled = true;
        break;
        
      case 'End':
        e.preventDefault();
        newIndex = flatTreeData.length - 1;
        handled = true;
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0) {
          const currentNode = flatTreeData[currentIndex];
          // Handle selection
          if (currentNode.selectable) {
            handleSelection(currentNode, true);
            // Ensure focus stays on the current item after selection
            newIndex = currentIndex;
          }
          // Handle expansion for Enter key
          if (e.key === 'Enter' && currentNode.hasChildren) {
            toggleNode(currentNode);
          }
        }
        handled = true;
        break;
    }

    if (handled) {
      setFocusedIndex(newIndex);
      setLastInteractionWasKeyboard(true);
    }
  }, [treeHasFocus, focusedIndex, flatTreeData, toggleNode, handleSelection]);

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedUid: effectiveSelectedUid,
      itemRenderer,
      expandOnItemClick,
      onItemClick,
      onSelection: handleSelection,
      focusedIndex,
      lastInteractionWasKeyboard,
      setIgnoreNextBlur,
      setLastInteractionWasKeyboard,
      onKeyDown: handleKeyDown,
      onFocus: () => setTreeHasFocus(true),
      onBlur: () => setTreeHasFocus(false),
    };
  }, [flatTreeData, toggleNode, effectiveSelectedUid, itemRenderer, expandOnItemClick, onItemClick, handleSelection, focusedIndex, lastInteractionWasKeyboard, setIgnoreNextBlur, setLastInteractionWasKeyboard, handleKeyDown]);

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
      // Find the node and collect all its descendants
      const nodeToCollapse = Object.values(treeItemsById).find(n => String(n.key) === String(nodeId));
      if (nodeToCollapse) {
        const idsToRemove = new Set<string>();
        
        // Recursively collect all descendant IDs
        const collectDescendants = (node: TreeNode) => {
          idsToRemove.add(String(node.key));
          if (node.children) {
            node.children.forEach(child => collectDescendants(child));
          }
        };
        
        collectDescendants(nodeToCollapse);
        
        // Remove all descendant IDs from expanded list
        setExpandedIds(prev => prev.filter(id => !idsToRemove.has(String(id))));
      }
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
      if (!effectiveSelectedUid) return null;
      // Find node by key (source ID) since effectiveSelectedUid contains the source ID
      return Object.values(treeItemsById).find(node => String(node.key) === String(effectiveSelectedUid)) || null;
    },
  }), [treeData, treeItemsById, expandedIds, effectiveSelectedUid, onSelectionChanged]);

  // Register component API methods for external access
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
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
          setExpandedIds(prev => prev.includes(nodeId) ? prev : [...prev, nodeId]);
        },
        
        collapseNode: (nodeId: string) => {
          // nodeId is source ID, which matches TreeNode.key
          // Find the node and collect all its descendants
          const nodeToCollapse = Object.values(treeItemsById).find(n => String(n.key) === String(nodeId));
          if (nodeToCollapse) {
            const idsToRemove = new Set<string>();
            
            // Recursively collect all descendant IDs
            const collectDescendants = (node: TreeNode) => {
              idsToRemove.add(String(node.key));
              if (node.children) {
                node.children.forEach(child => collectDescendants(child));
              }
            };
            
            collectDescendants(nodeToCollapse);
            
            // Remove all descendant IDs from expanded list
            setExpandedIds(prev => prev.filter(id => !idsToRemove.has(String(id))));
          }
        },

        // Selection methods
        selectNode: (nodeId: string) => {
          const node = Object.values(treeItemsById).find(n => n.key === nodeId);
          if (node && onSelectionChanged) {
            onSelectionChanged({
              type: 'selection',
              selectedId: nodeId,
              selectedItem: node,
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
          return Object.values(treeItemsById).find(n => n.key === nodeId) || null;
        },
        
        getExpandedNodes: () => {
          return expandedIds;
        },
        
        getSelectedNode: () => {
          if (!effectiveSelectedUid) return null;
          // Find node by key (source ID) since effectiveSelectedUid contains the source ID
          return Object.values(treeItemsById).find(node => String(node.key) === String(effectiveSelectedUid)) || null;
        },
      });
    }
  }, [registerComponentApi, treeData, treeItemsById, expandedIds, effectiveSelectedUid, onSelectionChanged, selectedValue, setExpandedIds]);

  // Handle focus management for the tree container
  const handleTreeFocus = useCallback(() => {
    setTreeHasFocus(true);
    
    if (flatTreeData.length > 0) {
      if (focusedIndex === -1) {
        // No focus index set, initialize to selected item or first item
        const selectedIndex = flatTreeData.findIndex(node => String(node.key) === String(effectiveSelectedUid));
        const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        setFocusedIndex(targetIndex);
        setLastInteractionWasKeyboard(true);
      }
      // Note: If focusedIndex is already set (from mouse click), we keep lastInteractionWasKeyboard as is
      // This allows keyboard navigation to work from the clicked position without showing focus border immediately
    }
  }, [focusedIndex, flatTreeData, effectiveSelectedUid, treeHasFocus, lastInteractionWasKeyboard]);

  const handleTreeBlur = useCallback((e: React.FocusEvent) => {
    console.log('🔴 handleTreeBlur called:', {
      ignoreNextBlur,
      relatedTarget: e.relatedTarget,
      currentTarget: e.currentTarget,
      target: e.target
    });
    
    if (ignoreNextBlur) {
      console.log('🟡 handleTreeBlur ignored due to ignoreNextBlur flag');
      setIgnoreNextBlur(false);
      return;
    }
    
    // Check if focus is moving to another element within the tree
    const isMovingWithinTree = e.relatedTarget && 
      e.currentTarget.contains(e.relatedTarget as Node);
    
    if (isMovingWithinTree) {
      console.log('� handleTreeBlur ignored - focus moving within tree');
      return;
    }
    
    console.log('🔴 handleTreeBlur processing - clearing all focus state');
    setTreeHasFocus(false);
    // Clear focus styling when tree loses focus
    setFocusedIndex(-1);
    setLastInteractionWasKeyboard(false);
  }, [ignoreNextBlur]);

  return (
    <div 
      className={classnames(styles.wrapper, className)}
      role="tree"
      aria-label="Tree navigation"
      aria-multiselectable="false"
      tabIndex={0}
      onFocus={handleTreeFocus}
      onBlur={handleTreeBlur}
      onKeyDown={handleKeyDown}
    >
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
