import {
  type CSSProperties,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
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
  selectedId: string | undefined;
  itemRenderer: (item: any) => ReactNode;
  expandOnItemClick: boolean;
  onItemClick?: (item: FlatTreeNode) => void;
  onSelection: (node: FlatTreeNode) => void;
  focusedIndex: number;
  keyboardMode: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  treeContainerRef: React.RefObject<HTMLDivElement>;
}

const TreeRow = memo(({ index, style, data }: ListChildComponentProps<RowContext>) => {
  const { nodes, toggleNode, selectedId, itemRenderer, expandOnItemClick, onItemClick, onSelection, focusedIndex, keyboardMode, onKeyDown, treeContainerRef } = data;
  const treeItem = nodes[index];
  const isFocused = focusedIndex === index && keyboardMode;
  
  // Use string comparison to handle type mismatches between selectedId and treeItem.key
  const isSelected = String(selectedId) === String(treeItem.key);

  const onToggleNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleNode(treeItem);
    },
    [toggleNode, treeItem],
  );

  const onItemClickHandler = useCallback(
    (e: React.MouseEvent) => {
      // Handle selection for selectable items
      if (treeItem.selectable) {
        onSelection(treeItem);
        // Ensure tree container maintains focus after mouse selection
        setTimeout(() => {
          treeContainerRef.current?.focus();
        }, 0);
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
    [onSelection, onItemClick, expandOnItemClick, treeItem, toggleNode, treeContainerRef],
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
  registerComponentApi?: (api: any) => void;
  data?: UnPackedTreeData;
  dataFormat?: TreeDataFormat;
  idField?: string;
  labelField?: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentField?: string;
  childrenField?: string;
  selectedValue?: string;
  selectedId?: string;
  expandedValues?: string[];
  defaultExpanded?: DefaultExpansion;
  autoExpandToSelection?: boolean;
  expandOnItemClick?: boolean;
  onItemClick?: (node: FlatTreeNode) => void;
  onSelectionChanged?: (event: TreeSelectionEvent) => void;
  onNodeWillExpand?: (node: FlatTreeNode) => boolean | void;
  onNodeExpanded?: (node: FlatTreeNode) => void;
  onNodeWillCollapse?: (node: FlatTreeNode) => boolean | void;
  onNodeCollapsed?: (node: FlatTreeNode) => void;
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
  selectedId,
  expandedValues = defaultProps.expandedValues,
  defaultExpanded = defaultProps.defaultExpanded,
  autoExpandToSelection = defaultProps.autoExpandToSelection,
  expandOnItemClick = defaultProps.expandOnItemClick,
  onItemClick,
  onSelectionChanged,
  onNodeWillExpand,
  onNodeExpanded,
  onNodeWillCollapse,
  onNodeCollapsed,
  itemRenderer,
  className,
}, ref) => {
  // Internal selection state for uncontrolled usage
  // Initialize with selectedValue if provided and no onSelectionChanged handler (uncontrolled mode)
  const [internalSelectedId, setInternalSelectedId] = useState<string>(() => {
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

  // Bidirectional ID mapping between source IDs and internal IDs
  const idMappings = useMemo(() => {
    const sourceToId = new Map<string, string>();
    const idToSource = new Map<string, string>();
    
    const collectMappings = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        // For transformed data, map key (source ID) to id (internal ID)
        if (node.key !== node.id) {
          sourceToId.set(node.key, node.id);
          idToSource.set(node.id, node.key);
        }
        if (node.children) {
          collectMappings(node.children);
        }
      });
    };
    
    collectMappings(treeData);
    
    return { sourceToId, idToSource };
  }, [treeData]);
  
  // Use selectedValue (source ID) directly since TreeNode.key is the source ID
  const mappedSelectedId = useMemo(() => {
    if (selectedValue) {
      // For flat/hierarchy formats, selectedValue is already the source ID (matches TreeNode.key)
      return selectedValue;
    }
    return selectedId;
  }, [selectedValue, selectedId]);
  
  // Use mapped selectedValue/selectedId if provided AND onSelectionChanged exists (controlled mode),
  // otherwise use internal state (uncontrolled mode)
  const effectiveSelectedId = (mappedSelectedId !== undefined && onSelectionChanged) 
    ? mappedSelectedId 
    : internalSelectedId;


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

  // Simplified focus management
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [keyboardMode, setKeyboardMode] = useState<boolean>(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  
  const flatTreeData = useMemo(() => {
    return toFlatTree(treeData, expandedIds);
  }, [expandedIds, treeData]);



  // Simplified selection handler
  const handleSelection = useCallback((node: FlatTreeNode) => {
    const sourceId = node.key;
    
    // Update internal state if not controlled by external selectedValue/selectedId
    if (selectedId === undefined || !onSelectionChanged) {
      setInternalSelectedId(node.key);
    }
    
    // Update focused index to match the selected item
    const nodeIndex = flatTreeData.findIndex(item => item.key === node.key);
    if (nodeIndex >= 0) {
      setFocusedIndex(nodeIndex);
    }
    
    // Call external callback if provided
    if (onSelectionChanged) {
      // Find previous node if there was a previous selection
      const previousNode = effectiveSelectedId 
        ? flatTreeData.find(n => String(n.key) === String(effectiveSelectedId)) || null
        : null;
      
      onSelectionChanged({
        previousNode,
        newNode: node,
      });
    }
  }, [selectedId, effectiveSelectedId, onSelectionChanged, flatTreeData]);

  /**
   * ensure the selected item's parents are expanded when selection changes
   */
  useEffect(() => {
    if (autoExpandToSelection && effectiveSelectedId) {
      // Find node by key (source ID) since treeItemsById is indexed by id
      const treeItem = Object.values(treeItemsById).find(node => node.key === effectiveSelectedId);
      if (treeItem) {
        setExpandedIds((prev) => [...prev, ...treeItem.parentIds]);
      }
    }
  }, [autoExpandToSelection, effectiveSelectedId, treeItemsById]);

  const toggleNode = useCallback((node: FlatTreeNode) => {
    if (!node.isExpanded) {
      // Fire nodeWillExpand event - check for cancellation
      if (onNodeWillExpand) {
        const result = onNodeWillExpand({ ...node, isExpanded: false });
        if (result === false) {
          return; // Cancel expansion
        }
      }
      
      // Expanding the node
      setExpandedIds((prev) => [...prev, node.key]);
      
      // Fire nodeDidExpand event
      if (onNodeExpanded) {
        onNodeExpanded({ ...node, isExpanded: true });
      }
    } else {
      // Fire nodeWillCollapse event - check for cancellation
      if (onNodeWillCollapse) {
        const result = onNodeWillCollapse({ ...node, isExpanded: true });
        if (result === false) {
          return; // Cancel collapse
        }
      }
      
      // Collapsing the node
      setExpandedIds((prev) => prev.filter((id) => id !== node.key));
      
      // Fire nodeDidCollapse event
      if (onNodeCollapsed) {
        onNodeCollapsed({ ...node, isExpanded: false });
      }
    }
  }, [onNodeWillExpand, onNodeExpanded, onNodeWillCollapse, onNodeCollapsed]);

  // Simplified keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (flatTreeData.length === 0) return;

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
            handleSelection(currentNode);
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
      setKeyboardMode(true);
    }
  }, [focusedIndex, flatTreeData, toggleNode, handleSelection]);

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedId: effectiveSelectedId,
      itemRenderer,
      expandOnItemClick,
      onItemClick,
      onSelection: handleSelection,
      focusedIndex,
      keyboardMode,
      onKeyDown: handleKeyDown,
      treeContainerRef,
    };
  }, [flatTreeData, toggleNode, effectiveSelectedId, itemRenderer, expandOnItemClick, onItemClick, handleSelection, focusedIndex, keyboardMode, handleKeyDown]);

  const getItemKey = useCallback((index: number, data: RowContext) => {
    const node = data.nodes[index];
    return node?.key || node?.id || `fallback-${index}`;
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
      const wasExpanded = expandedIds.includes(nodeId);
      if (!wasExpanded) {
        // Find the node to fire the will event
        const node = flatTreeData.find(n => String(n.key) === String(nodeId));
        if (node && onNodeWillExpand) {
          const result = onNodeWillExpand({ ...node, isExpanded: false });
          if (result === false) {
            return; // Cancel expansion
          }
        }
        
        setExpandedIds(prev => [...prev, nodeId]);
        
        // Fire nodeDidExpand event
        if (node && onNodeExpanded) {
          onNodeExpanded({ ...node, isExpanded: true });
        }
      }
    },
    
    collapseNode: (nodeId: string) => {
      // nodeId is source ID, which matches TreeNode.key
      const wasExpanded = expandedIds.includes(nodeId);
      if (!wasExpanded) return; // Nothing to collapse
      
      // Find the node to fire the will event
      const node = flatTreeData.find(n => String(n.key) === String(nodeId));
      if (node && onNodeWillCollapse) {
        const result = onNodeWillCollapse({ ...node, isExpanded: true });
        if (result === false) {
          return; // Cancel collapse
        }
      }
      
      // Find the node and collect all its descendants
      const nodeToCollapse = Object.values(treeItemsById).find(n => String(n.key) === String(nodeId));
      if (nodeToCollapse) {
        const idsToRemove = new Set<string>();
        
        // Recursively collect all descendant IDs
        const collectDescendants = (treeNode: TreeNode) => {
          idsToRemove.add(String(treeNode.key));
          if (treeNode.children) {
            treeNode.children.forEach(child => collectDescendants(child));
          }
        };
        
        collectDescendants(nodeToCollapse);
        
        // Remove all descendant IDs from expanded list
        setExpandedIds(prev => prev.filter(id => !idsToRemove.has(String(id))));
        
        // Fire nodeDidCollapse event
        if (node && onNodeCollapsed) {
          onNodeCollapsed({ ...node, isExpanded: false });
        }
      }
    },

    // Selection methods
    selectNode: (nodeId: string) => {
      // Find node by key (source ID) since nodeId is source ID
      const node = Object.values(treeItemsById).find(n => n.key === nodeId);
      if (node && onSelectionChanged) {
        // Convert TreeNode to FlatTreeNode format
        const flatNode: FlatTreeNode = {
          ...node,
          isExpanded: expandedIds.includes(node.key),
          depth: node.parentIds.length,
          hasChildren: !!(node.children && node.children.length > 0),
        };
        
        // Find previous node if there was a previous selection
        const previousNode = selectedValue 
          ? flatTreeData.find(n => String(n.key) === String(selectedValue)) || null
          : null;
        
        onSelectionChanged({
          previousNode,
          newNode: flatNode,
        });
      }
    },
    
    clearSelection: () => {
      if (onSelectionChanged) {
        // Find previous node if there was a previous selection
        const previousNode = selectedValue 
          ? flatTreeData.find(n => String(n.key) === String(selectedValue)) || null
          : null;
        
        onSelectionChanged({
          previousNode,
          newNode: null,
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
      if (!effectiveSelectedId) return null;
      // Find node by key (source ID) since effectiveSelectedId contains the source ID
      return Object.values(treeItemsById).find(node => String(node.key) === String(effectiveSelectedId)) || null;
    },
  }), [treeData, treeItemsById, expandedIds, effectiveSelectedId, onSelectionChanged]);

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
          const wasExpanded = expandedIds.includes(nodeId);
          if (!wasExpanded) {
            setExpandedIds(prev => [...prev, nodeId]);
            
            // Find the node to fire the event
            const node = flatTreeData.find(n => String(n.key) === String(nodeId));
            if (node && onNodeExpanded) {
              onNodeExpanded({ ...node, isExpanded: true });
            }
          }
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
            
            // Fire nodeDidCollapse event only if the node was actually expanded
            const wasExpanded = expandedIds.includes(nodeId);
            if (wasExpanded) {
              const node = flatTreeData.find(n => String(n.key) === String(nodeId));
              if (node && onNodeCollapsed) {
                onNodeCollapsed({ ...node, isExpanded: false });
              }
            }
          }
        },

        // Selection methods
        selectNode: (nodeId: string) => {
          const node = Object.values(treeItemsById).find(n => n.key === nodeId);
          if (node && onSelectionChanged) {
            // Convert TreeNode to FlatTreeNode format
            const flatNode: FlatTreeNode = {
              ...node,
              isExpanded: expandedIds.includes(node.key),
              depth: node.parentIds.length,
              hasChildren: !!(node.children && node.children.length > 0),
            };
            
            // Find previous node if there was a previous selection
            const previousNode = selectedValue 
              ? flatTreeData.find(n => String(n.key) === String(selectedValue)) || null
              : null;
            
            onSelectionChanged({
              previousNode,
              newNode: flatNode,
            });
          }
        },
        
        clearSelection: () => {
          if (onSelectionChanged) {
            // Find previous node if there was a previous selection
            const previousNode = selectedValue 
              ? flatTreeData.find(n => String(n.key) === String(selectedValue)) || null
              : null;
            
            onSelectionChanged({
              previousNode,
              newNode: null,
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
          if (!effectiveSelectedId) return null;
          // Find node by key (source ID) since effectiveSelectedId contains the source ID
          return Object.values(treeItemsById).find(node => String(node.key) === String(effectiveSelectedId)) || null;
        },
      });
    }
  }, [registerComponentApi, treeData, treeItemsById, expandedIds, effectiveSelectedId, onSelectionChanged, selectedValue, setExpandedIds, onNodeWillExpand, onNodeExpanded, onNodeWillCollapse, onNodeCollapsed, flatTreeData]);

    // Simplified focus management for the tree container
  const handleTreeFocus = useCallback(() => {
    if (flatTreeData.length > 0 && focusedIndex === -1) {
      // Initialize to selected item or first item on focus
      const selectedIndex = flatTreeData.findIndex(node => String(node.key) === String(effectiveSelectedId));
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setFocusedIndex(targetIndex);
      setKeyboardMode(true);
    }
  }, [focusedIndex, flatTreeData, effectiveSelectedId]);

  const handleTreeBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus is moving to another element within the tree
    const isMovingWithinTree = e.relatedTarget && 
      e.currentTarget.contains(e.relatedTarget as Node);
    
    if (!isMovingWithinTree) {
      // Clear focus when tree loses focus completely
      setFocusedIndex(-1);
      setKeyboardMode(false);
    }
  }, []);


  return (
    <div 
      ref={treeContainerRef}
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
