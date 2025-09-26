import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { TreeComponent } from "./TreeNative";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "in progress",
  description: `The \`${COMP}\` component is a virtualized tree component that displays hierarchical data with support for multiple data formats.`,
  props: {
    data: {
      description: `The data source of the tree. Format depends on the dataFormat property.`,
      required: true,
    },
    dataFormat: {
      description: `The input data structure format: "native" (current UnPackedTreeData), "flat" (array with parent relationships), or "hierarchy" (nested objects).`,
      default: "native",
    },
    idField: {
      description: `The property name in source data for unique identifiers.`,
      default: "id",
    },
    labelField: {
      description: `The property name in source data for display text.`,
      default: "name",
    },
    iconField: {
      description: `The property name in source data for icon identifiers.`,
      default: "icon",
    },
    iconExpandedField: {
      description: `The property name in source data for expanded state icons.`,
      default: "iconExpanded",
    },
    iconCollapsedField: {
      description: `The property name in source data for collapsed state icons.`,
      default: "iconCollapsed",
    },
    parentField: {
      description: `The property name in source data for parent relationships (used in flat format).`,
      default: "parentId",
    },
    childrenField: {
      description: `The property name in source data for child arrays (used in hierarchy format).`,
      default: "children",
    },
    selectedValue: {
      description: `The selected item ID in source data format.`,
    },
    selectedUid: {
      description: `[DEPRECATED] Use selectedValue instead. The ID of the selected tree row (internal format).`,
    },
    expandedValues: {
      description: `Array of expanded item IDs in source data format.`,
      default: [],
    },
    defaultExpanded: {
      description: `Initial expansion state: "none", "all", "first-level", or array of specific IDs.`,
      default: "none",
    },
    autoExpandToSelection: {
      description: `Automatically expand the path to the selected item.`,
      default: true,
    },
    expandOnItemClick: {
      description: `Enable expansion/collapse by clicking anywhere on the item (not just the chevron).`,
      default: false,
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
        itemRenderer={(item: any) => {
          return (
            <MemoizedItem
              node={node.props.itemTemplate as any}
              item={item}
              renderChild={renderChild}
            />
          );
        }}
      />
    );
  },
);
