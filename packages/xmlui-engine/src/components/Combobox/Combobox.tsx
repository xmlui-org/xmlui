import { useCombobox } from "downshift";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Option } from "@components/abstractions";
import { noop } from "@components-core/constants";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "@components/container-helpers";
import styles from "@components/Combobox/Combobox.module.scss";
import classnames from "@components-core/utils/classnames";
import type { InputComponentDef, ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
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
  onChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  optionRenderer?: (item: Option) => ReactNode;
  emptyListTemplate?: ReactNode;
  children?: ReactNode;
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
  onChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  emptyListTemplate,
  optionRenderer = defaultRenderer,
  children,
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
    return filterOptions(searchValue, options);
  }, [options, searchValue]);

  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();

  const { isOpen, selectedItem, highlightedIndex, getMenuProps, getInputProps, getItemProps, getToggleButtonProps } =
    useCombobox({
      // labelId: id,
      // toggleButtonId: id,
      onInputValueChange({ inputValue }) {
        setSearchValue(inputValue || "");
      },
      items,
      itemToString(item) {
        return item ? item.label : "";
      },
      initialSelectedItem: options.find((item) => item.value === value) || null,
      selectedItem: options.find((item) => item.value === value) || null,
      onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
        if (newSelectedItem) {
          onInputChange(newSelectedItem);
        }
      },
      isItemDisabled: (item) => item.disabled,
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
      onChange(value);
    },
    [onChange, updateState]
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
        <span aria-label="toggle menu" className={styles.indicator} {...getToggleButtonProps({ disabled: !enabled })}>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
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
              root
            )}
        </div>
      </div>
    </SelectContext.Provider>
  );
};

// ============================================================================
// XMLUI Combobox definition

type ComboboxComponentDef = InputComponentDef<"Combobox"> & {
  props: {
    options: Option[] | string[];
    optionTemplate?: ComponentDef;
    emptyListTemplate?: ComponentDef;
  };
};

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
    ...inputComponentPropertyDescriptors,
    options: desc("List of options to display"),
    optionTemplate: desc("Template to render each option"),
    emptyListTemplate: desc("Template to render when the list is empty"),
  },
  events: inputComponentEventDescriptors,
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
  ({ node, state, updateState, extractValue, renderChild, lookupAction, layoutCss, registerComponentApi }) => {
    return (
      <Combobox
        layout={layoutCss}
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onChange={lookupAction(node.events?.change)}
        onFocus={lookupAction(node.events?.gotFocus)}
        onBlur={lookupAction(node.events?.lostFocus)}
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
      </Combobox>
    );
  },
  metadata
);
