import type { ComponentDef } from "../..";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dContextMenu } from "../metadata-helpers";
import { TreeComponent, defaultProps } from "./TreeNative";
import styles from "./TreeComponent.module.scss";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "stable",
  description: `The \`${COMP}\` component is a virtualized tree component that displays hierarchical data with support for flat and hierarchy data formats.`,
  props: {
    data: {
      description: `The data source of the tree. Format depends on the dataFormat property.`,
      isRequired: true,
    },
    dataFormat: {
      description: `The input data structure format: "flat" (array with parent relationships) or "hierarchy" (nested objects).`,
      valueType: "string",
      defaultValue: defaultProps.dataFormat,
    },
    idField: {
      description: `The property name in source data for unique identifiers.`,
      valueType: "string",
      defaultValue: defaultProps.idField,
    },
    nameField: {
      description: `The property name in source data for display text.`,
      valueType: "string",
      defaultValue: defaultProps.nameField,
    },
    iconField: {
      description: `The property name in source data for icon identifiers.`,
      valueType: "string",
      defaultValue: defaultProps.iconField,
    },
    iconExpandedField: {
      description: `The property name in source data for expanded state icons.`,
      valueType: "string",
      defaultValue: defaultProps.iconExpandedField,
    },
    iconCollapsedField: {
      description: `The property name in source data for collapsed state icons.`,
      valueType: "string",
      defaultValue: defaultProps.iconCollapsedField,
    },
    parentIdField: {
      description: `The property name in source data for parent relationships (used in flat format).`,
      valueType: "string",
      defaultValue: defaultProps.parentIdField,
    },
    childrenField: {
      description: `The property name in source data for child arrays (used in hierarchy format).`,
      valueType: "string",
      defaultValue: defaultProps.childrenField,
    },
    selectableField: {
      description: `The property name in source data for selectable state (default: "selectable").`,
      valueType: "string",
      defaultValue: defaultProps.selectableField,
    },
    selectedValue: {
      description: `The selected item ID in source data format.`,
    },
    defaultExpanded: {
      description: `Initial expansion state: "none", "all", "first-level", or array of specific IDs.`,
      valueType: "string",
      defaultValue: defaultProps.defaultExpanded,
    },
    autoExpandToSelection: {
      description: `Automatically expand the path to the selected item.`,
      valueType: "boolean",
      defaultValue: defaultProps.autoExpandToSelection,
    },
    itemClickExpands: {
      description: "Whether clicking anywhere on a tree item should expand/collapse the node, not just the expand/collapse icon.",
      valueType: "boolean",
      defaultValue: defaultProps.itemClickExpands,
    },
    iconCollapsed: {
      description: `The icon name to use for collapsed nodes (default: "chevronright").`,
      valueType: "string",
      defaultValue: defaultProps.iconCollapsed,
    },
    iconExpanded: {
      description: `The icon name to use for expanded nodes (default: "chevrondown").`,
      valueType: "string",
      defaultValue: defaultProps.iconExpanded,
    },
    iconSize: {
      description: `The size of the expand/collapse icons (default: "16").`,
      valueType: "string",
      defaultValue: defaultProps.iconSize,
    },
    itemHeight: {
      description: `The height of each tree row in pixels (default: 32).`,
      valueType: "number",
      defaultValue: defaultProps.itemHeight,
    },
    fixedItemSize: {
      description:
        `When set to \`true\`, the tree will measure the height of the first item and use that ` +
        `as a fixed size hint for all items. This improves scroll performance when all items have ` +
        `the same height. If items have varying heights, leave this as \`false\`.`,
      type: "boolean",
      defaultValue: false,
    },
    animateExpand: {
      description: `When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).`,
      valueType: "boolean",
      defaultValue: defaultProps.animateExpand,
    },
    expandRotation: {
      description: `The number of degrees to rotate the collapsed icon when expanded in animate mode (default: 90).`,
      valueType: "number",
      defaultValue: defaultProps.expandRotation,
    },
    dynamicField: {
      description: `The property name in source data for dynamic loading state (default: "dynamic").`,
      valueType: "string",
      defaultValue: defaultProps.dynamicField,
    },
    itemTemplate: {
      description: "The template for each item in the tree.",
      valueType: "ComponentDef",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
    selectionDidChange: {
      description: `Fired when the tree selection changes.`,
      signature: "selectionDidChange(event: { selectedNode: FlatTreeNode | null, previousNode: FlatTreeNode | null }): void",
      parameters: {
        event: "An object containing selectedNode (the newly selected node) and previousNode (the previously selected node).",
      },
    },
    nodeDidExpand: {
      description: `Fired when a tree node is expanded.`,
      signature: "nodeDidExpand(node: FlatTreeNode): void",
      parameters: {
        node: "The tree node that was expanded.",
      },
    },
    nodeDidCollapse: {
      description: `Fired when a tree node is collapsed.`,
      signature: "nodeDidCollapse(node: FlatTreeNode): void",
      parameters: {
        node: "The tree node that was collapsed.",
      },
    },
    loadChildren: {
      description: `Fired when a tree node needs to load children dynamically. Should return an array of child data.`,
      signature: "loadChildren(node: FlatTreeNode): any[]",
      parameters: {
        node: "The tree node that needs to load its children.",
      },
    },
  },
  apis: {
    expandAll: {
      description: `Expand all nodes in the tree.`,
      signature: "expandAll(): void",
    },
    collapseAll: {
      description: `Collapse all nodes in the tree.`,
      signature: "collapseAll(): void",
    },
    expandToLevel: {
      description: `Expand nodes up to the specified depth level (0-based).`,
      signature: "expandToLevel(level: number): void",
      parameters: {
        level: "The maximum depth level to expand (0 = root level only)",
      },
    },
    expandNode: {
      description: `Expand a specific node by its source data ID.`,
      signature: "expandNode(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to expand (source data format)",
      },
    },
    collapseNode: {
      description: `Collapse a specific node by its source data ID.`,
      signature: "collapseNode(nodeId: string | number): void", 
      parameters: {
        nodeId: "The ID of the node to collapse (source data format)",
      },
    },
    selectNode: {
      description: `Programmatically select a node by its source data ID.`,
      signature: "selectNode(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to select (source data format)",
      },
    },
    clearSelection: {
      description: `Clear the current selection.`,
      signature: "clearSelection(): void",
    },
    getNodeById: {
      description: `Get a tree node by its source data ID.`,
      signature: "getNodeById(nodeId: string | number): TreeNode | null",
      parameters: {
        nodeId: "The ID of the node to retrieve (source data format)",
      },
    },
    getExpandedNodes: {
      description: `Get an array of currently expanded node IDs in source data format.`,
      signature: "getExpandedNodes(): (string | number)[]",
    },
    getSelectedNode: {
      description: `Get the currently selected tree node.`,
      signature: "getSelectedNode(): TreeNode | null",
    },
    scrollIntoView: {
      description: `Scroll to a specific node and expand parent nodes as needed to make it visible.`,
      signature: "scrollIntoView(nodeId: string | number, options?: ScrollIntoViewOptions): void",
      parameters: {
        nodeId: "The ID of the node to scroll to (source data format)",
        options: "Optional scroll options",
      },
    },
    scrollToItem: {
      description: `Scroll to a specific node if it's currently visible in the tree.`,
      signature: "scrollToItem(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to scroll to (source data format)",
      },
    },
    appendNode: {
      description: `Add a new node to the tree as a child of the specified parent node.`,
      signature: "appendNode(parentNodeId: string | number | null, nodeData: any): void",
      parameters: {
        parentNodeId: "The ID of the parent node, or null/undefined to add to root level",
        nodeData: "The node data object using the format specified in dataFormat and field properties",
      },
    },
    removeNode: {
      description: `Remove a node and all its descendants from the tree.`,
      signature: "removeNode(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to remove (along with all its descendants)",
      },
    },
    removeChildren: {
      description: `Remove all children (descendants) of a node while keeping the node itself.`,
      signature: "removeChildren(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the parent node whose children should be removed",
      },
    },
    insertNodeBefore: {
      description: `Insert a new node before an existing node at the same level.`,
      signature: "insertNodeBefore(beforeNodeId: string | number, nodeData: any): void",
      parameters: {
        beforeNodeId: "The ID of the existing node before which the new node should be inserted",
        nodeData: "The node data object using the format specified in dataFormat and field properties",
      },
    },
    insertNodeAfter: {
      description: `Insert a new node after an existing node at the same level.`,
      signature: "insertNodeAfter(afterNodeId: string | number, nodeData: any): void",
      parameters: {
        afterNodeId: "The ID of the existing node after which the new node should be inserted",
        nodeData: "The node data object using the format specified in dataFormat and field properties",
      },
    },
    getNodeLoadingState: {
      description: `Get the loading state of a dynamic node.`,
      signature: "getNodeLoadingState(nodeId: string | number): NodeLoadingState",
      parameters: {
        nodeId: "The ID of the node to check loading state for",
      },
    },
    markNodeLoaded: {
      description: `Mark a dynamic node as loaded.`,
      signature: "markNodeLoaded(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to mark as loaded",
      },
    },
    markNodeUnloaded: {
      description: `Mark a dynamic node as unloaded and collapse it.`,
      signature: "markNodeUnloaded(nodeId: string | number): void",
      parameters: {
        nodeId: "The ID of the node to mark as unloaded",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}-row--selected`]: "$color-primary-50",
    [`backgroundColor-${COMP}-row--hover`]: "$color-surface-100",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-${COMP}--selected`]: "$color-primary-900",
    [`textColor-${COMP}--hover`]: "$textColor-primary",
    [`borderColor-${COMP}-row--focus`]: "$color-primary-500",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
  },
});

