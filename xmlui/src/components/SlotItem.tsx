import { memo, useMemo } from "react";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import type { ContainerWrapperDef } from "../components-core/rendering/ContainerWrapper";
import { useShallowCompareMemoize } from "../components-core/utils/hooks";
import { EMPTY_OBJECT } from "../components-core/constants";
import type { LayoutContext, RenderChildFn } from "../abstractions/RendererDefs";

type SlotItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  slotProps?: any;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
};

/**
 * This React component wraps the slot content defined in a parent component into a container.
 * This container may contain context values pushed from a compound component back to
 * the parent.
 */
export const SlotItem = memo(
  ({ node, renderChild, layoutContext, slotProps = EMPTY_OBJECT }: SlotItemProps) => {
    const shallowMemoedSlotProps = useShallowCompareMemoize(slotProps);

    // --- Transform all Slot properties into context values so that they can be 
    // --- used in the slot content (in the parent component)
    const nodeWithItem = useMemo(() => {
      const templateProps = {};
      Object.entries(shallowMemoedSlotProps).forEach(([key, value]) => {
        templateProps["$" + key] = value;
      });

      // --- Create a container for the slot content with the cotext values
      return {
        type: "Container",
        contextVars: templateProps,
        children: Array.isArray(node) ? node : [node],
      } as ContainerWrapperDef;
    }, [node, shallowMemoedSlotProps]);

    // --- Render the slot content
    return <>{renderChild(nodeWithItem, layoutContext)}</>;
  },
);
SlotItem.displayName = "SlotItem";
