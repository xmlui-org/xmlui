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
    groupBy: {
      description:
        "Field name on each Option to group by. When set, the dropdown shows a " +
        "section header above each group of options sharing the same value of " +
        "`option[groupBy]`. Headers are computed against the currently visible " +
        "(filtered) options, so searching automatically updates which option carries " +
        "its group's header. Use it together with an extra attribute on `<Option>` " +
        "(e.g. `clientName=\"{$item.clientName}\"`). Mirrors `Select`'s `groupBy`.",
      valueType: "string" as const,
    },
    groupHeaderTemplate: dComponent(
      "Customizes the section header rendered above each group when `groupBy` " +
        "is set. Use the `$group` context variable to access the group name. " +
        "When omitted, the group name is rendered as plain text.",
    ),
    ungroupedHeaderTemplate: dComponent(
      "Customizes the section header for the \"Ungrouped\" bucket (options that " +
        "do not declare a value for the `groupBy` field). When omitted, the " +
        "Ungrouped bucket has no header.",
    ),
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      valueType: "boolean",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean" as const,
      isInternal: true,
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "string" as const,
      isInternal: true,
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "string" as const,
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
    $group: d(
      "Group name available inside `groupHeaderTemplate` when `groupBy` is set.",
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
    // Group header styling (used when `groupBy` is set on AutoComplete).
    [`paddingHorizontal-groupHeader-${COMP}`]: "$space-3",
    [`paddingTop-groupHeader-${COMP}`]: "$space-3",
    [`paddingBottom-groupHeader-${COMP}`]: "$space-1",
    [`fontSize-groupHeader-${COMP}`]: "$fontSize-tiny",
    [`fontWeight-groupHeader-${COMP}`]: "700",
    [`letterSpacing-groupHeader-${COMP}`]: "0.05em",
    [`textTransform-groupHeader-${COMP}`]: "uppercase",
    [`textColor-groupHeader-${COMP}`]: "$textColor-subtitle",
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
      groupHeaderTemplate: {
        contextVars: ["$group"],
      },
      ungroupedHeaderTemplate: {
        contextVars: [],
      },
    },
  },
);
