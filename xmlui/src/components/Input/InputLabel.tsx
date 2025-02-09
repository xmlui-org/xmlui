import styles from "./InputLabel.module.scss";
import classnames from "../../components-core/utils/classnames";

// =====================================================================================================================
// React component definition

type Props = {
  text: string;
  forFieldId?: string;
  required?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

export const InputLabel = ({ text, required, forFieldId, disabled }: Props) => {
  return (
    <label className={classnames(styles.inputLabel, { [styles.disabled]: disabled })} htmlFor={forFieldId}>
      {text} {required && <span className={styles.required}>*</span>}
    </label>
  );
};
