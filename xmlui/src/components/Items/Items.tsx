import { createMetadata, dComponent, dInternal } from "../../component-core/metadata/helpers";
import { wrapComponent, nonPropertyChildren, templateChildren } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { defaultProps } from "./Items.defaults";
import { ItemsNative } from "./ItemsReact";

const COMP = "Items";

export const ItemsMd = createMetadata({
  status: "stable",
  description:
    "`Items` renders data arrays without built-in layout or styling, providing " +
    "a lightweight alternative to `List`. Unlike `List`, it provides no " +
    "virtualization, grouping, or visual formatting - just pure data iteration.",
  props: {
    items: dInternal("This property contains the list of data items this component renders."),
    data: {
      description: "This property contains the list of data items (obtained from a data source) this component renders.",
    },
    reverse: {
      description: "This property reverses the order in which data is mapped to template components.",
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
  opaque: true,
});

export const itemsRenderer = wrapComponent({
  name: COMP,
  metadata: ItemsMd,
  renderer: ({ adapter }) => {
    const items = adapter.prop("items") ?? adapter.prop("data");
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    return (
      <ItemsNative
        items={items}
        reverse={adapter.booleanProp("reverse", defaultProps.reverse)}
        renderItem={(contextVars, key) => {
          const itemScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: contextVars,
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
          });
          return <>{adapter.context.renderChildren(itemTemplate, itemScope)}</>;
        }}
      />
    );
  },
});
