import { wrapComponent } from "../../components-core/wrapComponent";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, dComponent, dInternal } from "../metadata-helpers";
import { Items, defaultProps } from "./ItemsReact";

const COMP = "Items";

export const ItemsMd = createMetadata({
  status: "stable",
  description:
    "`Items` renders data arrays without built-in layout or styling, providing " +
    "a lightweight alternative to `List`. Unlike `List`, it provides no " +
    "virtualization, grouping, or visual formatting — just pure data iteration.",
  props: {
    items: dInternal(`This property contains the list of data items this component renders.`),
    data: d(
      `This property contains the list of data items (obtained from a data source) this component renders.`,
    ),
    reverse: {
      description:
        "This property reverses the order in which data is mapped to template components.",
      type: "boolean",
      defaultValue: defaultProps.reverse,
    },
    itemTemplate: dComponent("The component template to display a single item"),
  },
  childrenAsTemplate: "itemTemplate",
  contextVars: {
    $item: dComponent("Current data item being rendered"),
    $itemIndex: dComponent(
      "Zero-based index of current item",
    ),
    $isFirst: dComponent("Boolean indicating if this is the first item"),
    $isLast: dComponent("Boolean indicating if this is the last item"),
  },
  opaque: true,
});

export const itemsComponentRenderer = wrapComponent(COMP, Items, ItemsMd, {
  customRender: (_props, context) => {
    const { node, renderChild, extractValue, layoutContext } = context;
    return (
      <Items
        items={extractValue(node.props.items) || extractValue(node.props.data)}
        reverse={extractValue(node.props.reverse)}
        renderItem={(contextVars, key) => (
          <MemoizedItem
            key={key}
            contextVars={contextVars}
            node={node.props.itemTemplate}
            renderChild={renderChild}
            layoutContext={layoutContext}
          />
        )}
      />
    );
  },
});
