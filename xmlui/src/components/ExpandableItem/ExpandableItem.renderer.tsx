import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { ExpandableItemMd } from "./ExpandableItem";
import { defaultProps } from "./ExpandableItem.defaults";
import { ExpandableItemComponent } from "./ExpandableItemReact";

const COMP = "ExpandableItem";

export const expandableItemRenderer = wrapComponent({
  name: COMP,
  metadata: ExpandableItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const hasSummaryTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "summary",
    );
    const summary = hasSummaryTemplate
      ? adapter.renderTemplate("summary")
      : adapter.prop("summary", undefined);
    return (
      <ExpandableItemComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        summary={summary}
        initiallyExpanded={adapter.booleanProp("initiallyExpanded", defaultProps.initiallyExpanded)}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        iconExpanded={adapter.stringProp("iconExpanded", defaultProps.iconExpanded)}
        iconCollapsed={adapter.stringProp("iconCollapsed", defaultProps.iconCollapsed)}
        iconPosition={adapter.stringProp("iconPosition", defaultProps.iconPosition) as "start" | "end"}
        withSwitch={adapter.booleanProp("withSwitch", defaultProps.withSwitch)}
        contentWidth={adapter.stringProp("contentWidth", defaultProps.contentWidth)}
        fullWidthSummary={adapter.booleanProp("fullWidthSummary", defaultProps.fullWidthSummary)}
        onExpandedChange={(value) => { void adapter.event("expandedChange")(value); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      </ExpandableItemComponent>
    );
  },
});
