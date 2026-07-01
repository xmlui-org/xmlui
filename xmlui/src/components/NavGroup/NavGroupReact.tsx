import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Children, forwardRef, isValidElement, useContext, useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import styles from "./NavGroup.module.scss";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { NavGroupContext, NavGroupItemProvider, useIsNavGroupItem } from "./NavGroupContext";
import { NavLinkComponent } from "../NavLink/NavLinkReact";
import { NavLinkMd } from "../NavLink/NavLink";
import { ThemedIcon } from "../Icon/Icon";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { getAppLayoutOrientation } from "../App/AppReact";

export type NavGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  disabled?: boolean;
  initiallyExpanded?: boolean;
  label?: string;
  onNavigate?: () => void | Promise<void>;
  to?: string;
  icon?: ReactNode;
  iconHorizontalCollapsed?: string;
  iconHorizontalExpanded?: string;
  iconVerticalCollapsed?: string;
  iconVerticalExpanded?: string;
  noIndicator?: boolean;
  iconAlignment?: "baseline" | "start" | "center" | "end";
  expandIconAlignment?: "start" | "end";
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
    iconHorizontalCollapsed = "chevronright",
    iconHorizontalExpanded = "chevronright",
    iconVerticalCollapsed,
    iconVerticalExpanded = "chevrondown",
    noIndicator = false,
    iconAlignment = "center",
    expandIconAlignment = "start",
    ...rest
  },
  ref,
) {
  const appLayoutContext = useAppLayoutContext();
  const parentGroupContext = useContext(NavGroupContext);
  const inline = getAppLayoutOrientation(appLayoutContext?.layout) === "vertical" ||
    !!appLayoutContext?.isNarrowScreen;
  const contextValue = useMemo(() => ({
    level: parentGroupContext.level + 1,
    forceVerticalItems: parentGroupContext.forceVerticalItems,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed:
      iconVerticalCollapsed ?? (parentGroupContext.level < 0 && !inline
        ? iconVerticalExpanded
        : "chevronright"),
    iconVerticalExpanded,
  }), [
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
    inline,
    parentGroupContext.level,
    parentGroupContext.forceVerticalItems,
  ]);

  return (
    <NavGroupContext.Provider value={contextValue}>
      {inline ? (
        <ExpandableNavGroup
          {...rest}
          className={className}
          disabled={disabled}
          expandIconAlignment={expandIconAlignment}
          icon={icon}
          iconAlignment={iconAlignment}
          initiallyExpanded={initiallyExpanded}
          label={label}
          noIndicator={noIndicator}
          onNavigate={onNavigate}
          ref={ref}
          to={to}
        >
          {children}
        </ExpandableNavGroup>
      ) : (
        <DropDownNavGroup
          {...rest}
          disabled={disabled}
          expandIconAlignment={expandIconAlignment}
          icon={icon}
          iconAlignment={iconAlignment}
          initiallyExpanded={initiallyExpanded}
          label={label}
          noIndicator={noIndicator}
          onNavigate={onNavigate}
          ref={ref}
          to={to}
        >
          {children}
        </DropDownNavGroup>
      )}
    </NavGroupContext.Provider>
  );
});

