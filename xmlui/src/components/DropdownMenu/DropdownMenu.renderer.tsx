import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { DropdownMenuMd, MenuItemMd, MenuSeparatorMd, SubMenuItemMd } from "./DropdownMenu";
import {
  DropdownMenuComponent,
  MenuItemComponent,
  MenuSeparatorComponent,
  SubMenuItemComponent,
} from "./DropdownMenuReact";

export const dropdownMenuRenderer = wrapComponent({
  name: "DropdownMenu",
  metadata: DropdownMenuMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const hasTriggerTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "triggerTemplate",
    );
    const children = filterMenuSeparators(adapter.node.children.filter((child) =>
      !(child.kind === "element" && child.type === "property"),
    ));
    return (
      <DropdownMenuComponent
        {...adapter.rootAttrs("content")}
        alignment={adapter.stringProp("alignment", "start") as "start" | "center" | "end"}
        disabled={!adapter.booleanProp("enabled", true)}
        label={adapter.stringProp("label")}
        menuWidth={adapter.stringProp("menuWidth")}
        onWillOpen={async () => {
          const result = await adapter.event("willOpen")();
          return typeof result === "boolean" ? result : undefined;
        }}
        registerComponentApi={adapter.registerApi}
        triggerTemplate={hasTriggerTemplate ? adapter.renderTemplate("triggerTemplate") : undefined}
      >
        {adapter.renderChildren(children)}
      </DropdownMenuComponent>
    );
  },
});

export const menuItemRenderer = wrapComponent({
  name: "MenuItem",
  metadata: MenuItemMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <MenuItemComponent
      {...adapter.rootAttrs()}
      active={adapter.booleanProp("active", false)}
      enabled={adapter.booleanProp("enabled", true)}
      icon={adapter.stringProp("icon")}
      iconPosition={adapter.stringProp("iconPosition", "start") as "start" | "end"}
      label={adapter.stringProp("label")}
      onClick={() => { void adapter.event("click")(); }}
    >
      {adapter.renderChildren()}
    </MenuItemComponent>
  ),
});

export const menuSeparatorRenderer = wrapComponent({
  name: "MenuSeparator",
  metadata: MenuSeparatorMd as ComponentMetadata,
  renderer: ({ adapter }) => <MenuSeparatorComponent {...adapter.rootAttrs()} />,
});

export const subMenuItemRenderer = wrapComponent({
  name: "SubMenuItem",
  metadata: SubMenuItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const hasTriggerTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "triggerTemplate",
    );
    const children = filterMenuSeparators(adapter.node.children.filter((child) =>
      !(child.kind === "element" && child.type === "property"),
    ));
    return (
      <SubMenuItemComponent
        {...adapter.rootAttrs()}
        icon={adapter.stringProp("icon")}
        iconPosition={adapter.stringProp("iconPosition", "start") as "start" | "end"}
        label={adapter.stringProp("label")}
        triggerTemplate={hasTriggerTemplate ? adapter.renderTemplate("triggerTemplate") : undefined}
      >
        {adapter.renderChildren(children)}
      </SubMenuItemComponent>
    );
  },
});

export function filterMenuSeparators(children: XmluiNode[]): XmluiNode[] {
  const filtered: XmluiNode[] = [];
  let lastVisibleWasSeparator = true;

  for (const child of children) {
    if (isMenuSeparator(child)) {
      if (!lastVisibleWasSeparator) {
        filtered.push(child);
        lastVisibleWasSeparator = true;
      }
      continue;
    }
    filtered.push(child);
    lastVisibleWasSeparator = false;
  }

  if (filtered.length > 0 && isMenuSeparator(filtered[filtered.length - 1])) {
    filtered.pop();
  }

  return filtered;
}

function isMenuSeparator(node: XmluiNode): boolean {
  return node.kind === "element" && node.type === "MenuSeparator";
}
