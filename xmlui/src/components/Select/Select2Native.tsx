import type { CSSProperties, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import * as SelectPrimitive from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import * as React from "react";
import { SelectContext2 } from "@components/Select/SelectContext2";
import styles from "./Select2.module.scss";
import classnames from "classnames";

type SelectProps = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  onDidChange?: (newValue: string) => void;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

const Select = SelectPrimitive.Root;

const SelectValue = SelectPrimitive.Value;

export function Select2({
  id,
  initialValue = "",
  value = "",
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
}: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const onInputChange = useCallback(
    (selectedOption: Option) => {
      setOpen(false);
      updateState({ value: selectedOption.value });
      onDidChange(selectedOption.value);
    },
    [onDidChange, updateState],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onChange: onInputChange,
      optionRenderer,
    }),
    [onInputChange, optionRenderer, value],
  );

  return (
    <SelectContext2.Provider value={contextValue}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </SelectContext2.Provider>
  );
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={styles.selectTrigger} {...props}>
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
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={classnames(styles.selectContent, {
        [styles.popper]: position === "popper",
      })}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={classnames(styles.selectViewport, {
          [styles.popper]: position === "popper",
        })}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={styles.selectLabel} {...props} />
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;
