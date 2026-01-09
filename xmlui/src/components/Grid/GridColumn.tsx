import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { GridColumnNative, defaultProps } from "./GridColumnNative";

const COMP = "GridColumn";

export const GridColumnMd = createMetadata({
  status: "stable",
  description: "A grid column component used within Grid to define explicit column layouts.",
  props: {
    width: {
      description: "Width of the column. Supports star sizing (*), percentages, fixed sizes, and design tokens.",
      type: "string",
    },
    horizontalAlignment: {
      description: "Horizontal alignment for items in this column.",
      type: "string",
    },
    verticalAlignment: {
      description: "Vertical alignment for items in this column.",
      type: "string",
    },
    rowGap: {
      description: "Gap between rows in this column.",
      type: "string",
    },
  },
});

export const gridColumnComponentRenderer = createComponentRenderer(
  COMP,
  GridColumnMd,
  ({ node, extractValue, renderChild, className }) => {
    const width = extractValue.asSize(node.props.width);
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
    const rowGap = extractValue.asSize(node.props.rowGap);

    const children = renderChild(node.children);

    return (
      <GridColumnNative
        className={className}
        width={width}
        horizontalAlignment={horizontalAlignment}
        verticalAlignment={verticalAlignment}
        rowGap={rowGap}
      >
        {children}
      </GridColumnNative>
    );
  },
);
