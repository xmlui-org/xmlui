import type {
  ComponentMetadata,
  ComponentPropertyMetadata,
  IsValidFunction,
  PropertyValueDescription,
  PropertyValueType,
} from "../abstractions/ComponentDefs";
import { labelPositionMd, orientationOptionMd, validationStatusMd } from "./abstractions";
import { defaultProps } from "./FormItem/ItemWithLabel";

export function createMetadata<
  TProps extends Record<string, ComponentPropertyMetadata>,
  TEvents extends Record<string, ComponentPropertyMetadata>,
  TContextVars extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TApis extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
>(
  metadata: ComponentMetadata<TProps, TEvents, TContextVars, TApis>,
): ComponentMetadata<TProps, TEvents, TContextVars, TApis> {
  return metadata;
}

export function d(
  description: string,
  availableValues?: readonly PropertyValueDescription[],
  valueType?: PropertyValueType,
  defaultValue?: any,
  isValid?: IsValidFunction<any>,
  isRequired?: boolean,
): ComponentPropertyMetadata {
  return { description, isRequired, availableValues, valueType, defaultValue, isValid };
}

export function dInternal(description?: string): ComponentPropertyMetadata {
  return {
    description: description ?? `This property is for internal use only.`,
    isInternal: true,
  };
}

export function dClick(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when the ${comp} is clicked.`,
  };
}

export function dInit(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when the ${comp} is about to be rendered for the first time.`,
  };
}

export function dGotFocus(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when the ${comp} has received the focus.`,
  };
}

export function dLostFocus(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when the ${comp} has lost the focus.`,
  };
}

export function dDidChange(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when value of ${comp} has changed.`,
  };
}

export function dIndeterminate(defaultValue?: boolean): ComponentPropertyMetadata {
  return {
    description:
      `The \`true\` value of this property signals that the component is in an ` +
      `_intedeterminate state_.`,
    defaultValue,
  };
}

export function dLabel(): ComponentPropertyMetadata {
  return {
    description:
      "This property sets the label of the component.  " +
      "If not set, the component will not display a label.",
    valueType: "string",
  };
}

export function dLabelPosition(def?: string): ComponentPropertyMetadata {
  return {
    description: `Places the label at the given position of the component.`,
    availableValues: labelPositionMd,
    defaultValue: def ?? "top",
  };
}

export function dLabelWidth(comp: string): ComponentPropertyMetadata {
  return {
    description:
      `This property sets the width of the \`${comp}\` component's label. ` +
      "If not defined, the label's width will be determined by its content and the available space.",
  };
}

export function dLabelBreak(comp: string): ComponentPropertyMetadata {
  return {
    description:
      `This boolean value indicates whether the \`${comp}\` label can be split into multiple ` +
      `lines if it would overflow the available label width.`,
    valueType: "boolean",
    defaultValue: defaultProps.labelBreak,
  };
}

export function dAutoFocus(): ComponentPropertyMetadata {
  return {
    description:
      "If this property is set to `true`, the component gets the focus automatically when displayed.",
    valueType: "boolean",
    defaultValue: false,
  };
}

export function dInitialValue(value?: any): ComponentPropertyMetadata {
  return {
    description: `This property sets the component's initial value.`,
    defaultValue: value,
  };
}

export function dReadonly(readOnly?: boolean): ComponentPropertyMetadata {
  return {
    description: `Set this property to \`true\` to disallow changing the component value.`,
    valueType: "boolean",
    defaultValue: readOnly ?? false,
  };
}

export function dEnabled(isEnabled?: boolean): ComponentPropertyMetadata {
  return {
    description: `This boolean property value indicates whether the component responds to user events (\`true\`) or not (\`false\`).`,
    valueType: "boolean",
    defaultValue: isEnabled ?? true,
  };
}

export function dMulti(): ComponentPropertyMetadata {
  return {
    description:
      "The `true` value of the property indicates if the user can select multiple items.",
    valueType: "boolean",
    defaultValue: false,
  };
}

