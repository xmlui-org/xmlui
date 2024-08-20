import { useCombobox } from "downshift";
import React, { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "@components/container-helpers";
import styles from "@components/Combobox/Combobox.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useTheme } from "@components-core/theming/ThemeContext";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { SelectContext, useSelectContextValue } from "@components/Select/SelectContext";
import { filterOptions } from "@components/component-utils";
import { ChevronDownIcon } from "@components/Icon/ChevronDownIcon";
import { ChevronUpIcon } from "@components/Icon/ChevronUpIcon";
import Icon from "@components/Icon/Icon";
import { Adornment } from "@components/Input/InputAdornment";

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
    return filterOptions(searchValue, options.filter((option) => !value.includes(option.value)));
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
    // labelId: id,
    // toggleButtonId: id,
    items,
    itemToString(item) {
      return item ? item.label : "";
    },
    isItemDisabled: (item) => item.disabled,
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
      {children}
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

// ============================================================================
// XMLUI Combobox definition

/**
 * A \`Combobox\` is a component that combines the features of a dropdown list and an input field.
 */
export interface ComboboxComponentDef extends ComponentDef<"Combobox"> {
  props: {
    /**
     * A placeholder text that is visible in the input field when its empty.
     * @descriptionRef
     */
    placeholder?: string;
    /** @internal */
    value?: string | string[];
    /**
     * The initial value displayed in the input field.
     * @descriptionRef
     */
    initialValue?: string | string[];
    /**
     * You can specify the identifier of a component acting as its label. When you click the label,
     * the component behaves as you clicked it.
     */
    labelId?: string;
    /**
     * The maximum length of the input that the field accepts.
     * @descriptionRef
     */
    maxLength?: number;
    /**
     * If this boolean prop is set to \`true\`, the \`Combobox\` will be focused when it appears on the UI.
     * The default is \`false\`.
     * @descriptionRef
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate it must have a value before submitting the containing form.
     */
    required?: boolean;
    /**
     * This boolean determines whether the input field can be modified or not.
     * @descriptionRef
     */
    readOnly?: boolean;
    /**
     * Controls whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * @descriptionRef
     */
    enabled?: string | boolean;
    /**
     * This prop is used to visually indicate status changes reacting to form field validation.
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /**
     * You can define a template for the option items of the `Combobox`.
     */
    optionTemplate?: ComponentDef;
    /**
     * With this property, you can define the template to display when the search list (after filtering)
     * contains no element.
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
     * This event is triggered after the user has changed the field value.
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
  };
}

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

const metadata: ComponentDescriptor<ComboboxComponentDef> = {
  displayName: "Combobox",
  description: "A combobox component",
  props: {
    placeholder: desc("Placeholder text to sign the input is empty"),
    value: desc("The current value to display"),
    initialValue: desc("The initial value to display"),
    labelId: desc("ID of the label attached to this input"),
    maxLength: desc("The maximum length of the input text"),
    autoFocus: desc("Should the component be automatically focused?"),
    required: desc("Is the component value required (use for indication)?"),
    readOnly: desc("Is the component read-only?"),
    enabled: desc("Is the component enabled?"),
    validationStatus: desc("The validation status of the component"),
    // --- Adornment props
    optionTemplate: desc("Template to render each option"),
    emptyListTemplate: desc("Template to render when the list is empty"),
  },
  events: {
    didChange: desc("Triggered when the input value changes"),
    gotFocus: desc("Triggered when the input gains focus"),
    lostFocus: desc("triggered when the input has lost focus"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-menu-Combobox": "$color-bg-primary",
    "shadow-menu-Combobox": "$shadow-md",
    "radius-menu-Combobox": "$radius",
    "color-bg-item-Combobox": "$color-bg-dropdown-item",
    "color-bg-item-Combobox--hover": "$color-bg-dropdown-item--active",
    light: {
      "color-text-item-Combobox--disabled": "$color-surface-200",
    },
    dark: {
      "color-text-item-Combobox--disabled": "$color-surface-800",
    },
  },
};

export const comboboxComponentRenderer = createComponentRenderer<ComboboxComponentDef>(
  "Combobox",
  ({ node, state, updateState, extractValue, renderChild, lookupEventHandler, layoutCss, registerComponentApi }) => {
    return (
      <Combobox
        layout={layoutCss}
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
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
      </Combobox>
    );
  },
  metadata,
);
