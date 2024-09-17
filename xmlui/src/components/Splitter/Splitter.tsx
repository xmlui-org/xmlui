import { createComponentRenderer } from "@components-core/renderers";
import React from "react";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { isComponentDefChildren } from "@components-core/utils/misc";
import { NotAComponentDefError } from "@components-core/EngineError";
import { ComponentDefNew, createMetadata, d } from "@abstractions/ComponentDefs";
import styles from "./Splitter.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import type {
  NonCssLayoutProps,
  ValueExtractor,
  LookupEventHandlerFn,
} from "@abstractions/RendererDefs";
import { Splitter } from "./SplitterNative";
import { OrientationOptions } from "@components/abstractions";
import { dComponent } from "@components/metadata-helpers";

const COMP = "Splitter";

const splitterMd = createMetadata({
  description:
    `The \`${COMP}\` component divides a container (such as a window, panel, pane, etc.) ` +
    `into two resizable sections.`,
  props: {
    swapped: d(
      `This optional booelan property indicates whether the \`${COMP}\` sections are layed out as ` +
        `primary and secondary (\`false\`) or secondary and primary (\`true\`) from left to right.`,
    ),
    splitterTemplate: dComponent(
      `The divider can be customized using XMLUI components via this property.`,
    ),
    initialPrimarySize: d(
      `This optional number property sets the initial size of the primary section. The unit of ` +
        `the size value is in pixels or percentages.`,
    ),
    minPrimarySize: d(
      `This property sets the minimum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages.`,
    ),
    maxPrimarySize: d(
      `This property sets the maximum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages.`,
    ),
    floating: d(
      `Toggles whether the resizer is visible (\`false\`) or not (\`true\`) when not hovered ` +
        `or dragged. The default value is \`false\`, meaning the resizer is visible all the time.`,
    ),
  },
  events: {
    resize: d(`This event fires when the component is resized.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-resizer-${COMP}`]: "$color-bg-Card",
    [`thickness-resizer-${COMP}`]: "5px",
    [`cursor-resizer-horizontal-${COMP}`]: "ew-resize",
    [`cursor-resizer-vertical-${COMP}`]: "ns-resize",
  },
});

export const SplitterMd = {
  ...splitterMd,
  props: {
    ...splitterMd.props,
    orientation: d(
      `Sets whether the \`Splitter\` divides the container horizontally and lays out the ` +
        `section on top of each other (\`vertical\`), or vertically by placing the sections ` +
        `next to each other (\`horizontal\`).`,
    ),
  },
};

export const HSplitterMd = { ...splitterMd };
export const VSplitterMd = { ...splitterMd };

type SplitterComponentDef = ComponentDefNew<typeof SplitterMd>;
type VSplitterComponentDef = ComponentDefNew<typeof VSplitterMd>;
type HSplitterComponentDef = ComponentDefNew<typeof HSplitterMd>;

type RenderSplitterPars = {
  node: SplitterComponentDef | VSplitterComponentDef | HSplitterComponentDef;
  layoutNonCss: NonCssLayoutProps;
  extractValue: ValueExtractor;
  layoutCss: React.CSSProperties;
  renderChild: RenderChildFn;
  orientation?: OrientationOptions;
  lookupEventHandler: LookupEventHandlerFn<typeof SplitterMd>;
};

const DEFAULT_ORIENTATION = "vertical";

function renderSplitter({
  node,
  extractValue,
  layoutNonCss,
  layoutCss,
  renderChild,
  lookupEventHandler ,
  orientation = (layoutNonCss.orientation as OrientationOptions) ?? DEFAULT_ORIENTATION,
}: RenderSplitterPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }
  return (
    <Splitter
      layout={layoutCss}
      swapped={extractValue.asOptionalBoolean(node.props?.swapped)}
      orientation={orientation}
      splitterTemplate={renderChild(node.props?.splitterTemplate)}
      initialPrimarySize={extractValue(node.props?.initialPrimarySize)}
      minPrimarySize={extractValue(node.props?.minPrimarySize)}
      maxPrimarySize={extractValue(node.props?.maxPrimarySize)}
      floating={extractValue.asOptionalBoolean(node.props?.floating)}
      resize={lookupEventHandler("resize")}
    >
      {renderChild(node.children)}
    </Splitter>
  );
}

export const splitterComponentRenderer = createComponentRenderer(
  COMP,
  SplitterMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const vSplitterComponentRenderer = createComponentRenderer(
  "VSplitter",
  VSplitterMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      orientation: "vertical",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const hSplitterComponentRenderer = createComponentRenderer(
  "HSplitter",
  HSplitterMd,
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      orientation: "horizontal",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);
