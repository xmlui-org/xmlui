import { useId } from "react";

import { CommandItem } from "@components/Combobox/Command";
import styles from "@components/MultiSelect/MultiOption.module.scss";
import * as React from "react";
import { useSelect } from "@components/MultiSelect/MultiSelectContext";
import Icon from "@components/Icon/IconNative";

type OptionComponentProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function MultiOption({ value, label, disabled }: OptionComponentProps) {
  const id = useId();
  const { value: selectedValues, onChange, optionRenderer } = useSelect();

  const selected = selectedValues.includes(value);
  return (
    <CommandItem
      id={id}
      key={id}
      value={`${value}`}
      className={styles.multiOption}
      onSelect={() => {
        onChange(value);
      }}
      data-state={selected ? "checked" : undefined}
    >
      {optionRenderer({ label, value })}
      {selected && <Icon name="checkmark" />}
    </CommandItem>
  );
}
