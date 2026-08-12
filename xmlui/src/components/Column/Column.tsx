import type React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { LayoutContext, ValueExtractor } from "../../abstractions/RendererDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { createMetadata, dEnabled, dReadonly } from "../metadata-helpers";
import { alignmentOptionValues } from "../abstractions";
import { defaultProps } from "./Column.defaults";
import { Column } from "./ColumnReact";

const COMP = "Column";

function hasPercentageWidthCustomCellChild(
  children: ComponentDef[] | undefined,
  extractValue: ValueExtractor,
) {
  return children?.some((child) => {
    const width = child.props?.width;
    if (width === undefined) {
      return false;
    }
    try {
      return /^\d+(?:\.\d+)?%$/.test(extractValue(width)?.toString().trim() ?? "");
    } catch {
      return false;
    }
  }) ?? false;
}

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
    headerHorizontalAlignment: {
      description:
        "This property sets the horizontal alignment of the column header content, including the sort indicator.",
      availableValues: alignmentOptionValues,
      isStrictEnum: true,
      valueType: "string",
    },
    tooltip: {
      description:
        "This property sets the tooltip text shown when hovering over cells in this column.",
      valueType: "string",
    },
    tooltipOptions: {
      description:
        "This property sets options for configuring column cell tooltips, such as delay and position.",
      valueType: "any",
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
      isStrictEnum: true,
      valueType: "string",
    },
    canResize: {
      description:
        `This property indicates whether the user can resize the column. If set to ` +
        `\`true\`, the column can be resized by dragging the column border. If set to ` +
        `\`false\`, the column cannot be resized. When omitted, the column uses the ` +
        `parent \`Table\` component's \`canResizeColumns\` value. Double-clicking the ` +
        `column border resets to the original size.`,
      valueType: "boolean",
      defaultValue: defaultProps.canResize,
    },
    type: {
      description:
        `This property provides a display hint for the column's cell values. Use compact values ` +
        `such as \`text\`, \`email\`, \`number(8,3)\`, \`currency(USD)\`, \`date(short)\`, ` +
        `\`datetime\`, \`boolean\`, \`checkbox\`, \`switch\`, \`color\`, \`enum\`, \`image\`, or ` +
        `\`json\` to select common table cell behavior. The type does not validate, convert, ` +
        `or mutate the underlying data. The \`checkbox\`, \`switch\`, and \`color\` types render ` +
        `interactive controls. Custom child markup inside the \`Column\` overrides type ` +
        `rendering.`,
      valueType: "string",
    },
    typeOptions: {
      description:
        `This property provides additional display options for the column type. Use it for ` +
        `object-shaped configuration, such as enum/status label maps, link labels, or image/avatar ` +
        `alt text, and long-text options such as \`maxLines\`. Values in \`typeOptions\` override compact options specified in the \`type\` ` +
        `string.`,
      valueType: "any",
    },
    readOnly: {
      ...dReadonly(),
      description:
        `This property marks interactive typed cells in the column as read-only. It is applied ` +
        `to the underlying control for \`checkbox\`, \`switch\`, and \`color\` column types.`,
    },
    enabled: {
      ...dEnabled(),
      description:
        `This property controls whether interactive typed cells in the column respond to user ` +
        `events. It is applied to the underlying control for \`checkbox\`, \`switch\`, and ` +
        `\`color\` column types.`,
    },
  },
  events: {
    willChange: {
      description:
        "This event is triggered before an interactive typed cell in the column changes its value. Return explicit false to cancel the change.",
      signature: "willChange(newValue: any, row: any, rowIndex: number, columnId: string): boolean | void",
      parameters: {
        newValue: "The new cell value.",
        row: "The row data object associated with the changed cell.",
        rowIndex: "The zero-based visible row index.",
        columnId: "The column identifier.",
      },
    },
    didChange: {
      description:
        "This event is triggered when an interactive typed cell in the column changes its value.",
      signature: "didChange(newValue: any, row: any, rowIndex: number, columnId: string): void",
      parameters: {
        newValue: "The new cell value.",
        row: "The row data object associated with the changed cell.",
        rowIndex: "The zero-based visible row index.",
        columnId: "The column identifier.",
      },
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
  customRender: (
    props,
    { node, extractValue, renderChild, classes, appContext, layoutContext, lookupEventHandler },
  ) => {
    // Allow config.json to override the default canSort value via xmluiConfig.columnCanSortDefault
    const canSortDefault = appContext?.xmluiConfig?.columnCanSortDefault ?? defaultProps.canSort;

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
      style.display = "flex";
      style.justifyContent =
        horizontalAlignment === "start"
          ? "flex-start"
          : horizontalAlignment === "center"
            ? "center"
            : horizontalAlignment === "end"
              ? "flex-end"
              : horizontalAlignment;
      style.textAlign = horizontalAlignment as React.CSSProperties["textAlign"]; // Also set textAlign for text content
    }
    if (verticalAlignment) {
      if (!style.display) {
        style.display = "flex";
      }
      style.alignItems =
        verticalAlignment === "start"
          ? "flex-start"
          : verticalAlignment === "center"
            ? "center"
            : verticalAlignment === "end"
              ? "flex-end"
              : verticalAlignment;
      style.verticalAlign = verticalAlignment as React.CSSProperties["verticalAlign"]; // Also set verticalAlign for fallback
    }

    const createTypedCellEventHandler = (eventName: "willChange" | "didChange") => {
      if (!node.events?.[eventName]) {
        return undefined;
      }

      return (
        newValue: any,
        row: any,
        rowIndex: number,
        columnId: string,
        cellValue: any,
      ) => {
        const handler = lookupEventHandler(eventName, {
          context: {
            $item: row,
            $row: row,
            $itemIndex: rowIndex,
            $rowIndex: rowIndex,
            $cell: cellValue,
          },
          ephemeral: true,
        });
        return handler?.(newValue, row, rowIndex, columnId);
      };
    };

    return (
      <Column
        style={Object.keys(style).length > 0 ? style : undefined}
        header={extractValue.asDisplayText(node.props.header)}
        headerHorizontalAlignment={extractValue.asOptionalString(
          node.props.headerHorizontalAlignment,
        )}
        tooltip={node.props.tooltip}
        tooltipOptions={extractValue(node.props.tooltipOptions, true)}
        accessorKey={extractValue.asOptionalString(node.props.bindTo)}
        canSort={extractValue.asOptionalBoolean(node.props.canSort, canSortDefault)}
        canResize={extractValue.asOptionalBoolean(node.props.canResize)}
        pinTo={extractValue.asOptionalString(node.props.pinTo)}
        type={extractValue.asOptionalString(node.props.type)}
        typeOptions={extractValue(node.props.typeOptions)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, true)}
        willChange={createTypedCellEventHandler("willChange") ?? props.onWillChange}
        didChange={createTypedCellEventHandler("didChange") ?? props.onDidChange}
        fillCellContent={hasPercentageWidthCustomCellChild(node.children, extractValue)}
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
