import { type CSSProperties, type MouseEventHandler, type ReactNode, type Ref, useCallback } from "react";
import type React from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./Stack.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { isComponentDefChildren } from "@components-core/utils/misc";
import { useContentAlignment } from "@components-core/component-hooks";
import { NotAComponentDefError } from "@components-core/EngineError";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { useOnMount } from "@components-core/utils/hooks";
import type { NonCssLayoutProps, ValueExtractor } from "@abstractions/RendererDefs";

// =====================================================================================================================
// XMLUI Stack component definition

export interface StackComponentDefContent {
  props: {
    reverse?: boolean;
    hoverContainer?: string;
    visibleOnHover?: string;
  };
  events: {
    click: string;
    mounted: string;
  };
}

/**
 * \`Stack\` is a layout container displaying children in a horizontal or vertical stack.
 *
 * The Stack component is the primary and most versatile building block for laying out content. It 
 * can display its children horizontally or vertically, and it is possible to align its children 
 * easily along the horizontal and vertical axes.
 *
 * See also: [HStack](./HStack), [VStack](./VStack), [CHStack](./CHStack), [CVStack](./CVStack).
 *
 * > **Note**: You can learn about the semantics and usage of layout container, including \`Stack\`, 
 * [here](/learning/layout-components).

 */
export interface StackComponentDef extends ComponentDef<"Stack"> {
  props: {
    /** @descriptionRef */
    gap?: string;
    /** @descriptionRef */
    horizontalAlignment?: string;
    /**
     * An optional property that governs the Stack's [orientation](./appearance/common-units/#orientation)
     *  (whether the Stack lays out its children in a row or a column).
     *
     * \`orientation\` is an oft-used prop, there are shorthand versions of the Stack component: [
     * HStack](./HStack) (\`Stack\` with horizontal orientation), [VStack](./VStack) (\`Stack\` with 
     * vertical orientation).
     */
    orientation?: string;
    /** @descriptionRef */
    verticalAlignment?: string;
    /** @descriptionRef */
    wrapContent?: boolean;
    /** @descriptionRef */
    reverse?: boolean;
    /**
     * Reserved for future use.
     */
    hoverContainer?: string;
    /**
     * Reserved for future use.
     */
    visibleOnHover?: string;
  };
  events: {
    /** @descriptionRef */
    click: string;
    /**
     * Reserved for future use.
     */
    mounted: string;
  };
}

/** @specialized */
export type VStackComponentDef = StackComponentDefContent & ComponentDef<"VStack">;
/** @specialized */
export type HStackComponentDef = StackComponentDefContent & ComponentDef<"HStack">;
/** @specialized */
export type CVStackComponentDef = StackComponentDefContent & ComponentDef<"CVStack">;
/** @specialized */
export type CHStackComponentDef = StackComponentDefContent & ComponentDef<"CHStack">;

const metadata: ComponentDescriptor<StackComponentDef> = {
  displayName: "Stack",
  description: "A layout container of horizontally or vertically stacked content",
  props: {
    orientation: desc("The layout orientation of the component - works similarly to a CSS flexbox"),
    reverse: desc("Should reverse the order of child elements?"),
  },
  events: {
    click: desc("The stack is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
};

type RenderStackPars = {
  node: StackComponentDef | VStackComponentDef | HStackComponentDef | CVStackComponentDef | CHStackComponentDef;
  layoutNonCss: NonCssLayoutProps;
  extractValue: ValueExtractor;
  layoutCss: React.CSSProperties;
  lookupEventHandler: (eventName: keyof NonNullable<StackComponentDef["events"]>) => AsyncFunction | undefined;
  renderChild: RenderChildFn;
  orientation?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
};

const DEFAULT_ORIENTATION = "vertical";

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

export const stackComponentRenderer = createComponentRenderer<StackComponentDef>(
  "Stack",
  ({ node, extractValue, renderChild, layoutCss, layoutNonCss, lookupEventHandler }) => {
    return renderStack({ node, layoutNonCss, extractValue, layoutCss, lookupEventHandler, renderChild });
  },
  metadata
);

export const vStackComponentRenderer = createComponentRenderer<VStackComponentDef>(
  "VStack",
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
  metadata
);

export const hStackComponentRenderer = createComponentRenderer<HStackComponentDef>(
  "HStack",
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
  metadata
);

export const cvStackComponentRenderer = createComponentRenderer<CVStackComponentDef>(
  "CVStack",
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
  metadata
);

export const chStackComponentRenderer = createComponentRenderer<CHStackComponentDef>(
  "CHStack",
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
  metadata
);

// =====================================================================================================================

type Props = {
  children: ReactNode;
  orientation?: string;
  uid?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  layout?: CSSProperties;
  reverse?: boolean;
  hoverContainer?: boolean;
  visibleOnHover?: boolean;
  onClick?: any;
  onMount?: any;
};

// =====================================================================================================================
// Stack React component

export const Stack = forwardRef(
  function Stack(
    {
      uid,
      children,
      orientation = DEFAULT_ORIENTATION,
      horizontalAlignment,
      verticalAlignment,
      layout,
      reverse,
      hoverContainer,
      visibleOnHover,
      onClick,
      onMount,
      ...rest
    }: Props,
    ref: Ref<any>
  ) {
    useOnMount(onMount);
    const { horizontal, vertical } = useContentAlignment(orientation, horizontalAlignment, verticalAlignment);
    return (
      <div
        {...rest}
        onClick={onClick}
        ref={ref}
        style={layout}
        className={classnames(
          styles.base,
          {
            [styles.vertical]: orientation === "vertical",
            [styles.horizontal]: orientation === "horizontal",
            [styles.reverse]: reverse,
            [styles.hoverContainer]: hoverContainer,
            "display-on-hover": visibleOnHover,
            [styles.handlesClick]: !!onClick,
          },
          horizontal ?? "",
          vertical ?? ""
        )}
      >
        {children}
      </div>
    );
  }
);
