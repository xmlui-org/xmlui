import type { CSSProperties, ForwardedRef, ReactElement, ReactNode } from "react";
import React, { cloneElement, forwardRef, useId, useState, useCallback } from "react";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";

import styles from "./FormItem.module.scss";

import type { LabelPosition, RequireLabelMode } from "../abstractions";
import { ThemedSpinner as Spinner } from "../Spinner/Spinner";
import { PART_LABELED_ITEM, PART_LABEL } from "../../components-core/parts";
import { Part } from "../Part/Part";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import { ThemedRadioGroup as RadioGroup } from "../RadioGroup/RadioGroup";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { useFormContextPart } from "../Form/FormContext";
import { defaultProps } from "./ItemWithLabel.defaults";

export { defaultProps } from "./ItemWithLabel.defaults";

// Component part names

type ItemWithLabelProps = {
  id?: string;
  formItemId?: string;
  labelPosition?: LabelPosition;
  style?: CSSProperties;
  className?: string;
  labelStyle?: CSSProperties;
  label?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  enabled?: boolean;
  required?: boolean;
  children: ReactNode;
  validationInProgress?: boolean;
  shrinkToLabel?: boolean;
  onFocus?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  isInputTemplateUsed?: boolean;
  onLabelClick?: () => void;
  validationResult?: ReactNode;
  layoutContext?: LayoutContext;
  testId?: string;
  componentName?: string;
  cloneStyle?: boolean;
  requireLabelMode?: RequireLabelMode;
  direction?: "rtl" | "ltr";
  compactInlineLabel?: boolean;
  activateOnRootClick?: boolean;
};

const numberRegex = /^[0-9]+$/;

