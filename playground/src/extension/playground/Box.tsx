import type { CSSProperties } from "react";
import style from "./Box.module.scss";

export const Box = ({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles?: CSSProperties;
}) => {
  return (
    <div style={styles} className={style.box}>
      {children}
    </div>
  );
};
