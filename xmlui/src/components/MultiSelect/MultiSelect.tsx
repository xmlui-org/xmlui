import { useMultipleSelection, useSelect } from "downshift";
import React, { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { EMPTY_ARRAY, noop } from "@components-core/constants";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./MultiSelect.module.scss";
import { MemoizedItem } from "@components/container-helpers";
import classnames from "@components-core/utils/classnames";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { useTheme } from "@components-core/theming/ThemeContext";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/Icon";
import { isEqual } from "lodash-es";
import { Adornment } from "@components/Input/InputAdornment";

// =====================================================================================================================
// React MultiSelect component definition

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

  const items = useMemo(() => options.filter((option) => !value.includes(option.value)), [options, value]);

  const { isOpen, selectedItem, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps, closeMenu } =
    useSelect({
      items,
      toggleButtonId: id,
      itemToString(item: Option | null) {
        return item ? item.label : "";
      },
      isItemDisabled: (item) => item.disabled!,
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
    observer.current = new ResizeObserver(() => referenceElement && setWidth(referenceElement.clientWidth));
    if (current && observer.current) {
      observer.current.observe(referenceElement);
    }
  }, [referenceElement]);

  return (
    <SelectContext.Provider value={selectContextValue}>
      {children}
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

// ============================================================================
// XMLUI MultiSelect definition

/**
 * The \`MultiSelect\` component works the same way as the [\`Select\`](./Select.mdx)
 * component with the addition of the ability to select multiple elements from a list by clicking list elements in the dropdown.
 * These elements are then displayed in the field and can be removed as necessary.
 */
export interface MultiSelectComponentDef extends ComponentDef<"MultiSelect"> {
  props: {
    /** @internal */
    labelId?: string;
    /** @internal */
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
     * Specify a list of values that should be initially selected from the list.
     * If the value is not in the list, it will be ignored.
     * @descriptionRef
     */
    initialValue?: string[];
    /**
     * This property specifies the list of options to be displayed in the dropdown.
     * @internal
     */
    options: Option[];
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
     * For an example, see the [\`optionTemplate\`](#optiontemplate) property or the [\`didChange\`](#didChange) event.
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

const metadata: ComponentDescriptor<MultiSelectComponentDef> = {
  displayName: "MultiSelect",
  description: "A multi-select dropdown component",
  props: {
    ...inputComponentPropertyDescriptors,
    options: desc("List of options to display"),
    optionTemplate: desc("Template to render each option"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-menu-MultiSelect": "$color-bg-primary",
    "shadow-menu-MultiSelect": "$shadow-md",
    "radius-menu-MultiSelect": "$radius",

    "color-text-value-MultiSelect": "$color-text-primary",
    "color-bg-value-MultiSelect": "$color-bg-primary",

    "color-bg-item-MultiSelect": "$color-bg-dropdown-item",
    "color-bg-item-MultiSelect--hover": "$color-bg-dropdown-item--active",
    light: {
      "color-text-item-MultiSelect--disabled": "$color-surface-200",
    },
    dark: {
      "color-text-item-MultiSelect--disabled": "$color-surface-800",
    },
  },
};

export const multiSelectComponentRenderer = createComponentRenderer<MultiSelectComponentDef>(
  "MultiSelect",
  ({ node, state, updateState, extractValue, renderChild, lookupEventHandler }) => {
    return (
      <MultiSelect
        placeholder={extractValue(node.props.placeholder)}
        updateState={updateState}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        initialValue={extractValue.asOptionalStringArray(node.props.initialValue)}
        value={state?.value}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        startText={extractValue.asOptionalString(node.props.startText)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
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
      </MultiSelect>
    );
  },
  metadata,
);
