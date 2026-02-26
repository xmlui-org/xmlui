import { type ReactNode, memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import classnames from "classnames";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedSpinner as Spinner } from "../Spinner/Spinner";
import { ThemedScroller as Scroller } from "../ScrollViewer/ScrollViewer";

import styles from "./TreeComponent.module.scss";

import type {
  FlatTreeNode,
  TreeNode,
  UnPackedTreeData,
  TreeFieldConfig,
  TreeSelectionEvent,
  TreeDataFormat,
  DefaultExpansion,
  NodeLoadingState,
  FlatTreeNodeWithState,
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
  itemClickExpands: boolean;
  onItemClick?: (item: FlatTreeNode) => void;
  onSelection: (node: FlatTreeNode) => void;
  lookupEventHandler?: any;
  focusedIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  treeContainerRef: React.RefObject<HTMLDivElement>;
  iconCollapsed: string;
  iconExpanded: string;
  iconSize: string;
  animateExpand: boolean;
  expandRotation: number;
  spinnerDelay: number;
}

interface TreeRowProps {
  index: number;
  data: RowContext;
}

const TreeRow = memo(({ index, data }: TreeRowProps) => {
  const {
    nodes,
    toggleNode,
    selectedId,
    itemRenderer,
    itemClickExpands,
    onItemClick,
    onSelection,
    lookupEventHandler,
    focusedIndex,
    treeContainerRef,
    iconCollapsed,
    iconExpanded,
    iconSize,
    animateExpand,
    expandRotation,
    spinnerDelay,
  } = data;
  const treeItem = nodes[index];
  const isFocused = focusedIndex === index && focusedIndex >= 0;

  // Use string comparison to handle type mismatches between selectedId and treeItem.key
  const isSelected = String(selectedId) === String(treeItem.key);

  // Track whether the spinner delay has expired for this loading node
  const nodeWithState = treeItem as FlatTreeNodeWithState;
  const isLoading = nodeWithState.loadingState === "loading";
  const [showSpinner, setShowSpinner] = useState(false);

  // Manage spinner delay: show expand icon during delay, then show spinner
  useEffect(() => {
    if (isLoading) {
      if (spinnerDelay === 0) {
        // No delay - show spinner immediately
        setShowSpinner(true);
      } else {
        // Delay showing the spinner
        const timer = setTimeout(() => {
          setShowSpinner(true);
        }, spinnerDelay);
        return () => clearTimeout(timer);
      }
    } else {
      // Not loading - reset spinner state
      setShowSpinner(false);
    }
  }, [isLoading, spinnerDelay]);

  const onToggleNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Prevent toggling if node is in loading state
      if (isLoading) {
        return;
      }
      toggleNode(treeItem);
    },
    [toggleNode, treeItem, isLoading],
  );

  const onGutterMouseDownHandler = useCallback(
    (e: React.MouseEvent) => {
      // Handle selection on mouse down in gutter area (for right-click context menu)
      // Only select, don't toggle expansion
      if (treeItem.selectable) {
        onSelection(treeItem);
        // Ensure tree container maintains focus after mouse selection
        setTimeout(() => {
          treeContainerRef.current?.focus();
        }, 0);
      }
    },
    [onSelection, treeItem, treeContainerRef],
  );

  const onItemMouseDownHandler = useCallback(
    (e: React.MouseEvent) => {
      // Handle selection immediately on mouse down for immediate visual feedback
      if (treeItem.selectable) {
        onSelection(treeItem);
        // Ensure tree container maintains focus after mouse selection
        setTimeout(() => {
          treeContainerRef.current?.focus();
        }, 0);
      }
    },
    [onSelection, treeItem, treeContainerRef],
  );

  const onItemClickHandler = useCallback(
    (e: React.MouseEvent) => {
      // Selection is already handled in onMouseDown, so we skip it here

      // Call optional onItemClick callback
      if (onItemClick) {
        onItemClick(treeItem);
      }

      // If itemClickExpands is enabled and item has children, also toggle
      // But prevent toggling if node is in loading state
      if (itemClickExpands && treeItem.hasChildren && !isLoading) {
        toggleNode(treeItem);
      }
    },
    [onItemClick, itemClickExpands, treeItem, toggleNode, isLoading],
  );

  const onContextMenuHandler = useCallback(
    (e: React.MouseEvent) => {
      // Prevent default browser context menu
      e.preventDefault();
      
      // Focus the item when context menu is triggered
      if (treeItem.selectable) {
        onSelection(treeItem);
        // Ensure tree container maintains focus after mouse selection
        setTimeout(() => {
          treeContainerRef.current?.focus();
        }, 0);
      }
      
      // Use lookupEventHandler with context containing item variables
      if (lookupEventHandler) {
        const handler = lookupEventHandler("contextMenu", {
          context: {
            $item: {
              id: treeItem.id,
              name: treeItem.displayName,
              depth: treeItem.depth,
              isExpanded: treeItem.isExpanded,
              hasChildren: treeItem.hasChildren,
              ...treeItem,
            },
          },
          ephemeral: true, // Don't cache this handler since context changes per row
        });
        
        handler?.(e);
      }
    },
    [lookupEventHandler, treeItem, onSelection, treeContainerRef],
  );

  return (
    <div style={{ width: "100%", display: "flex" }}>
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
        aria-busy={isLoading}
        tabIndex={isFocused ? 0 : -1}
        onContextMenu={onContextMenuHandler}
      >
        <div
          onClick={onToggleNode}
          onMouseDown={onGutterMouseDownHandler}
          className={styles.gutter}
          style={{ cursor: isLoading ? "default" : "pointer" }}
        >
          <div style={{ width: treeItem.depth * 10 }} className={styles.depthPlaceholder} />
          <div
            className={classnames(styles.toggleWrapper, {
              [styles.expanded]: treeItem.isExpanded,
              [styles.hidden]: !treeItem.hasChildren,
            })}
          >
            {treeItem.hasChildren && (
              <>
                {/* Show spinner only after delay expires, otherwise show expand icon */}
                {isLoading && showSpinner ? (
                  <Spinner data-tree-node-spinner delay={0} style={{ width: 24, height: 24 }} />
                ) : (
                  <ThemedIcon
                    data-tree-expand-icon
                    name={
                      animateExpand
                        ? treeItem.iconCollapsed || iconCollapsed
                        : treeItem.isExpanded
                          ? treeItem.iconExpanded || iconExpanded
                          : treeItem.iconCollapsed || iconCollapsed
                    }
                    size={iconSize}
                    className={classnames(styles.toggleIcon, {
                      [styles.rotated]: animateExpand && treeItem.isExpanded,
                    })}
                    style={
                      animateExpand && treeItem.isExpanded
                        ? {
                            transform: `rotate(${expandRotation}deg)`,
                          }
                        : undefined
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div
          className={styles.labelWrapper}
          onMouseDown={onItemMouseDownHandler}
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

/**
 * Find all parent node IDs for a given node ID by traversing up the tree structure
 * @param nodeId The target node ID to find parents for
 * @param treeItemsById Map of all tree nodes by their ID
 * @returns Array of parent node IDs from immediate parent to root
 */
const findAllParentIds = (
  nodeId: string | number,
  treeItemsById: Record<string, TreeNode>,
): (string | number)[] => {
  const parentIds: (string | number)[] = [];
  const targetNode = treeItemsById[String(nodeId)];

  if (!targetNode) {
    return parentIds;
  }

  // Walk up the tree using parentIds property which contains the path from root to parent
  if (targetNode.parentIds && targetNode.parentIds.length > 0) {
    parentIds.push(...targetNode.parentIds);
  }

  return parentIds;
};

/**
 * Collect descendant node IDs for a given node.
 * @param treeNode Root node
 * @param includeSelf Whether to include the root node in the result
 */
const collectDescendantIds = (treeNode: TreeNode, includeSelf = false): Set<string> => {
  const ids = new Set<string>();

  const visit = (node: TreeNode, isRoot: boolean) => {
    if (!isRoot || includeSelf) {
      ids.add(String(node.key));
    }
    if (node.children) {
      node.children.forEach((child) => visit(child, false));
    }
  };

  visit(treeNode, true);
  return ids;
};

/**
 * Expand all parent paths for an array of node IDs to ensure they are visible
 * @param nodeIds Array of node IDs that should be expanded
 * @param treeItemsById Map of all tree nodes by their ID
 * @returns Array containing original node IDs plus all necessary parent IDs
 */
const expandParentPaths = (
  nodeIds: (string | number)[],
  treeItemsById: Record<string, TreeNode>,
): (string | number)[] => {
  const allExpandedIds = new Set<string | number>(nodeIds);

  // For each target node, find and add all its parent IDs
  nodeIds.forEach((nodeId) => {
    const parentIds = findAllParentIds(nodeId, treeItemsById);
    parentIds.forEach((parentId) => allExpandedIds.add(parentId));
  });

  return Array.from(allExpandedIds);
};

// Default props following XMLUI conventions
export const defaultProps = {
  dataFormat: "flat" as const,
  idField: "id",
  nameField: "name",
  iconField: "icon",
  iconExpandedField: "iconExpanded",
  iconCollapsedField: "iconCollapsed",
  parentIdField: "parentId",
  childrenField: "children",
  selectableField: "selectable",
  defaultExpanded: "none" as const,
  autoExpandToSelection: true,
  itemClickExpands: false,
  dynamicField: "dynamic",
  loadedField: "loaded",
  autoLoadAfterField: "autoLoadAfter",
  dynamic: false,
  iconCollapsed: "chevronright",
  iconExpanded: "chevrondown",
  iconSize: "16",
  itemHeight: 32,
  animateExpand: false,
  expandRotation: 90,
  scrollStyle: "normal" as const,
  showScrollerFade: false,
  autoLoadAfter: undefined as number | undefined,
  spinnerDelay: 0,
};

interface TreeComponentProps {
  registerComponentApi?: (api: any) => void;
  data?: any; // Raw data in flat array or hierarchy format
  dataFormat?: TreeDataFormat;
  idField?: string;
  nameField?: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentIdField?: string;
  childrenField?: string;
  selectableField?: string;
  selectedValue?: string | number;
  selectedId?: string | number;
  defaultExpanded?: DefaultExpansion;
  autoExpandToSelection?: boolean;
  itemClickExpands?: boolean;
  dynamicField?: string;
  loadedField?: string;
  autoLoadAfterField?: string;
  dynamic?: boolean;
  iconCollapsed?: string;
  iconExpanded?: string;
  iconSize?: string;
  itemHeight?: number;
  fixedItemSize?: boolean;
  animateExpand?: boolean;
  expandRotation?: number;
  scrollStyle?: "normal" | "overlay" | "whenMouseOver" | "whenScrolling";
  showScrollerFade?: boolean;
  autoLoadAfter?: number;
  spinnerDelay?: number;
  onItemClick?: (node: FlatTreeNode) => void;
  onSelectionChanged?: (event: TreeSelectionEvent) => void;
  onNodeExpanded?: (node: FlatTreeNode) => void;
  onNodeCollapsed?: (node: FlatTreeNode) => void;
  loadChildren?: (node: FlatTreeNode) => Promise<any[]>;
  onCutAction?: (node: FlatTreeNode) => void | Promise<void>;
  onCopyAction?: (node: FlatTreeNode) => void | Promise<void>;
  onPasteAction?: (node: FlatTreeNode) => void | Promise<void>;
  onDeleteAction?: (node: FlatTreeNode) => void | Promise<void>;
  lookupEventHandler?: any;
  itemRenderer: (item: any) => ReactNode;
  className?: string;
}

export const TreeComponent = memo((props: TreeComponentProps) => {
  const {
    registerComponentApi,
    data = emptyTreeData,
    dataFormat = defaultProps.dataFormat,
    idField = defaultProps.idField,
    nameField = defaultProps.nameField,
    iconField = defaultProps.iconField,
    iconExpandedField = defaultProps.iconExpandedField,
    iconCollapsedField = defaultProps.iconCollapsedField,
    parentIdField = defaultProps.parentIdField,
    childrenField = defaultProps.childrenField,
    selectableField = defaultProps.selectableField,
    selectedValue,
    selectedId,
    defaultExpanded = defaultProps.defaultExpanded,
    autoExpandToSelection = defaultProps.autoExpandToSelection,
    itemClickExpands = defaultProps.itemClickExpands,
    dynamicField = defaultProps.dynamicField,
    loadedField = defaultProps.loadedField,
    autoLoadAfterField = defaultProps.autoLoadAfterField,
    dynamic = defaultProps.dynamic,
    iconCollapsed = defaultProps.iconCollapsed,
    iconExpanded = defaultProps.iconExpanded,
    iconSize = defaultProps.iconSize,
    itemHeight = defaultProps.itemHeight,
    fixedItemSize,
    animateExpand = defaultProps.animateExpand,
    expandRotation = defaultProps.expandRotation,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    autoLoadAfter = defaultProps.autoLoadAfter,
    spinnerDelay = defaultProps.spinnerDelay,
    onItemClick,
    onSelectionChanged,
    onNodeExpanded,
    onNodeCollapsed,
    loadChildren,
    onCutAction,
    onCopyAction,
    onPasteAction,
    onDeleteAction,
    lookupEventHandler,
    itemRenderer,
    className,
  } = props;
  // Internal selection state for uncontrolled usage
  // Initialize with selectedValue if provided and no onSelectionChanged handler (uncontrolled mode)
  const [internalSelectedId, setInternalSelectedId] = useState<string | number | undefined>(() => {
    return !onSelectionChanged && selectedValue ? selectedValue : undefined;
  });

  // Internal data state for API methods that modify the tree structure
  const [internalData, setInternalData] = useState<any>(undefined);
  const [dataRevision, setDataRevision] = useState(0);

  // Use internal data if available, otherwise use props data
  const effectiveData = internalData ?? data;

  // Helper function to update internal data and force re-render
  const updateInternalData = useCallback((updater: (prevData: any) => any) => {
    setInternalData(updater);
    setDataRevision((prev) => prev + 1);
  }, []);

  // Build field configuration
  const fieldConfig = useMemo<TreeFieldConfig>(
    () => ({
      idField: idField || "id",
      labelField: nameField || "name",
      iconField,
      iconExpandedField,
      iconCollapsedField,
      parentField: parentIdField,
      childrenField,
      selectableField,
      dynamicField,
      loadedField,
      autoLoadAfterField,
    }),
    [
      idField,
      nameField,
      iconField,
      iconExpandedField,
      iconCollapsedField,
      parentIdField,
      childrenField,
      selectableField,
      dynamicField,
      loadedField,
      autoLoadAfterField,
    ],
  );

  // Steps 3a & 3b: Transform data based on format
  // Enhanced data transformation pipeline with validation and error handling
  const transformedData = useMemo(() => {
    // Return empty data if no data provided
    if (!effectiveData) {
      return emptyTreeData;
    }

    try {
      if (dataFormat === "flat") {
        // Validation: Flat format requires array
        if (!Array.isArray(effectiveData)) {
          throw new Error(
            `TreeComponent: dataFormat='flat' requires array data, received: ${typeof effectiveData}`,
          );
        }

        // Validation: Check for required fields in sample data
        if (effectiveData.length > 0) {
          const sampleItem = effectiveData[0];
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

        return flatToNative(effectiveData, fieldConfig);
      } else if (dataFormat === "hierarchy") {
        // Validation: Hierarchy format requires object or array
        if (!effectiveData || typeof effectiveData !== "object") {
          throw new Error(
            `TreeComponent: dataFormat='hierarchy' requires object or array data, received: ${typeof effectiveData}`,
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

        if (Array.isArray(effectiveData)) {
          if (effectiveData.length > 0) {
            checkHierarchyData(effectiveData[0]);
          }
        } else {
          checkHierarchyData(effectiveData);
        }

        return hierarchyToNative(effectiveData, fieldConfig);
      } else {
        throw new Error(
          `TreeComponent: Unsupported dataFormat '${dataFormat}'. Use 'flat' or 'hierarchy'.`,
        );
      }
    } catch (error) {
      // Return empty data on error to prevent crashes
      return emptyTreeData;
    }
  }, [effectiveData, dataFormat, fieldConfig]);

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
    // Helper function to check if a node is unloaded (should not be auto-expanded)
    const isUnloaded = (node: TreeNode): boolean => {
      return node.loaded === false;
    };

    if (defaultExpanded === "first-level") {
      return treeData.filter((node) => !isUnloaded(node)).map((node) => node.key);
    } else if (defaultExpanded === "all") {
      const allIds: (string | number)[] = [];
      const collectIds = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
          if (!isUnloaded(node)) {
            allIds.push(node.key);
          }
          if (node.children) {
            collectIds(node.children);
          }
        });
      };
      collectIds(treeData);
      return allIds;
    } else if (Array.isArray(defaultExpanded)) {
      // Expand full paths to specified nodes by including all parent nodes
      // But exclude unloaded nodes from the expansion
      const expandedPaths = expandParentPaths(defaultExpanded, treeItemsById);
      return expandedPaths.filter((nodeId) => {
        const node = treeItemsById[String(nodeId)];
        return !node || !isUnloaded(node);
      });
    }
    return [];
  });

  // Node loading states management for dynamic loading
  const [nodeStates, setNodeStates] = useState<Map<string | number, NodeLoadingState>>(new Map());

  // Expanded timestamps for tracking when nodes were expanded (Step 1: Auto-load feature)
  const [expandedTimestamps, setExpandedTimestamps] = useState<Map<string | number, number>>(
    new Map(),
  );

  // Auto-load after values for tracking per-node autoload thresholds (Step 2: Auto-load feature)
  const [autoLoadAfterMap, setAutoLoadAfterMap] = useState<
    Map<string | number, number | null>
  >(new Map());

  // Dynamic state for tracking per-node dynamic values
  const [dynamicStateMap, setDynamicStateMap] = useState<Map<string | number, boolean>>(
    new Map(),
  );

  // Collapsed timestamps for tracking when nodes were collapsed (Step 4: Auto-load feature)
  const [collapsedTimestamps, setCollapsedTimestamps] = useState<Map<string | number, number>>(
    new Map(),
  );

  // Helper functions for managing node loading states
  const getNodeState = useCallback(
    (nodeId: string | number): NodeLoadingState => {
      return nodeStates.get(nodeId) || "loaded";
    },
    [nodeStates],
  );

  const setNodeState = useCallback((nodeId: string | number, state: NodeLoadingState) => {
    setNodeStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(nodeId, state);
      return newStates;
    });
  }, []);

  // Simplified focus management
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VirtualizerHandle>(null);

  // State and ref for measuring first item size when fixedItemSize is enabled
  const firstItemRef = useRef<HTMLDivElement>(null);
  const [measuredItemSize, setMeasuredItemSize] = useState<number | undefined>(undefined);

  const flatTreeData = useMemo(() => {
    return toFlatTree(treeData, expandedIds, fieldConfig.dynamicField, nodeStates, dynamic);
  }, [expandedIds, treeData, nodeStates, fieldConfig.dynamicField, dynamic]);

  // Enhanced flat tree with timestamps and autoLoadAfter values
  const enhancedFlatTreeData: FlatTreeNodeWithState[] = useMemo(() => {
    return flatTreeData.map((node) => {
      const nodeId = node.key;
      const timestamp = expandedTimestamps.get(nodeId);
      const collapsedTime = collapsedTimestamps.get(nodeId);
      const explicitAutoLoadAfter = autoLoadAfterMap.get(nodeId);
      
      return {
        ...node,
        expandedTimestamp: timestamp,
        collapsedTimestamp: collapsedTime,
        autoLoadAfter: explicitAutoLoadAfter !== undefined ? explicitAutoLoadAfter : autoLoadAfter,
      };
    });
  }, [flatTreeData, expandedTimestamps, collapsedTimestamps, autoLoadAfterMap, autoLoadAfter]);

  // Measure first item size when fixedItemSize is enabled
  useEffect(() => {
    if (fixedItemSize && firstItemRef.current && !measuredItemSize && flatTreeData.length > 0) {
      // Add a small delay to ensure the item is rendered
      requestAnimationFrame(() => {
        if (firstItemRef.current) {
          const height = firstItemRef.current.offsetHeight;
          if (height > 0) {
            setMeasuredItemSize(height);
          }
        }
      });
    }
  }, [fixedItemSize, measuredItemSize, flatTreeData.length]);

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
    async (node: FlatTreeNode) => {
      if (!node.isExpanded) {
        // Expanding the node
        setExpandedIds((prev) => [...prev, node.key]);

        // Record timestamp when node expands
        setExpandedTimestamps((prev) => new Map(prev).set(node.key, Date.now()));

        // Always fire nodeDidExpand event
        if (onNodeExpanded) {
          onNodeExpanded({ ...node, isExpanded: true });
        }

        // Step 3: Check if this node is dynamic (loads children asynchronously)
        const isDynamic = (() => {
          // Check if there's an explicit value set via setDynamic
          const explicitValue = dynamicStateMap.get(node.key);
          if (explicitValue !== undefined) {
            return explicitValue;
          }

          // Check node data for dynamic field
          const dynamicFieldName = fieldConfig.dynamicField || "dynamic";
          if (dynamicFieldName in node) {
            return Boolean((node as any)[dynamicFieldName]);
          }

          // If node has loadedField=false, it needs async loading, so treat as dynamic
          if (loadedField && loadedField in node && !(node as any)[loadedField]) {
            return true;
          }

          // Fall back to component-level default
          return dynamic ?? false;
        })();

        // Check if we need to auto-reload (Step 4: Auto-load feature)
        // Only apply autoLoadAfter to dynamic nodes
        const currentLoadingState = nodeStates.get(node.key) || "unloaded";
        const collapsedTime = collapsedTimestamps.get(node.key);
        const explicitAutoLoadAfter = autoLoadAfterMap.get(node.key);
        
        // Step 4: Read per-node autoLoadAfter from data field
        const autoLoadAfterFieldName = fieldConfig.autoLoadAfterField || "autoLoadAfter";
        const nodeAutoLoadAfter = autoLoadAfterFieldName in node 
          ? (node as any)[autoLoadAfterFieldName] 
          : undefined;
        
        // Priority: setAutoLoadAfter > node data field > component prop
        const effectiveAutoLoadAfter = explicitAutoLoadAfter !== undefined 
          ? explicitAutoLoadAfter 
          : (nodeAutoLoadAfter !== undefined ? nodeAutoLoadAfter : autoLoadAfter);
        
        const shouldAutoReload = 
          isDynamic && // Only auto-reload dynamic nodes
          currentLoadingState === "loaded" && // Node was previously loaded
          loadChildren && // loadChildren handler exists
          collapsedTime !== undefined && // Node was previously collapsed
          effectiveAutoLoadAfter !== undefined && // Auto-load is configured
          effectiveAutoLoadAfter !== null && // Auto-load is not disabled
          (Date.now() - collapsedTime) > effectiveAutoLoadAfter; // Threshold exceeded

        // Check if we need to load children dynamically
        // Only load if node is marked as dynamic
        if (isDynamic && currentLoadingState === "unloaded" && loadChildren) {
          const nodeToLoad = Object.values(treeItemsById).find(
            (n) => String(n.key) === String(node.key),
          );

          const descendantIdsToClear = nodeToLoad
            ? collectDescendantIds(nodeToLoad, false)
            : new Set<string>();

          // Set loading state and clear descendant load states
          setNodeStates((prev) => {
            const newMap = new Map(prev);
            if (descendantIdsToClear.size > 0) {
              const keyLookup = new Map<string, string | number>();
              for (const key of newMap.keys()) {
                keyLookup.set(String(key), key);
              }
              descendantIdsToClear.forEach((id) => {
                const keyToDelete = keyLookup.get(id);
                if (keyToDelete !== undefined) {
                  newMap.delete(keyToDelete);
                }
              });
            }
            newMap.set(node.key, "loading");
            return newMap;
          });

          // Immediately remove existing children so node appears empty while loading
          updateInternalData((prevData) => {
            const currentData = prevData ?? data;

            if (dataFormat === "flat" && Array.isArray(currentData)) {
              // Remove existing children of this node
              return currentData.filter(
                (item) => String(item[fieldConfig.parentField || "parentId"]) !== String(node.key),
              );
            } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
              // For hierarchy format, clear children array
              const clearChildren = (nodes: any[]): any[] => {
                return nodes.map((n) => {
                  if (String(n[fieldConfig.idField || "id"]) === String(node.key)) {
                    return {
                      ...n,
                      [fieldConfig.childrenField || "children"]: [],
                    };
                  } else if (n[fieldConfig.childrenField || "children"]) {
                    return {
                      ...n,
                      [fieldConfig.childrenField || "children"]: clearChildren(
                        n[fieldConfig.childrenField || "children"],
                      ),
                    };
                  }
                  return n;
                });
              };
              return clearChildren(currentData);
            }

            return currentData;
          });

          try {
            // Load the children data
            const loadedData = await loadChildren({ ...node, isExpanded: true });

            // Update the tree data with loaded children (even if empty)
            updateInternalData((prevData) => {
              const currentData = prevData ?? data;

              if (dataFormat === "flat" && Array.isArray(currentData)) {
                // Remove existing children of this node
                const filteredData = currentData.filter(
                  (item) =>
                    String(item[fieldConfig.parentField || "parentId"]) !== String(node.key),
                );

                // Add new children if any
                const newItems =
                  loadedData && Array.isArray(loadedData)
                    ? loadedData.map((item) => ({
                        ...item,
                        [fieldConfig.parentField || "parentId"]: String(node.key),
                      }))
                    : [];

                // Mark parent node as loaded
                const updatedData = filteredData.map((item) => {
                  if (String(item[fieldConfig.idField || "id"]) === String(node.key)) {
                    return {
                      ...item,
                      [fieldConfig.loadedField || "loaded"]: true,
                    };
                  }
                  return item;
                });

                return [...updatedData, ...newItems];
              } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
                // For hierarchy format, we need to find the node and add children
                const updateHierarchy = (nodes: any[]): any[] => {
                  return nodes.map((n) => {
                    if (String(n[fieldConfig.idField || "id"]) === String(node.key)) {
                      return {
                        ...n,
                        [fieldConfig.childrenField || "children"]:
                          loadedData && Array.isArray(loadedData) ? loadedData : [],
                        [fieldConfig.loadedField || "loaded"]: true,
                      };
                    } else if (n[fieldConfig.childrenField || "children"]) {
                      return {
                        ...n,
                        [fieldConfig.childrenField || "children"]: updateHierarchy(
                          n[fieldConfig.childrenField || "children"],
                        ),
                      };
                    }
                    return n;
                  });
                };
                return updateHierarchy(currentData);
              }

              return currentData;
            });

            // Set loaded state
            setNodeStates((prev) => new Map(prev).set(node.key, "loaded"));
          } catch (error) {
            console.error("Error loading tree node data:", error);
            // Set back to unloaded state on error
            setNodeStates((prev) => {
              const newMap = new Map(prev);
              newMap.delete(node.key);
              return newMap;
            });
            // Collapse the node since loading failed
            setExpandedIds((prev) => prev.filter((id) => id !== node.key));
          }
        } else if (shouldAutoReload) {
          // Auto-reload: Node was loaded before, threshold exceeded, reload children
          // Set loading state
          setNodeStates((prev) => new Map(prev).set(node.key, "loading"));

          // Clear existing children
          updateInternalData((prevData) => {
            const currentData = prevData ?? data;

            if (dataFormat === "flat" && Array.isArray(currentData)) {
              return currentData.filter(
                (item) => String(item[fieldConfig.parentField || "parentId"]) !== String(node.key),
              );
            } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
              const clearChildren = (nodes: any[]): any[] => {
                return nodes.map((n) => {
                  if (String(n[fieldConfig.idField || "id"]) === String(node.key)) {
                    return {
                      ...n,
                      [fieldConfig.childrenField || "children"]: [],
                    };
                  } else if (n[fieldConfig.childrenField || "children"]) {
                    return {
                      ...n,
                      [fieldConfig.childrenField || "children"]: clearChildren(
                        n[fieldConfig.childrenField || "children"],
                      ),
                    };
                  }
                  return n;
                });
              };
              return clearChildren(currentData);
            }

            return currentData;
          });

          try {
            // Reload the children data
            const loadedData = await loadChildren({ ...node, isExpanded: true });

            // Update the tree data with reloaded children
            updateInternalData((prevData) => {
              const currentData = prevData ?? data;

              if (dataFormat === "flat" && Array.isArray(currentData)) {
                const filteredData = currentData.filter(
                  (item) =>
                    String(item[fieldConfig.parentField || "parentId"]) !== String(node.key),
                );

                const newItems =
                  loadedData && Array.isArray(loadedData)
                    ? loadedData.map((item) => ({
                        ...item,
                        [fieldConfig.parentField || "parentId"]: String(node.key),
                      }))
                    : [];

                const updatedData = filteredData.map((item) => {
                  if (String(item[fieldConfig.idField || "id"]) === String(node.key)) {
                    return {
                      ...item,
                      [fieldConfig.loadedField || "loaded"]: true,
                    };
                  }
                  return item;
                });

                return [...updatedData, ...newItems];
              } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
                const updateHierarchy = (nodes: any[]): any[] => {
                  return nodes.map((n) => {
                    if (String(n[fieldConfig.idField || "id"]) === String(node.key)) {
                      return {
                        ...n,
                        [fieldConfig.childrenField || "children"]:
                          loadedData && Array.isArray(loadedData) ? loadedData : [],
                        [fieldConfig.loadedField || "loaded"]: true,
                      };
                    } else if (n[fieldConfig.childrenField || "children"]) {
                      return {
                        ...n,
                        [fieldConfig.childrenField || "children"]: updateHierarchy(
                          n[fieldConfig.childrenField || "children"],
                        ),
                      };
                    }
                    return n;
                  });
                };
                return updateHierarchy(currentData);
              }

              return currentData;
            });

            // Set loaded state
            setNodeStates((prev) => new Map(prev).set(node.key, "loaded"));
          } catch (error) {
            console.error("Error auto-reloading tree node data:", error);
            // Keep loaded state even on reload error
            setNodeStates((prev) => new Map(prev).set(node.key, "loaded"));
          }
        }
      } else {
        // Collapsing the node
        const currentLoadingState = nodeStates.get(node.key) || "unloaded";
        
        // Record collapse timestamp for dynamic nodes (Step 4: Auto-load feature)
        if (currentLoadingState === "loaded" && loadChildren) {
          setCollapsedTimestamps((prev) => new Map(prev).set(node.key, Date.now()));
          
          // Check if autoLoadAfter is 0, mark node as unloaded immediately
          const explicitAutoLoadAfter = autoLoadAfterMap.get(node.key);
          const autoLoadAfterFieldName = fieldConfig.autoLoadAfterField || "autoLoadAfter";
          const nodeAutoLoadAfter = autoLoadAfterFieldName in node
            ? (node as any)[autoLoadAfterFieldName]
            : undefined;
          const effectiveAutoLoadAfter = explicitAutoLoadAfter !== undefined
            ? explicitAutoLoadAfter
            : (nodeAutoLoadAfter !== undefined ? nodeAutoLoadAfter : autoLoadAfter);
          
          // If autoLoadAfter is 0, immediately mark node as unloaded
          if (effectiveAutoLoadAfter === 0) {
            setNodeStates((prev) => new Map(prev).set(node.key, "unloaded"));
            
            // Update the loaded field in source data
            updateInternalData((prevData) => {
              const currentData = prevData ?? data;
              const loadedFieldName = fieldConfig.loadedField || "loaded";

              if (dataFormat === "flat" && Array.isArray(currentData)) {
                return currentData.map((item) => {
                  if (String(item[fieldConfig.idField || "id"]) === String(node.key)) {
                    return { ...item, [loadedFieldName]: false };
                  }
                  return item;
                });
              } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
                const updateHierarchy = (nodes: any[]): any[] => {
                  return nodes.map((n) => {
                    if (String(n[fieldConfig.idField || "id"]) === String(node.key)) {
                      return { ...n, [loadedFieldName]: false };
                    } else if (n[fieldConfig.childrenField || "children"]) {
                      return {
                        ...n,
                        [fieldConfig.childrenField || "children"]: updateHierarchy(
                          n[fieldConfig.childrenField || "children"],
                        ),
                      };
                    }
                    return n;
                  });
                };
                return updateHierarchy(currentData);
              }

              return currentData;
            });
          }
        }
        
        const nodeToCollapse = Object.values(treeItemsById).find(
          (n) => String(n.key) === String(node.key),
        );

        if (nodeToCollapse) {
          const idsToRemove = collectDescendantIds(nodeToCollapse, true);

          setExpandedIds((prev) => prev.filter((id) => !idsToRemove.has(String(id))));
        } else {
          setExpandedIds((prev) => prev.filter((id) => id !== node.key));
        }

        // Fire nodeDidCollapse event
        if (onNodeCollapsed) {
          onNodeCollapsed({ ...node, isExpanded: false });
        }
      }
    },
    [
      onNodeExpanded,
      onNodeCollapsed,
      loadChildren,
      data,
      dataFormat,
      fieldConfig,
      setNodeStates,
      nodeStates,
      treeItemsById,
      collapsedTimestamps,
      autoLoadAfterMap,
      autoLoadAfter,
      dynamicStateMap,
      dynamic,
    ],
  );

  // Simplified keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatTreeData.length === 0) return;

      const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
      const currentNode = currentIndex >= 0 ? flatTreeData[currentIndex] : null;
      let newIndex = currentIndex;
      let handled = false;

      // Check for keyboard actions (cut, copy, paste, delete)
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (currentNode && isCtrlOrCmd && e.key === "x" && onCutAction) {
        // Cut action (Ctrl/Cmd+X)
        e.preventDefault();
        e.stopPropagation();
        onCutAction(currentNode);
        return;
      }
      
      if (currentNode && isCtrlOrCmd && e.key === "c" && onCopyAction) {
        // Copy action (Ctrl/Cmd+C)
        e.preventDefault();
        e.stopPropagation();
        onCopyAction(currentNode);
        return;
      }
      
      if (currentNode && isCtrlOrCmd && e.key === "v" && onPasteAction) {
        // Paste action (Ctrl/Cmd+V)
        e.preventDefault();
        e.stopPropagation();
        onPasteAction(currentNode);
        return;
      }
      
      if (currentNode && e.key === "Delete" && onDeleteAction) {
        // Delete action
        e.preventDefault();
        e.stopPropagation();
        onDeleteAction(currentNode);
        return;
      }

      // Navigation keys
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
            if (currentNode!.hasChildren && !currentNode!.isExpanded) {
              // Expand node
              void toggleNode(currentNode!);
            } else if (
              currentNode!.hasChildren &&
              currentNode!.isExpanded &&
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
            if (currentNode!.hasChildren && currentNode!.isExpanded) {
              // Collapse node
              void toggleNode(currentNode!);
            } else if (currentNode!.depth > 0) {
              // Move to parent - find previous node with smaller depth
              for (let i = currentIndex - 1; i >= 0; i--) {
                if (flatTreeData[i].depth < currentNode!.depth) {
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
            // Handle selection
            if (currentNode!.selectable) {
              setSelectedNodeById(currentNode!.key);
              // Ensure focus stays on the current item after selection
              newIndex = currentIndex;
            }
            // Handle expansion for Enter key
            if (e.key === "Enter" && currentNode!.hasChildren) {
              void toggleNode(currentNode!);
            }
          }
          handled = true;
          break;
      }

      if (handled) {
        setFocusedIndex(newIndex);
      }
    },
    [focusedIndex, flatTreeData, toggleNode, setSelectedNodeById, onCutAction, onCopyAction, onPasteAction, onDeleteAction],
  );

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedId: effectiveSelectedId,
      itemRenderer,
      itemClickExpands,
      onItemClick,
      onSelection: (node: FlatTreeNode) => setSelectedNodeById(node.key),
      lookupEventHandler,
      focusedIndex,
      onKeyDown: handleKeyDown,
      treeContainerRef,
      iconCollapsed,
      iconExpanded,
      iconSize,
      animateExpand,
      expandRotation,
      spinnerDelay,
    };
  }, [
    flatTreeData,
    toggleNode,
    effectiveSelectedId,
    itemRenderer,
    itemClickExpands,
    onItemClick,
    setSelectedNodeById,
    lookupEventHandler,
    focusedIndex,
    handleKeyDown,
    iconCollapsed,
    iconExpanded,
    iconSize,
    animateExpand,
    expandRotation,
    spinnerDelay,
  ]);

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

      expandNode: async (nodeId: string | number) => {
        // nodeId is source ID, which matches TreeNode.key
        const wasExpanded = expandedIds.includes(nodeId);
        if (!wasExpanded) {
          setExpandedIds((prev) => [...prev, nodeId]);

          // Record timestamp when node expands (Step 1: Auto-load feature)
          setExpandedTimestamps((prev) => new Map(prev).set(nodeId, Date.now()));

          // Always fire nodeDidExpand event
          const node = getNodeById(nodeId);
          if (node && onNodeExpanded) {
            // Convert TreeNode to FlatTreeNode format for the event
            const flatNode: FlatTreeNode = {
              ...node,
              isExpanded: true,
              depth: node.parentIds.length,
              hasChildren: !!(node.children && node.children.length > 0),
            };
            onNodeExpanded(flatNode);
          }

          // Check if we need to load children dynamically
          if (node && loadChildren) {
            // Set loading state
            setNodeStates((prev) => new Map(prev).set(nodeId, "loading"));

            try {
              // Convert TreeNode to FlatTreeNode format for loadChildren
              const flatNode: FlatTreeNode = {
                ...node,
                isExpanded: true,
                depth: node.parentIds.length,
                hasChildren: !!(node.children && node.children.length > 0),
              };

              // Load the children data
              const loadedData = await loadChildren(flatNode);

              // Update the tree data with loaded children
              if (loadedData && Array.isArray(loadedData) && loadedData.length > 0) {
                updateInternalData((prevData) => {
                  const currentData = prevData ?? data;

                  if (dataFormat === "flat" && Array.isArray(currentData)) {
                    // Replace existing children with newly loaded data

                    // Remove existing children of this node
                    const filteredData = currentData.filter(
                      (item) =>
                        String(item[fieldConfig.parentField || "parentId"]) !== String(nodeId),
                    );

                    // Add new children
                    const newItems = loadedData.map((item) => ({
                      ...item,
                      [fieldConfig.parentField || "parentId"]: String(nodeId),
                    }));

                    return [...filteredData, ...newItems];
                  } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
                    // For hierarchy format, we need to find the node and add children
                    const updateHierarchy = (nodes: any[]): any[] => {
                      return nodes.map((n) => {
                        if (String(n[fieldConfig.idField || "id"]) === String(nodeId)) {
                          return {
                            ...n,
                            [fieldConfig.childrenField || "children"]: loadedData,
                          };
                        } else if (n[fieldConfig.childrenField || "children"]) {
                          return {
                            ...n,
                            [fieldConfig.childrenField || "children"]: updateHierarchy(
                              n[fieldConfig.childrenField || "children"],
                            ),
                          };
                        }
                        return n;
                      });
                    };
                    return updateHierarchy(currentData);
                  }

                  return currentData;
                });
              }

              // Set loaded state
              setNodeStates((prev) => new Map(prev).set(nodeId, "loaded"));
            } catch (error) {
              console.error("Error loading tree node data:", error);
              // Set back to unloaded state on error
              setNodeStates((prev) => {
                const newMap = new Map(prev);
                newMap.delete(nodeId);
                return newMap;
              });
              // Collapse the node since loading failed
              setExpandedIds((prev) => prev.filter((id) => id !== nodeId));
            }
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
          const idsToRemove = collectDescendantIds(nodeToCollapse, true);

          // Remove all descendant IDs from expanded list
          setExpandedIds((prev) => prev.filter((id) => !idsToRemove.has(String(id))));

          // Record collapse timestamp for dynamic nodes (Step 4: Auto-load feature)
          const currentLoadingState = nodeStates.get(nodeId) || "unloaded";
          if (currentLoadingState === "loaded" && loadChildren) {
            setCollapsedTimestamps((prev) => new Map(prev).set(nodeId, Date.now()));
            
            // Issue #2786 fix: Check if autoLoadAfter is 0, mark node as unloaded immediately
            const explicitAutoLoadAfter = autoLoadAfterMap.get(nodeId);
            const autoLoadAfterFieldName = fieldConfig.autoLoadAfterField || "autoLoadAfter";
            const nodeData = flatTreeData.find((n) => String(n.key) === String(nodeId));
            const nodeAutoLoadAfter = nodeData && autoLoadAfterFieldName in nodeData
              ? (nodeData as any)[autoLoadAfterFieldName]
              : undefined;
            const effectiveAutoLoadAfter = explicitAutoLoadAfter !== undefined
              ? explicitAutoLoadAfter
              : (nodeAutoLoadAfter !== undefined ? nodeAutoLoadAfter : autoLoadAfter);
            
            // If autoLoadAfter is 0, immediately mark node as unloaded
            if (effectiveAutoLoadAfter === 0) {
              setNodeStates((prev) => new Map(prev).set(nodeId, "unloaded"));
              
              // Update the loaded field in source data
              setInternalData((prevData) => {
                const currentData = prevData ?? data;
                const loadedFieldName = fieldConfig.loadedField || "loaded";

                if (dataFormat === "flat" && Array.isArray(currentData)) {
                  return currentData.map((item) => {
                    if (String(item[fieldConfig.idField || "id"]) === String(nodeId)) {
                      return { ...item, [loadedFieldName]: false };
                    }
                    return item;
                  });
                } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
                  const updateHierarchy = (nodes: any[]): any[] => {
                    return nodes.map((node) => {
                      if (String(node[fieldConfig.idField || "id"]) === String(nodeId)) {
                        return { ...node, [loadedFieldName]: false };
                      } else if (node[fieldConfig.childrenField || "children"]) {
                        return {
                          ...node,
                          [fieldConfig.childrenField || "children"]: updateHierarchy(
                            node[fieldConfig.childrenField || "children"],
                          ),
                        };
                      }
                      return node;
                    });
                  };
                  return updateHierarchy(currentData);
                }

                return currentData;
              });
            }
          }

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
          const updatedFlatTreeData = toFlatTree(
            treeData,
            newExpandedIds,
            fieldConfig.dynamicField,
            nodeStates,
            dynamic,
          );
          const nodeIndex = updatedFlatTreeData.findIndex(
            (item) => String(item.key) === String(nodeId),
          );

          if (nodeIndex >= 0 && listRef.current) {
            // Scroll to the item using virtua's scrollToIndex method
            listRef.current.scrollToIndex(nodeIndex, { align: "center" });
          }
        }, 0);
      },

      scrollToItem: (nodeId: string | number) => {
        // Simple scroll without expanding - just scroll to the item if it's visible
        const nodeIndex = findNodeIndexById(nodeId);

        if (nodeIndex >= 0 && listRef.current) {
          listRef.current.scrollToIndex(nodeIndex, { align: "center" });
        }
      },

      appendNode: (parentNodeId: string | number | undefined | null, nodeData: any) => {
        // Generate a new ID if not provided
        const nodeId = nodeData[fieldConfig.idField] || Date.now();

        // Create the new node with proper field mapping
        const newNode = {
          ...nodeData,
          [fieldConfig.idField]: nodeId,
        };

        // For flat data format, set the parent ID field
        if (dataFormat === "flat") {
          newNode[fieldConfig.parentField || "parentId"] = parentNodeId || null;
        }

        // Update the internal data state
        updateInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat") {
            // For flat format, just append to the array
            return Array.isArray(currentData) ? [...currentData, newNode] : [newNode];
          } else if (dataFormat === "hierarchy") {
            // For hierarchy format, we need to find the parent and add to its children
            const addToHierarchy = (nodes: any[]): any[] => {
              if (!parentNodeId) {
                // Add to root level
                return [...nodes, { ...newNode, [fieldConfig.childrenField || "children"]: [] }];
              }

              return nodes.map((node) => {
                if (node[fieldConfig.idField] === parentNodeId) {
                  const children = node[fieldConfig.childrenField || "children"] || [];
                  return {
                    ...node,
                    [fieldConfig.childrenField || "children"]: [
                      ...children,
                      { ...newNode, [fieldConfig.childrenField || "children"]: [] },
                    ],
                  };
                }

                // Recursively check children
                const childrenField = fieldConfig.childrenField || "children";
                if (node[childrenField] && Array.isArray(node[childrenField])) {
                  return {
                    ...node,
                    [childrenField]: addToHierarchy(node[childrenField]),
                  };
                }

                return node;
              });
            };

            if (Array.isArray(currentData)) {
              return addToHierarchy(currentData);
            } else {
              return currentData;
            }
          }

          return currentData;
        });
      },

      removeNode: (nodeId: string | number) => {
        // Helper function to recursively find and remove a node and its descendants
        const removeFromFlat = (data: any[]): any[] => {
          const nodeIdToRemove = String(nodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldParent = fieldConfig.parentField || "parentId";

          // First, collect all descendant IDs recursively
          const getDescendantIds = (parentId: string): string[] => {
            const descendants: string[] = [];
            for (const item of data) {
              if (String(item[fieldParent]) === parentId) {
                const itemId = String(item[fieldId]);
                descendants.push(itemId);
                descendants.push(...getDescendantIds(itemId));
              }
            }
            return descendants;
          };

          // Get all IDs to remove (node itself + all descendants)
          const idsToRemove = new Set([nodeIdToRemove, ...getDescendantIds(nodeIdToRemove)]);

          // Filter out all nodes with IDs in the removal set
          return data.filter((item) => !idsToRemove.has(String(item[fieldId])));
        };

        const removeFromHierarchy = (nodes: any[]): any[] => {
          const fieldId = fieldConfig.idField || "id";
          const fieldChildren = fieldConfig.childrenField || "children";

          return nodes.reduce((acc: any[], node: any) => {
            // If this is the node to remove, don't include it (and its descendants)
            if (String(node[fieldId]) === String(nodeId)) {
              return acc;
            }

            // Otherwise, include the node but recursively process its children
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              acc.push({
                ...node,
                [fieldChildren]: removeFromHierarchy(children),
              });
            } else {
              acc.push(node);
            }

            return acc;
          }, []);
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return removeFromFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return removeFromHierarchy(currentData);
          }

          return currentData;
        });
      },

      removeChildren: (nodeId: string | number) => {
        // Helper function to remove only the children of a node in flat format
        const removeChildrenFromFlat = (data: any[]): any[] => {
          const parentNodeId = String(nodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldParent = fieldConfig.parentField || "parentId";

          // First, collect all descendant IDs recursively (but not the parent node itself)
          const getDescendantIds = (parentId: string): string[] => {
            const descendants: string[] = [];
            for (const item of data) {
              if (String(item[fieldParent]) === parentId) {
                const itemId = String(item[fieldId]);
                descendants.push(itemId);
                descendants.push(...getDescendantIds(itemId));
              }
            }
            return descendants;
          };

          // Get all descendant IDs to remove (children and their descendants)
          const idsToRemove = new Set(getDescendantIds(parentNodeId));

          // Filter out all descendant nodes but keep the parent node
          return data.filter((item) => !idsToRemove.has(String(item[fieldId])));
        };

        const removeChildrenFromHierarchy = (nodes: any[]): any[] => {
          const fieldId = fieldConfig.idField || "id";
          const fieldChildren = fieldConfig.childrenField || "children";

          return nodes.map((node: any) => {
            // If this is the target node, remove all its children
            if (String(node[fieldId]) === String(nodeId)) {
              return {
                ...node,
                [fieldChildren]: [],
              };
            }

            // Otherwise, recursively process children
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              return {
                ...node,
                [fieldChildren]: removeChildrenFromHierarchy(children),
              };
            }

            return node;
          });
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return removeChildrenFromFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return removeChildrenFromHierarchy(currentData);
          }

          return currentData;
        });
      },

      insertNodeBefore: (beforeNodeId: string | number, nodeData: any) => {
        // Generate a new ID if not provided
        const nodeId = nodeData[fieldConfig.idField] || Date.now();

        // Create the new node with proper field mapping
        const newNode = {
          ...nodeData,
          [fieldConfig.idField]: nodeId,
        };

        // Helper function to insert before a node in flat format
        const insertBeforeInFlat = (data: any[]): any[] => {
          const beforeNodeIdStr = String(beforeNodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldParent = fieldConfig.parentField || "parentId";

          // Find the target node to get its parent
          const targetNode = data.find((item) => String(item[fieldId]) === beforeNodeIdStr);
          if (!targetNode) {
            // If target node not found, just append to root level
            return [...data, { ...newNode, [fieldParent]: null }];
          }

          // Set the same parent as the target node
          const parentId = targetNode[fieldParent];
          newNode[fieldParent] = parentId;

          // Find the index of the target node and insert before it
          const targetIndex = data.findIndex((item) => String(item[fieldId]) === beforeNodeIdStr);
          const result = [...data];
          result.splice(targetIndex, 0, newNode);
          return result;
        };

        const insertBeforeInHierarchy = (nodes: any[]): any[] => {
          const beforeNodeIdStr = String(beforeNodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldChildren = fieldConfig.childrenField || "children";

          // Check if the target node is at this level
          const targetIndex = nodes.findIndex((node) => String(node[fieldId]) === beforeNodeIdStr);
          if (targetIndex >= 0) {
            // Insert before the target node at this level
            const result = [...nodes];
            const nodeWithChildren = { ...newNode, [fieldChildren]: [] };
            result.splice(targetIndex, 0, nodeWithChildren);
            return result;
          }

          // Otherwise, recursively search in children
          return nodes.map((node: any) => {
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              const updatedChildren = insertBeforeInHierarchy(children);
              if (updatedChildren !== children) {
                return {
                  ...node,
                  [fieldChildren]: updatedChildren,
                };
              }
            }
            return node;
          });
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return insertBeforeInFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return insertBeforeInHierarchy(currentData);
          }

          return currentData;
        });
      },

      insertNodeAfter: (afterNodeId: string | number, nodeData: any) => {
        // Generate a new ID if not provided
        const nodeId = nodeData[fieldConfig.idField] || Date.now();

        // Create the new node with proper field mapping
        const newNode = {
          ...nodeData,
          [fieldConfig.idField]: nodeId,
        };

        // Helper function to insert after a node in flat format
        const insertAfterInFlat = (data: any[]): any[] => {
          const afterNodeIdStr = String(afterNodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldParent = fieldConfig.parentField || "parentId";

          // Find the target node to get its parent
          const targetNode = data.find((item) => String(item[fieldId]) === afterNodeIdStr);
          if (!targetNode) {
            // If target node not found, just append to root level
            return [...data, { ...newNode, [fieldParent]: null }];
          }

          // Set the same parent as the target node
          const parentId = targetNode[fieldParent];
          newNode[fieldParent] = parentId;

          // Find the index of the target node and insert after it
          const targetIndex = data.findIndex((item) => String(item[fieldId]) === afterNodeIdStr);
          const result = [...data];
          result.splice(targetIndex + 1, 0, newNode);
          return result;
        };

        const insertAfterInHierarchy = (nodes: any[]): any[] => {
          const afterNodeIdStr = String(afterNodeId);
          const fieldId = fieldConfig.idField || "id";
          const fieldChildren = fieldConfig.childrenField || "children";

          // Check if the target node is at this level
          const targetIndex = nodes.findIndex((node) => String(node[fieldId]) === afterNodeIdStr);
          if (targetIndex >= 0) {
            // Insert after the target node at this level
            const result = [...nodes];
            const nodeWithChildren = { ...newNode, [fieldChildren]: [] };
            result.splice(targetIndex + 1, 0, nodeWithChildren);
            return result;
          }

          // Otherwise, recursively search in children
          return nodes.map((node: any) => {
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              const updatedChildren = insertAfterInHierarchy(children);
              if (updatedChildren !== children) {
                return {
                  ...node,
                  [fieldChildren]: updatedChildren,
                };
              }
            }
            return node;
          });
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return insertAfterInFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return insertAfterInHierarchy(currentData);
          }

          return currentData;
        });
      },

      replaceNode: (nodeId: string | number, nodeData: any) => {
        const nodeIdStr = String(nodeId);
        const fieldId = fieldConfig.idField || "id";
        const fieldChildren = fieldConfig.childrenField || "children";
        const fieldParent = fieldConfig.parentField || "parentId";

        // Check if we're changing the node's ID
        const newId = nodeData[fieldId];
        const isIdChanging = newId !== undefined && String(newId) !== nodeIdStr;

        // Helper function to replace node properties in flat format
        const replaceNodeInFlat = (data: any[]): any[] => {
          return data.map((item) => {
            if (String(item[fieldId]) === nodeIdStr) {
              // Merge properties: nodeData overrides existing properties
              // Allow ID to be updated if provided in nodeData
              return {
                ...item,
                ...nodeData,
              };
            }
            // If ID is changing, update children's parent references
            if (isIdChanging && String(item[fieldParent]) === nodeIdStr) {
              return {
                ...item,
                [fieldParent]: newId,
              };
            }
            return item;
          });
        };

        // Helper function to replace node properties in hierarchy format
        const replaceNodeInHierarchy = (nodes: any[]): any[] => {
          return nodes.map((node: any) => {
            if (String(node[fieldId]) === nodeIdStr) {
              // Merge properties: nodeData overrides existing properties
              // Allow ID to be updated if provided in nodeData
              const updatedNode = {
                ...node,
                ...nodeData,
              };

              // If nodeData doesn't specify children, preserve existing children
              if (!(fieldChildren in nodeData) && node[fieldChildren]) {
                updatedNode[fieldChildren] = node[fieldChildren];
              }

              return updatedNode;
            }

            // Recursively process children
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              return {
                ...node,
                [fieldChildren]: replaceNodeInHierarchy(children),
              };
            }

            return node;
          });
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return replaceNodeInFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return replaceNodeInHierarchy(currentData);
          }

          return currentData;
        });

        // If the ID is changing, also update the expansion state
        if (isIdChanging) {
          setExpandedIds((prev) => {
            // Check if the old ID was expanded
            const wasExpanded = prev.some((id) => String(id) === nodeIdStr);
            if (wasExpanded) {
              // Replace old ID with new ID in the expansion list
              return prev.map((id) => (String(id) === nodeIdStr ? newId : id));
            }
            return prev;
          });
        }
      },

      replaceChildren: (nodeId: string | number, newChildren: any[]) => {
        const nodeIdStr = String(nodeId);
        const fieldId = fieldConfig.idField || "id";
        const fieldChildren = fieldConfig.childrenField || "children";
        const fieldParent = fieldConfig.parentField || "parentId";

        // Helper function to replace children in flat format
        const replaceChildrenInFlat = (data: any[]): any[] => {
          // First, collect all descendant IDs recursively
          const getDescendantIds = (parentId: string): string[] => {
            const descendants: string[] = [];
            for (const item of data) {
              if (String(item[fieldParent]) === parentId) {
                const itemId = String(item[fieldId]);
                descendants.push(itemId);
                descendants.push(...getDescendantIds(itemId));
              }
            }
            return descendants;
          };

          // Get all descendant IDs to remove
          const idsToRemove = new Set(getDescendantIds(nodeIdStr));

          // Filter out all descendant nodes
          const filteredData = data.filter((item) => !idsToRemove.has(String(item[fieldId])));

          // Add new children with proper parent reference
          const newChildNodes = newChildren.map((childData) => ({
            ...childData,
            [fieldParent]: nodeId,
          }));

          return [...filteredData, ...newChildNodes];
        };

        // Helper function to replace children in hierarchy format
        const replaceChildrenInHierarchy = (nodes: any[]): any[] => {
          return nodes.map((node: any) => {
            if (String(node[fieldId]) === nodeIdStr) {
              // Replace children array - preserve nested structure
              return {
                ...node,
                [fieldChildren]: newChildren,
              };
            }

            // Recursively process children
            const children = node[fieldChildren];
            if (children && Array.isArray(children)) {
              return {
                ...node,
                [fieldChildren]: replaceChildrenInHierarchy(children),
              };
            }

            return node;
          });
        };

        // Update the internal data state
        setInternalData((prevData) => {
          const currentData = prevData ?? data;

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            return replaceChildrenInFlat(currentData);
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            return replaceChildrenInHierarchy(currentData);
          }

          return currentData;
        });
      },

      // Node state management methods

      getNodeLoadingState: (nodeId: string | number) => {
        // First check nodeStates Map (active loading state)
        const activeState = nodeStates.get(nodeId);
        if (activeState) {
          return activeState;
        }
        
        // Fallback to checking loaded field from source data
        const node = getNodeById(nodeId);
        if (node && node.loaded === false) {
          return "unloaded";
        }
        
        // Default to loaded
        return "loaded";
      },

      markNodeLoaded: (nodeId: string | number) => {
        setNodeState(nodeId, "loaded");
        
        // Also update the loaded field in source data
        updateInternalData((prevData) => {
          const currentData = prevData ?? data;
          const loadedFieldName = fieldConfig.loadedField || "loaded";

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            // Update in flat format
            return currentData.map((item) => {
              if (String(item[fieldConfig.idField || "id"]) === String(nodeId)) {
                return { ...item, [loadedFieldName]: true };
              }
              return item;
            });
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            // Update in hierarchy format
            const updateHierarchy = (nodes: any[]): any[] => {
              return nodes.map((node) => {
                if (String(node[fieldConfig.idField || "id"]) === String(nodeId)) {
                  return { ...node, [loadedFieldName]: true };
                } else if (node[fieldConfig.childrenField || "children"]) {
                  return {
                    ...node,
                    [fieldConfig.childrenField || "children"]: updateHierarchy(
                      node[fieldConfig.childrenField || "children"],
                    ),
                  };
                }
                return node;
              });
            };
            return updateHierarchy(currentData);
          }

          return currentData;
        });
      },

      markNodeUnloaded: (nodeId: string | number) => {
        setNodeState(nodeId, "unloaded");
        treeApiMethods.collapseNode(nodeId);
        
        // Also update the loaded field in source data
        updateInternalData((prevData) => {
          const currentData = prevData ?? data;
          const loadedFieldName = fieldConfig.loadedField || "loaded";

          if (dataFormat === "flat" && Array.isArray(currentData)) {
            // Update in flat format
            return currentData.map((item) => {
              if (String(item[fieldConfig.idField || "id"]) === String(nodeId)) {
                return { ...item, [loadedFieldName]: false };
              }
              return item;
            });
          } else if (dataFormat === "hierarchy" && Array.isArray(currentData)) {
            // Update in hierarchy format
            const updateHierarchy = (nodes: any[]): any[] => {
              return nodes.map((node) => {
                if (String(node[fieldConfig.idField || "id"]) === String(nodeId)) {
                  return { ...node, [loadedFieldName]: false };
                } else if (node[fieldConfig.childrenField || "children"]) {
                  return {
                    ...node,
                    [fieldConfig.childrenField || "children"]: updateHierarchy(
                      node[fieldConfig.childrenField || "children"],
                    ),
                  };
                }
                return node;
              });
            };
            return updateHierarchy(currentData);
          }

          return currentData;
        });
      },

      getVisibleItems: () => {
        if (!listRef.current) {
          return [];
        }

        const virtualizer = listRef.current;
        const scrollOffset = virtualizer.scrollOffset;
        const viewportSize = virtualizer.viewportSize;
        
        // Calculate the visible range
        const startOffset = scrollOffset;
        const endOffset = scrollOffset + viewportSize;
        
        // Find items within the visible range
        const visibleItems: FlatTreeNode[] = [];
        
        for (let i = 0; i < flatTreeData.length; i++) {
          const itemOffset = virtualizer.getItemOffset(i);
          const itemSize = virtualizer.getItemSize(i);
          const itemEnd = itemOffset + itemSize;
          
          // Check if item is at least partially visible in the viewport
          if (itemEnd > startOffset && itemOffset < endOffset) {
            visibleItems.push(flatTreeData[i]);
          }
          
          // Stop if we've passed the visible range
          if (itemOffset >= endOffset) {
            break;
          }
        }
        
        return visibleItems;
      },

      getExpandedTimestamp: (nodeId: string | number): number | undefined => {
        return expandedTimestamps.get(nodeId);
      },

      setAutoLoadAfter: (
        nodeId: string | number,
        milliseconds: number | null | undefined,
      ): void => {
        if (milliseconds === null || milliseconds === undefined) {
          // Clear autoLoadAfter for this node
          setAutoLoadAfterMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(nodeId);
            return newMap;
          });
        } else {
          // Set autoLoadAfter for this node
          setAutoLoadAfterMap((prev) => new Map(prev).set(nodeId, milliseconds));
        }
      },

      getNodeAutoLoadAfter: (nodeId: string | number): number | null | undefined => {
        const explicitValue = autoLoadAfterMap.get(nodeId);
        if (explicitValue !== undefined) {
          return explicitValue;
        }
        // Fall back to component-level default
        return autoLoadAfter;
      },

      getDynamic: (nodeId: string | number): boolean => {
        // Check if there's an explicit value set via setDynamic
        const explicitValue = dynamicStateMap.get(nodeId);
        if (explicitValue !== undefined) {
          return explicitValue;
        }

        // Check node data for dynamic field
        const node = Object.values(treeItemsById).find(
          (n) => String(n.key) === String(nodeId),
        );
        if (node) {
          const dynamicFieldName = fieldConfig.dynamicField || "dynamic";
          // TreeNode has data fields directly copied from source data
          if (dynamicFieldName in node) {
            return Boolean((node as any)[dynamicFieldName]);
          }
        }

        // Fall back to component-level default
        return dynamic ?? false;
      },

      setDynamic: (nodeId: string | number, value: boolean | undefined): void => {
        if (value === undefined) {
          // Clear explicit dynamic value for this node
          setDynamicStateMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(nodeId);
            return newMap;
          });
        } else {
          // Set explicit dynamic value for this node
          setDynamicStateMap((prev) => new Map(prev).set(nodeId, value));
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
    fieldConfig,
    dataFormat,
    data,
    setInternalData,
    expandedTimestamps,
    autoLoadAfterMap,
    autoLoadAfter,
    dynamicStateMap,
    dynamic,
    dynamicField,
    nodeStates,
    setNodeStates,
    loadChildren,
    setCollapsedTimestamps,
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
    <Scroller
      ref={treeContainerRef}
      className={classnames(styles.wrapper, className)}
      role="tree"
      aria-label="Tree navigation"
      aria-multiselectable="false"
      tabIndex={0}
      onFocus={handleTreeFocus}
      onBlur={handleTreeBlur}
      onKeyDown={handleKeyDown}
      style={{ height: "100%", overflow: "auto" }}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
    >
      <Virtualizer ref={listRef} itemSize={measuredItemSize || itemHeight}>
        {flatTreeData.map((node, index) => {
          const isFirstItem = index === 0;
          const shouldMeasure = isFirstItem && fixedItemSize;

          return shouldMeasure ? (
            <div key={node.key} ref={firstItemRef}>
              <TreeRow index={index} data={itemData} />
            </div>
          ) : (
            <TreeRow key={node.key} index={index} data={itemData} />
          );
        })}
      </Virtualizer>
    </Scroller>
  );
});
