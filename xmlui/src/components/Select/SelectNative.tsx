import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import { useLayoutEffect } from "react";
import { useId, useRef } from "react";
import { useState } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import {
  Portal as SelectPortal,
  Content as SelectContent,
  Root as SelectRoot,
  ScrollDownButton,
  ScrollUpButton,
  Value as SelectValue,
  Icon as SelectIcon,
  Trigger as SelectTrigger,
  Viewport as SelectViewport,
} from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import { SelectContext, useSelect } from "@components/Select/SelectContext";
import styles from "./Select.module.scss";
import classnames from "classnames";
import { useTheme } from "@components-core/theming/ThemeContext";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { SelectOption } from "@components/Select/SelectOptionNative";
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { useEvent } from "@components-core/utils/misc";
import { OptionContext, useOption } from "@components/Select/OptionContext";

type SelectProps = {
  id?: string;
  initialValue?: string | string[];
  value?: string | string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: string | string[]) => void;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
  searchable?: boolean;
  multi?: boolean;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export function Select({
  id,
  initialValue,
  value,
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
  autoFocus = false,
  searchable = false,
  multi = false,
}: SelectProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue });
    }
  }, [initialValue, updateState]);

  // Observe the size of the reference element
  useEffect(() => {
    const current = referenceElement;
    observer.current?.disconnect();

    if (current) {
      observer.current = new ResizeObserver(() => setWidth(current.clientWidth));
      observer.current.observe(current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [referenceElement]);

  // Handle option selection
  const toggleOption = useCallback(
    (selectedValue: string) => {
      const newSelectedValue = multi
        ? Array.isArray(value)
          ? value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
            : [...value, selectedValue]
          : [selectedValue]
        : selectedValue;

      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      setOpen(false);
    },
    [multi, value, updateState, onDidChange],
  );

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multi ? [] : "";
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multi, updateState, onDidChange]);

  // Register component API for external interactions
  const focus = useCallback(() => {
    referenceElement?.focus();
  }, [referenceElement]);

  const setValue = useEvent((newValue: string) => {
    toggleOption(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  // Render the "empty list" message
  const emptyListNode = useMemo(
    () =>
      emptyListTemplate ?? (
        <div className={styles.selectEmpty}>
          <Icon name="noresult" />
          <span>List is empty</span>
        </div>
      ),
    [emptyListTemplate],
  );

  const onOptionAdd = useCallback((option: Option) => {
    setOptions((prev) => new Set(prev).add(option));
  }, []);

  const onOptionRemove = useCallback((option: Option) => {
    setOptions((prev) => {
      const optionsSet = new Set(prev);
      optionsSet.delete(option);
      return optionsSet;
    });
  }, []);

  const optionContextValue = useMemo(
    () => ({
      onOptionAdd,
      onOptionRemove,
    }),
    [onOptionAdd, onOptionRemove],
  );

  return (
    <SelectContext.Provider
      value={{
        multi,
        value,
        optionRenderer,
        onChange: toggleOption,
      }}
    >
      <OptionTypeProvider Component={searchable || multi ? HiddenOption : SelectOption}>
        {searchable || multi ? (
          <OptionContext.Provider value={optionContextValue}>
            {children}
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                <button
                  id={id}
                  style={layout}
                  ref={setReferenceElement}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  disabled={!enabled}
                  aria-expanded={open}
                  onClick={() => setOpen((prev) => !prev)}
                  className={classnames(styles.selectTrigger, styles[validationStatus], {
                    [styles.disabled]: !enabled,
                    [styles.multi]: multi,
                  })}
                  autoFocus={autoFocus}
                >
                  {multi ? (
                    Array.isArray(value) && value.length > 0 ? (
                      <div className={styles.badgeListContainer}>
                        <div className={styles.badgeList}>
                          {value.map((v) => (
                            <span key={v} className={styles.badge}>
                              {Array.from(options).find((o) => o.value === v)?.label}
                              <Icon
                                name="close"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleOption(v);
                                }}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className={styles.placeholder}>{placeholder || ""}</span>
                    )
                  ) : value ? (
                    <span>{Array.from(options).find((o) => o.value === value)?.label}</span>
                  ) : (
                    <span className={styles.placeholder}>{placeholder || ""}</span>
                  )}
                  <div className={styles.actions}>
                    {multi && Array.isArray(value) && value.length > 0 && (
                      <Icon
                        name="close"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearValue();
                        }}
                      />
                    )}
                    <Icon name="chevrondown" />
                  </div>
                </button>
              </PopoverTrigger>
              <Portal container={root}>
                <PopoverContent style={{ width }} className={styles.selectContent}>
                  <Cmd className={styles.command}>
                    {searchable ? (
                      <div className={styles.commandInputContainer}>
                        <Icon name="search" />
                        <CmdInput
                          className={classnames(styles.commandInput)}
                          placeholder="Search..."
                        />
                      </div>
                    ) : (
                      // https://github.com/pacocoursey/cmdk/issues/322#issuecomment-2444703817
                      <button autoFocus aria-hidden="true" className={styles.srOnly} />
                    )}
                    <CmdList className={styles.commandList}>
                      {Array.from(options).map(({ value, label, enabled }) => (
                        <ComboboxOption key={value} value={value} label={label} enabled={enabled} />
                      ))}
                      <CmdEmpty>{emptyListNode}</CmdEmpty>
                    </CmdList>
                  </Cmd>
                </PopoverContent>
              </Portal>
            </Popover>
          </OptionContext.Provider>
        ) : (
          <SelectRoot
            value={!Array.isArray(value) && value ? value : ""}
            onValueChange={toggleOption}
          >
            <SelectTrigger
              id={id}
              style={layout}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={!enabled}
              className={classnames(styles.selectTrigger, styles[validationStatus])}
              ref={setReferenceElement}
              autoFocus={autoFocus}
            >
              <div className={styles.selectValue}>
                <SelectValue placeholder={placeholder} />
              </div>
              <SelectIcon asChild>
                <Icon name="chevrondown" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal container={root}>
              <SelectContent className={styles.selectContent} position="popper">
                <ScrollUpButton className={styles.selectScrollUpButton}>
                  <Icon name="chevronup" />
                </ScrollUpButton>
                <SelectViewport className={classnames(styles.selectViewport)}>
                  {children || emptyListNode}
                </SelectViewport>
                <ScrollDownButton className={styles.selectScrollDownButton}>
                  <Icon name="chevrondown" />
                </ScrollDownButton>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        )}
      </OptionTypeProvider>
    </SelectContext.Provider>
  );
}

export function ComboboxOption({ value, label, enabled = true }: Option) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer, multi } = useSelect();
  const selected =
    typeof selectedValue === "object" && multi
      ? selectedValue.includes(value)
      : selectedValue === value;

  return (
    <CmdItem
      id={id}
      key={id}
      disabled={!enabled}
      value={value}
      className={styles.multiComboboxOption}
      onSelect={() => {
        onChange(value);
      }}
      data-state={selected ? "checked" : undefined}
      keywords={[label]}
    >
      {optionRenderer({ label, value })}
      {selected && <Icon name="checkmark" />}
    </CmdItem>
  );
}

export function HiddenOption(option: Option) {
  const { onOptionRemove, onOptionAdd } = useOption();

  useLayoutEffect(() => {
    onOptionAdd(option);
    return () => onOptionRemove(option);
  }, [option, onOptionAdd, onOptionRemove]);

  return <span style={{ display: "none" }} />;
}
