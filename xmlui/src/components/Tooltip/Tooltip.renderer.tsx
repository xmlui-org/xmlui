import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Tooltip.defaults";
import { TooltipMd } from "./Tooltip";
import { TooltipComponent } from "./TooltipReact";
import type { TooltipAlign, TooltipSide } from "./TooltipReact";

const COMP = "Tooltip";

export const tooltipRenderer = wrapComponent({
  name: COMP,
  metadata: TooltipMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const tooltipTemplate = adapter.renderTemplate("tooltipTemplate");
    const hasTooltipTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "tooltipTemplate",
    );
    const children = adapter.node.children.filter((child) =>
      !(child.kind === "element" && child.type === "property"),
    );

    return (
      <TooltipComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        text={adapter.stringProp("text")}
        markdown={adapter.stringProp("markdown")}
        tooltipTemplate={hasTooltipTemplate ? tooltipTemplate : undefined}
        delayDuration={adapter.numberProp("delayDuration", defaultProps.delayDuration)}
        skipDelayDuration={adapter.numberProp("skipDelayDuration", defaultProps.skipDelayDuration)}
        defaultOpen={adapter.booleanProp("defaultOpen", defaultProps.defaultOpen)}
        showArrow={adapter.booleanProp("showArrow", defaultProps.showArrow)}
        side={adapter.stringProp("side", defaultProps.side) as TooltipSide}
        align={adapter.stringProp("align", defaultProps.align) as TooltipAlign}
        sideOffset={adapter.numberProp("sideOffset", defaultProps.sideOffset)}
        alignOffset={adapter.numberProp("alignOffset", defaultProps.alignOffset)}
        avoidCollisions={adapter.booleanProp("avoidCollisions", defaultProps.avoidCollisions)}
      >
        {adapter.renderChildren(children)}
      </TooltipComponent>
    );
  },
});
