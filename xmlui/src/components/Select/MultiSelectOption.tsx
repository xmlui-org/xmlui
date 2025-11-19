import { useEffect, useMemo, useRef } from "react";
import classnames from "classnames";
import styles from "./Select.module.scss";

import type { Option } from "../abstractions";
import { useSelect } from "./SelectContext";
import Icon from "../Icon/IconNative";

interface MultiSelectOptionProps extends Option {
  isHighlighted?: boolean;
  itemIndex?: number;
}

export function MultiSelectOption(option: MultiSelectOptionProps) {
  const {
    value,
    label,
    enabled = true,
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

  const optionRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.map((v) => String(v)).includes(value)
      : String(selectedValue) === String(value);
  }, [selectedValue, value, multiSelect]);

  // Scroll into view when highlighted
  useEffect(() => {
    if (isHighlighted && optionRef.current) {
      optionRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isHighlighted]);

  const handleClick = () => {
    if (readOnly) {
      setOpen(false);
      return;
    }
    if (enabled) {
      onChange?.(value);
    }
  };

  return (
    <div
      ref={optionRef}
      role="option"
      aria-disabled={!enabled}
      aria-selected={selected}
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
          optionRenderer({ label, value, enabled }, selectedValue as any, false)
        ) : (
          <>
            {children || label}
            {selected && <Icon name="checkmark" />}
          </>
        )}
      </div>
    </div>
  );
}
