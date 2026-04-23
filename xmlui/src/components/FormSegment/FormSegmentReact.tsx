import { forwardRef, memo, useCallback, useEffect, useId, useMemo } from "react";
import type { ForwardedRef, ReactNode } from "react";
import classnames from "classnames";

import stepperStyles from "../Stepper/Stepper.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, ValueExtractor } from "../../abstractions/RendererDefs";
import type { SingleValidationResult } from "../Form/FormContext";
import { useFormContextPart } from "../Form/FormContext";
import { useStepperContext } from "../Stepper/StepperContext";

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

export const FormSegmentNative = memo(
  forwardRef(function FormSegmentNative(
    { node, renderChild, extractValue, registerComponentApi }: FormSegmentNativeProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    // Determine the stack orientation (vertical or horizontal).
    const stackType = useMemo(() => {
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
        return fieldsProp
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
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

    // --- Stepper integration ------------------------------------------------
    // When placed inside a Stepper (or a stepper-enabled Form), the segment
    // acts as a step: it registers itself so the Stepper can render the header
    // strip, and it renders its body only when active (horizontal) or alongside
    // its own per-step header (vertical).
    const stepperCtx = useStepperContext();
    const innerId = useId();
    const label = extractValue.asOptionalString(node.props?.label);
    const description = extractValue.asOptionalString(node.props?.description);
    const icon = extractValue.asOptionalString(node.props?.icon);

    useEffect(() => {
      if (!stepperCtx.inStepper) return;
      stepperCtx.register({ innerId, label, description, icon });
      return () => stepperCtx.unRegister(innerId);
    }, [
      stepperCtx.inStepper,
      stepperCtx.register,
      stepperCtx.unRegister,
      innerId,
      label,
      description,
      icon,
    ]);

    const isActive = stepperCtx.activeStepId === innerId;

    // Build the Fragment node that injects the segment-scoped vars into the children subtree.
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
        type: stackType,
        props: stackProps,
        children: [nodeWithVars],
      }),
      [stackType, stackProps, nodeWithVars],
    );

    // Not in a stepper — render the normal segment layout.
    if (!stepperCtx.inStepper) {
      return <>{renderChild(stackNode)}</>;
    }

    // --- Horizontal stepper mode: only the active segment renders its body. The
    // step header itself is drawn by the Stepper based on the registered item.
    if (stepperCtx.orientation === "horizontal") {
      if (!isActive) return null;
      return <>{renderChild(stackNode)}</>;
    }

    // --- Vertical stepper mode: the segment renders its own header (icon +
    // label block) plus a collapsible body area that shows the stack when
    // active. The left-border connector is provided by the Stepper styles.
    return (
      <VerticalSegmentFrame
        innerId={innerId}
        label={label}
        description={description}
        icon={icon}
        isActive={isActive}
        stepperCtx={stepperCtx}
      >
        {renderChild(stackNode)}
      </VerticalSegmentFrame>
    );
  }),
);

// Internal per-step vertical frame — mirrors the Step component's vertical layout
// so FormSegment looks identical to Step when used as a step.
function VerticalSegmentFrame({
  innerId,
  label,
  description,
  icon,
  isActive,
  stepperCtx,
  children,
}: {
  innerId: string;
  label?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  stepperCtx: ReturnType<typeof useStepperContext>;
  children: ReactNode;
}) {
  const items = stepperCtx.getStepItems();
  const index = items.findIndex((s) => s.innerId === innerId);
  const isLast = index === items.length - 1;

  const iconEl = (
    <span
      className={classnames(stepperStyles.iconCircle, {
        [stepperStyles.active]: isActive,
      })}
      aria-hidden="true"
    >
      {icon ? icon : index >= 0 ? index + 1 : ""}
    </span>
  );

  const labelEl =
    label || description ? (
      <span className={stepperStyles.labelBlock}>
        {label && (
          <span
            className={classnames(stepperStyles.label, {
              [stepperStyles.active]: isActive,
            })}
          >
            {label}
          </span>
        )}
        {description && <span className={stepperStyles.description}>{description}</span>}
      </span>
    ) : null;

  const headerContent = (
    <>
      {iconEl}
      {labelEl}
    </>
  );

  return (
    <div className={stepperStyles.verticalItem}>
      {stepperCtx.nonLinear ? (
        <button
          type="button"
          className={classnames(stepperStyles.verticalHeader, stepperStyles.clickable)}
          aria-current={isActive ? "step" : undefined}
          onClick={() => stepperCtx.onStepClick(innerId)}
        >
          {headerContent}
        </button>
      ) : (
        <div
          className={stepperStyles.verticalHeader}
          aria-current={isActive ? "step" : undefined}
        >
          {headerContent}
        </div>
      )}
      <div
        className={classnames(stepperStyles.verticalBody, {
          [stepperStyles.last]: isLast,
        })}
      >
        {isActive && <div className={stepperStyles.verticalContent}>{children}</div>}
      </div>
    </div>
  );
}
