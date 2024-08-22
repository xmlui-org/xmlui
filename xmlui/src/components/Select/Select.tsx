import { useSelect } from "downshift";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useEvent } from "@components-core/utils/misc";
import styles from "@components/Select/Select.module.scss";
import { Icon } from "@components/Icon/Icon";

import { MemoizedItem } from "@components/container-helpers";
import classnames from "@components-core/utils/classnames";
import { usePopper } from "react-popper";
import { useTheme } from "@components-core/theming/ThemeContext";
import { createPortal } from "react-dom";
import type { InputComponentDef, ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { SelectContext, useSelectContextValue } from "./SelectContext";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";

// =====================================================================================================================
// React Select component definition

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
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });
  const { root } = useTheme();

  const { isOpen, selectedItem, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
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
    isItemDisabled: (item) => item.disabled!,
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
    [onDidChange, updateState]
  );

  const onInputChange = useCallback((selectedOption: Option) => updateValue(selectedOption.value), [updateValue]);

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
    observer.current = new ResizeObserver(() => referenceElement && setWidth(referenceElement.clientWidth));
    if (current && observer.current) {
      observer.current.observe(referenceElement);
    }
  }, [referenceElement]);

  return (
    <SelectContext.Provider value={selectContextValue}>
      {children}
      <div className={styles.selectContainer} style={layout}>
        <button
          type="button"
          disabled={!enabled}
          className={classnames(styles.selectToggleButton, styles[validationStatus], {
            [styles.disabled]: !enabled,
          })}
          {...getToggleButtonProps({ ref: (el: HTMLButtonElement) => setReferenceElement(el) })}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        >
          {selectedItem ? <span>{selectedItem.label}</span> : <span className={styles.placeholder}>{placeholder}</span>}
          <span aria-label="toggle menu" className={styles.indicator}>
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </span>
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
              root
            )}
        </div>
      </div>
    </SelectContext.Provider>
  );
}

// ============================================================================
// XMLUI Select definition

/**
 * The \`Select\` component provides a menu of options to be displayed in a dropdown list with using label-value pairs.
 * The dropdown list displays the labels while
 * XMLUI stores the selected value for further use when the user selects a particular item.
 * @descriptionRef
 */
export interface SelectComponentDef extends ComponentDef<"Select"> {
  props: {
    /**
     * The initial value displayed in the input field.
     * If the value is not in the list, it will be ignored.
     * @descriptionRef
     */
    initialValue?: string[];
    /**
     * Indicates whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * The default value is \`true\`.
     * @descriptionRef
     */
    enabled?: boolean;
    /**
     * With this property, you can set the input control's validation status to "none", "error", "warning", or "valid".
     * This results in a visual indication of a status change (reacting to form field validation).
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /**
     * The placeholder is displayed in place of the selected value in the input field.
     * @descriptionRef
     */
    placeholder?: string;
    /** @internal */
    options: Option[];
    /**
     * This property enables the customization of list items.
     * To access the attributes of a list item use the `$item` keyword.
     * @descriptionRef
     */
    optionTemplate?: ComponentDef;
    /**
     * This optional property provides the ability to customize what is displayed when the list of options is empty.
     * @descriptionRef
     */
    emptyListTemplate?: ComponentDef;
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
     *
     * See the example in the [gotFocus event section](#gotfocus).
     */
    lostFocus?: string;
  };
  api: {
    /**
     * This API method focuses the input field.
     * @descriptionRef
     */
    focus: () => void;
    /**
     * This API method programmatically sets the value of the field.
     * The same rules apply as for the [\`initialValue\`](#initialvalue) property.
     * @descriptionRef
     */
    setValue: (newValue: any) => void;
  };
  contextVars: {
    /**
     * This context variable acts as a template for an item in the list.
     * Access attributes of the item using the dot notation.
     *
     * For an example, see the [\`optionTemplate\`](#optiontemplate) property or the [\`didChange\`](#didchange) event.
     */
    "$item": any;
  };
}

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label} akakaka",
  },
};

const metadata: ComponentDescriptor<SelectComponentDef> = {
  displayName: "Select",
  description: "A dropdown list of options",
  props: {
    ...inputComponentPropertyDescriptors,
    options: desc("List of options to display"),
    optionTemplate: desc("Template to render each option"),
    emptyListTemplate: desc("Template to render when the list is empty"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-menu-Select": "$color-bg-primary",
    "shadow-menu-Select": "$shadow-md",
    "radius-menu-Select": "$radius",
    "color-bg-item-Select": "$color-bg-dropdown-item",
    "color-bg-item-Select--hover": "$color-bg-dropdown-item--active",
    light: {
      "color-text-item-Select--disabled": "$color-surface-200",
    },
    dark: {
      "color-text-item-Select--disabled": "$color-surface-800",
    },
  },
};

export const selectComponentRenderer = createComponentRenderer<SelectComponentDef>(
  "Select",
  ({ node, state, updateState, extractValue, renderChild, lookupEventHandler, layoutCss, registerComponentApi }) => {
    return (
      <Select
        layout={layoutCss}
        updateState={updateState}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
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
      </Select>
    );
  },
  metadata
);
