import { createComponentRenderer } from "@components-core/renderers";
import React, { useEffect, useState, useMemo } from "react";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { isComponentDefChildren } from "@components-core/utils/misc";
import { NotAComponentDefError } from "@components-core/EngineError";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import styles from "./Splitter.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { noop } from "@components-core/constants";
import { parseScssVar } from "@components-core/theming/themeVars";
import { parseSize, toPercentage } from "@components/Splitter/utils";
import type { NonCssLayoutProps, ValueExtractor, LookupEventHandlerFn } from "@abstractions/RendererDefs";

// ====================================================================================================================
// Splitter component implementation

export type SplitProps = {
  /**
   * The children to display in the splitter.
   */
  children: React.ReactNode[] | React.ReactNode;

  /**
   * The layout of the splitter.
   */
  layout?: React.CSSProperties;

  /**
   * The template to display in the splitter.
   */
  splitterTemplate?: React.ReactNode;

  /**
   * The orientation of the splitter.
   * The default is "horizontal".
   */
  orientation?: Orientation;

  /**
   * Whether the splitter is floating.
   */
  floating?: boolean;

  /**
   * A callback that is called when the splitter is resized.
   */
  resize?: (sizes: [number, number]) => void;

  /**
   * Whether the primary and secondary panes are swapped.
   */
  swapped?: boolean;
  /**
   * The initial width/height of the left/top pane.
   * Width is specified as a CSS unit (e.g. %, fr, px).
   * The default is 50%.
   */
  initialPrimarySize?: string;
  /**
   * The preferred minimum width/height of the left/top pane.
   * Specified as a CSS unit (e.g. %, fr, px).
   * The default is 0.
   */
  minPrimarySize?: string;
  /**
   * The preferred maximum width/height of the left/top pane.
   */
  maxPrimarySize?: string;
};

