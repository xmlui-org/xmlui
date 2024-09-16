import styles from "./FlowLayout.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { isComponentDefChildren } from "@components-core/utils/misc";
import { NotAComponentDefError } from "@components-core/EngineError";
import { parseScssVar } from "@components-core/theming/themeVars";
import { FlowItemWrapper, FlowLayout } from "./FlowLayoutNative";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  description:
    `This layout component is used to position content in rows with an auto wrapping feature: if ` +
    `the length of the items exceed the available space the layout will wrap into a new line.`,
  props: {
    gap: d(
      `This property defines the gap between items in the same row and between rows. The ${COMP} ` +
        `component creates a new row when an item is about to overflow the current row.`,
    ),
    columnGap: d(
      `The \`columnGap\` property specifies the space between items in a single row; it overrides ` +
        `the \`gap\` value.`,
    ),
    rowGap: d(
      `The \`rowGap\` property specifies the space between the ${COMP} rows; it overrides ` +
        `the \`gap\` value.`,
    ),
    shadow: d(`${COMP} does not support shadow, we're waiting for a decent solution.`),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const flowLayoutComponentRenderer = createComponentRendererNew(
  COMP,
  FlowLayoutMd,
  ({ node, renderChild, layoutCss, extractValue }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    // --- Only calculate column gaps if there are more than 1 child
    const columnGap = extractValue.asSize(node.props?.columnGap) || layoutCss.gap || 0;
    const rowGap = extractValue.asSize(node.props?.rowGap) || layoutCss.gap || 0;
    return (
      <FlowLayout style={layoutCss} columnGap={columnGap} rowGap={rowGap}>
        {renderChild(node.children, {
          wrapChild: ({ node, extractValue }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            // Handle SpaceFiller as a * width item
            const width = node.type === "SpaceFiller" ? "*" : extractValue(node.props?.width);
            return (
              <FlowItemWrapper
                width={width}
                minWidth={extractValue(node.props?.minWidth)}
                maxWidth={extractValue(node.props?.maxWidth)}
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
