import type {
  ComponentApiMetadata,
  ComponentEventMetadata,
  ComponentMetadata,
  ComponentMetadataOptimization,
  ComponentPropertyMetadata,
  PropertyValueType,
} from "./types";

export function createMetadata<
  TProps extends Record<string, ComponentPropertyMetadata>,
  TEvents extends Record<string, ComponentEventMetadata>,
  TContextVars extends Record<string, ComponentPropertyMetadata> = Record<string, ComponentPropertyMetadata>,
  TApis extends Record<string, ComponentApiMetadata> = Record<string, ComponentApiMetadata>,
>(
  metadata: ComponentMetadata<TProps, TEvents, TContextVars, TApis> & {
    optimization?: ComponentMetadataOptimization;
  },
): ComponentMetadata<TProps, TEvents, TContextVars, TApis> {
  const { optimization, ...rest } = metadata;
  return optimization
    ? ({ ...rest, ...optimization } as ComponentMetadata<TProps, TEvents, TContextVars, TApis>)
    : (rest as ComponentMetadata<TProps, TEvents, TContextVars, TApis>);
}

export function dInternal(description?: string): ComponentPropertyMetadata {
  return {
    description: description ?? "This property is for internal use only.",
    isInternal: true,
  };
}

export function dClick(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when the ${comp} is clicked.`,
    signature: "click(event: MouseEvent): void",
    parameters: {
      event: "The mouse event object.",
    },
  };
}

export function dContextMenu(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when the ${comp} is right-clicked (context menu).`,
    signature: "contextMenu(event: MouseEvent): void",
    parameters: {
      event: "The mouse event object.",
    },
  };
}

export function dInit(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when the ${comp} is about to be rendered for the first time.`,
    signature: "init(): void",
    parameters: {},
  };
}

export function dGotFocus(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when the ${comp} has received the focus.`,
    signature: "gotFocus(): void",
    parameters: {},
  };
}

export function dLostFocus(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when the ${comp} has lost the focus.`,
    signature: "lostFocus(): void",
    parameters: {},
  };
}

export function dDidChange(comp: string): ComponentEventMetadata {
  return {
    description: `This event is triggered when value of ${comp} has changed.`,
    signature: "didChange(newValue: any): void",
    parameters: {
      newValue: "The new value of the component.",
    },
  };
}

export function dLabel(): ComponentPropertyMetadata {
  return {
    description:
      "This property sets the label of the component. If not set, the component will not display a label.",
    valueType: "string",
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

export function dInitialValue(
  value?: unknown,
  valueType: PropertyValueType = "any",
): ComponentPropertyMetadata {
  return {
    description: "This property sets the component's initial value.",
    valueType,
    defaultValue: value,
  };
}

export function dReadonly(readOnly?: boolean): ComponentPropertyMetadata {
  return {
    description: "Set this property to `true` to disallow changing the component value.",
    valueType: "boolean",
    defaultValue: readOnly ?? false,
  };
}

export function dEnabled(isEnabled?: boolean): ComponentPropertyMetadata {
  return {
    description:
      "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
    valueType: "boolean",
    defaultValue: isEnabled ?? true,
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
    description: "An optional placeholder text that is visible in the input field when it is empty.",
    valueType: "string",
  };
}

export function dRequired(): ComponentPropertyMetadata {
  return {
    description:
      "Set this property to `true` to indicate it must have a value before submitting the containing form.",
    valueType: "boolean",
    defaultValue: false,
  };
}
