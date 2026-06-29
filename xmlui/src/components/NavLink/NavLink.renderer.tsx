import { useSyncExternalStore } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { normalizePathname } from "../../runtime/routing";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { useIsNavGroupItem } from "../NavGroup/NavGroupContext";
import { ThemedIcon } from "../Icon/Icon";
import { NavLinkMd, defaultNavLinkProps } from "./NavLink";
import styles from "./NavLink.module.scss";
import { NavLinkComponent } from "./NavLinkReact";

export const navLinkRenderer = wrapComponent({
  name: "NavLink",
  metadata: NavLinkMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const to = adapter.stringProp("to", "");
    const enabled = adapter.booleanProp("enabled", true);
    const exact = adapter.booleanProp("exact", false);
    const forceActive = adapter.booleanProp("active", defaultNavLinkProps.active);
    const displayActive = adapter.booleanProp("displayActive", defaultNavLinkProps.displayActive);
    const noIndicator = adapter.booleanProp("noIndicator", defaultNavLinkProps.noIndicator);
    const isNavGroupItem = useIsNavGroupItem();
    const label = adapter.prop("label");
    const iconName = adapter.stringProp("icon");
    const target = adapter.stringProp("target");
    const routing = adapter.scope.routing;
    const snapshot = useSyncExternalStore(
      (listener) => routing?.subscribe(listener) ?? (() => undefined),
      () => routing?.getSnapshot() ?? { pathname: "/", search: "", hash: "", queryParams: {}, revision: 0 },
      () => ({ pathname: "/", search: "", hash: "", queryParams: {}, revision: 0 }),
    );
    const href = to ? isExternalUrl(to) ? to : routing?.href(to) ?? to : undefined;
    const active = forceActive || isActivePath(snapshot.pathname, to, exact);
    const hasIconTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "iconTemplate",
    );
    const children = adapter.node.children.filter((child) =>
      !(child.kind === "element" && child.type === "property"),
    );

    const rootAttrs = adapter.rootAttrs();
    const { className, ...restRootAttrs } = rootAttrs;
    return (
      <NavLinkComponent
        {...restRootAttrs}
        active={active}
        classes={{ [COMPONENT_PART_KEY]: typeof className === "string" ? className : "" }}
        disabled={!enabled}
        displayActive={displayActive}
        href={href}
        icon={hasIconTemplate
          ? adapter.renderTemplate("iconTemplate")
          : iconName
            ? <ThemedIcon name={iconName} className={styles.icon} />
            : undefined}
        iconAlignment={adapter.stringProp("iconAlignment", defaultNavLinkProps.iconAlignment) as "baseline" | "start" | "center" | "end"}
        level={adapter.numberProp("level", 0)}
        noIndicator={noIndicator}
        role={isNavGroupItem ? "menuitem" : undefined}
        target={target}
        to={to}
        vertical={adapter.booleanProp("vertical", false)}
        onClick={async () => {
          if (enabled && routing && to && !target && !isExternalUrl(to)) {
            routing.navigate(to);
          }
          await adapter.event("click")();
        }}
      >
        {label === undefined ? adapter.renderChildren(children) : String(label ?? "")}
      </NavLinkComponent>
    );
  },
});

function isActivePath(pathname: string, to: string | undefined, exact: boolean): boolean {
  if (!to) {
    return false;
  }
  const target = normalizePathname(to);
  const current = normalizePathname(pathname);
  if (exact) {
    return current === target;
  }
  return current === target || current.startsWith(`${target}/`);
}

function isExternalUrl(to: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(to);
}
