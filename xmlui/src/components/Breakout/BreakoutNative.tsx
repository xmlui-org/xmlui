import type { ReactNode } from "react";

import styles from "./Breakout.module.scss";

type Props = {
  children?: ReactNode;
};

export const Breakout = ({ children }: Props) => {
  return <div className={styles.breakout}>{children}</div>;
};
