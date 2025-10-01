import { type ReactNode, memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
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

/**
 * Describes the data attached to a particular tree row
 */
interface RowContext {
  nodes: FlatTreeNode[];
  toggleNode: (node: FlatTreeNode) => void;
  selectedId: string | number | undefined;
  itemRenderer: (item: any) => ReactNode;
  expandOnItemClick: boolean;
  onItemClick?: (item: FlatTreeNode) => void;
  onSelection: (node: FlatTreeNode) => void;
  focusedIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  treeContainerRef: React.RefObject<HTMLDivElement>;
}

const TreeRow = memo(({ index, style, data }: ListChildComponentProps<RowContext>) => {
  const {
    nodes,
    toggleNode,
    selectedId,
    itemRenderer,
    expandOnItemClick,
    onItemClick,
    onSelection,
    focusedIndex,
    treeContainerRef,
  } = data;
  const treeItem = nodes[index];
  const isFocused = focusedIndex === index && focusedIndex >= 0;

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
  defaultExpanded: "none" as const,
  autoExpandToSelection: true,
  expandOnItemClick: false,
};

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
  selectedValue?: string | number;
  selectedId?: string | number;
  defaultExpanded?: DefaultExpansion;
  autoExpandToSelection?: boolean;
  expandOnItemClick?: boolean;
  onItemClick?: (node: FlatTreeNode) => void;
  onSelectionChanged?: (event: TreeSelectionEvent) => void;
  onNodeExpanded?: (node: FlatTreeNode) => void;
  onNodeCollapsed?: (node: FlatTreeNode) => void;
  itemRenderer: (item: any) => ReactNode;
  className?: string;
}

export const TreeComponent = memo((props: TreeComponentProps) => {
  const {
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
    defaultExpanded = defaultProps.defaultExpanded,
    autoExpandToSelection = defaultProps.autoExpandToSelection,
    expandOnItemClick = defaultProps.expandOnItemClick,
    onItemClick,
    onSelectionChanged,
    onNodeExpanded,
    onNodeCollapsed,
    itemRenderer,
    className,
  } = props;
  // Internal selection state for uncontrolled usage
  // Initialize with selectedValue if provided and no onSelectionChanged handler (uncontrolled mode)
  const [internalSelectedId, setInternalSelectedId] = useState<string | number | undefined>(() => {
    return !onSelectionChanged && selectedValue ? selectedValue : undefined;
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
          throw new Error(
            `TreeComponent: dataFormat='flat' requires array data, received: ${typeof data}`,
          );
        }

        // Validation: Check for required fields in sample data
        if (data.length > 0) {
          const sampleItem = data[0];
          if (typeof sampleItem !== "object" || sampleItem === null) {
            throw new Error("TreeComponent: Flat data items must be objects");
          }
          if (!(fieldConfig.idField in sampleItem)) {
            throw new Error(
              `TreeComponent: Required field '${fieldConfig.idField}' not found in flat data items`,
            );
          }
          if (!(fieldConfig.labelField in sampleItem)) {
            throw new Error(
              `TreeComponent: Required field '${fieldConfig.labelField}' not found in flat data items`,
            );
          }
        }

        return flatToNative(data, fieldConfig);
      } else if (dataFormat === "hierarchy") {
        // Validation: Hierarchy format requires object or array
        if (!data || typeof data !== "object") {
          throw new Error(
            `TreeComponent: dataFormat='hierarchy' requires object or array data, received: ${typeof data}`,
          );
        }

        // Validation: Check for required fields in hierarchy data
        const checkHierarchyData = (item: any): void => {
          if (typeof item !== "object" || item === null) {
            throw new Error("TreeComponent: Hierarchy data items must be objects");
          }
          if (!(fieldConfig.idField in item)) {
            throw new Error(
              `TreeComponent: Required field '${fieldConfig.idField}' not found in hierarchy data`,
            );
          }
          if (!(fieldConfig.labelField in item)) {
            throw new Error(
              `TreeComponent: Required field '${fieldConfig.labelField}' not found in hierarchy data`,
            );
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
        throw new Error(
          `TreeComponent: Unsupported dataFormat '${dataFormat}'. Use 'flat' or 'hierarchy'.`,
        );
      }
    } catch (error) {
      // Return empty data on error to prevent crashes
      return emptyTreeData;
    }
  }, [
    data,
    dataFormat,
    idField,
    labelField,
    iconField,
    iconExpandedField,
    iconCollapsedField,
    parentField,
    childrenField,
  ]);

  const { treeData, treeItemsById } = transformedData;

  // Use selectedValue (source ID) directly since TreeNode.key is the source ID
  const mappedSelectedId = useMemo(() => {
    if (selectedValue) {
      // For flat/hierarchy formats, selectedValue is already the source ID (matches TreeNode.key)
      return selectedValue;
    }
    return selectedId;
  }, [selectedValue, selectedId]);

  // Determine if we're in controlled mode (has onSelectionChanged handler) or uncontrolled mode
  const isControlledMode = !!onSelectionChanged;

  // Use mapped selectedValue/selectedId if in controlled mode and provided,
  // otherwise use internal state (uncontrolled mode or controlled mode without selectedValue)
  const effectiveSelectedId =
    isControlledMode && mappedSelectedId !== undefined ? mappedSelectedId : internalSelectedId;

  // Initialize expanded IDs based on defaultExpanded prop
  const [expandedIds, setExpandedIds] = useState<(string | number)[]>(() => {
    if (defaultExpanded === "first-level") {
      return treeData.map((node) => node.key);
    } else if (defaultExpanded === "all") {
      const allIds: (string | number)[] = [];
      const collectIds = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
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

  // Simplified focus management
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<FixedSizeList>(null);

  const flatTreeData = useMemo(() => {
    return toFlatTree(treeData, expandedIds);
  }, [expandedIds, treeData]);

  // Tree node utilities for consistent ID mapping
  const findNodeById = useCallback(
    (nodeId: string | number): FlatTreeNode | null => {
      return flatTreeData.find((n) => String(n.key) === String(nodeId)) || null;
    },
    [flatTreeData],
  );

  const findNodeIndexById = useCallback(
    (nodeId: string | number): number => {
      return flatTreeData.findIndex((item) => String(item.key) === String(nodeId));
    },
    [flatTreeData],
  );

  // Tree validation utilities
  const nodeExists = useCallback(
    (nodeId: string | number): boolean => {
      return Object.values(treeItemsById).some((n) => String(n.key) === String(nodeId));
    },
    [treeItemsById],
  );

  /**
   * Centralized selection handler - handles all selection logic consistently
   * @param nodeId - The node key (source ID) to select, or undefined to clear selection
   */
  const setSelectedNodeById = useCallback(
    (nodeId: string | number | undefined) => {
      // Find the node if nodeId is provided
      const node = nodeId
        ? Object.values(treeItemsById).find((n) => String(n.key) === String(nodeId))
        : null;

      const nodeKey = node?.key;

      // Get previous selection for event
      const previousNode = effectiveSelectedId ? findNodeById(effectiveSelectedId) : null;

      // Always update internal state (this provides visual feedback)
      setInternalSelectedId(nodeKey);

      // Update focused index to match the selected item
      if (nodeKey) {
        const nodeIndex = flatTreeData.findIndex((item) => String(item.key) === String(nodeKey));
        if (nodeIndex >= 0) {
          setFocusedIndex(nodeIndex);
        }
      }

      // Fire selection event if handler is provided
      if (onSelectionChanged) {
        const newNode = node
          ? ({
              ...node,
              isExpanded: expandedIds.includes(node.key),
              depth: node.parentIds.length,
              hasChildren: !!(node.children && node.children.length > 0),
            } as FlatTreeNode)
          : null;

        onSelectionChanged({
          previousNode,
          newNode,
        });
      }
    },
    [
      treeItemsById,
      effectiveSelectedId,
      flatTreeData,
      expandedIds,
      onSelectionChanged,
      internalSelectedId,
    ],
  );

  // Simple tree API method implementations
  const getExpandedNodes = useCallback((): (string | number)[] => {
    return expandedIds;
  }, [expandedIds]);

  const getSelectedNode = useCallback(() => {
    if (!effectiveSelectedId) return null;
    return (
      Object.values(treeItemsById).find(
        (node) => String(node.key) === String(effectiveSelectedId),
      ) || null
    );
  }, [effectiveSelectedId, treeItemsById]);

  const getNodeById = useCallback(
    (nodeId: string | number) => {
      return Object.values(treeItemsById).find((n) => String(n.key) === String(nodeId)) || null;
    },
    [treeItemsById],
  );

  const clearSelection = useCallback(() => {
    setSelectedNodeById(undefined);
  }, [setSelectedNodeById]);

  // Initialize selection based on selectedValue prop - only on mount
  useEffect(() => {
    if (selectedValue !== undefined && !onSelectionChanged) {
      // Uncontrolled mode: set initial selection based on selectedValue
      setInternalSelectedId(selectedValue);
    }
  }, []); // Only run on mount

  /**
   * ensure the selected item's parents are expanded when selection changes
   */
  useEffect(() => {
    if (autoExpandToSelection && effectiveSelectedId) {
      // Find node by key (source ID) since treeItemsById is indexed by id
      const treeItem = Object.values(treeItemsById).find(
        (node) => node.key === effectiveSelectedId,
      );
      if (treeItem) {
        setExpandedIds((prev) => [...prev, ...treeItem.parentIds]);
      }
    }
  }, [autoExpandToSelection, effectiveSelectedId, treeItemsById]);

  const toggleNode = useCallback(
    (node: FlatTreeNode) => {
      if (!node.isExpanded) {
        // Expanding the node
        setExpandedIds((prev) => [...prev, node.key]);

        // Fire nodeDidExpand event
        if (onNodeExpanded) {
          onNodeExpanded({ ...node, isExpanded: true });
        }
      } else {
        // Collapsing the node
        setExpandedIds((prev) => prev.filter((id) => id !== node.key));

        // Fire nodeDidCollapse event
        if (onNodeCollapsed) {
          onNodeCollapsed({ ...node, isExpanded: false });
        }
      }
    },
    [onNodeExpanded, onNodeCollapsed],
  );

  // Simplified keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatTreeData.length === 0) return;

      const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
      let newIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, flatTreeData.length - 1);
          handled = true;
          break;

        case "ArrowUp":
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          handled = true;
          break;

        case "ArrowRight":
          e.preventDefault();
          if (currentIndex >= 0) {
            const currentNode = flatTreeData[currentIndex];
            if (currentNode.hasChildren && !currentNode.isExpanded) {
              // Expand node
              toggleNode(currentNode);
            } else if (
              currentNode.hasChildren &&
              currentNode.isExpanded &&
              currentIndex + 1 < flatTreeData.length
            ) {
              // Move to first child
              newIndex = currentIndex + 1;
            }
          }
          handled = true;
          break;

        case "ArrowLeft":
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

        case "Home":
          e.preventDefault();
          newIndex = 0;
          handled = true;
          break;

        case "End":
          e.preventDefault();
          newIndex = flatTreeData.length - 1;
          handled = true;
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (currentIndex >= 0) {
            const currentNode = flatTreeData[currentIndex];
            // Handle selection
            if (currentNode.selectable) {
              setSelectedNodeById(currentNode.key);
              // Ensure focus stays on the current item after selection
              newIndex = currentIndex;
            }
            // Handle expansion for Enter key
            if (e.key === "Enter" && currentNode.hasChildren) {
              toggleNode(currentNode);
            }
          }
          handled = true;
          break;
      }

      if (handled) {
        setFocusedIndex(newIndex);
      }
    },
    [focusedIndex, flatTreeData, toggleNode, setSelectedNodeById],
  );

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedId: effectiveSelectedId,
      itemRenderer,
      expandOnItemClick,
      onItemClick,
      onSelection: (node: FlatTreeNode) => setSelectedNodeById(node.key),
      focusedIndex,
      onKeyDown: handleKeyDown,
      treeContainerRef,
    };
  }, [
    flatTreeData,
    toggleNode,
    effectiveSelectedId,
    itemRenderer,
    expandOnItemClick,
    onItemClick,
    setSelectedNodeById,
    focusedIndex,
    handleKeyDown,
  ]);

  const getItemKey = useCallback((index: number, data: RowContext) => {
    const node = data.nodes[index];
    return node?.key || node?.id || `fallback-${index}`;
  }, []);

  // Shared API implementation to avoid duplication between ref and component APIs
  const treeApiMethods = useMemo(() => {
    return {
      // Expansion methods
      expandAll: () => {
        const allIds: (string | number)[] = [];
        const collectIds = (nodes: TreeNode[]) => {
          nodes.forEach((node) => {
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
        const levelIds: (string | number)[] = [];
        const collectIdsToLevel = (nodes: TreeNode[], currentLevel: number = 0) => {
          if (currentLevel >= level) return;
          nodes.forEach((node) => {
            levelIds.push(node.key);
            if (node.children && currentLevel < level - 1) {
              collectIdsToLevel(node.children, currentLevel + 1);
            }
          });
        };
        collectIdsToLevel(treeData);
        setExpandedIds(levelIds);
      },

      expandNode: (nodeId: string | number) => {
        // nodeId is source ID, which matches TreeNode.key
        const wasExpanded = expandedIds.includes(nodeId);
        if (!wasExpanded) {
          setExpandedIds((prev) => [...prev, nodeId]);

          // Fire nodeDidExpand event
          const node = findNodeById(nodeId);
          if (node && onNodeExpanded) {
            onNodeExpanded({ ...node, isExpanded: true });
          }
        }
      },

      collapseNode: (nodeId: string | number) => {
        // nodeId is source ID, which matches TreeNode.key
        const wasExpanded = expandedIds.includes(nodeId);
        if (!wasExpanded) return; // Nothing to collapse

        // Find the node and collect all its descendants
        const nodeToCollapse = Object.values(treeItemsById).find(
          (n) => String(n.key) === String(nodeId),
        );
        if (nodeToCollapse) {
          const idsToRemove = new Set<string>();

          // Recursively collect all descendant IDs
          const collectDescendants = (treeNode: TreeNode) => {
            idsToRemove.add(String(treeNode.key));
            if (treeNode.children) {
              treeNode.children.forEach((child) => collectDescendants(child));
            }
          };

          collectDescendants(nodeToCollapse);

          // Remove all descendant IDs from expanded list
          setExpandedIds((prev) => prev.filter((id) => !idsToRemove.has(String(id))));

          // Fire nodeDidCollapse event
          if (nodeToCollapse && onNodeCollapsed) {
            // Convert to FlatTreeNode format for the event
            const flatNode: FlatTreeNode = {
              ...nodeToCollapse,
              isExpanded: false,
              depth: nodeToCollapse.parentIds.length,
              hasChildren: !!(nodeToCollapse.children && nodeToCollapse.children.length > 0),
            };
            onNodeCollapsed(flatNode);
          }
        }
      },

      // Selection methods
      selectNode: (nodeId: string | number) => {
        // Check if node exists before calling setSelectedNodeById
        if (nodeExists(nodeId)) {
          return setSelectedNodeById(nodeId);
        } else {
          return setSelectedNodeById(undefined);
        }
      },

      clearSelection,

      // Utility methods
      getNodeById,

      getExpandedNodes,

      getSelectedNode,

      scrollIntoView: (nodeId: string | number, options?: ScrollIntoViewOptions) => {
        // Find the target node
        const targetNode = Object.values(treeItemsById).find(
          (n) => String(n.key) === String(nodeId),
        );
        if (!targetNode) {
          return; // Node not found
        }

        // Collect all parent IDs that need to be expanded
        const parentsToExpand: (string | number)[] = [];
        const collectParents = (node: TreeNode) => {
          if (node.parentIds && node.parentIds.length > 0) {
            // Add all parent IDs to expansion list
            parentsToExpand.push(...node.parentIds);
          }
        };

        collectParents(targetNode);

        // Calculate the new expanded IDs including parents
        const newExpandedIds = [...new Set([...expandedIds, ...parentsToExpand])];

        // Expand all parent nodes if they aren't already expanded
        if (parentsToExpand.length > 0) {
          setExpandedIds(newExpandedIds);
        }

        // Use setTimeout to ensure DOM is updated after expansion state change
        setTimeout(() => {
          // Generate the flat tree data with the new expanded state to find the correct index
          const updatedFlatTreeData = toFlatTree(treeData, newExpandedIds);
          const nodeIndex = updatedFlatTreeData.findIndex(
            (item) => String(item.key) === String(nodeId),
          );

          if (nodeIndex >= 0 && listRef.current) {
            // Scroll to the item using the FixedSizeList's scrollToItem method
            listRef.current.scrollToItem(nodeIndex, "center");
          }
        }, 0);
      },

      scrollToItem: (nodeId: string | number) => {
        // Simple scroll without expanding - just scroll to the item if it's visible
        const nodeIndex = findNodeIndexById(nodeId);

        if (nodeIndex >= 0 && listRef.current) {
          listRef.current.scrollToItem(nodeIndex, "center");
        }
      },
    };
  }, [
    treeData,
    treeItemsById,
    expandedIds,
    effectiveSelectedId,
    flatTreeData,
    onNodeExpanded,
    onNodeCollapsed,
    setSelectedNodeById,
    nodeExists,
  ]);

  // Register component API methods for external access
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi(treeApiMethods);
    }
  }, [registerComponentApi, treeApiMethods]);

  // Simplified focus management for the tree container
  const handleTreeFocus = useCallback(() => {
    if (flatTreeData.length > 0 && focusedIndex === -1) {
      // Initialize to selected item or first item on focus
      const selectedIndex = findNodeIndexById(effectiveSelectedId);
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setFocusedIndex(targetIndex);
    }
  }, [focusedIndex, flatTreeData, effectiveSelectedId]);

  const handleTreeBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus is moving to another element within the tree
    const isMovingWithinTree = e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node);

    if (!isMovingWithinTree) {
      // Clear focus when tree loses focus completely
      setFocusedIndex(-1);
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
            ref={listRef}
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
