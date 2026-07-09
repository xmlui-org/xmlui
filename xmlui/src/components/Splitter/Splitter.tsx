import React, { useMemo } from "react";

import styles from "./Splitter.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { type ComponentDef } from "../../abstractions/ComponentDefs";
import type { ValueExtractor, LookupEventHandlerFn } from "../../abstractions/RendererDefs";
import { wrapComponent } from "../../components-core/wrapComponent";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { OrientationOptions } from "../abstractions";
import { createMetadata, dComponent } from "../metadata-helpers";
import { defaultProps, type SplitterResizeMode } from "./Splitter.defaults";
import { Splitter } from "./SplitterReact";

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
  parts: {
    primaryPanel: {
      description: "The primary section/panel of the `Splitter` component.",
    },
    secondaryPanel: {
      description: "The secondary section/panel of the `Splitter` component.",
    },
  },
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
    resizeMode: {
      description:
        `Sets how the \`${COMP}\` adjusts its panel sizes when the splitter container itself is resized. ` +
        `\`preserveRatio\` keeps the current primary/secondary ratio, \`preservePrimary\` keeps the ` +
        `primary panel size and resizes the secondary panel, and \`preserveSecondary\` keeps the ` +
        `secondary panel size and resizes the primary panel. Minimum and maximum primary panel size ` +
        `constraints are still applied.`,
      valueType: "string",
      availableValues: ["preserveRatio", "preservePrimary", "preserveSecondary"],
      isStrictEnum: true,
      defaultValue: defaultProps.resizeMode,
    },
    orientation: {
      description:
        `Sets whether the \`Splitter\` divides the container horizontally and lays out the ` +
        `section on top of each other (\`vertical\`), or vertically by placing the sections ` +
        `next to each other (\`horizontal\`).`,
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      defaultValue: defaultProps.orientation,
    },
  },
  events: {
    resize: {
      description: `This event fires when the component is resized.`,
      signature: "resize(primarySize: number): void",
      parameters: {
        primarySize: "The new size of the primary panel in pixels.",
      },
    },
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
  classes: Record<string, string> | undefined;
  renderChild: RenderChildFn;
  orientation?: OrientationOptions;
  lookupEventHandler: LookupEventHandlerFn<typeof SplitterMd>;
};

const DEFAULT_ORIENTATION = "vertical";

function SplitterRenderer({
  node,
  extractValue,
  classes,
  renderChild,
  lookupEventHandler,
  orientation = extractValue(node.props.orientation) ?? DEFAULT_ORIENTATION,
}: RenderSplitterPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }

  // Let XMLUI handle the conditional rendering, then count the non-null results
  const renderedChildren = useMemo(() => {
    const layoutContext = {
      type: "Stack" as const,
      orientation,
    };

    if (!Array.isArray(node.children)) {
      const rendered = renderChild(node.children, layoutContext);
      return rendered ? [rendered] : [];
    }

    return node.children
      .map((child) => renderChild(child, layoutContext))
      .filter((child) => child !== null && child !== undefined)
      .map((child, index) => React.cloneElement(child as React.ReactElement, { key: index }));
  }, [node.children, renderChild, orientation]);

  const visibleChildCount = renderedChildren.length;

  return (
    <Splitter
      classes={classes}
      swapped={extractValue.asOptionalBoolean(node.props?.swapped)}
      orientation={orientation}
      splitterTemplate={renderChild(node.props?.splitterTemplate)}
      initialPrimarySize={extractValue(node.props?.initialPrimarySize)}
      minPrimarySize={extractValue(node.props?.minPrimarySize)}
      maxPrimarySize={extractValue(node.props?.maxPrimarySize)}
      resizeMode={
        extractValue.asOptionalString(
          node.props?.resizeMode,
          defaultProps.resizeMode,
        ) as SplitterResizeMode
      }
      floating={extractValue.asOptionalBoolean(node.props?.floating)}
      resize={lookupEventHandler("resize")}
      visibleChildCount={visibleChildCount}
    >
      {renderedChildren}
    </Splitter>
  );
}

