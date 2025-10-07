import type { CSSProperties, ForwardedRef, ReactNode } from "react";
import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  Content as SelectContent,
  Icon as SelectIcon,
  Item as SelectItem,
  ItemIndicator as SelectItemIndicator,
  ItemText as SelectItemText,
  Portal as SelectPortal,
  Root as SelectRoot,
  SelectViewport,
  ScrollDownButton,
  ScrollUpButton,
  Trigger as SelectTrigger,
} from "@radix-ui/react-select";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import classnames from "classnames";
import { FocusScope } from "@radix-ui/react-focus-scope";

import styles from "./Select.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import Icon from "../Icon/IconNative";
import { SelectContext, useSelect } from "./SelectContext";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { OptionContext, useOption } from "./OptionContext";
import { HiddenOption } from "./HiddenOption";
import { useIsInsideForm } from "../Form/FormContext";

export const defaultProps = {
  enabled: true,
  placeholder: "",
  autoFocus: false,
  searchable: false,
  multiSelect: false,
  required: false,
  inProgress: false,
  inProgressNotificationMessage: "",
  readOnly: false,
  validationStatus: "none" as ValidationStatus,
  labelBreak: false,
};

export type SingleValueType = string | number;
export type ValueType = SingleValueType | SingleValueType[];

// Core Select component props
interface SelectProps {
  // Basic props
  id?: string;
  initialValue?: ValueType;
  value?: ValueType;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;

  // Styling
  style?: CSSProperties;
  className?: string;
  dropdownHeight?: CSSProperties["height"];

  // Validation
  validationStatus?: ValidationStatus;

  // Event handlers
  onDidChange?: (newValue: ValueType) => void;
  onFocus?: () => void;
  onBlur?: () => void;

  // Multi-select and search
  searchable?: boolean;
  multiSelect?: boolean;

  // Templates and renderers (legacy - kept for compatibility)
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
  emptyListTemplate?: ReactNode;
  optionRenderer?: (item: Option, value: any, inTrigger: boolean) => ReactNode;

  // Progress state
  inProgress?: boolean;
  inProgressNotificationMessage?: string;

  // Internal
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
}

// SimpleSelect props interface for better type safety
interface SimpleSelectProps {
  value: SingleValueType;
  onValueChange: (selectedValue: SingleValueType) => void;
  id: string;
  style: React.CSSProperties;
  className?: string;
  onFocus: () => void;
  onBlur: () => void;
  enabled: boolean;
  validationStatus: ValidationStatus;
  triggerRef: (value: ((prevState: HTMLElement) => HTMLElement) | HTMLElement) => void;
  autoFocus: boolean;
  placeholder: string;
  height: CSSProperties["height"];
  width: number;
  children: ReactNode;
  readOnly: boolean;
  emptyListNode: ReactNode;
}

