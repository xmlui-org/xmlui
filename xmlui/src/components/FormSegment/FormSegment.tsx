import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "FormSegment";
const formSegmentStylesSource = `
$gap-FormSegment: createThemeVar("gap-FormSegment");
$padding-FormSegment: createThemeVar("padding-FormSegment");
$backgroundColor-FormSegment: createThemeVar("backgroundColor-FormSegment");
$borderRadius-FormSegment: createThemeVar("borderRadius-FormSegment");
`;

export const FormSegmentMd = createMetadata({
  status: "experimental",
  description:
    "`FormSegment` groups a subset of fields within a `Form` and exposes segment-scoped context variables.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: {
      description: "An optional human-readable label for this segment.",
      valueType: "string",
    },
    orientation: {
      description: "Stack orientation for the implicit layout container.",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: "vertical",
    },
    fields: {
      description: "Optional comma-separated field names that belong to this segment.",
      valueType: "string",
    },
  },
  contextVars: {
    $segmentData: {
      description: "An object containing current form values for the fields that belong to this segment.",
    },
    $segmentValidationIssues: {
      description: "An object keyed by field name containing validation issues for this segment.",
    },
    $hasSegmentValidationIssue: {
      description: "Returns true when this segment has a validation issue.",
    },
  },
  apis: {
    isValid: {
      description: "Returns true when this segment has no validation issues.",
      signature: "get isValid(): boolean",
    },
    hasIssues: {
      description: "Returns true when this segment has any validation issues.",
      signature: "get hasIssues(): boolean",
    },
    isDirty: {
      description: "Returns true when at least one segment field was modified by the user.",
      signature: "get isDirty(): boolean",
    },
  },
  themeVars: extractScssThemeVars(formSegmentStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-4",
    [`padding-${COMP}`]: "0",
    [`backgroundColor-${COMP}`]: "transparent",
    [`borderRadius-${COMP}`]: "0",
  },
});

