import { useSelect } from "downshift";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { useEvent } from "@components-core/utils/misc";
import styles from "@components/Select/Select.module.scss";
import { Icon } from "@components/Icon/IconNative";

import classnames from "@components-core/utils/classnames";
import { usePopper } from "react-popper";
import { useTheme } from "@components-core/theming/ThemeContext";
import { createPortal } from "react-dom";
import type { ValidationStatus } from "@components/abstractions";
import { SelectContext, useSelectContextValue } from "./SelectContext";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";
import { OptionComponent } from "@components/Option/OptionNative";

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
  const { options, selectContextValue } = useSelectContextValue();
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });
  const { root } = useTheme();

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    //labelId: id,
    toggleButtonId: id,
    items: options,
    itemToString(item: Option | null) {
      return item ? item.value + "" : "";
    },
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem) onInputChange(newSelectedItem);
    },
    initialSelectedItem: options.find((item) => item.value === value) || null,
    selectedItem: options.find((item) => item.value === value) || null,
    isItemDisabled: (item) => item.enabled === false,
  });

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const updateValue = useCallback(
    (value: string) => {
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  const onInputChange = useCallback(
    (selectedOption: Option) => updateValue(selectedOption.value),
    [updateValue],
  );

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
    updateValue(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  // Sizing the dropdown list width to the reference button size
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    const current = referenceElement;
    // --- We are already observing old element
    if (observer?.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(
      () => referenceElement && setWidth(referenceElement.clientWidth),
    );
    if (current && observer.current) {
      observer.current.observe(referenceElement);
    }
  }, [referenceElement]);

  return (
    <SelectContext.Provider value={selectContextValue}>
      <OptionTypeProvider Component={OptionComponent}>
        {children}
      </OptionTypeProvider>
      <div
        style={layout}
        ref={(el: HTMLDivElement) => setReferenceElement(el)}
        className={classnames(styles.selectContainer, styles[validationStatus], {
          [styles.disabled]: !enabled,
        })}
      >
        <div className={styles.inputRoot}>
          <input
            type="button"
            disabled={!enabled}
            className={classnames(styles.input, {
              [styles.placeholder]: placeholder && !selectedItem,
            })}
            {...getToggleButtonProps()}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            placeholder={placeholder}
            value={selectedItem?.label}
          />
          <span aria-label="toggle menu" className={styles.indicator}>
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </span>
        </div>
        <div {...getMenuProps()}>
          {isOpen &&
            root &&
            createPortal(
              <ul
                className={styles.selectMenu}
                ref={(el: HTMLUListElement) => setPopperElement(el)}
                style={{ ...popperStyles.popper, width }}
                {...attributes.popper}
              >
                {options.length > 0 ? (
                  options.map((item, index) => {
                    const props = getItemProps({ item, index });
                    return (
                      <li
                        {...props}
                        key={index}
                        className={classnames(styles.item, styles.selectable, {
                          [styles.itemActive]: highlightedIndex === index,
                          [styles.itemSelected]: selectedItem?.value === item.value,
                          [styles.itemDisabled]: item.disabled,
                        })}
                      >
                        {optionRenderer(item)}
                      </li>
                    );
                  })
                ) : (
                  <li className={styles.item}>
                    {emptyListTemplate ?? (
                      <span className={styles.empty}>
                        <Icon name={"noresult"} />
                        List is empty
                      </span>
                    )}
                  </li>
                )}
              </ul>,
              root,
            )}
        </div>
      </div>
    </SelectContext.Provider>
  );
}
