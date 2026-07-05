export {
  createMetadata,
  dClick,
  dComponent,
  dContextMenu,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dInternal,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
} from "../component-core/metadata/helpers";

export function dOrientation(defaultValue?: string) {
  return {
    description: "This optional string determines the component orientation.",
    valueType: "string" as const,
    availableValues: ["horizontal", "vertical"],
    defaultValue,
  };
}

export function dMaxLength() {
  return {
    description: "Maximum input length.",
    valueType: "number" as const,
  };
}

export function dStartText() {
  return {
    description: "The text displayed at the start of the input.",
    valueType: "string" as const,
  };
}

export function dStartIcon() {
  return {
    description: "The icon displayed at the start of the input.",
    valueType: "icon" as const,
  };
}

export function dEndText() {
  return {
    description: "The text displayed at the end of the input.",
    valueType: "string" as const,
  };
}

export function dEndIcon() {
  return {
    description: "The icon displayed at the end of the input.",
    valueType: "icon" as const,
  };
}

export function dValidationStatus(defaultValue?: string) {
  return {
    description: "The validation status of the input.",
    valueType: "string" as const,
    availableValues: ["valid", "warning", "error", "none"],
    defaultValue,
  };
}

export function dIndeterminate(defaultValue?: boolean) {
  return {
    description:
      "The `true` value of this property signals that the component is in an _indeterminate state_.",
    valueType: "boolean" as const,
    defaultValue,
  };
}

export function dMulti() {
  return {
    description: "This property enables selecting multiple values.",
    valueType: "boolean" as const,
  };
}

export function dSetValueApi() {
  return {
    description:
      "You can use this method to set the component's current value programmatically.",
  };
}

export function dTriggerTemplate(component: string) {
  return {
    description: `This property defines a custom trigger template for the ${component}.`,
    valueType: "ComponentDef" as const,
  };
}
