import styles from "./AutoComplete.module.scss";

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
  dComponent,
  dDidChange,
  dGotFocus,
  dLostFocus,
  dMulti,
  createMetadata,
  d,
} from "../metadata-helpers";
import { AutoComplete, defaultProps } from "./AutoCompleteReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "AutoComplete";

export const AutoCompleteMd = createMetadata({
  status: "experimental",
  description:
    "`AutoComplete` is a searchable dropdown input that allows users to type and " +
    "filter through options, with support for single or multiple selections. Unlike " +
    "a basic [`Select`](/docs/reference/components/Select), it provides type-ahead functionality " +
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
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      type: "boolean",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      type: "boolean" as const,
      isInternal: true,
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      type: "string" as const,
      isInternal: true,
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      type: "string" as const,
      isInternal: true,
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
    itemCreated: {
      description:
        "This event is triggered when a new item is created by the user " +
        "(if `creatable` is enabled).",
      signature: "(item: string) => void",
      parameters: {
        item: "The newly created item value.",
      },
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
    [`backgroundColor-${COMP}`]: "transparent",
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
    [`backgroundColor-${COMP}-badge--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-badge--active`]: "$color-primary-500",
    [`textColor-item-${COMP}--disabled`]: "$color-surface-300",
    [`textColor-${COMP}-badge`]: "$const-color-surface-50",
    [`backgroundColor-item-${COMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${COMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-item-${COMP}--active`]: "$backgroundColor-dropdown-item--active",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`textColor-${COMP}--disabled`]: "$textColor--disabled",
  },
});

type ThemedAutoCompleteProps = React.ComponentPropsWithoutRef<typeof AutoComplete>;

export const ThemedAutoComplete = React.forwardRef<React.ElementRef<typeof AutoComplete>, ThemedAutoCompleteProps>(
  function ThemedAutoComplete({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(AutoCompleteMd);
    const combinedClassName = `${themeClass}${className ? ` ${className}` : ""}`;
    return (
      <AutoComplete
        {...props}
        className={combinedClassName}
        contentClassName={combinedClassName}
        ref={ref}
      />
    );
  },
);

export const autoCompleteComponentRenderer = wrapComponent(
  COMP,
  AutoComplete,
  AutoCompleteMd,
  {
    contentClassName: true,
    exposeRegisterApi: true,
    events: {
      gotFocus: "onFocus",
      lostFocus: "onBlur",
      didChange: "onDidChange",
      itemCreated: "onItemCreated",
    },
    renderers: {
      optionTemplate: {
        contextVars: ["$item", "$selectedValue", "$inTrigger"],
      },
    },
  },
);
