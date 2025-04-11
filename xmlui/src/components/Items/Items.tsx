import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { dComponent, dInternal } from "../metadata-helpers";
import { Items } from "./ItemsNative";

const COMP = "Items";

export const ItemsMd = createMetadata({
  description:
    `The \`${COMP}\` component maps sequential data items into component instances, representing ` +
    `each data item as a particular component.`,
  props: {
    items: dInternal(`This property contains the list of data items this component renders.`),
    data: d(
      `This property contains the list of data items (obtained from a data source) this component renders.`,
    ),
    reverse: {
      description:
        "This property reverses the order in which data is mapped to template components.",
    },
    itemTemplate: dComponent("The component template to display a single item"),
  },
  childrenAsTemplate: "itemTemplate",
  contextVars: {
    $item: dComponent(
      "This value represents the current iteration item while the component renders its children.",
    ),
    $itemIndex: dComponent(
      "This integer value represents the current iteration index (zero-based) while rendering children.",
    ),
    $isFirst: dComponent("This boolean value indicates if the component renders its first item."),
    $isLast: dComponent("This boolean value indicates if the component renders its last item."),
  },
  opaque: true,
});

export const itemsComponentRenderer = createComponentRenderer(COMP, ItemsMd, (rendererContext) => {
  const { node, renderChild, extractValue, layoutContext } = rendererContext;
  return (
    <Items
      items={extractValue(node.props.items) || extractValue(node.props.data)}
      reverse={extractValue(node.props.reverse)}
      renderItem={(contextVars, key) => {
        return (
          <MemoizedItem
            key={key}
            contextVars={contextVars}
            node={node.props.itemTemplate}
            renderChild={renderChild}
            layoutContext={layoutContext}
          />
        );
      }}
    />
  );
});
