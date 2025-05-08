import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useId,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandGroup as CmdGroup,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import styles from "../../components/AutoComplete/AutoComplete.module.scss";
import Icon from "../../components/Icon/IconNative";
import { HiddenOption } from "../Select/SelectNative";
import OptionTypeProvider from "../../components/Option/OptionTypeProvider";
import { AutoCompleteContext, useAutoComplete } from "./AutoCompleteContext";
import { OptionContext, useOption } from "../Select/OptionContext";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";

type AutoCompleteProps = {
  id?: string;
  initialValue?: string | string[];
  value?: string | string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  style?: CSSProperties;
  onDidChange?: (newValue: string | string[]) => void;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
  dropdownHeight?: CSSProperties["height"];
  multi?: boolean;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

function isOptionsExist(options: Set<Option>, newOptions: Option[]) {
  return newOptions.some((option) =>
    Array.from(options).some((o) => o.value === option.value || o.label === option.label),
  );
}

export const AutoComplete = forwardRef(function AutoComplete(
  {
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
    style,
    children,
    autoFocus = false,
    dropdownHeight,
    multi = false,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = false,
  }: AutoCompleteProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Added this
  const [options, setOptions] = useState(new Set<Option>());
  const [inputValue, setInputValue] = useState("");
  const { root } = useTheme();
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const generatedId = useId();
  const inputId = id || generatedId;

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue || [] }, { initial: true });
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

  const toggleOption = useCallback(
    (selectedValue: string) => {
      if (multi) {
        setInputValue("");
      } else {
        setOpen(true);
      }
      if (selectedValue === "") return;
      const newSelectedValue = multi
        ? Array.isArray(value)
          ? value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
            : [...value, selectedValue]
          : [selectedValue]
        : selectedValue === value
          ? null
          : selectedValue;

      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
    },
    [multi, value, updateState, onDidChange],
  );

  useEffect(() => {
    if (!multi) {
      const label = Array.from(options).find((o) => o.value === value)?.label;
      setInputValue(label ? label + "" : "");
    }
  }, [multi, options, value]);

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multi ? [] : "";
    setInputValue("");
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multi, updateState, onDidChange]);

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
      multi,
      value,
      onChange: toggleOption,
      optionRenderer,
      options,
      inputValue,
      open,
      setOpen,
    };
  }, [inputValue, multi, optionRenderer, options, toggleOption, value, open, setOpen]);

  return (
    <AutoCompleteContext.Provider value={autoCompleteContextValue}>
      <OptionTypeProvider Component={HiddenOption}>
        <OptionContext.Provider value={optionContextValue}>
          {children}
          <ItemWithLabel
            id={inputId}
            ref={forwardedRef}
            labelPosition={labelPosition as any}
            label={label}
            labelWidth={labelWidth}
            labelBreak={labelBreak}
            required={required}
            enabled={enabled}
            onFocus={onFocus}
            onBlur={onBlur}
            style={style}
          >
            <Popover open={open}>
              <Cmd
                ref={dropdownRef}
                className={styles.command}
                filter={(value, search, keywords) => {
                  const extendedValue = value + " " + keywords.join(" ");
                  if (extendedValue.toLowerCase().includes(search.toLowerCase())) return 1;
                  return 0;
                }}
              >
                <PopoverTrigger
                  style={{ width: "100%" }}
                  id={inputId}
                  onClick={() => {
                    if (!enabled) return;
                    inputRef?.current?.focus();
                  }}
                >
                  <div
                    ref={setReferenceElement}
                    style={style}
                    className={classnames(styles.badgeListWrapper, styles[validationStatus], {
                      [styles.disabled]: !enabled,
                      [styles.focused]: document.activeElement === inputRef.current,
                    })}
                  >
                    {multi ? (
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
                          id={id}
                          autoFocus={autoFocus}
                          ref={inputRef}
                          value={inputValue}
                          disabled={!enabled}
                          onValueChange={(value) => {
                            setOpen(true);
                            setInputValue(value);
                          }}
                          onFocus={() => {
                            setOpen(true);
                            onFocus();
                          }}
                          onBlur={() => {
                            setOpen(false);
                            onBlur();
                          }}
                          placeholder={placeholder}
                          className={styles.commandInput}
                        />
                      </div>
                    ) : (
                      <CmdInput
                        id={id}
                        autoFocus={autoFocus}
                        ref={inputRef}
                        value={inputValue}
                        disabled={!enabled}
                        onValueChange={(value) => {
                          setOpen(true);
                          setInputValue(value);
                        }}
                        onFocus={() => {
                          setOpen(true);
                          onFocus();
                        }}
                        onBlur={() => {
                          setOpen(false);
                          onBlur();
                        }}
                        placeholder={placeholder}
                        className={styles.commandInput}
                      />
                    )}
                    <div className={styles.actions}>
                      {value?.length > 0 && enabled && (
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            clearValue();
                          }}
                        >
                          <Icon name="close" />
                        </span>
                      )}
                      <span onClick={() => setOpen(true)}>
                        <Icon name="chevrondown" />
                      </span>
                    </div>
                  </div>
                </PopoverTrigger>
                {open && (
                  <Portal container={root}>
                    <PopoverContent
                      asChild
                      style={{ width, height: dropdownHeight }}
                      className={styles.popoverContent}
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <CmdList
                        className={styles.commandList}
                        onMouseUp={() => {
                          inputRef?.current?.focus();
                        }}
                        style={{ height: dropdownHeight }}
                      >
                        <CmdEmpty>{emptyListNode}</CmdEmpty>
                        <CreatableItem />
                        <CmdGroup>
                          {Array.from(options).map(
                            ({ value, label, enabled, keywords, labelText }) => (
                              <AutoCompleteOption
                                key={value}
                                value={value}
                                label={label}
                                enabled={enabled}
                                keywords={keywords}
                                labelText={labelText}
                              />
                            ),
                          )}
                        </CmdGroup>
                      </CmdList>
                    </PopoverContent>
                  </Portal>
                )}
              </Cmd>
            </Popover>
          </ItemWithLabel>
        </OptionContext.Provider>
      </OptionTypeProvider>
    </AutoCompleteContext.Provider>
  );
});

function CreatableItem() {
  const { value, options, inputValue, onChange, setOpen } = useAutoComplete();
  const { onOptionAdd } = useOption();
  if (
    isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
    (Array.isArray(value) && value?.find((s) => s === inputValue)) ||
    inputValue === value
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
        const newOption = { value, label: value, enabled: true, labelText: value };
        onOptionAdd(newOption);
        onChange(value);
        setOpen(false);
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

function AutoCompleteOption({ value, label, enabled = true, keywords }: Option) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer, multi, setOpen } = useAutoComplete();
  const selected = multi ? selectedValue?.includes(value) : selectedValue === value;

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
        setOpen(false);
      }}
      data-state={selected ? "checked" : undefined}
      keywords={keywords}
    >
      {optionRenderer({ label, value })}
      {selected && <Icon name="checkmark" />}
    </CmdItem>
  );
}
