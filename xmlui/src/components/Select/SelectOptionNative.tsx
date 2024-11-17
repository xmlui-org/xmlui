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
      <span className={styles.selectItemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <Icon name="check" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

SelectOption.displayName = "SelectOption";
