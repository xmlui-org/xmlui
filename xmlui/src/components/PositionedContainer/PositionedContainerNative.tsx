import { CSSProperties, ReactNode } from "react";
import classnames from "classnames";

import styles from "./PositionedContainer.module.scss";

type Props = {
  children: ReactNode;
  top: CSSProperties["top"];
  right: CSSProperties["right"];
  bottom: CSSProperties["bottom"];
  left: CSSProperties["left"];
  visibleOnHover: boolean;
};

export function PositionedContainer({
  children,
  top,
  right,
  bottom,
  left,
  visibleOnHover = false,
}: Props) {
  return (
    <div
      style={{ top, right, bottom, left }}
      className={classnames(styles.wrapper, {
        [styles.visibleOnHover]: visibleOnHover,
      })}
    >
      {children}
    </div>
  );
}
