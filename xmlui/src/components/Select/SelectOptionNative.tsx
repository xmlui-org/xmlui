import * as Select from "@radix-ui/react-select";
import React from "react";
import Icon from "@components/Icon/IconNative";
import classnames from "classnames";

type SelectItemProps = React.ComponentProps<typeof Select.Item>;

type SelectOptionProps = SelectItemProps & {
  label: string;
  value: string;
};

export const SelectOption = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  SelectOptionProps
>(({ className, value, label }, forwardedRef) => {
  return (
    <Select.Item className={classnames("SelectItem", className)} value={value} ref={forwardedRef}>
      <Select.ItemText>{label}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <Icon name="check" />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

SelectOption.displayName = "SelectItem";