export const splitterComponentRenderer = wrapComponent(COMP, Splitter, SplitterMd, {
  customRender: (_props, { node, extractValue, renderChild, classes, lookupEventHandler }) =>
    SplitterRenderer({
      node,
      extractValue,
      classes,
      renderChild,
      lookupEventHandler: lookupEventHandler as any,
    }),
});

export const vSplitterComponentRenderer = wrapComponent("VSplitter", Splitter, VSplitterMd, {
  customRender: (_props, { node, extractValue, renderChild, classes, lookupEventHandler }) =>
    SplitterRenderer({
      node,
      extractValue,
      classes,
      renderChild,
      orientation: "vertical",
      lookupEventHandler: lookupEventHandler as any,
    }),
});

export const hSplitterComponentRenderer = wrapComponent("HSplitter", Splitter, HSplitterMd, {
  customRender: (_props, { node, extractValue, renderChild, classes, lookupEventHandler }) =>
    SplitterRenderer({
      node,
      extractValue,
      classes,
      renderChild,
      orientation: "horizontal",
      lookupEventHandler: lookupEventHandler as any,
    }),
});

import type { CSSProperties } from "react";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useEvent } from "../../components-core/utils/misc";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { responsiveBreakpoints } from "../../styling";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

function splitterRuntimeRendererFor(
  name: "Splitter" | "HSplitter" | "VSplitter",
  metadata: ComponentMetadata,
) {
  return wrapRuntimeComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      const componentType = adapter.node.type;
      const orientation = name === "HSplitter" || componentType === "HSplitter"
        ? "horizontal"
        : name === "VSplitter" || componentType === "VSplitter"
          ? "vertical"
          : adapter.stringProp("orientation", defaultProps.orientation);
      const resolvedOrientation = orientation === "horizontal" ? "horizontal" : "vertical";
      const visibleChildren = useVisibleSplitterChildren(adapter.node.children, adapter.scope);
      const rootStyle = splitterRootStyle(rootAttrs.style as CSSProperties | undefined);
      const resizeEvent = adapter.events.resize;
      const resizeHandler = useEvent((primarySize: number) => {
        void resizeEvent?.(primarySize);
      });
      return (
        <Splitter
          {...rootAttrs}
          style={rootStyle}
          orientation={resolvedOrientation}
          swapped={adapter.booleanProp("swapped", defaultProps.swapped)}
          splitterTemplate={adapter.renderTemplate("splitterTemplate")}
          initialPrimarySize={adapter.stringProp("initialPrimarySize", defaultProps.initialPrimarySize)}
          minPrimarySize={adapter.stringProp("minPrimarySize", defaultProps.minPrimarySize)}
          maxPrimarySize={adapter.stringProp("maxPrimarySize", defaultProps.maxPrimarySize)}
          resizeMode={
            adapter.stringProp("resizeMode", defaultProps.resizeMode) as SplitterResizeMode
          }
          floating={adapter.booleanProp("floating", defaultProps.floating)}
          resize={resizeEvent ? resizeHandler : undefined}
          classes={{ [COMPONENT_PART_KEY]: adapter.className }}
          visibleChildCount={visibleChildren.length}
        >
          {adapter.context.renderChildren(
            visibleChildren,
            adapter.scope,
            adapter.node.range.end,
            { type: "Stack", orientation: resolvedOrientation },
          )}
        </Splitter>
      );
    },
  });
}

function splitterRootStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return style;
  }
  const { display: _display, flexDirection: _flexDirection, ...rest } = style;
  return rest;
}

export const splitterRenderer = splitterRuntimeRendererFor("Splitter", SplitterMd as ComponentMetadata);
export const hSplitterRenderer = splitterRuntimeRendererFor("HSplitter", HSplitterMd as ComponentMetadata);
export const vSplitterRenderer = splitterRuntimeRendererFor("VSplitter", VSplitterMd as ComponentMetadata);