export const ItemWithLabel = forwardRef(function ItemWithLabel(
  {
    id,
    formItemId,
    labelPosition,
    style = {},
    className,
    label,
    labelBreak,
    labelWidth,
    enabled = defaultProps.enabled,
    required = defaultProps.required,
    children,
    validationInProgress = defaultProps.validationInProgress,
    shrinkToLabel = defaultProps.shrinkToLabel,
    onFocus,
    onBlur,
    labelStyle,
    validationResult,
    isInputTemplateUsed = defaultProps.isInputTemplateUsed,
    onLabelClick,
    layoutContext, // Destructured to prevent passing to DOM
    testId,
    componentName,
    cloneStyle = defaultProps.cloneStyle,
    requireLabelMode = defaultProps.requireLabelMode,
    compactInlineLabel = defaultProps.compactInlineLabel,
    activateOnRootClick = false,
    ...rest
  }: ItemWithLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const labelTargetId = componentName === "Switch" ? `${inputId}__input` : inputId;

  const formItemLabelPosition = useFormContextPart<LabelPosition | undefined>(
    (value) => value?.itemLabelPosition as LabelPosition | undefined,
  );
  const resolvedLabelPosition = labelPosition ?? formItemLabelPosition ?? "top";

  // Toggle-style components (compactInlineLabel) treat "start"/"end" the same as
  // "before"/"after" so the small control and its label stay snug together
  // instead of the control being pushed to one edge by a flex:1 wrapper filling
  // the row (e.g. a Checkbox inside a VStack).
  const effectiveLabelPosition: LabelPosition = compactInlineLabel
    ? resolvedLabelPosition === "end"
      ? "after"
      : resolvedLabelPosition === "start"
        ? "before"
        : resolvedLabelPosition
    : resolvedLabelPosition;

  const formItemLabelWidth = useFormContextPart<string | undefined>(
    (value) => value?.itemLabelWidth,
  );
  const resolvedLabelWidthProp = labelWidth ?? formItemLabelWidth;

  const formItemLabelBreak = useFormContextPart<boolean | undefined>(
    (value) => value?.itemLabelBreak,
  );
  const resolvedLabelBreak = labelBreak ?? formItemLabelBreak ?? defaultProps.labelBreak!;

  // When rendered inside a horizontal Stack, validation messages must not push sibling
  // inputs out of alignment, and required markers should reserve consistent space so
  // all labels in the same row have the same height.
  const isInHorizontalStack = layoutContext?.orientation === "horizontal";

  const [inputElement, setInputElement] = useState<HTMLElement | null>(null);
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(null);
  const [labelWrapperElement, setLabelWrapperElement] = useState<HTMLDivElement | null>(null);
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);

  const refCallback = useCallback((node: unknown) => {
    setInputElement(node instanceof HTMLElement ? node : null);
  }, []);

  const wrapperRefCallback = useCallback((node: HTMLDivElement | null) => {
    setWrapperElement(node);
  }, []);

  const labelWrapperRefCallback = useCallback((node: HTMLDivElement | null) => {
    setLabelWrapperElement(node);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const hostElement = inputElement ?? wrapperElement;
    if (!hostElement) return;

    const measuredElement =
      componentName === "Select" && wrapperElement
        ? getLabelControlElement(wrapperElement) ?? hostElement
        : getLabelControlElement(hostElement) ?? hostElement;

    if (!isFocusableControl(hostElement)) {
      const nested = measuredElement;
      if (nested && nested.id !== inputId) {
        if (hostElement.id === inputId) {
          hostElement.removeAttribute("id");
        }
        nested.id = inputId;
      }
    }

    if (componentName === "Select") {
      measuredElement.setAttribute("data-part-id", PART_LABELED_ITEM);
    }

    // Measure immediately
    applyMeasuredSize(measuredElement);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        applyMeasuredSize(measuredElement);
      });
      observer.observe(measuredElement);
      return () => observer.disconnect();
    }
  }, [
    componentName,
    effectiveLabelPosition,
    inputElement,
    inputId,
    labelWrapperElement,
    resolvedLabelBreak,
    resolvedLabelWidthProp,
    wrapperElement,
  ]);

  const shouldSyncLabelWidthToInput =
    resolvedLabelWidthProp === undefined &&
    !resolvedLabelBreak &&
    (effectiveLabelPosition === "top" || effectiveLabelPosition === "bottom");

  function applyMeasuredSize(measuredElement: HTMLElement) {
    const measuredHeight = measuredElement.offsetHeight;
    const measuredWidth = measuredElement.offsetWidth;
    setInputHeight(measuredHeight);
    setInputWidth(measuredWidth);
    if (labelWrapperElement && shouldSyncLabelWidthToInput) {
      labelWrapperElement.style.width = `${measuredWidth}px`;
    }
  }

  const labelWrapperHeight =
    effectiveLabelPosition === "start" || effectiveLabelPosition === "end" ||
    effectiveLabelPosition === "before" || effectiveLabelPosition === "after"
      ? inputHeight
      : "auto";

  const resolvedLabelWidth =
    resolvedLabelWidthProp !== undefined
      ? (numberRegex.test(resolvedLabelWidthProp) ? `${resolvedLabelWidthProp}px` : resolvedLabelWidthProp)
      : !resolvedLabelBreak &&
          (effectiveLabelPosition === "top" || effectiveLabelPosition === "bottom") &&
          inputWidth !== undefined
        ? `${inputWidth}px`
      : (compactInlineLabel && (effectiveLabelPosition === "before" || effectiveLabelPosition === "after"))
        ? "fit-content"
        : undefined;

  // Check if the child is a RadioGroup component
  const isRadioGroup = React.isValidElement(children) && children.type === RadioGroup;
  const wrapperPartId = shouldExposeWrapperLabeledItemPart(componentName)
    ? PART_LABELED_ITEM
    : undefined;
  const activateFromWrapperClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!activateOnRootClick) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("label, button, input, textarea, select, [role='combobox'], [role='radio'], [role='switch']")) {
      return;
    }
    focusLabeledControl(inputId);
  }, [activateOnRootClick, inputId]);

  if (label === undefined && !validationResult) {
    return (
      <Part partId={PART_LABELED_ITEM}>
        <Slot
          {...rest}
          style={style}
          className={className}
          id={inputId}
          data-testid={testId}
          data-xmlui-component={componentName}
          data-xmlui-part={componentName ? "root" : undefined}
          data-xmlui-form-field={formItemId}
          ref={ref}
        >
          {children}
        </Slot>
      </Part>
    );
  }

  // For RadioGroup, use fieldset and legend instead of label
  if (isRadioGroup) {
    return (
      <fieldset
        {...rest}
        id={inputId}
        data-xmlui-form-field={formItemId}
        ref={ref as unknown as React.Ref<HTMLFieldSetElement>}
        style={style}
        className={classnames(className, styles.itemWithLabel)}
        data-testid={testId}
        data-xmlui-component={componentName}
        data-xmlui-part={componentName ? "root" : undefined}
        disabled={!enabled}
      >
        <div
          className={classnames(styles.container, {
            [styles.top]: effectiveLabelPosition === "top",
            [styles.bottom]: effectiveLabelPosition === "bottom",
            [styles.start]: effectiveLabelPosition === "start" || (!compactInlineLabel && effectiveLabelPosition === "before"),
            [styles.end]: effectiveLabelPosition === "end" || (!compactInlineLabel && effectiveLabelPosition === "after"),
            [styles.before]: compactInlineLabel && effectiveLabelPosition === "before",
            [styles.after]: compactInlineLabel && effectiveLabelPosition === "after",
            [styles.shrinkToLabel]: shrinkToLabel,
          })}
          dir={rest?.direction}
        >
          {label && (
            <div
              className={styles.labelWrapper}
              ref={labelWrapperRefCallback}
              style={{
                height: labelWrapperHeight,
                width: resolvedLabelWidth,
                flexShrink: resolvedLabelWidthProp !== undefined ? 0 : undefined,
                justifyContent: resolvedLabelWidthProp !== undefined ? "flex-start" : undefined,
              }}
            >
              <Part partId={PART_LABEL}>
                <legend
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={
                    onLabelClick ||
                    ((e) => {
                      // For radio groups, focus the first radio option
                      const fieldset = (e.currentTarget as HTMLElement).closest("fieldset");
                      if (fieldset) {
                        const firstRadio = fieldset.querySelector('[role="radio"]') as HTMLElement;
                        firstRadio?.focus();
                      }
                    })
                  }
                  style={{
                    ...labelStyle,
                    display:
                      resolvedLabelWidthProp !== undefined || shouldSyncLabelWidthToInput
                        ? "block"
                        : labelStyle?.display,
                    width:
                      resolvedLabelWidthProp !== undefined || shouldSyncLabelWidthToInput
                        ? "100%"
                        : undefined,
                    flexShrink: resolvedLabelWidthProp !== undefined ? 0 : undefined,
                  }}
                  className={classnames(styles.inputLabel, {
                    [styles.required]: required,
                    [styles.disabled]: !enabled,
                    [styles.labelBreak]: resolvedLabelBreak,
                  })}
                >
                  {label}
                  {(requireLabelMode === "markRequired" || requireLabelMode === "markBoth") && (
                    required
                      ? <span className={styles.requiredMark}>*</span>
                      : isInHorizontalStack
                        ? <span className={styles.requiredMark} style={{ visibility: "hidden" }}>*</span>
                        : null
                  )}
                  {(requireLabelMode === "markOptional" || requireLabelMode === "markBoth") &&
                    !required && <span className={styles.optionalTag}> (Optional)</span>}
                  {validationInProgress && (
                    <Spinner
                      style={{
                        height: "1em",
                        width: "1em",
                        marginLeft: "1em",
                        alignSelf: "center",
                      }}
                    />
                  )}
                </legend>
              </Part>
            </div>
          )}
          <div
            className={classnames(styles.wrapper, { [styles.validationAnchor]: isInHorizontalStack })}
            data-part-id={wrapperPartId}
            ref={wrapperRefCallback}
          >
            <Part partId={PART_LABELED_ITEM}>
              {cloneElement(children as ReactElement, {
                id: !isInputTemplateUsed ? inputId : undefined,
                ref: refCallback,
                ...(cloneStyle ? {} : { style: undefined, className: undefined }),
              })}
            </Part>
            {validationResult && (
              <div className={classnames(styles.validationResultWrapper, { [styles.validationMessageAbsolute]: isInHorizontalStack })}>{validationResult}</div>
            )}
          </div>
        </div>
      </fieldset>
    );
  }

  // For other components, use the existing label structure
  return (
    <div
      {...rest}
      ref={ref}
      data-xmlui-form-field={formItemId}
      data-testid={testId}
      data-xmlui-component={componentName}
      data-xmlui-part={componentName ? "root" : undefined}
      style={style}
      className={classnames(className, styles.itemWithLabel, {
        [styles.noLabel]: !label && compactInlineLabel,
        [styles.shrinkToLabel]: shrinkToLabel,
      })}
      onClick={activateFromWrapperClick}
    >
      <div
        className={classnames(styles.container, {
          [styles.noLabel]: !label && compactInlineLabel,
          [styles.top]: effectiveLabelPosition === "top",
          [styles.bottom]: effectiveLabelPosition === "bottom",
          [styles.start]: effectiveLabelPosition === "start" || (!compactInlineLabel && effectiveLabelPosition === "before"),
          [styles.end]: effectiveLabelPosition === "end" || (!compactInlineLabel && effectiveLabelPosition === "after"),
          [styles.before]: compactInlineLabel && effectiveLabelPosition === "before",
          [styles.after]: compactInlineLabel && effectiveLabelPosition === "after",
          [styles.shrinkToLabel]: shrinkToLabel,
        })}
        dir={rest?.direction}
      >
        {label && (
          <div
            className={styles.labelWrapper}
            ref={labelWrapperRefCallback}
            style={{
              height: labelWrapperHeight,
              width: resolvedLabelWidth,
              flexShrink: resolvedLabelWidthProp !== undefined ? 0 : undefined,
              justifyContent: resolvedLabelWidthProp !== undefined ? "flex-start" : undefined,
            }}
          >
            <Part partId={PART_LABEL}>
              <label
                htmlFor={labelTargetId}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onLabelClick || ((event) => {
                  event.preventDefault();
                  focusLabeledControl(labelTargetId);
                })}
                style={{
                  ...labelStyle,
                  display:
                    resolvedLabelWidthProp !== undefined || shouldSyncLabelWidthToInput
                      ? "block"
                      : labelStyle?.display,
                  width:
                    resolvedLabelWidthProp !== undefined || shouldSyncLabelWidthToInput
                      ? "100%"
                      : undefined,
                  flexShrink: resolvedLabelWidthProp !== undefined ? 0 : undefined,
                }}
                className={classnames(styles.inputLabel, {
                  [styles.required]: required,
                  [styles.disabled]: !enabled,
                  [styles.labelBreak]: resolvedLabelBreak,
                })}
              >
                {label}
                {(requireLabelMode === "markRequired" || requireLabelMode === "markBoth") && (
                  required
                    ? <span className={styles.requiredMark}>*</span>
                    : isInHorizontalStack
                      ? <span className={styles.requiredMark} style={{ visibility: "hidden" }}>*</span>
                      : null
                )}
                {(requireLabelMode === "markOptional" || requireLabelMode === "markBoth") &&
                  !required && <span className={styles.optionalTag}> (Optional)</span>}
                {validationInProgress && (
                  <Spinner
                    style={{ height: "1em", width: "1em", marginLeft: "1em", alignSelf: "center" }}
                  />
                )}
              </label>
            </Part>
          </div>
        )}
        <div
          className={classnames(styles.wrapper, { [styles.validationAnchor]: isInHorizontalStack })}
          data-part-id={wrapperPartId}
          ref={wrapperRefCallback}
        >
          <Part partId={PART_LABELED_ITEM}>
            {cloneElement(children as ReactElement, {
              id: !isInputTemplateUsed ? inputId : undefined,
              ref: refCallback,
              ...(cloneStyle ? {} : { style: undefined, className: undefined }),
            })}
          </Part>
          {validationResult && (
            <div className={classnames(styles.validationResultWrapper, { [styles.validationMessageAbsolute]: isInHorizontalStack })}>{validationResult}</div>
          )}
        </div>
      </div>
    </div>
  );
});

