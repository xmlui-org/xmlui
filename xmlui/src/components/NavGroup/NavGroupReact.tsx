import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./NavGroup.module.scss";

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

  useEffect(() => {
    setExpanded(initiallyExpanded);
  }, [initiallyExpanded]);

  return (
    <div
      {...rest}
      className={[styles.group, className].filter(Boolean).join(" ")}
      data-xmlui-component="NavGroup"
      ref={ref}
    >
      <button
        aria-expanded={expanded}
        className={styles.trigger}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }
          setExpanded((current) => !current);
          if (to) {
            void onNavigate?.();
          }
        }}
        type="button"
      >
        <span className={styles.label}>{label}</span>
        <span aria-hidden="true" className={styles.indicator}>
          {expanded ? "v" : ">"}
        </span>
      </button>
      <div
        aria-hidden={!expanded}
        className={[styles.content, expanded && styles.expanded].filter(Boolean).join(" ")}
        data-xmlui-part="content"
      >
        {children}
      </div>
    </div>
  );
});
