import { useId } from "react";

import { CommandItem } from "@components/Combobox/Command";
import styles from "@components/Combobox/Combobox2.module.scss";
import { CheckIcon } from "@components/Icon/CheckIcon";
import * as React from "react";
import classnames from "classnames";
import { useSelect } from "@components/MultiSelect/MultiSelectContext";

type OptionComponentProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function MultiSelectOption({ value, label, disabled }: OptionComponentProps) {
  const id = useId();
  const { value: selectedValues, onChange, optionRenderer } = useSelect();

  return (
    <CommandItem
      id={id}
      key={id}
      value={`${value}`}
      className={styles.commandItem}
      onSelect={() => {
        onChange(value);
      }}
    >
      {optionRenderer({ label, value })}
      <CheckIcon
        className={classnames(
          styles.checkIcon,
          selectedValues.includes(value) && styles.checkIconVisible,
        )}
      />
    </CommandItem>
  );
}
