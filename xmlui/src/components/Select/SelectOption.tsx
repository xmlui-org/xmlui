import { useEffect, useMemo, type ReactNode } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import classnames from "classnames";
import styles from "./Select.module.scss";

import type { Option } from "../abstractions";
import { useOption } from "./OptionContext";
import Icon from "../Icon/IconNative";

export function SelectOption(option: Option) {
  const { value, label, enabled = true, children } = option;
  const { onOptionAdd } = useOption();

  const opt: Option = useMemo(() => {
    return {
      ...option,
      label: label ?? "",
      keywords: option.keywords || [label ?? ""],
    };
  }, [option, label]);

  useEffect(() => {
    onOptionAdd(opt);
    // Don't remove options when component unmounts - they should persist
  }, [opt, onOptionAdd]);

  return (
    <RadixSelect.Item
      value={value}
      disabled={!enabled}
      className={classnames(styles.multiSelectOption, {
        [styles.disabledOption]: !enabled,
      })}
    >
      <div className={styles.multiSelectOptionContent}>
        <RadixSelect.ItemText>{children || label}</RadixSelect.ItemText>
        <RadixSelect.ItemIndicator>
          <Icon name="checkmark" />
        </RadixSelect.ItemIndicator>
      </div>
    </RadixSelect.Item>
  );
}
