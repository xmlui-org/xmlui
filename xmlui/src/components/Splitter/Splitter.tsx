import type React from "react";

import styles from "./Splitter.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import type { ValueExtractor, LookupEventHandlerFn } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { OrientationOptions } from "../abstractions";
import { dComponent } from "../metadata-helpers";
import { Splitter } from "./SplitterNative";

const COMP = "Splitter";

const baseSplitterMd = createMetadata({
  description:
    `The \`${COMP}\` component divides a container (such as a window, panel, pane, etc.) ` +
    `into two resizable sections.`,
  props: {
    swapped: {
      description:
        `This optional booelan property indicates whether the \`${COMP}\` sections are layed out as ` +
        `primary and secondary (\`false\`) or secondary and primary (\`true\`) from left to right.`,
      valueType: "boolean",
      defaultValue: false,
    },
    splitterTemplate: dComponent(
      `The divider can be customized using XMLUI components via this property.`,
    ),
    initialPrimarySize: {
      description:
        `This optional number property sets the initial size of the primary section. The unit of ` +
        `the size value is in pixels or percentages.`,
      valueType: "string",
      defaultValue: "50%",
    },
    minPrimarySize: {
      description:
        `This property sets the minimum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages.`,
      valueType: "string",
      defaultValue: "0%",
    },
    maxPrimarySize: {
      description:
        `This property sets the maximum size the primary section can have. The unit of the size ` +
        `value is in pixels or percentages.`,
      valueType: "string",
      defaultValue: "100%",
    },
    floating: {
      description:
        `Toggles whether the resizer is visible (\`false\`) or not (\`true\`) when not hovered ` +
        `or dragged. The default value is \`false\`, meaning the resizer is visible all the time.`,
      valueType: "boolean",
      defaultValue: false,
    },
    orientation: {
      description:
        `Sets whether the \`Splitter\` divides the container horizontally and lays out the ` +
        `section on top of each other (\`vertical\`), or vertically by placing the sections ` +
        `next to each other (\`horizontal\`).`,
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "vertical",
    },
  },
  events: {
    resize: d(`This event fires when the component is resized.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-resizer-${COMP}`]: "$backgroundColor-Card",
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
  layoutCss: React.CSSProperties;
  renderChild: RenderChildFn;
  orientation?: OrientationOptions;
  lookupEventHandler: LookupEventHandlerFn<typeof SplitterMd>;
};

const DEFAULT_ORIENTATION = "vertical";

function renderSplitter({
  node,
  extractValue,
  layoutCss,
  renderChild,
  lookupEventHandler,
  orientation = extractValue(node.props.orientation) ?? DEFAULT_ORIENTATION,
}: RenderSplitterPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }
  return (
    <Splitter
      style={layoutCss}
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
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      renderChild,
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const vSplitterComponentRenderer = createComponentRenderer(
  "VSplitter",
  VSplitterMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      renderChild,
      orientation: "vertical",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);

export const hSplitterComponentRenderer = createComponentRenderer(
  "HSplitter",
  HSplitterMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      renderChild,
      orientation: "horizontal",
      lookupEventHandler: lookupEventHandler as any,
    });
  },
);
