import type { CSSProperties, ForwardedRef, ReactNode } from "react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  Content as SelectContent,
  Icon as SelectIcon,
  Item as SelectItem,
  ItemIndicator as SelectItemIndicator,
  ItemText as SelectItemText,
  Portal as SelectPortal,
  Root as SelectRoot,
  ScrollDownButton,
  ScrollUpButton,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Viewport as SelectViewport,
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
  optionRenderer?: (item: Option) => ReactNode;
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
    children: React.ReactNode;
    options: Set<Option>;
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
    children,
    value,
    height,
    style,
    placeholder,
    id,
    triggerRef,
    onFocus,
    options,
  } = props;

  const ref = forwardedRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;

  const stringValue = value ? value + "" : null;
  const onValChange = useCallback(
    (val: string) => {
      const valueWithMatchingType = Array.from(options.values()).find(
        (o) => o.value + "" === val,
      )?.value;
      onValueChange(valueWithMatchingType);
    },
    [onValueChange, options],
  );

  return (
    <OptionTypeProvider Component={SelectOption}>
      <SelectRoot value={stringValue} onValueChange={onValChange}>
        <SelectTrigger
          id={id}
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
          <div className={styles.selectValue}>
            <SelectValue placeholder={placeholder} />
          </div>
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
            <SelectViewport className={classnames(styles.selectViewport)}>
              {children}
            </SelectViewport>
            <ScrollDownButton className={styles.selectScrollDownButton}>
              <Icon name="chevrondown" />
            </ScrollDownButton>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </OptionTypeProvider>
  );
});

export const Select = forwardRef(function Select(
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
    emptyListTemplate,
    optionLabelRenderer,
    optionRenderer,
    valueRenderer,
    style,
    dropdownHeight,
    children,
    autoFocus = false,
    searchable = false,
    multiSelect = false,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = false,
    inProgress = false,
    inProgressNotificationMessage = "Loading...",
  }: SelectProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());

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
      setOpen(false);
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

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

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
    }),
    [multiSelect, toggleOption, value, optionLabelRenderer, optionRenderer],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        {searchable || multiSelect ? (
          <OptionTypeProvider Component={HiddenOption}>
            {children}
            <ItemWithLabel
              ref={ref}
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
              <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger asChild>
                  <button
                    id={id}
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
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                  >
                    {multiSelect ? (
                      Array.isArray(value) && value.length > 0 ? (
                        <div className={styles.badgeListContainer}>
                          <div className={styles.badgeList}>
                            {value.map((v) =>
                              valueRenderer ? (
                                valueRenderer(
                                  Array.from(options).find((o) => o.value === v),
                                  () => {
                                    toggleOption(v);
                                  },
                                )
                              ) : (
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
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className={styles.placeholder}>{placeholder || ""}</span>
                      )
                    ) : value !== undefined && value !== null ? (
                      <div>{Array.from(options).find((o) => o.value === value)?.label}</div>
                    ) : (
                      <span className={styles.placeholder}>{placeholder || ""}</span>
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
                  </button>
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
                          filter={(value, search, keywords) => {
                            const extendedValue = value + " " + keywords.join(" ");
                            if (extendedValue.toLowerCase().includes(search.toLowerCase()))
                              return 1;
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
            </ItemWithLabel>
          </OptionTypeProvider>
        ) : (
          <SimpleSelect
            ref={ref}
            value={value as SingleValueType}
            options={options}
            onValueChange={toggleOption}
            id={id}
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
            {children || emptyListNode}
          </SimpleSelect>
        )}
      </OptionContext.Provider>
    </SelectContext.Provider>
  );
});

export const ComboboxOption = forwardRef(function Combobox(
  option: Option,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { label, value, enabled = true, keywords } = option;
  const {
    value: selectedValue,
    onChange,
    multiSelect,
    optionLabelRenderer,
    optionRenderer,
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
      value={`${value}`}
      className={styles.multiComboboxOption}
      onSelect={() => {
        onChange(value);
      }}
      data-state={selected ? "checked" : undefined}
      keywords={keywords}
    >
      <div className={styles.multiComboboxOptionContent}>
        {optionRenderer ? (
          optionRenderer({ label, value, enabled, keywords })
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

export function HiddenOption(option: Option) {
  const { onOptionRemove, onOptionAdd } = useOption();
  const [node, setNode] = useState(null);
  const opt: Option = useMemo(() => {
    return {
      ...option,
      labelText: node?.textContent ?? "",
      keywords: [node?.textContent ?? ""],
    };
  }, [option, node]);

  useEffect(() => {
    onOptionAdd(opt);
    return () => onOptionRemove(opt);
  }, [opt, onOptionAdd, onOptionRemove]);

  return (
    <div ref={(el) => setNode(el)} style={{ display: "none" }}>
      {option.label}
    </div>
  );
}

const SelectOption = React.forwardRef<React.ElementRef<typeof SelectItem>, Option>(
  (option, ref) => {
    const { value, label, enabled = true } = option;
    const { onOptionRemove, onOptionAdd } = useOption();
    const { optionLabelRenderer, optionRenderer } = useSelect();

    useLayoutEffect(() => {
      onOptionAdd(option);
      return () => onOptionRemove(option);
    }, [option, onOptionAdd, onOptionRemove]);

    return (
      <SelectItem ref={ref} className={styles.selectItem} value={value + ""} disabled={!enabled}>
        <div className={styles.selectItemContent}>
          {optionRenderer ? (
            optionRenderer({
              label: <SelectItemText>{label}</SelectItemText>,
              value,
              enabled,
            })
          ) : (
            <>
              <SelectItemText className={styles.selectItemContent}>
                {optionLabelRenderer ? optionLabelRenderer({ value, label }) : label}
              </SelectItemText>
              <span className={styles.selectItemIndicator}>
                <SelectItemIndicator>
                  <Icon name="checkmark" />
                </SelectItemIndicator>
              </span>
            </>
          )}
        </div>
      </SelectItem>
    );
  },
);

SelectOption.displayName = "SelectOption";
