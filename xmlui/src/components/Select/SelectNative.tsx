import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { useEffect } from "react";
import { useLayoutEffect } from "react";
import { useId, useRef } from "react";
import { useState } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import {
  Portal as SelectPortal,
  Content,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  Value as SelectValue,
  Icon as SelectIcon,
  Trigger,
  Viewport,
  Label,
} from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import { SelectContext, useSelect } from "@components/Select/SelectContext";
import styles from "./Select.module.scss";
import classnames from "classnames";
import { useTheme } from "@components-core/theming/ThemeContext";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { SelectOption } from "@components/Select/SelectOptionNative";
import {
  Command as Cmd,
  CommandEmpty as CmdEmpty,
  CommandGroup as CmdGroup,
  CommandInput as CmdInput,
  CommandItem as CmdItem,
  CommandList as CmdList,
} from "cmdk";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { useEvent } from "@components-core/utils/misc";
import { OptionContext, useOption } from "@components/Select/OptionContext";

type SelectProps = {
  id?: string;
  initialValue?: string | string[];
  value?: string | string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: string | string[]) => void;
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
    (selectedValue: string) => {
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

  return (
    <SelectContext.Provider
      value={{
        multi,
        value,
        optionRenderer,
        onChange: toggleOption,
      }}
    >
      <OptionTypeProvider Component={searchable || multi ? MyOption : SelectOption}>
        {searchable || multi ? (
          <OptionContext.Provider value={optionContextValue}>
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
                        size="sm"
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
                <PopoverContent style={{ width }} className={styles.selectContent}>
                  <Command>
                    {searchable ? (
                      <CommandInput placeholder="Search..." />
                    ) : (
                      // https://github.com/pacocoursey/cmdk/issues/322#issuecomment-2444703817
                      <button autoFocus aria-hidden="true" className={styles.srOnly} />
                    )}
                    <CommandList>
                      <CommandGroup>
                        {Array.from(options).map(({ value, label, enabled }) => (
                          <ComboboxOption
                            key={value}
                            value={value}
                            label={label}
                            enabled={enabled}
                          />
                        ))}
                      </CommandGroup>
                      <CommandEmpty>{emptyListNode}</CommandEmpty>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Portal>
            </Popover>
          </OptionContext.Provider>
        ) : (
          <Root value={!Array.isArray(value) && value ? value : ""} onValueChange={toggleOption}>
            <SelectTrigger
              id={id}
              style={layout}
              onFocus={onFocus}
              onBlur={onBlur}
              enabled={enabled}
              validationStatus={validationStatus}
              ref={setReferenceElement}
              autoFocus={autoFocus}
            >
              <div className={styles.selectValue}>
                <SelectValue placeholder={placeholder} />
              </div>
            </SelectTrigger>
            <SelectContent>{children || emptyListNode}</SelectContent>
          </Root>
        )}
      </OptionTypeProvider>
    </SelectContext.Provider>
  );
}

const SelectTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger> & {
    enabled?: boolean;
    validationStatus?: ValidationStatus;
  }
>(({ className, children, enabled, validationStatus, ...props }, ref) => (
  <Trigger
    ref={ref}
    className={classnames(styles.selectTrigger, styles[validationStatus])}
    {...props}
    disabled={!enabled}
  >
    {children}
    <SelectIcon asChild>
      <Icon name="chevrondown" />
    </SelectIcon>
  </Trigger>
));

SelectTrigger.displayName = Trigger.displayName;

const SelectScrollUpButton = forwardRef<
  React.ElementRef<typeof ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof ScrollUpButton>
>(({ className, ...props }, ref) => (
  <ScrollUpButton ref={ref} className={styles.selectScrollUpButton} {...props}>
    <Icon name="chevronup" />
  </ScrollUpButton>
));

SelectScrollUpButton.displayName = ScrollUpButton.displayName;

const SelectScrollDownButton = forwardRef<
  React.ElementRef<typeof ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof ScrollDownButton>
