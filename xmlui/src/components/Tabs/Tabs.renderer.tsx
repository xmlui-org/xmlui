import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { TabItemMd, TabsMd } from "./Tabs";
import { defaultProps } from "./Tabs.defaults";
import { TabItemComponent } from "./TabItemReact";
import { TabsComponent } from "./TabsReact";

const TABS_COMP = "Tabs";
const TAB_ITEM_COMP = "TabItem";

export const tabsRenderer = wrapComponent({
  name: TABS_COMP,
  metadata: TabsMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <TabsComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        activeTab={adapter.numberProp("activeTab", defaultProps.activeTab)}
        orientation={adapter.stringProp("orientation", defaultProps.orientation) as "horizontal" | "vertical"}
        tabAlignment={adapter.stringProp("tabAlignment", defaultProps.tabAlignment) as "start" | "end" | "center" | "stretch"}
        accordionView={adapter.booleanProp("accordionView", defaultProps.accordionView)}
        keepMounted={adapter.props.keepMounted === undefined ? undefined : adapter.booleanProp("keepMounted")}
        gap={adapter.stringProp("gap")}
        distributeEvenly={adapter.booleanProp("distributeEvenly", defaultProps.distributeEvenly)}
        onDidChange={(index, id, label) => { void adapter.event("didChange")(index, id, label); }}
        onContextMenu={(event) => { void adapter.event("contextMenu")(event); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </TabsComponent>
    );
  },
});

export const tabItemRenderer = wrapComponent({
  name: TAB_ITEM_COMP,
  metadata: TabItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const hasHeaderTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "headerTemplate",
    );
    const header = hasHeaderTemplate ? adapter.renderTemplate("headerTemplate") : undefined;
    return (
      <TabItemComponent
        id={typeof adapter.props.id === "string" ? adapter.props.id : undefined}
        label={adapter.stringProp("label", "")}
        header={header}
        index={tabItemIndex(adapter.node)}
        activated={() => { void adapter.event("activated")(); }}
      >
        {adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      </TabItemComponent>
    );
  },
});

function tabItemIndex(node: { type: string }): number {
  return Number((node as { __xmluiIndex?: number }).__xmluiIndex ?? 0);
}
