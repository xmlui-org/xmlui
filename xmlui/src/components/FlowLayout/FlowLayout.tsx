import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { defaultProps } from "./FlowLayout.defaults";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  status: "stable",
  description:
    "`FlowLayout` positions content in rows with automatic wrapping. When items exceed the available horizontal space, they automatically wrap to a new line.",
  deprecationMessage:
    "We plan to deprecate the FlowLayout component in the near future. Please use HStack with wrapContent set to true; it will overtake the role of FlowLayout.",
  props: {
    gap: {
      description: "Defines the gap between items in the same row and between rows.",
      valueType: "length",
      defaultValue: "$gap-normal",
    },
    itemWidth: {
      description: "Specifies the default width for child items when they do not have an explicit width property.",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    columnGap: {
      description: "Specifies the space between items in a single row; it overrides the `gap` value.",
      valueType: "length",
      defaultValue: defaultProps.columnGap,
    },
    rowGap: {
      description: "Specifies the space between FlowLayout rows; it overrides the `gap` value.",
      valueType: "length",
      defaultValue: defaultProps.rowGap,
    },
    verticalAlignment: {
      description: "Manages vertical alignment for each child element within the same row.",
      availableValues: ["start", "center", "end"],
      valueType: "string",
      defaultValue: defaultProps.verticalAlignment,
    },
    scrollStyle: {
      description: "Determines the scrollbar style.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description: "When enabled, displays gradient fade indicators around scrollable FlowLayout content.",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
    testId: {
      description: "This optional property adds a test identifier to the FlowLayout root element.",
      valueType: "string",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the FlowLayout container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the FlowLayout container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: {
    [`gap-${COMP}`]: "Gap between FlowLayout items.",
    [`columnGap-${COMP}`]: "Horizontal gap between FlowLayout items.",
    [`rowGap-${COMP}`]: "Vertical gap between FlowLayout rows.",
  },
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-layout",
    [`columnGap-${COMP}`]: `$gap-${COMP}`,
    [`rowGap-${COMP}`]: `$gap-${COMP}`,
  },
});
