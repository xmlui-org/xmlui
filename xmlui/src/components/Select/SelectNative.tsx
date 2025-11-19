import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import classnames from "classnames";
// Note: FocusScope from @radix-ui/react-focus-scope could be added for enhanced focus management
// import { FocusScope } from "@radix-ui/react-focus-scope";
import { SelectOption } from "./SelectOption";
import styles from "./Select.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import Icon from "../Icon/IconNative";
import { SelectContext } from "./SelectContext";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { OptionContext } from "./OptionContext";
import { HiddenOption } from "./HiddenOption";
import { useIsInsideForm } from "../Form/FormContext";
import { SimpleSelect } from "./SimpleSelect";
import { MultiSelectOption } from "./MultiSelectOption";
import { Part } from "../Part/Part";

const PART_CLEAR_BUTTON = "clearButton";
const PART_LIST_WRAPPER = "listWrapper";

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
  clearable: false,
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
  clearable?: boolean;

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
  modal?: boolean;
}

// Common trigger value display props
export interface SelectTriggerValueProps {
  value: ValueType;
  placeholder: string;
  readOnly: boolean;
  multiSelect: boolean;
  options: Set<Option>;
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
  toggleOption: (value: SingleValueType) => void;
}

// Common trigger value display component
export const SelectTriggerValue = ({
  value,
  placeholder,
  readOnly,
  multiSelect,
  options,
  valueRenderer,
  toggleOption,
}: SelectTriggerValueProps) => {
  if (multiSelect) {
    if (Array.isArray(value) && value.length > 0) {
      return (
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
      );
    }
    return (
      <span placeholder={placeholder} className={styles.placeholder}>
        {placeholder}
      </span>
    );
  }

  // Single select
  if (value !== undefined && value !== null && value !== "") {
    const selectedOption = Array.from(options).find((o) => o.value === value);
    return <div className={styles.selectValue}>{selectedOption?.label}</div>;
  }

  return (
    <div aria-placeholder={placeholder} className={styles.placeholder}>
      {readOnly ? "" : placeholder || ""}
    </div>
  );
};

// Common trigger actions (clear button + chevron)
export interface SelectTriggerActionsProps {
  value: ValueType;
  multiSelect: boolean;
  enabled: boolean;
  readOnly: boolean;
  clearable: boolean;
  clearValue: () => void;
  showChevron?: boolean;
}

export const SelectTriggerActions = ({
  value,
  multiSelect,
  enabled,
  readOnly,
  clearable,
  clearValue,
  showChevron = true,
}: SelectTriggerActionsProps) => {
  const hasValue = multiSelect
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== null && value !== "";

  return (
    <div className={styles.actions}>
      {hasValue && enabled && !readOnly && clearable && (
        <Part partId={PART_CLEAR_BUTTON}>
          <span
            className={styles.action}
            onClick={(event) => {
              event.stopPropagation();
              clearValue();
            }}
          >
            <Icon name="close" />
          </span>
        </Part>
      )}
      {showChevron && (
        <span className={styles.action}>
          <Icon name="chevrondown" />
        </span>
      )}
    </div>
  );
};

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
    clearable = defaultProps.clearable,

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
    modal,
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
      if (filteredOptions.length === 0) return -1;

      for (let i = currentIndex + 1; i < filteredOptions.length; i++) {
        const item = filteredOptions[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to beginning
      for (let i = 0; i <= currentIndex; i++) {
        const item = filteredOptions[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [filteredOptions],
  );

  const findPreviousEnabledIndex = useCallback(
    (currentIndex: number) => {
      if (filteredOptions.length === 0) return -1;

      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = filteredOptions[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to end
      for (let i = filteredOptions.length - 1; i >= currentIndex; i--) {
        const item = filteredOptions[i];
        if (item && item.enabled !== false) {
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
            if (selectedItem && selectedItem.enabled !== false) {
              toggleOption(selectedItem.value);
              // Close dropdown after selecting in single-select mode
              if (!multiSelect) {
                setOpen(false);
              }
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
      multiSelect,
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
    setOptions((prev) => {
      // Check if option with same value already exists
      const exists = Array.from(prev).some((opt) => opt.value === option.value);
      if (exists) {
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(option);
      return newSet;
    });
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
      readOnly,
      value,
      onChange: toggleOption,
      setOpen,
      setSelectedIndex,
      options,
      highlightedValue:
        selectedIndex >= 0 &&
        selectedIndex < filteredOptions.length &&
        filteredOptions[selectedIndex]
          ? filteredOptions[selectedIndex].value
          : undefined,
      optionRenderer,
    }),
    [
      multiSelect,
      readOnly,
      value,
      toggleOption,
      options,
      selectedIndex,
      filteredOptions,
      optionRenderer,
    ],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        {searchable || multiSelect ? (
          <OptionTypeProvider Component={HiddenOption}>
            <Popover
              open={open}
              onOpenChange={(isOpen) => {
                if (!enabled) return;
                setOpen(isOpen);
              }}
              modal={modal}
            >
              <Part partId={PART_LIST_WRAPPER}>
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
                    event.stopPropagation();
                    if (enabled) {
                      setOpen((prev) => !prev);
                    }
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
                  <SelectTriggerValue
                    value={value}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    multiSelect={multiSelect}
                    options={options}
                    valueRenderer={valueRenderer}
                    toggleOption={toggleOption}
                  />
                  <SelectTriggerActions
                    value={value}
                    multiSelect={multiSelect}
                    enabled={enabled}
                    readOnly={readOnly}
                    clearable={clearable}
                    clearValue={clearValue}
                  />
                </PopoverTrigger>
              </Part>
              {open && (
                <Portal container={root}>
                  {/* Note: FocusScope could be wrapped here for enhanced focus management */}
                  <PopoverContent
                    style={{ minWidth: width, height: dropdownHeight }}
                    className={classnames(styles.selectContent, styles[validationStatus])}
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
                        {!inProgress &&
                          filteredOptions.map(({ value, label, enabled, keywords }, index) => (
                            <MultiSelectOption
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
                        {!inProgress && filteredOptions.length === 0 && <div>{emptyListNode}</div>}
                      </div>
                    </div>
                  </PopoverContent>
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
              clearable={clearable}
              clearValue={clearValue}
              options={options}
              valueRenderer={valueRenderer}
            >
              {children}
            </SimpleSelect>
          </OptionTypeProvider>
        )}
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});
