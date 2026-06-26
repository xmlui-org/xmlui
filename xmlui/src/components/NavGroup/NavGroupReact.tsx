import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

import styles from "./NavGroup.module.scss";
import { NavGroupItemProvider, useIsNavGroupItem } from "./NavGroupContext";

export type NavGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  disabled?: boolean;
  initiallyExpanded?: boolean;
  label?: string;
  onNavigate?: () => void | Promise<void>;
  to?: string;
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
      <span className={styles.label}>{label}</span>
      <span aria-hidden="true" className={styles.indicator} />
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
      className={[styles.group, className].filter(Boolean).join(" ")}
      data-xmlui-component="NavGroup"
      ref={setRootRef}
    >
      {to && !disabled ? (
        <a
          aria-expanded={expanded}
          className={styles.trigger}
          href={to}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={(event) => {
            event.preventDefault();
            toggle();
          }}
        >
          {triggerContent}
        </a>
      ) : (
        <button
          aria-expanded={expanded}
          className={styles.trigger}
          disabled={disabled}
          role={isNestedItem ? "menuitem" : undefined}
          onClick={toggle}
          type="button"
        >
          {triggerContent}
        </button>
      )}
      <div
        aria-hidden={!expanded}
        className={[styles.content, expanded && styles.expanded].filter(Boolean).join(" ")}
        data-xmlui-part="content"
        role={expanded ? "menu" : undefined}
      >
        <NavGroupItemProvider>{children}</NavGroupItemProvider>
      </div>
    </div>
  );
});
