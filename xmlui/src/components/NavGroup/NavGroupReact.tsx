import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./NavGroup.module.scss";
import { NavGroupItemProvider, useIsNavGroupItem } from "./NavGroupContext";
import { NavLinkComponent } from "../NavLink/NavLinkReact";
import { ThemedIcon } from "../Icon/Icon";

export type NavGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  disabled?: boolean;
  initiallyExpanded?: boolean;
  label?: string;
  onNavigate?: () => void | Promise<void>;
  to?: string;
  icon?: ReactNode;
  iconVerticalCollapsed?: string;
  iconVerticalExpanded?: string;
};

export const NavGroupComponent = forwardRef<HTMLDivElement, NavGroupProps>(function NavGroupComponent(
  {
    children,
    className,
    disabled = false,
    initiallyExpanded = false,
    label,
    onNavigate,
    to,
    icon,
    iconVerticalCollapsed = "chevronright",
    iconVerticalExpanded = "chevrondown",
    ...rest
  },
  ref,
) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const isNestedItem = useIsNavGroupItem();
  const setRootRef = (node: HTMLDivElement | null) => {
    groupRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  const toggle = () => {
    if (disabled) {
      return;
    }
    setExpanded((current) => !current);
    if (to) {
      void onNavigate?.();
    }
  };
  const triggerContent = (
    <>
      {label}
      <span style={{ flex: 1 }} />
      <ThemedIcon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
    </>
  );

  useEffect(() => {
    setExpanded(initiallyExpanded);
  }, [initiallyExpanded]);

  useEffect(() => {
    if (!expanded && groupRef.current?.querySelector(".xmlui-navlink-active")) {
      setExpanded(true);
    }
  });

  return (
    <div
      {...rest}
      aria-expanded={expanded}
      className={classnames(styles.groupWrapper, className)}
      data-xmlui-component="NavGroup"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          toggle();
        }
      }}
      ref={setRootRef}
    >
      {to && !disabled ? (
        <NavLinkComponent
          aria-expanded={expanded}
          className={styles.navLinkPadding}
          href={to}
          icon={icon}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={toggle}
        >
          {triggerContent}
        </NavLinkComponent>
      ) : (
        <NavLinkComponent
          aria-expanded={expanded}
          className={styles.navLinkPadding}
          disabled={disabled}
          icon={icon}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={toggle}
        >
          {triggerContent}
        </NavLinkComponent>
      )}
      <div
        aria-hidden={!expanded}
        className={classnames(styles.groupContent, {
          [styles.expanded]: expanded,
        })}
        data-xmlui-part="content"
        role={expanded ? "menu" : undefined}
      >
        <div className={styles.groupContentInner}>
          <NavGroupItemProvider>{children}</NavGroupItemProvider>
        </div>
      </div>
    </div>
  );
});
