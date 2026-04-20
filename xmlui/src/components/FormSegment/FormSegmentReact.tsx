import { forwardRef, memo, useCallback, useMemo } from "react";
import type { ForwardedRef } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, ValueExtractor } from "../../abstractions/RendererDefs";
import type { SingleValidationResult } from "../Form/FormContext";
import { useFormContextPart } from "../Form/FormContext";

// Properties that should be transposed from FormSegment to its internal stack container.
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
];

// Recursively walk a ComponentDef tree and collect all raw `bindTo` prop values.
// Expression values (e.g. `bindTo="{someVar}"`) cannot be resolved statically and
// are skipped — use the explicit `fields` prop on FormSegment in that case.
function collectBindToFromTree(children: ComponentDef | ComponentDef[] | undefined): string[] {
  if (!children) return [];
  const arr = Array.isArray(children) ? children : [children];
  const result: string[] = [];
  for (const child of arr) {
    if (!child || typeof child !== "object") continue;
    const bindTo = (child.props as any)?.bindTo;
    if (bindTo && typeof bindTo === "string" && !bindTo.startsWith("{")) {
      result.push(bindTo);
    }
    if ((child as any).children) {
      result.push(...collectBindToFromTree((child as any).children));
    }
  }
  return result;
}

type FormSegmentNativeProps = {
  node: any;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  registerComponentApi?: (api: any) => void;
};

export const FormSegmentNative = memo(forwardRef(function FormSegmentNative(
  { node, renderChild, extractValue, registerComponentApi }: FormSegmentNativeProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  // Determine the stack orientation (vertical or horizontal).
  const orientation = useMemo(() => {
    const orientationProp = extractValue.asOptionalString(node.props?.orientation);
    return orientationProp === "horizontal" ? "HStack" : "VStack";
  }, [node.props?.orientation, extractValue]);

  // Extract layout properties from FormSegment props to transpose to the stack.
  const stackProps = useMemo(() => {
    const props: Record<string, any> = {};
    const nodeProps = node.props || {};
    for (const key of LAYOUT_PROPERTIES) {
      if (key in nodeProps) {
        props[key] = nodeProps[key];
      }
    }
    return props;
  }, [node.props]);

  // Determine which fields belong to this segment.
  const fields = useMemo(() => {
    const fieldsProp = extractValue.asOptionalString(node.props?.fields);
    if (fieldsProp) {
      return fieldsProp.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return collectBindToFromTree(node.children);
  }, [node.children, node.props?.fields, extractValue]);

  // Subscribe to the enclosing form's subject (current field values).
  const subject = useFormContextPart((v) => v?.subject);

  // Subscribe to the enclosing form's validation results.
  const validationResults = useFormContextPart((v) => v?.validationResults);

  // $segmentData: current values for this segment's fields only.
  const $segmentData = useMemo(() => {
    const result: Record<string, any> = {};
    if (subject) {
      for (const field of fields) {
        if (field in subject) {
          result[field] = subject[field];
        }
      }
    }
    return result;
  }, [fields, subject]);

  // $segmentValidationIssues: failed validation results for this segment's fields only.
  const $segmentValidationIssues = useMemo(() => {
    const result: Record<string, Array<SingleValidationResult>> = {};
    if (validationResults) {
      for (const field of fields) {
        if (field in validationResults) {
          const invalid = validationResults[field].validations.filter((v) => !v.isValid);
          if (invalid.length > 0) {
            result[field] = invalid;
          }
        }
      }
    }
    return result;
  }, [fields, validationResults]);

  // $hasSegmentValidationIssue: without argument returns true when any segment field has an
  // issue; with a field name checks that specific field only.
  const $hasSegmentValidationIssue = useCallback(
    (fieldName?: string) => {
      if (fieldName === undefined) {
        return Object.keys($segmentValidationIssues).length > 0;
      }
      return ($segmentValidationIssues[fieldName]?.length ?? 0) > 0;
    },
    [$segmentValidationIssues],
  );

  // APIs: isValid and hasIssues
  const isValid = useMemo(() => {
    return Object.keys($segmentValidationIssues).length === 0;
  }, [$segmentValidationIssues]);

  const hasIssues = useMemo(() => {
    return Object.keys($segmentValidationIssues).length > 0;
  }, [$segmentValidationIssues]);

  // Register APIs if the callback is provided
  useMemo(() => {
    if (registerComponentApi) {
      registerComponentApi({
        isValid,
        hasIssues,
      });
    }
  }, [isValid, hasIssues, registerComponentApi]);

  // Build a Fragment node that injects the segment-scoped vars into the children subtree.
  const nodeWithVars = useMemo(
    () => ({
      type: "Fragment" as const,
      vars: {
        $segmentData,
        $segmentValidationIssues,
        $hasSegmentValidationIssue,
      },
      children: node.children,
    }),
    [$segmentData, $segmentValidationIssues, $hasSegmentValidationIssue, node.children],
  );

  // Wrap the Fragment in a Stack (VStack or HStack) with transposed layout properties.
  const stackNode = useMemo(
    () => ({
      type: orientation,
      props: stackProps,
      children: [nodeWithVars],
    }),
    [orientation, stackProps, nodeWithVars],
  );

  return <>{renderChild(stackNode)}</>;
}));
