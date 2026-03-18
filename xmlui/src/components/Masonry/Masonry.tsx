import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { MasonryNative, defaultProps } from "./MasonryNative";

const COMP = "Masonry";

export const MasonryMd = createMetadata({
  status: "experimental",
  description:
    `\`${COMP}\` renders a virtualized masonry (Pinterest-style) grid layout. ` +
    `It distributes items across columns using a shortest-column-first algorithm, ` +
    `measuring actual item heights for accurate placement. Only visible items are ` +
    `rendered, making it suitable for large datasets. ` +
    `Wrap the template in direct children or set \`itemTemplate\` explicitly; ` +
    `\`$item\` and \`$itemIndex\` are available inside the template.`,
  props: {
    items: {
      description: "The array of data items to render in the grid.",
      isRequired: true,
    },
    columnCount: {
      description: "Number of columns. Items are distributed using a shortest-column-first algorithm.",
      valueType: "number",
      defaultValue: defaultProps.columnCount,
    },
    height: {
      description:
        "Height of the scrollable masonry container. Ignored when `useWindowScroll` is true.",
      valueType: "string",
      defaultValue: defaultProps.height,
    },
    useWindowScroll: {
      description:
        "When true, the page window acts as the scroll container instead of the component's " +
        "own fixed-height viewport. Use this when the masonry fills an entire page.",
      valueType: "boolean",
    },
    initialItemCount: {
      description:
        "Number of items to render on the first paint. Increase this for SSR or to avoid " +
        "a flash of empty content on slow connections.",
      valueType: "number",
    },
    itemTemplate: dComponent(
      "The template rendered for each item. Use `$item` for the data item and `$itemIndex` for its zero-based index.",
    ),
  },
  childrenAsTemplate: "itemTemplate",
  contextVars: {
    $item: dComponent("Current data item being rendered"),
    $itemIndex: dComponent("Zero-based index of the current item in the `items` array"),
  },
  opaque: true,
});

export const masonryComponentRenderer = createComponentRenderer(
  COMP,
  MasonryMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    const itemTemplate = node.props.itemTemplate;

    return (
      <MasonryNative
        id={extractValue.asOptionalString(node.props.id)}
        items={(extractValue(node.props.items) as unknown[]) ?? []}
        columnCount={extractValue.asOptionalNumber(node.props.columnCount)}
        height={extractValue.asOptionalString(node.props.height)}
        useWindowScroll={extractValue.asOptionalBoolean(node.props.useWindowScroll)}
        initialItemCount={extractValue.asOptionalNumber(node.props.initialItemCount)}
        itemRenderer={
          itemTemplate
            ? ({ index, data }) => (
                <MemoizedItem
                  key={index}
                  node={itemTemplate}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                  contextVars={{ $item: data, $itemIndex: index }}
                />
              )
            : undefined
        }
      />
    );
  },
);