>(({ className, ...props }, ref) => (
  <ScrollDownButton ref={ref} className={styles.selectScrollDownButton} {...props}>
    <Icon name="chevrondown" />
  </ScrollDownButton>
));

SelectScrollDownButton.displayName = ScrollDownButton.displayName;

const SelectContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => {
  const { root } = useTheme();
  return (
    <SelectPortal container={root}>
      <Content ref={ref} className={styles.selectContent} position="popper" {...props}>
        <SelectScrollUpButton />
        <Viewport className={classnames(styles.selectViewport, className)}>{children}</Viewport>
        <SelectScrollDownButton />
      </Content>
    </SelectPortal>
  );
});

SelectContent.displayName = Content.displayName;

const SelectLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => <Label ref={ref} className={styles.selectLabel} {...props} />);

SelectLabel.displayName = Label.displayName;

type OptionComponentProps = {
  value: string;
  label: string;
  enabled?: boolean;
};

export function ComboboxOption({ value, label, enabled = true }: OptionComponentProps) {
  const id = useId();
  const { value: selectedValue, onChange, optionRenderer, multi } = useSelect();
  const selected =
    typeof selectedValue === "object" && multi
      ? selectedValue.includes(value)
      : selectedValue === value;

  return (
    <CommandItem
      id={id}
      key={id}
      disabled={!enabled}
      value={`${value}`}
      className={styles.multiComboboxOption}
      onSelect={() => {
        onChange(value);
      }}
      data-state={selected ? "checked" : undefined}
      keywords={[label]}
    >
      {optionRenderer({ label, value })}
      {selected && <Icon name="checkmark" />}
    </CommandItem>
  );
}

function MyOption(option: Option) {
  const { onOptionRemove, onOptionAdd } = useOption();

  useLayoutEffect(() => {
    onOptionAdd(option);
    return () => onOptionRemove(option);
  }, [option, onOptionAdd, onOptionRemove]);

  return <span />;
}

export const Command = forwardRef<
  React.ElementRef<typeof Cmd>,
  React.ComponentPropsWithoutRef<typeof Cmd>
>(({ className, ...props }, ref) => (
  <Cmd ref={ref} className={classnames(styles.command, className)} {...props} />
));
Command.displayName = Cmd.displayName;

export const CommandInput = forwardRef<
  React.ElementRef<typeof CmdInput>,
  React.ComponentPropsWithoutRef<typeof CmdInput>
>(({ className, ...props }, ref) => (
  <div className={styles.commandInputContainer}>
    <Icon name="search" />
    <CmdInput ref={ref} className={classnames(styles.commandInput, className)} {...props} />
  </div>
));

CommandInput.displayName = CmdInput.displayName;

export const CommandList = forwardRef<
  React.ElementRef<typeof CmdList>,
  React.ComponentPropsWithoutRef<typeof CmdList>
>(({ className, ...props }, ref) => (
  <CmdList ref={ref} className={classnames(styles.commandList, className)} {...props} />
));

CommandList.displayName = CmdList.displayName;

export const CommandEmpty = forwardRef<
  React.ElementRef<typeof CmdEmpty>,
  React.ComponentPropsWithoutRef<typeof CmdEmpty>
>((props, ref) => <CmdEmpty ref={ref} className={classnames(styles.commandEmpty)} {...props} />);

CommandEmpty.displayName = CmdEmpty.displayName;

export const CommandGroup = forwardRef<
  React.ElementRef<typeof CmdGroup>,
  React.ComponentPropsWithoutRef<typeof CmdGroup>
>(({ className, ...props }, ref) => (
  <CmdGroup ref={ref} className={classnames(styles.commandGroup, className)} {...props} />
));

CommandGroup.displayName = CmdGroup.displayName;

export const CommandItem = forwardRef<
  React.ElementRef<typeof CmdItem>,
  React.ComponentPropsWithoutRef<typeof CmdItem>
>(({ className, ...props }, ref) => (
  <CmdItem ref={ref} className={classnames(className)} {...props} />
));

CommandItem.displayName = CmdItem.displayName;
