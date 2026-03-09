import React from "react";
import styles from "./FlowLayout.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { FlowItemBreak, FlowItemWrapper, FlowLayout, defaultProps } from "./FlowLayoutNative";
import { createMetadata, dContextMenu } from "../metadata-helpers";

export { FlowItemBreak, FlowItemWrapper } from "./FlowLayoutNative";
import { alignmentOptionValues } from "../abstractions";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  status: "stable",
  description:
    "`FlowLayout` positions content in rows with automatic wrapping. When items " +
    "exceed the available horizontal space, they automatically wrap to a new line.",
  deprecationMessage:
    "We plan to deprecate the FlowLayout component in the near future. Please use HStack with wrapContent set to true; it will overtake the role of FlowLayout.",
  props: {
    gap: {
      description:
        `This property defines the gap between items in the same row and between rows. The ${COMP} ` +
        `component creates a new row when an item is about to overflow the current row.`,
      type: "string",
      defaultValue: "$gap-normal",
    },
    itemWidth: {
      description:
        "Specifies the default width for child items when they don't have an explicit width property. " +
        "Accepts any valid CSS width value (e.g., '100%', '200px', '20rem', '*').",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
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
    verticalAlignment: {
      description:
        "Manages the vertical content alignment for each child element within the same row. " +
        "This aligns items along the cross-axis of the flex container.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    scrollStyle: {
      description:
        `This property determines the scrollbar style. Options: "normal" uses the browser's default ` +
        `scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the ` +
        `scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar ` +
        `only while scrolling is active and fades out after 400ms of inactivity.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        "When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. " +
        "The fade indicators automatically appear/disappear based on the current scroll position. " +
        "Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. " +
        "Only works with overlay scrollbar modes (not with 'normal' mode).",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    scrollToTop: {
      description:
        "Scrolls the FlowLayout container to the top. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description:
        "Scrolls the FlowLayout container to the bottom. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

type ThemedFlowLayoutProps = React.ComponentPropsWithoutRef<typeof FlowLayout>;

export const ThemedFlowLayout = React.forwardRef<React.ElementRef<typeof FlowLayout>, ThemedFlowLayoutProps>(
  function ThemedFlowLayout({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(FlowLayoutMd);
    return (
      <FlowLayout
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const flowLayoutComponentRenderer = createComponentRenderer(
  COMP,
  FlowLayoutMd,
  ({ node, renderChild, className, extractValue, registerComponentApi, lookupEventHandler }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    const columnGap =
      extractValue.asSize(node.props?.columnGap) ||
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize("$space-4");
    const rowGap =
      extractValue.asSize(node.props?.rowGap) ||
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize("$space-4");
    const itemWidth = extractValue.asOptionalString(node.props?.itemWidth, defaultProps.itemWidth);
    const verticalAlignment = extractValue.asOptionalString(node.props?.verticalAlignment, "start");
    const scrollStyle = extractValue.asOptionalString(
      node.props.scrollStyle,
      defaultProps.scrollStyle,
    ) as any;
    const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);

    return (
      <ThemedFlowLayout
        className={className}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={verticalAlignment}
        scrollStyle={scrollStyle}
        showScrollerFade={showScrollerFade}
        onContextMenu={lookupEventHandler("contextMenu")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children, {
          type: "FlowLayout",
          ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
          wrapChild: ({ node, extractValue }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            if (hints?.nonVisual) {
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
      </ThemedFlowLayout>
    );
  },
);
