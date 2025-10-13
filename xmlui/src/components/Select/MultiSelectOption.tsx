import { type ForwardedRef, forwardRef, useId, useMemo } from "react";
import type { Option } from "../abstractions";
import { useSelect } from "./SelectContext";
import classnames from "classnames";
import styles from "./Select.module.scss";
import Icon from "../Icon/IconNative";

export const MultiSelectOption = forwardRef<
  HTMLDivElement,
  Option & { isHighlighted?: boolean; itemIndex?: number }
>(function MultiSelectOption(option, forwardedRef: ForwardedRef<HTMLDivElement>) {
  const id = useId();
  const {
    label,
    value,
    enabled = true,
    keywords,
    readOnly,
    children,
    isHighlighted = false,
    itemIndex,
  } = option;
  const {
    value: selectedValue,
    onChange,
    multiSelect,
    setOpen,
    setSelectedIndex,
    optionRenderer,
  } = useSelect();
  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.map((v) => String(v)).includes(value)
      : String(selectedValue) === String(value);
  }, [selectedValue, value, multiSelect]);

  const handleClick = () => {
    if (readOnly) {
      setOpen(false);
      return;
    }
    if (enabled) {
      onChange(value);
    }
  };

  return (
    <div
      id={id}
      ref={forwardedRef}
      role="option"
      aria-disabled={!enabled}
      aria-selected={isHighlighted}
      className={classnames(styles.multiSelectOption, {
        [styles.disabledOption]: !enabled,
        [styles.highlighted]: isHighlighted,
      })}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => {
        if (itemIndex !== undefined && setSelectedIndex && enabled) {
          setSelectedIndex(itemIndex);
        }
      }}
      onClick={handleClick}
      data-state={selected ? "checked" : undefined}
    >
      <div className={styles.multiSelectOptionContent}>
        {optionRenderer ? (
          optionRenderer({ label, value, enabled, keywords }, selectedValue as any, false)
        ) : (
          <>
            {children || label}
            {selected && <Icon name="checkmark" />}
          </>
        )}
      </div>
    </div>
  );
});
