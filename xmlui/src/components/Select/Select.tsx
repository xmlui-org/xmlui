import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "@components/Select/Select.module.scss";
import { MemoizedItem } from "@components/container-helpers";
import { parseScssVar } from "@components-core/theming/themeVars";
import {
  dPlaceholder,
  dInitialValue,
  dLabelId,
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
} from "@components/metadata-helpers";
import { Select } from "@components/Select/SelectNative";
import { MultiSelect } from "@components/Select/MultiSelectNative";

const COMP = "Select";

const defaultOptionRenderer = {
  type: "Text",
  props: {
    value: "{$item.label}",
  },
};

export const SelectMd = createMetadata({
  description: "Provides a dropdown with a list of options to choose from.",
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
      `This property enables the customization of list items. To access the attributes of ` +
        `a list item use the \`$item\` context variable.`,
    ),
    emptyListTemplate: d(
      `This optional property provides the ability to customize what is displayed when the ` +
        `list of options is empty.`,
    ),
    multi: dMulti(),
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
  },
  contextVars: {
    $item: d(`This context variable acts as a template for an item in the list.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`shadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
    [`color-bg-item-${COMP}`]: "$color-bg-dropdown-item",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    [`color-bg-item-${COMP}--active`]: "$color-bg-dropdown-item--active",
    [`min-height-Input`]: "39px",
    light: {
      [`color-text-item-${COMP}--disabled`]: "$color-surface-200",
    },
    dark: {
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
    if (extractValue(node.props.multi)) {
      return (
        <MultiSelect
          searchable={extractValue.asOptionalBoolean(node.props.searchable)}
          layout={layoutCss}
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
    }
    return (
      <Select
        layout={layoutCss}
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
      </Select>
    );
  },
);
