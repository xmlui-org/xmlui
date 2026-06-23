import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import type { XmluiNode } from "../../compiler/ir";
import { AppHeaderMd } from "./AppHeader";
import { defaultProps } from "./AppHeader.defaults";
import { AppHeaderComponent } from "./AppHeaderReact";
import { ProfileMenu } from "../ProfileMenu/ProfileMenuReact";
import { useLoggedInUser } from "../ProfileMenu/ProfileMenuContext";

const templateNames = new Set(["logoTemplate", "titleTemplate", "profileMenuTemplate"]);

export const appHeaderRenderer = wrapComponent({
  name: "AppHeader",
  metadata: AppHeaderMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const children = adapter.node.children.filter((child) => !isTemplateProperty(child));
    const loggedInUser = useLoggedInUser();
    const hasProfileTemplate = hasTemplate(adapter.node.children, "profileMenuTemplate");

    return (
      <AppHeaderComponent
        {...adapter.rootAttrs()}
        logoContent={hasTemplate(adapter.node.children, "logoTemplate") ? adapter.renderTemplate("logoTemplate") : undefined}
        profileMenu={hasProfileTemplate ? adapter.renderTemplate("profileMenuTemplate") : <ProfileMenu loggedInUser={loggedInUser} />}
        showLogo={adapter.booleanProp("showLogo", defaultProps.showLogo)}
        title={adapter.stringProp("title")}
        titleContent={hasTemplate(adapter.node.children, "titleTemplate") ? adapter.renderTemplate("titleTemplate") : undefined}
      >
        {adapter.renderChildren(children)}
      </AppHeaderComponent>
    );
  },
});

function isTemplateProperty(node: XmluiNode): boolean {
  return node.kind === "element" &&
    node.type === "property" &&
    typeof node.props.name === "string" &&
    templateNames.has(node.props.name);
}

function hasTemplate(children: XmluiNode[], name: string): boolean {
  return children.some((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
}
