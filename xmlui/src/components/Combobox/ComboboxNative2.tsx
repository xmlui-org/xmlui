"use client";

import * as React from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "./Command";
import classnames from "classnames";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@components/Button/ButtonNative";
import Icon from "@components/Icon/IconNative";
import styles from "./Combobox2.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useRef, useState } from "react";
import { useCallback, useEffect } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import { SelectContext2 } from "@components/Select/SelectContext2";
import type { Option, ValidationStatus } from "@components/abstractions";

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
  optionRenderer?: (option: Option) => ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
};

function defaultRenderer(option: Option) {
  return <div>{option.label}</div>;
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
  validationStatus = "none",
  optionRenderer = defaultRenderer,
  registerComponentApi,
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
    (selectedOption: Option) => {
      setOpen(false);
      updateState({ value: selectedOption.value });
      onDidChange(selectedOption.value);
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

  const focus = useCallback(() => {
    referenceElement?.focus();
  }, [referenceElement]);

  useEffect(() => {
    registerComponentApi?.({
      focus,
    });
  }, [focus, registerComponentApi]);

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
            className={classnames(styles.comboboxButton, styles[validationStatus], {
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
              {React.Children.toArray(children).length > 0 ? (
                <CommandGroup className={styles.commandGroup}>{children}</CommandGroup>
              ) : (
                <CommandEmpty className={styles.commandEmpty}>
                  {emptyListTemplate ?? (
                    <>
                      <Icon name={"noresult"} />
                      <span>List is empty</span>
                    </>
                  )}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </SelectContext2.Provider>
  );
}