export function dValidationStatus(value?: string): ComponentPropertyMetadata {
  return {
    description: `This property allows you to set the validation status of the input component.`,
    availableValues: validationStatusMd,
    defaultValue: value ?? "none",
  };
}

export function dValueApi(): ComponentPropertyMetadata {
  return {
    description:
      `You can query this read-only API property to query the component's current value (\`true\`: ` +
      `checked, \`false\`: unchecked).`,
  };
}

export function dSetValueApi(): ComponentPropertyMetadata {
  return {
    description:
      `You can use this method to set the component's current value programmatically ` +
      `(\`true\`: checked, \`false\`: unchecked).`,
  };
}

export function dComponent(description: string): ComponentPropertyMetadata {
  return {
    description,
    valueType: "ComponentDef",
  };
}

export function dPlaceholder(): ComponentPropertyMetadata {
  return {
    description: `An optional placeholder text that is visible in the input field when its empty.`,
    valueType: "string",
  };
}

export function dMaxLength(): ComponentPropertyMetadata {
  return {
    description: `This property sets the maximum length of the input it accepts.`,
    valueType: "number",
  };
}

export function dRequired(): ComponentPropertyMetadata {
  return {
    description:
      `Set this property to \`true\` to indicate it must have a value ` +
      `before submitting the containing form.`,
    valueType: "boolean",
    defaultValue: false,
  };
}

export function dStartText(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an optional text to appear at the start (left side when the ` +
      `left-to-right direction is set) of the input.`,
    valueType: "string",
  };
}

export function dStartIcon(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an optional icon to appear at the start (left side when the ` +
      `left-to-right direction is set) of the input.`,
    valueType: "string",
  };
}

export function dEndText(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an optional text to appear on the end (right side when the ` +
      `left-to-right direction is set) of the input.`,
    valueType: "string",
  };
}

export function dEndIcon(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an optional icon to appear on the end (right side when the ` +
      `left-to-right direction is set) of the input.`,
    valueType: "string",
  };
}

export function dExpanded(comp: string): ComponentPropertyMetadata {
  return {
    description: `This property indicates if the ${comp} is expanded (\`true\`) or collapsed (\`false\`).`,
  };
}

export function dExpand(comp: string): ComponentPropertyMetadata {
  return {
    description: `This method expands the ${comp}.`,
  };
}

export function dCollapse(comp: string): ComponentPropertyMetadata {
  return {
    description: `This method collapses the ${comp}.`,
  };
}

export function dFocus(comp: string): ComponentPropertyMetadata {
  return {
    description: `This method sets the focus on the ${comp}.`,
  };
}

export function dValue(): ComponentPropertyMetadata {
  return {
    description:
      `You can query the component's value. If no value is set, it will ` +
      `retrieve \`undefined\`.`,
  };
}

export function dDidOpen(comp: string): ComponentPropertyMetadata {
  return {
    description:
      `This event is triggered when the ${comp} has been displayed. The event handler has a single ` +
      `boolean argument set to \`true\`, indicating that the user opened the component.`,
  };
}

export function dDidClose(comp: string): ComponentPropertyMetadata {
  return {
    description:
      `This event is triggered when the ${comp} has been closed. The event handler has a single ` +
      `boolean argument set to \`true\`, indicating that the user closed the component.`,
  };
}

export function dTriggerTemplate(comp: string): ComponentPropertyMetadata {
  return {
    description:
      `This property allows you to define a custom trigger instead of the default one provided by ` +
      `\`${comp}\`.`,
    valueType: "ComponentDef",
  };
}

export function dOrientation(defaultValue: string, isRequired = false): ComponentPropertyMetadata {
  return {
    description: `This property sets the main axis along which the nested components are rendered.`,
    availableValues: orientationOptionMd,
    valueType: "string",
    defaultValue,
    isRequired,
  };
}
