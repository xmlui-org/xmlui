import { useCombobox, useMultipleSelection } from "downshift";
import type { CSSProperties, ReactNode } from "react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "../abstractions";
import { EMPTY_ARRAY, noop } from "@components-core/constants";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import styles from "./MultiCombobox.module.scss";
import classnames from "@components-core/utils/classnames";
import { createPortal } from "react-dom";
import { useTheme } from "@components-core/theming/ThemeContext";
import { usePopper } from "react-popper";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { Adornment } from "@components/Input/InputAdornment";
import { filterOptions } from "../component-utils";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/Icon";
import { isEqual } from "lodash-es";

// =====================================================================================================================
// React MultiCombobox component definition

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
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
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
      options.filter((option) => !value.includes(option.value))
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
    [onDidChange, updateState]
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
          ref={(el: any) => setReferenceElement(el)}
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
                  })
                )}
              />
            </div>
          </div>
          <div style={{display: "flex"}}>
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
              root
            )}
        </div>
      </div>
    </SelectContext.Provider>
  );
};

// ============================================================================
// XMLUI MultiCombobox definition

/**
 * The \`MultiCombobox\` component is essentially a [\`ComboBox\`](./ComboBox.mdx) that enables the selection of multiple elements
 * from a list either by typing in the field or by clicking list elements in the dropdown.
 * These elements are then displayed in the field and can be removed as necessary.
 */
export interface MultiComboboxComponentDef extends ComponentDef<"MultiCombobox"> {
  props: {
    /** @internal */
    labelId?: string;
    /**
     * Set this property to \`true\` to automatically focus the component when it is displayed.
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate that it must have a value before submitting the form that contains it.
     * @internal
     */
    required?: boolean;
    /**
     * Set this property to \`true\` to disallow changing the component value.
     * @internal
     */
    readOnly?: boolean;
    /**
     * With this property, you can set the input control's validation status to "none", "error", "warning", or "valid".
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /**
     * This property sets the placeholder text displayed in the input field if no value is selected.
     * @descriptionRef
     */
    placeholder?: string;
    /**
     * Indicates whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * The default value is \`true\`.
     * @descriptionRef
     */
    enabled?: boolean;
    /**
     * This property specifies the list of options to be displayed in the dropdown.
     * @internal
     */
    options: Option[] | string[];
    /**
     * Specify a list of values that should be initially selected from the list.
     * If the value is not in the list, it will be ignored.
     * @descriptionRef
     */
    initialValue?: string[];
    /** @internal */
    onSelect?: string;
    /**
     * This property sets the placeholder text displayed in the input field if no value is selected.
     * @descriptionRef
     */
    optionTemplate?: ComponentDef;
    /**
     * With this property, you can specify what should appear when the list is empty.
     * The template accepts any component definition.
     * @descriptionRef
     */
    emptyListTemplate?: ComponentDef;
    /**
     * This property sets the icon the left side of the input field (in a left-to-right display).
     * The value must be a valid icon name, otherwise nothing will be rendered.
     * @descriptionRef
     */
    startIcon?: string;
    /**
     * This property sets a text to appear on the right side of the input field (in a left-to-right display).
     * @descriptionRef
     */
    startText?: string;
    /**
     * This property sets the icon the right side of the input field (in a left-to-right display).
     * @descriptionRef
     */
    endIcon?: string;
    /**
     * This property sets a text to appear on the right side of the input field (in a left-to-right display).
     * @descriptionRef
     */
    endText?: string;
  };
  events: {
    /**
     * This event fires when the selected item list changes.
     * @descriptionRef
     */
    didChange?: string;
    /**
     * This event fires when the component is focused.
     * @descriptionRef
     */
    gotFocus?: string;
    /**
     * This event fires when the component loses focus.
     * @descriptionRef
     */
    lostFocus?: string;
  };
  api: {
    /**
     * This API method focuses the input field.
     * @descriptionRef
     */
    focus: () => void;
  };
  contextVars: {
    /**
     * This context variable acts as a template for an item in the list.
     * Access attributes of the item using the dot notation.
     *
     * For an example, see the [\`optionTemplate\`](#optiontemplate) property or the [\`change\`](#change) event.
     */
    $item: any;
  };
}

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

const metadata: ComponentDescriptor<MultiComboboxComponentDef> = {
  displayName: "MultiCombobox",
  description: "A multi combobox component",
  props: {
    ...inputComponentPropertyDescriptors,
    options: desc("List of options to display"),
    optionTemplate: desc("Template to render each option"),
    emptyListTemplate: desc("Template to render when the list is empty"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-menu-MultiCombobox": "$color-bg-primary",
    "shadow-menu-MultiCombobox": "$shadow-md",
    "radius-menu-MultiCombobox": "$radius",

    "color-text-value-MultiCombobox": "$color-text-primary",
    "color-bg-value-MultiCombobox": "$color-bg-secondary",

    "color-bg-item-MultiCombobox": "$color-bg-dropdown-item",
    "color-bg-item-MultiCombobox--hover": "$color-bg-dropdown-item--active",
    light: {
      "color-text-item-MultiCombobox--disabled": "$color-surface-200",
    },
    dark: {
      "color-text-item-MultiCombobox--disabled": "$color-surface-800",
    },
  },
};

export const multiComboboxComponentRenderer = createComponentRenderer<MultiComboboxComponentDef>(
  "MultiCombobox",
  ({ node, state, updateState, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <MultiCombobox
        layout={layoutCss}
        updateState={updateState}
        value={state?.value}
        initialValue={extractValue.asOptionalStringArray(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        startText={extractValue.asOptionalString(node.props.startText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        optionRenderer={(item) => {
          return (
            <MemoizedItem
              node={node.props.optionTemplate || defaultOptionRenderer}
              item={item}
              renderChild={renderChild}
            />
          );
        }}
      >
        {renderChild(node.children)}
      </MultiCombobox>
    );
  },
  metadata
);
