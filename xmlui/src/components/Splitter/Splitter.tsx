import React, { useMemo } from "react";

import styles from "./Splitter.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { type ComponentDef } from "../../abstractions/ComponentDefs";
import type { ValueExtractor, LookupEventHandlerFn } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { OrientationOptions } from "../abstractions";
import { createMetadata, d, dComponent } from "../metadata-helpers";
import { Splitter, defaultProps } from "./SplitterNative";

const COMP = "Splitter";

const baseSplitterMd = createMetadata({
  status: "stable",
  description:
    "`Splitter` component divides a container into two resizable sections. These " +
    "are are identified by their names: primary and secondary. They have a " +
    "draggable bar between them. When only a single child is visible (due to " +
    "conditional rendering with `when` attributes), the splitter bar is not " +
    "displayed and the single panel stretches to fill the entire viewport of " +
    "the splitter container.",
  props: {
    swapped: {
      description:
        `This optional booelan property indicates whether the \`${COMP}\` sections are layed out as ` +
        `primary and secondary (\`false\`) or secondary and primary (\`true\`) from left to right.`,
      valueType: "boolean",
      defaultValue: defaultProps.swapped,
    },
    splitterTemplate: dComponent(
      `The divider can be customized using XMLUI components via this property.`,
    ),
    initialPrimarySize: {
      description:
        `This optional number property sets the initial size of the primary section. The unit of ` +
        `the size value is in pixels or percentages.`,
      valueType: "string",
      defaultValue: defaultProps.initialPrimarySize,
    },
    minPrimarySize: {
      description:
        `This property sets the minimum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages.`,
      valueType: "string",
      defaultValue: defaultProps.minPrimarySize,
    },
    maxPrimarySize: {
      description:
        `This property sets the maximum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages. Negative values are supported and calculate from the ` +
        `end of the container (e.g., "-20%" means "80% of container", "-100px" means "container size - 100px").`,
      valueType: "string",
      defaultValue: defaultProps.maxPrimarySize,
    },
    floating: {
      description:
        `Toggles whether the resizer is visible (\`false\`) or not (\`true\`) when not hovered ` +
        `or dragged. The default value is \`false\`, meaning the resizer is visible all the time.`,
      valueType: "boolean",
      defaultValue: defaultProps.floating,
    },
    orientation: {
      description:
        `Sets whether the \`Splitter\` divides the container horizontally and lays out the ` +
        `section on top of each other (\`vertical\`), or vertically by placing the sections ` +
        `next to each other (\`horizontal\`).`,
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
  },
  events: {
    resize: d(`This event fires when the component is resized.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-resizer-${COMP}`]: "$color-surface-100",
    [`thickness-resizer-${COMP}`]: "5px",
    [`cursor-resizer-horizontal-${COMP}`]: "ew-resize",
    [`cursor-resizer-vertical-${COMP}`]: "ns-resize",
  },
});

export const SplitterMd = {
  ...baseSplitterMd,
  props: {
    ...baseSplitterMd.props,
  },
};

export const HSplitterMd = { ...baseSplitterMd, specializedFrom: COMP };
export const VSplitterMd = { ...baseSplitterMd, specializedFrom: COMP };

type SplitterComponentDef = ComponentDef<typeof SplitterMd>;
type VSplitterComponentDef = ComponentDef<typeof VSplitterMd>;
type HSplitterComponentDef = ComponentDef<typeof HSplitterMd>;

type RenderSplitterPars = {
  node: SplitterComponentDef | VSplitterComponentDef | HSplitterComponentDef;
  extractValue: ValueExtractor;
  className: string | undefined;
  renderChild: RenderChildFn;
  orientation?: OrientationOptions;
  lookupEventHandler: LookupEventHandlerFn<typeof SplitterMd>;
};

const DEFAULT_ORIENTATION = "vertical";

function renderSplitter({
  node,
  extractValue,
  className,
  renderChild,
  lookupEventHandler,
  orientation = extractValue(node.props.orientation) ?? DEFAULT_ORIENTATION,
}: RenderSplitterPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }

  // Let XMLUI handle the conditional rendering, then count the non-null results
  const renderedChildren = useMemo(() => {
    if (!Array.isArray(node.children)) {
      const rendered = renderChild(node.children);
      return rendered ? [rendered] : [];
    }
    
    return node.children
      .map((child, index) => renderChild(child))
      .filter(child => child !== null && child !== undefined)
      .map((child, index) => React.cloneElement(child as React.ReactElement, { key: index }));
  }, [node.children, renderChild]);

  const visibleChildCount = renderedChildren.length;

  return (
    <Splitter
      className={className}
      swapped={extractValue.asOptionalBoolean(node.props?.swapped)}
      orientation={orientation}
      splitterTemplate={renderChild(node.props?.splitterTemplate)}
      initialPrimarySize={extractValue(node.props?.initialPrimarySize)}
      minPrimarySize={extractValue(node.props?.minPrimarySize)}
      maxPrimarySize={extractValue(node.props?.maxPrimarySize)}
      floating={extractValue.asOptionalBoolean(node.props?.floating)}
      resize={lookupEventHandler("resize")}
      visibleChildCount={visibleChildCount}
    >
      {renderedChildren}
    </Splitter>
  );
}

export const splitterComponentRenderer = createComponentRenderer(
  COMP,
  SplitterMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      className,
      renderChild,
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const vSplitterComponentRenderer = createComponentRenderer(
  "VSplitter",
  VSplitterMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      className,
      renderChild,
      orientation: "vertical",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const hSplitterComponentRenderer = createComponentRenderer(
  "HSplitter",
  HSplitterMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      className,
      renderChild,
      orientation: "horizontal",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);
