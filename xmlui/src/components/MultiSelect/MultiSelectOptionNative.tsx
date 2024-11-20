import { useId } from "react";

import { CommandItem } from "@components/Combobox/Command";
import styles from "@components/MultiSelect/MultiSelectOption.module.scss";
import * as React from "react";
import { useSelect } from "@components/MultiSelect/MultiSelectContext";
import Icon from "@components/Icon/IconNative";

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
      className={styles.multiSelectOption}
      onSelect={() => {
        onChange(value);
      }}
    >
      {optionRenderer({ label, value })}
      {selectedValues.includes(value) && <Icon name="checkmark" />}
    </CommandItem>
  );
}
