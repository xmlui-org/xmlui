import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { NavPanelMd, defaultNavPanelProps } from "./NavPanel";
import { NavPanelComponent } from "./NavPanelReact";

export const navPanelRenderer = wrapComponent({
  name: "NavPanel",
  metadata: NavPanelMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const hasLogoTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "logoTemplate",
    );
    const hasFooterTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "footerTemplate",
    );
    const children = adapter.node.children.filter((child) =>
      !(child.kind === "element" && child.type === "property"),
    );
    const logoTemplateScope = createRuntimeScope({
      ...adapter.scope,
      parent: adapter.scope,
      layoutContext: {
        type: "Stack",
        orientation: "horizontal",
        parent: adapter.scope.layoutContext,
      },
    });

    return (
      <NavPanelComponent
        {...adapter.rootAttrs()}
        footerContent={hasFooterTemplate ? adapter.renderTemplate("footerTemplate") : undefined}
        logoContent={hasLogoTemplate ? adapter.renderTemplate("logoTemplate", undefined, logoTemplateScope) : undefined}
        scrollStyle={adapter.stringProp("scrollStyle", defaultNavPanelProps.scrollStyle)}
      >
        {adapter.renderChildren(children)}
      </NavPanelComponent>
    );
  },
});
