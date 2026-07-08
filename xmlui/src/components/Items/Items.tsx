import type { ReactNode } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, dComponent, dInternal } from "../metadata-helpers";
import { defaultProps } from "./Items.defaults";
import { Items } from "./ItemsReact";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, nonPropertyChildren, templateChildren, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import { createRuntimeScope } from "../../runtime/state";

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

export const itemsRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ItemsMd as ComponentMetadata,
  renderer: ({ adapter }) => <ItemsRuntime adapter={adapter} />,
});

function ItemsRuntime({ adapter }: { adapter: XmluiComponentAdapter }) {
  const componentData = useComponentPropertyValue(adapter, "data");
  const items = adapter.prop("items") || adapter.prop("data") || componentData.value;
  const itemTemplate =
    templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
  const layoutContext = adapter.props.layoutContext as Parameters<
    typeof adapter.context.renderChildren
  >[3];
  return (
    <>
      {componentData.rendered}
      <Items
        items={items as any[]}
        reverse={adapter.booleanProp("reverse", defaultProps.reverse)}
        renderItem={(contextVars) => {
          const itemScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: contextVars,
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
          });
          return (
            <>
              {adapter.context.renderChildren(
                itemTemplate,
                itemScope,
                adapter.node.range.end,
                layoutContext,
              )}
            </>
          );
        }}
      />
    </>
  );
}

function useComponentPropertyValue(
  adapter: XmluiComponentAdapter,
  propertyName: string,
): { rendered: ReactNode; value: unknown } {
  const propertyChildren = templateChildren(adapter.node, propertyName);
  const propertyElement = singleElement(propertyChildren);
  const propertyReferenceId = propertyElement
    ? componentPropertyReferenceId(adapter.node, propertyName, propertyElement)
    : undefined;
  useBindingRevision(undefined, adapter.scope);

  if (!propertyElement || !propertyReferenceId) {
    return { rendered: null, value: undefined };
  }

  const node = withGeneratedId(propertyElement, propertyReferenceId);
  const reference = adapter.scope.references[propertyReferenceId] as { value?: unknown } | undefined;
  return {
    rendered: adapter.context.renderChildren([node], adapter.scope, adapter.node.range.end),
    value: reference?.value,
  };
}

function singleElement(children: XmluiNode[] | undefined): XmluiElement | undefined {
  const elements = children?.filter((child): child is XmluiElement => child.kind === "element") ?? [];
  return elements.length === 1 ? elements[0] : undefined;
}

function withGeneratedId(node: XmluiElement, id: string): XmluiElement {
  if (typeof node.props.id === "string" && node.props.id.length > 0) {
    return node;
  }
  return {
    ...node,
    props: {
      ...node.props,
      id,
    },
  };
}

function componentPropertyReferenceId(
  owner: XmluiElement,
  propertyName: string,
  node: XmluiElement,
): string {
  return typeof node.props.id === "string" && node.props.id.length > 0
    ? node.props.id
    : `__xmlui_${owner.irId}_${propertyName}`.replace(/[^a-zA-Z0-9_$-]/g, "_");
}
