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

// Component part names

type ItemWithLabelProps = {
  id?: string;
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
  cloneStyle?: boolean;
  requireLabelMode?: RequireLabelMode;
  direction?: "rtl" | "ltr";
  compactInlineLabel?: boolean;
};
export const defaultProps: Pick<
  ItemWithLabelProps,
  | "labelBreak"
  | "enabled"
  | "labelPosition"
  | "required"
  | "validationInProgress"
  | "shrinkToLabel"
  | "cloneStyle"
  | "requireLabelMode"
  | "isInputTemplateUsed"
  | "direction"
  | "compactInlineLabel"
> = {
  labelBreak: true,
  enabled: true,
  labelPosition: "top",
  required: false,
  validationInProgress: false,
  shrinkToLabel: false,
  cloneStyle: false,
  requireLabelMode: "markRequired",
  isInputTemplateUsed: false,
  direction: "ltr",
  compactInlineLabel: false,
};

const numberRegex = /^[0-9]+$/;

export const ItemWithLabel = forwardRef(function ItemWithLabel(
  {
    id,
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
    cloneStyle = defaultProps.cloneStyle,
    requireLabelMode = defaultProps.requireLabelMode,
    compactInlineLabel = defaultProps.compactInlineLabel,
    ...rest
  }: ItemWithLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const formItemLabelPosition = useFormContextPart<LabelPosition | undefined>(
    (value) => value?.itemLabelPosition as LabelPosition | undefined,
  );
  const resolvedLabelPosition = labelPosition ?? formItemLabelPosition ?? "top";

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
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const refCallback = useCallback((node: any) => {
    setInputElement(node);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!inputElement) return;

    // Measure immediately
    setInputHeight(inputElement.offsetHeight);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        setInputHeight(inputElement.offsetHeight);
      });
      observer.observe(inputElement);
      return () => observer.disconnect();
    }
  }, [inputElement]);

  const labelWrapperHeight =
    resolvedLabelPosition === "start" || resolvedLabelPosition === "end" ||
    resolvedLabelPosition === "before" || resolvedLabelPosition === "after"
      ? inputHeight
      : "auto";

  const resolvedLabelWidth =
    resolvedLabelWidthProp !== undefined
      ? (numberRegex.test(resolvedLabelWidthProp) ? `${resolvedLabelWidthProp}px` : resolvedLabelWidthProp)
      : (compactInlineLabel && (resolvedLabelPosition === "before" || resolvedLabelPosition === "after"))
        ? "fit-content"
        : undefined;

  // Check if the child is a RadioGroup component
  const isRadioGroup = React.isValidElement(children) && children.type === RadioGroup;

  if (label === undefined && !validationResult) {
    return (
      <Part partId={PART_LABELED_ITEM}>
        <Slot {...rest} style={style} className={className} id={inputId} ref={ref}>
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
        ref={ref as unknown as React.Ref<HTMLFieldSetElement>}
        style={style}
        className={classnames(className, styles.itemWithLabel)}
        disabled={!enabled}
      >
        <div
          className={classnames(styles.container, {
            [styles.top]: resolvedLabelPosition === "top",
            [styles.bottom]: resolvedLabelPosition === "bottom",
            [styles.start]: resolvedLabelPosition === "start" || (!compactInlineLabel && resolvedLabelPosition === "before"),
            [styles.end]: resolvedLabelPosition === "end" || (!compactInlineLabel && resolvedLabelPosition === "after"),
            [styles.before]: compactInlineLabel && resolvedLabelPosition === "before",
            [styles.after]: compactInlineLabel && resolvedLabelPosition === "after",
            [styles.shrinkToLabel]: shrinkToLabel,
          })}
          dir={rest?.direction}
        >
          {label && (
            <div
              className={styles.labelWrapper}
              style={{
                height: labelWrapperHeight,
              }}
            >
              <Part partId={PART_LABEL}>
                <legend
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
                    width: resolvedLabelWidth,
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
          <div className={classnames(styles.wrapper, { [styles.validationAnchor]: isInHorizontalStack })}>
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
    <div {...rest} ref={ref} style={style} className={classnames(className, styles.itemWithLabel)}>
      <div
        className={classnames(styles.container, {
          [styles.top]: resolvedLabelPosition === "top",
          [styles.bottom]: resolvedLabelPosition === "bottom",
          [styles.start]: resolvedLabelPosition === "start" || (!compactInlineLabel && resolvedLabelPosition === "before"),
          [styles.end]: resolvedLabelPosition === "end" || (!compactInlineLabel && resolvedLabelPosition === "after"),
          [styles.before]: compactInlineLabel && resolvedLabelPosition === "before",
          [styles.after]: compactInlineLabel && resolvedLabelPosition === "after",
          [styles.shrinkToLabel]: shrinkToLabel,
        })}
        dir={rest?.direction}
      >
        {label && (
          <div
            className={styles.labelWrapper}
            style={{
              height: labelWrapperHeight,
            }}
          >
            <Part partId={PART_LABEL}>
              <label
                htmlFor={inputId}
                onClick={onLabelClick || (() => document.getElementById(inputId)?.focus())}
                style={{
                  ...labelStyle,
                  width: resolvedLabelWidth,
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
        <div className={classnames(styles.wrapper, { [styles.validationAnchor]: isInHorizontalStack })}>
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
