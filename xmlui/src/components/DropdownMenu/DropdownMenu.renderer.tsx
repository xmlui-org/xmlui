import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { ThemedIcon } from "../Icon/Icon";
import { DropdownMenuMd, MenuItemMd, MenuSeparatorMd, SubMenuItemMd } from "./DropdownMenu";
import {
  DropdownMenu,
  MenuItem,
  MenuSeparator,
  SubMenuItem,
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
      <DropdownMenu
        {...adapter.rootAttrs("content")}
        alignment={adapter.stringProp("alignment", "start") as "start" | "center" | "end"}
        disabled={!adapter.booleanProp("enabled", true)}
        hasContent={children.length > 0}
        label={adapter.stringProp("label")}
        menuWidth={adapter.stringProp("menuWidth")}
        modal={adapter.booleanProp("modal", false)}
        onWillOpen={async () => {
          const result = await adapter.event("willOpen")();
          return typeof result === "boolean" ? result : undefined;
        }}
        registerComponentApi={adapter.registerApi}
        triggerButtonIcon={adapter.stringProp("triggerButtonIcon")}
        triggerButtonIconPosition={adapter.stringProp("triggerButtonIconPosition", "end") as "start" | "end"}
        triggerButtonThemeColor={adapter.stringProp("triggerButtonThemeColor")}
        triggerButtonVariant={adapter.stringProp("triggerButtonVariant")}
        triggerTemplate={hasTriggerTemplate ? adapter.renderTemplate("triggerTemplate") : undefined}
      >
        {adapter.renderChildren(children)}
      </DropdownMenu>
    );
  },
});

export const menuItemRenderer = wrapComponent({
  name: "MenuItem",
  metadata: MenuItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const iconName = adapter.stringProp("icon");
    const to = adapter.stringProp("to");
    const hasClickHandler = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const onClick = hasClickHandler
      ? () => { void adapter.event("click")(); }
      : to
        ? () => { void adapter.scope.routing?.navigate(to); }
        : undefined;
    return (
      <MenuItem
        {...adapter.rootAttrs()}
        active={adapter.booleanProp("active", false)}
        enabled={adapter.booleanProp("enabled", true)}
        icon={iconName ? <ThemedIcon name={iconName} fallback={iconName} /> : undefined}
        iconPosition={adapter.stringProp("iconPosition", "start") as "start" | "end"}
        label={adapter.stringProp("label")}
        onClick={onClick}
      >
        {adapter.renderChildren()}
      </MenuItem>
    );
  },
});

export const menuSeparatorRenderer = wrapComponent({
  name: "MenuSeparator",
  metadata: MenuSeparatorMd as ComponentMetadata,
  renderer: ({ adapter }) => <MenuSeparator {...adapter.rootAttrs()} />,
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
    const iconName = adapter.stringProp("icon");
    return (
      <SubMenuItem
        {...adapter.rootAttrs()}
        icon={iconName ? <ThemedIcon name={iconName} fallback={iconName} /> : undefined}
        iconPosition={adapter.stringProp("iconPosition", "start") as "start" | "end"}
        label={adapter.stringProp("label")}
        triggerTemplate={hasTriggerTemplate ? adapter.renderTemplate("triggerTemplate") : undefined}
      >
        {adapter.renderChildren(children)}
      </SubMenuItem>
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
