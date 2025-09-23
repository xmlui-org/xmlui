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
import OptionTypeProvider from "../../components/Option/OptionTypeProvider";
import { AutoCompleteContext, useAutoComplete } from "./AutoCompleteContext";
import { OptionContext, useOption } from "../Select/OptionContext";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { HiddenOption } from "../Select/HiddenOption";
import { PART_INPUT } from "../../components-core/parts";

const PART_LIST_WRAPPER = "listWrapper";

type AutoCompleteProps = {
  id?: string;
  initialValue?: string | string[];
  value?: string | string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: Option, value: any, inTrigger: boolean) => ReactNode;
  emptyListTemplate?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onDidChange?: (newValue: string | string[]) => void;
  validationStatus?: ValidationStatus;
  onFocus?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onItemCreated?: (item: string) => void;
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
  readOnly?: boolean;
  creatable?: boolean;
  initiallyOpen?: boolean;
};

function isOptionsExist(options: Set<Option>, newOptions: Option[]) {
  return newOptions.some((option) =>
    Array.from(options).some((o) => o.value === option.value || o.label === option.label),
  );
}

export const defaultProps: Partial<AutoCompleteProps> = {
  enabled: true,
  readOnly: false,
  autoFocus: false,
  multi: false,
  required: false,
  validationStatus: "none",
  creatable: false,
  updateState: noop,
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  onItemCreated: noop,
  initiallyOpen: false,
};

