import type { XmluiElement } from "../../compiler/ir";
import type { XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { StepperFormMd } from "./StepperForm";
import { StepperForm } from "./StepperFormReact";

export const stepperFormRenderer = wrapComponent({
  name: "StepperForm",
  metadata: StepperFormMd,
  renderer({ adapter }) {
    const segments = nonPropertyChildren(adapter.node.children)
      .filter((child): child is XmluiElement => child.kind === "element" && child.type === "FormSegment")
      .map((segment, index) => ({
        key: `${segment.range.start}-${index}`,
        label: segment.props.label == null ? `Step ${index + 1}` : String(segment.props.label),
        fields: fieldsForSegment(segment.props.fields, segment.children),
        content: adapter.context.renderChildren(nonPropertyChildren(segment.children), adapter.scope),
      }));

    return (
      <StepperForm
        {...adapter.rootAttrs()}
        data={adapter.prop("data")}
        enabled={adapter.booleanProp("enabled", true)}
        backLabel={adapter.stringProp("backLabel", "Back")}
        nextLabel={adapter.stringProp("nextLabel", "Next")}
        submitLabel={adapter.stringProp("submitLabel", "Submit")}
        stepperOrientation={adapter.stringProp("stepperOrientation", "horizontal") as "horizontal" | "vertical"}
        stepperNonLinear={adapter.booleanProp("stepperNonLinear", false)}
        stepperStackedLabel={adapter.booleanProp("stepperStackedLabel", false)}
        segments={segments}
        onSubmit={(values) => adapter.event("submit")(values)}
        onSubmitFailed={(errors) => adapter.event("submitFailed")(errors)}
        onCancel={() => adapter.event("cancel")()}
        registerComponentApi={adapter.registerApi}
      />
    );
  },
});

function fieldsForSegment(fieldsProp: unknown, children: XmluiNode[]): string[] {
  if (typeof fieldsProp === "string" && fieldsProp.trim()) {
    return fieldsProp.split(",").map((field) => field.trim()).filter(Boolean);
  }
  return collectBindTo(children);
}

function collectBindTo(children: XmluiNode[]): string[] {
  const fields: string[] = [];
  for (const child of children) {
    if (child.kind !== "element") {
      continue;
    }
    const bindTo = child.props.bindTo;
    if (typeof bindTo === "string" && bindTo && !bindTo.trim().startsWith("{")) {
      fields.push(bindTo);
    }
    fields.push(...collectBindTo(child.children));
  }
  return fields;
}
