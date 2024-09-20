import { MemoizedItem } from "@components/container-helpers";
import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { TreeComponent } from "./TreeNative";
import { dComponent } from "@components/metadata-helpers";

const COMP = "Tree";

export const TreeMd = createMetadata({
  status: "in review",
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
  ({ node, extractValue, renderChild }) => {
    return (
      <TreeComponent
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
