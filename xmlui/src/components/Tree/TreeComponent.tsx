import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { TreeComponent } from "./TreeNative";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "in progress",
  description: `The \`${COMP}\` component is a virtualized tree component that displays hierarchical data.`,
  props: {
    data: {
      description: `The data source of the tree.`,
      required: true,
    },
    selectedUid: {
      description: `The ID (optional) of the selected tree row.`,
    },
    itemTemplate: dComponent("The template for each item in the tree."),
  },
});

/**
 * This function defines the renderer for the Tree component.
 */
export const treeComponentRenderer = createComponentRenderer(
  COMP,
  TreeMd,
  ({ node, extractValue, renderChild, className }) => {
    return (
      <TreeComponent
        className={className}
        data={extractValue(node.props.data)}
        selectedUid={extractValue(node.props.selectedUid)}
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
