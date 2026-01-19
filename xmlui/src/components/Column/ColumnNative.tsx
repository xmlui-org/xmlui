import { useCallback, useId, useLayoutEffect, useMemo } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { MemoizedItem } from "../../components/container-helpers";
import { useTableContext } from "./TableContext";
import type { OurColumnMetadata } from "./TableContext";

type Props = OurColumnMetadata & {
  nodeChildren?: ComponentDef[];
  renderChild: RenderChildFn;
};

export const defaultProps: Pick<Props, "canSort" | "canResize"> = {
  canSort: true,
  canResize: true,
};

export function Column({ nodeChildren, renderChild, ...columnMetadata }: Props) {
  const id = useId();
  const { registerColumn, unRegisterColumn } = useTableContext();

  const cellRenderer = useCallback(
    (row: any, rowIndex: number, colIndex: number, value: any) => {
      return (
        <MemoizedItem
          node={nodeChildren!}
          contextVars={{
            $item: row,
            $rowIndex: rowIndex,
            $colIndex: colIndex,
            $row: row,
            $itemIndex: rowIndex,
            $cell: value,
          }}
          renderChild={renderChild}
        />
      );
    },
    [nodeChildren, renderChild],
  );

  const safeCellRenderer = useMemo(() => {
    return nodeChildren ? cellRenderer : undefined;
  }, [cellRenderer, nodeChildren]);

  useLayoutEffect(() => {
    registerColumn(
      {
        ...columnMetadata,
        cellRenderer: safeCellRenderer,
      },
      id,
    );
  }, [columnMetadata, id, registerColumn, safeCellRenderer]);

  useLayoutEffect(() => {
    return () => {
      unRegisterColumn(id);
    };
  }, [id, unRegisterColumn]);
  return null;
}
