import type { HTMLAttributes } from "react";

import styles from "./InputDivider.module.scss";

export type InputDividerProps = HTMLAttributes<HTMLSpanElement> & {
  separator: string;
  className?: string;
};

export function InputDivider({ separator, className, ...rest }: InputDividerProps) {
  return (
    <span {...rest} className={[styles.inputDivider, className].filter(Boolean).join(" ")}>
      {separator}
    </span>
  );
}

