import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { OurColumnMetadata } from "./TableContext";
import { useTableContext } from "./TableContext";
import { useCallback, useId, useLayoutEffect, useMemo } from "react";
import { MemoizedItem } from "@components/container-helpers";
import type { RenderChildFn } from "@abstractions/RendererDefs";

type Props = OurColumnMetadata & {
  nodeChildren?: ComponentDef[];
  renderChild: RenderChildFn;
};

export function Column({ nodeChildren, renderChild, ...columnMetadata }: Props) {
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
    });
  }, [columnMetadata, id, registerColumn, safeCellRenderer]);

  useLayoutEffect(() => {
    return () => {
      unRegisterColumn(id);
    };
  }, [id, unRegisterColumn]);
  return null;
}
