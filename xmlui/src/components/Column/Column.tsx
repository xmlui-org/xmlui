import { createMetadata } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Column.defaults";
import { ColumnNative } from "./ColumnReact";

const COMP = "Column";

export const ColumnMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Column` defines the structure and behavior of individual table columns within a `Table` component.",
  props: {
    bindTo: {
      description: "The current row item's property to display in this column.",
      valueType: "string",
    },
    header: {
      description: "The column header label. If omitted, `bindTo` is used.",
      valueType: "string",
    },
    width: {
      description: "The column width.",
      valueType: "any",
    },
    minWidth: {
      description: "The column minimum width.",
      valueType: "any",
    },
    maxWidth: {
      description: "The column maximum width.",
      valueType: "any",
    },
    canSort: {
      description: "Whether the user can sort this column by clicking the header.",
      valueType: "boolean",
      defaultValue: defaultProps.canSort,
    },
    pinTo: {
      description: "Pins the column to the left or right edge.",
      valueType: "string",
      availableValues: ["left", "right"],
    },
    canResize: {
      description: "Whether the column can be resized.",
      valueType: "boolean",
      defaultValue: defaultProps.canResize,
    },
  },
  contextVars: {
    $item: { description: "The complete data row object being rendered." },
    $cell: { description: "The specific cell value for this column." },
    $itemIndex: { description: "Zero-based row index." },
    $colIndex: { description: "Zero-based column index." },
    $row: { description: "The complete data row object being rendered." },
    $rowIndex: { description: "Zero-based row index." },
  },
});

export const columnRenderer = wrapComponent({
  name: COMP,
  metadata: ColumnMd,
  renderer: () => <ColumnNative />,
});
