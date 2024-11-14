"use client";

import * as React from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "./Command";
import classnames from "classnames";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@components/Button/ButtonNative";
import Icon from "@components/Icon/IconNative";
import styles from "./Combobox2.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import { useCallback, useEffect } from "react";
import type { UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import { SelectContext2 } from "@components/Select/SelectContext2";

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
  optionRenderer?: (label: string) => ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
};

function defaultRenderer(label: string) {
  return <div>{label}</div>;
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
  onFocus = noop,
  onBlur = noop,
  optionRenderer = defaultRenderer,
  emptyListTemplate,
}: Combobox2Props) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();

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

  useEffect(() => {
    const current = referenceElement as any;
    // --- We are already observing old element
    if (observer?.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(() => setWidth((referenceElement as any).clientWidth));
    if (current && observer.current) {
      observer.current.observe(referenceElement as any);
    }
  }, [referenceElement]);

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  return (
    <SelectContext2.Provider
      value={{
        value,
        onChange: onInputChange,
        optionRenderer,
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          asChild
          style={layout}
          ref={setReferenceElement}
          id={id}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        >
          <Button
            variant="outlined"
            aria-expanded={open}
            className={classnames(styles.comboboxButton, {
              [styles.disabled]: !enabled,
            })}
          >
            {value ? value : placeholder || ""}
            <Icon name="chevrondown" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.popoverContent} style={{ width }}>
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
              <CommandGroup className={styles.commandGroup}>{children}</CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </SelectContext2.Provider>
  );
}
