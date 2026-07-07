import { memo, useMemo } from "react";

import type { RenderChildFn } from "../abstractions/RendererDefs";

type MemoizedItemProps = {
  node: any | Array<any>;
  renderChild: RenderChildFn;
  layoutContext?: any;
  contextVars?: Record<string, any>;
  vars?: Record<string, any>;
  functions?: Record<string, any>;
};

export const MemoizedItem = memo(function MemoizedItem({
  node,
  renderChild,
  layoutContext,
  contextVars = {},
  vars,
  functions,
}: MemoizedItemProps) {
  const nodeWithContextVars = useMemo(
    () => ({
      type: "Container",
      contextVars,
      ...(vars ? { vars } : undefined),
      ...(functions ? { functions } : undefined),
      children: Array.isArray(node) ? node : [node],
    }),
    [contextVars, functions, node, vars],
  );

  return <>{renderChild(nodeWithContextVars as any, layoutContext)}</>;
});
