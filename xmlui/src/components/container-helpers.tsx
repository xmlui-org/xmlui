import { memo, useMemo } from "react";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../abstractions/RendererDefs";
import type { ContainerWrapperDef } from "../components-core/rendering/ContainerWrapper";
import { EMPTY_OBJECT } from "../components-core/constants";
import { useShallowCompareMemoize } from "../components-core/utils/hooks";
import { rest } from "lodash-es";

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
      // Build contextVars object, only including item/context if they're defined
      const mergedContextVars: Record<string, any> = { ...shallowMemoedContextVars };
      
      if (itemKey === contextKey) {
        // Merge item and context into a single key
        const merged = { ...item, ...context };
        // Only add if there's actual content
        if (item !== undefined || context !== undefined) {
          mergedContextVars[itemKey] = merged;
        }
      } else {
        // Add item and context as separate keys, but only if defined
        if (item !== undefined) {
          mergedContextVars[itemKey] = item;
        }
        if (context !== undefined) {
          mergedContextVars[contextKey] = context;
        }
      }
      
      return {
        type: "Container",
        contextVars: mergedContextVars,
        children: Array.isArray(node) ? node : [node],
      } as ContainerWrapperDef;
    }, [context, item, node, shallowMemoedContextVars, itemKey, contextKey]);

    return <>{renderChild(nodeWithItem, layoutContext)}</>;
  },
);
MemoizedItem.displayName = "MemoizedItem";
