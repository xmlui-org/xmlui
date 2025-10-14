import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { Option } from "../abstractions";
import { Item, ItemIndicator, ItemText } from "@radix-ui/react-select";
import { useSelect } from "./SelectContext";
import { useOption } from "./OptionContext";
import classnames from "classnames";
import styles from "./Select.module.scss";
import Icon from "../Icon/IconNative";

export const SelectOption = forwardRef<React.ElementRef<typeof Item>, Option>(
  function SelectOption(option, ref) {
    const visibleContentRef = useRef<HTMLDivElement>(null);
    const { value, label, enabled = true, children, className } = option;
    const { value: selectedValue, optionRenderer } = useSelect();
    const { onOptionRemove, onOptionAdd } = useOption();

    const opt: Option = useMemo(() => {
      return {
        ...option,
        label: label ?? "",
        keywords: [label ?? ""],
      };
    }, [option, label]);

    useEffect(() => {
      onOptionAdd(opt);
      return () => onOptionRemove(opt);
    }, [opt, onOptionAdd, onOptionRemove]);

    return (
      <Item
        ref={ref}
        className={classnames(className, styles.selectOption)}
        value={value}
        textValue={label}
        disabled={!enabled}
        onClick={(event) => {
          event.stopPropagation();
        }}
        data-state={selectedValue === value && "checked"}
      >
        {/* SelectItemText is used by SelectValue to display the selected value */}
        <span style={{ display: "none" }}>
          <ItemText>{label}</ItemText>
        </span>
        {/* Visible content in the dropdown */}
        {children ? (
          <>
            <div className={styles.selectOptionContent} ref={visibleContentRef}>
              {children}
            </div>
            {selectedValue === value && (
              <ItemIndicator className={styles.selectOptionIndicator}>
                <Icon name="checkmark" />
              </ItemIndicator>
            )}
          </>
        ) : optionRenderer ? (
          <div className={styles.selectOptionContent} ref={visibleContentRef}>
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
              {label}
            </div>
            {selectedValue === value && (
              <ItemIndicator className={styles.selectItemIndicator}>
                <Icon name="checkmark" />
              </ItemIndicator>
            )}
          </>
        )}
      </Item>
    );
  },
);
