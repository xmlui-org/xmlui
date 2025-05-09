import styles from "../Select/Select.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dPlaceholder,
  dInitialValue,
  dMaxLength,
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
} from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { Select } from "./SelectNative";
import { SelectItemText } from "@radix-ui/react-select";

const COMP = "Select";

export const SelectMd = createMetadata({
  description: "Provides a dropdown with a list of options to choose from.",
  status: "experimental",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
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
    dropdownHeight: d("This property sets the height of the dropdown list."),
    emptyListTemplate: d(
      `This optional property provides the ability to customize what is displayed when the ` +
        `list of options is empty.`,
    ),
    multiSelect: dMulti(),
    searchable: d(`This property enables the search functionality in the dropdown list.`),
    inProgress: d(
      `This property indicates whether the component is in progress. It can be used to show a loading message.`,
    ),
    inProgressNotificationMessage: d(
      `This property indicates the message to display when the component is in progress.`,
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    setValue: dSetValueApi(),
    value: dValue(),
    reset: d(
      `This method resets the component to its initial value, or clears the selection if no initial value was provided.`,
    ),
  },
  contextVars: {
    $item: d(`This property represents the value of an item in the dropdown list.`),
    $itemContext: d(
      `This property provides a \`removeItem\` method to delete the particular value from the selection.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-menu-${COMP}`]: "$color-surface-raised",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`borderWidth-menu-${COMP}`]: "1px",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    [`minHeight-Input`]: "39px",
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
        optionLabelRenderer={
          node.props.optionLabelTemplate
            ? (item) => {
                return (
                  <MemoizedItem
                    node={node.props.optionLabelTemplate}
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
                    renderChild={(...args) =>
                      multiSelect || searchable ? (
                        renderChild(...args)
                      ) : (
                        <SelectItemText>{renderChild(...args)}</SelectItemText>
                      )
                    }
                  />
                );
              }
            : undefined
        }
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
