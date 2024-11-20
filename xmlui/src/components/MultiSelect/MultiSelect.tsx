import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "@components/container-helpers";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "@components/MultiSelect/MultiSelect.module.scss";

import {
  dAutoFocus,
  dComponent,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabelId,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dSetValueApi,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "@components/metadata-helpers";
import { MultiSelect } from "@components/MultiSelect/MultiSelectNative";

const COMP = "MultiSelect";

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

export const MultiSelectMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component works the same way as the [\`Select\`](./Select.mdx) ` +
    `component with the addition of the ability to select multiple elements from a list by ` +
    `clicking list elements in the dropdown. These elements are then displayed in the field ` +
    `and can be removed as necessary.`,
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    labelId: dLabelId(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    options: dComponent(
      `This property specifies the list of options to be displayed in the dropdown.`,
    ),
    optionTemplate: dComponent(
      `This property sets the placeholder text displayed in the input field if no value is selected.`,
    ),
    emptyListTemplate: dComponent(
      `With this property, you can specify what should appear when the list is empty.`,
    ),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    setValue: dSetValueApi(),
  },
  contextVars: {
    $item: d(`This context variable acts as a template for an item in the list.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`shadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
    [`color-text-value-${COMP}`]: "$color-text-primary",
    [`color-bg-value-${COMP}`]: "$color-bg-primary",
    [`color-bg-item-${COMP}`]: "$color-bg-dropdown-item",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    light: {
      [`color-text-item-${COMP}--disabled`]: "$color-surface-200",
    },
    dark: {
      [`color-text-item-${COMP}--disabled`]: "$color-surface-800",
    },
  },
});

export const multiSelectComponentRenderer = createComponentRenderer(
  COMP,
  MultiSelectMd,
  ({
    node,
    state,
    updateState,
    extractValue,
    renderChild,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <MultiSelect
        placeholder={extractValue(node.props.placeholder)}
        updateState={updateState}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        initialValue={extractValue.asOptionalStringArray(node.props.initialValue)}
        value={state?.value}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        registerComponentApi={registerComponentApi}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        optionRenderer={(item) => {
          return (
            <MemoizedItem
              node={node.props.optionTemplate || (defaultOptionRenderer as any)}
              item={item}
              renderChild={renderChild}
            />
          );
        }}
      >
        {renderChild(node.children)}
      </MultiSelect>
    );
  },
);
