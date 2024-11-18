import * as SelectPrimitive from "@radix-ui/react-select";
import React from "react";
import Icon from "@components/Icon/IconNative";
import styles from "./SelectOption.module.scss";

type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

type SelectOptionProps = SelectItemProps & {
  label: string;
  value: string;
};

export const SelectOption = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectOptionProps
>(({ value, label }, ref) => {
  return (
    <SelectPrimitive.Item ref={ref} className={styles.selectItem} value={value}>
      <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
      <span className={styles.selectItemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <Icon name="checkmark" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

SelectOption.displayName = "SelectOption";
