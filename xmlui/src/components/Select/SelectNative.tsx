import type { CSSProperties, ReactNode } from "react";
import { useId, useRef } from "react";
import { useEffect, useState } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import * as SelectPrimitive from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import * as React from "react";
import { SelectContext, useSelect } from "@components/Select/SelectContext";
import styles from "./Select.module.scss";
import classnames from "classnames";
import { useEvent } from "@components-core/utils/misc";
import { useTheme } from "@components-core/theming/ThemeContext";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { SelectOption } from "@components/Select/SelectOptionNative";
import { Command as CommandPrimitive } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { isEqual } from "lodash-es";

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

const SelectValue = SelectPrimitive.Value;

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
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = useState(0);
  const { root } = useTheme();
  const observer = useRef<ResizeObserver>();
  const [initValue, setInitValue] = useState<string | string[] | undefined>(null);

  useEffect(() => {
    if (multi) {
      setInitValue((prevState) => {
        if (isEqual(prevState, initialValue)) {
          return prevState;
        }
        return initialValue ?? [];
      });
    } else {
      setInitValue(initialValue ?? "");
    }
  }, [initialValue, multi, updateState]);

  useEffect(() => {
    updateState({ value: initValue });
  }, [initValue, updateState]);

  useEffect(() => {
    const current = referenceElement as any;
    // --- We are already observing old element
    if (observer?.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(() => setWidth((referenceElement as any).clientWidth));
    if (current && observer.current) {
      observer.current.observe(referenceElement as any);
    }
  }, [referenceElement]);

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

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

  const toggleOption = useCallback(
    (selectedValue: string) => {
      const newSelectedValue =
        Array.isArray(value) && multi
          ? value.includes(selectedValue)
            ? value.filter((value) => value !== selectedValue)
            : [...value, selectedValue]
          : selectedValue;
      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);
      setOpen(false);
    },
    [multi, onDidChange, updateState, value],
  );

  const contextValue = useMemo(
    () => ({
      multi,
      value,
      optionRenderer,
      onChange: toggleOption,
    }),
    [multi, optionRenderer, toggleOption, value],
  );

  const handleTogglePopover = () => {
    setOpen((prev) => !prev);
  };

  const handleClear = () => {
    updateState({ value: [] });
    onDidChange([]);
  };

  const emptyListNode = useMemo(
    () =>
      emptyListTemplate ?? (
        <div className={styles.selectEmpty}>
          <Icon name={"noresult"} />
          <span>List is empty</span>
        </div>
      ),
    [emptyListTemplate],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <OptionTypeProvider Component={searchable || multi ? ComboboxOption : SelectOption}>
        {searchable || multi ? (
          <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
              <button
                id={id}
                style={layout}
                ref={setReferenceElement}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                disabled={!enabled}
                aria-expanded={open}
                onClick={handleTogglePopover}
                className={classnames(styles.selectTrigger, styles[validationStatus], {
                  [styles.disabled]: !enabled,
                  [styles.multi]: multi,
                })}
                autoFocus={autoFocus}
              >
                {multi ? (
                  Array.isArray(value) &&
                  (value.length > 0 ? (
                    <div className={styles.badgeListContainer}>
                      <div className={styles.badgeList}>
                        {value.map((v) => {
                          return (
                            <span key={v} className={styles.badge}>
                              {v}
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
                    <span className={styles.placeholder}>{placeholder || ""}</span>
                  ))
                ) : (
                  <span className={styles.placeholder}>
                    {value !== null && value !== undefined ? value : placeholder || ""}
                  </span>
                )}
                <div className={styles.actions}>
                  {Array.isArray(value) && value.length > 0 && (
                    <Icon
                      name="close"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                  )}
                  <Icon name="chevrondown" />
                </div>
              </button>
            </PopoverTrigger>
            <Portal container={root}>
              <PopoverContent style={{ width }}>
                <Command
                  className={styles.selectContent}
                  filter={(value, search, keywords) => {
                    const extendValue = `${value} ${keywords.join(" ")}`;
                    if (extendValue.includes(search)) return 1;
                    return 0;
                  }}
                >
                  <CommandInput placeholder="Search..." className={styles.commandInput} />
                  <CommandList className={styles.commandList}>
                    <CommandGroup className={styles.commandGroup}>{children}</CommandGroup>
                    <CommandEmpty className={styles.commandEmpty}>{emptyListNode}</CommandEmpty>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Portal>
          </Popover>
        ) : (
          <SelectPrimitive.Root
            value={!Array.isArray(value) && value ? value : ""}
            onValueChange={toggleOption}
          >
            <SelectTrigger
              autoFocus={autoFocus}
              id={id}
              style={layout}
              className={styles.selectTrigger}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              enabled={enabled}
              validationStatus={validationStatus}
              ref={setReferenceElement}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {React.Children.toArray(children).length > 0 ? <>{children}</> : emptyListNode}
            </SelectContent>
          </SelectPrimitive.Root>
        )}
      </OptionTypeProvider>
    </SelectContext.Provider>
  );
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    enabled?: boolean;
    validationStatus?: ValidationStatus;
  }
>(({ className, children, enabled, validationStatus, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={classnames(styles.selectTrigger, styles[validationStatus])}
    {...props}
    disabled={!enabled}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon name="chevrondown" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={styles.selectScrollUpButton} {...props}>
    <Icon name="chevronup" />
  </SelectPrimitive.ScrollUpButton>
));

SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={styles.selectScrollDownButton} {...props}>
    <Icon name="chevrondown" />
  </SelectPrimitive.ScrollDownButton>
));

SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { root } = useTheme();
  return (
    <SelectPrimitive.Portal container={root}>
      <SelectPrimitive.Content
        ref={ref}
        className={styles.selectContent}
        position="popper"
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={classnames(styles.selectViewport, className)}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={styles.selectLabel} {...props} />
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;

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

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive ref={ref} className={classnames(styles.command, className)} {...props} />
));
Command.displayName = CommandPrimitive.displayName;

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className={styles.commandInputContainer}>
    <Icon name="search" />
    <CommandPrimitive.Input
      ref={ref}
      className={classnames(styles.commandInput, className)}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={classnames(styles.commandList, className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className={classnames(styles.commandEmpty)} {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={classnames(styles.commandGroup, className)}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={classnames(className)} {...props} />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
