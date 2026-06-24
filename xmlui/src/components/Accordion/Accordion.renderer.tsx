import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { AccordionItemMd, AccordionMd } from "./Accordion";
import { defaultProps } from "./Accordion.defaults";
import { defaultProps as accordionItemDefaultProps } from "./AccordionItem.defaults";
import { AccordionItemComponent } from "./AccordionItemReact";
import { AccordionComponent } from "./AccordionReact";

const COMP = "Accordion";
const ITEM_COMP = "AccordionItem";

export const accordionRenderer = wrapComponent({
  name: COMP,
  metadata: AccordionMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <AccordionComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        triggerPosition={adapter.stringProp("triggerPosition", defaultProps.triggerPosition) as "start" | "end"}
        collapsedIcon={adapter.stringProp("collapsedIcon", defaultProps.collapsedIcon)}
        expandedIcon={adapter.stringProp("expandedIcon")}
        hideIcon={adapter.booleanProp("hideIcon", defaultProps.hideIcon)}
        rotateExpanded={adapter.stringProp("rotateExpanded", defaultProps.rotateExpanded)}
        onDisplayDidChange={(value) => { void adapter.event("displayDidChange")(value); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </AccordionComponent>
    );
  },
});

export const accordionItemRenderer = wrapComponent({
  name: ITEM_COMP,
  metadata: AccordionItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const hasHeaderTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "headerTemplate",
    );
    const header = hasHeaderTemplate
      ? adapter.renderTemplate("headerTemplate")
      : adapter.prop("header", "");
    return (
      <AccordionItemComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        id={typeof adapter.props.id === "string" ? adapter.props.id : undefined}
        header={header}
        initiallyExpanded={adapter.booleanProp("initiallyExpanded", accordionItemDefaultProps.initiallyExpanded)}
        content={adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      />
    );
  },
});
