import type React from "react";
import styles from "./Stack.module.scss";
import { ComponentDefNew, createMetadata, d } from "@abstractions/ComponentDefs";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { isComponentDefChildren } from "@components-core/utils/misc";
import { NotAComponentDefError } from "@components-core/EngineError";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import type { NonCssLayoutProps, ValueExtractor } from "@abstractions/RendererDefs";
import { dClick } from "@components/metadata-helpers";
import { DEFAULT_ORIENTATION, Stack } from "./StackNative";

const COMP = "Stack";

const HORIZONTAL_ALIGNMENT = d(
  `Manages the horizontal content alignment for each child element in the Stack.`,
);
const VERTICAL_ALIGNMENT = d(
  `Manages the vertical content alignment for each child element in the Stack.`,
);

const stackMd = createMetadata({
  description: `\`Stack\` is a layout container displaying children in a horizontal or vertical stack.`,
  props: {
    gap: d(`Optional size value indicating the gap between child elements.`),
    reverse: d(`Optional boolean property to reverse the order of child elements.`),
    wrapContent: d(
      `Optional boolean which wraps the content if set to true and the available space is not big ` +
        `enough. Works in all orientations.`,
    ),
    hoverContainer: d("Reserved for future use"),
    visibleOnHover: d("Reserved for future use"),
  },
  events: {
    click: dClick(COMP),
    mounted: d("Reserved for future use"),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const StackMd = {
  ...stackMd,
  props: {
    ...stackMd.props,
    orientation: d(
      `An optional property that governs the Stack's orientation (whether the Stack lays out its ` +
        `children in a row or a column).`,
    ),
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
  },
};
type StackComponentDef = ComponentDefNew<typeof StackMd>;

export const VStackMd = {
  ...StackMd,
  description: `This component represents a stack rendering its contents vertically.`,
  props: {
    ...stackMd.props,
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
  },
};
type VStackComponentDef = ComponentDefNew<typeof VStackMd>;

export const HStackMd = {
  ...StackMd,
  description: `This component represents a stack rendering its contents horizontally.`,
  props: {
    ...stackMd.props,
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
  },
};
type HStackComponentDef = ComponentDefNew<typeof HStackMd>;

export const CVStackMd = {
  ...StackMd,
  description:
    `This component represents a stack that renders its contents vertically ` +
    `and aligns that in the center along both axes.`,
};
type CVStackComponentDef = ComponentDefNew<typeof CVStackMd>;

export const CHStackMd = {
  ...StackMd,
  description:
    `This component represents a stack that renders its contents horizontally ` +
    `and aligns that in the center along both axes.`,
};
type CHStackComponentDef = ComponentDefNew<typeof CHStackMd>;

type RenderStackPars = {
  node:
    | StackComponentDef
    | VStackComponentDef
    | HStackComponentDef
    | CVStackComponentDef
    | CHStackComponentDef;
  layoutNonCss: NonCssLayoutProps;
  extractValue: ValueExtractor;
  layoutCss: React.CSSProperties;
  lookupEventHandler: (
    eventName: keyof NonNullable<StackComponentDef["events"]>,
  ) => AsyncFunction | undefined;
  renderChild: RenderChildFn;
  orientation?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
};

function renderStack({
  node,
  layoutNonCss,
  extractValue,
  layoutCss,
  lookupEventHandler,
  renderChild,
  orientation = layoutNonCss.orientation || DEFAULT_ORIENTATION,
  horizontalAlignment = layoutNonCss.horizontalAlignment,
  verticalAlignment = layoutNonCss.verticalAlignment,
}: RenderStackPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }
  return (
    <Stack
      orientation={orientation}
      horizontalAlignment={horizontalAlignment}
      verticalAlignment={verticalAlignment}
      reverse={extractValue(node.props?.reverse)}
      hoverContainer={extractValue(node.props?.hoverContainer)}
      visibleOnHover={extractValue(node.props?.visibleOnHover)}
      layout={layoutCss}
      onMount={lookupEventHandler("mounted")}
    >
      {renderChild(node.children, {
        type: "Stack",
        orientation,
      })}
    </Stack>
  );
}

export const stackComponentRenderer = createComponentRenderer(
  COMP,
  StackMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({
      node,
      layoutNonCss,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
    });
  },
);

export const vStackComponentRenderer = createComponentRenderer(
  "VStack",
  VStackMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({
      node,
      layoutNonCss,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "vertical",
    });
  },
);

export const hStackComponentRenderer = createComponentRenderer(
  "HStack",
  HStackMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({
      node,
      layoutNonCss,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
    });
  },
);

export const cvStackComponentRenderer = createComponentRenderer(
  "CVStack",
  CVStackMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({
      node,
      layoutNonCss,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "vertical",
      horizontalAlignment: "center",
      verticalAlignment: "center",
    });
  },
);

export const chStackComponentRenderer = createComponentRenderer(
  "CHStack",
  CHStackMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({
      node,
      layoutNonCss,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
      horizontalAlignment: "center",
      verticalAlignment: "center",
    });
  },
);
