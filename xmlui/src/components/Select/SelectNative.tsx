import {
  useCallback,
  useEffect,
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Portal } from "@ark-ui/react/portal";
import { Select as ArkSelect, createListCollection, useSelect } from "@ark-ui/react/select";
import classnames from "classnames";
import styles from "./Select.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import Icon from "../Icon/IconNative";
import { SelectContext } from "./SelectContext";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { OptionContext } from "./OptionContext";
import { HiddenOption } from "./HiddenOption";
import { Part } from "../Part/Part";

const PART_LIST_WRAPPER = "listWrapper";
const PART_CLEAR_BUTTON = "clearButton";

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
  groupBy?: string;

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

// Helper to convert value to string array for ark-ui
function valueToStringArray(value: ValueType | undefined | null, multiSelect: boolean): string[] {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return multiSelect ? [String(value)] : [String(value)];
}

// Helper to convert string array back to original format
function stringArrayToValue(
  arr: string[],
  multiSelect: boolean,
  originalValue?: ValueType,
): ValueType {
  if (arr.length === 0) {
    return multiSelect ? [] : "";
  }
  if (multiSelect) {
    // Try to preserve original type (number vs string)
    return arr.map((v) => {
      const num = Number(v);
      return !isNaN(num) && String(num) === v ? num : v;
    });
  }
  // Single select - return first value, preserving type
  const val = arr[0];
  const num = Number(val);
  return !isNaN(num) && String(num) === val ? num : val;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
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
    groupBy,

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
  const [options, setOptions] = useState(new Set<Option>());
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue }, { initial: true });
    }
  }, [initialValue, updateState]);

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

  // Create collection for ark-ui
  const collection = useMemo(() => {
    const items = filteredOptions.map((opt) => {
      const item: any = {
        label: opt.label || opt.value,
        value: String(opt.value),
        disabled: opt.enabled === false,
      };
      // Copy all additional properties from the option
      Object.keys(opt).forEach((key) => {
        if (
          ![
            "label",
            "value",
            "enabled",
            "style",
            "className",
            "readOnly",
            "keywords",
            "children",
            "optionRenderer",
          ].includes(key)
        ) {
          item[key] = (opt as any)[key];
        }
      });
      return item;
    });
    return createListCollection({
      items,
      // Use groupBy function if groupBy prop is provided - group by the property name specified
      ...(groupBy ? { groupBy: (item: any) => item[groupBy] || "" } : {}),
    });
  }, [filteredOptions, groupBy]);

  // Convert value to string array for ark-ui
  const arkValue = useMemo(() => valueToStringArray(value, multiSelect), [value, multiSelect]);

  // Handle value change from ark-ui
  const handleValueChange = useCallback(
    (details: { value: string[] }) => {
      const newValue = stringArrayToValue(details.value, multiSelect, value);
      updateState({ value: newValue });
      onDidChange(newValue);
    },
    [multiSelect, value, updateState, onDidChange],
  );

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multiSelect ? [] : "";
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multiSelect, updateState, onDidChange]);

  // Toggle option (for compatibility with existing API)
  const toggleOption = useCallback(
    (selectedValue: SingleValueType) => {
      const strValue = String(selectedValue);
      const newArkValue = multiSelect
        ? arkValue.includes(strValue)
          ? arkValue.filter((v) => v !== strValue)
          : [...arkValue, strValue]
        : arkValue[0] === strValue
          ? []
          : [strValue];

      const newValue = stringArrayToValue(newArkValue, multiSelect, value);
      updateState({ value: newValue });
      onDidChange(newValue);
    },
    [multiSelect, arkValue, value, updateState, onDidChange],
  );

  // Register component API for external interactions
  const focus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

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

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue }, { initial: true });
    }
  }, [initialValue, updateState]);

  // Option management callbacks
  const onOptionAdd = useCallback((option: Option) => {
    setOptions((prev) => {
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
      setOpen: setIsOpen,
      options,
      optionRenderer,
    }),
    [multiSelect, readOnly, value, toggleOption, options, optionRenderer],
  );

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

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <div style={{ display: "none" }}>
          <OptionTypeProvider Component={HiddenOption}>{children}</OptionTypeProvider>
        </div>
        <ArkSelect.Root
          id={id}
          className={styles.select}
          collection={collection}
          value={arkValue}
          onValueChange={handleValueChange}
          disabled={!enabled}
          readOnly={readOnly}
          required={required}
          multiple={multiSelect}
          closeOnSelect={!multiSelect}
          onOpenChange={(details) => setIsOpen(details.open)}
          open={isOpen}
          positioning={{
            sameWidth: true,
            fitViewport: true,
          }}
        >
          <Part partId={PART_LIST_WRAPPER}>
            <ArkSelect.Control>
              <ArkSelect.Trigger
                id={id}
                ref={forwardedRef}
                {...rest}
                autoFocus={autoFocus}
                style={style}
                className={classnames(className, styles.selectTrigger, styles[validationStatus], {
                  [styles.disabled]: !enabled,
                  [styles.multi]: multiSelect,
                })}
                onFocus={focus}
                onBlur={onBlur}
              >
                {/* Value display */}
                <div className={styles.selectTriggerContent}>
                  {multiSelect ? (
                    arkValue.length > 0 ? (
                      <div className={styles.badgeListContainer}>
                        <div className={styles.badgeList}>
                          {arkValue.map((v) => {
                            const option = Array.from(options).find((o) => String(o.value) === v);
                            return valueRenderer && option ? (
                              valueRenderer(option, () => toggleOption(v))
                            ) : (
                              <span key={v} className={styles.badge}>
                                {option?.label || v}
                                <Icon
                                  name="close"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleOption(v);
                                  }}
                                />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className={styles.placeholder}>{placeholder}</span>
                    )
                  ) : arkValue.length > 0 ? (
                    <div className={styles.selectValue}>
                      {(() => {
                        const selectedValue = arkValue[0];
                        const selectedOption = Array.from(options).find(
                          (o) => String(o.value) === selectedValue,
                        );
                        return selectedOption?.label || selectedValue;
                      })()}
                    </div>
                  ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                  )}
                </div>

                {/* Actions (clear + chevron) */}
                <div className={styles.actions}>
                  {arkValue.length > 0 && enabled && !readOnly && clearable && (
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
                  <ArkSelect.Indicator className={styles.action}>
                    <Icon name="chevrondown" />
                  </ArkSelect.Indicator>
                </div>
              </ArkSelect.Trigger>
            </ArkSelect.Control>
          </Part>
          <Portal>
            <ArkSelect.Positioner>
              <ArkSelect.Content
                style={{ height: dropdownHeight }}
                className={classnames(styles.selectContent, styles[validationStatus])}
              >
                <div className={styles.command}>
                  {searchable && (
                    <div className={styles.commandInputContainer}>
                      <Icon name="search" />
                      <input
                        role="searchbox"
                        className={styles.commandInput}
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className={styles.commandList}>
                    {inProgress ? (
                      <div className={styles.loading}>{inProgressNotificationMessage}</div>
                    ) : collection.items.length === 0 ? (
                      <div>{emptyListNode}</div>
                    ) : groupBy ? (
                      // Render grouped items
                      collection.group().map(([groupLabel, groupItems]) => (
                        <ArkSelect.ItemGroup key={groupLabel}>
                          <ArkSelect.ItemGroupLabel>{groupLabel}</ArkSelect.ItemGroupLabel>
                          {groupItems.map((item: any) => {
                            const option = Array.from(options).find(
                              (o) => String(o.value) === item.value,
                            );
                            const isSelected = arkValue.includes(item.value);

                            return (
                              <ArkSelect.Item
                                key={item.value}
                                item={item}
                                className={classnames(styles.multiSelectOption, {
                                  [styles.disabledOption]: item.disabled,
                                })}
                                data-state={isSelected ? "checked" : undefined}
                              >
                                <div className={styles.multiSelectOptionContent}>
                                  {optionRenderer && option ? (
                                    optionRenderer(option, value, false)
                                  ) : (
                                    <>
                                      <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                                      {isSelected && <Icon name="checkmark" />}
                                    </>
                                  )}
                                </div>
                              </ArkSelect.Item>
                            );
                          })}
                        </ArkSelect.ItemGroup>
                      ))
                    ) : (
                      // Render ungrouped items
                      <ArkSelect.ItemGroup>
                        {collection.items.map((item) => {
                          const option = Array.from(options).find(
                            (o) => String(o.value) === item.value,
                          );
                          const isSelected = arkValue.includes(item.value);

                          return (
                            <ArkSelect.Item
                              key={item.value}
                              item={item}
                              className={classnames(styles.multiSelectOption, {
                                [styles.disabledOption]: item.disabled,
                              })}
                              data-state={isSelected ? "checked" : undefined}
                            >
                              <div className={styles.multiSelectOptionContent}>
                                {optionRenderer && option ? (
                                  optionRenderer(option, value, false)
                                ) : (
                                  <>
                                    <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                                    {isSelected && <Icon name="checkmark" />}
                                  </>
                                )}
                              </div>
                            </ArkSelect.Item>
                          );
                        })}
                      </ArkSelect.ItemGroup>
                    )}
                  </div>
                </div>
              </ArkSelect.Content>
            </ArkSelect.Positioner>
          </Portal>
          <ArkSelect.HiddenSelect />
        </ArkSelect.Root>
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});
