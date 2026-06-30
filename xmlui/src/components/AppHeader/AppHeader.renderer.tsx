import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import type { XmluiNode } from "../../compiler/ir";
import { createRuntimeScope } from "../../runtime/state";
import { useAppShellContext } from "../App/AppShellContext";
import { AppHeaderMd } from "./AppHeader";
import { defaultProps } from "./AppHeader.defaults";
import { AppHeaderComponent } from "./AppHeaderReact";
import styles from "./AppHeader.module.scss";
import { ProfileMenu } from "../ProfileMenu/ProfileMenuReact";
import { useLoggedInUser } from "../ProfileMenu/ProfileMenuContext";
import { ThemedIcon } from "../Icon/Icon";

const templateNames = new Set(["logoTemplate", "titleTemplate", "profileMenuTemplate"]);

export const appHeaderRenderer = wrapComponent({
  name: "AppHeader",
  metadata: AppHeaderMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const children = adapter.node.children.filter((child) => !isTemplateProperty(child));
    const loggedInUser = useLoggedInUser();
    const { inlineNavPanel, showDrawerToggle, toggleDrawer } = useAppShellContext();
    const hasProfileTemplate = hasTemplate(adapter.node.children, "profileMenuTemplate");
    const logoTemplateScope = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues: adapter.scope.contextValues,
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      toast: adapter.scope.toast,
      i18n: adapter.scope.i18n,
      emitEvent: adapter.scope.emitEvent,
      extensionFunctions: adapter.scope.extensionFunctions,
      layoutContext: {
        type: "Stack",
        orientation: "horizontal",
        parent: adapter.scope.layoutContext,
      },
    });

    return (
      <AppHeaderComponent
        {...adapter.rootAttrs()}
        drawerToggle={showDrawerToggle ? (
          <button
            aria-label="Open navigation menu"
            className={styles.hamburgerButton}
            data-part-id="hamburger"
            onClick={toggleDrawer}
            type="button"
          >
            <ThemedIcon name="hamburger" />
          </button>
        ) : undefined}
        logoContent={hasTemplate(adapter.node.children, "logoTemplate") ? adapter.renderTemplate("logoTemplate", undefined, logoTemplateScope) : undefined}
        profileMenu={hasProfileTemplate ? adapter.renderTemplate("profileMenuTemplate") : <ProfileMenu loggedInUser={loggedInUser} />}
        showLogo={adapter.booleanProp("showLogo", defaultProps.showLogo)}
        title={adapter.stringProp("title")}
        titleContent={hasTemplate(adapter.node.children, "titleTemplate") ? adapter.renderTemplate("titleTemplate") : undefined}
      >
        {inlineNavPanel}
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
