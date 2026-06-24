import type { HTMLAttributes } from "react";

import styles from "./InputLabel.module.scss";

type InputLabelProps = Omit<HTMLAttributes<HTMLLabelElement>, "children"> & {
  text: string;
  forFieldId?: string;
  required?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

export function InputLabel({
  text,
  required,
  forFieldId,
  disabled,
  className,
  ...rest
}: InputLabelProps) {
  return (
    <label
      {...rest}
      className={cx(styles.inputLabel, disabled && styles.disabled, className)}
      htmlFor={forFieldId}
    >
      {text} {required && <span className={styles.required}>*</span>}
    </label>
  );
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

