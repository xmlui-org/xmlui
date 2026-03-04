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
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import classnames from "classnames";
import styles from "./Select.module.scss";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import { ThemedIcon } from "../Icon/Icon";
import { SelectContext, useSelect } from "./SelectContext";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { HiddenOption } from "./HiddenOption";
import { SimpleSelect } from "./SimpleSelect";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { Part } from "../Part/Part";
import { OptionContext } from "./OptionContext";
import { useFormContextPart } from "../Form/FormContext";

const PART_LIST_WRAPPER = "listWrapper";
const PART_CLEAR_BUTTON = "clearButton";
const PART_CONCISE_VALIDATION_FEEDBACK = "conciseValidationFeedback";

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
  modal: false,
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
  contentClassName?: string;
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

  // Grouping
  groupBy?: string;
  groupHeaderRenderer?: (contextVars: Record<string, any>) => ReactNode;
  ungroupedHeaderRenderer?: () => ReactNode;

  // Internal
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  modal?: boolean;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
}

// Common trigger value display props
interface SelectTriggerValueProps {
  placeholder: string;
  readOnly: boolean;
  multiSelect: boolean;
  selectedOptions: Option[];
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
  toggleOption: (value: SingleValueType) => void;
}

// Common trigger value display component
const SelectTriggerValue = ({
  placeholder,
  readOnly,
  multiSelect,
  selectedOptions,
  valueRenderer,
  toggleOption,
}: SelectTriggerValueProps) => {
  if (selectedOptions.length) {
    if (multiSelect) {
      return (
        <div className={styles.badgeListContainer}>
          <div className={styles.badgeList}>
            {selectedOptions.map((option) =>
              valueRenderer ? (
                valueRenderer(option, () => {
                  if (!readOnly) toggleOption(option.value);
                })
              ) : (
                <span key={option.value} className={styles.badge}>
                  {option.label}
                  <ThemedIcon
                    name="close"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!readOnly) toggleOption(option.value);
                    }}
                  />
                </span>
              ),
            )}
          </div>
        </div>
      );
    } else {
      // Single-select mode: use valueRenderer if provided, otherwise use default label display
      if (valueRenderer) {
        return valueRenderer(selectedOptions[0], () => {
          if (!readOnly) toggleOption(selectedOptions[0].value);
        });
      }
      return <div className={styles.selectValue}>{selectedOptions[0]?.label}</div>;
    }
  }

  return (
    <span placeholder={placeholder} className={styles.placeholder}>
      {placeholder}
    </span>
  );
};

// Common trigger actions (clear button + chevron)
interface SelectTriggerActionsProps {
  value: ValueType;
  multiSelect: boolean;
  enabled: boolean;
  readOnly: boolean;
  clearValue: () => void;
  showChevron?: boolean;
  clearable: boolean;
  validationIcon?: string | null;
  validationStatus: ValidationStatus;
  invalidMessages: string[];
  finalValidationIconSuccess: string;
  finalValidationIconError: string;
  finalVerboseValidationFeedback: boolean;
}

