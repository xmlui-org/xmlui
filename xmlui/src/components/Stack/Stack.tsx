import type React from "react";

import styles from "./Stack.module.scss";

import { type ComponentDef, ComponentPropertyMetadata, createMetadata, d } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dClick, dInternal } from "../metadata-helpers";
import { DEFAULT_ORIENTATION, Stack } from "./StackNative";
import { alignmentOptionValues } from "../abstractions";

const COMP = "Stack";

const HORIZONTAL_ALIGNMENT: ComponentPropertyMetadata = {
  description: "Manages the horizontal content alignment for each child element in the Stack.",
  availableValues: alignmentOptionValues,
  valueType: "string",
  defaultValue: "start",
};
const VERTICAL_ALIGNMENT: ComponentPropertyMetadata = {
  description: "Manages the vertical content alignment for each child element in the Stack.",
  availableValues: alignmentOptionValues,
  valueType: "string",
  defaultValue: "start",
};

const stackMd = createMetadata({
  description: `\`Stack\` is a layout container displaying children in a horizontal or vertical stack.`,
  props: {
    gap: {
      description: "Optional size value indicating the gap between child elements.",
      valueType: "string",
      defaultValue: "$gap-normal",
    },
    reverse: {
      description: "Optional boolean property to reverse the order of child elements.",
      valueType: "boolean",
      defaultValue: false,
    },
    wrapContent: {
      description:
        "Optional boolean which wraps the content if set to true and the available " +
        "space is not big enough. Works only with horizontal orientations.",
      valueType: "boolean",
      defaultValue: false,
    },
    orientation: {
      description: "An optional property that governs the Stack's orientation (whether " + 
      "the Stack lays out its children in a row or a column).",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: DEFAULT_ORIENTATION,
    },
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
    hoverContainer: dInternal("Reserved for future use"),
    visibleOnHover: dInternal("Reserved for future use"),
  },
  events: {
    click: dClick(COMP),
    mounted: dInternal("Reserved for future use"),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const StackMd = {
  ...stackMd,
  props: {
    ...stackMd.props,
  },
};
type StackComponentDef = ComponentDef<typeof StackMd>;

export const VStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: `This component represents a stack rendering its contents vertically.`,
  props: {
    ...stackMd.props,
  },
};
type VStackComponentDef = ComponentDef<typeof VStackMd>;

export const HStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: `This component represents a stack rendering its contents horizontally.`,
  props: {
    ...stackMd.props,
  },
};
type HStackComponentDef = ComponentDef<typeof HStackMd>;

export const CVStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    `This component represents a stack that renders its contents vertically ` +
    `and aligns that in the center along both axes.`,
};
type CVStackComponentDef = ComponentDef<typeof CVStackMd>;

export const CHStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    `This component represents a stack that renders its contents horizontally ` +
    `and aligns that in the center along both axes.`,
};
type CHStackComponentDef = ComponentDef<typeof CHStackMd>;

type RenderStackPars = {
  node:
    | StackComponentDef
    | VStackComponentDef
    | HStackComponentDef
    | CVStackComponentDef
    | CHStackComponentDef;
  extractValue: ValueExtractor;
  layoutCss: React.CSSProperties;
  lookupEventHandler: (
    eventName: keyof NonNullable<StackComponentDef["events"]>,
  ) => AsyncFunction | undefined;
  renderChild: RenderChildFn;
  orientation: string;
  horizontalAlignment: string;
  verticalAlignment: string;
};

function renderStack({
  node,
  extractValue,
  layoutCss,
  orientation,
  horizontalAlignment,
  verticalAlignment,
  lookupEventHandler,
  renderChild,
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
      style={layoutCss}
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
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    const orientation = extractValue(node.props?.orientation) || DEFAULT_ORIENTATION;
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      layoutCss,
      orientation,
      horizontalAlignment,
      verticalAlignment,
      lookupEventHandler,
      renderChild,
    });
  },
);

export const vStackComponentRenderer = createComponentRenderer(
  "VStack",
  VStackMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "vertical",
      horizontalAlignment,
      verticalAlignment,
    });
  },
);

export const hStackComponentRenderer = createComponentRenderer(
  "HStack",
  HStackMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      layoutCss,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
      horizontalAlignment,
      verticalAlignment,
    });
  },
);

export const cvStackComponentRenderer = createComponentRenderer(
  "CVStack",
  CVStackMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return renderStack({
      node,
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
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return renderStack({
      node,
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
