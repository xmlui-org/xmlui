import styles from "./AutoComplete.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
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
  dMulti,
  createMetadata,
  d,
} from "../metadata-helpers";
import { AutoComplete, defaultProps } from "./AutoCompleteNative";

const COMP = "AutoComplete";

export const AutoCompleteMd = createMetadata({
  status: "experimental",
  description:
    "`AutoComplete` is a searchable dropdown input that allows users to type and " +
    "filter through options, with support for single or multiple selections. Unlike " +
    "a basic [`Select`](/components/Select), it provides type-ahead functionality " +
    "and can allow users to create new options.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    maxLength: dMaxLength(),
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
    initiallyOpen: d(
      `This property determines whether the dropdown list is open when the component is first rendered.`,
      null,
      "boolean",
      defaultProps.initiallyOpen,
    ),
    creatable: d(
      `This property allows the user to create new items that are not present in the list of options.`,
      null,
      "boolean",
      defaultProps.creatable,
    ),
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    dropdownHeight: d("This property sets the height of the dropdown list."),
    multi: {
      ...dMulti(),
      defaultValue: defaultProps.multi,
    },
    optionTemplate: dComponent(
      `This property enables the customization of list items. To access the attributes of ` +
        `a list item use the \`$item\` context variable.`,
    ),
    emptyListTemplate: dComponent(
      "This property defines the template to display when the list of options is empty.",
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
    itemCreated: {
      description:
        "This event is triggered when a new item is created by the user " +
        "(if `creatable` is enabled).",
    },
  },
  apis: {
    focus: {
      description: `This method focuses the ${COMP} component.`,
      signature: "focus()",
    },
    value: {
      description:
        "This API allows you to get or set the value of the component. If no value is set, " +
        "it will retrieve `undefined`.",
      signature: "get value(): any",
    },
    setValue: {
      description:
        "This API allows you to set the value of the component. If the value is not valid, " +
        "the component will not update its internal state.",
      signature: "setValue(value: any)",
      parameters: {
        value: "The value to set.",
      },
    },
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
    registerComponentApi,
    className,
  }) => {
    return (
      <AutoComplete
        multi={extractValue.asOptionalBoolean(node.props.multi)}
        className={className}
        updateState={updateState}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        creatable={extractValue.asOptionalBoolean(node.props.creatable)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        onItemCreated={lookupEventHandler("itemCreated")}
        registerComponentApi={registerComponentApi}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        dropdownHeight={extractValue(node.props.dropdownHeight)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        initiallyOpen={extractValue.asOptionalBoolean(node.props.initiallyOpen)}
        optionRenderer={
          node.props.optionTemplate
            ? (item, val, inTrigger) => {
                return (
                  <MemoizedItem
                    node={node.props.optionTemplate}
                    item={item}
                    context={{
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
      </AutoComplete>
    );
  },
);
