import type { CSSProperties, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import * as Select from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import * as React from "react";
import { SelectContext2 } from "@components/Select/SelectContext2";

type SelectProps = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: string) => void;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export function Select2({
  id,
  initialValue = "",
  value = "",
  enabled = true,
  placeholder,
  updateState = noop,
  validationStatus = "none",
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  optionRenderer = defaultRenderer,
  emptyListTemplate,
  layout,
  children,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const onInputChange = useCallback(
    (selectedOption: Option) => {
      setOpen(false);
      updateState({ value: selectedOption.value });
      onDidChange(selectedOption.value);
    },
    [onDidChange, updateState],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onChange: onInputChange,
      optionRenderer,
    }),
    [onInputChange, optionRenderer, value],
  );

  return (
    <SelectContext2.Provider value={contextValue}>
      <Select.Root>
        <Select.Trigger className="SelectTrigger" aria-label="Food">
          <Select.Value placeholder="Select a fruit…" />
          <Select.Icon className="SelectIcon">
            <Icon name="chevrondown" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="SelectContent">
            <Select.ScrollUpButton className="SelectScrollButton">
              <Icon name="chevronup" />
            </Select.ScrollUpButton>
            <Select.Viewport className="SelectViewport">{children}</Select.Viewport>
            <Select.ScrollDownButton className="SelectScrollButton">
              <Icon name="chevrondown" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </SelectContext2.Provider>
  );
}
