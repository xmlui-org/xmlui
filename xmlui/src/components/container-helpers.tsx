import { memo, useMemo } from "react";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../abstractions/RendererDefs";
import type { ContainerWrapperDef } from "../components-core/rendering/ContainerWrapper";
import { EMPTY_OBJECT } from "../components-core/constants";
import { useShallowCompareMemoize } from "../components-core/utils/hooks";

type MemoizedItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  contextVars?: Record<string, any>;
};

export const MemoizedItem = memo(
  ({
    node,
    renderChild,
    layoutContext,
    contextVars = EMPTY_OBJECT,
  }: MemoizedItemProps) => {
    const shallowMemoedContextVars = useShallowCompareMemoize(contextVars);
    const nodeWithContextVars = useMemo(
      () =>
        ({
          type: "Container",
          contextVars: shallowMemoedContextVars,
          children: Array.isArray(node) ? node : [node],
        }) as ContainerWrapperDef,
      [node, shallowMemoedContextVars],
    );

    return <>{renderChild(nodeWithContextVars, layoutContext)}</>;
  },
);
MemoizedItem.displayName = "MemoizedItem";
