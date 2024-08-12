import type { ComponentDef } from "@abstractions/ComponentDefs";
import { memo, useMemo } from "react";
import { ContainerComponentDef } from "@components-core/container/ContainerComponentDef";
import { EMPTY_OBJECT } from "@components-core/constants";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { useShallowCompareMemoize } from "@components-core/utils/hooks";
import type { LayoutContext } from "@abstractions/RendererDefs";

type MemoizedItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  item?: any;
  context?: any;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  itemName?: string;
  contextVars?: Record<string, any>;
};

export const MemoizedItem = memo(
  ({ node, item, context, renderChild, layoutContext, contextVars = EMPTY_OBJECT }: MemoizedItemProps) => {
    const shallowMemoedContextVars = useShallowCompareMemoize(contextVars);
    const nodeWithItem = useMemo(() => {
      return {
        type: "Container",
        contextVars: {
          $item: item,
          $context: context,
          ...shallowMemoedContextVars,
        },
        children: Array.isArray(node) ? node : [node],
      } as ContainerComponentDef;
    }, [context, item, node, shallowMemoedContextVars]);

    return <>{renderChild(nodeWithItem, layoutContext)}</>;
  }
);