function focusLabeledControl(inputId: string) {
  const target = document.getElementById(inputId) ?? getNormalizedSwitchLabelTarget(inputId);
  if (!target) {
    return;
  }
  if (isFocusableControl(target)) {
    target.focus({ preventScroll: true });
    clickLabelActivatedControl(target);
    return;
  }
  const nested = getLabelControlElement(target);
  nested?.focus({ preventScroll: true });
  if (nested) {
    clickLabelActivatedControl(nested);
  }
}

function getNormalizedSwitchLabelTarget(inputId: string) {
  return inputId.endsWith("__input")
    ? document.getElementById(inputId.slice(0, -"__input".length))
    : null;
}

function isFocusableControl(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement {
  return element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLButtonElement ||
    element.tabIndex >= 0;
}

function clickLabelActivatedControl(element: HTMLElement) {
  const tagName = element.tagName;
  const role = element.getAttribute("role");
  if (
    tagName === "BUTTON" ||
    role === "button" ||
    role === "combobox" ||
    role === "switch" ||
    (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio"))
  ) {
    element.click();
  }
}

function getLabelControlElement(element: HTMLElement) {
  if (isFocusableControl(element)) {
    return element;
  }
  return element.querySelector<HTMLElement>(
    "input, textarea, select, button, [role='combobox'], [role='switch'], [tabindex]:not([tabindex='-1'])",
  );
}

function shouldExposeWrapperLabeledItemPart(componentName: string | undefined) {
  return componentName !== "Select";
}
