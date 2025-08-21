import type { ReactNode } from "react";

import styles from "./Breakout.module.scss";

type Props = {
  children?: ReactNode;
};

export const Breakout = ({ children, ...rest }: Props) => {
  return (
    <div {...rest} className={styles.breakout}>
      {children}
    </div>
  );
};
