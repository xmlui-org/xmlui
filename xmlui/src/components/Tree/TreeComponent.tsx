import { ComponentDef } from "../..";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { TreeComponent, defaultProps } from "./TreeNative";
import styles from "./TreeComponent.module.scss";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "stable",
  description: `The \`${COMP}\` component is a virtualized tree component that displays hierarchical data with support for flat and hierarchy data formats.`,
  props: {
    data: {
      description: `The data source of the tree. Format depends on the dataFormat property.`,
      required: true,
    },
    dataFormat: {
      description: `The input data structure format: "flat" (array with parent relationships) or "hierarchy" (nested objects).`,
      default: defaultProps.dataFormat,
    },
    idField: {
      description: `The property name in source data for unique identifiers.`,
      default: defaultProps.idField,
    },
    nameField: {
      description: `The property name in source data for display text.`,
      default: defaultProps.nameField,
    },
    iconField: {
      description: `The property name in source data for icon identifiers.`,
      default: defaultProps.iconField,
    },
    iconExpandedField: {
      description: `The property name in source data for expanded state icons.`,
      default: defaultProps.iconExpandedField,
    },
    iconCollapsedField: {
      description: `The property name in source data for collapsed state icons.`,
      default: defaultProps.iconCollapsedField,
    },
    parentIdField: {
      description: `The property name in source data for parent relationships (used in flat format).`,
      default: defaultProps.parentIdField,
    },
    childrenField: {
      description: `The property name in source data for child arrays (used in hierarchy format).`,
      default: defaultProps.childrenField,
    },
    selectableField: {
      description: `The property name in source data for selectable state (default: "selectable").`,
      default: defaultProps.selectableField,
    },
    selectedValue: {
      description: `The selected item ID in source data format.`,
    },
    defaultExpanded: {
      description: `Initial expansion state: "none", "all", "first-level", or array of specific IDs.`,
      default: defaultProps.defaultExpanded,
    },
    autoExpandToSelection: {
      description: `Automatically expand the path to the selected item.`,
      default: defaultProps.autoExpandToSelection,
    },
    expandOnItemClick: {
      description: `Enable expansion/collapse by clicking anywhere on the item (not just the chevron).`,
      default: defaultProps.expandOnItemClick,
    },
    iconCollapsed: {
      description: `The icon name to use for collapsed nodes (default: "chevronright").`,
      default: defaultProps.iconCollapsed,
    },
    iconExpanded: {
      description: `The icon name to use for expanded nodes (default: "chevrondown").`,
      default: defaultProps.iconExpanded,
    },
    iconSize: {
      description: `The size of the expand/collapse icons (default: "16").`,
      default: defaultProps.iconSize,
    },
    itemHeight: {
      description: `The height of each tree row in pixels (default: 35).`,
      default: defaultProps.itemHeight,
    },
    animateExpand: {
      description: `When true, uses only the collapsed icon and rotates it for expansion instead of switching icons (default: false).`,
      default: defaultProps.animateExpand,
    },
    expandRotation: {
      description: `The number of degrees to rotate the collapsed icon when expanded in animate mode (default: 90).`,
      default: defaultProps.expandRotation,
    },
    itemTemplate: dComponent("The template for each item in the tree."),
  },
  events: {
    selectionDidChange: {
      description: `Fired when the tree selection changes.`,
      signature: `(event: TreeSelectionEvent) => void`,
    },
    nodeDidExpand: {
      description: `Fired when a tree node is expanded.`,
      signature: `(node: FlatTreeNode) => void`,
    },
    nodeDidCollapse: {
      description: `Fired when a tree node is collapsed.`,
      signature: `(node: FlatTreeNode) => void`,
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
      signature: "expandNode(nodeId: string): void",
      parameters: {
        nodeId: "The ID of the node to expand (source data format)",
      },
    },
    collapseNode: {
      description: `Collapse a specific node by its source data ID.`,
      signature: "collapseNode(nodeId: string): void", 
      parameters: {
        nodeId: "The ID of the node to collapse (source data format)",
      },
    },
    selectNode: {
      description: `Programmatically select a node by its source data ID.`,
      signature: "selectNode(nodeId: string): void",
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
      signature: "getNodeById(nodeId: string): TreeNode | null",
      parameters: {
        nodeId: "The ID of the node to retrieve (source data format)",
      },
    },
    getExpandedNodes: {
      description: `Get an array of currently expanded node IDs in source data format.`,
      signature: "getExpandedNodes(): string[]",
    },
    getSelectedNode: {
      description: `Get the currently selected tree node.`,
      signature: "getSelectedNode(): TreeNode | null",
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
        selectedValue={extractValue(node.props.selectedValue)}
        selectedId={extractValue(node.props.selectedId)}
        defaultExpanded={extractValue(node.props.defaultExpanded)}
        autoExpandToSelection={extractValue(node.props.autoExpandToSelection)}
        expandOnItemClick={extractValue(node.props.expandOnItemClick)}
        iconCollapsed={extractValue(node.props.iconCollapsed)}
        iconExpanded={extractValue(node.props.iconExpanded)}
        iconSize={extractValue(node.props.iconSize)}
        itemHeight={extractValue.asOptionalNumber(node.props.itemHeight, defaultProps.itemHeight)}
        animateExpand={extractValue.asOptionalBoolean(node.props.animateExpand, defaultProps.animateExpand)}
        expandRotation={extractValue.asOptionalNumber(node.props.expandRotation, defaultProps.expandRotation)}
        onSelectionChanged={lookupEventHandler("selectionDidChange")}
        onNodeExpanded={lookupEventHandler("nodeDidExpand")}
        onNodeCollapsed={lookupEventHandler("nodeDidCollapse")}
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
            <MemoizedItem node={node.props.itemTemplate} item={itemContext} renderChild={renderChild} />
          ) : (
            <MemoizedItem node={defaultItemTemplate} item={itemContext} renderChild={renderChild} />
          );
        }}
      />
    );
  },
);
