import type React from "react";

import styles from "./Stack.module.scss";

import type { ComponentDef, ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { RenderChildFn, StylePropsResolver } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick, dInternal } from "../metadata-helpers";
import { DEFAULT_ORIENTATION, defaultProps, Stack } from "./StackNative";
import { alignmentOptionValues } from "../abstractions";
import type { layoutOptionKeys } from "../../components-core/descriptorHelper";

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
  status: "stable",
  description:
    "`Stack` is the fundamental layout container that organizes child elements in " +
    "configurable horizontal or vertical arrangements. As the most versatile building " +
    "block in XMLUI's layout system, it provides comprehensive alignment, spacing, " +
    "and flow control options that serve as the foundation for all specialized stack variants.",
  props: {
    gap: {
      description: "Optional size value indicating the gap between child elements.",
      valueType: "string",
      defaultValue: "$gap-normal",
    },
    reverse: {
      description: "Optional boolean property to reverse the order of child elements.",
      valueType: "boolean",
      defaultValue: defaultProps.reverse,
    },
    wrapContent: {
      description:
        "Optional boolean which wraps the content if set to true and the available " +
        "space is not big enough. Works only with horizontal orientations.",
      valueType: "boolean",
      defaultValue: false,
    },
    orientation: {
      description:
        "An optional property that governs the Stack's orientation (whether " +
        "the Stack lays out its children in a row or a column).",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: defaultProps.orientation,
    },
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
    hoverContainer: {
      ...dInternal("Reserved for future use"),
      defaultValue: defaultProps.hoverContainer,
    },
    visibleOnHover: {
      ...dInternal("Reserved for future use"),
      defaultValue: defaultProps.visibleOnHover,
    },
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
  className?: string;
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
  className,
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
      className={className}
      onMount={lookupEventHandler("mounted")}
    >
      {renderChild(node.children, {
        type: "Stack",
        orientation,
      })}
    </Stack>
  );
}

export const StackStyleResolver: StylePropsResolver = (styleProps) => {
  const {
    orientation = defaultProps.orientation,
    horizontalAlignment = "start",
    verticalAlignment = "start",
    reverse = defaultProps.reverse,
  } = styleProps;
  let result: Record<(typeof layoutOptionKeys)[number], string> = {};
  if (orientation === "horizontal") {
    result.flexDirection = reverse ? "row-reverse" : "row";
    if (horizontalAlignment) {
      result.justifyContent = horizontalAlignment;
    }
    if (verticalAlignment) {
      result.alignItems = verticalAlignment;
    }
  } else if (orientation === "vertical") {
    result.flexDirection = reverse ? "column-reverse" : "column";
    if (horizontalAlignment) {
      result.alignItems = horizontalAlignment;
    }
    if (verticalAlignment) {
      result.justifyContent = verticalAlignment;
    }
  }
  return result;
};

export const stackComponentRenderer = createComponentRenderer(
  COMP,
  StackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    const orientation = extractValue(node.props?.orientation) || DEFAULT_ORIENTATION;
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      className,
      orientation,
      horizontalAlignment,
      verticalAlignment,
      lookupEventHandler,
      renderChild,
    });
  },
  {
    stylePropsResolver: StackStyleResolver,
  },
);

export const vStackComponentRenderer = createComponentRenderer(
  "VStack",
  VStackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      className,
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
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    return renderStack({
      node,
      extractValue,
      className,
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
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return renderStack({
      node,
      extractValue,
      className,
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
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return renderStack({
      node,
      extractValue,
      className,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
      horizontalAlignment: "center",
      verticalAlignment: "center",
    });
  },
);
