import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { TableColumnDef } from "./TableColumnDefNative";

const COMP = "TableColumnDef";

export const TableColumnDefMd = createMetadata({
  description:
    `The \`${COMP}\` component can be used within a \`Table\` to define a particular table ` +
    `column's visual properties and data bindings.`,
  props: {
    bindTo: d(`Indicates what part of the data to lay out in the column.`),
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
      `This property allows the column to be pinned to the \`left\` or right \`edge\` ` +
        `of the table.`,
    ),
    canResize: d(
      `This property indicates whether the user can resize the column. If set to ` +
        `\`true\`, the column can be resized by dragging the column border. If set to ` +
        `\`false\`, the column cannot be resized. Double-clicking the column border ` +
        `resets to the original size.`,
    ),
  },
});

export const tableColumnDefComponentRenderer = createComponentRendererNew(
  COMP,
  TableColumnDefMd,
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
  },
);
