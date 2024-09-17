import styles from "./MultiCombobox.module.scss";

import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { MultiCombobox } from "./MultiComboboxNative";
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
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "@components/metadata-helpers";

const COMP = "MultiCombobox";

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

export const MultiComboboxMd = createMetadata({
  description:
    `The \`${COMP}\` component is essentially a [\`ComboBox\`](./ComboBox.mdx) that enables ` +
    `the selection of multiple elements from a list either by typing in the field or by ` +
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
    options: d(`This property specifies the list of options to be displayed in the dropdown.`),
    optionTemplate: dComponent(
      `This property defines the template to display a particular option.`,
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
    [`color-bg-value-${COMP}`]: "$color-bg-secondary",

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

export const multiComboboxComponentRenderer = createComponentRendererNew(
  COMP,
  MultiComboboxMd,
  ({ node, state, updateState, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <MultiCombobox
        layout={layoutCss}
        updateState={updateState}
        value={state?.value}
        initialValue={extractValue.asOptionalStringArray(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        emptyListTemplate={renderChild(node.props.emptyListTemplate)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        startText={extractValue.asOptionalString(node.props.startText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
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
      </MultiCombobox>
    );
  },
);
