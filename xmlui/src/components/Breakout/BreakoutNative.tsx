import type { ReactNode } from "react";

import styles from "./Breakout.module.scss";

type Props = {
  children?: ReactNode;
  style?: React.CSSProperties;
};

export const Breakout = ({ children, style, ...rest }: Props) => {
  return (
    <div {...rest} style={style} className={styles.breakout}>
      {children}
    </div>
  );
};
