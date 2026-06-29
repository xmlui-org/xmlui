import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { toCssVar } from "../../components-core/theming/layout-resolver";
import { FlowLayoutMd } from "./FlowLayout";
import { defaultProps } from "./FlowLayout.defaults";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "./FlowLayoutReact";
import { collectResponsiveWidthProps } from "./flow-layout-utils";

const COMP = "FlowLayout";

export const flowLayoutRenderer = wrapComponent({
  name: COMP,
  metadata: FlowLayoutMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const gap = normalizeThemeSize(adapter.stringProp("gap"));
    const columnGap = adapter.node.props.columnGap !== undefined
      ? normalizeThemeSize(adapter.stringProp("columnGap", defaultProps.columnGap))
      : gap ?? "var(--xmlui-gap-FlowLayout, var(--xmlui-gap-layout, 0px))";
    const rowGap = adapter.node.props.rowGap !== undefined
      ? normalizeThemeSize(adapter.stringProp("rowGap", defaultProps.rowGap))
      : gap ?? "var(--xmlui-gap-FlowLayout, var(--xmlui-gap-layout, 0px))";
    const rootAttrs = adapter.rootAttrs();
    const style = { ...(rootAttrs.style as CSSProperties | undefined) };
    delete style.gap;
    delete style.columnGap;
    delete style.rowGap;
    delete style.alignItems;
    const children = nonPropertyChildren(adapter.node.children);
    const itemWidth = adapter.stringProp("itemWidth", defaultProps.itemWidth);
    return (
      <FlowLayout
        {...rootAttrs}
        style={style}
        className={String(rootAttrs.className ?? "")}
        classes={{ [COMPONENT_PART_KEY]: String(rootAttrs.className ?? "") }}
        columnGap={columnGap ?? defaultProps.columnGap}
        rowGap={rowGap ?? defaultProps.rowGap}
        itemWidth={itemWidth ?? defaultProps.itemWidth}
        verticalAlignment={adapter.stringProp("verticalAlignment", defaultProps.verticalAlignment)}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as any}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        onContextMenu={() => void adapter.event("contextMenu")()}
        registerComponentApi={adapter.registerApi}
      >
        {children.map((child, index) =>
          isSpaceFiller(child) ? (
            <FlowItemBreak key={index} force />
          ) : (
            <FlowItemWrapper
              key={index}
              itemWidth={itemWidth}
              width={child.kind === "element" ? child.props.width : undefined}
              minWidth={child.kind === "element" ? child.props.minWidth : undefined}
              maxWidth={child.kind === "element" ? child.props.maxWidth : undefined}
              responsiveWidthProps={
                child.kind === "element"
                  ? collectResponsiveWidthProps(child.props, ((value: unknown) => value) as any)
                  : undefined
              }
            >
              {adapter.context.renderChildren([stripFlowItemLayoutProps(child)], adapter.scope)}
            </FlowItemWrapper>
          ),
        )}
      </FlowLayout>
    );
  },
});

function isSpaceFiller(child: XmluiNode): boolean {
  return child.kind === "element" && child.type === "SpaceFiller";
}

function stripFlowItemLayoutProps(child: XmluiNode): XmluiNode {
  if (child.kind !== "element") {
    return child;
  }
  const props = Object.fromEntries(
    Object.entries(child.props).filter(([key]) => !isFlowItemLayoutProp(key)),
  );
  const parsedProps = child.parsed?.props
    ? (() => {
        return Object.fromEntries(
          Object.entries(child.parsed.props).filter(([key]) => !isFlowItemLayoutProp(key)),
        );
      })()
    : child.parsed?.props;
  return {
    ...child,
    props,
    parsed: child.parsed ? { ...child.parsed, props: parsedProps } : child.parsed,
  };
}

function isFlowItemLayoutProp(key: string): boolean {
  return /^(width|minWidth|maxWidth)(?:-(?:xs|sm|md|lg|xl|xxl))?$/.test(key);
}

function normalizeThemeSize(value: string | undefined): string | undefined {
  return value?.startsWith("$") ? toCssVar(value) : value;
}