export const AutoComplete = forwardRef(function AutoComplete(
  {
    id,
    initialValue,
    value,
    enabled = defaultProps.enabled,
    placeholder,
    updateState = defaultProps.updateState,
    validationStatus = defaultProps.validationStatus,
    onDidChange = defaultProps.onDidChange,
    onFocus = defaultProps.onFocus,
    onBlur = defaultProps.onBlur,
    onItemCreated = defaultProps.onItemCreated,
    registerComponentApi,
    emptyListTemplate,
    style,
    className,
    children,
    readOnly = defaultProps.readOnly,
    autoFocus = defaultProps.autoFocus,
    dropdownHeight,
    multi = defaultProps.multi,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = defaultProps.required,
    creatable = defaultProps.creatable,
    optionRenderer,
    initiallyOpen = defaultProps.initiallyOpen,
    ...rest
  }: AutoCompleteProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(initiallyOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState(new Set<Option>());
  const [inputValue, setInputValue] = useState("");
  const { root } = useTheme();
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const generatedId = useId();
  const inputId = id || generatedId;
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  const selectedValue = useMemo(() => {
    const optionsArray = Array.from(options);

    if (Array.isArray(value)) {
      if (value.length === 0) return [];
      return optionsArray.filter((o) => value.includes(`${o.value}`));
    }

    return optionsArray.find((o) => `${o.value}` === `${value}`);
  }, [value, options]);

  const toggleOption = useCallback(
    (selectedItem: string) => {
      if (multi) {
        setInputValue("");
        setSearchTerm("");
      } else {
        setOpen(true);
      }
      if (selectedItem === "") return;
      const newSelectedValue = multi
        ? Array.isArray(value)
          ? value.includes(selectedItem)
            ? value.filter((v) => v !== selectedItem)
            : [...value, selectedItem]
          : [selectedItem]
        : selectedItem === value
          ? null
          : selectedItem;

      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      inputRef.current?.focus();
    },
    [multi, value, updateState, onDidChange],
  );

  useEffect(() => {
    if (!Array.isArray(selectedValue)) {
      setInputValue(selectedValue?.label || "");
      setSearchTerm("");
    }
  }, [multi, selectedValue]);

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

  const setValue = useEvent((newValue: string | string[]) => {
    updateState({ value: newValue });
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
      options,
      inputValue,
      open,
      setOpen,
      optionRenderer,
    };
  }, [inputValue, multi, options, toggleOption, value, open, setOpen, optionRenderer]);

  return (
    <AutoCompleteContext.Provider value={autoCompleteContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <OptionTypeProvider Component={HiddenOption}>
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              if (readOnly) return;
              setOpen(isOpen);
            }}
            modal={false}
          >
            <Cmd
              ref={dropdownRef}
              className={styles.command}
              filter={(value, search, keywords) => {
                if (readOnly) return 1;
                if (!searchTerm || searchTerm.trim() === "") return 1;
                const extendedValue = value + " " + keywords.join(" ");
                if (extendedValue.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
              }}
            >
              <ItemWithLabel
                {...rest}
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
                className={className}
              >
                <PopoverTrigger asChild>
                  <div
                    data-part-id={PART_LIST_WRAPPER}
                    ref={setReferenceElement}
                    style={{ width: "100%", ...style }}
                    className={classnames(
                      className,
                      styles.badgeListWrapper,
                      styles[validationStatus],
                      {
                        [styles.disabled]: !enabled,
                        [styles.focused]: isFocused,
                      },
                    )}
                  >
                    {Array.isArray(selectedValue) && (
                      <div className={styles.badgeList}>
                        {selectedValue.map((v, index) => (
                          <span key={index} className={styles.badge}>
                            {v?.label}
                            {!readOnly && (
                              <Icon
                                name="close"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleOption(v.value);
                                }}
                              />
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <CmdInput
                      onFocus={(ev) => {
                        setIsFocused(true);
                        onFocus(ev);
                      }}
                      onBlur={(ev) => {
                        if (inputValue === "" && !multi) {
                          clearValue();
                        } else {
                          if (!Array.isArray(selectedValue) && selectedValue) {
                            setInputValue(selectedValue?.label);
                          } else {
                            setInputValue("");
                          }
                        }
                        onBlur(ev);
                        setIsFocused(false);
                      }}
                      onKeyDown={(event) => {
                        if (readOnly) return;
                        if (event.key === "ArrowDown") {
                          setOpen(true);
                        }
                        if (event.key === "Enter") {
                          setOpen((prev) => !prev);
                        }
                      }}
                      id={inputId}
                      data-part-id={PART_INPUT}
                      readOnly={readOnly}
                      autoFocus={autoFocus}
                      aria-expanded={open}
                      ref={inputRef}
                      value={inputValue}
                      disabled={!enabled}
                      onValueChange={(value) => {
                        setOpen(true);
                        setInputValue(value);
                        setSearchTerm(value);
                      }}
                      placeholder={!readOnly ? placeholder : ""}
                      className={styles.commandInput}
                    />
                    <div className={styles.actions}>
                      {value?.length > 0 && enabled && !readOnly && (
                        <span
                          className={styles.action}
                          onClick={(event) => {
                            event.stopPropagation();
                            clearValue();
                          }}
                        >
                          <Icon name="close" />
                        </span>
                      )}
                      <span
                        className={styles.action}
                        onClick={() => {
                          if (readOnly) return;
                          setOpen(!open);
                        }}
                      >
                        <Icon name="chevrondown" />
                      </span>
                    </div>
                  </div>
                </PopoverTrigger>
              </ItemWithLabel>

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
                      role="listbox"
                      className={styles.commandList}
                      style={{ height: dropdownHeight }}
                    >
                      <CmdEmpty>{emptyListNode}</CmdEmpty>
                      {creatable && <CreatableItem onNewItem={onItemCreated} />}
                      <CmdGroup>
                        {Array.from(options).map(({ value, label, enabled, keywords }) => (
                          <AutoCompleteOption
                            key={value}
                            value={value}
                            label={label}
                            enabled={enabled}
                            keywords={keywords}
                            readOnly={readOnly}
                          />
                        ))}
                      </CmdGroup>
                    </CmdList>
                  </PopoverContent>
                </Portal>
              )}
            </Cmd>
          </Popover>
          {children}
        </OptionTypeProvider>
      </OptionContext.Provider>
    </AutoCompleteContext.Provider>
  );
});

type CreatableItemProps = {
  onNewItem: (item: string) => void;
};

function CreatableItem({onNewItem}: CreatableItemProps) {
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
        const newOption = { value, label: value, enabled: true };
        onOptionAdd(newOption);
        onNewItem?.(value);
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

function AutoCompleteOption(option: Option) {
  const { value, label, enabled = true, keywords, readOnly, children } = option;
  const id = useId();
  const { value: selectedValue, onChange, multi, setOpen, optionRenderer } = useAutoComplete();
  const selected = multi ? selectedValue?.includes(value) : selectedValue === value;

  return (
    <CmdItem
      id={id}
      key={id}
      disabled={!enabled}
      value={`${value}`}
      className={classnames(styles.autoCompleteOption, {
        [styles.disabledOption]: !enabled,
      })}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSelect={() => {
        if (!readOnly && enabled) onChange(value);
        setOpen(false);
      }}
      data-state={enabled ? (selected ? "checked" : undefined) : "disabled"}
      keywords={keywords}
    >
      {children ? (
        <>
          <div className={styles.autoCompleteOptionContent}>{children}</div>
          {selected && <Icon name="checkmark" />}
        </>
      ) : optionRenderer ? (
        optionRenderer({ label, value, enabled }, selectedValue as any, false)
      ) : (
        <>
          <div className={styles.autoCompleteOptionContent}>{label}</div>
          {selected && <Icon name="checkmark" />}
        </>
      )}
    </CmdItem>
  );
}
