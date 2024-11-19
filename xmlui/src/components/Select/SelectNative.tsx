import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useCallback, useMemo } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import * as SelectPrimitive from "@radix-ui/react-select";
import Icon from "@components/Icon/IconNative";
import * as React from "react";
import { SelectContext2 } from "@components/Select/SelectContext2";
import styles from "./Select.module.scss";
import classnames from "classnames";
import { useEvent } from "@components-core/utils/misc";
import { useTheme } from "@components-core/theming/ThemeContext";

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

const SelectValue = SelectPrimitive.Value;

export function Select({
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
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

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

  const updateValue = useCallback(
    (value: string) => {
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  const setValue = useEvent((newValue: string) => {
    updateValue(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  const contextValue = useMemo(
    () => ({
      value,
      optionRenderer,
    }),
    [optionRenderer, value],
  );

  return (
    <SelectContext2.Provider value={contextValue}>
      <SelectPrimitive.Root value={value} onValueChange={updateValue}>
        <SelectTrigger
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
        <SelectContent emptyListTemplate={emptyListTemplate}>{children}</SelectContent>
      </SelectPrimitive.Root>
    </SelectContext2.Provider>
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
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { emptyListTemplate?: ReactNode }
>(({ className, children, emptyListTemplate, ...props }, ref) => {
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
        <SelectPrimitive.Viewport className={classnames(styles.selectViewport, {})}>
          {React.Children.toArray(children).length > 0 ? (
            <>{children}</>
          ) : (
            emptyListTemplate ?? (
              <div className={styles.selectEmpty}>
                <Icon name={"noresult"} />
                <span>List is empty</span>
              </div>
            )
          )}
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