const SelectTriggerActions = ({
  value,
  multiSelect,
  enabled,
  readOnly,
  clearable,
  clearValue,
  showChevron = true,
  validationStatus,
  invalidMessages,
  finalValidationIconSuccess,
  finalValidationIconError,
  finalVerboseValidationFeedback,
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
            <ThemedIcon name="close" />
          </span>
        </Part>
      )}
      {!finalVerboseValidationFeedback && (
        <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
          <ConciseValidationFeedback
            validationStatus={validationStatus}
            invalidMessages={invalidMessages}
            successIcon={finalValidationIconSuccess}
            errorIcon={finalValidationIconError}
          />
        </Part>
      )}
      {showChevron && (
        <span
          className={classnames(styles.action, { [styles.disabled]: !enabled || readOnly })}
          aria-disabled={!enabled || readOnly}
        >
          <ThemedIcon name="chevrondown" />
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
    contentClassName,
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

    // Grouping
    groupBy,
    groupHeaderRenderer,
    ungroupedHeaderRenderer,

    // Internal
    updateState = noop,
    registerComponentApi,
    children,
    modal = defaultProps.modal,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    invalidMessages,

    ...rest
  },
  forwardedRef,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const contextVerboseValidationFeedback = useFormContextPart((ctx) => ctx?.verboseValidationFeedback);
  const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
  const finalValidationIconSuccess = validationIconSuccess ?? contextValidationIconSuccess ?? "checkmark";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "close";

  let validationIcon = null;
  if (!finalVerboseValidationFeedback) {
    if (validationStatus === "valid") {
      validationIcon = finalValidationIconSuccess;
    } else if (validationStatus === "error") {
      validationIcon = finalValidationIconError;
    }
  }

  const selectedOptions = useMemo(() => {
    if (!multiSelect) {
      return options.filter((option) => `${option.value}` === `${value}`);
    } else {
      return Array.isArray(value)
        ? options.filter((option) => value.map((v) => String(v)).includes(String(option.value)))
        : [];
    }
  }, [multiSelect, options, value]);

  // Use initialValue as fallback when value is undefined
  // This ensures the component displays the initial value immediately on first render
  const currentValue = value !== undefined ? value : initialValue;

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

  // Group options if groupBy is provided
  const groupedOptions = useMemo(() => {
    if (!groupBy) return null;

    const optionsToGroup = searchTerm ? filteredOptions : Array.from(options);

    // Early return if no options to group - prevents empty dropdown issue
    if (optionsToGroup.length === 0) return null;

    const groups: Record<string, Option[]> = {};

    optionsToGroup.forEach((option) => {
      // Use nullish coalescing to properly handle falsy values like 0, "", or false
      const groupKey = (option as any)[groupBy] ?? "Ungrouped";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(option);
    });

    // Sort groups to put "Ungrouped" first
    const sortedGroups: Record<string, Option[]> = {};
    if (groups["Ungrouped"]) {
      sortedGroups["Ungrouped"] = groups["Ungrouped"];
    }
    Object.keys(groups)
      .filter((key) => key !== "Ungrouped")
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    // Return null if no groups have any options
    return Object.keys(sortedGroups).length > 0 ? sortedGroups : null;
  }, [groupBy, options, filteredOptions, searchTerm]);

  // Create a flat list from grouped options for keyboard navigation
  const flattenedGroupedOptions = useMemo(() => {
    if (!groupedOptions) return null;

    const flattened: Option[] = [];
    Object.entries(groupedOptions).forEach(([_, groupOptions]) => {
      flattened.push(...groupOptions);
    });
    return flattened;
  }, [groupedOptions]);

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
    const currentObserver = observer.current;
    currentObserver?.disconnect();

    if (current) {
      const newObserver = new ResizeObserver(() => setPanelWidth(current.clientWidth));
      observer.current = newObserver;
      newObserver.observe(current);

      return () => {
        newObserver.disconnect();
      };
    }

    return () => {
      currentObserver?.disconnect();
    };
  }, [referenceElement]);

  // Handle option selection
  const toggleOption = useCallback(
    (selectedValue: SingleValueType) => {
      const newSelectedValue = multiSelect
        ? Array.isArray(currentValue)
          ? currentValue.map((v) => String(v)).includes(String(selectedValue))
            ? currentValue.filter((v) => String(v) !== String(selectedValue))
            : [...currentValue, selectedValue]
          : [selectedValue]
        : String(selectedValue) === String(currentValue)
          ? null
          : selectedValue;
      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      if (!multiSelect) {
        setOpen(false);
      }
    },
    [multiSelect, currentValue, updateState, onDidChange],
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
      // Use the appropriate options list based on grouping and search state
      // When groupBy is set, always use flattenedGroupedOptions to maintain correct order
      const optionsList = flattenedGroupedOptions ? flattenedGroupedOptions : filteredOptions;

      if (optionsList.length === 0) return -1;

      for (let i = currentIndex + 1; i < optionsList.length; i++) {
        const item = optionsList[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to beginning
      for (let i = 0; i <= currentIndex; i++) {
        const item = optionsList[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [filteredOptions, flattenedGroupedOptions],
  );

  const findPreviousEnabledIndex = useCallback(
    (currentIndex: number) => {
      // Use the appropriate options list based on grouping and search state
      // When groupBy is set, always use flattenedGroupedOptions to maintain correct order
      const optionsList = flattenedGroupedOptions ? flattenedGroupedOptions : filteredOptions;

      if (optionsList.length === 0) return -1;

      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = optionsList[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to end
      for (let i = optionsList.length - 1; i >= currentIndex; i--) {
        const item = optionsList[i];
        if (item && item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [filteredOptions, flattenedGroupedOptions],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!open) return;

      // Use the appropriate options list based on grouping and search state
      // When groupBy is set, always use flattenedGroupedOptions to maintain correct order
      const optionsList = flattenedGroupedOptions ? flattenedGroupedOptions : filteredOptions;

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
          if (selectedIndex >= 0 && selectedIndex < optionsList.length) {
            const selectedItem = optionsList[selectedIndex];
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
      flattenedGroupedOptions,
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
          <ThemedIcon name="noresult" />
          <span>List is empty</span>
        </div>
      ),
    [emptyListTemplate],
  );

  const onOptionAdd = useCallback((option: Option) => {
    setOptions((prev) => [...prev, option]);
  }, []);

  const onOptionRemove = useCallback((option: Option) => {
    setOptions((prev) => prev.filter((opt) => opt.value !== option.value));
  }, []);

  const selectContextValue = useMemo(
    () => ({
      multiSelect,
      readOnly,
      value: currentValue,
      onChange: toggleOption,
      setOpen,
      setSelectedIndex,
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
      currentValue,
      toggleOption,
      selectedIndex,
      filteredOptions,
      optionRenderer,
    ],
  );

  const optionContextValue = useMemo(
    () => ({
      onOptionAdd,
      onOptionRemove,
    }),
    [onOptionAdd, onOptionRemove],
  );

  // Use SimpleSelect for non-searchable, single-select mode
  const useSimpleSelect = !searchable && !multiSelect;

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        {useSimpleSelect ? (
          // SimpleSelect mode (Radix UI Select)
          <SimpleSelect
            value={currentValue as SingleValueType}
            onValueChange={(val) => toggleOption(val)}
            id={id}
            options={options}
            style={style}
            className={className}
            contentClassName={contentClassName}
            onFocus={onFocus}
            onBlur={onBlur}
            enabled={enabled}
            triggerRef={setReferenceElement}
            autoFocus={autoFocus}
            placeholder={placeholder}
            height={dropdownHeight}
            panelWidth={panelWidth}
            readOnly={readOnly}
            emptyListNode={emptyListNode}
            modal={modal}
            groupBy={groupBy}
            groupHeaderRenderer={groupHeaderRenderer}
            ungroupedHeaderRenderer={ungroupedHeaderRenderer}
            clearable={clearable}
            onClear={clearValue}
            valueRenderer={valueRenderer}
            validationStatus={validationStatus}
            invalidMessages={invalidMessages}
            finalValidationIconSuccess={finalValidationIconSuccess}
            finalValidationIconError={finalValidationIconError}
            finalVerboseValidationFeedback={finalVerboseValidationFeedback}
            {...rest}
          >
            {children}
          </SimpleSelect>
        ) : (
          // Popover mode (searchable or multi-select)
          <>
            <Popover
              open={open}
              onOpenChange={(isOpen) => {
                if (!enabled || readOnly) return;
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
                  className={classnames(className, styles.selectTrigger, styles[validationStatus], {
                    [styles.disabled]: !enabled,
                    [styles.multi]: multiSelect,
                  })}
                  role="combobox"
                  onClick={(event) => {
                    if (!enabled || readOnly) return;
                    event.stopPropagation();
                    setOpen((prev) => !prev);
                  }}
                  onKeyDown={(event) => {
                    if (!enabled || readOnly) return;

                    // Handle opening dropdown with keyboard
                    if (
                      !open &&
                      (event.key === "ArrowDown" ||
                        event.key === "ArrowUp" ||
                        event.key === " " ||
                        event.key === "Enter")
                    ) {
                      event.preventDefault();
                      setOpen(true);
                      // Set initial selectedIndex to first enabled option if options exist
                      if (filteredOptions.length > 0) {
                        const firstEnabledIndex = findNextEnabledIndex(-1);
                        setSelectedIndex(firstEnabledIndex !== -1 ? firstEnabledIndex : 0);
                      }
                      return;
                    }

                    // Handle keyboard navigation when dropdown is open
                    if (open) {
                      handleKeyDown(event);
                    }
                  }}
                  autoFocus={autoFocus}
                >
                  <SelectTriggerValue
                    readOnly={readOnly}
                    placeholder={placeholder}
                    multiSelect={multiSelect}
                    selectedOptions={selectedOptions}
                    valueRenderer={valueRenderer}
                    toggleOption={toggleOption}
                  />
                  <SelectTriggerActions
                    value={currentValue}
                    multiSelect={multiSelect}
                    enabled={enabled}
                    readOnly={readOnly}
                    clearable={clearable}
                    clearValue={clearValue}
                    validationIcon={validationIcon}
                    validationStatus={validationStatus}
                    invalidMessages={invalidMessages}
                    finalValidationIconSuccess={finalValidationIconSuccess}
                    finalValidationIconError={finalValidationIconError}
                    finalVerboseValidationFeedback={finalVerboseValidationFeedback}
                  />
                </PopoverTrigger>
              </Part>
              <Portal container={root}>
                <PopoverContent
                  style={{ minWidth: panelWidth, height: dropdownHeight }}
                  className={classnames(contentClassName, styles.selectContent, styles[validationStatus])}
                  onKeyDown={handleKeyDown}
                >
                  <div className={styles.command}>
                    {searchable ? (
                      <div className={styles.commandInputContainer}>
                        <ThemedIcon name="search" />
                        <input
                          role="searchbox"
                          className={classnames(styles.commandInput)}
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    ) : (
                      <button aria-hidden="true" className={styles.srOnly} />
                    )}
                    <div role="listbox" className={styles.commandList}>
                      {inProgress ? (
                        <div className={styles.loading}>{inProgressNotificationMessage}</div>
                      ) : // When searching, show filtered options (with or without grouping)
                      groupBy && groupedOptions ? (
                        // Render grouped filtered options
                        Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                          <div key={groupName}>
                            {groupName === "Ungrouped" ? (
                              ungroupedHeaderRenderer && (
                                <div className={styles.groupHeader}>
                                  {ungroupedHeaderRenderer()}
                                </div>
                              )
                            ) : groupHeaderRenderer ? (
                              <div className={styles.groupHeader}>
                                {groupHeaderRenderer({ $group: groupName })}
                              </div>
                            ) : (
                              <div className={styles.groupHeader}>{groupName}</div>
                            )}
                            {groupOptions.map(({ value, label, enabled, keywords }, groupIndex) => {
                              // Use flattenedGroupedOptions for correct index when groupBy is set
                              const optionsList = flattenedGroupedOptions || filteredOptions;
                              const globalIndex = optionsList.findIndex(
                                (opt) => opt.value === value,
                              );
                              return (
                                <SelectOptionItem
                                  key={value}
                                  readOnly={readOnly}
                                  value={value}
                                  label={label}
                                  enabled={enabled}
                                  keywords={keywords}
                                  isHighlighted={selectedIndex === globalIndex}
                                  itemIndex={globalIndex}
                                />
                              );
                            })}
                          </div>
                        ))
                      ) : (
                        // Render flat filtered options
                        filteredOptions.map(({ value, label, enabled, keywords }, index) => (
                          <SelectOptionItem
                            key={value}
                            readOnly={readOnly}
                            value={value}
                            label={label}
                            enabled={enabled}
                            keywords={keywords}
                            isHighlighted={selectedIndex === index}
                            itemIndex={index}
                          />
                        ))
                      )}
                      {filteredOptions.length === 0 && emptyListNode}
                    </div>
                  </div>
                </PopoverContent>
              </Portal>
            </Popover>
          </>
        )}
        <div style={{ display: "none" }}>
          <OptionTypeProvider Component={HiddenOption}>{children}</OptionTypeProvider>
        </div>
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});

// Internal option component for rendering items in the dropdown
function SelectOptionItem(option: Option & { isHighlighted?: boolean; itemIndex?: number }) {
  const {
    value,
    label,
    enabled = true,
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

  const optionRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.map((v) => String(v)).includes(value)
      : String(selectedValue) === String(value);
  }, [selectedValue, value, multiSelect]);

  // Scroll into view when highlighted
  useEffect(() => {
    if (isHighlighted && optionRef.current) {
      optionRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isHighlighted]);

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
      ref={optionRef}
      role="option"
      aria-disabled={!enabled}
      aria-selected={selected}
      className={classnames(styles.multiSelectOption, {
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
      <div className={styles.multiSelectOptionContent}>
        {optionRenderer ? (
          optionRenderer({ label, value, enabled }, selectedValue as any, false)
        ) : (
          <>
            {children || label}
            {selected && <ThemedIcon name="checkmark" />}
          </>
        )}
      </div>
    </div>
  );
}
