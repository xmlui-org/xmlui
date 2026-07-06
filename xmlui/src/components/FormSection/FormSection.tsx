import { createMetadata } from "../../component-core/metadata/helpers";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
    "The `FormSection` is a component that groups cohesive elements together within a `Form`. " +
    "This grouping is indicated visually: the child components of the `FormSection` are placed " +
    "in a `FlowLayout` component.",
});
