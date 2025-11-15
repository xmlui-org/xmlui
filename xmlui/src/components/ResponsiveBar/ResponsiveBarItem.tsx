import { memo, useMemo } from "react";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import type { ContainerWrapperDef } from "../../components-core/rendering/ContainerWrapper";

/**
 * ResponsiveBarItem - Helper component for rendering ResponsiveBar children with context variables
 * 
 * This component wraps each child of ResponsiveBar in a Container node that provides the $overflow
 * context variable. It follows the same pattern as MemoizedItem used by the Items component.
 */

type ResponsiveBarItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  isOverflow: boolean;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
};

export const ResponsiveBarItem = memo(
  ({ node, isOverflow, renderChild, layoutContext }: ResponsiveBarItemProps) => {
    // Create a Container node that wraps the child with $overflow context variable
    const nodeWithContext = useMemo(() => {
      return {
        type: "Container",
        contextVars: {
          $overflow: isOverflow,
        },
        children: Array.isArray(node) ? node : [node],
      } as ContainerWrapperDef;
    }, [node, isOverflow]);

    return <>{renderChild(nodeWithContext, layoutContext)}</>;
  },
);

ResponsiveBarItem.displayName = "ResponsiveBarItem";
