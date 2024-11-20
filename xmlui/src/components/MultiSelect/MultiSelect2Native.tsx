import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
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
import type { CSSProperties, ReactNode} from "react";
import { useEffect, useState } from "react";
import { useCallback, useMemo } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { Option, ValidationStatus } from "@components/abstractions";
import { Button } from "@components/Button/ButtonNative";
import { MultiSelectContext } from "@components/MultiSelect/MultiSelectContext";
import { isEqual } from "lodash-es";

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
              ref={ref}
              onClick={handleTogglePopover}
              className={classnames(styles.multiSelectButton)}
            >
              {value?.length > 0 ? (
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-wrap items-center">
                    {value.map((v) => {
                      return (
                        <SelectBadge key={v}>
                          {v}
                          <Button
                            icon="close"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleOption(v);
                            }}
                          />
                        </SelectBadge>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      icon="close"
                      className="h-4 mx-2 cursor-pointer text-muted-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                    {/* <Separator orientation="vertical" className="flex min-h-6 h-full" />*/}
                    {/*<Icon name="chevrondown" />*/}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          >
            <Command>
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