/**
 * This function defines the renderer for the Tree component.
 */
export const treeComponentRenderer = createComponentRenderer(
  COMP,
  TreeMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {

    // Default item template if none is provided:
    //   <HStack verticalAlignment="center">
    //     <Icon when="{$item.icon}" name="{$item.icon}" />
    //     <Text value="{$item.name}" />
    //   </HStack>
    const defaultItemTemplate: ComponentDef = {
      type: "HStack",
      props: {
        verticalAlignment: "center",
        gap: "$space-4"
      },
      children: [
        {
          type: "Icon",
          when: "{$item.icon}",
          props: {
            name: "{$item.icon}",
          },
        },
        {
          type: "Text",
          props: {
            value: "{$item.name}",
          },
        },
      ],
    };
    return (
      <TreeComponent
        registerComponentApi={registerComponentApi}
        className={className}
        data={extractValue(node.props.data)}
        dataFormat={extractValue(node.props.dataFormat)}
        idField={extractValue(node.props.idField)}
        nameField={extractValue(node.props.nameField)}
        iconField={extractValue(node.props.iconField)}
        iconExpandedField={extractValue(node.props.iconExpandedField)}
        iconCollapsedField={extractValue(node.props.iconCollapsedField)}
        parentIdField={extractValue(node.props.parentIdField)}
        childrenField={extractValue(node.props.childrenField)}
        selectableField={extractValue(node.props.selectableField)}
        dynamicField={extractValue(node.props.dynamicField)}
        selectedValue={extractValue(node.props.selectedValue)}
        selectedId={extractValue(node.props.selectedId)}
        defaultExpanded={extractValue(node.props.defaultExpanded)}
        autoExpandToSelection={extractValue(node.props.autoExpandToSelection)}
        itemClickExpands={extractValue. asOptionalBoolean(node.props.itemClickExpands)}
        iconCollapsed={extractValue(node.props.iconCollapsed)}
        iconExpanded={extractValue(node.props.iconExpanded)}
        iconSize={extractValue(node.props.iconSize)}
        itemHeight={extractValue.asOptionalNumber(node.props.itemHeight, defaultProps.itemHeight)}
        fixedItemSize={extractValue.asOptionalBoolean(node.props.fixedItemSize)}
        animateExpand={extractValue.asOptionalBoolean(node.props.animateExpand, defaultProps.animateExpand)}
        expandRotation={extractValue.asOptionalNumber(node.props.expandRotation, defaultProps.expandRotation)}
        onSelectionChanged={lookupEventHandler("selectionDidChange")}
        onNodeExpanded={lookupEventHandler("nodeDidExpand")}
        onNodeCollapsed={lookupEventHandler("nodeDidCollapse")}
        loadChildren={lookupEventHandler("loadChildren")}
        onContextMenu={lookupEventHandler("contextMenu")}
        itemRenderer={(flatTreeNode: any) => {
          const itemContext = {
            id: flatTreeNode.id,                     // $item.id - Internal unique identifier
            name: flatTreeNode.displayName,          // $item.name - Primary display text
            depth: flatTreeNode.depth,               // $item.depth - Nesting level (0-based)
            isExpanded: flatTreeNode.isExpanded,     // $item.isExpanded - Expansion state
            hasChildren: flatTreeNode.hasChildren,   // $item.hasChildren - Children indicator
            // - icon, iconExpanded, iconCollapsed (from icon fields)
            // - uid, path, parentIds, selectable, children (TreeNode internals)
            // - All original source data properties (custom fields)
            ...flatTreeNode,
          };

          return node.props.itemTemplate ? (
            <MemoizedItem node={node.props.itemTemplate} contextVars={{ $item: itemContext }} renderChild={renderChild} />
          ) : (
            <MemoizedItem node={defaultItemTemplate} contextVars={{ $item: itemContext }} renderChild={renderChild} />
          );
        }}
      />
    );
  },
);
