import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { GridRowNative } from "./GridRowNative";

const COMP = "GridRow";

export const GridRowMd = createMetadata({
  status: "stable",
  description: "A grid row component used within Grid to define explicit row layouts.",
  props: {
    height: {
      description: "Height of the row. Supports percentages, fixed sizes, and design tokens.",
      type: "string",
    },
    horizontalAlignment: {
      description: "Horizontal alignment for items in this row.",
      type: "string",
    },
    verticalAlignment: {
      description: "Vertical alignment for items in this row.",
      type: "string",
    },
    columnGap: {
      description: "Gap between columns in this row.",
      type: "string",
    },
  },
});

export const gridRowComponentRenderer = createComponentRenderer(
  COMP,
  GridRowMd,
  ({ node, extractValue, renderChild, className }) => {
    const height = extractValue.asSize(node.props.height);
    const horizontalAlignment = extractValue.asOptionalString(node.props.horizontalAlignment) as
      | "start"
      | "center"
      | "end"
      | "stretch"
      | undefined;
    const verticalAlignment = extractValue.asOptionalString(node.props.verticalAlignment) as
      | "start"
      | "center"
      | "end"
      | "stretch"
      | undefined;
    const columnGap = extractValue.asSize(node.props.columnGap);

    const children = renderChild(node.children);

    return (
      <GridRowNative
        className={className}
        height={height}
        horizontalAlignment={horizontalAlignment}
        verticalAlignment={verticalAlignment}
        columnGap={columnGap}
      >
        {children}
      </GridRowNative>
    );
  },
);
