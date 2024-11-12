"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command";
import classnames from "classnames";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@components/Button/ButtonNative";
import Icon from "@components/Icon/IconNative";
import { CheckIcon } from "@components/Icon/CheckIcon";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import styles from "./Combobox2.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect } from "react";
import type { UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import type { Option } from "@components/abstractions";

type Combobox2Props = {
  id?: string;
  value?: string;
  initialValue?: string;
  enabled?: boolean;
  placeholder?: string;
  children: ReactNode;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  layout?: CSSProperties;
  emptyListTemplate?: ReactNode;
  optionRenderer?: (item: Option) => ReactNode;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export function Combobox2({
  id,
  value,
  initialValue,
  placeholder,
  children,
  layout,
  enabled = true,
  updateState,
  onDidChange = noop,
  optionRenderer = defaultRenderer,
  emptyListTemplate,
}: Combobox2Props) {
  const { options, selectContextValue } = useSelectContextValue();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const onInputChange = useCallback(
    (selectedValue: string) => {
      updateState({ value: selectedValue });
      onDidChange(selectedValue);
    },
    [onDidChange, updateState],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      {children}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild style={layout}>
          <Button variant="outlined" aria-expanded={open} className={classnames(styles.comboboxButton, {
            [styles.disabled]: !enabled,
          })}>
            {value
              ? options.find((framework) => framework.value === value)?.label
              : placeholder || ""}
            <Icon name="chevrondown" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.popoverContent}>
          <Command>
            <CommandInput placeholder="Search..." className={styles.commandInput} />
            <CommandList className={styles.commandList}>
              <CommandEmpty className={styles.commandEmpty}>
                {emptyListTemplate ?? (
                  <span className={styles.empty}>
                    <Icon name={"noresult"} />
                    List is empty
                  </span>
                )}
              </CommandEmpty>
              <CommandGroup className={styles.commandGroup}>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    className={styles.commandItem}
                    onSelect={(currentValue) => {
                      onInputChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {optionRenderer(option)}
                    <CheckIcon
                      className={classnames(
                        styles.checkIcon,
                        value === option.value && styles.checkIconVisible,
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </SelectContext.Provider>
  );
}
