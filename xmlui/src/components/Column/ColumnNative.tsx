import type { ComponentDef } from "@abstractions/ComponentDefs";
import { OurColumnMetadata, useTableContext } from "./TableContext";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo } from "react";
import { MemoizedItem } from "@components/container-helpers";
import type { RenderChildFn } from "@abstractions/RendererDefs";

type Props = OurColumnMetadata & {
  nodeChildren?: ComponentDef[];
  renderChild: RenderChildFn;
};

export function Column({ nodeChildren, renderChild, index, ...columnMetadata }: Props) {
  const id = useId();
  const { registerColumn, unRegisterColumn } = useTableContext();

  const cellRenderer = useCallback(
    (row: any) => {
      return <MemoizedItem node={nodeChildren!} item={row} renderChild={renderChild} />;
    },
    [nodeChildren, renderChild],
  );

  const safeCellRenderer = useMemo(() => {
    return nodeChildren ? cellRenderer : undefined;
  }, [cellRenderer, nodeChildren]);

  useLayoutEffect(() => {
    registerColumn({
      ...columnMetadata,
      cellRenderer: safeCellRenderer,
      id,
      index,
    });
  }, [index, columnMetadata, id, registerColumn, safeCellRenderer]);

  useEffect(() => {
    return () => {
      unRegisterColumn(id);
    };
  }, [id, unRegisterColumn]);
  return null;
}
