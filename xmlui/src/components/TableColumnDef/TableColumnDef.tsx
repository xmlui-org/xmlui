import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { OurColumnMetadata, useTableContext } from "@components/TableColumnDef/TableContext";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo } from "react";
import { MemoizedItem } from "@components/container-helpers";
import type { RenderChildFn } from "@abstractions/RendererDefs";

type TableColumnProps = OurColumnMetadata & {
  nodeChildren?: ComponentDef[];
  renderChild: RenderChildFn;
};

function TableColumnDef({ nodeChildren, renderChild, index, ...columnMetadata }: TableColumnProps) {
  const id = useId();
  const { registerColumn, unRegisterColumn } = useTableContext();

  const cellRenderer = useCallback(
    (row: any) => {
      return <MemoizedItem node={nodeChildren!} item={row} renderChild={renderChild} />;
    },
    [nodeChildren, renderChild]
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

// =====================================================================================================================
// XMLUI TableColumnDef component definition

/**
 * The \`TableColumnDef\` component can be used within a \`Table\` to define a particular table column's 
 * visual properties and data bindings.
 */
export interface TableColumnDefComponentDef extends ComponentDef<"TableColumnDef"> {
  props:{
    /** @descriptionRef */
    bindTo?: string;
    /** @descriptionRef */
    header: string;
    /** @descriptionRef */
    width?: string;
    /**
     * Indicates the minimum width a particular column can have. (See an example in the [\`width\` property]
     * (#width) section below.)
     */
    minWidth?: number;
    /**
     * Indicates the maximum width a particular column can have.  (See an example in the [\`width\` property]
     * (#width) section below.)
     */
    maxWidth?: number;
    /** @descriptionRef */
    canSort?: boolean;
    /** @descriptionRef */
    pinTo?: string;
    /**
     * This property indicates whether the user can resize the column. If set to \`true\`, the column can 
     * be resized by dragging the column border. If set to \`false\`, the column cannot be resized. 
     * Double-clicking the column border resets to the original size.
     */
    canResize?: boolean;
  };
}

export const tableColumnDefComponentRenderer = createComponentRenderer<TableColumnDefComponentDef>(
  "TableColumnDef",
  (rendererContext) => {
    const { node, renderChild, extractValue, childIndex, layoutCss } = rendererContext;
    return (
      <TableColumnDef
        style={layoutCss}
        header={extractValue.asDisplayText(node.props.header)}
        accessorKey={extractValue.asOptionalString(node.props.bindTo)}
        canSort={extractValue.asOptionalBoolean(node.props.canSort)}
        canResize={extractValue.asOptionalBoolean(node.props.canResize)}
        pinTo={extractValue.asOptionalString(node.props.pinTo)}
        width={extractValue(node.props.width)}
        minWidth={extractValue(node.props.minWidth)}
        maxWidth={extractValue(node.props.maxWidth)}
        nodeChildren={node.children}
        renderChild={renderChild}
        index={childIndex || 0}
      />
    );
  }
);
