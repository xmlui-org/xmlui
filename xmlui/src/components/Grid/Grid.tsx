import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { GridNative, defaultProps } from "./GridNative";
import type { ValueExtractor } from "../../abstractions/RendererDefs";

const COMP = "Grid";

export const GridMd = createMetadata({
  status: "stable",
  description:
    "A flexible grid layout component that supports both row-first and column-first layouts.",
  props: {
    columnWidths: {
      description:
        "Space-separated list of column widths. Supports star sizing (*), percentages, fixed sizes, and design tokens.",
      type: "string",
    },
    rowHeights: {
      description:
        "Space-separated list of row heights. Supports percentages, fixed sizes, and design tokens.",
      type: "string",
    },
    columns: {
      description: "Number of columns for implicit grid layout.",
      type: "number",
    },
    rows: {
      description: "Number of rows for implicit grid layout.",
      type: "number",
    },
    columnGap: {
      description: "Gap between columns.",
      defaultValue: defaultProps.columnGap,
      type: "string",
    },
    rowGap: {
      description: "Gap between rows.",
      defaultValue: defaultProps.rowGap,
      type: "string",
    },
    gap: {
      description: "Shorthand for setting both rowGap and columnGap to the same value.",
      type: "string",
    },
    horizontalAlignment: {
      description: "Default horizontal alignment for grid items.",
      type: "string",
      defaultValue: defaultProps.horizontalAlignment,
    },
    verticalAlignment: {
      description: "Default vertical alignment for grid items.",
      type: "string",
      defaultValue: defaultProps.verticalAlignment,
    },
    data: {
      description: "Data array for template-based grid rendering.",
      type: "array",
    },
  },
});

export const gridComponentRenderer = createComponentRenderer(
  COMP,
  GridMd,
  ({ node, extractValue, renderChild, className }) => {
    const columnWidths = parseGridSizes(node.props.columnWidths, extractValue);
    const rowHeights = parseGridSizes(node.props.rowHeights, extractValue);
    const columns = extractValue.asOptionalNumber(node.props.columns);
    const rows = extractValue.asOptionalNumber(node.props.rows);
    const columnGap = extractValue.asSize(node.props.columnGap);
    const rowGap = extractValue.asSize(node.props.rowGap);
    const gap = extractValue.asSize(node.props.gap);
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
    const data = extractValue(node.props.data);

    // Render children with grid context
    const children = renderChild(node.children);

    return (
      <GridNative
        className={className}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        columns={columns}
        rows={rows}
        columnGap={columnGap}
        rowGap={rowGap}
        gap={gap}
        horizontalAlignment={horizontalAlignment}
        verticalAlignment={verticalAlignment}
        data={data}
      >
        {children}
      </GridNative>
    );
  },
);

/**
 * Parse grid size string into CSS grid template syntax
 * Supports:
 * - Star sizing: * becomes 1fr, 2* becomes 2fr
 * - Percentages: 50%
 * - Fixed sizes: 100px, $size-10
 * - Auto: auto
 */
function parseGridSizes(sizes: string, extractor: ValueExtractor) {
  // Validate sizes
  const _sizes = extractor.asOptionalString(sizes);
  if (!_sizes || _sizes.trim() === "") {
    return undefined;
  }

  return _sizes
    .split(/\s+/)
    .map((size) => {
      size = size.trim();
      if (!size) return "";

      // Star sizing: * becomes 1fr, 2* becomes 2fr
      const starMatch = size.match(/^(\d*)\*$/);
      if (starMatch) {
        const multiplier = starMatch[1] || "1";
        return `${multiplier}fr`;
      }

      // Already valid CSS value (percentage, px, design tokens, auto, etc.)
      return extractor.asSize(size);
    })
    .filter(Boolean)
    .join(" ");
}