const ExpandableNavGroup = forwardRef<HTMLDivElement, NavGroupProps>(function ExpandableNavGroup(
  {
    children,
    className,
    disabled = false,
    initiallyExpanded = false,
    label,
    onNavigate,
    to,
    icon,
    noIndicator = false,
    iconAlignment = "center",
    expandIconAlignment = "start",
    ...rest
  },
  ref,
) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const {
    iconVerticalCollapsed,
    iconVerticalExpanded,
  } = useContext(NavGroupContext);
  const navLinkTheme = useComponentThemeClass("NavLink", NavLinkMd as ComponentMetadata);
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
      {expandIconAlignment === "end" && <span style={{ flex: 1 }} />}
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
          className={classnames(navLinkTheme.className, styles.navLinkPadding)}
          href={to}
          icon={icon}
          iconAlignment={iconAlignment}
          noIndicator={noIndicator}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={toggle}
          style={navLinkTheme.style}
        >
          {triggerContent}
        </NavLinkComponent>
      ) : (
        <NavLinkComponent
          aria-expanded={expanded}
          className={classnames(navLinkTheme.className, styles.navLinkPadding)}
          disabled={disabled}
          icon={icon}
          iconAlignment={iconAlignment}
          noIndicator={noIndicator}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={toggle}
          style={navLinkTheme.style}
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

const DropDownNavGroup = forwardRef<HTMLDivElement, NavGroupProps>(function DropDownNavGroup(
  {
    children,
    className,
    disabled = false,
    initiallyExpanded = false,
    label,
    onNavigate,
    to,
    icon,
    noIndicator = false,
    iconAlignment = "center",
    expandIconAlignment = "start",
    ...rest
  },
  ref,
) {
  const {
    level,
    iconHorizontalCollapsed,
    iconHorizontalExpanded,
    iconVerticalCollapsed,
    iconVerticalExpanded,
  } = useContext(NavGroupContext);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [focusRestored, setFocusRestored] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const Wrapper = level >= 1 ? DropdownMenuSub : DropdownMenu;
  const Trigger = level >= 1 ? DropdownMenuSubTrigger : DropdownMenuTrigger;
  const Content = level >= 1 ? DropdownMenuSubContent : DropdownMenuContent;
  const navLinkTheme = useComponentThemeClass("NavLink", NavLinkMd as ComponentMetadata);
  const rootStyle = rest.style as CSSProperties | undefined;
  const triggerAttrs = {
    "data-testid": (rest as Record<string, unknown>)["data-testid"] as string | undefined,
    id: (rest as Record<string, unknown>).id as string | undefined,
    title: (rest as Record<string, unknown>).title as string | undefined,
  };

  useEffect(() => {
    setReady(true);
    if (initiallyExpanded) {
      requestAnimationFrame(() => setExpanded(true));
    }
  }, [initiallyExpanded]);

  const trigger = (
    <NavLinkComponent
      {...triggerAttrs}
      aria-expanded={expanded}
      className={classnames(navLinkTheme.className, styles.navLinkPadding, {
        [styles.navLinkPaddingLevel1]: level === 0,
        [styles.navLinkPaddingLevel2]: level === 1,
        [styles.navLinkPaddingLevel3]: level === 2,
        [styles.navLinkPaddingLevel4]: level === 3,
        [styles.focusRestored]: focusRestored,
      }, className)}
      disabled={disabled}
      href={!disabled ? to : undefined}
      icon={icon}
      iconAlignment={iconAlignment}
      noIndicator={noIndicator}
      onBlur={() => {
        setFocusRestored(false);
      }}
      onClick={() => {
        if (to) {
          void onNavigate?.();
        }
      }}
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") {
          ref(node as never);
        } else if (ref) {
          ref.current = node as never;
        }
      }}
      role={level >= 1 ? "menuitem" : undefined}
      style={{ ...navLinkTheme.style, ...rootStyle, flexShrink: 0 }}
      vertical={level >= 1}
    >
      {label}
      {expandIconAlignment === "end" && <span style={{ flex: 1 }} />}
      {level === 0 ? (
        <ThemedIcon name={expanded ? iconVerticalExpanded : iconVerticalCollapsed} />
      ) : (
        <ThemedIcon name={expanded ? iconHorizontalExpanded : iconHorizontalCollapsed} />
      )}
    </NavLinkComponent>
  );

  return (
    <Wrapper
      open={expanded}
      onOpenChange={(open) => {
        if (ready) {
          setExpanded(open);
          if (open) {
            setFocusRestored(false);
          }
        }
      }}
    >
      <Trigger asChild disabled={disabled}>
        {trigger}
      </Trigger>
      <DropdownMenuPortal>
        <Content
          className={classnames(styles.dropdownList, className)}
          data-xmlui-component="NavGroup"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => {
              setFocusRestored(true);
              triggerRef.current?.focus({
                preventScroll: true,
                focusVisible: true,
              } as FocusOptions);
            });
          }}
          style={{ ...rootStyle, display: "flex", flexDirection: "column" }}
          side="bottom"
          align="start"
        >
          <NavGroupContext.Provider
            value={{
              level,
              forceVerticalItems: true,
              iconHorizontalCollapsed,
              iconHorizontalExpanded,
              iconVerticalCollapsed,
              iconVerticalExpanded,
            }}
          >
            <NavGroupItemProvider>
              {Children.map(children, (child) => {
                if (!isValidElement(child) || child.type === NavGroupComponent) {
                  return child;
                }
                return <DropdownMenuItem asChild>{child}</DropdownMenuItem>;
              })}
            </NavGroupItemProvider>
          </NavGroupContext.Provider>
        </Content>
      </DropdownMenuPortal>
    </Wrapper>
  );
});
