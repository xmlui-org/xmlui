import { useMemo } from "react";

import type { XmluiNode } from "../../compiler/ir";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { useFormContext } from "../Form/FormContext";
import { FormSegmentMd } from "./FormSegment";
import { FormSegment } from "./FormSegmentReact";

export const formSegmentRenderer = wrapComponent({
  name: "FormSegment",
  metadata: FormSegmentMd,
  renderer({ adapter }) {
    const form = useFormContext();
    const fields = useMemo(
      () => fieldsForSegment(adapter.stringProp("fields"), adapter.node.children),
      [adapter],
    );
    const segmentData = useMemo(() => {
      const result: Record<string, unknown> = {};
      for (const field of fields) {
        if (form?.values && Object.prototype.hasOwnProperty.call(form.values, field)) {
          result[field] = form.values[field];
        }
      }
      return result;
    }, [fields, form?.values]);
    const validationIssues = useMemo(() => {
      const result: Record<string, Array<{ isValid: false; message: string }>> = {};
      for (const field of fields) {
        const message = form?.errors[field];
        if (message) {
          result[field] = [{ isValid: false, message }];
        }
      }
      return result;
    }, [fields, form?.errors]);
    const hasSegmentValidationIssue = (fieldName?: string) => {
      if (fieldName !== undefined) {
        return (validationIssues[fieldName]?.length ?? 0) > 0;
      }
      return Object.keys(validationIssues).length > 0;
    };
    const hasIssues = hasSegmentValidationIssue();
    const isDirty = fields.some((field) => form?.dirtyFields.has(field));

    adapter.registerApi({
      isValid: !hasIssues,
      hasIssues,
      isDirty,
    });

    const segmentScope = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues: {
        $segmentData: segmentData,
        $segmentValidationIssues: validationIssues,
        $hasSegmentValidationIssue: hasSegmentValidationIssue,
      },
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      emitEvent: adapter.scope.emitEvent,
    });

    return (
      <FormSegment
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        orientation={adapter.stringProp("orientation", "vertical")}
        className={adapter.className}
        style={adapter.style}
      >
        {adapter.context.renderChildren(adapter.node.children, segmentScope)}
      </FormSegment>
    );
  },
});

function fieldsForSegment(fieldsProp: string | undefined, children: XmluiNode[]): string[] {
  if (fieldsProp) {
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
    if (bindTo && !bindTo.trim().startsWith("{")) {
      fields.push(bindTo);
    }
    fields.push(...collectBindTo(child.children));
  }
  return fields;
}

