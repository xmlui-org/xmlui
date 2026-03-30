import type React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { createMetadata } from "../metadata-helpers";
import { Column, defaultProps } from "./ColumnReact";

const COMP = "Column";

export const ColumnMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Column` defines the structure and behavior of individual table columns " +
    "within a [`Table`](/docs/reference/components/Table) component. Each Column controls data " +
    "binding, header display, sorting capabilities, sizing, and can contain any " +
    "XMLUI components for rich cell content.",
  props: {
    bindTo: {
      description:
        "Indicates the name of the current row item's property, the value of which to " +
        "lay out in the column. If this property is not defined, the column is not sortable.",
      valueType: "string",
    },
    header: {
      description:
        "This property defines a label for a particular column. If not set, the " +
        "`bindTo` property value is used for the label.",
      valueType: "string",
    },
    width: {
      description:
        "This property defines the width of the column. You can use a numeric value, a pixel " +
        "value (such as \`100px\`), or a star size value (such as \`*\`, \`2*\`, etc.). " +
        "You will get an error if you use any other unit (or value)." +
        "If not defined, the component will use a width according to the column values and " +
        "the available space.",
      valueType: "any",
    },
    minWidth: {
      description: `Indicates the minimum width a particular column can have. Same rules apply as with [width](#width).`,
      valueType: "any",
    },
    maxWidth: {
      description: `Indicates the maximum width a particular column can have. Same rules apply as with [width](#width).`,
      valueType: "any",
    },
    canSort: {
      description:
        "This property sets whether the user can sort by a column by clicking on its header " +
        "(\`true\`) or not (\`false\`). If the `bindTo` property is not defined, the column is not sortable.",
      defaultValue: defaultProps.canSort,
      valueType: "boolean",
    },
    pinTo: {
      description:
        `This property allows the column to be pinned to ` +
        `the \`left\` (left-to-right writing style) or \`right\` (left-to-right writing style) edge ` +
        "of the table. If the writing style is right-to-left, the locations are switched. " +
        "If this property is not set, the column is not pinned to any edge.",
      availableValues: ["left", "right"],
      valueType: "string",
    },
    canResize: {
      description:
        `This property indicates whether the user can resize the column. If set to ` +
        `\`true\`, the column can be resized by dragging the column border. If set to ` +
        `\`false\`, the column cannot be resized. Double-clicking the column border ` +
        `resets to the original size.`,
      valueType: "boolean",
      defaultValue: defaultProps.canResize,
    },
  },
  contextVars: {
    $item: {
      description: "The complete data row object being rendered",
    },
    $cell: {
      description: "The specific cell value for this column",
    },
    $itemIndex: {
      description: "Zero-based row index",
    },
    $colIndex: {
      description: "Zero-based column index",
    },
    $row: {
      description: "The complete data row object being rendered (the same as \`$item\`).",
    },
    $rowIndex: {
      description: "Zero-based row index (the same as \`$itemIndex\`).",
    },
  },
});

export const columnComponentRenderer = wrapComponent(COMP, Column, ColumnMd, {
  customRender: (_props, { node, extractValue, renderChild, classes, appContext, layoutContext }) => {
    // Allow config.json to override the default canSort value via appGlobals.columnCanSortDefault
    const canSortDefault = appContext?.appGlobals?.columnCanSortDefault ?? defaultProps.canSort;

    // Convert horizontalAlignment and verticalAlignment to CSS properties for table cells
    // since columns are not flex containers
    const horizontalAlignment = extractValue.asOptionalString(node.props.horizontalAlignment);
    const verticalAlignment = extractValue.asOptionalString(node.props.verticalAlignment);

    const backgroundColor = extractValue.asOptionalString(node.props.backgroundColor);

    const style: React.CSSProperties = {};
    if (backgroundColor) {
      style.backgroundColor = backgroundColor;
    }
    if (horizontalAlignment) {
      // Use flexbox to align block-level content
      style.display = 'flex';
      style.justifyContent =
        horizontalAlignment === 'start' ? 'flex-start' :
        horizontalAlignment === 'center' ? 'center' :
        horizontalAlignment === 'end' ? 'flex-end' :
        horizontalAlignment;
      style.textAlign = horizontalAlignment as React.CSSProperties["textAlign"]; // Also set textAlign for text content
    }
    if (verticalAlignment) {
      if (!style.display) {
        style.display = 'flex';
      }
      style.alignItems =
        verticalAlignment === 'start' ? 'flex-start' :
        verticalAlignment === 'center' ? 'center' :
        verticalAlignment === 'end' ? 'flex-end' :
        verticalAlignment;
      style.verticalAlign = verticalAlignment as React.CSSProperties["verticalAlign"]; // Also set verticalAlign for fallback
    }

    return (
      <Column
        style={Object.keys(style).length > 0 ? style : undefined}
        header={extractValue.asDisplayText(node.props.header)}
        accessorKey={extractValue.asOptionalString(node.props.bindTo)}
        canSort={extractValue.asOptionalBoolean(node.props.canSort, canSortDefault)}
        canResize={extractValue.asOptionalBoolean(node.props.canResize)}
        pinTo={extractValue.asOptionalString(node.props.pinTo)}
        width={extractValue(node.props.width)}
        minWidth={extractValue(node.props.minWidth)}
        maxWidth={extractValue(node.props.maxWidth)}
        nodeChildren={node.children}
        renderChild={renderChild}
        layoutContext={layoutContext as LayoutContext}
        id={node.uid}
      />
    );
  },
});
