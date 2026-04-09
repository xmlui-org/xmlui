import { memo, useCallback, useId, useMemo, useRef } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { createChildLayoutContext } from "../../abstractions/layout-context-utils";
import { MemoizedItem } from "../../components/container-helpers";
import { useTableContext } from "./TableContext";
import type { OurColumnMetadata } from "./TableContext";
import { useIsomorphicLayoutEffect, useShallowCompareMemoize } from "../../components-core/utils/hooks";

type Props = OurColumnMetadata & {
  nodeChildren?: ComponentDef[];
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
};

export const defaultProps: Pick<Props, "canSort" | "canResize"> = {
  canSort: true,
  canResize: true,
};

export const Column = memo(function Column({ nodeChildren, renderChild, layoutContext, ...columnMetadata }: Props) {
  const id = useId();
  const { registerColumn, unRegisterColumn } = useTableContext();
  const stableColumnMetadata = useShallowCompareMemoize(columnMetadata);

  const cellLayoutContext = useMemo(
    () => createChildLayoutContext(layoutContext, { type: "TableCell" }),
    [layoutContext],
  );

  // Use a ref so that cellRenderer stays stable and doesn't re-register columns on
  // every render. createChildLayoutContext always creates new object references, so
  // including cellLayoutContext in useCallback deps would cause an infinite loop
  const cellLayoutContextRef = useRef(cellLayoutContext);
  cellLayoutContextRef.current = cellLayoutContext;

  const renderChildRef = useRef(renderChild);
  renderChildRef.current = renderChild;

  const nodeChildrenRef = useRef(nodeChildren);
  nodeChildrenRef.current = nodeChildren;

  const cellRenderer = useCallback(
    (row: any, rowIndex: number, colIndex: number, value: any) => {
      const childrenToRender = nodeChildrenRef.current;
      if (!childrenToRender) return null;
      return (
        <MemoizedItem
          node={childrenToRender}
          contextVars={{
            $item: row,
            $rowIndex: rowIndex,
            $colIndex: colIndex,
            $row: row,
            $itemIndex: rowIndex,
            $cell: value,
          }}
          renderChild={renderChildRef.current}
          layoutContext={cellLayoutContextRef.current}
        />
      );
    },
    [],
  );

  const hasChildren = !!nodeChildren;
  const safeCellRenderer = useMemo(() => {
    return hasChildren ? cellRenderer : undefined;
  }, [cellRenderer, hasChildren]);

  useIsomorphicLayoutEffect(() => {
    registerColumn(
      {
        ...stableColumnMetadata,
        cellRenderer: safeCellRenderer,
      },
      id,
    );
  }, [stableColumnMetadata, id, registerColumn, safeCellRenderer]);

  useIsomorphicLayoutEffect(() => {
    return () => {
      unRegisterColumn(id);
    };
  }, [id, unRegisterColumn]);
  return null;
});
