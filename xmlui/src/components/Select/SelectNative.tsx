import type {
  CSSProperties,
  ReactNode} from "react";
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Option, ValidationStatus } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
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
import Icon from "@components/Icon/IconNative";
import { SelectContext, useSelect } from "@components/Select/SelectContext";
import styles from "./Select.module.scss";
import classnames from "classnames";
import { useTheme } from "@components-core/theming/ThemeContext";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { useEvent } from "@components-core/utils/misc";
import { OptionContext, useOption } from "@components/Select/OptionContext";

export type SingleValueType = string | number;
export type ValueType = SingleValueType | SingleValueType[];
type SelectProps = {
  id?: string;
  initialValue?: ValueType;
  value?: ValueType;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: ValueType) => void;
  dropdownHeight?: CSSProperties["height"];
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
  searchable?: boolean;
  multi?: boolean;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

function SimpleSelect(props: {
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
}) {
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

  const stringValue = value + "";
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
          className={classnames(styles.selectTrigger, styles[validationStatus])}
          ref={triggerRef}
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
}

export function Select({
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
  layout,
  dropdownHeight,
  children,
  autoFocus = false,
  searchable = false,
  multi = false,
}: SelectProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const { root } = useTheme();
  const [options, setOptions] = useState(new Set<Option>());

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue });
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
      const newSelectedValue = multi
        ? Array.isArray(value)
          ? value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
            : [...value, selectedValue]
          : [selectedValue]
        : selectedValue;

      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      setOpen(false);
    },
    [multi, value, updateState, onDidChange],
  );

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multi ? [] : "";
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multi, updateState, onDidChange]);

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
      multi,
      value,
      optionRenderer,
      onChange: toggleOption,
    }),
    [multi, optionRenderer, toggleOption, value],
  );

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        {searchable || multi ? (
          <OptionTypeProvider Component={HiddenOption}>
            {children}
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                <button
                  id={id}
                  style={layout}
                  ref={setReferenceElement}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  disabled={!enabled}
                  aria-expanded={open}
                  onClick={() => setOpen((prev) => !prev)}
                  className={classnames(styles.selectTrigger, styles[validationStatus], {
                    [styles.disabled]: !enabled,
                    [styles.multi]: multi,
                  })}
                  autoFocus={autoFocus}
                >
                  {multi ? (
                    Array.isArray(value) && value.length > 0 ? (
                      <div className={styles.badgeListContainer}>
                        <div className={styles.badgeList}>
                          {value.map((v) => (
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
                        </div>
                      </div>
                    ) : (
                      <span className={styles.placeholder}>{placeholder || ""}</span>
                    )
                  ) : value ? (
                    <span>{Array.from(options).find((o) => o.value === value)?.label}</span>
                  ) : (
                    <span className={styles.placeholder}>{placeholder || ""}</span>
                  )}
                  <div className={styles.actions}>
                    {multi && Array.isArray(value) && value.length > 0 && (
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
              <Portal container={root}>
                <PopoverContent
                  style={{ width, height: dropdownHeight }}
                  className={styles.selectContent}
                >
                  <Cmd className={styles.command}>
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
                      {Array.from(options).map(({ value, label, enabled }) => (
                        <ComboboxOption key={value} value={value} label={label} enabled={enabled} />
                      ))}
                      <CmdEmpty>{emptyListNode}</CmdEmpty>
                    </CmdList>
                  </Cmd>
                </PopoverContent>
              </Portal>
            </Popover>
          </OptionTypeProvider>
        ) : (
          <SimpleSelect
            value={value as SingleValueType}
            options={options}
            onValueChange={toggleOption}
            id={id}
            style={layout}
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
}

export function ComboboxOption({ value, label, enabled = true }: Option) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer, multi } = useSelect();
  const selected =
    Array.isArray(selectedValue) && multi ? selectedValue.includes(value) : selectedValue === value;

  return (
    <CmdItem
      id={id}
      key={id}
      disabled={!enabled}
      value={value}
      className={styles.multiComboboxOption}
      onSelect={() => {
        onChange(value);
      }}
      data-state={selected ? "checked" : undefined}
      keywords={[label]}
    >
      {optionRenderer({ label, value })}
      {selected && <Icon name="checkmark" />}
    </CmdItem>
  );
}

export function HiddenOption(option: Option) {
  const { onOptionRemove, onOptionAdd } = useOption();

  useLayoutEffect(() => {
    onOptionAdd(option);
    return () => onOptionRemove(option);
  }, [option, onOptionAdd, onOptionRemove]);

  return <span style={{ display: "none" }} />;
}

const SelectOption = React.forwardRef<React.ElementRef<typeof SelectItem>, Option>(
  (option, ref) => {
    const { value, label, enabled } = option;
    const { onOptionRemove, onOptionAdd } = useOption();

    useLayoutEffect(() => {
      onOptionAdd(option);
      return () => onOptionRemove(option);
    }, [option, onOptionAdd, onOptionRemove]);

    const { optionRenderer } = useSelect();

    return (
      <SelectItem ref={ref} className={styles.selectItem} value={value + ""} disabled={!enabled}>
        <SelectItemText>{optionRenderer ? optionRenderer({ label, value }) : label}</SelectItemText>
        <span className={styles.selectItemIndicator}>
          <SelectItemIndicator>
            <Icon name="checkmark" />
          </SelectItemIndicator>
        </span>
      </SelectItem>
    );
  },
);

SelectOption.displayName = "SelectOption";
