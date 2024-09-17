import { useCombobox, useMultipleSelection } from "downshift";
import type { CSSProperties, ReactNode } from "react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "../abstractions";
import { EMPTY_ARRAY, noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import styles from "./MultiCombobox.module.scss";
import classnames from "@components-core/utils/classnames";
import { createPortal } from "react-dom";
import { useTheme } from "@components-core/theming/ThemeContext";
import { usePopper } from "react-popper";
import type { ValidationStatus } from "@components/abstractions";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { Adornment } from "@components/Input/InputAdornment";
import { filterOptions } from "../component-utils";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/IconNative";
import { isEqual } from "lodash-es";

type MultiComboboxProps = {
  id?: string;
  initialValue?: string[];
  value?: string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  layout?: CSSProperties;
  onDidChange?: (newValue: string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  optionRenderer?: (item: Option) => ReactNode;
  emptyListTemplate?: ReactNode;
  children?: ReactNode;
  autoFocus?: boolean;
  startIcon?: string;
  startText?: string;
  endIcon?: string;
  endText?: string;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export const MultiCombobox = ({
  id,
  initialValue = EMPTY_ARRAY,
  value = EMPTY_ARRAY,
  enabled = true,
  placeholder,
  updateState = noop,
  validationStatus = "none",
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  emptyListTemplate,
  optionRenderer = defaultRenderer,
  layout,
  children,
  autoFocus,
  startIcon,
  startText,
  endIcon,
  endText,
}: MultiComboboxProps) => {
  const [initValue, setInitValue] = useState<string[] | undefined>(initialValue);
  const { options, selectContextValue } = useSelectContextValue();
  const inputRef = useRef<HTMLInputElement>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });
  const { root } = useTheme();
  const [inputValue, setInputValue] = React.useState("");

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const items = useMemo(() => {
    return filterOptions(
      inputValue,
      options.filter((option) => !value.includes(option.value)),
    );
  }, [inputValue, options, value]);

  const { getSelectedItemProps, getDropdownProps } = useMultipleSelection({
    onStateChange({ selectedItems, type }) {
      switch (type) {
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
        case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          if (selectedItems) {
            onInputChange(selectedItems.map((item: any) => item.value).concat(value));
          }
          break;
        default:
          break;
      }
    },
  });
  const {
    isOpen,
    selectedItem,
    closeMenu,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    //labelId: id,
    // toggleButtonId: id,
    defaultHighlightedIndex: 0,
    items,
    itemToString(item: Option | null) {
      return item ? item.label : "";
    },
    isItemDisabled: (item) => item.disabled!,
    inputValue,
    stateReducer(state, actionAndChanges) {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
            highlightedIndex: 0,
          };
        default:
          return changes;
      }
    },
    onStateChange({ inputValue: newInputValue, type, selectedItem }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          handleOnBlur();
          if (selectedItem) {
            onInputChange([...value, selectedItem.value]);
            setInputValue("");
            closeMenu();
          }
          break;
        case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
        case useCombobox.stateChangeTypes.InputClick:
        case useCombobox.stateChangeTypes.InputChange:
          handleOnFocus();
          setInputValue(newInputValue || "");
          break;
        default:
          break;
      }
    },
  });

  useEffect(() => {
    setInitValue((prevState) => {
      if (isEqual(prevState, initialValue)) {
        return prevState;
      }
      console.log("Setting initial value", initialValue);
      return initialValue;
    });
  }, [initialValue]);

  useEffect(() => {
    updateState({ value: initValue });
  }, [initValue, updateState]);

  const onInputChange = useCallback(
    (newValue: string[]) => {
      updateState({ value: newValue });
      onDidChange(newValue);
    },
    [onDidChange, updateState],
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

  useEffect(() => {
    registerComponentApi?.({
      focus,
    });
  }, [focus, registerComponentApi]);

  // Sizing the dropdown list width to the reference button size

  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
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

  return (
    <SelectContext.Provider value={selectContextValue}>
      {children}
      <div className={styles.comboboxContainer} style={layout}>
        <div
          className={classnames(styles.comboboxToggleButton, styles[validationStatus], {
            [styles.disabled]: !enabled,
          })}
          ref={setReferenceElement}
        >
          <div className={styles.selectedOptions}>
            <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
            {options
              .filter((option) => value.includes(option.value))
              .map(function renderSelectedItem(selectedItemForRender, index) {
                return (
                  <div
                    data-multi-value-container={true}
                    className={styles.multiValue}
                    key={`selected-item-${index}`}
                    {...getSelectedItemProps({
                      selectedItem: selectedItemForRender,
                      index,
                      disabled: !enabled,
                    })}
                  >
                    <div className={styles.multiValueLabel}>{selectedItemForRender.label}</div>
                    <div
                      role="button"
                      className={classnames(styles.multiValueRemove, {
                        [styles.disabled]: !enabled,
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (enabled) {
                          onInputChange(value.filter((v) => v !== selectedItemForRender.value));
                        }
                      }}
                    >
                      &#10005;
                    </div>
                  </div>
                );
              })}
            <div className={styles.comboboxInputContainer}>
              <input
                {...getInputProps(
                  getDropdownProps({
                    preventKeyAction: isOpen,
                    id: id,
                    ref: inputRef,
                    placeholder: placeholder,
                    disabled: !enabled,
                    className: styles.comboboxInput,
                  }),
                )}
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
            <button
              aria-label="toggle-menu"
              className={styles.indicator}
              type="button"
              {...getToggleButtonProps({ disabled: !enabled })}
            >
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>
        <div {...getMenuProps()}>
          {isOpen &&
            root &&
            createPortal(
              <ul
                className={styles.multiComboboxMenu}
                ref={(el: HTMLUListElement) => setPopperElement(el)}
                style={{ ...popperStyles.popper, width }}
                {...attributes.popper}
              >
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const props = getItemProps({ item, index, "aria-disabled": item.disabled });
                    return (
                      <li
                        {...props}
                        key={index}
                        className={classnames(styles.item, styles.selectable, {
                          [styles.itemActive]: highlightedIndex === index,
                          [styles.itemSelected]: selectedItem === item,
                          [styles.itemDisabled]: item.disabled,
                        })}
                      >
                        {item.renderer ? item.renderer(item) : optionRenderer(item)}
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
};
