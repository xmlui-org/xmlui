import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import classnames from "classnames";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@components/Combobox/Command";
import Icon from "@components/Icon/IconNative";
import styles from "@components/MultiSelect/MultiSelect2.module.scss";
import { noop } from "@components-core/constants";
import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useCallback, useMemo } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { Option, ValidationStatus } from "@components/abstractions";
import { MultiSelectContext } from "@components/MultiSelect/MultiSelectContext";
import { isEqual } from "lodash-es";
import { useTheme } from "@components-core/theming/ThemeContext";
import { useEvent } from "@components-core/utils/misc";

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  value?: string[];
  initialValue?: string[];
  enabled?: boolean;
  placeholder?: string;
  children: ReactNode;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  layout?: CSSProperties;
  emptyListTemplate?: ReactNode;
  optionRenderer?: (option: Option) => ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
}

function defaultRenderer(option: Option) {
  return <div>{option.label}</div>;
}

export const MultiSelect2 = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      id,
      value,
      initialValue,
      placeholder,
      children,
      layout,
      enabled = true,
      updateState,
      onDidChange = noop,
      onFocus = noop,
      onBlur = noop,
      validationStatus = "none",
      optionRenderer = defaultRenderer,
      registerComponentApi,
      emptyListTemplate,
    },
    ref,
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [initValue, setInitValue] = useState<string[] | undefined>(initialValue);
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const [width, setWidth] = useState(0);
    const observer = useRef<ResizeObserver>();

    const { root } = useTheme();

    useEffect(() => {
      setInitValue((prevState) => {
        if (isEqual(prevState, initialValue)) {
          return prevState;
        }
        return initialValue;
      });
    }, [initialValue]);

    useEffect(() => {
      updateState({ value: initValue });
    }, [initValue, updateState]);

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
      updateState({ value: newValue });
      onDidChange(newValue);
    });

    useEffect(() => {
      registerComponentApi?.({
        focus,
        setValue,
      });
    }, [focus, registerComponentApi, setValue]);

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...value];
        newSelectedValues.pop();
        updateState({ value: newSelectedValues });
        onDidChange(newSelectedValues);
      }
    };

    const toggleOption = useCallback(
      (selecteValue: string) => {
        const newSelectedValues = value.includes(selecteValue)
          ? value.filter((value) => value !== selecteValue)
          : [...value, selecteValue];
        updateState({ value: newSelectedValues });
        onDidChange(newSelectedValues);
      },
      [onDidChange, updateState, value],
    );

    const handleClear = () => {
      updateState({ value: [] });
      onDidChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

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

    const multiSelectContextValue = useMemo(
      () => ({
        value,
        onChange: toggleOption,
        optionRenderer,
      }),
      [optionRenderer, toggleOption, value],
    );

    return (
      <MultiSelectContext.Provider value={multiSelectContextValue}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              ref={setReferenceElement}
              id={id}
              style={layout}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              disabled={!enabled}
              onClick={handleTogglePopover}
              className={classnames(styles.multiSelectButton, styles[validationStatus])}
            >
              {value?.length > 0 ? (
                <div className={styles.badgeListContainer}>
                  <div className={styles.badgeList}>
                    {value.map((v) => {
                      return (
                        <SelectBadge key={v}>
                          {v}
                          <Icon
                            name="close"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleOption(v);
                            }}
                          />
                        </SelectBadge>
                      );
                    })}
                  </div>
                  <div className={styles.actions}>
                    <Icon
                      name="close"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                    <Icon name="chevrondown" />
                  </div>
                </div>
              ) : (
                <div className={styles.emptySelect}>
                  <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                  <Icon name="chevrondown" size="sm" />
                </div>
              )}
            </button>
          </PopoverTrigger>
          <Portal container={root}>
            <PopoverContent
              align="start"
              onEscapeKeyDown={() => setIsPopoverOpen(false)}
              style={{ width }}
            >
              <Command className={styles.multiSelectMenu}>
                <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
                <CommandList>
                  {React.Children.toArray(children).length > 0 ? (
                    <CommandGroup className={styles.commandGroup}>{children}</CommandGroup>
                  ) : (
                    <CommandEmpty className={styles.commandEmpty}>
                      {emptyListTemplate ?? (
                        <>
                          <Icon name={"noresult"} />
                          <span>List is empty</span>
                        </>
                      )}
                    </CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Portal>
        </Popover>
      </MultiSelectContext.Provider>
    );
  },
);

MultiSelect2.displayName = "MultiSelect2";

const SelectBadge = React.forwardRef<
  React.ElementRef<typeof SelectBadge>,
  React.ComponentPropsWithoutRef<typeof SelectBadge>
>(({ ...props }, ref) => <div className={styles.selectBadge} {...props} />);

SelectBadge.displayName = "SelectBadge";
