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
  Value as SelectValue,
} from "@radix-ui/react-select";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
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
type SelectProps = {
  id?: string;
  initialValue?: ValueType;
  value?: ValueType;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionLabelRenderer?: (item: Option) => ReactNode;
  optionRenderer?: (item: Option, value: any, inTrigger: boolean) => ReactNode;
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
  emptyListTemplate?: ReactNode;
  style?: CSSProperties;
  onDidChange?: (newValue: ValueType) => void;
  dropdownHeight?: CSSProperties["height"];
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  required?: boolean;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  inProgress?: boolean;
  inProgressNotificationMessage?: string;
  readOnly?: boolean;
};

const SimpleSelect = forwardRef(function SimpleSelect(
  props: {
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
    height:
      | "-moz-initial"
      | "inherit"
      | "initial"
      | "revert"
      | "revert-layer"
      | "unset"
      | "-moz-max-content"
      | "-moz-min-content"
      | "-webkit-fit-content"
      | "auto"
      | "fit-content"
      | "max-content"
      | "min-content"
      | string
      | number;
    options: Set<Option>;
    children: ReactNode;
    readOnly: boolean;
  },
  forwardedRef,
) {
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
    options,
    children,
    readOnly,
  } = props;

  const ref = forwardedRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;
  const stringValue = useMemo(() => {
    return value != undefined ? value + "" : undefined;
  }, [value]);
  const selectedOption = useMemo(() => {
    return Array.from(options).find((o) => `${o.value}` === stringValue);
  }, [options, stringValue]);

  const onValChange = useCallback(
    (val: string) => {
      if (readOnly) {
        return;
      }
      const match = Array.from(options).find((o) => `${o.value}` === val);
      onValueChange(match?.value ?? val);
    },
    [onValueChange, options, readOnly],
  );

  return (
    <SelectRoot value={stringValue} onValueChange={onValChange}>
      <SelectTrigger
        id={id}
        aria-haspopup="listbox"
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!enabled}
        className={classnames(styles.selectTrigger, {
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
        })}
        ref={ref}
        autoFocus={autoFocus}
      >
        {
          <div
            className={classnames(styles.selectValue, {
              [styles.selectValue]: selectedOption !== undefined,
              [styles.placeholder]: selectedOption === undefined,
            })}
          >
            {selectedOption ? selectedOption.label : readOnly ? "" : placeholder}
          </div>
        }
        <SelectIcon asChild>
          <Icon name="chevrondown" />
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal container={root}>
        <SelectContent
          className={styles.selectContent}
          position="popper"
          style={{ height: height }}
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
});

export const Select = forwardRef(function Select(
  {
    id,
    initialValue,
    value,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    updateState = noop,
    validationStatus = defaultProps.validationStatus,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    registerComponentApi,
    emptyListTemplate,
    optionLabelRenderer,
    optionRenderer,
    valueRenderer,
    style,
    dropdownHeight,
    children,
    autoFocus = defaultProps.autoFocus,
    searchable = defaultProps.searchable,
    multiSelect = defaultProps.multiSelect,
    label,
    labelPosition,
    labelWidth,
    labelBreak = defaultProps.labelBreak,
    required = defaultProps.required,
    inProgress = defaultProps.inProgress,
    inProgressNotificationMessage = defaultProps.inProgressNotificationMessage,
    readOnly = false,
  }: SelectProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());
  const generatedId = useId();
  const inputId = id || generatedId;
  const isInForm = useIsInsideForm();

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
          ? value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
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
      optionLabelRenderer,
      optionRenderer,
      onChange: toggleOption,
      setOpen,
    }),
    [multiSelect, toggleOption, value, optionLabelRenderer, optionRenderer],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <OptionTypeProvider Component={HiddenOption}>
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
                  onClick={() => setOpen((prev) => !prev)}
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
                  <SelectPortal container={root}>
                    <FocusScope asChild loop trapped>
                      <PopoverContent
                        style={{ width, height: dropdownHeight }}
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
                            {Array.from(options).map(({ value, label, enabled, keywords }) => (
                              <ComboboxOption
                                key={value}
                                readOnly={readOnly}
                                value={value}
                                label={label}
                                enabled={enabled}
                                keywords={keywords}
                              />
                            ))}
                            {!inProgress && <CmdEmpty>{emptyListNode}</CmdEmpty>}
                          </CmdList>
                        </Cmd>
                      </PopoverContent>
                    </FocusScope>
                  </SelectPortal>
                )}
              </Popover>
            ) : (
              <SimpleSelect
                readOnly={!!readOnly}
                ref={ref}
                key={isInForm ? (value ? `status-${value}` : "status-initial") : undefined} //workaround for https://github.com/radix-ui/primitives/issues/3135
                value={value as SingleValueType}
                options={options}
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
              >
                {renderOptionsOrDefault(options, emptyListNode)}
              </SimpleSelect>
            )}
          </ItemWithLabel>
          {children}
        </OptionTypeProvider>
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});

export const ComboboxOption = forwardRef(function Combobox(
  option: Option,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { label, value, enabled = true, keywords, readOnly } = option;
  const {
    value: selectedValue,
    onChange,
    multiSelect,
    optionLabelRenderer,
    optionRenderer,
    setOpen,
  } = useSelect();
  const selected = useMemo(() => {
    return Array.isArray(selectedValue) && multiSelect
      ? selectedValue.includes(value)
      : selectedValue === value;
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
      data-state={selected ? "checked" : undefined}
      keywords={[...keywords, label]}
    >
      <div className={styles.multiComboboxOptionContent}>
        {optionRenderer ? (
          optionRenderer({ label, value, enabled, keywords }, selectedValue as any, false)
        ) : (
          <>
            {optionLabelRenderer ? optionLabelRenderer({ label, value }) : label}
            {selected && <Icon name="checkmark" />}
          </>
        )}
      </div>
    </CmdItem>
  );
});

const SelectOption = React.forwardRef<React.ElementRef<typeof SelectItem>, Option>(
  (option, ref) => {
    const { value, label, enabled = true } = option;
    const { optionLabelRenderer, optionRenderer, value: selectedValue } = useSelect();

    return (
      <SelectItem
        ref={ref}
        className={styles.selectItem}
        value={value + ""}
        disabled={!enabled}
        data-state={selectedValue === value && "checked"}
      >
        <div className={styles.selectItemContent}>
          {optionRenderer ? (
            optionRenderer(
              {
                label,
                value,
                enabled,
              },
              selectedValue as any,
              false,
            )
          ) : (
            <>
              <SelectItemText className={styles.selectItemContent}>
                {optionLabelRenderer ? optionLabelRenderer({ value, label }) : label}
              </SelectItemText>
              {selectedValue === value && (
                <span className={styles.selectItemIndicator}>
                  <SelectItemIndicator>
                    <Icon name="checkmark" />
                  </SelectItemIndicator>
                </span>
              )}
            </>
          )}
        </div>
      </SelectItem>
    );
  },
);

SelectOption.displayName = "SelectOption";

function renderOptionsOrDefault(options: Set<Option>, default_: any) {
  if (options.size === 0) {
    return default_;
  }

  return Array.from(options).map((option) => (
    <SelectOption
      key={option.value}
      value={option.value}
      label={option.label}
      enabled={option.enabled}
    />
  ));
}
