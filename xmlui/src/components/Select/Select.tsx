import styles from "../Select/Select.module.scss";

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
  dFocus,
  dSetValueApi,
  dMulti,
  dLabel,
  dLabelPosition,
  dLabelWidth,
  dLabelBreak,
  dValue,
  dComponent,
  createMetadata,
  d,
} from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { Select, defaultProps } from "./SelectNative";
import { SelectItemText } from "@radix-ui/react-select";

const COMP = "Select";

export const SelectMd = createMetadata({
  status: "stable",
  description:
    "`Select` provides a dropdown interface for choosing from a list of options, " +
    "supporting both single and multiple selection modes. It offers extensive " +
    "customization capabilities including search functionality, custom templates, " +
    "and comprehensive form integration.",
  props: {
    placeholder: {
      ...dPlaceholder(),
      defaultValue: defaultProps.placeholder,
    },
    initialValue: dInitialValue(),
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
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: {
      ...dLabelBreak(COMP),
      defaultValue: defaultProps.labelBreak,
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
    [`fontSize-${COMP}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${COMP}-badge`]: "$space-1",
    [`paddingVertical-${COMP}-badge`]: "$space-1",
    [`paddingHorizontal-item-${COMP}`]: "$space-2",
    [`paddingVertical-item-${COMP}`]: "$space-2",
    [`opacity-text-item-${COMP}--disabled`]: "0.5",
    [`opacity-${COMP}--disabled`]: "0.5",
    [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-200",
    [`textColor-${COMP}-badge`]: "$color-surface-50",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    // Default borderColor-Input--disabled is too light so the disabled component is barely visible
    [`borderColor-${COMP}--disabled`]: "initial",
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
    layoutCss,
    registerComponentApi,
  }) => {
    const multiSelect = extractValue.asOptionalBoolean(node.props.multiSelect);
    const searchable = extractValue.asOptionalBoolean(node.props.searchable);

    return (
      <Select
        multiSelect={multiSelect}
        style={layoutCss}
        inProgress={extractValue.asOptionalBoolean(node.props.inProgress)}
        inProgressNotificationMessage={extractValue.asOptionalString(
          node.props.inProgressNotificationMessage,
        )}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        updateState={updateState}
        searchable={searchable}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
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
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
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
      >
        {renderChild(node.children)}
      </Select>
    );
  },
);
