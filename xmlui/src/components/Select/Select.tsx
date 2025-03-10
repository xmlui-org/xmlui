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
import { Select } from "../Select/SelectNative";

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
  },
  contextVars: {
    $item: d(`This property represents the value of an item in the dropdown list.`),
    $itemContext: d(
      `This property provides a \`removeItem\` method to delete the particular value from the selection.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`boxShadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
    [`thickness-border-menu-${COMP}`]: "1px",
    [`color-border-menu-${COMP}`]: "$color-border",
    [`color-bg-item-${COMP}`]: "$color-bg-dropdown-item",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    [`color-bg-item-${COMP}--active`]: "$color-bg-dropdown-item--active",
    [`min-height-Input`]: "39px",
    [`color-bg-${COMP}-badge`]: "$color-primary-500",
    [`fontSize-${COMP}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${COMP}-badge`]: "$space-1",
    [`paddingVertical-${COMP}-badge`]: "$space-1",
    [`opacity-text-item-${COMP}--disabled`]: "0.5",
    [`opacity-${COMP}--disabled`]: "0.5",
    light: {
      [`color-bg-${COMP}-badge--hover`]: "$color-primary-400",
      [`color-bg-${COMP}-badge--active`]: "$color-primary-500",
      [`color-text-item-${COMP}--disabled`]: "$color-surface-200",
      [`color-text-${COMP}-badge`]: "$color-surface-50",
    },
    dark: {
      [`color-bg-${COMP}-badge--hover`]: "$color-primary-600",
      [`color-bg-${COMP}-badge--active`]: "$color-primary-500",
      [`color-text-${COMP}-badge`]: "$color-surface-50",
      [`color-text-item-${COMP}--disabled`]: "$color-surface-800",
    },
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
    return (
      <Select
        multiSelect={extractValue.asOptionalBoolean(node.props.multiSelect)}
        style={layoutCss}
        updateState={updateState}
        searchable={extractValue.asOptionalBoolean(node.props.searchable)}
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
