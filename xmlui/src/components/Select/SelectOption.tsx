import { forwardRef, useRef } from "react";
import type { Option } from "../abstractions";
import { Item, ItemIndicator, ItemText } from "@radix-ui/react-select";
import { useSelect } from "./SelectContext";
import classnames from "classnames";
import styles from "./Select.module.scss";
import { ThemedIcon } from "../Icon/Icon";

const SELECT_ITEM_VALUE_PREFIX = "__xmlui_select_value__";

export function toRadixSelectItemValue(value: any): string {
  return `${SELECT_ITEM_VALUE_PREFIX}:${typeof value}:${String(value)}`;
}

export const SelectOption = forwardRef<React.ElementRef<typeof Item>, Option>(
  function SelectOption(option, ref) {
    const visibleContentRef = useRef<HTMLDivElement>(null);
    const { value, label, enabled = true, children, className } = option;
    const { value: selectedValue, optionRenderer } = useSelect();
    const itemValue = toRadixSelectItemValue(value);
    const selected = toRadixSelectItemValue(selectedValue) === itemValue;

    return (
      <Item
        ref={ref}
        className={classnames(className, styles.selectOption)}
        value={itemValue}
        textValue={label}
        aria-label={label || itemValue}
        data-component-type="Option"
        disabled={!enabled}
        onClick={(event) => {
          event.stopPropagation();
        }}
        data-state={selected && "checked"}
      >
        {/* Visible content in the dropdown */}
        {children ? (
          <>
            <div className={styles.selectOptionContent} ref={visibleContentRef}>
              <span style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}>
                <ItemText>{label}</ItemText>
              </span>
              {children}
            </div>
            {selected && (
              <ItemIndicator className={styles.selectOptionIndicator}>
                <ThemedIcon name="checkmark" />
              </ItemIndicator>
            )}
          </>
        ) : optionRenderer ? (
          <div className={styles.selectOptionContent} ref={visibleContentRef}>
            <span style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}>
              <ItemText>{label}</ItemText>
            </span>
            {optionRenderer(
              {
                label,
                value,
                enabled,
              },
              selectedValue as any,
              false,
            )}
          </div>
        ) : (
          <>
            <div className={styles.selectOptionContent} ref={visibleContentRef}>
              <ItemText>{label || value}</ItemText>
            </div>
            {selected && (
              <ItemIndicator className={styles.selectItemIndicator}>
                <ThemedIcon name="checkmark" />
              </ItemIndicator>
            )}
          </>
        )}
      </Item>
    );
  },
);
