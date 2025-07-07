import type React from "react";
import { useCallback, useId } from "react";
import styles from "./RadioGroup.module.scss";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import { noop } from "../../components-core/constants";

import classnames from "classnames";

export const defaultProps = {
  checked: false,
  value: "",
};

type RadioItemProps = {
  checked: boolean;
  style?: React.CSSProperties;
  value?: string;
  onDidChange?: (value: string) => void;
};

export const RadioItem = ({
  checked = defaultProps.checked,
  style,
  value = defaultProps.value,
  onDidChange = noop,
}: RadioItemProps) => {
  const id = useId();
  return (
    <div key={id} className={styles.radioOptionContainer} style={style}>
      <UnwrappedRadioItem id={id} checked={checked} value={value} onDidChange={onDidChange} />
    </div>
  );
};

type UnwrappedRadioItemProps = Omit<RadioItemProps, "style"> & {
  id: string;
  statusStyles?: Record<string, boolean>;
  disabled?: boolean;
  onDidChange?: (value: string) => void;
};

export const UnwrappedRadioItem = ({
  id,
  checked = defaultProps.checked,
  value = defaultProps.value,
  statusStyles,
  disabled,
  onDidChange = noop,
}: UnwrappedRadioItemProps) => {

  const onInputChange = useCallback(
    (_: React.MouseEvent<HTMLButtonElement>) => {
      onDidChange(value);
    },
    [onDidChange, value],
  );
  
  return (
    <InnerRadioGroup.Item
      className={classnames(styles.radioOption, statusStyles)}
      id={id}
      value={value}
      checked={checked}
      disabled={disabled}
      onClick={onInputChange}
    >
      <InnerRadioGroup.Indicator className={classnames(styles.indicator, statusStyles)} />
    </InnerRadioGroup.Item>
  );
};
