import { CSSProperties, ReactNode } from "react";
import classnames from "classnames";

import styles from "./PositionedContainer.module.scss";

type Props = {
  children: ReactNode;
  className?: string;
  visibleOnHover: boolean;
};

export function PositionedContainer({
  children,
  className,
  visibleOnHover = false,
}: Props) {
  return (
    <div
      className={classnames(styles.wrapper, className, {
        [styles.visibleOnHover]: visibleOnHover,
      })}
    >
      {children}
    </div>
  );
}
