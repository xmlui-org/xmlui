import { ComponentPropertyMetadata } from "@abstractions/ComponentDefs";
import { validationStatusNames } from "./Input/input-abstractions";

export function dClick(comp: string): ComponentPropertyMetadata {
  return {
    description: `This event is triggered when the ${comp} is clicked.`,
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

export function dIndeterminate(): ComponentPropertyMetadata {
  return {
    description:
      `The \`true\` value of this property signals that the component is in an ` +
      `_intedeterminate state_.`,
  };
}

export function dLabelId(): ComponentPropertyMetadata {
  return {
    description:
      `You can specify the identifier of a component acting as its label. When you click the label, ` +
      `the component behaves as you clicked it.`,
  };
}

export function dLabel(): ComponentPropertyMetadata {
  return {
    description: `This property sets the label of the component.`,
  };
}

export function dLabelPosition(def?: any): ComponentPropertyMetadata {
  return {
    description: `Places the label at the \`top\`, \`right\`, \`bottom\`, or \`left\` of the component.`,
    availableValues: ["top", "right", "bottom", "left"],
    defaultValue: def,
  };
}

export function dAutoFocus(): ComponentPropertyMetadata {
  return {
    description: `This property sets the label of the component.`,
    valueType: "boolean",
    defaultValue: false,
  };
}

export function dInitialValue(def?: any): ComponentPropertyMetadata {
  return {
    description: `This property sets the component's initial value.`,
    defaultValue: def,
  };
}

export function dReadonly(): ComponentPropertyMetadata {
  return {
    description: `Set this property to \`true\` to disallow changing the component value.`,
  };
}

export function dEnabled(): ComponentPropertyMetadata {
  return {
    description:
      `This boolean property's \`true\` value indicates whether the checkbox responds to user events ` +
      `that could change the component value.`,
    valueType: "boolean",
    defaultValue: true,
  };
}

export function dValidationStatus(): ComponentPropertyMetadata {
  return {
    description:
      `This property allows you to set the checkbox's validation status to "none," "error," ` +
      `"warning," or "valid."`,
    availableValues: validationStatusNames,
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
    description: `A placeholder text that is visible in the input field when its empty.`,
  };
}

export function dMaxLength(): ComponentPropertyMetadata {
  return {
    description: `This property sets the maximum length of the input it accepts.`,
  };
}

export function dRequired(): ComponentPropertyMetadata {
  return {
    description:
      `Set this property to \`true\` to indicate it must have a value ` +
      `before submitting the containing form.`,
  };
}

export function dStartText(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets a text to appear at the start (left side when the ` +
      `left-to-right direction is set) of the input.`,
  };
}

export function dStartIcon(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an icon to appear at the start (left side when the ` +
      `left-to-right direction is set) of the input.`,
  };
}

export function dEndText(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets a text to appear on the end (right side when the ` +
      `left-to-right direction is set) of the input.`,
  };
}

export function dEndIcon(): ComponentPropertyMetadata {
  return {
    description:
      `This property sets an icon to appear on the end (right side when the ` +
      `left-to-right direction is set) of the input.`,
  };
}