const SimpleSelect = forwardRef<HTMLElement, SimpleSelectProps>(
  function SimpleSelect(props, forwardedRef) {
    const { root } = useTheme();
    const {
      enabled,
      onBlur,
      autoFocus,
      onValueChange,
      validationStatus,
      value,
      height,
      style,
      placeholder,
      id,
      triggerRef,
      onFocus,
      width,
      children,
      readOnly,
      emptyListNode,
      className,
      ...rest
    } = props;

    const { options } = useSelect();
    const composedRef = forwardRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;

    // Convert value to string for Radix UI compatibility
    const stringValue = useMemo(() => {
      return value != undefined ? String(value) : undefined;
    }, [value]);

    // Handle value changes with proper type conversion
    const handleValueChange = useCallback(
      (val: string) => {
        if (readOnly) return;
        onValueChange(val);
      },
      [onValueChange, readOnly],
    );

    const optionsArray = useMemo(() => Array.from(options), [options]);

    const selectedOption = useMemo(() => {
      return optionsArray.find((option) => String(option.value) === String(value));
    }, [optionsArray, value]);

    return (
      <SelectRoot value={stringValue} onValueChange={handleValueChange}>
        <SelectTrigger
          {...rest}
          id={id}
          ref={composedRef}
          aria-haspopup="listbox"
          style={style}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={!enabled}
          className={classnames(className, styles.selectTrigger, {
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          })}
          onClick={(event) => {
            // Prevent event propagation to parent elements (e.g., DropdownMenu)
            // This ensures that clicking the Select trigger doesn't close the containing DropdownMenu
            event.stopPropagation();
          }}
          autoFocus={autoFocus}
        >
          <div
            className={classnames(styles.selectValue, {
              [styles.selectValue]: value !== undefined,
              [styles.placeholder]: value === undefined,
            })}
          >
            {selectedOption ? selectedOption.label : readOnly ? "" : placeholder}
          </div>
          <SelectIcon asChild>
            <Icon name="chevrondown" />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal container={root}>
          <SelectContent
            className={styles.selectContent}
            position="popper"
            style={{ maxHeight: height, minWidth: width }}
          >
            <ScrollUpButton className={styles.selectScrollUpButton}>
              <Icon name="chevronup" />
            </ScrollUpButton>
            <SelectViewport className={styles.selectViewport} role="listbox">
              {children}
              {optionsArray.length === 0 && emptyListNode}
            </SelectViewport>
            <ScrollDownButton className={styles.selectScrollDownButton}>
              <Icon name="chevrondown" />
            </ScrollDownButton>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    );
  },
);

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    // Basic props
    id,
    initialValue,
    value,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    autoFocus = defaultProps.autoFocus,
    readOnly = false,
    required = defaultProps.required,

    // Styling
    style,
    className,
    dropdownHeight,

    // Validation
    validationStatus = defaultProps.validationStatus,

    // Event handlers
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,

    // Multi-select and search
    searchable = defaultProps.searchable,
    multiSelect = defaultProps.multiSelect,

    emptyListTemplate,
    valueRenderer,
    optionRenderer,

    // Progress state
    inProgress = defaultProps.inProgress,
    inProgressNotificationMessage = defaultProps.inProgressNotificationMessage,

    // Internal
    updateState = noop,
    registerComponentApi,
    children,

    ...rest
  },
  forwardedRef,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());
  const isInForm = useIsInsideForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return Array.from(options);
    }

    const searchLower = searchTerm.toLowerCase();
    return Array.from(options).filter((option) => {
      const extendedValue =
        option.value + " " + option.label + " " + (option.keywords || []).join(" ");
      return extendedValue.toLowerCase().includes(searchLower);
    });
  }, [options, searchTerm]);

  // Reset selected index when options change or dropdown closes
  useEffect(() => {
    if (!open) {
      setSelectedIndex(-1);
      setSearchTerm("");
    }
  }, [open]);

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue }, { initial: true });
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
    (selectedValue: SingleValueType) => {
      const newSelectedValue = multiSelect
        ? Array.isArray(value)
          ? value.map((v) => String(v)).includes(String(selectedValue))
            ? value.filter((v) => String(v) !== String(selectedValue))
            : [...value, selectedValue]
          : [selectedValue]
        : String(selectedValue) === String(value)
          ? null
          : selectedValue;
      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      if (!multiSelect) {
        setOpen(false);
      }
    },
    [multiSelect, value, updateState, onDidChange],
  );

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multiSelect ? [] : "";
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multiSelect, updateState, onDidChange]);

  // Helper functions to find next/previous enabled option
  const findNextEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex + 1; i < filteredOptions.length; i++) {
        const item = filteredOptions[i];
        if (item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to beginning
      for (let i = 0; i <= currentIndex; i++) {
        const item = filteredOptions[i];
        if (item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [filteredOptions],
  );

  const findPreviousEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = filteredOptions[i];
        if (item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to end
      for (let i = filteredOptions.length - 1; i >= currentIndex; i--) {
        const item = filteredOptions[i];
        if (item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [filteredOptions],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const nextIndex = findNextEnabledIndex(prev);
            return nextIndex !== -1 ? nextIndex : prev;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const prevIndex = findPreviousEnabledIndex(prev);
            return prevIndex !== -1 ? prevIndex : prev;
          });
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
            const selectedItem = filteredOptions[selectedIndex];
            if (selectedItem.enabled !== false) {
              toggleOption(selectedItem.value);
            }
          }
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
      }
    },
    [
      open,
      selectedIndex,
      filteredOptions,
      toggleOption,
      findNextEnabledIndex,
      findPreviousEnabledIndex,
    ],
  );

  // Register component API for external interactions
  const focus = useCallback(() => {
    referenceElement?.focus();
  }, [referenceElement]);

  const setValue = useEvent((newValue: string) => {
    toggleOption(newValue);
  });

  const reset = useEvent(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue });
      onDidChange(initialValue);
    } else {
      clearValue();
    }
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
      reset,
    });
  }, [focus, registerComponentApi, setValue, reset]);

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

  const selectContextValue = useMemo(
    () => ({
      multiSelect,
      value,
      onChange: toggleOption,
      setOpen,
      setSelectedIndex,
      options,
      optionRenderer,
    }),
    [multiSelect, toggleOption, value, options, optionRenderer],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        {searchable || multiSelect ? (
          <OptionTypeProvider Component={HiddenOption}>
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger
                {...rest}
                ref={composeRefs(setReferenceElement, forwardedRef)}
                id={id}
                aria-haspopup="listbox"
                style={style}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={!enabled}
                aria-expanded={open}
                onClick={(event) => {
                  // Prevent event propagation to parent elements (e.g., DropdownMenu)
                  // This ensures that clicking the Select trigger doesn't close the containing DropdownMenu
                  event.stopPropagation();
                  setOpen((prev) => !prev);
                }}
                className={classnames(
                  styles.selectTrigger,
                  styles[validationStatus],
                  {
                    [styles.disabled]: !enabled,
                    [styles.multi]: multiSelect,
                  },
                  className,
                )}
                autoFocus={autoFocus}
              >
                <>
                  {multiSelect ? (
                    Array.isArray(value) && value.length > 0 ? (
                      <div className={styles.badgeListContainer}>
                        <div className={styles.badgeList}>
                          {value.map((v) =>
                            valueRenderer ? (
                              valueRenderer(
                                Array.from(options).find((o) => o.value === `${v}`),
                                () => {
                                  toggleOption(v);
                                },
                              )
                            ) : (
                              <span key={v} className={styles.badge}>
                                {Array.from(options).find((o) => o.value === `${v}`)?.label}
                                <Icon
                                  name="close"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleOption(v);
                                  }}
                                />
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <span placeholder={placeholder} className={styles.placeholder}>
                        {placeholder}
                      </span>
                    )
                  ) : value !== undefined && value !== null ? (
                    <div>{Array.from(options).find((o) => o.value === value)?.label}</div>
                  ) : (
                    <span aria-placeholder={placeholder} className={styles.placeholder}>
                      {placeholder || ""}
                    </span>
                  )}
                  <div className={styles.actions}>
                    {((multiSelect && Array.isArray(value) && value.length > 0) ||
                      (!multiSelect && value !== undefined && value !== null && value !== "")) &&
                      enabled &&
                      !readOnly && (
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
                    <span className={styles.action}>
                      <Icon name="chevrondown" />
                    </span>
                  </div>
                </>
              </PopoverTrigger>
              {open && (
                <Portal container={root}>
                  <FocusScope asChild loop trapped>
                    <PopoverContent
                      style={{ minWidth: width, height: dropdownHeight }}
                      className={styles.selectContent}
                      onKeyDown={handleKeyDown}
                    >
                      <div className={styles.command}>
                        {searchable ? (
                          <div className={styles.commandInputContainer}>
                            <Icon name="search" />
                            <input
                              role="combobox"
                              className={classnames(styles.commandInput)}
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button autoFocus aria-hidden="true" className={styles.srOnly} />
                        )}
                        <div role="listbox" className={styles.commandList}>
                          {inProgress && (
                            <div className={styles.loading}>{inProgressNotificationMessage}</div>
                          )}
                          {filteredOptions.map(({ value, label, enabled, keywords }, index) => (
                            <ComboboxOption
                              key={value}
                              readOnly={readOnly}
                              value={value}
                              label={label}
                              enabled={enabled}
                              keywords={keywords}
                              isHighlighted={selectedIndex === index}
                              itemIndex={index}
                            />
                          ))}
                          {!inProgress && filteredOptions.length === 0 && (
                            <div>{emptyListNode}</div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </FocusScope>
                </Portal>
              )}
            </Popover>
            {children}
          </OptionTypeProvider>
        ) : (
          <OptionTypeProvider Component={SelectOption}>
            <SimpleSelect
              {...rest}
              readOnly={!!readOnly}
              ref={forwardedRef}
              key={isInForm ? (value ? `status-${value}` : "status-initial") : undefined} //workaround for https://github.com/radix-ui/primitives/issues/3135
              value={value as SingleValueType}
              onValueChange={toggleOption}
              id={id}
              style={style}
              className={className}
              onFocus={onFocus}
              onBlur={onBlur}
              enabled={enabled}
              validationStatus={validationStatus}
              triggerRef={setReferenceElement}
              autoFocus={autoFocus}
              placeholder={placeholder}
              height={dropdownHeight}
              width={width}
              emptyListNode={emptyListNode}
            >
              {children}
            </SimpleSelect>
          </OptionTypeProvider>
        )}
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});

export const ComboboxOption = forwardRef(function Combobox(
  option: Option & { isHighlighted?: boolean; itemIndex?: number },
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const {
    label,
    value,
    enabled = true,
    keywords,
    readOnly,
    children,
    isHighlighted = false,
    itemIndex,
  } = option;
  const {
    value: selectedValue,
    onChange,
    multiSelect,
    setOpen,
    setSelectedIndex,
    optionRenderer,
  } = useSelect();
  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.map((v) => String(v)).includes(value)
      : String(selectedValue) === String(value);
  }, [selectedValue, value, multiSelect]);

  const handleClick = () => {
    if (readOnly) {
      setOpen(false);
      return;
    }
    if (enabled) {
      onChange(value);
    }
  };

  return (
    <div
      id={id}
      ref={forwardedRef}
      role="option"
      aria-disabled={!enabled}
      aria-selected={isHighlighted}
      className={classnames(styles.multiComboboxOption, {
        [styles.disabledOption]: !enabled,
        [styles.highlighted]: isHighlighted,
      })}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => {
        if (itemIndex !== undefined && setSelectedIndex && enabled) {
          setSelectedIndex(itemIndex);
        }
      }}
      onClick={handleClick}
      data-state={selected ? "checked" : undefined}
    >
      <div className={styles.multiComboboxOptionContent}>
        {optionRenderer ? (
          optionRenderer({ label, value, enabled, keywords }, selectedValue as any, false)
        ) : (
          <>
            {children || label}
            {selected && <Icon name="checkmark" />}
          </>
        )}
      </div>
    </div>
  );
});

const SelectOption = React.forwardRef<React.ElementRef<typeof SelectItem>, Option>(
  (option, ref) => {
    const visibleContentRef = useRef<HTMLDivElement>(null);
    const { value, label, enabled = true, children, className } = option;
    const { value: selectedValue, optionRenderer } = useSelect();
    const { onOptionRemove, onOptionAdd } = useOption();

    const opt: Option = useMemo(() => {
      return {
        ...option,
        label: label ?? "",
        keywords: [label ?? ""],
      };
    }, [option, label]);

    useEffect(() => {
      onOptionAdd(opt);
      return () => onOptionRemove(opt);
    }, [opt, onOptionAdd, onOptionRemove]);

    return (
      <SelectItem
        ref={ref}
        className={classnames(styles.selectItem, className)}
        value={value}
        textValue={label}
        disabled={!enabled}
        onClick={(event) => {
          event.stopPropagation();
        }}
        data-state={selectedValue === value && "checked"}
      >
        {/* SelectItemText is used by SelectValue to display the selected value */}
        <span style={{ display: "none" }}>
          <SelectItemText>{label}</SelectItemText>
        </span>
        {/* Visible content in the dropdown */}
        {children ? (
          <>
            <div className={styles.selectItemContent} ref={visibleContentRef}>
              {children}
            </div>
            {selectedValue === value && (
              <SelectItemIndicator className={styles.selectItemIndicator}>
                <Icon name="checkmark" />
              </SelectItemIndicator>
            )}
          </>
        ) : optionRenderer ? (
          <div className={styles.selectItemContent} ref={visibleContentRef}>
            {optionRenderer(
              {
                label,
                value,
                enabled,
              },
              selectedValue as any,
              false,
            )}
          </div>
        ) : (
          <>
            <div className={styles.selectItemContent} ref={visibleContentRef}>
              {label}
            </div>
            {selectedValue === value && (
              <SelectItemIndicator className={styles.selectItemIndicator}>
                <Icon name="checkmark" />
              </SelectItemIndicator>
            )}
          </>
        )}
      </SelectItem>
    );
  },
);

SelectOption.displayName = "SelectOption";
