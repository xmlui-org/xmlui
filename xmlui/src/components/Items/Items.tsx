import { wrapComponent } from "../../components-core/wrapComponent";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent, dInternal } from "../metadata-helpers";
import { defaultProps } from "./Items.defaults";
import { Items } from "./ItemsReact";

const COMP = "Items";

export const ItemsMd = createMetadata({
  status: "stable",
  description:
    "`Items` renders data arrays without built-in layout or styling, providing " +
    "a lightweight alternative to `List`. Unlike `List`, it provides no " +
    "virtualization, grouping, or visual formatting — just pure data iteration.",
  props: {
    items: dInternal(`This property contains the list of data items this component renders.`),
    data: {
      description: `This property contains the list of data items (obtained from a data source) this component renders.`,
    },
    reverse: {
      description:
        "This property reverses the order in which data is mapped to template components.",
      valueType: "boolean",
      defaultValue: defaultProps.reverse,
    },
    itemTemplate: dComponent("The component template to display a single item"),
  },
  childrenAsTemplate: "itemTemplate",
  contextVars: {
    $item: dComponent("Current data item being rendered"),
    $itemIndex: dComponent("Zero-based index of current item"),
    $isFirst: dComponent("Boolean indicating if this is the first item"),
    $isLast: dComponent("Boolean indicating if this is the last item"),
  },
  events: {
    textSelectionDidChange: {
      description:
        "This event fires when the user selects text across the rendered items: after a mouse " +
        "drag ends, or per step of a keyboard selection. It doesn't fire again for an unchanged " +
        "selection, and fires once with `null` items when the selection leaves this component. " +
        "Defining it wraps each item in a `display: contents` element, so CSS aimed at the " +
        "parent's direct children (`> *`, `:first-child`) matches those wrappers.",
      signature:
        "textSelectionDidChange(selection: { text: string, startItem: any, endItem: any, " +
        "startIndex: number | null, endIndex: number | null }): void",
      parameters: {
        selection:
          "`startItem` and `endItem` are the items holding the two ends of the selection, in " +
          "document order whichever way it was made; `startIndex` and `endIndex` are their " +
          "`$itemIndex` values; `text` is the selected text. The items and indices are `null` " +
          "when the selection isn't wholly inside this component. A plain click reports a " +
          "collapsed selection: `text` is empty and `startIndex` equals `endIndex`.",
      },
    },
  },
  apis: {
    getTextSelection: {
      description:
        "This method returns the current text selection in the same shape the " +
        "`textSelectionDidChange` event passes. Giving the component an `id` makes it callable " +
        "and wraps each item as described for that event.",
      signature:
        "getTextSelection(): { text: string, startItem: any, endItem: any, " +
        "startIndex: number | null, endIndex: number | null }",
    },
  },
  opaque: true,
});

export const itemsComponentRenderer = wrapComponent(COMP, Items, ItemsMd, {
  customRender: (_props, context) => {
    const { node, renderChild, extractValue, layoutContext, lookupEventHandler, registerComponentApi } =
      context;
    // --- Selection tracking is opt-in: only with a handler, or an id that makes the method callable
    const trackSelection = !!node.events?.textSelectionDidChange || !!node.uid;
    return (
      <Items
        items={extractValue(node.props.items) || extractValue(node.props.data)}
        reverse={extractValue(node.props.reverse)}
        trackSelection={trackSelection}
        onTextSelectionDidChange={lookupEventHandler("textSelectionDidChange")}
        registerComponentApi={registerComponentApi}
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
