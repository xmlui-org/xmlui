import { useCombobox } from "downshift";
import { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import styles from "@components/Combobox/Combobox.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ValidationStatus } from "@components/abstractions";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useTheme } from "@components-core/theming/ThemeContext";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { filterOptions } from "@components/component-utils";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/IconNative";
import { Adornment } from "@components/Input/InputAdornment";
import { OptionComponent } from "@components/Option/OptionNative";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";

// =====================================================================================================================
// React Combobox component implementation

type ComboboxProps = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  layout?: CSSProperties;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  optionRenderer?: (item: Option) => ReactNode;
  emptyListTemplate?: ReactNode;
  children?: ReactNode;
  startIcon?: string;
  startText?: string;
  endIcon?: string;
  endText?: string;
};

function defaultRenderer(item: Option) {
  return <div>{item.label}</div>;
}

export const Combobox = ({
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
  emptyListTemplate,
  optionRenderer = defaultRenderer,
  children,
  startIcon,
  startText,
  endIcon,
  endText,
}: ComboboxProps) => {
  const { options, selectContextValue } = useSelectContextValue();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });
  const { root } = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const items = useMemo(() => {
    return filterOptions(
      searchValue,
      options.filter((option) => !value?.toString().includes(option.value)),
    );
  }, [options, searchValue]);

  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();

  const {
    isOpen,
    selectedItem,
    highlightedIndex,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
    closeMenu,
  } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.label : "";
    },
    isItemDisabled: (item) => item?.disabled!,
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
    onStateChange: ({ type, selectedItem: newSelectedItem, inputValue: newInputValue }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          handleOnBlur();
          if (newSelectedItem) {
            onInputChange(newSelectedItem);
          }
          closeMenu();
          break;
        case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
        case useCombobox.stateChangeTypes.InputClick:
        case useCombobox.stateChangeTypes.InputChange:
          handleOnFocus();
          setSearchValue(newInputValue || "");
          break;
        default:
          break;
      }
    },
  });

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

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const onInputChange = useCallback(
    (selectedOption: Option) => {
      const value = selectedOption.value;
      updateState({ value: value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

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
      <OptionTypeProvider Component={OptionComponent}>
        {children}
      </OptionTypeProvider>
      <div
        className={classnames(styles.comboboxToggleButton, styles[validationStatus], {
          //TODO expand styles[validationStatus]
          [styles.disabled]: !enabled,
        })}
        ref={setReferenceElement}
      >
        <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
        <input
          className={styles.comboboxInput}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          disabled={!enabled}
          {...getInputProps({
            id: id,
          })}
        />
        <div style={{ display: "flex" }}>
          <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
          <button
            aria-label="toggle menu"
            className={styles.indicator}
            {...getToggleButtonProps({ disabled: !enabled })}
          >
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
        <div {...getMenuProps()}>
          {isOpen &&
            root &&
            createPortal(
              <ul
                className={styles.comboboxMenu}
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
};
