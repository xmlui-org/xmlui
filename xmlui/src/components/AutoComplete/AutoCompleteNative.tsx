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
import { HiddenOption } from "../Select/HiddenOption";
import { PART_INPUT } from "../../components-core/parts";
import { Part } from "../Part/Part";

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
    required = defaultProps.required,
    creatable = defaultProps.creatable,
    optionRenderer,
    initiallyOpen = defaultProps.initiallyOpen,
    ...rest
  }: AutoCompleteProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(initiallyOpen);
  const [options, setOptions] = useState(new Set<Option>());
  const [inputValue, setInputValue] = useState("");
  const { root } = useTheme();
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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

  // Check if we should show creatable item
  const shouldShowCreatable = useMemo(() => {
    if (!creatable || !searchTerm || searchTerm.trim() === "") return false;

    // Check if the search term already exists as an option
    const searchTermExists = Array.from(options).some(
      (option) => option.value === searchTerm || option.label === searchTerm,
    );

    if (searchTermExists) return false;

    // Check if it's already selected
    if (Array.isArray(value) && value.includes(searchTerm)) return false;
    if (value === searchTerm) return false;

    // Only show creatable if there are no matching filtered options
    return filteredOptions.length === 0;
  }, [creatable, searchTerm, options, value, filteredOptions]);

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
      if (selectedItem === "") return;

      // Check if the option is enabled
      const option = Array.from(options).find((opt) => opt.value === selectedItem);
      if (option && option.enabled === false) return;

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

      if (multi) {
        setInputValue("");
        setSearchTerm("");
        // Keep dropdown open for multi-select
      } else {
        // Close dropdown for single select
        setOpen(false);
        setSearchTerm("");
      }

      inputRef.current?.focus();
    },
    [multi, value, updateState, onDidChange, options],
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
    setOptions((prev) => {
      const newSet = new Set(prev);
      // Remove old version if exists, then add the new one to ensure updates
      const existing = Array.from(prev).find((opt) => opt.value === option.value);
      if (existing) {
        newSet.delete(existing);
      }
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

  // Combined list of all items (creatable + filtered options)
  const allItems = useMemo(() => {
    const items = [];
    if (shouldShowCreatable) {
      items.push({ type: "creatable", value: searchTerm, label: `Create "${searchTerm}"` });
    }
    filteredOptions.forEach((option) => {
      items.push({ type: "option", ...option });
    });
    return items;
  }, [shouldShowCreatable, searchTerm, filteredOptions]);

  // Helper functions to find next/previous enabled option
  const findNextEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex + 1; i < allItems.length; i++) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to beginning
      for (let i = 0; i <= currentIndex; i++) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [allItems],
  );

  const findPreviousEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to end
      for (let i = allItems.length - 1; i >= currentIndex; i--) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [allItems],
  );

  // Reset selected index when options change, but select matching option when dropdown opens
  useEffect(() => {
    if (!open) {
      setSelectedIndex(-1);
    } else if (!multi && open && inputValue) {
      // For single-select, when dropdown opens and there's an input value, try to find and select the matching option
      const matchingIndex = allItems.findIndex((item) => {
        if (item.type === "creatable") return false;
        return (
          item.label?.toLowerCase() === inputValue.toLowerCase() ||
          item.value?.toLowerCase() === inputValue.toLowerCase()
        );
      });
      if (matchingIndex !== -1) {
        setSelectedIndex(matchingIndex);
      } else {
        setSelectedIndex(-1);
      }
    } else if (!multi && open && !inputValue) {
      setSelectedIndex(-1);
    }
    // For multi-select, don't reset selectedIndex when dropdown is open - preserve keyboard navigation
  }, [allItems, multi, open, inputValue]);

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
          if (selectedIndex >= 0 && selectedIndex < allItems.length) {
            const selectedItem = allItems[selectedIndex];
            if (selectedItem.type === "creatable") {
              const newOption = { value: searchTerm, label: searchTerm, enabled: true };
              onOptionAdd(newOption);
              onItemCreated(searchTerm);
              toggleOption(searchTerm);
            } else if (selectedItem.enabled !== false) {
              // Only toggle if the option is enabled
              toggleOption(selectedItem.value);
            }
          } else if (allItems.length === 1) {
            // If there's only one item (creatable or regular) and no selection, select it
            const singleItem = allItems[0];
            if (singleItem.type === "creatable") {
              const newOption = { value: searchTerm, label: searchTerm, enabled: true };
              onOptionAdd(newOption);
              onItemCreated(searchTerm);
              toggleOption(searchTerm);
            } else if (singleItem.enabled !== false) {
              // Only toggle if the option is enabled
              toggleOption(singleItem.value);
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
      allItems,
      searchTerm,
      onOptionAdd,
      onItemCreated,
      toggleOption,
      setOpen,
      findNextEnabledIndex,
      findPreviousEnabledIndex,
    ],
  );

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
      searchTerm,
      open,
      setOpen,
      setSelectedIndex,
      optionRenderer,
    };
  }, [
    inputValue,
    searchTerm,
    multi,
    options,
    toggleOption,
    value,
    open,
    setOpen,
    setSelectedIndex,
    optionRenderer,
  ]);

  return (
    <AutoCompleteContext.Provider value={autoCompleteContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <OptionTypeProvider Component={HiddenOption}>
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              if (readOnly) return;
              setOpen(isOpen);
              if (!isOpen) {
                // Reset highlighted option when dropdown closes
                setSelectedIndex(-1);
              }
            }}
            modal={false}
          >
            <Part partId={PART_LIST_WRAPPER}>
              <PopoverTrigger asChild ref={setReferenceElement}>
                <div
                  ref={forwardedRef}
                  style={style}
                  className={classnames(
                    className,
                    styles.badgeListWrapper,
                    styles[validationStatus],
                    {
                      [styles.disabled]: !enabled,
                      [styles.focused]: isFocused,
                    },
                  )}
                  aria-expanded={open}
                  onClick={(event) => {
                    if (readOnly) return;
                    // In multi mode, only open the dropdown, don't toggle
                    // In single mode, toggle as usual
                    if (multi && open) {
                      return; // Already open, don't close
                    }
                    event.stopPropagation();
                    setOpen((prev) => !prev);
                  }}
                >
                  {Array.isArray(selectedValue) && selectedValue.length > 0 && (
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
                  <div className={styles.inputWrapper}>
                    <Part partId={PART_INPUT}>
                      <input
                        {...rest}
                        role="combobox"
                        id={id}
                        ref={inputRef}
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

                          // Handle opening dropdown
                          if (event.key === "ArrowDown" && !open) {
                            setOpen(true);
                            return;
                          }

                          // Handle keyboard navigation when dropdown is open
                          if (open) {
                            handleKeyDown(event);
                          } else if (event.key === "Enter") {
                            setOpen(true);
                          }
                        }}
                        readOnly={readOnly}
                        autoFocus={autoFocus}
                        aria-autocomplete="list"
                        value={inputValue}
                        disabled={!enabled}
                        onChange={(event) => {
                          setOpen(true);
                          setInputValue(event.target.value);
                          setSearchTerm(event.target.value);
                        }}
                        placeholder={!readOnly ? placeholder : ""}
                        className={styles.commandInput}
                      />
                    </Part>
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
                          // Focus the input after opening dropdown
                          inputRef.current?.focus();
                        }}
                      >
                        <Icon name="chevrondown" />
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
            </Part>
            {open && (
              <Portal container={root}>
                <PopoverContent
                  style={{ width, height: dropdownHeight }}
                  className={styles.popoverContent}
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div
                    role="listbox"
                    className={styles.commandList}
                    style={{ height: dropdownHeight }}
                  >
                    {filteredOptions.length === 0 && !shouldShowCreatable && (
                      <div>{emptyListNode}</div>
                    )}
                    {shouldShowCreatable && (
                      <CreatableItem
                        onNewItem={onItemCreated}
                        isHighlighted={selectedIndex === 0}
                      />
                    )}
                    <div>
                      {filteredOptions.map(({ value, label, enabled, keywords }, index) => {
                        const itemIndex = shouldShowCreatable ? index + 1 : index;
                        return (
                          <AutoCompleteOption
                            key={value}
                            value={value}
                            label={label}
                            enabled={enabled}
                            keywords={keywords}
                            readOnly={readOnly}
                            isHighlighted={selectedIndex === itemIndex}
                            itemIndex={itemIndex}
                          />
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Portal>
            )}
          </Popover>
          {children}
        </OptionTypeProvider>
      </OptionContext.Provider>
    </AutoCompleteContext.Provider>
  );
});

type CreatableItemProps = {
  onNewItem: (item: string) => void;
  isHighlighted?: boolean;
};

function CreatableItem({ onNewItem, isHighlighted = false }: CreatableItemProps) {
  const { value, options, searchTerm, onChange, setOpen, setSelectedIndex, multi } =
    useAutoComplete();
  const { onOptionAdd } = useOption();
  if (
    isOptionsExist(options, [{ value: searchTerm, label: searchTerm }]) ||
    (Array.isArray(value) && value?.find((s) => s === searchTerm)) ||
    searchTerm === value
  ) {
    return <span style={{ display: "none" }} />;
  }

  const handleClick = () => {
    const newOption = { value: searchTerm, label: searchTerm, enabled: true };
    onOptionAdd(newOption);
    onNewItem?.(searchTerm);
    onChange(searchTerm);
    // Only close dropdown for single select mode
    if (!multi) {
      setOpen(false);
    }
  };

  const Item = (
    <div
      className={classnames(styles.autoCompleteOption, {
        [styles.highlighted]: isHighlighted,
      })}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => {
        if (setSelectedIndex) {
          setSelectedIndex(0); // CreatableItem is always at index 0
        }
      }}
      onClick={handleClick}
      role="option"
      aria-selected={false}
    >
      {`Create "${searchTerm}"`}
    </div>
  );

  // For normal creatable
  if (searchTerm.length > 0) {
    return Item;
  }

  return <span style={{ display: "none" }} />;
}

function AutoCompleteOption(option: Option & { isHighlighted?: boolean; itemIndex?: number }) {
  const {
    value,
    label,
    enabled = true,
    readOnly,
    children,
    isHighlighted = false,
    itemIndex,
  } = option;
  const id = useId();
  const {
    value: selectedValue,
    onChange,
    multi,
    setOpen,
    setSelectedIndex,
    optionRenderer,
  } = useAutoComplete();
  const selected = multi ? selectedValue?.includes(value) : selectedValue === value;

  const handleClick = () => {
    if (!readOnly && enabled) {
      onChange(value);
      // Only close dropdown for single select mode
      if (!multi) {
        setOpen(false);
      }
    }
  };

  return (
    <div
      id={id}
      role="option"
      aria-disabled={!enabled}
      aria-selected={selected}
      className={classnames(styles.autoCompleteOption, {
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
    </div>
  );
}
