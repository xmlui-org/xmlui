import { memo, useMemo } from "react";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../abstractions/RendererDefs";
import type { ContainerWrapperDef } from "../components-core/rendering/ContainerWrapper";
import { EMPTY_OBJECT } from "../components-core/constants";
import { useShallowCompareMemoize } from "../components-core/utils/hooks";

type MemoizedItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  item?: any;
  context?: any;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  contextVars?: Record<string, any>;
  itemKey?: string;
  contextKey?: string;
};

export const MemoizedItem = memo(
  ({
    node,
    item,
    context,
    renderChild,
    layoutContext,
    contextVars = EMPTY_OBJECT,
    itemKey = "$item",
    contextKey = "$context",
  }: MemoizedItemProps) => {
    const shallowMemoedContextVars = useShallowCompareMemoize(contextVars);
    const nodeWithItem = useMemo(() => {
      if (itemKey === contextKey) {
        return {
          type: "Container",
          contextVars: {
            [itemKey]: { ...item, ...context },
            ...shallowMemoedContextVars,
          },
          children: Array.isArray(node) ? node : [node],
        } as ContainerWrapperDef;
      }
      return {
        type: "Container",
        contextVars: {
          [itemKey]: item,
          [contextKey]: context,
          ...shallowMemoedContextVars,
        },
        children: Array.isArray(node) ? node : [node],
      } as ContainerWrapperDef;
    }, [context, item, node, shallowMemoedContextVars, itemKey, contextKey]);

    return <>{renderChild(nodeWithItem, layoutContext)}</>;
  },
);
MemoizedItem.displayName = "MemoizedItem";
