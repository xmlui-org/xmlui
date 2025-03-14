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
    [`backgroundColor-menu-${COMP}`]: "$backgroundColor-primary",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    [`minHeight-Input`]: "39px",
    [`backgroundColor-${COMP}-badge`]: "$color-primary-500",
    [`fontSize-${COMP}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${COMP}-badge`]: "$space-1",
    [`paddingVertical-${COMP}-badge`]: "$space-1",
    light: {
      [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-400",
      [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
      [`textColor-item-${COMP}--disabled`]: "$color-surface-200",
      [`textColor-${COMP}-badge`]: "$color-surface-50",
    },
    dark: {
      [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-600",
      [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
      [`textColor-${COMP}-badge`]: "$color-surface-50",
      [`textColor-item-${COMP}--disabled`]: "$color-surface-800",
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
