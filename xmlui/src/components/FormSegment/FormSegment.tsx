import { wrapComponent } from "../../components-core/wrapComponent";
import { defaultProps } from "../DateInput/DateInputReact";
import { createMetadata, d } from "../metadata-helpers";
import { FormSegmentNative } from "./FormSegmentReact";

const COMP = "FormSegment";

export const FormSegmentMd = createMetadata({
  status: "experimental",
  description:
    "`FormSegment` groups a subset of form fields within a `Form` and exposes " +
    "segment-scoped context variables for the fields it contains. Use it to build " +
    "multi-step wizards, collapsible sections, or any layout that needs per-section " +
    "data and validation state without creating a nested form. Children are automatically " +
    'wrapped in a VStack (or HStack if `orientation="horizontal"`) with layout properties ' +
    "transposed from the segment.",
  props: {
    label: {
      description:
        "An optional human-readable label for this segment. `StepperForm` uses this label " +
        "as the corresponding step's title; on its own, `FormSegment` does not render the " +
        "label (it is metadata only).",
      valueType: "string",
    },
    orientation: {
      description:
        'Stack orientation for the implicit layout container. Use "vertical" (default) for a VStack ' +
        'or "horizontal" for an HStack. Layout properties (width, height, padding, gap, backgroundColor, ' +
        "etc.) are transposed to this container.",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: "vertical",
    },
    fields: d(
      "An optional comma-separated list of field names (matching the `bindTo` values of " +
        "nested inputs) that belong to this segment. When omitted the segment auto-discovers " +
        "field names by inspecting its direct and nested children for `bindTo` attributes.",
    ),
  },
  contextVars: {
    $segmentData: d(
      "An object containing the current form values of the fields that belong to this segment, " +
        "keyed by field name. Only fields registered with this segment are included.",
    ),
    $segmentValidationIssues: d(
      "An object keyed by field name containing an array of failed validation results for each " +
        "field that belongs to this segment. Fields without validation issues are omitted.",
    ),
    $hasSegmentValidationIssue: d(
      "A function that returns `true` when any field in this segment has a validation issue. " +
        "Pass a field name as the first argument to check a specific field only.",
    ),
  },
  apis: {
    isValid: {
      description:
        "This property returns `true` when all fields in this segment have passed validation " +
        "(no validation issues), and `false` when any field has a validation error.",
      signature: "isValid: boolean",
    },
    hasIssues: {
      description:
        "This property returns `true` when any field in this segment has a validation issue, " +
        "and `false` when all fields are valid. This is the counterpart of `isValid`.",
      signature: "hasIssues: boolean",
    },
    isDirty: {
      description:
        "This property returns `true` when at least one field in this segment has been " +
        "modified by the user (touched), and `false` when no field has been changed yet. " +
        "Useful for showing validation feedback only after the user has interacted with " +
        "the segment.",
      signature: "isDirty: boolean",
    },
  },
});

export const formSegmentComponentRenderer = wrapComponent(COMP, FormSegmentNative, FormSegmentMd, {
  customRender: (_props, { node, renderChild, extractValue, registerComponentApi }) => (
    <FormSegmentNative
      node={node as any}
      renderChild={renderChild}
      extractValue={extractValue}
      registerComponentApi={registerComponentApi}
    />
  ),
});
