// =============================================================================
// FormValidator — plan #09 / W5-2: cross-field form validator
// =============================================================================
//
// `<FormValidator>` is a non-visual child of `<Form>` that runs a user-supplied
// `validate` event against the form's current `$data` and reports back a
// per-field error map. It exists because per-field `validator=` and
// `onValidate=` only have access to a single value, while many real-world
// rules ("password === confirmPassword", "endDate >= startDate", "at least
// one of email/phone is set") inherently involve multiple fields.
//
// Authoring shape:
//   <Form>
//     ...
//     <FormValidator
//       bindTo="confirmPassword,password"
//       onValidate="
//         return $data.password === $data.confirmPassword
//           ? null
//           : { confirmPassword: 'Passwords do not match' };
//       "
//     />
//   </Form>
//
// The `validate` handler receives the cleaned form data and returns either:
//   - `null` / `undefined` / `{}` — no errors,
//   - `Record<string, string>` — `{ fieldName: errorMessage }` entries to
//     surface as per-field validation errors (severity defaults to `error`).
//
// Implementation: the parent `<Form>` exposes a `registerCrossFieldValidator`
// callback through `FormValidatorRegistryContext`. Each `<FormValidator>`
// resolves its `onValidate` handler at render time and registers it on mount,
// unregistering on unmount. The Form then runs all registered validators
// during submit/validate, merging their per-field errors into
// `formState.validationResults`.
// -----------------------------------------------------------------------------

import { createContext, useContext, useEffect, useId } from "react";

import { createMetadata } from "../metadata-helpers";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "FormValidator";

export const FormValidatorMd = createMetadata({
  status: "experimental",
  description:
    "`FormValidator` is a non-visual child of `Form` that runs a cross-field " +
    "validation rule. Place one inside a `Form` and provide an `onValidate` " +
    "handler that returns either `null` (no error) or an object mapping " +
    "`fieldName` → `errorMessage`.",
  props: {
    bindTo: {
      description:
        "Comma-separated list of field names this validator depends on. " +
        "Currently informational — the handler always receives the full " +
        "`$data` object — but future versions may use it to scope re-runs.",
      valueType: "string",
    },
    severity: {
      description: "Severity applied to errors produced by this validator.",
      valueType: "string",
      availableValues: ["error", "warning"],
      isStrictEnum: true,
      defaultValue: "error",
    },
  },
  events: {
    validate: {
      description:
        "Fires when the form requests cross-field validation. Receives the " +
        "current form data and should return `null` for valid, or an object " +
        "of the form `{ fieldName: 'error message' }` to flag fields.",
      signature: "validate(data: Record<string, any>): null | Record<string, string>",
      parameters: {
        data: "The current form data snapshot.",
      },
    },
  },
});

// -----------------------------------------------------------------------------
// Registry context — Form provides, FormValidator consumes.
// -----------------------------------------------------------------------------

export interface FormValidatorDef {
  id: string;
  bindTo: string[];
  severity: "error" | "warning";
  validate: (data: Record<string, any>) => unknown | Promise<unknown>;
}

export interface FormValidatorRegistry {
  register: (def: FormValidatorDef) => void;
  unregister: (id: string) => void;
}

export const FormValidatorRegistryContext = createContext<FormValidatorRegistry | null>(null);

// -----------------------------------------------------------------------------
// Renderer
// -----------------------------------------------------------------------------

interface FormValidatorReactProps {
  bindTo?: string;
  severity?: "error" | "warning";
  onValidate?: (data: Record<string, any>) => unknown | Promise<unknown>;
}

function FormValidatorReact({
  bindTo,
  severity = "error",
  onValidate,
}: FormValidatorReactProps) {
  const id = useId();
  const registry = useContext(FormValidatorRegistryContext);
  useEffect(() => {
    if (!registry || !onValidate) return;
    const parsed =
      typeof bindTo === "string"
        ? bindTo.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    registry.register({
      id,
      bindTo: parsed,
      severity: severity === "warning" ? "warning" : "error",
      validate: onValidate,
    });
    return () => registry.unregister(id);
  }, [registry, id, bindTo, severity, onValidate]);
  return null;
}

export const formValidatorComponentRenderer = wrapComponent(
  COMP,
  FormValidatorReact,
  FormValidatorMd,
  {
    customRender: (_props, { node, extractValue, lookupEventHandler }) => (
      <FormValidatorReact
        bindTo={extractValue.asOptionalString(node.props?.bindTo)}
        severity={
          (extractValue.asOptionalString(node.props?.severity) as
            | "error"
            | "warning"
            | undefined) ?? "error"
        }
        onValidate={lookupEventHandler("validate") as any}
      />
    ),
  },
);

