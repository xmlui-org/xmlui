import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import type { XmluiNode } from "../../compiler/ir";
import { useAppShellContext } from "../App/AppShellContext";
import { AppHeaderMd } from "./AppHeader";
import { defaultProps } from "./AppHeader.defaults";
import { AppHeaderComponent } from "./AppHeaderReact";
import styles from "./AppHeader.module.scss";
import { ProfileMenu } from "../ProfileMenu/ProfileMenuReact";
import { useLoggedInUser } from "../ProfileMenu/ProfileMenuContext";

const templateNames = new Set(["logoTemplate", "titleTemplate", "profileMenuTemplate"]);

export const appHeaderRenderer = wrapComponent({
  name: "AppHeader",
  metadata: AppHeaderMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const children = adapter.node.children.filter((child) => !isTemplateProperty(child));
    const loggedInUser = useLoggedInUser();
    const { showDrawerToggle } = useAppShellContext();
    const hasProfileTemplate = hasTemplate(adapter.node.children, "profileMenuTemplate");

    return (
      <AppHeaderComponent
        {...adapter.rootAttrs()}
        drawerToggle={showDrawerToggle ? (
          <button
            aria-label="Open navigation menu"
            data-part-id="hamburger"
            type="button"
          >
            <span aria-hidden="true" className={styles.hamburgerIcon} />
          </button>
        ) : undefined}
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