export const Splitter = ({
  initialPrimarySize = "50%",
  minPrimarySize = "0%",
  maxPrimarySize = "100%",
  orientation = "vertical",
  children,
  layout,
  swapped = false,
  floating = false,
  splitterTemplate,
  resize = noop,
}: SplitProps) => {
  const panels = useMemo(
    () => (swapped ? React.Children.toArray(children).reverse() : React.Children.toArray(children)),
    [children, swapped]
  );
  const [size, setSize] = useState(0);
  const [splitter, setSplitter] = useState<HTMLDivElement | null>(null);
  const [resizerVisible, setResizerVisible] = useState(false);
  const [resizer, setResizer] = useState<HTMLDivElement | null>(null);
  const [floatingResizer, setFloatingResizer] = useState<HTMLDivElement | null>(null);
  const resizerElement = useMemo(() => (floating ? floatingResizer : resizer), [floating, resizer, floatingResizer]);

  useEffect(() => {
    if (splitter) {
      const containerSize =
        orientation === "horizontal" ? splitter.getBoundingClientRect().width : splitter.getBoundingClientRect().height;
      const initialParsedSize = parseSize(initialPrimarySize, containerSize);
      setSize(initialParsedSize);
      if (resize) {
        resize([
          toPercentage(initialParsedSize, containerSize),
          toPercentage(containerSize - initialParsedSize, containerSize),
        ]);
      }
    }
  }, [initialPrimarySize, orientation, resize, splitter]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (splitter && resizerElement) {
        const containerSize =
          orientation === "horizontal"
            ? splitter.getBoundingClientRect().width
            : splitter.getBoundingClientRect().height;
        const newSize =
          orientation === "horizontal"
            ? Math.min(
                Math.max(
                  event.clientX - splitter.getBoundingClientRect().left,
                  parseSize(minPrimarySize, containerSize)
                ),
                parseSize(maxPrimarySize, containerSize)
              )
            : Math.min(
                Math.max(
                  event.clientY - splitter.getBoundingClientRect().top,
                  parseSize(minPrimarySize, containerSize)
                ),
                parseSize(maxPrimarySize, containerSize)
              );
        setSize(newSize);
        if (resize) {
          resize([toPercentage(newSize, containerSize), toPercentage(containerSize - newSize, containerSize)]);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    if (resizerElement) {
      resizerElement.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (resizerElement) {
        resizerElement.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minPrimarySize, maxPrimarySize, orientation, resize, floating, resizerElement, splitter]);

  useEffect(() => {
    const watchResizer = (event: MouseEvent) => {
      const cursorPosition = orientation === "horizontal" ? event.clientX : event.clientY;
      if (splitter) {
        const paneStart =
          orientation === "horizontal" ? splitter.getBoundingClientRect().left : splitter.getBoundingClientRect().top;
        const resizerPosition = paneStart + size;
        // Check if the cursor is near the resizer (within 20 pixels)
        if (cursorPosition > resizerPosition - 20 && cursorPosition < resizerPosition + 20) {
          setResizerVisible(true);
        } else {
          setResizerVisible(false);
        }
      }
    };

    if (splitter) {
      splitter.addEventListener("mousemove", watchResizer);
      splitter.addEventListener("mouseleave", () => setResizerVisible(false));
    }

    return () => {
      if (splitter) {
        splitter.removeEventListener("mouseleave", () => setResizerVisible(false));
        splitter.removeEventListener("mousemove", watchResizer);
      }
    };
  }, [size, orientation, splitter]);

  useEffect(() => {
    if (floatingResizer) {
      floatingResizer.style.opacity = resizerVisible ? "1" : "0";
    }
  }, [floatingResizer, resizerVisible]);

  return (
    <div
      ref={(s) => setSplitter(s)}
      className={classnames(styles.splitter, {
        [styles.horizontal]: orientation === "horizontal",
        [styles.vertical]: orientation === "vertical",
      })}
      style={layout}
    >
      {panels.length > 1 ? (
        <>
          <div style={{ flexBasis: size }} className={styles.primaryPanel}>
            {panels[0]}
          </div>
          {!floating && (
            <div
              className={classnames(styles.resizer, {
                [styles.horizontal]: orientation === "horizontal",
                [styles.vertical]: orientation === "vertical",
              })}
              ref={(r) => setResizer(r)}
            >
              {splitterTemplate}
            </div>
          )}
          <div className={styles.secondaryPanel}>{panels[1]}</div>
          {floating && (
            <div
              ref={(fr) => setFloatingResizer(fr)}
              className={classnames(styles.floatingResizer, {
                [styles.horizontal]: orientation === "horizontal",
                [styles.vertical]: orientation === "vertical",
              })}
              style={{
                top: orientation === "horizontal" ? 0 : size,
                left: orientation === "horizontal" ? size : 0,
              }}
            >
              {splitterTemplate}
            </div>
          )}
        </>
      ) : (
        <>{panels?.[0] && <div className={styles.panel}>{panels[0]}</div>}</>
      )}
    </div>
  );
};

// =====================================================================================================================
// Splitter definition

/**
 * This interface describes an AppEngine Splitter component.
 */

type Orientation = "horizontal" | "vertical";

const metadata: ComponentDescriptor<SplitterComponentDef> = {
  displayName: "Splitter",
  description: "A component displaying its children in a card",
  props: {
    orientation: desc("The orientation of the splitter"),
    swapped: desc("Whether the primary and secondary panes are swapped"),
    splitterTemplate: desc("The template to display in the splitter"),
    initialPrimarySize: desc("The initial width/height of the primary pane"),
    minPrimarySize: desc("The minimum width/height of the primary pane"),
    maxPrimarySize: desc("The maximum width/height of the primary pane"),
    floating: desc("Whether the splitter is invisible"),
  },
  events: {
    resize: desc("Fires when the splitter is resized"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-resizer-Splitter": "$color-bg-Card",
    "thickness-resizer-Splitter": "5px",
    "cursor-resizer-horizontal-Splitter": "ew-resize",
    "cursor-resizer-vertical-Splitter": "ns-resize",
  },
};

interface SplitterComponentDefContent <T extends string> extends ComponentDef<T> {
  props: {
    orientation?: Orientation;
    swapped?: boolean;
    splitterTemplate?: ComponentDef;
    initialPrimarySize?: string;
    minPrimarySize?: string;
    maxPrimarySize?: string;
    floating?: boolean;
  };
  events: {
    resize?: string;
  };
}

// TEMP: Need a way to handle type unions and parent types
/**
 * The \`Splitter\` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.
 * These sections are identified by their name: primary and secondary.
 * The sections are divided by a draggable and styleable divider.
 * 
 * Most properties of the component focus on the primary section (e.g. sizing).
 * 
 * See also: [\`HSplitter\`](./HSplitter.mdx), [\`VSplitter\`](./VSplitter.mdx).
 */
export interface SplitterComponentDef extends ComponentDef<"Splitter"> {
  props: {
    /**
     * Sets whether the \`Splitter\` divides the container horizontally and lays out the section on top of each other (\`vertical\`),
     * or vertically by placing the sections next to each other (\`horizontal\`).
     * The default value is \`vertical\`.
     * @descriptionRef
     */
    orientation?: Orientation;
    /**
     * This optional booelan property indicates whether the \`Splitter\` sections are layed out as primary and secondary (\`false\`)
     * or secondary and primary (\`true\`) from left to right.
     * @descriptionRef
     */
    swapped?: boolean;
    /**
     * The divider can be customized using XMLUI components via this property.
     * @descriptionRef
     */
    splitterTemplate?: ComponentDef;
    /** 
     * This optional number property sets the initial size of the primary section.
     * The unit of the size value is in pixels or percentages.
     * @descriptionRef
     */
    initialPrimarySize?: string;
    /**
     * This property sets the minimum size the primary section can have.
     * The unit of the size value is in pixels or percentages.
     * @descriptionRef
     */
    minPrimarySize?: string;
    /**
     * This property sets the maximum size the primary section can have.
     * The unit of the size value is in pixels or percentages.
     * @descriptionRef
     */
    maxPrimarySize?: string;
    /**
     * Toggles whether the resizer is visible (\`false\`) or not (\`true\`) when not hovered or dragged.
     * The default value is \`false\`, meaning the resizer is visible all the time.
     * @descriptionRef
     */
    floating?: boolean;
  };
  events: {
    /** 
     * This event fires when the component is resized.
     * @descriptionRef
     */
    resize?: string;
  };
}

/** @specialized */
export interface VSplitterComponentDef extends SplitterComponentDefContent<"VSplitter"> {}
/** @specialized */
export interface HSplitterComponentDef extends SplitterComponentDefContent<"HSplitter"> {}

type RenderSplitterPars = {
  node: SplitterComponentDef | VSplitterComponentDef | HSplitterComponentDef;
  layoutNonCss: NonCssLayoutProps;
  extractValue: ValueExtractor;
  layoutCss: React.CSSProperties;
  renderChild: RenderChildFn;
  orientation?: Orientation;
  lookupEventHandler: LookupEventHandlerFn;
};

const DEFAULT_ORIENTATION = "vertical";

function renderSplitter({
  node,
  extractValue,
  layoutNonCss,
  layoutCss,
  renderChild,
  lookupEventHandler,
  orientation = (layoutNonCss.orientation as Orientation) ?? DEFAULT_ORIENTATION,
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

export const splitterComponentRenderer = createComponentRenderer<SplitterComponentDef>(
  "Splitter",
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      lookupEventHandler,
    });
  },
  metadata
);

export const vSplitterComponentRenderer = createComponentRenderer<VSplitterComponentDef>(
  "VSplitter",
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      orientation: "vertical",
      lookupEventHandler,
    });
  },
  metadata
);

export const hSplitterComponentRenderer = createComponentRenderer<HSplitterComponentDef>(
  "HSplitter",
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderSplitter({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      renderChild,
      orientation: "horizontal",
      lookupEventHandler,
    });
  },
  metadata
);
