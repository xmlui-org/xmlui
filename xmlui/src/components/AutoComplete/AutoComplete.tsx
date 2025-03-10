import styles from "../../components/AutoComplete/AutoComplete.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../../components/container-helpers";
import {
  dPlaceholder,
  dInitialValue,
  dMaxLength,
  dAutoFocus,
  dRequired,
  dReadonly,
  dEnabled,
  dValidationStatus,
  dComponent,
  dDidChange,
  dGotFocus,
  dLostFocus,
  dFocus,
  dSetValueApi,
  dMulti,
} from "../../components/metadata-helpers";
import { AutoComplete } from "../../components/AutoComplete/AutoCompleteNative";

const COMP = "AutoComplete";

export const AutoCompleteMd = createMetadata({
  description:
    "This component is a dropdown with a list of options. According to the " +
    "`multi` property, the user can select one or more items.",
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
    dropdownHeight: d("This property sets the height of the dropdown list."),
    multi: dMulti(),
    optionTemplate: dComponent(
      `This property enables the customization of list items. To access the attributes of ` +
        `a list item use the \`$item\` context variable.`,
    ),
    emptyListTemplate: d(
      "This property defines the template to display when the list of options is empty.",
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: d(
      `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
    ),
    setValue: dSetValueApi(),
  },
  contextVars: {
    $item: d(
      "This context value represents an item when you define an option item template. " +
        "Use `$item.value` and `$item.label` to refer to the value and label of the " +
        "particular option.",
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`boxShadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
    [`color-bg-item-${COMP}`]: "$color-bg-dropdown-item",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    [`color-bg-item-${COMP}--active`]: "$color-bg-dropdown-item--active",
    [`min-height-Input`]: "39px",
    [`color-bg-${COMP}-badge`]: "$color-primary-500",
    [`fontSize-${COMP}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${COMP}-badge`]: "$space-1",
    [`paddingVertical-${COMP}-badge`]: "$space-1",
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

export const autoCompleteComponentRenderer = createComponentRenderer(
  COMP,
  AutoCompleteMd,
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
      <AutoComplete
        multi={extractValue.asOptionalBoolean(node.props.multi)}
        style={layoutCss}
        updateState={updateState}
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
        optionRenderer={
          node.props.optionTemplate
            ? (item) => {
                return (
                  <MemoizedItem
                    node={node.props.optionTemplate}
                    item={item}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
      >
        {renderChild(node.children)}
      </AutoComplete>
    );
  },
);
