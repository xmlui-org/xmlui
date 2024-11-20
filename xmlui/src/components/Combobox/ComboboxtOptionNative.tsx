import { useId } from "react";

import { CommandItem } from "@components/Combobox/Command";
import styles from "@components/MultiSelect/MultiOption.module.scss";
import * as React from "react";
import Icon from "@components/Icon/IconNative";
import { useCombobox } from "@components/Combobox/ComboboxContext";
import classnames from "classnames";

type OptionComponentProps = {
  value: string;
  label: string;
  enabled?: boolean;
};

export function ComboboxOption({ value, label, enabled = true }: OptionComponentProps) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer } = useCombobox();
  const selected = selectedValue === value;

  return (
    <CommandItem
      id={id}
      key={id}
      disabled={!enabled}
      value={`${value}`}
      className={classnames(styles.multiOption)}
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
