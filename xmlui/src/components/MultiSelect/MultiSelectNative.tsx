import { useMultipleSelection, useSelect } from "downshift";
import { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { EMPTY_ARRAY, noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import styles from "./MultiSelect.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ValidationStatus } from "@components/abstractions";
import { useTheme } from "@components-core/theming/ThemeContext";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/IconNative";
import { isEqual } from "lodash-es";
import { Adornment } from "@components/Input/InputAdornment";
import { OptionComponent } from "@components/Option/OptionNative";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";

type MultiSelectProps = {
  id?: string;
  initialValue?: string[];
  value?: string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  onDidChange?: (e: any) => void;
  optionRenderer?: (item: any) => ReactNode;
  emptyListTemplate?: ReactNode;
  layout?: CSSProperties;
  validationStatus?: ValidationStatus;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export function MultiSelect({
  id,
  emptyListTemplate,
  initialValue = EMPTY_ARRAY,
  value = EMPTY_ARRAY,
  placeholder,
  updateState = noop,
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  validationStatus = "none",
  enabled = true,
  optionRenderer = defaultRenderer,
  children,
  startText,
  startIcon,
  endText,
  endIcon,
}: MultiSelectProps) {
  const [initValue, setInitValue] = useState<string[] | undefined>(initialValue);
  const { options, selectContextValue } = useSelectContextValue();
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });
  const { root } = useTheme();

  const onInputChange = useCallback(
    (newValue: string[]) => {
      updateState({ value: newValue });
      onDidChange(newValue);
    },
    [onDidChange, updateState],
  );

  const { getSelectedItemProps, getDropdownProps } = useMultipleSelection({
    onSelectedItemsChange: ({ selectedItems }) => {
      if (selectedItems) {
        onInputChange((selectedItems as Option[]).map((item: Option) => item.value) || []);
      }
    },
  });

  const items = useMemo(
    () => options.filter((option) => !value.includes(option.value)),
    [options, value],
  );

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    closeMenu,
  } = useSelect({
    items,
    toggleButtonId: id,
    itemToString(item: Option | null) {
      return item ? item.label : "";
    },
    isItemDisabled: (item) => item.enabled === false,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
        case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
            highlightedIndex: 0, // with the first option highlighted.
          };
      }
      return changes;
    },
    onStateChange: ({ type, selectedItem }) => {
      switch (type) {
        case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
        case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
        case useSelect.stateChangeTypes.ToggleButtonBlur:
          handleOnBlur();
          if (selectedItem) {
            onInputChange([...value, selectedItem.value]);
            closeMenu();
          }
          break;
        case useSelect.stateChangeTypes.ToggleButtonClick:
          handleOnFocus();
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

  useEffect(() => {
    registerComponentApi?.({
      focus,
    });
  }, [focus, registerComponentApi]);

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
      <div className={styles.multiSelectContainer}>
        <button
          type="button"
          disabled={!enabled}
          className={classnames(styles.selectToggleButton, styles[validationStatus], {
            [styles.disabled]: !enabled,
          })}
          {...getToggleButtonProps({
            ...getDropdownProps({
              preventKeyAction: isOpen,
              ref: (el: HTMLButtonElement) => setReferenceElement(el),
            }),
          })}
        >
          <div className={styles.selectedOptions}>
            <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
            {value.length === 0 ? (
              placeholder ? (
                <span className={styles.placeholder}>{placeholder}</span>
              ) : (
                <span>&nbsp;</span>
              )
            ) : (
              options
                .filter((option) => value.includes(option.value))
                .map(function renderSelectedItem(selectedItemForRender, index) {
                  return (
                    <div
                      key={`selected-item-${index}`}
                      className={styles.multiValue}
                      {...getSelectedItemProps({
                        selectedItem: selectedItemForRender,
                        index,
                      })}
                    >
                      <div className={styles.multiValueLabel}>{selectedItemForRender?.label}</div>
                      <button
                        role="button"
                        className={classnames(styles.multiValueRemove, {
                          [styles.disabled]: !enabled,
                        })}
                        onClick={(e) => {
                          if (enabled) {
                            e.stopPropagation();
                            onInputChange(value.filter((v) => v !== selectedItemForRender.value));
                          }
                        }}
                      >
                        <span>&#10005;</span>
                      </button>
                    </div>
                  );
                })
            )}
          </div>
          <div style={{ display: "flex" }}>
            <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
            <span aria-label="toggle menu" className={styles.indicator}>
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </span>
          </div>
        </button>
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
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const props = getItemProps({ item, index });
                    return (
                      <li
                        {...props}
                        key={`${item.value}${index}`}
                        className={classnames(styles.item, {
                          [styles.itemActive]: highlightedIndex === index,
                          [styles.itemSelected]: selectedItem === item,
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
