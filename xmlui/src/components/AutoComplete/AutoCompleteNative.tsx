import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option, ValidationStatus } from "@components/abstractions";
import { noop } from "@components-core/constants";
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandGroup as CmdGroup,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";
import styles from "@components/AutoComplete/AutoComplete.module.scss";
import Icon from "@components/Icon/IconNative";
import { HiddenOption } from "@components/Select/SelectNative";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { AutoCompleteContext, useAutoComplete } from "@components/AutoComplete/AutoCompleteContext";
import { OptionContext, useOption } from "@components/Select/OptionContext";
import classnames from "classnames";
import { useEvent } from "@components-core/utils/misc";

type AutoCompleteProps = {
  id?: string;
  initialValue?: string[];
  value?: string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: string[]) => void;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

function isOptionsExist(options: Set<Option>, newOptions: Option[]) {
  return newOptions.some((option) => Array.from(options).some((o) => o.value === option.value));
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AutoComplete({
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
}: AutoCompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Added this
  const [options, setOptions] = useState(new Set<Option>());
  const [onScrollbar, setOnScrollbar] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue });
    }
  }, [initialValue, updateState]);

  const toggleOption = useCallback(
    (selectedValue: string) => {
      setInputValue("");
      if (selectedValue === "") return;
      const newSelectedValue = Array.isArray(value)
        ? value.includes(selectedValue)
          ? value.filter((v) => v !== selectedValue)
          : [...value, selectedValue]
        : [selectedValue];
      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
    },
    [value, updateState, onDidChange],
  );

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = [];
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [updateState, onDidChange]);

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

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
      inputRef.current.blur();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [open]);

  // Render the "empty list" message
  const emptyListNode = useMemo(
    () =>
      emptyListTemplate ?? (
        <div className={styles.autoCompleteEmpty}>
          <Icon name="noresult" />
          <span>List is empty</span>
        </div>
      ),
    [emptyListTemplate],
  );

  // Register component API for external interactions
  const focus = useCallback(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  const setValue = useEvent((newValue: string) => {
    updateState({ value: Array.isArray(newValue) ? newValue : [newValue] });
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  const optionContextValue = useMemo(
    () => ({
      onOptionAdd,
      onOptionRemove,
    }),
    [onOptionAdd, onOptionRemove],
  );

  const autoCompleteContextValue = useMemo(() => {
    return {
      value,
      onChange: toggleOption,
      optionRenderer,
      options,
      inputValue,
    };
  }, [inputValue, optionRenderer, options, toggleOption, value]);

  return (
    <AutoCompleteContext.Provider value={autoCompleteContextValue}>
      <OptionTypeProvider Component={HiddenOption}>
        <OptionContext.Provider value={optionContextValue}>
          {children}
          <Cmd ref={dropdownRef} className={styles.command}>
            <div
              onClick={() => {
                if (!enabled) return;
                inputRef?.current?.focus();
              }}
              className={classnames(styles.badgeListWrapper, styles[validationStatus], {
                [styles.disabled]: !enabled,
                [styles.focused]: document.activeElement === inputRef.current,
              })}
            >
              <div className={styles.badgeList}>
                {Array.isArray(value) &&
                  value.map((v) => (
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
                <CmdInput
                  ref={inputRef}
                  value={inputValue}
                  disabled={!enabled}
                  onValueChange={(value) => {
                    setOpen(true);
                    setInputValue(value);
                  }}
                  onFocus={(event) => {
                    setOpen(true);
                    onFocus();
                  }}
                  onBlur={(event) => {
                    setOpen(false);
                    onBlur();
                  }}
                  placeholder={placeholder}
                  className={styles.commandInput}
                />
              </div>
              <div className={styles.actions}>
                {value?.length > 0 && enabled && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      clearValue();
                    }}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                )}
                <button onClick={() => setOpen(true)}>
                  <Icon name="chevrondown" />
                </button>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              {open && (
                <CmdList
                  className={styles.commandList}
                  onMouseUp={() => {
                    inputRef?.current?.focus();
                  }}
                >
                  <CmdEmpty>{emptyListNode}</CmdEmpty>
                  <CreatableItem />
                  <CmdGroup>
                    {Array.from(options).map(({ value, label, enabled }) => (
                      <AutoCompleteOption
                        key={value}
                        value={value}
                        label={label}
                        enabled={enabled}
                      />
                    ))}
                  </CmdGroup>
                </CmdList>
              )}
            </div>
          </Cmd>
        </OptionContext.Provider>
      </OptionTypeProvider>
    </AutoCompleteContext.Provider>
  );
}

function CreatableItem() {
  const { value, options, inputValue, onChange } = useAutoComplete();
  const { onOptionAdd } = useOption();
  if (
    isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
    (Array.isArray(value) && value?.find((s) => s === inputValue))
  ) {
    return <span style={{ display: "none" }} />;
  }

  const Item = (
    <CmdItem
      value={inputValue}
      className={styles.autoCompleteOption}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSelect={(value) => {
        const newOption = { value, label: value, enabled: true };
        onOptionAdd(newOption);
        onChange(value);
      }}
    >
      {`Create "${inputValue}"`}
    </CmdItem>
  );

  // For normal creatable
  if (inputValue.length > 0) {
    return Item;
  }

  return <span style={{ display: "none" }} />;
}

function AutoCompleteOption({ value, label, enabled = true }: Option) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer } = useAutoComplete();
  const selected = selectedValue?.includes(value);

  return (
    <CmdItem
      id={id}
      key={id}
      disabled={!enabled}
      value={`${value}`}
      className={styles.autoCompleteOption}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
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
