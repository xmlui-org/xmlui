import { CompoundComponentDef, createMetadata } from "@abstractions/ComponentDefs";
import { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import componentSource from "./FormSection.xmlui?raw";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` is a component that groups cohesive elements together within ` +
    `a \`Form\`. This grouping is indicated visually: the child components of the \`${COMP}\` ` +
    `are placed in a [\`FlowLayout\`](./FlowLayout.mdx) component.`,
});


console.log('componentSource', componentSource);
const compoundComponentDef = xmlUiMarkupToComponent(componentSource).component as CompoundComponentDef;
if (!compoundComponentDef) {
  throw new Error(`Failed to parse ${COMP} component definition during build.`);
}

export const formSectionRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef,
  hints: FormSectionMd,
};
