import { useCallback, useMemo } from "react";

import type { XmluiElement, XmluiNode, XmluiParsedBindings } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { useFormContextPart } from "../Form/FormContext";
import { FormSegmentMd } from "./FormSegment";

const LAYOUT_PROPERTIES = [
  "width",
  "height",
  "minHeight",
  "maxHeight",
  "minWidth",
  "maxWidth",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "gap",
  "rowGap",
  "columnGap",
  "backgroundColor",
  "background",
  "border",
  "borderColor",
  "borderWidth",
  "borderRadius",
  "borderStyle",
  "borderTop",
  "borderBottom",
  "borderLeft",
  "borderRight",
  "borderTopColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRightColor",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "boxShadow",
  "opacity",
  "cursor",
  "overflow",
  "overflowX",
  "overflowY",
  "zIndex",
  "transform",
] as const;

export const formSegmentRenderer = wrapComponent({
  name: "FormSegment",
  metadata: FormSegmentMd,
  renderer({ adapter }) {
    const fields = useMemo(
      () => fieldsForSegment(adapter.stringProp("fields"), adapter.node.children),
      [adapter],
    );
    const subject = useFormContextPart((value) => value?.subject);
    const validationResults = useFormContextPart((value) => value?.validationResults);
    const interactionFlags = useFormContextPart((value) => value?.interactionFlags);
    const segmentData = useMemo(() => {
      const result: Record<string, unknown> = {};
      for (const field of fields) {
        if (subject && Object.prototype.hasOwnProperty.call(subject, field)) {
          result[field] = subject[field];
        }
      }
      return result;
    }, [fields, subject]);
    const segmentValidationIssues = useMemo(() => {
      const result: Record<string, unknown[]> = {};
      for (const field of fields) {
        const invalid = validationResults?.[field]?.validations.filter((validation) => !validation.isValid);
        if (invalid && invalid.length > 0) {
          result[field] = invalid;
        }
      }
      return result;
    }, [fields, validationResults]);
    const hasSegmentValidationIssue = useCallback((fieldName?: string) => {
      if (fieldName !== undefined) {
        return (segmentValidationIssues[fieldName]?.length ?? 0) > 0;
      }
      return Object.keys(segmentValidationIssues).length > 0;
    }, [segmentValidationIssues]);
    const hasIssues = hasSegmentValidationIssue();
    const isDirty = fields.some((field) => interactionFlags?.[field]?.isDirty);

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
        $segmentValidationIssues: segmentValidationIssues,
        $hasSegmentValidationIssue: hasSegmentValidationIssue,
      },
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      toast: adapter.scope.toast,
      emitEvent: adapter.scope.emitEvent,
      extensionFunctions: adapter.scope.extensionFunctions,
    });

    return adapter.context.renderChildren(
      [createImplicitStackNode(adapter.node, adapter.stringProp("orientation", "vertical"))],
      segmentScope,
      adapter.node.range.end,
    );
  },
});

function createImplicitStackNode(node: XmluiElement, orientation: string | undefined): XmluiElement {
  const layoutProps: Record<string, string> = {};
  const parsedProps: XmluiParsedBindings["props"] = {};
  for (const key of LAYOUT_PROPERTIES) {
    if (Object.prototype.hasOwnProperty.call(node.props, key)) {
      layoutProps[key] = node.props[key];
    }
    if (node.parsed?.props?.[key]) {
      parsedProps[key] = node.parsed.props[key];
    }
  }

  return {
    kind: "element",
    type: orientation === "horizontal" ? "HStack" : "VStack",
    props: layoutProps,
    vars: {},
    globals: {},
    events: {},
    methods: {},
    children: nonPropertyChildren(node.children),
    range: node.range,
    parsed: Object.keys(parsedProps).length > 0 ? { props: parsedProps } : undefined,
  };
}

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
