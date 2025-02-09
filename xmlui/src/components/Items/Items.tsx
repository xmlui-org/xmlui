import { MemoizedItem } from "../container-helpers";
import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Items } from "./ItemsNative";
import { dComponent } from "../metadata-helpers";

const COMP = "Items";

export const ItemsMd = createMetadata({
  description:
    `The \`${COMP}\` component maps sequential data items into component instances, representing ` +
    `each data item as a particular component.`,
  props: {
    items: dComponent(`This property contains the list of data items this component renders.`),
    data: d(
      `This property contains the list of data items (obtained from a data source) this component renders.`,
    ),
    reverse: d(`This property reverses the order in which data is mapped to template components.`),
    itemTemplate: dComponent("The component template to display a single item"),
  },
  contextVars: {
    $item: dComponent(
      "This value represents the current iteration item while the component renders its children.",
    ),
    $itemIndex: dComponent("This integer value represents the current iteration index (zero-based) while rendering children."),
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
            node={node.children || (node.props.itemTemplate as any)}
            renderChild={renderChild}
            layoutContext={layoutContext}
          />
        );
      }}
    />
  );
});
