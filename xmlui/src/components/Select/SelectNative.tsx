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
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";
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
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { HiddenOption } from "./HiddenOption";

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

  // Progress state
  inProgress?: boolean;
  inProgressNotificationMessage?: string;

  // Label configuration
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;

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
  options: Option[];
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
    } = props;

    // Compose refs for proper forwarding
    const ref = forwardedRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;

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

    // Generate trigger class names based on validation status
    const triggerClassName = classnames(styles.selectTrigger, {
      [styles.error]: validationStatus === "error",
      [styles.warning]: validationStatus === "warning",
      [styles.valid]: validationStatus === "valid",
    });

    const selectedOption = useMemo(() => {
      return props.options.find((option) => option.value === value);
    }, [props.options, value]);

    return (
      <SelectRoot value={stringValue} onValueChange={handleValueChange}>
        <SelectTrigger
          id={id}
          aria-haspopup="listbox"
          style={style}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={!enabled}
          className={triggerClassName}
          onClick={(event) => {
            // Prevent event propagation to parent elements (e.g., DropdownMenu)
            // This ensures that clicking the Select trigger doesn't close the containing DropdownMenu
            event.stopPropagation();
          }}
          ref={ref}
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

    // Progress state
    inProgress = defaultProps.inProgress,
    inProgressNotificationMessage = defaultProps.inProgressNotificationMessage,

    // Label configuration
    label,
    labelPosition,
    labelWidth,
    labelBreak = defaultProps.labelBreak,

    // Internal
    updateState = noop,
    registerComponentApi,
    children,
  },
  ref,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());
  const generatedId = useId();
  const inputId = id || generatedId;

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
        : selectedValue === value
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
    }),
    [multiSelect, toggleOption, value],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <ItemWithLabel
          ref={ref}
          id={inputId}
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
          {searchable || multiSelect ? (
            <OptionTypeProvider Component={HiddenOption}>
              <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger
                  id={inputId}
                  aria-haspopup="listbox"
                  style={style}
                  ref={setReferenceElement}
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
                  className={classnames(styles.selectTrigger, styles[validationStatus], {
                    [styles.disabled]: !enabled,
                    [styles.multi]: multiSelect,
                  })}
                  autoFocus={autoFocus}
                >
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
                    {multiSelect && Array.isArray(value) && value.length > 0 && (
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
                </PopoverTrigger>
                {open && (
                  <Portal container={root}>
                    <FocusScope asChild loop trapped>
                      <PopoverContent
                        style={{ minWidth: width, height: dropdownHeight }}
                        className={styles.selectContent}
                      >
                        <Cmd
                          className={styles.command}
                          shouldFilter={searchable}
                          filter={(_, search, keywords) => {
                            const lowSearch = search.toLowerCase();
                            for (const kw of keywords) {
                              if (kw.toLowerCase().includes(lowSearch)) return 1;
                            }
                            return 0;
                          }}
                        >
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
                            {inProgress && (
                              <div className={styles.loading}>{inProgressNotificationMessage}</div>
                            )}
                            {Array.from(options).map(
                              ({ value, label, enabled, keywords, children }) => (
                                <ComboboxOption
                                  key={value}
                                  readOnly={readOnly}
                                  value={value}
                                  label={label}
                                  enabled={enabled}
                                  keywords={keywords}
                                />
                              ),
                            )}
                            {!inProgress && <CmdEmpty>{emptyListNode}</CmdEmpty>}
                          </CmdList>
                        </Cmd>
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
                readOnly={!!readOnly}
                ref={ref}
                value={(value || initialValue) as SingleValueType}
                onValueChange={toggleOption}
                id={inputId}
                style={style}
                onFocus={onFocus}
                onBlur={onBlur}
                enabled={enabled}
                validationStatus={validationStatus}
                triggerRef={setReferenceElement}
                autoFocus={autoFocus}
                placeholder={placeholder}
                height={dropdownHeight}
                width={width}
                options={Array.from(options)}
              >
                {children}
              </SimpleSelect>
            </OptionTypeProvider>
          )}
        </ItemWithLabel>
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});

export const ComboboxOption = forwardRef(function Combobox(
  option: Option,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { label, value, enabled = true, keywords, readOnly, children } = option;
  const { value: selectedValue, onChange, multiSelect, setOpen } = useSelect();
  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.map((v) => String(v)).includes(value)
      : String(selectedValue) === String(value);
  }, [selectedValue, value, multiSelect]);

  return (
    <CmdItem
      id={id}
      ref={forwardedRef}
      key={id}
      disabled={!enabled}
      value={value}
      className={styles.multiComboboxOption}
      onSelect={() => {
        if (readOnly) {
          setOpen(false);
          return;
        }
        onChange(value);
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      data-state={selected ? "checked" : undefined}
      keywords={[...keywords, label]}
    >
      <div className={styles.multiComboboxOptionContent}>
        {children || label}
        {selected && <Icon name="checkmark" />}
      </div>
    </CmdItem>
  );
});

const SelectOption = React.forwardRef<React.ElementRef<typeof SelectItem>, Option>(
  (option, ref) => {
    const visibleContentRef = useRef<HTMLDivElement>(null);
    const { value, label, enabled = true, children } = option;
    const { value: selectedValue } = useSelect();
    const { onOptionRemove, onOptionAdd } = useOption();

    const opt: Option = useMemo(() => {
      return {
        ...option,
        label: label ?? visibleContentRef.current?.textContent ?? "",
        keywords: [label ?? visibleContentRef.current?.textContent ?? ""],
        // Store the rendered ReactNode for dropdown display
      };
    }, [option, label, visibleContentRef.current]);

    useEffect(() => {
      onOptionAdd(opt);
      return () => onOptionRemove(opt);
    }, [opt, onOptionAdd, onOptionRemove]);

    return (
      <SelectItem
        ref={ref}
        className={styles.selectItem}
        value={value + ""}
        textValue={label || visibleContentRef.current?.textContent}
        disabled={!enabled}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onMouseEnter={(event) => {
          // Ensure hover state is applied even in DropdownMenu context
          const target = event.currentTarget;
          target.setAttribute("data-highlighted", "");
        }}
        onMouseLeave={(event) => {
          // Remove hover state when mouse leaves
          const target = event.currentTarget;
          target.removeAttribute("data-highlighted");
        }}
        data-state={selectedValue === value && "checked"}
      >
        {/* SelectItemText is used by SelectValue to display the selected value */}
        <span style={{ display: "none" }}>
          <SelectItemText>{label}</SelectItemText>
        </span>
        {/* Visible content in the dropdown */}
        <div className={styles.selectItemContent} ref={visibleContentRef}>
          {children || label}
        </div>
        {selectedValue === value && (
          <SelectItemIndicator className={styles.selectItemIndicator}>
            <Icon name="checkmark" />
          </SelectItemIndicator>
        )}
      </SelectItem>
    );
  },
);

SelectOption.displayName = "SelectOption";
