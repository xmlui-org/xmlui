import { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
import { createMetadata } from "../metadata-helpers";
import componentSource from "./FormSection.xmlui?raw";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
    "`FormSection` groups elements within a `Form`. Child components are placed in " +
    "a [FlowLayout](/components/FlowLayout).",
});

export const formSectionRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: FormSectionMd,
};
