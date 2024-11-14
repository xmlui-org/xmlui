import { useId } from "react";

import { CommandItem } from "@components/Combobox/Command";
import styles from "@components/Combobox/Combobox2.module.scss";
import { CheckIcon } from "@components/Icon/CheckIcon";
import * as React from "react";
import classnames from "classnames";
import { useSelect } from "@components/Select/SelectContext2";

type OptionComponentProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function Option2Component({ value, label, disabled }: OptionComponentProps) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer } = useSelect();

  return (
    <CommandItem
      id={id}
      key={value}
      value={value}
      className={styles.commandItem}
      onSelect={(currentValue) => {
        onChange(currentValue);
      }}
    >
      {label}
      <CheckIcon
        className={classnames(styles.checkIcon, selectedValue === value && styles.checkIconVisible)}
      />
    </CommandItem>
  );
}
