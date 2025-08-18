import styles from "./FlowLayout.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { FlowItemBreak, FlowItemWrapper, FlowLayout, defaultProps } from "./FlowLayoutNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  status: "stable",
  description:
    "`FlowLayout` positions content in rows with automatic wrapping. When items " +
    "exceed the available horizontal space, they automatically wrap to a new line.",
  props: {
    gap: {
      description:
        `This property defines the gap between items in the same row and between rows. The ${COMP} ` +
        `component creates a new row when an item is about to overflow the current row.`,
      type: "string",
      defaultValue: "$gap-normal",
    },
    columnGap: {
      description:
        "The \`columnGap\` property specifies the space between items in a single row; it overrides " +
        "the \`gap\` value.",
      defaultValue: defaultProps.columnGap,
    },
    rowGap: {
      description:
        `The \`rowGap\` property specifies the space between the ${COMP} rows; it overrides ` +
        `the \`gap\` value.`,
      defaultValue: defaultProps.rowGap,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const flowLayoutComponentRenderer = createComponentRenderer(
  COMP,
  FlowLayoutMd,
  ({ node, renderChild, className, extractValue }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    const columnGap =
      extractValue.asSize(node.props?.columnGap) ||
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize("$space-4");
    const rowGap =
      extractValue.asSize(node.props?.rowGap) || extractValue.asSize(node.props?.gap) || extractValue.asSize("$space-4");

    return (
      <FlowLayout className={className} columnGap={columnGap} rowGap={rowGap}>
        {renderChild(node.children, {
          wrapChild: ({ node, extractValue }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            // Handle SpaceFiller as flow item break
            if (node.type === "SpaceFiller") {
              return <FlowItemBreak force={true} />;
            }
            const width = extractValue((node.props as any)?.width);
            const minWidth = extractValue((node.props as any)?.minWidth);
            const maxWidth = extractValue((node.props as any)?.maxWidth);
            return (
              <FlowItemWrapper
                width={width}
                minWidth={minWidth}
                maxWidth={maxWidth}
                forceBreak={node.type === "SpaceFiller"}
              >
                {renderedChild}
              </FlowItemWrapper>
            );
          },
        })}
      </FlowLayout>
    );
  },
);
