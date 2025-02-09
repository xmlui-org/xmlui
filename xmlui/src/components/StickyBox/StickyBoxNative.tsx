import { CSSProperties, ReactNode } from "react";
import classnames from "classnames";

import styles from "./StickyBox.module.scss";

// =====================================================================================================================
// React StickyBox component implementation

type Props = {
  children: ReactNode;
  uid?: string;
  layout?: CSSProperties;
  to: "top" | "bottom";
};

export function StickyBox({ children, uid, layout, to = "top" }: Props) {
  return (
    <div
      className={classnames(styles.wrapper, {
        [styles.top]: to === "top",
        [styles.bottom]: to === "bottom",
      })}
      style={layout}
    >
      {children}
    </div>
  );
}
