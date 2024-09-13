import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { Items } from "./ItemsNative";
import { dComponent } from "@components/metadata-helpers";

const COMP = "Items";

export interface ItemsComponentDef extends ComponentDef<"Items"> {
  props: {
    /** @internal */
    itemTemplate: ComponentDef;
    /**
     * This property reverses the order in which data is mapped to template components.
     * @descriptionRef
     */
    reverse?: boolean;
  };
  contextVars: {
    /** This property represents the value of an item in the data list. */
    $item: any;
  };
}

export const ItemsMd = createMetadata({
  description:
    `The \`${COMP}\` component maps sequential data items into component instances, representing ` +
    `each data item as a particular component.`,
  props: {
    items: dComponent(`This property contains the list of data items this component renders.`),
    data: d(`This property contains the list of data items (obtained from a data source) this component renders.`),
    reverse: d(`This property reverses the order in which data is mapped to template components.`),
    itemTemplate: dComponent("The component template to display a single item"),
  },
  opaque: true,
});

export const itemsComponentRenderer = createComponentRendererNew(
  COMP,
  ItemsMd,
  (rendererContext) => {
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
              node={node.children || node.props.itemTemplate as any}
              renderChild={renderChild}
              layoutContext={layoutContext}
            />
          );
        }}
      />
    );
  },
);
