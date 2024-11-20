"use client";

import * as React from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "./Command";
import classnames from "classnames";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import Icon from "@components/Icon/IconNative";
import styles from "./Combobox.module.scss";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useRef, useState } from "react";
import { useCallback, useEffect } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import type { Option, ValidationStatus } from "@components/abstractions";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { ComboboxOption } from "@components/Combobox/ComboboxtOptionNative";
import { ComboboxContext } from "@components/Combobox/ComboboxContext";

type ComboboxProps = {
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

export function Combobox({
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
}: ComboboxProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const onInputChange = useCallback(
    (selectedValue: string) => {
      setOpen(false);
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
    <ComboboxContext.Provider value={contextValue}>
      <OptionTypeProvider Component={ComboboxOption}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              style={layout}
              ref={setReferenceElement}
              id={id}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              aria-expanded={open}
              className={classnames(styles.comboboxButton, styles[validationStatus], {
                [styles.disabled]: !enabled,
              })}
            >
              <span>{value ? value : placeholder || ""}</span>
              <Icon name="chevrondown" />
            </button>
          </PopoverTrigger>
          <PopoverContent className={styles.popoverContent} style={{ width }}>
            <Command>
              <CommandInput placeholder="Search..." className={styles.commandInput} />
              <CommandList className={styles.commandList}>
                <CommandGroup className={styles.commandGroup}>{children}</CommandGroup>
                <CommandEmpty className={styles.commandEmpty}>
                  {emptyListTemplate ?? (
                    <>
                      <Icon name={"noresult"} />
                      <span>List is empty</span>
                    </>
                  )}
                </CommandEmpty>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </OptionTypeProvider>
    </ComboboxContext.Provider>
  );
}
