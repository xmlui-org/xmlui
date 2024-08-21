import { type ReactNode, useMemo } from "react";
import { MemoizedItem } from "../container-helpers";
import { isPlainObject } from "lodash-es";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

// =====================================================================================================================
// React Items component implementation

function Items({
  items,
  renderItem,
  reverse = false,
}: {
  reverse?: boolean;
  items: any[];
  renderItem: (contextVars: any, key: number) => ReactNode;
}) {
  const itemsToRender = useMemo(() => {
    if (!items) {
      return [];
    }
    let normalizedItems = items;
    if (isPlainObject(items)) {
      normalizedItems = Object.values(items);
    }
    return reverse ? [...normalizedItems].reverse() : normalizedItems;
  }, [items, reverse]);

  if (!itemsToRender) {
    return null;
  }
  return <>{itemsToRender.map((item, index) => renderItem({
      $item: item,
      $itemIndex: index,
      $isFirst: index === 0,
      $isLast: index === itemsToRender.length - 1
  }, index))}</>;
}

// =====================================================================================================================
// XMLUI Items component definition

/** 
 * The \`Items\` component maps sequential data items into component instances,
 * representing each data item as a particular component.
 * 
 * > **Note**: \`Items\` is not a container! It does not wrap its items into a container; it merely renders the its children.
 */
export interface ItemsComponentDef extends ComponentDef<"Items"> {
  props: {
    /** This property contains the list of data items this component renders. */
    items: any[];
    /** @internal */
    data: any[];
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
    "$item": any;
  }
}

const metadata: ComponentDescriptor<ItemsComponentDef> = {
  displayName: "Items",
  description: "A component displaying a list of items",
  props: {
    itemTemplate: {
      description: "The component template to display a single item",
      valueType: "ComponentDef",
    },
  },
  opaque: true,
};

export const itemsComponentRenderer = createComponentRenderer<ItemsComponentDef>(
  "Items",
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
              node={node.children || node.props.itemTemplate}
              renderChild={renderChild}
              layoutContext={layoutContext}
            />
          );
        }}
      />
    );
  },
  metadata
);
