import type { SingleValidationResult, ValidationResult } from "../Form/FormContext";

export const UNBOUND_FIELD_SUFFIX = "__UNBOUND_FIELD__";

export enum FormActionKind {
  FIELD_LOST_FOCUS = "FormActionKind:FIELD_LOST_FOCUS",
  FIELD_VALUE_CHANGED = "FormActionKind:FIELD_VALUE_CHANGED",
  FIELD_FOCUSED = "FormActionKind:FIELD_FOCUSED",
  FIELD_VALIDATED = "FormActionKind:FIELD_VALIDATED",
  FIELD_INITIALIZED = "FormActionKind:FIELD_INITIALIZED",
  FIELD_REMOVED = "FormActionKind:FIELD_REMOVED",
  TRIED_TO_SUBMIT = "FormActionKind:TRIED_TO_SUBMIT",
  BACKEND_VALIDATION_ARRIVED = "FormActionKind:BACKEND_VALIDATION_ARRIVED",
  SUBMITTING = "FormActionKind:SUBMITTING",
  SUBMITTED = "FormActionKind:SUBMITTED",
  RESET = "FormActionKind:RESET",
}

export type FormAction = {
  type: FormActionKind;
  // Potential improvement: Try to specify the type with more details
  payload:
    | {
        uid?: any;
        data?: any;
        error?: any;
        value?: any;
      }
    | any;
};

export function fieldInitialized(uid: string, value: any, force = false, noSubmit = false) {
  return {
    type: FormActionKind.FIELD_INITIALIZED,
    payload: {
      uid,
      value,
      force,
      noSubmit
    },
  };
}

export function fieldChanged(uid: string, value: any) {
  return {
    type: FormActionKind.FIELD_VALUE_CHANGED,
    payload: {
      uid,
      value
    },
  };
}

export function fieldFocused(uid: string) {
  return {
    type: FormActionKind.FIELD_FOCUSED,
    payload: {
      uid,
    },
  };
}

export function fieldLostFocus(uid: string) {
  return {
    type: FormActionKind.FIELD_LOST_FOCUS,
    payload: {
      uid,
    },
  };
}

export function fieldValidated(uid: string, validationResult: ValidationResult) {
  return {
    type: FormActionKind.FIELD_VALIDATED,
    payload: {
      uid,
      validationResult,
    },
  };
}

export function fieldRemoved(uid: string) {
  return {
    type: FormActionKind.FIELD_REMOVED,
    payload: {
      uid,
    },
  };
}

export function triedToSubmit() {
  return {
    type: FormActionKind.TRIED_TO_SUBMIT,
    payload: {},
  };
}
export function formSubmitting() {
  return {
    type: FormActionKind.SUBMITTING,
    payload: {},
  };
}

export function formSubmitted() {
  return {
    type: FormActionKind.SUBMITTED,
    payload: {},
  };
}

export function formReset() {
  return {
    type: FormActionKind.RESET,
    payload: {},
  };
}

export function backendValidationArrived({
  generalValidationResults = [],
  fieldValidationResults = {},
}: {
  generalValidationResults: Array<SingleValidationResult>;
  fieldValidationResults: Record<string, Array<SingleValidationResult>>;
}) {
  return {
    type: FormActionKind.BACKEND_VALIDATION_ARRIVED,
    payload: {
      generalValidationResults,
      fieldValidationResults,
    },
  };
}
