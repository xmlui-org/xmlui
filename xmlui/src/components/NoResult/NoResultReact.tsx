import { forwardRef, memo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { defaultProps } from "./NoResult.defaults";
import styles from "./NoResult.module.scss";

export type NoResultProps = {
  label: ReactNode;
  icon?: string;
  hideIcon?: boolean;
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>;

export const NoResult = memo(forwardRef<HTMLDivElement, NoResultProps>(function NoResult(
  {
    label,
    icon = defaultProps.icon,
    hideIcon = defaultProps.hideIcon,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={[styles.xmluiNoResult, className].filter(Boolean).join(" ")}
    >
      {!hideIcon && <NoResultIcon name={icon} />}
      {label}
    </div>
  );
}));

function NoResultIcon({ name }: { name: string }) {
  return (
    <svg
      className={styles.xmluiNoResultIcon}
      data-xmlui-part="icon"
      data-icon={name}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="18" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.55" />
      <path d="M42 42l12 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M20 28h16" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
