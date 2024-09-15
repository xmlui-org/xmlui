import styles from "./RadioGroup.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { RadioGroup, RadioGroupOption } from "./RadioGroupNative";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLabelId,
  dLostFocus,
  dMaxLength,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "@components/metadata-helpers";

const RGOption = "RadioGroupOption";

export const RadioGroupOptionMd = createMetadata({
  description: "A single radio button within a radio button group",
  props: {
    enabled: dEnabled(),
    value: d("The value of the option"),
    label: d("The option's label"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${RGOption}`]: "$space-1_5",
    [`thickness-border-${RGOption}`]: "2px",
    [`color-bg-checked-${RGOption}--disabled]`]: `$color-border-${RGOption}--disabled`,
    [`color-bg-checked-${RGOption}-error`]: `$color-border-${RGOption}-error`,
    [`color-bg-checked-${RGOption}-warning`]: `$color-border-${RGOption}-warning`,
    [`color-bg-checked-${RGOption}-success`]: `$color-border-${RGOption}-success`,
    [`font-size-${RGOption}`]: "$font-size-small",
    [`font-weight-${RGOption}`]: "$font-weight-bold",
    [`color-text-${RGOption}-error`]: `$color-border-${RGOption}-error`,
    [`color-text-${RGOption}-warning`]: `$color-border-${RGOption}-warning`,
    [`color-text-${RGOption}-success`]: `$color-border-${RGOption}-success`,
    light: {
      [`color-bg-checked-${RGOption}-default`]: "$color-primary-500",
      [`color-border-${RGOption}-default`]: "$color-surface-500",
      [`color-border-${RGOption}-default--hover`]: "$color-surface-700",
      [`color-border-${RGOption}-default--active`]: "$color-primary-500",
    },
    dark: {
      [`color-bg-checked-${RGOption}-default`]: "$color-primary-500",
      [`color-border-${RGOption}-default`]: "$color-surface-500",
      [`color-border-${RGOption}-default--hover`]: "$color-surface-300",
      [`color-border-${RGOption}-default--active`]: "$color-primary-400",
    },
  },
});

export const radioGroupOptionRenderer = createComponentRendererNew(
  RGOption,
  RadioGroupOptionMd,
  ({ node, extractValue }) => {
    return (
      <RadioGroupOption
        value={extractValue.asString(node.props.value)}
        label={extractValue.asOptionalString(node.props.label)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      />
    );
  },
);

const COMP = "RadioGroup";

export const RadioGroupMd = createMetadata({
  description:
    `The \`${COMP}\` input component is a group of radio buttons ` +
    `([\`RadioGroupOption\`](./RadioGroupOption.mdx) components) that allow users to select ` +
    `only one option from the group at a time.`,
  props: {
    initialValue: dInitialValue(),
    labelId: dLabelId(),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
});

export const radioGroupRenderer = createComponentRendererNew(
  COMP,
  RadioGroupMd,
  ({
    node,
    extractValue,
    layoutCss,
    state,
    updateState,
    lookupEventHandler,
    renderChild,
    registerComponentApi,
  }) => {
    return (
      <RadioGroup
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        layout={layoutCss}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        updateState={updateState}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </RadioGroup>
    );
  },
);
