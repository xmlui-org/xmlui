import type { ComponentDef } from "@abstractions/ComponentDefs";
import { memo, useMemo } from "react";
import type { ContainerComponentDef } from "@components-core/container/ContainerComponentDef";
import { EMPTY_OBJECT } from "@components-core/constants";
import type { LayoutContext, RenderChildFn } from "@abstractions/RendererDefs";
import { useShallowCompareMemoize } from "@components-core/utils/hooks";

type SlotItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  slotProps?: any;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
};

export const SlotItem = memo(
  ({ node, renderChild, layoutContext, slotProps = EMPTY_OBJECT }: SlotItemProps) => {
    const shallowMemoedSlotProps = useShallowCompareMemoize(slotProps);
    const nodeWithItem = useMemo(() => {
      const templateProps = {};
      Object.entries(shallowMemoedSlotProps).forEach(([key, value]) => {
        templateProps["$" + key] = value;
      });
      return {
        type: "Container",
        contextVars: templateProps,
        children: Array.isArray(node) ? node : [node],
      } as ContainerComponentDef;
    }, [node, shallowMemoedSlotProps]);

    return <>{renderChild(nodeWithItem, layoutContext)}</>;
  },
);
