import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Column } from "./ColumnNative";

const COMP = "Column";

export const ColumnMd = createMetadata({
  description:
    `The \`${COMP}\` component can be used within a \`Table\` to define a particular table ` +
    `column's visual properties and data bindings.`,
  props: {
    bindTo: {
      description: `Indicates what part of the data to lay out in the column.`,
      isRequired: true,
    },
    header: d(`Adds a label for a particular column.`),
    width: d(
      `This property defines the width of the column. You can use a numeric value, a pixel ` +
        `value (such as \`100px\`), or a star size value (such as \`*\`, \`2*\`, etc.). ` +
        `You will get an error if you use any other unit (or value).`,
    ),
    minWidth: d(`Indicates the minimum width a particular column can have.`),
    maxWidth: d(`Indicates the maximum width a particular column can have.`),
    canSort: d(
      `This property sets whether the user can sort by a column by clicking on its header ` +
        `(\`true\`) or not (\`false\`).`,
    ),
    pinTo: d(
      `This property allows the column to be pinned to ` +
       `the \`left\` (left-to-right writing style) or \`right\` (left-to-right writing style) edge ` +
        `of the table. If the writing style is right-to-left, the locations are switched.`,
      ["left", "right"],
      "string",
    ),
    canResize: d(
      `This property indicates whether the user can resize the column. If set to ` +
        `\`true\`, the column can be resized by dragging the column border. If set to ` +
        `\`false\`, the column cannot be resized. Double-clicking the column border ` +
        `resets to the original size.`,
    ),
  },
  contextVars: {
    $item: {
      description: "The data item being rendered.",
    },
    $row: {
      description: "The data item being rendered (the same as \`$item\`).",
    },
    $itemIndex: {
      description: "The index of the data item being rendered.",
    },
    $rowIndex: {
      description: "The index of the data item being rendered (the same as \`$itemIndex\`).",
    },
    $colIndex: {
      description: "The index of the column being rendered.",
    },
    $cell: {
      description: "The value of the cell being rendered.",
    },
  }
});

export const columnComponentRenderer = createComponentRenderer(
  COMP,
  ColumnMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutCss } = rendererContext;
    return (
      <Column
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
        id={node.uid}
      />
    );
  },
);
