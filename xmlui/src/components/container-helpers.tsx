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
  /** Optional variable definitions to include on the Container wrapper so they can
   *  be resolved in the new context (e.g. with $param available). */
  vars?: Record<string, any>;
  /** Optional function definitions to include on the Container wrapper. */
  functions?: Record<string, any>;
};

export const MemoizedItem = memo(
  ({
    node,
    renderChild,
    layoutContext,
    contextVars = EMPTY_OBJECT,
    vars,
    functions,
  }: MemoizedItemProps) => {
    const shallowMemoedContextVars = useShallowCompareMemoize(contextVars);
    console.log('[MemoizedItem] contextVars=', JSON.stringify(contextVars));
    const nodeWithContextVars = useMemo(
      () =>
        ({
          type: "Container",
          contextVars: shallowMemoedContextVars,
          ...(vars ? { vars } : undefined),
          ...(functions ? { functions } : undefined),
          children: Array.isArray(node) ? node : [node],
        }) as ContainerWrapperDef,
      [node, shallowMemoedContextVars, vars, functions],
    );

    return <>{renderChild(nodeWithContextVars, layoutContext)}</>;
  },
);
MemoizedItem.displayName = "MemoizedItem";
