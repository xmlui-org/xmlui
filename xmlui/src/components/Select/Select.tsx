import styles from "./Select.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dPlaceholder,
  dInitialValue,
  dAutoFocus,
  dRequired,
  dReadonly,
  dEnabled,
  dValidationStatus,
  dDidChange,
  dGotFocus,
  dLostFocus,
  dMulti,
  dComponent,
  createMetadata,
  d,
} from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { Select, defaultProps } from "./SelectNative";

const COMP = "Select";

export const SelectMd = createMetadata({
  status: "stable",
  description:
    "`Select` provides a dropdown interface for choosing from a list of options, " +
    "supporting both single and multiple selection modes. It offers extensive " +
    "customization capabilities including search functionality, custom templates, " +
    "and comprehensive form integration.",
  parts: {
    clearButton: {
      description: "The button to clear the selected value(s).",
    },
    item: {
      description: "Each option item within the Select component.",
    },
    menu: {
      description: "The dropdown menu within the Select component.",
    },
  },
  props: {
    placeholder: {
      ...dPlaceholder(),
      defaultValue: defaultProps.placeholder,
    },
    initialValue: dInitialValue(),
    value: {
      description: "This property sets the current value of the component.",
      isInternal: true, //TODO illesg temp
    },
    autoFocus: {
      ...dAutoFocus(),
      defaultValue: defaultProps.autoFocus,
    },
    required: {
      ...dRequired(),
      defaultValue: defaultProps.required,
    },
    readOnly: {
      ...dReadonly(),
      defaultValue: defaultProps.readOnly,
    },
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    optionLabelTemplate: dComponent(
      `This property allows replacing the default template to display an option in the dropdown list.`,
    ),
    optionTemplate: dComponent(
      `This property allows replacing the default template to display an option in the dropdown list.`,
    ),
    valueTemplate: dComponent(
      `This property allows replacing the default template to display a selected value when ` +
        `multiple selections (\`multiSelect\` is \`true\`) are enabled.`,
    ),
    dropdownHeight: d(
      "This property sets the height of the dropdown list. If not set, the height is determined automatically.",
    ),
    emptyListTemplate: dComponent(
      `This optional property provides the ability to customize what is displayed when the ` +
        `list of options is empty.`,
    ),
    multiSelect: {
      ...dMulti(),
      defaultValue: defaultProps.multiSelect,
    },
    searchable: {
      description: `This property enables the search functionality in the dropdown list.`,
      defaultValue: defaultProps.searchable,
    },
    inProgress: {
      description: `This property indicates whether the component is in progress. It can be used to show a loading message.`,
      defaultValue: defaultProps.inProgress,
    },
    inProgressNotificationMessage: {
      description: `This property indicates the message to display when the component is in progress.`,
      defaultValue: defaultProps.inProgressNotificationMessage,
    },
    clearable: {
      description: `This property enables a clear button that allows the user to clear the selected value(s).`,
      defaultValue: defaultProps.clearable,
    },
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      valueType: "boolean"
    }
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This method focuses the \`${COMP}\` component. You can use it to programmatically focus the component.`,
      signature: "focus(): void",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: string | string[] | undefined): void",
      parameters: {
        value:
          "The new value to set. Can be a single value or an array of values for multi-select.",
      },
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): string | string[] | undefined",
    },
    reset: {
      description: `This method resets the component to its initial value, or clears the selection if no initial value was provided.`,
      signature: "reset(): void",
    },
  },
  contextVars: {
    $item: d("Represents the current option's data (label and value properties)"),
    $itemContext: d("Provides utility methods like `removeItem()` for multi-select scenarios"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-menu-${COMP}`]: "$color-surface-raised",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`borderWidth-menu-${COMP}`]: "1px",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`backgroundColor-${COMP}-badge`]: "$color-primary-500",
    [`fontSize-${COMP}-badge`]: "$fontSize-sm",
    [`paddingHorizontal-${COMP}-badge`]: "$space-2_5",
    [`paddingVertical-${COMP}-badge`]: "$space-0_5",
    [`borderRadius-${COMP}-badge`]: "$borderRadius",
    [`paddingHorizontal-item-${COMP}`]: "$space-2",
    [`paddingVertical-item-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`opacity-text-item-${COMP}--disabled`]: "0.5",
    [`opacity-${COMP}--disabled`]: "0.5",
    [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-200",
    [`textColor-${COMP}-badge`]: "$const-color-surface-50",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    // Default borderColor-Input--disabled is too light so the disabled component is barely visible
    [`borderColor-${COMP}--disabled`]: "initial",
    [`minHeight-${COMP}`]: "$space-7",
    [`minHeight-item-${COMP}`]: "$space-7",
  },
});

export const selectComponentRenderer = createComponentRenderer(
  COMP,
  SelectMd,
  ({
    node,
    state,
    updateState,
    extractValue,
    renderChild,
    lookupEventHandler,
    className,
    registerComponentApi,
  }) => {
    const multiSelect = extractValue.asOptionalBoolean(node.props.multiSelect);
    const searchable = extractValue.asOptionalBoolean(node.props.searchable);
    const clearable = extractValue.asOptionalBoolean(node.props.clearable);

    const isControlled = node.props.value !== undefined;
    return (
      <Select
        multiSelect={multiSelect}
        className={className}
        inProgress={extractValue.asOptionalBoolean(node.props.inProgress)}
        inProgressNotificationMessage={extractValue.asOptionalString(
          node.props.inProgressNotificationMessage,
        )}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        updateState={isControlled ? undefined : updateState}
        searchable={searchable}
        clearable={clearable}
        initialValue={extractValue(node.props.initialValue)}
        value={isControlled ? extractValue(node.props.value) : state?.value}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        dropdownHeight={extractValue(node.props.dropdownHeight)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        modal={extractValue.asOptionalBoolean(node.props.modal)}
        valueRenderer={
          node.props.valueTemplate
            ? (item, removeItem) => {
                return (
                  <MemoizedItem
                    contextVars={{
                      $itemContext: { removeItem },
                    }}
                    node={node.props.valueTemplate}
                    item={item}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        optionRenderer={
          node.props.optionTemplate
            ? (item, val, inTrigger) => {
                return (
                  <MemoizedItem
                    node={node.props.optionTemplate}
                    item={item}
                    contextVars={{
                      $selectedValue: val,
                      $inTrigger: inTrigger,
                    }}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
      >
        {renderChild(node.children)}
      </Select>
    );
  },
);
