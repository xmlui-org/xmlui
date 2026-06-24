import type { HTMLAttributes } from "react";

import { Icon } from "../Icon/IconReact";
import styles from "./InputAdornment.module.scss";

type AdornmentProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  iconName?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
};

export function Adornment({
  iconName,
  text,
  className,
  onClick,
  tabIndex,
  ...rest
}: AdornmentProps) {
  if (!iconName && !text) {
    return null;
  }

  return (
    <div
      {...rest}
      className={cx(styles.wrapper, className, onClick && styles.clickable)}
      role={onClick ? "button" : "presentation"}
      onClick={onClick}
      tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
    >
      {iconName ? <Icon name={iconName} /> : null}
      {text ? (
        <div className={styles.text}>
          <span className={styles.textContent}>{text}</span>
        </div>
      ) : null}
    </div>
  );
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

