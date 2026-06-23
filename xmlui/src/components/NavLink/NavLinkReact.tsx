import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode, Ref } from "react";
import { forwardRef } from "react";

import styles from "./NavLink.module.scss";

export type NavLinkProps = {
  active?: boolean;
  children?: ReactNode;
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
      active && displayActive && styles.active,
      vertical && styles.vertical,
      disabled && styles.disabled,
      noIndicator && styles.noIndicator,
      className,
    ].filter(Boolean).join(" ");
    const mergedStyle = {
      ...(style as CSSProperties | undefined),
      ...(level ? { "--nav-link-level": level } : null),
    } as CSSProperties;
    const innerContent = (
      <span className={[
        styles.innerContent,
        iconAlignment === "baseline" && styles.iconAlignBaseline,
        iconAlignment === "start" && styles.iconAlignStart,
        iconAlignment === "center" && styles.iconAlignCenter,
        iconAlignment === "end" && styles.iconAlignEnd,
      ].filter(Boolean).join(" ")}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
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
