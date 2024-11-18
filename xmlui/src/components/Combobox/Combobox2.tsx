import styles from "@components/Combobox/Combobox2.module.scss";

import { type ComponentDef, createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "@components/container-helpers";
import { parseScssVar } from "@components-core/theming/themeVars";
import {
  dAutoFocus,
  dComponent,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLabelId,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "@components/metadata-helpers";
import { Combobox2 } from "@components/Combobox/ComboboxNative2";

const COMP = "Combobox2";

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

export const ComboboxMd = createMetadata({
  status: "experimental",
  description: `A \`${COMP}\` is a component that combines the features of a dropdown list and an input field.`,
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    labelId: dLabelId(),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    optionTemplate: dComponent(
      `You can define a template for the option items of the \`${COMP}\`.`,
    ),
    emptyListTemplate: dComponent(
      `With this property, you can define the template to display when the search list ` +
        `(after filtering) contains no element.`,
    ),
    startIcon: dStartIcon(),
    startText: dStartText(),
    endIcon: dEndIcon(),
    endText: dEndText(),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`shadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
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

export const combobox2ComponentRenderer = createComponentRenderer(
  "Combobox2",
  ComboboxMd,
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
      <Combobox2
        layout={layoutCss}
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        optionRenderer={(item) => {
          return (
            <MemoizedItem
              node={(node.props.optionTemplate || defaultOptionRenderer) as ComponentDef}
              item={item}
              renderChild={renderChild}
            />
          );
        }}
      >
        {renderChild(node.children)}
      </Combobox2>
    );
  },
);
