import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode, Ref } from "react";
import { forwardRef } from "react";

import { COMPONENT_PART_KEY } from "../../styling";
import styles from "./NavLink.module.scss";

export type NavLinkProps = {
  active?: boolean;
  children?: ReactNode;
  classes?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  displayActive?: boolean;
  href?: string;
  icon?: ReactNode;
  iconAlignment?: "baseline" | "start" | "center" | "end";
  level?: number;
  noIndicator?: boolean;
  onClick?: () => void | Promise<void>;
  target?: string;
  to?: string;
  vertical?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href" | "onClick" | "target"> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled" | "onClick">;

export const NavLinkComponent = forwardRef<HTMLAnchorElement | HTMLButtonElement, NavLinkProps>(
  function NavLinkComponent(
    {
      active = false,
      children,
      classes: partClasses,
      className,
      disabled = false,
      displayActive = true,
      href,
      icon,
      iconAlignment = "center",
      level,
      noIndicator = false,
      onClick,
      style,
      target,
      vertical = false,
      ...rest
    },
    ref,
  ) {
    const classes = [
      styles.content,
      styles.base,
      partClasses?.[COMPONENT_PART_KEY],
      displayActive && !noIndicator && styles.includeHoverIndicator,
      active && displayActive && styles.navItemActive,
      displayActive && styles.displayActive,
      active && "xmlui-navlink-active",
      vertical && styles.vertical,
      disabled && styles.disabled,
      level === 0 && styles.level1,
      level === 1 && styles.level2,
      level === 2 && styles.level3,
      level === 3 && styles.level4,
      className,
    ].filter(Boolean).join(" ");
    const mergedStyle = {
      ...(style as CSSProperties | undefined),
      "--nav-link-level": vertical ? (level ?? 0) + 1 : 0,
    } as CSSProperties;
    const innerContent = (
      <span className={[
        styles.innerContent,
        iconAlignment === "baseline" && styles.iconAlignBaseline,
        iconAlignment === "start" && styles.iconAlignStart,
        iconAlignment === "center" && styles.iconAlignCenter,
        iconAlignment === "end" && styles.iconAlignEnd,
      ].filter(Boolean).join(" ")}>
        {icon}
        {children}
      </span>
    );

    if (disabled || !href) {
      return (
        <button
          {...rest}
          aria-current={active ? "page" : undefined}
          className={classes}
          data-active={active || undefined}
          disabled={disabled}
          onClick={() => { void onClick?.(); }}
          ref={ref as Ref<HTMLButtonElement>}
          style={mergedStyle}
          type="button"
        >
          {innerContent}
        </button>
      );
    }

    return (
      <a
        {...rest}
        aria-current={active ? "page" : undefined}
        className={classes}
        data-active={active || undefined}
        href={href}
        onClick={(event) => {
          if (target) {
            void onClick?.();
            return;
          }
          event.preventDefault();
          void onClick?.();
        }}
        ref={ref as Ref<HTMLAnchorElement>}
        style={mergedStyle}
        target={target || undefined}
      >
        {innerContent}
      </a>
    );
  },
);
