import styles from "./FlowLayout.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { FlowItemBreak, FlowItemWrapper, FlowLayout, defaultProps } from "./FlowLayoutNative";
import { de } from "date-fns/locale";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  description:
    "This layout component is used to position content in rows with an auto wrapping feature: if " +
    "the length of the items exceed the available space the layout will wrap into a new line.",
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
  ({ node, renderChild, layoutCss, extractValue }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    const columnGap =
      extractValue.asSize(node.props?.columnGap) ||
      layoutCss.gap ||
      extractValue.asSize("$space-4");
    const rowGap =
      extractValue.asSize(node.props?.rowGap) || layoutCss.gap || extractValue.asSize("$space-4");

    return (
      <FlowLayout style={layoutCss} columnGap={columnGap} rowGap={rowGap}>
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
