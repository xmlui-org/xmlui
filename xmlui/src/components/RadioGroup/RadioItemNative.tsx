import type React from "react";
import { useId } from "react";
import styles from "./RadioGroup.module.scss";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import classnames from "classnames";

export const defaultProps = {
  checked: false,
  value: "",
};

type Props = {
  checked: boolean;
  style?: React.CSSProperties;
  value?: string;
};

export const RadioItem = ({ checked = defaultProps.checked, style, value = defaultProps.value }: Props) => {
  const id = useId();

  return (
    <div key={id} className={styles.radioOptionContainer} style={style}>
      <InnerRadioGroup.Item
        className={classnames(styles.radioOption)}
        id={id}
        value={value}
        checked={checked}
      >
        <InnerRadioGroup.Indicator className={classnames(styles.indicator)} />
      </InnerRadioGroup.Item>
    </div>
  );
};
