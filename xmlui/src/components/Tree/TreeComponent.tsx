import { ComponentDef } from "../..";
import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { TreeComponent, defaultProps } from "./TreeNative";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "in progress",
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
    labelField: {
      description: `The property name in source data for display text.`,
      default: defaultProps.labelField,
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
    parentField: {
      description: `The property name in source data for parent relationships (used in flat format).`,
      default: defaultProps.parentField,
    },
    childrenField: {
      description: `The property name in source data for child arrays (used in hierarchy format).`,
      default: defaultProps.childrenField,
    },
    selectedValue: {
      description: `The selected item ID in source data format.`,
    },
    selectedUid: {
      description: `[DEPRECATED] Use selectedValue instead. The ID of the selected tree row (internal format).`,
    },
    expandedValues: {
      description: `Array of expanded item IDs in source data format.`,
      default: defaultProps.expandedValues,
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
    itemTemplate: dComponent("The template for each item in the tree."),
  },
  events: {
    selectionChanged: {
      description: `Fired when the tree selection changes.`,
      signature: `(event: TreeSelectionEvent) => void`,
    },
  },
});

/**
 * This function defines the renderer for the Tree component.
 */
export const treeComponentRenderer = createComponentRenderer(
  COMP,
  TreeMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {

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
        className={className}
        data={extractValue(node.props.data)}
        dataFormat={extractValue(node.props.dataFormat)}
        idField={extractValue(node.props.idField)}
        labelField={extractValue(node.props.labelField)}
        iconField={extractValue(node.props.iconField)}
        iconExpandedField={extractValue(node.props.iconExpandedField)}
        iconCollapsedField={extractValue(node.props.iconCollapsedField)}
        parentField={extractValue(node.props.parentField)}
        childrenField={extractValue(node.props.childrenField)}
        selectedValue={extractValue(node.props.selectedValue)}
        selectedUid={extractValue(node.props.selectedUid)}
        expandedValues={extractValue(node.props.expandedValues)}
        defaultExpanded={extractValue(node.props.defaultExpanded)}
        autoExpandToSelection={extractValue(node.props.autoExpandToSelection)}
        expandOnItemClick={extractValue(node.props.expandOnItemClick)}
        onSelectionChanged={lookupEventHandler("selectionChanged")}
        itemRenderer={(flatTreeNode: any) => {
          // ========================================
          // $item Context Properties for Templates
          // ========================================
          // These properties are available in item templates via $item.propertyName
          const itemContext = {
            // Core identification properties
            id: flatTreeNode.uid,                    // $item.id - Internal unique identifier
            key: flatTreeNode.key,                   // $item.key - Source data ID
            
            // Display properties
            name: flatTreeNode.displayName,          // $item.name - Primary display text
            displayName: flatTreeNode.displayName,   // $item.displayName - Alternative access
            
            // State properties  
            depth: flatTreeNode.depth,               // $item.depth - Nesting level (0-based)
            isExpanded: flatTreeNode.isExpanded,     // $item.isExpanded - Expansion state
            hasChildren: flatTreeNode.hasChildren,   // $item.hasChildren - Children indicator
            
            // All other TreeNode properties including:
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
