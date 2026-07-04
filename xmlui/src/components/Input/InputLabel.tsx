import classnames from "classnames";

import styles from "./InputLabel.module.scss";

// =====================================================================================================================
// React component definition

type Props = {
  text: string;
  forFieldId?: string;
  required?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

export const InputLabel = ({ text, required, forFieldId, disabled, ...rest }: Props) => {
  return (
    <label
      {...rest}
      className={classnames(styles.inputLabel, { [styles.disabled]: disabled })}
      htmlFor={forFieldId}
    >
      {text} {required && <span className={styles.required}>*</span>}
    </label>
  );
};