const responsiveWhenPropNames = [
  "when-xs",
  "when-sm",
  "when-md",
  "when-lg",
  "when-xl",
  "when-xxl",
] as const;

const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

type ResponsiveWhenPropName = (typeof responsiveWhenPropNames)[number];
type BreakpointName = (typeof breakpointOrder)[number];

function useVisibleSplitterChildren(children: XmluiNode[], scope: any): XmluiNode[] {
  const breakpoint = useCurrentBreakpoint();
  const nonPropertyChildren = children.filter((child) =>
    !(child.kind === "element" && child.type === "property")
  );
  const dependencies = nonPropertyChildren.flatMap((child) => {
    if (child.kind !== "element") {
      return [];
    }
    return [
      ...(child.parsed?.props?.when?.dependencies ?? []),
      ...(child.parsed?.props?.if?.dependencies ?? []),
      ...responsiveWhenPropNames.flatMap((name) =>
        child.parsed?.props?.[name]?.dependencies ?? []
      ),
    ];
  });
  useBindingRevision(dependencies, scope);
  return nonPropertyChildren.filter((child) =>
    child.kind !== "element" || resolveSplitterWhen(child, scope, breakpoint)
  );
}

function resolveSplitterWhen(
  node: Extract<XmluiNode, { kind: "element" }>,
  scope: any,
  breakpoint: BreakpointName,
): boolean {
  const responsiveValues = Object.fromEntries(
    responsiveWhenPropNames
      .filter((name) => Object.prototype.hasOwnProperty.call(node.props, name))
      .map((name) => [name.slice("when-".length), evaluateSplitterWhenValue(node, scope, name)]),
  ) as Partial<Record<BreakpointName, boolean>>;

  if (Object.keys(responsiveValues).length === 0) {
    return evaluateSplitterWhenValue(node, scope, "when") ??
      evaluateSplitterWhenValue(node, scope, "if") ??
      true;
  }

  const currentIndex = breakpointOrder.indexOf(breakpoint);
  for (let index = currentIndex; index >= 0; index -= 1) {
    const value = responsiveValues[breakpointOrder[index]];
    if (value !== undefined) {
      return value;
    }
  }

  const baseValue = Object.prototype.hasOwnProperty.call(node.props, "when")
    ? evaluateSplitterWhenValue(node, scope, "when")
    : Object.prototype.hasOwnProperty.call(node.props, "if")
      ? evaluateSplitterWhenValue(node, scope, "if")
      : undefined;
  if (baseValue !== undefined) {
    return baseValue;
  }

  const firstResponsiveValue = breakpointOrder
    .map((name) => responsiveValues[name])
    .find((value) => value !== undefined);
  return firstResponsiveValue === undefined ? true : !firstResponsiveValue;
}

function evaluateSplitterWhenValue(
  node: Extract<XmluiNode, { kind: "element" }>,
  scope: any,
  name: "when" | "if" | ResponsiveWhenPropName,
): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(node.props, name)) {
    return undefined;
  }
  const value = evaluateExpressionOrText(
    node.props[name],
    node.parsed?.props?.[name],
    scope,
    `${node.type}:${name}`,
  );
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "false") {
      return false;
    }
    if (normalized === "true") {
      return true;
    }
  }
  return Boolean(value);
}

function useCurrentBreakpoint(): BreakpointName {
  const [breakpoint, setBreakpoint] = React.useState(currentBreakpoint);
  React.useEffect(() => {
    const update = () => setBreakpoint(currentBreakpoint());
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);
  return breakpoint;
}

function currentBreakpoint(): BreakpointName {
  if (typeof window === "undefined") {
    return "xl";
  }
  const width = window.innerWidth;
  if (width >= responsiveBreakpoints.xxl) return "xxl";
  if (width >= responsiveBreakpoints.xl) return "xl";
  if (width >= responsiveBreakpoints.lg) return "lg";
  if (width >= responsiveBreakpoints.md) return "md";
  if (width >= responsiveBreakpoints.sm) return "sm";
  return "xs";
}
